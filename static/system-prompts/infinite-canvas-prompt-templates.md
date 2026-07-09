# 无限画布预设提示词 · 完整版 v2.0

> **备份日期**：2026-05-28
> **版本**：v2.1（新增视角类360全景图预设）
> **用途**：直接复制粘贴到无限画布AI工具的预设提示词框中
> **格式**：每个预设包含「预设名称」「适用场景」「正向提示词」「负向提示词」「平台参数建议」
> **原则**：画面绝对无数字/文字/角标，一致性通过多重锚定锁定，边缘柔和过渡无硬边无发光晕

---

## 预设1：多机位九宫格

### 适用场景
同一主体/场景，9个不同机位/角度同时呈现，用于角色多角度参考、产品展示、空间勘测

### 正向提示词
```
A multi-camera angle reference sheet in 3x3 grid layout, showing [主体] from 9 different perspectives simultaneously: top-left front view, top-center 3/4 front view, top-right side profile, middle-left low angle, middle-center eye-level straight-on, middle-right high angle, bottom-left back view, bottom-center 3/4 back view, bottom-right top-down overhead view. [主体详细描述]. Consistent lighting across all 9 frames, uniform light warm gray background color F0EDE8, subjects softly blending with background with natural edge transition, no hard edges no white halo no light bleed, professional studio photography, clean grid layout with thin white dividers between frames, character consistency maintained across all angles, absolutely no visible numbers text labels frame counters corner marks or annotations anywhere on the image
```

### 负向提示词
```
numbers, text, letters, labels, frame numbers, corner marks, annotations, captions, watermarks, signatures, logos, readable text, font, typography, grid numbers, sequence markers, page numbers, index, hard edge, glowing edge, white halo, light bleed, overexposed edge, cutout look, pasted on background, floating subject, disconnected shadow, pure white background, stark white, cold gray, bad anatomy, distorted face, extra fingers, deformed hands, inconsistent character design, lighting mismatch between frames, blurry, low quality, cropped, out of frame
```

### 平台参数建议
- **Midjourney**: `--ar 1:1 --style raw --s 50`
- **即梦/可灵**: 直接粘贴，开启「参考图」锁一致性
- **Flux**: 配合 `add_detail` LoRA，CFG 3.5-5.0

---

## 预设2：多机位九宫格4K

### 适用场景
高分辨率版本的多机位九宫格，用于印刷级输出、大屏展示、精细材质参考

### 正向提示词
```
Ultra high resolution multi-camera angle reference sheet in 3x3 grid layout, 4K quality, showing [主体] from 9 different perspectives simultaneously: top-left front view, top-center 3/4 front view, top-right side profile, middle-left low angle, middle-center eye-level straight-on, middle-right high angle, bottom-left back view, bottom-center 3/4 back view, bottom-right top-down overhead view. [主体详细描述]. Consistent cinematic lighting across all 9 frames, uniform light warm gray background color F0EDE8, subjects softly blending with background with natural edge transition, no hard edges no white halo no light bleed, professional studio photography with medium format film aesthetic, clean grid layout with thin white dividers between frames, character consistency maintained across all angles, fine organic film grain, zero digital sharpening, absolutely no visible numbers text labels frame counters corner marks or annotations anywhere on the image
```

### 负向提示词
```
numbers, text, letters, labels, frame numbers, corner marks, annotations, captions, watermarks, signatures, logos, readable text, font, typography, grid numbers, sequence markers, page numbers, index, hard edge, glowing edge, white halo, light bleed, overexposed edge, cutout look, pasted on background, floating subject, disconnected shadow, pure white background, stark white, cold gray, bad anatomy, distorted face, extra fingers, deformed hands, inconsistent character design, lighting mismatch between frames, blurry, low quality, cropped, out of frame, digital sharpening, oversharpened, plastic skin, over-smoothing
```

### 平台参数建议
- **Midjourney**: `--ar 1:1 --style raw --s 50 --q 2`
- **即梦/可灵**: 选择「高清」或「4K」模式
- **Flux**: 开启 Tiled VAE 或 hires fix

---

## 预设3：剧情推演四宫格

### 适用场景
同一事件的4个连续阶段/情绪递进，用于故事板预览、情绪弧线设计、叙事节奏测试

### 正向提示词
```
A 4-panel storyboard sequence in 2x2 grid, showing narrative progression of [事件/场景]: top-left [阶段1描述], top-right [阶段2描述], bottom-left [阶段3描述], bottom-right [阶段4描述]. Consistent character design across all panels, coherent lighting and color palette, uniform light warm gray background color F0EDE8, subjects softly blending with background with natural edge transition, no hard edges no white halo no light bleed, cinematic composition, emotional arc from [情绪A] to [情绪B], film grain texture, clean thin white grid dividers, absolutely no visible numbers text labels frame counters corner marks or annotations anywhere on the image
```

