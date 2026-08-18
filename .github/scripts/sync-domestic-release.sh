#!/usr/bin/env bash
# NOVAI Electron 更新产物国内镜像同步（tag 构建时由 build-electron.yml 调用）
#
# 两个目标：
#   1) ModelScope 模型仓库 bllack/NOVAI-releases —— 客户端自动更新的国内源
#      （Electron 端 GitHub 检查失败时自动切换到该 generic 更新地址：
#        https://modelscope.cn/models/bllack/NOVAI-releases/resolve/master/electron-release）
#   2) Gitee invaders/novai Release 附件 —— 人工下载镜像
#      （Gitee 网页下载有验证码，不适合做自动更新源，仅兜底手动安装）
#
# 所需环境变量：
#   MODELSCOPE_TOKEN  ModelScope 访问令牌（缺失则跳过 ModelScope 同步）
#   GITEE_TOKEN       Gitee 私人令牌（缺失则跳过 Gitee 同步）
#   RELEASE_TAG       当前构建的 tag（如 v1.0.112-beta.1）
#
# 注意：三个平台矩阵任务都会执行本脚本，各自只上传本平台产物；
#       ModelScope git push 带 rebase 重试以容忍并发。

set -u
cd "${GITHUB_WORKSPACE:-$(pwd)}"

RELEASE_DIR="desktop/release"
MS_REPO="models/bllack/NOVAI-releases"
MS_BRANCH="master"
GITEE_OWNER="invaders"
GITEE_REPO="novai"

shopt -s nullglob
ARTIFACTS=("$RELEASE_DIR"/*.dmg "$RELEASE_DIR"/*.zip "$RELEASE_DIR"/*.exe \
           "$RELEASE_DIR"/*.AppImage "$RELEASE_DIR"/*.deb "$RELEASE_DIR"/*.blockmap)
YML_FILES=("$RELEASE_DIR"/latest*.yml)

if [ ${#ARTIFACTS[@]} -eq 0 ] && [ ${#YML_FILES[@]} -eq 0 ]; then
  echo "::warning::desktop/release 下没有找到任何产物，跳过国内镜像同步"
  exit 0
fi

# ---------------------------------------------------------------- ModelScope
sync_modelscope() {
  if [ -z "${MODELSCOPE_TOKEN:-}" ]; then
    echo "::warning::未配置 MODELSCOPE_TOKEN，跳过 ModelScope 同步（国内自动更新镜像将不可用）"
    return 0
  fi

  local work=/tmp/novai-ms-releases
  rm -rf "$work"

  echo "== ModelScope: 克隆 $MS_REPO =="
  if ! git clone --depth 1 "https://oauth2:${MODELSCOPE_TOKEN}@modelscope.cn/${MS_REPO}.git" "$work" 2>/dev/null; then
    echo "== ModelScope: 仓库不存在，尝试通过 API 创建 =="
    curl -sS -X PUT "https://modelscope.cn/api/v1/models/bllack/NOVAI-releases" \
      -H "Authorization: Bearer ${MODELSCOPE_TOKEN}" \
      -H "Content-Type: application/json" \
      -d '{"Namespace":"bllack","Name":"NOVAI-releases","License":"MIT","Private":false,"ChineseName":"NOVAI 桌面端安装包镜像"}' || true
    sleep 3
    if ! git clone --depth 1 "https://oauth2:${MODELSCOPE_TOKEN}@modelscope.cn/${MS_REPO}.git" "$work" 2>/dev/null; then
      echo "::warning::ModelScope 仓库克隆失败。请手动到 https://modelscope.cn 创建模型仓库 bllack/NOVAI-releases 后重跑。"
      return 0
    fi
  fi

  cd "$work"
  git lfs install
  git checkout "$MS_BRANCH" 2>/dev/null || git checkout -B "$MS_BRANCH"

  # 安装包走 LFS（>5MB 建议、>100MB 必须）；latest*.yml 必须保持明文（更新器要读内容）
  git lfs track "electron-release/*.dmg" "electron-release/*.zip" "electron-release/*.exe" \
                "electron-release/*.AppImage" "electron-release/*.deb" "electron-release/*.blockmap"

  mkdir -p electron-release
  local f
  for f in "${ARTIFACTS[@]}" "${YML_FILES[@]}"; do
    [ -n "$f" ] && cp -f "$GITHUB_WORKSPACE/$f" electron-release/
  done

  git add .gitattributes electron-release/
  if git diff --cached --quiet; then
    echo "== ModelScope: 无变更 =="
    return 0
  fi
  git -c user.email=ci@novai.local -c user.name=novai-ci \
      commit -m "electron-release ${RELEASE_TAG} ($(uname -s))"

  # 三个矩阵任务并发推送同一仓库：rebase 重试最多 5 次
  local i
  for i in 1 2 3 4 5; do
    if git push origin "HEAD:${MS_BRANCH}"; then
      echo "== ModelScope: 推送成功 =="
      return 0
    fi
    echo "== ModelScope: 推送冲突，rebase 后重试 ($i/5) =="
    git fetch origin "$MS_BRANCH" && git rebase "origin/${MS_BRANCH}" || true
    sleep $((i * 10))
  done
  echo "::warning::ModelScope 推送多次冲突未成功，可在 release 后手动同步"
  return 0
}

# ------------------------------------------------------------------- Gitee
sync_gitee() {
  if [ -z "${GITEE_TOKEN:-}" ]; then
    echo "::warning::未配置 GITEE_TOKEN，跳过 Gitee Release 附件同步"
    return 0
  fi

  local api="https://gitee.com/api/v5/repos/${GITEE_OWNER}/${GITEE_REPO}"
  local release_id

  echo "== Gitee: 创建/获取 Release ${RELEASE_TAG} =="
  release_id=$(curl -sS -X POST "${api}/releases" \
    -H "Content-Type: application/json" \
    -d "{\"access_token\":\"${GITEE_TOKEN}\",\"tag_name\":\"${RELEASE_TAG}\",\"name\":\"NOVAI ${RELEASE_TAG}\",\"body\":\"国内下载镜像（与 GitHub Release 相同内容）。\",\"target_commitish\":\"main\",\"prerelease\":true}" \
    | sed -n 's/.*"id":\([0-9]*\).*/\1/p' | head -1)

  if [ -z "$release_id" ]; then
    # 可能已存在（矩阵任务并发创建），按 tag 查询
    release_id=$(curl -sS "${api}/releases/tags/${RELEASE_TAG}?access_token=${GITEE_TOKEN}" \
      | sed -n 's/.*"id":\([0-9]*\).*/\1/p' | head -1)
  fi
  if [ -z "$release_id" ]; then
    echo "::warning::Gitee Release 创建/查询失败（tag 是否已推送到 gitee？），跳过附件上传"
    return 0
  fi

  local f name
  for f in "${ARTIFACTS[@]}" "${YML_FILES[@]}"; do
    [ -n "$f" ] || continue
    name=$(basename "$f")
    echo "== Gitee: 上传附件 $name =="
    curl -sS -X POST "${api}/releases/${release_id}/attach_files" \
      -F "access_token=${GITEE_TOKEN}" \
      -F "file=@${GITHUB_WORKSPACE}/${f}" > /dev/null || \
      echo "::warning::附件 $name 上传失败（可能超过 Gitee 单附件 100MB 限制）"
  done
  echo "== Gitee: 附件同步完成 =="
  return 0
}

sync_modelscope
sync_gitee
echo "== 国内镜像同步步骤结束 =="
exit 0
