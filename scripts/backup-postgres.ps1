# ==============================================================================
# FinAI Automated PostgreSQL & Data Backup Script
# Location: D:\server\repos\fin-ai\scripts\backup-postgres.ps1
# ==============================================================================

[CmdletBinding()]
param (
    [string]$DbContainer = "fin-ai-postgres",
    [string]$DbUser = "finai_admin",
    [string]$DbName = "finai_db",
    [string]$BackupBaseDir = "D:\server\backups",
    [int]$RetentionDays = 30
)

$ErrorActionPreference = "Stop"
$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"

$DbBackupDir = Join-Path $BackupBaseDir "postgres"
$UploadBackupDir = Join-Path $BackupBaseDir "uploads"
$ConfigBackupDir = Join-Path $BackupBaseDir "configs"

# Ensure target directories exist
New-Item -ItemType Directory -Path $DbBackupDir -Force | Out-Null
New-Item -ItemType Directory -Path $UploadBackupDir -Force | Out-Null
New-Item -ItemType Directory -Path $ConfigBackupDir -Force | Out-Null

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Starting FinAI Automated Backup Process [$Timestamp]" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. PostgreSQL Database Backup via pg_dump inside Container
$DbDumpFile = Join-Path $DbBackupDir "finai_db_$Timestamp.sql"
Write-Host "[STEP 1/3] Executing PostgreSQL database dump..." -ForegroundColor Green

docker exec $DbContainer pg_dump -U $DbUser -d $DbName --format=plain --clean --create > $DbDumpFile

if (Test-Path $DbDumpFile) {
    # Compress database dump using PowerShell Compress-Archive or gzip
    $CompressedDbFile = "$DbDumpFile.zip"
    Compress-Archive -Path $DbDumpFile -DestinationPath $CompressedDbFile -Force
    Remove-Item -Path $DbDumpFile -Force
    Write-Host "  [OK] Database dump compressed: $CompressedDbFile" -ForegroundColor Green
} else {
    Write-Error "[ERROR] Database backup failed!"
}

# 2. Uploaded Media & Documents Backup
$UploadSource = "D:\server\storage\uploads"
if (Test-Path $UploadSource) {
    Write-Host "[STEP 2/3] Backing up uploaded files from $UploadSource..." -ForegroundColor Green
    $UploadZip = Join-Path $UploadBackupDir "uploads_$Timestamp.zip"
    Compress-Archive -Path "$UploadSource\*" -DestinationPath $UploadZip -Force
    Write-Host "  [OK] Upload files compressed: $UploadZip" -ForegroundColor Green
}

# 3. Environment & Configuration Backup
Write-Host "[STEP 3/3] Backing up production configs & environment variables..." -ForegroundColor Green
$ConfigZip = Join-Path $ConfigBackupDir "configs_$Timestamp.zip"
$ConfigFiles = @(
    "D:\server\repos\fin-ai\.env",
    "D:\server\repos\fin-ai\docker-compose.yml",
    "D:\server\repos\fin-ai\docker\nginx\nginx.conf",
    "D:\server\repos\fin-ai\docker\nginx\conf.d\default.conf"
) | Where-Object { Test-Path $_ }

if ($ConfigFiles.Count -gt 0) {
    Compress-Archive -Path $ConfigFiles -DestinationPath $ConfigZip -Force
    Write-Host "  [OK] Configs compressed: $ConfigZip" -ForegroundColor Green
}

# Retention Policy Cleanup (Purge backups older than $RetentionDays)
Write-Host "[CLEANUP] Enforcing retention policy ($RetentionDays days)..." -ForegroundColor Yellow
$CutoffDate = (Get-Date).AddDays(-$RetentionDays)

Get-ChildItem -Path $BackupBaseDir -Recurse -File | Where-Object { $_.LastWriteTime -lt $CutoffDate } | ForEach-Object {
    Write-Host "  [DELETING STALE BACKUP] $($_.FullName)" -ForegroundColor Red
    Remove-Item -Path $_.FullName -Force
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Backup Pipeline Execution Completed Successfully!" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