### 负向提示词
```
numbers, text, letters, labels, frame numbers, corner marks, annotations, captions, watermarks, signatures, logos, readable text, font, typography, grid numbers, sequence markers, page numbers, index, hard edge, glowing edge, white halo, light bleed, overexposed edge, cutout look, pasted on background, floating subject, disconnected shadow, pure white background, stark white, cold gray, bad anatomy, distorted face, extra fingers, deformed hands, inconsistent character design, lighting mismatch between frames, discontinuous action, jump cut feel, blurry, low quality, cropped, out of frame
```

### 平台参数建议
- **Midjourney**: `--ar 1:1 --style raw --s 75`
- **即梦/可灵**: 直接粘贴，建议分镜时先写情绪词再填场景
- **Flux**: 配合 `film grain` LoRA 增强故事板质感

---

## 预设4：角色脸部三视图

### 适用场景
角色面部正面/侧面/四分之三侧面的设定参考，用于Actor ID锁定、表情一致性控制

### 正向提示词
```
Character face reference sheet, three views side by side in single row: left panel front view straight-on, center panel 3/4 angle view, right panel side profile view. [角色面部详细描述]. Consistent lighting from 45-degree top-side across all three views, light warm gray background color F0EDE8, subjects softly blending with background with natural edge transition, no hard edges no white halo no light bleed, neutral clean backdrop, professional character design sheet, clean linework, subtle skin texture, identical facial features maintained across all angles, absolutely no visible numbers text labels frame counters corner marks or annotations anywhere on the image
```

### 负向提示词
```
numbers, text, letters, labels, frame numbers, corner marks, annotations, captions, watermarks, signatures, logos, readable text, font, typography, grid numbers, sequence markers, page numbers, index, hard edge, glowing edge, white halo, light bleed, overexposed edge, cutout look, pasted on background, floating subject, disconnected shadow, pure white background, stark white, cold gray, bad anatomy, distorted face, asymmetrical eyes, crossed eyes, extra fingers, deformed hands, inconsistent facial features between panels, lighting mismatch, blurry, low quality, cropped, out of frame
```

### 平台参数建议
- **Midjourney**: `--ar 16:9 --style raw --s 50`
- **即梦/可灵**: 上传参考图锁定Actor ID后使用
- **Flux**: 开启面部修复 + 一致性采样器

---

## 预设5：产品三视图

### 适用场景
产品设计的正面/侧面/顶面展示，用于工业设计、电商详情、技术文档

### 正向提示词
```
Product design reference sheet, three orthographic views in single row: front view, side view, top view. [产品详细描述]. Light warm gray background color F0EDE8, products softly blending with background with natural edge transition, no hard edges no white halo no light bleed, studio lighting with soft shadows, technical drawing aesthetic, precise proportions, material texture visible, no perspective distortion, professional product photography, absolutely no visible numbers text labels frame counters corner marks or annotations anywhere on the image
```

### 负向提示词
```
numbers, text, letters, labels, frame numbers, corner marks, annotations, captions, watermarks, signatures, logos, readable text, font, typography, grid numbers, sequence markers, page numbers, index, hard edge, glowing edge, white halo, light bleed, overexposed edge, cutout look, pasted on background, floating subject, disconnected shadow, pure white background, stark white, cold gray, distorted proportions, perspective distortion, blurry, low quality, cropped, out of frame, cluttered background, random objects, inconsistent material texture between views
```

### 平台参数建议
- **Midjourney**: `--ar 16:9 --style raw --s 50`
- **即梦/可灵**: 浅暖灰背景建议加 `--no gradient background`
- **Flux**: 配合 `product photography` LoRA

---

## 预设6：25宫格连贯分镜

### 适用场景
完整场景/动作的25帧连续分镜，5×5网格承载9个叙事节拍，用于电影分镜预览、动作连贯性测试、Seedance分段参考

### 正向提示词
```
A 5x5 cinematic storyboard grid, 25 sequential frames showing continuous narrative flow of [主体/场景/动作], naturally divided into 9 story beats progressing through beginning, development, escalation, twist, climax, and resolution. Scene transitions conveyed purely through visual continuity and character motion, absolutely no visible numbers, text, labels, frame counters, corner marks, or annotations anywhere on the image. Consistent character and environment across all 25 frames, smooth motion continuity between adjacent frames, uniform cinematic lighting and color palette, light warm gray background color F0EDE8, subjects softly blending with background with natural edge transition, no hard edges no white halo no light bleed, varied shot progression from wide to close-up, professional film storyboard aesthetic, subtle film grain, clean thin white grid dividers
```

