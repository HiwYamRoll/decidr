@echo off
title Decidr Launcher
echo ========================================================
echo   Starting Decidr Full-Stack Application
echo ========================================================
echo.
echo [1/2] Starting Backend REST API on http://localhost:5000 ...
start "Decidr Backend (Port 5000)" cmd /k "cd /d "%~dp0backend" && node server.js"

echo [2/2] Starting Frontend Ionic Angular on http://localhost:8100 ...
start "Decidr Frontend (Port 8100)" cmd /k "cd /d "%~dp0frontend" && npx ionic serve"

echo.
echo ========================================================
echo   ทั้ง 2 เซิร์ฟเวอร์กำลังเปิดทำงานในหน้าต่างใหม่:
echo   - Frontend: http://localhost:8100
echo   - Backend:  http://localhost:5000
echo   (อย่าลืมเปิด MySQL ใน XAMPP Control Panel ด้วยนะครับ)
echo ========================================================
pause
