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
    Write-Host "=== Jimeng CLI Login/Check (Windows) ==="
    Write-Host "Workspace: $root"
    Write-Host ""

    $binDir = Join-Path $env:USERPROFILE "bin"
    $dreaminaExe = Join-Path $binDir "dreamina.exe"

    if (-not (Test-Path $dreaminaExe)) {
        Write-Host "dreamina CLI not found. Run install_jimeng_cli.bat first."
        Write-Host "Expected path: $dreaminaExe"
        Pause-End
        exit 1
    }

    Write-Host "Found dreamina: $dreaminaExe"
    Write-Host ""

    Write-Host "Logging in..."
    & $dreaminaExe login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Login failed, exit code: $LASTEXITCODE"
        Pause-End
        exit $LASTEXITCODE
    }
    Write-Host ""

    Write-Host "Checking credits..."
    & $dreaminaExe user_credit
    Write-Host ""

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
    Write-Host "Done."
    Pause-End
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Pause-End
    exit 1
}