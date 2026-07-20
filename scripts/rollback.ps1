# ==============================================================================
# FinAI Deployment Rollback Script for Windows Server
# Location: D:\server\repos\fin-ai\scripts\rollback.ps1
# ==============================================================================

[CmdletBinding()]
param (
    [string]$RepoPath = "D:\server\repos\fin-ai",
    [string]$TargetCommit = "HEAD~1"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Red
Write-Host " Initiating Emergency Rollback Sequence" -ForegroundColor Red
Write-Host " Target Commit: $TargetCommit" -ForegroundColor Red
Write-Host "==========================================================" -ForegroundColor Red

Set-Location -Path $RepoPath

# Step 1: Revert Codebase to Target Commit
Write-Host "[STEP 1/4] Checking out target commit ($TargetCommit)..." -ForegroundColor Yellow
git checkout $TargetCommit

# Step 2: Rebuild Docker Stack
Write-Host "[STEP 2/4] Rebuilding Docker Containers..." -ForegroundColor Yellow
docker compose build --parallel

# Step 3: Restart Services
Write-Host "[STEP 3/4] Restarting Container Services..." -ForegroundColor Yellow
docker compose down
docker compose up -d

# Step 4: Validate Health
Write-Host "[STEP 4/4] Verifying Rollback Health Status..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
docker compose ps

Write-Host "==========================================================" -ForegroundColor Red
Write-Host " Rollback Sequence Complete!" -ForegroundColor Red
Write-Host " Current Commit: $(git rev-parse HEAD)" -ForegroundColor Red
Write-Host "==========================================================" -ForegroundColor Red
