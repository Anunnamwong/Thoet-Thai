Write-Host "=== Reset PostgreSQL password ===" -ForegroundColor Cyan

# 1. Stop service
Write-Host "1. Stopping PostgreSQL..." -ForegroundColor Yellow
Stop-Service postgresql-x64-17 -Force
Start-Sleep -Seconds 2

# 2. Allow login without password
Write-Host "2. Patching pg_hba.conf..." -ForegroundColor Yellow
$hba = "C:\Program Files\PostgreSQL\17\data\pg_hba.conf"
(Get-Content $hba) -replace 'scram-sha-256', 'trust' | Set-Content $hba

# 3. Start service
Write-Host "3. Starting PostgreSQL..." -ForegroundColor Yellow
Start-Service postgresql-x64-17
Start-Sleep -Seconds 3

# 4. Set password + create DB
Write-Host "4. Setting password and creating database..." -ForegroundColor Yellow
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';"
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c "CREATE DATABASE fooddelivery;"

# 5. Restore secure auth
Write-Host "5. Restoring pg_hba.conf..." -ForegroundColor Yellow
(Get-Content $hba) -replace 'trust', 'scram-sha-256' | Set-Content $hba

# 6. Restart
Write-Host "6. Restarting PostgreSQL..." -ForegroundColor Yellow
Stop-Service postgresql-x64-17 -Force
Start-Sleep -Seconds 2
Start-Service postgresql-x64-17

Write-Host ""
Write-Host "=== Done! ===" -ForegroundColor Green
Write-Host "Database 'fooddelivery' created. Password = postgres" -ForegroundColor Green
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
