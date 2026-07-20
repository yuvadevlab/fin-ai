# ==============================================================================
# FinAI Automated Deployment Script for Windows Server
# Location: D:\server\repos\fin-ai\scripts\deploy.ps1
# ==============================================================================

[CmdletBinding()]
param (
    [string]$RepoPath = "D:\server\repos\fin-ai",
    [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Starting FinAI Production Deployment Pipeline" -ForegroundColor Cyan
Write-Host " Target Directory: $RepoPath" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Step 1: Ensure Host Production Folder Hierarchy Exists
$Directories = @(
    "D:\server\docker-data\postgres",
    "D:\server\docker-data\nginx",
    "D:\server\docker-data\certbot",
    "D:\server\storage\uploads",
    "D:\server\storage\exports",
    "D:\server\logs\nginx",
    "D:\server\logs\api",
    "D:\server\logs\web",
    "D:\server\backups\postgres",
    "D:\server\backups\uploads",
    "D:\server\backups\configs"
)

foreach ($dir in $Directories) {
    if (-not (Test-Path -Path $dir)) {
        Write-Host "[INFO] Creating production host directory: $dir" -ForegroundColor Yellow
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}

# Step 2: Set Location to Repository Root
if (-not (Test-Path -Path $RepoPath)) {
    Write-Error "[ERROR] Repository path '$RepoPath' does not exist!"
    exit 1
}

Set-Location -Path $RepoPath

# Step 3: Check Master Environment File
$EnvFile = Join-Path $RepoPath ".env"
if (-not (Test-Path -Path $EnvFile)) {
    Write-Error "[ERROR] Production master '.env' file not found at $EnvFile! Please ensure .env exists on the host server."
    exit 1
}

# Step 4: Git Synchronization
Write-Host "[STEP 1/6] Synchronizing Git Repository ($Branch)..." -ForegroundColor Green
git config --global --add safe.directory D:/server/repos/fin-ai 2>$null
git fetch origin
git checkout $Branch
git pull origin $Branch

# Step 5: Docker Build Phase
Write-Host "[STEP 2/6] Building Docker Images..." -ForegroundColor Green
docker compose build --parallel

# Step 6: Database Migration Execution
Write-Host "[STEP 3/6] Running PostgreSQL Database Migrations..." -ForegroundColor Green
# Start database first to allow migrations
docker compose up -d postgres
Start-Sleep -Seconds 5
docker compose run --rm api pnpm db:migrate

# Step 7: Zero-Downtime Container Launch
Write-Host "[STEP 4/6] Launching Containers via Docker Compose..." -ForegroundColor Green
docker compose up -d --remove-orphans

# Step 8: Health Check Verification
Write-Host "[STEP 5/6] Performing Service Health Checks..." -ForegroundColor Green
Start-Sleep -Seconds 10

$Services = @("fin-ai-postgres", "fin-ai-api", "fin-ai-web", "fin-ai-nginx")
$HealthyCount = 0

foreach ($service in $Services) {
    $status = docker inspect --format='{{json .State.Health.Status}}' $service 2>$null
    if ($status -eq '"healthy"' -or $status -eq 'healthy') {
        Write-Host "  [OK] Service '$service' is HEALTHY." -ForegroundColor Green
        $HealthyCount++
    } else {
        Write-Host "  [WARNING] Service '$service' health status: $status" -ForegroundColor Yellow
    }
}

# Step 9: Prune Stale Docker Layers
Write-Host "[STEP 6/6] Cleaning Up Dangling Docker Images..." -ForegroundColor Green
docker image prune -f

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " FinAI Deployment Completed Successfully!" -ForegroundColor Cyan
Write-Host " Services active: $HealthyCount / $($Services.Count)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
