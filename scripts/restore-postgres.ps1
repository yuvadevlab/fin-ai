# ==============================================================================
# FinAI Automated PostgreSQL Restore Script
# Location: D:\server\repos\fin-ai\scripts\restore-postgres.ps1
# ==============================================================================

[CmdletBinding()]
param (
    [Parameter(Mandatory=$true)]
    [string]$BackupZipFile,
    [string]$DbContainer = "fin-ai-postgres",
    [string]$DbUser = "finai_admin",
    [string]$DbName = "finai_db"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $BackupZipFile)) {
    Write-Error "[ERROR] Specified backup zip file '$BackupZipFile' does not exist!"
    exit 1
}

Write-Host "==========================================================" -ForegroundColor Red
Write-Host " STARTING DATABASE RESTORE PROCEDURE" -ForegroundColor Red
Write-Host " Backup Archive: $BackupZipFile" -ForegroundColor Red
Write-Host " WARNING: THIS WILL OVERWRITE EXISTING PRODUCTION DATA!" -ForegroundColor Red
Write-Host "==========================================================" -ForegroundColor Red

# Step 1: Extract Backup Archive
$TempExtractDir = Join-Path $env:TEMP "finai_restore_$(Get-Random)"
New-Item -ItemType Directory -Path $TempExtractDir -Force | Out-Null
Expand-Archive -Path $BackupZipFile -DestinationPath $TempExtractDir -Force

$SqlFile = Get-ChildItem -Path $TempExtractDir -Filter "*.sql" | Select-Object -First 1

if (-not $SqlFile) {
    Write-Error "[ERROR] No .sql database dump found inside zip archive!"
    Remove-Item -Path $TempExtractDir -Recurse -Force
    exit 1
}

# Step 2: Stop Dependent App Services to Prevent Active Locks
Write-Host "[STEP 1/3] Stopping API & Web services during restore..." -ForegroundColor Yellow
docker compose stop api web

# Step 3: Copy SQL File into Postgres Container & Execute Restore
Write-Host "[STEP 2/3] Restoring database dump into PostgreSQL..." -ForegroundColor Yellow
docker cp $SqlFile.FullName "${DbContainer}:/tmp/restore.sql"

# Pipe SQL dump into psql inside container
docker exec $DbContainer psql -U $DbUser -d $DbName -f /tmp/restore.sql
docker exec $DbContainer rm /tmp/restore.sql

# Step 4: Cleanup Temp Files & Restart Application Stack
Write-Host "[STEP 3/3] Restarting application containers..." -ForegroundColor Green
Remove-Item -Path $TempExtractDir -Recurse -Force
docker compose start api web

Write-Host "==========================================================" -ForegroundColor Green
Write-Host " Database Restore Completed Successfully!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
