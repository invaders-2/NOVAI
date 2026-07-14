$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$logDir = Join-Path $root "logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$logPath = Join-Path $logDir ("jimeng-cli-login-{0}.log" -f (Get-Date -Format "yyyyMMdd-HHmmss"))
Start-Transcript -Path $logPath -Force | Out-Null

function Pause-End {
    Write-Host ""
    Write-Host "Log: $logPath"
    Read-Host "Press Enter to close"
    Stop-Transcript | Out-Null
}

try {
    Write-Host "========================================"
    Write-Host "  NOVAI - 即梦 CLI 登录 (WSL 模式)"
    Write-Host "========================================"
    Write-Host ""

    $wslList = & wsl.exe --list --verbose 2>&1
    $ubuntuDistro = $null
    foreach ($line in $wslList) {
        if ($line -match '^\s*\*?\s*(Ubuntu\S*)\s+') {
            $ubuntuDistro = $Matches[1]
            break
        }
    }

    if (-not $ubuntuDistro) {
        Write-Host "[错误] 未找到 Ubuntu WSL 发行版。请先运行 install_jimeng_cli.bat"
        Pause-End
        exit 1
    }

    Write-Host "发行版: $ubuntuDistro"
    Write-Host ""

    $loginCmd = 'export PATH="$HOME/.local/bin:$PATH"; dreamina login 2>&1'
    Write-Host "正在启动登录流程..."
    Write-Host "请在弹出的浏览器窗口中扫码完成登录。"
    Write-Host ""
    & wsl.exe -d $ubuntuDistro -- bash -c $loginCmd

    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "[警告] 登录返回非零退出码，请检查上方输出。"
    }

    Write-Host ""
    Write-Host "正在查询积分..."
    $creditCmd = 'export PATH="$HOME/.local/bin:$PATH"; dreamina user_credit 2>&1'
    & wsl.exe -d $ubuntuDistro -- bash -c $creditCmd
    Write-Host ""

    $apiDir = Join-Path $root "API"
    $envPath = Join-Path $apiDir ".env"
    New-Item -ItemType Directory -Force -Path $apiDir | Out-Null
    $lines = @()
    if (Test-Path $envPath) { $lines = Get-Content -LiteralPath $envPath }
    $lines = @($lines | Where-Object { $_ -notmatch '^\s*JIMENG_USE_WSL\s*=' })
    $lines += "JIMENG_USE_WSL=1"
    [System.IO.File]::WriteAllLines($envPath, $lines, [System.Text.UTF8Encoding]::new($false))
    Write-Host "API\.env: JIMENG_USE_WSL=1"
    Write-Host ""
    Write-Host "完成！启动 NOVAI 后即可使用即梦功能。"
    Pause-End
} catch {
    Write-Host "[错误] $($_.Exception.Message)"
    Pause-End
    exit 1
}