### 负向提示词
```
numbers, text, letters, labels, frame numbers, corner marks, annotations, captions, watermarks, signatures, logos, readable text, font, typography, grid numbers, sequence markers, page numbers, index, hard edge, glowing edge, white halo, light bleed, overexposed edge, cutout look, pasted on background, floating subject, disconnected shadow, pure white background, stark white, cold gray, bad anatomy, distorted face, extra fingers, deformed hands, inconsistent character design, lighting mismatch between frames, discontinuous action, jump cut feel, blurry, low quality, cropped, out of frame, different hairstyle between frames, different clothing between frames
```

### 平台参数建议
- **Midjourney**: `--ar 1:1 --style raw --s 75 --q 2`
- **即梦/可灵**: 建议先测试单格效果再生成25格，分段生成更可控
- **Flux**: 开启 `Batch count: 1`，CFG 4.0，配合 `storyboard` LoRA

### 叙事节拍分配参考
| 节拍 | 帧数范围 | 功能 |
|------|---------|------|
| 起始 | 1-3帧 | 建立场景、引入主体 |
| 发展 | 4-7帧 | 动作展开、关系建立 |
| 推进 | 8-12帧 | 冲突升级、节奏加快 |
| 转折 | 13-15帧 | 关键变化、意外发生 |
| 高潮 | 16-20帧 | 情绪顶点、动作峰值 |
| 回落 | 21-23帧 | 余韵、反应、过渡 |
| 收尾 | 24-25帧 | 结局暗示、留白 |

---

## 预设7：电影级光影校正

### 适用场景
同一场景在不同光影条件下的对比展示，用于灯光方案测试、色调选择、情绪对照

### 正向提示词
```
Cinematic lighting comparison sheet, 6 panels showing the same [主体/场景] under different lighting conditions: top-left golden hour warm backlight, top-center overcast soft diffused light, top-right neon night city light, bottom-left harsh midday direct sun, bottom-center Rembrandt 45-degree side light with triangle shadow, bottom-right dramatic low-key chiaroscuro. Consistent composition and subject across all panels, only lighting changes, light warm gray background color F0EDE8, subjects softly blending with background with natural edge transition, no hard edges no white halo no light bleed, professional cinematography reference, absolutely no visible numbers text labels frame counters corner marks or annotations anywhere on the image
```

### 负向提示词
```
numbers, text, letters, labels, frame numbers, corner marks, annotations, captions, watermarks, signatures, logos, readable text, font, typography, grid numbers, sequence markers, page numbers, index, hard edge, glowing edge, white halo, light bleed, overexposed edge, cutout look, pasted on background, floating subject, disconnected shadow, pure white background, stark white, cold gray, inconsistent subject between panels, different pose between panels, different costume between panels, cluttered background, blurry, low quality, cropped, out of frame
```

### 平台参数建议
- **Midjourney**: `--ar 3:2 --style raw --s 50`
- **即梦/可灵**: 适合作为「Talk to Edit」的光影参考基底图
- **Flux**: 配合 `cinematic lighting` LoRA

### 6种光效情绪映射
| 光效 | 情绪 | 适用场景 |
|------|------|---------|
| 金色时刻暖逆光 | 温馨、怀旧、离别 | 爱情片、回忆场景 |
| 阴天柔光漫射 | 平静、客观、纪实 | 纪录片、日常叙事 |
| 霓虹夜景 | 赛博、孤独、未来 | 科幻、都市夜戏 |
| 正午硬光直射 | 真实、残酷、暴露 | 现实主义、冲突场景 |
| 伦勃朗45度侧光 | 经典、庄重、神秘 | 人像、悬疑、历史 |
| 低调明暗对比 | 恐怖、紧张、权力 | 黑色电影、权力对峙 |

---

## 预设8：角色设定参考表（胸口特写+全身三视图）

### 适用场景
角色一致性设定参考：左侧1/3脸部大特写锚定面部，右侧2/3三格横排全身三视图（正/侧/背）锚定服装与身形，用于Actor ID锁定、服装一致性控制、Seedance Canvas故事板

