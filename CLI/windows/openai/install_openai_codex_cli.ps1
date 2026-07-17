param(
    [switch]$NonInteractive
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..\..\..")
$logDir = Join-Path $root "logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$logPath = Join-Path $logDir ("openai-codex-cli-install-{0}.log" -f (Get-Date -Format "yyyyMMdd-HHmmss"))
Start-Transcript -Path $logPath -Force | Out-Null

function Pause-End {
    Write-Host ""
    Write-Host "Log: $logPath"
    Read-Host "Press Enter to close"
    Stop-Transcript | Out-Null
}

function Get-NpmCommand {
    $npmCmd = Get-Command npm.cmd -ErrorAction SilentlyContinue
    if ($npmCmd) { return $npmCmd.Source }

    $npm = Get-Command npm -ErrorAction SilentlyContinue
    if ($npm) { return $npm.Source }

    return $null
}

function Add-NpmPrefixToPath {
    param([string]$NpmCommand)

    try {
        $prefix = (& $NpmCommand config get prefix 2>$null | Select-Object -First 1).Trim()
        if ($prefix -and (Test-Path -LiteralPath $prefix)) {
            $env:PATH = "$prefix;$env:PATH"
        }
    } catch {
        Write-Host "Could not read npm global prefix. Continuing with the current PATH."
    }
}

function Install-WithNpmFallback {
    $npm = Get-NpmCommand
    if (-not $npm) {
        throw "OpenAI standalone installer failed, and npm was not found for fallback install."
    }

    Write-Host "Falling back to npm package install: npm install -g @openai/codex"
    & $npm install -g "@openai/codex"
    if ($LASTEXITCODE -ne 0) {
        throw "npm fallback install failed with exit code $LASTEXITCODE."
    }
    Add-NpmPrefixToPath -NpmCommand $npm
}

function Install-GptImage2Skill {
    $npm = Get-NpmCommand
    if (-not $npm) {
        Write-Host "npm was not found. Skipping gpt-image-2-skill install."
        return
    }

    Write-Host "Installing/updating GPT Image 2 helper: npm install -g gpt-image-2-skill"
    & $npm install -g "gpt-image-2-skill"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "gpt-image-2-skill install failed with exit code $LASTEXITCODE. Codex CLI can still run, but Image 2 helper will be unavailable."
        return
    }
    Add-NpmPrefixToPath -NpmCommand $npm
}

try {
    Write-Host "=== OpenAI Codex CLI install/update ==="
    Write-Host "Workspace: $root"
    Write-Host ""

    if ($NonInteractive) {
        $env:CODEX_NON_INTERACTIVE = "1"
        Write-Host "CODEX_NON_INTERACTIVE=1"
    }

    Write-Host "Installing/updating Codex CLI with the official OpenAI standalone installer..."
    try {
        irm https://chatgpt.com/codex/install.ps1 | iex
    } catch {
        Write-Host "Standalone installer failed: $($_.Exception.Message)"
        Install-WithNpmFallback
    }
    Install-GptImage2Skill
    Write-Host ""

    $codex = Get-Command codex -ErrorAction SilentlyContinue
    if (-not $codex) {
        Write-Host "Codex CLI was installed, but 'codex' is not available in this PowerShell PATH yet."
        Write-Host "Close this window, open a new PowerShell, then run: codex"
        Pause-End
        exit 2
    }

    Write-Host "Codex CLI found: $($codex.Source)"
    try {
        & codex --version
    } catch {
        Write-Host "Could not read Codex version in this session. Open a new PowerShell and run: codex --version"
    }
    $gptImage2Skill = Get-Command gpt-image-2-skill -ErrorAction SilentlyContinue
    if ($gptImage2Skill) {
        Write-Host "GPT Image 2 helper found: $($gptImage2Skill.Source)"
    } else {
        Write-Host "GPT Image 2 helper is not available in this PowerShell PATH yet."
    }

    Write-Host ""
    Write-Host "Done. Run 'codex' in PowerShell to sign in and start using OpenAI Codex CLI."
    Write-Host "You can also double-click CLI\windows\openai\start_openai_codex_cli.bat."
    Pause-End
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Pause-End
    exit 1
}
