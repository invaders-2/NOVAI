$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$logDir = Join-Path $root "logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$logPath = Join-Path $logDir ("jimeng-cli-install-{0}.log" -f (Get-Date -Format "yyyyMMdd-HHmmss"))
Start-Transcript -Path $logPath -Force | Out-Null

function Pause-End {
    Write-Host ""
    Write-Host "Log: $logPath"
    Read-Host "Press Enter to close"
    Stop-Transcript | Out-Null
}

try {
    Write-Host "========================================"
    Write-Host "  NOVAI - 即梦 CLI 安装 (WSL 模式)"
    Write-Host "========================================"
    Write-Host ""

    $wslExe = Get-Command wsl.exe -ErrorAction SilentlyContinue
    if (-not $wslExe) {
        Write-Host "[错误] WSL 未安装。请先安装 WSL："
        Write-Host "  以管理员身份打开 PowerShell，运行："
        Write-Host "    wsl --install -d Ubuntu"
        Write-Host "  安装完成后重启电脑，再运行本脚本。"
        Pause-End
        exit 1
    }

    $wslList = & wsl.exe --list --verbose 2>&1
    $ubuntuDistro = $null
    foreach ($line in $wslList) {
        if ($line -match '^\s*\*?\s*(Ubuntu\S*)\s+') {
            $ubuntuDistro = $Matches[1]
            break
        }
    }

    if (-not $ubuntuDistro) {
        $wslList2 = & wsl.exe --list --online 2>&1
        Write-Host "[错误] 未找到 Ubuntu WSL 发行版。"
        Write-Host "  以管理员身份打开 PowerShell，运行："
        Write-Host "    wsl --install -d Ubuntu"
        Write-Host "  安装完成后重启电脑，再运行本脚本。"
        Pause-End
        exit 1
    }

    Write-Host "[1/3] 检测到 WSL 发行版: $ubuntuDistro"
    Write-Host ""

    Write-Host "[2/3] 在 WSL 中安装 dreamina CLI..."
    $installCmd = 'export PATH="$HOME/.local/bin:$PATH"; curl -fsSL https://jimeng.jianying.com/cli | bash 2>&1'
    $result = & wsl.exe -d $ubuntuDistro -- bash -c $installCmd 2>&1
    Write-Host $result
    Write-Host ""

    Write-Host "[3/3] 配置 NOVAI 使用 WSL 模式..."
    $apiDir = Join-Path $root "API"
    $envPath = Join-Path $apiDir ".env"
    New-Item -ItemType Directory -Force -Path $apiDir | Out-Null
    $lines = @()
    if (Test-Path $envPath) { $lines = Get-Content -LiteralPath $envPath }
    $lines = @($lines | Where-Object { $_ -notmatch '^\s*JIMENG_USE_WSL\s*=' })
    $lines = @($lines | Where-Object { $_ -notmatch '^\s*DREAMINA_BIN\s*=' })
    $lines += "JIMENG_USE_WSL=1"
    [System.IO.File]::WriteAllLines($envPath, $lines, [System.Text.UTF8Encoding]::new($false))
    Write-Host "API\.env: JIMENG_USE_WSL=1"
    Write-Host ""

    Write-Host "安装完成！"
    Write-Host ""
    $answer = Read-Host "是否立即登录？(Y/N)"
    if ($answer -match '^(Y|y)$') {
        & powershell -NoExit -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "jimeng_cli_login.ps1")
        Stop-Transcript | Out-Null
        return
    }

    Write-Host "请运行 login_jimeng_cli.bat 完成登录。"
    Pause-End
} catch {
    Write-Host "[错误] $($_.Exception.Message)"
    Pause-End
    exit 1
}