### 正向提示词
```
Character reference sheet, left-right split layout: left one-third area is chest-up close-up front view portrait (shoulder-up framing, extreme facial detail clarity, gentle natural expression, bright eyes looking straight at camera, realistic skin texture with visible pores and subtle imperfections, refined classical makeup); right two-thirds area is three full-body views in horizontal row, from left to right: full-body front standing pose (arms hanging naturally, feet together, complete front costume and body proportions), full-body side profile view (weight slightly shifted, waist-hip curve and silhouette visible, complete side costume and footwear), full-body back view (complete back neckline, hairstyle from behind, back costume details). Consistent front-top-side lighting across all panels, soft diffused light quality, light warm gray background color F0EDE8, subjects softly blending with background with natural edge transition, no hard edges no white halo no light bleed, identical character design, costume, hairstyle and accessories across all panels, professional character design sheet style, clean edges, accurate proportions, material texture visible from all angles, absolutely no visible numbers, text, labels, frame counters, corner marks or annotations anywhere on the image
```

### 负向提示词
```
numbers, text, letters, labels, frame numbers, corner marks, annotations, captions, watermarks, signatures, logos, readable text, font, typography, grid numbers, sequence markers, page numbers, index, hard edge, glowing edge, white halo, light bleed, overexposed edge, cutout look, pasted on background, floating subject, disconnected shadow, pure white background, stark white, cold gray, dividing line labels, panel markers, bad anatomy, distorted face, extra fingers, deformed hands, inconsistent character design, lighting mismatch between frames, different hairstyle between panels, different clothing between panels, blurry, low quality, cropped, out of frame, asymmetrical eyes, crossed eyes, plastic skin, over-smoothing, textureless skin, uniform skin tone, digital sharpening, filter look, CG look, retouched, airbrushed, multiple heads, mutated limbs, floating limbs, disconnected limbs, uneven panel sizes, broken layout
```

### 平台参数建议
- **Midjourney**: `--ar 16:9 --style raw --s 50 --q 2`
- **即梦/可灵**: 上传此图作为Actor ID参考，Canvas锁脸首选
- **Flux**: 开启面部一致性 + 服装一致性双重采样

### 区域功能分工
| 区域 | 占比 | 内容 | 景别 | 核心功能 |
|------|------|------|------|---------|
| 左侧 | 1/3 | 脸部正面高清特写 | 胸像肩以上大特写 | 面部锚定、Actor ID锁定、表情基准 |
| 右侧左格 | 2/3内 | 全身正面站姿 | 全景 | 服装正面、身形比例、整体姿态 |
| 右侧中格 | 2/3内 | 全身正侧面站姿 | 全景 | 侧面轮廓、腰臀曲线、服装侧片 |
| 右侧右格 | 2/3内 | 全身背面站姿 | 全景 | 背部剪裁、发型后片、服装背面 |

---

## 预设9：6种基础表情胸像（2×3六宫格）

### 适用场景
同一角色六种基础表情同时呈现，用于表情一致性控制、情绪基准设定、Seedance Talk to Edit表情参考

### 正向提示词
```
Character expression reference sheet in 2x3 grid layout, six basic expressions of the same character: top row from left to right: calm neutral expression (relaxed face, eyes looking straight ahead, lips naturally closed), gentle smile (corners of mouth slightly raised, eyes with smile lines, warm and approachable), joyful laugh (eyebrows and eyes curved upward, mouth open showing teeth, exuberant happiness); bottom row from left to right: sad tearful expression (slight furrow between brows, downturned outer eye corners, tears welling in eyes about to fall), angry stern expression (brows tightly locked, sharp piercing eyes with pressure, jaw slightly set), surprised astonished expression (eyes wide open, eyebrows raised high, mouth slightly open in O shape). All six expressions are chest-up close-up portraits of the same character, shoulder-up framing, extreme facial detail clarity, realistic skin texture preserved, no additional light source, light warm gray background color F0EDE8, subjects softly blending with background with natural edge transition, no hard edges no white halo no light bleed, identical character styling, hairstyle, makeup and accessories across all six panels, only facial expression changes, professional character expression sheet style, clean edges, absolutely no visible numbers, text, labels, frame counters, corner marks or annotations anywhere on the image
```

### 负向提示词
```
numbers, text, letters, labels, frame numbers, corner marks, annotations, captions, watermarks, signatures, logos, readable text, font, typography, grid numbers, sequence markers, page numbers, index, expression name labels, emotion text, hard edge, glowing edge, white halo, light bleed, overexposed edge, cutout look, pasted on background, floating subject, disconnected shadow, pure white background, stark white, cold gray, bad anatomy, distorted face, extra fingers, deformed hands, inconsistent character design, different hairstyle between panels, different clothing between panels, lighting mismatch between panels, blurry, low quality, cropped, out of frame, asymmetrical eyes, crossed eyes, plastic skin, over-smoothing, textureless skin, uniform skin tone, digital sharpening, filter look, CG look, retouched, airbrushed, multiple heads, mutated limbs, floating limbs, disconnected limbs, uneven panel sizes, broken layout, extra rows, extra columns, missing panel, shadows on face, directional light, dramatic lighting, colored light
```

