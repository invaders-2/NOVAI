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
    Write-Host "=== Jimeng CLI Install/Update (Windows) ==="
    Write-Host "Workspace: $root"
    Write-Host ""

    $binDir = Join-Path $env:USERPROFILE "bin"
    $dreaminaExe = Join-Path $binDir "dreamina.exe"
    $downloadUrl = "https://lf3-static.bytednsdoc.com/obj/eden-cn/psj_hupthlyk/ljhwZthlaukjlkulzlp/dreamina_cli_beta/dreamina_cli_windows_amd64.exe"

    New-Item -ItemType Directory -Force -Path $binDir | Out-Null

    Write-Host "Downloading dreamina CLI..."
    try {
        Invoke-WebRequest -Uri $downloadUrl -OutFile $dreaminaExe -ErrorAction Stop
        $size = (Get-Item $dreaminaExe).Length
        Write-Host "Downloaded: $([math]::Round($size / 1MB, 1)) MB"
    } catch {
        Write-Host "Download failed: $($_.Exception.Message)"
        Write-Host "Manual download: $downloadUrl"
        Write-Host "Save to: $dreaminaExe"
        Pause-End
        exit 1
    }

    $currentPath = [Environment]::GetEnvironmentVariable('Path', 'User')
    if ($currentPath -notlike "*$binDir*") {
        $newPath = $currentPath + ";" + $binDir
        [Environment]::SetEnvironmentVariable('Path', $newPath, 'User')
        Write-Host "PATH added: $binDir"
    } else {
        Write-Host "PATH already contains: $binDir"
    }

    $apiDir = Join-Path $root "API"
    $envPath = Join-Path $apiDir ".env"
    New-Item -ItemType Directory -Force -Path $apiDir | Out-Null
    $lines = @()
    if (Test-Path $envPath) { $lines = Get-Content -LiteralPath $envPath }
    $lines = @($lines | Where-Object { $_ -notmatch '^\s*JIMENG_USE_WSL\s*=' })
    $lines = @($lines | Where-Object { $_ -notmatch '^\s*DREAMINA_BIN\s*=' })
    $lines += "JIMENG_USE_WSL=0"
    $lines += "DREAMINA_BIN=$dreaminaExe"
    [System.IO.File]::WriteAllLines($envPath, $lines, [System.Text.UTF8Encoding]::new($false))
    Write-Host "Updated API\.env: JIMENG_USE_WSL=0, DREAMINA_BIN=$dreaminaExe"

    Write-Host ""
    $answer = Read-Host "Login now? Type Y and press Enter"
    if ($answer -match '^(Y|y)$') {
        & powershell -NoExit -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "jimeng_cli_login.ps1")
        Stop-Transcript | Out-Null
        return
    }

    Write-Host "Done. Run login_jimeng_cli.bat to login."
    Pause-End
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Pause-End
    exit 1
}