### 平台参数建议
- **Midjourney**: `--ar 3:2 --style raw --s 50`
- **即梦/可灵**: 直接粘贴，建议开启「参考图」锁角色一致性
- **Flux**: 配合 `add_detail` + 面部一致性采样器

### 六宫格布局
| 上排左 | 上排中 | 上排右 |
|--------|--------|--------|
| **平静中性** | **温和微笑** | **开怀大笑** |
| 面部放松，眼神平视，双唇闭合 | 嘴角微扬，眼角带笑，神态亲切 | 眉眼弯起，露齿张嘴，情绪外放 |

| 下排左 | 下排中 | 下排右 |
|--------|--------|--------|
| **悲伤垂泪** | **愤怒冷峻** | **惊讶错愕** |
| 眉心微蹙，眼尾下垂，眼眶含泪 | 眉峰紧锁，眼神锐利，下颌微收 | 双眼睁大，眉头上挑，嘴巴微张 |

---

## 预设10：360全景图

### 适用场景
用于生成360全景、VR全景、可左右循环拼接的空间视角图，适合室内空间、展厅、场景漫游、环境概念设计；封闭场景需要具备合理出入口。

### 正向提示词
```
生成一个720度的全景VR图，左右边缘100%像素级无缝衔接，可无限循环拼接；上下极点(南北极)自然过渡，无明显断层或拉伸，场景一致性，以及场景的逻辑性，封闭场景需要有门
```

### 负向提示词
```
seam, visible seam, hard seam, broken panorama, discontinuous edge, mismatched left and right edges, distorted poles, stretched ceiling, stretched floor, warped horizon, inconsistent scene logic, impossible space, no exit in closed room, text, letters, labels, watermark, logo, blurry, low quality
```

### 平台参数建议
- **Midjourney**: `--ar 2:1 --style raw --s 50`
- **即梦/可灵**: 使用2:1宽幅比例，生成后用360预览检查左右接缝
- **Flux**: 建议2:1比例，优先测试左右边缘连续性

---

## 通用负面词库（所有预设共用补充）

```
numbers, text, letters, labels, frame numbers, corner marks, annotations, captions, watermarks, signatures, logos, readable text, font, typography, grid numbers, sequence markers, page numbers, index, hard edge, glowing edge, white halo, light bleed, overexposed edge, cutout look, pasted on background, floating subject, disconnected shadow, pure white background, stark white, cold gray, bad anatomy, distorted face, extra fingers, deformed hands, inconsistent character design, lighting mismatch between frames, different hairstyle between panels, different clothing between panels, blurry, low quality, cropped, out of frame, asymmetrical eyes, crossed eyes, plastic skin, over-smoothing, textureless skin, uniform skin tone, digital sharpening, filter look, CG look, retouched, airbrushed, multiple heads, mutated limbs, floating limbs, disconnected limbs, uneven panel sizes, broken layout
```

---

## 预设使用纪律

1. **一致性三重锚定**：每套预设必须包含 `consistent` / `identical` / `uniform` 至少两个词
2. **无文字强制排除**：所有预设的负面词必须包含 `numbers, text, letters, labels, annotations` 等文字类排除
3. **光线整场锁定**：同一预设内所有格子必须统一光源方向和色温
4. **边缘柔和过渡**：所有预设必须包含 `subjects softly blending with background with natural edge transition, no hard edges no white halo no light bleed`
5. **背景统一浅暖灰**：所有预设使用 `light warm gray background color F0EDE8`，负面排除 `pure white background, stark white, cold gray`
6. **单格不切碎**：25宫格中相邻帧动作必须连贯，避免跳帧感
7. **先测后扩**：复杂预设（25宫格/九宫格）建议先单格测试效果，确认一致性后再生成完整网格

---

## 版本更新日志

| 版本 | 日期 | 更新内容 |
|------|------|---------|
| v1.0 | 2026-05-22 | 初始版本，8个预设 |
| v2.0 | 2026-05-28 | 统一背景为浅暖灰#F0EDE8，新增表情六宫格预设，优化边缘处理，所有预设增加边缘柔和过渡描述 |
| v2.1 | 2026-05-30 | 新增视角类360全景图预设 |

---

*本文件为无限画布AI工具的预设提示词标准库，直接复制粘贴即可使用。*
