@echo off
REM Inspire Media website - one-step start (Windows). Double-click this file.
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Download the LTS version from https://nodejs.org, install it, then double-click this file again.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Installing dependencies - first run only, about 1-2 minutes...
  call npm install
  if errorlevel 1 (
    echo.
    echo npm install failed. Copy the error above and send it to your developer.
    pause
    exit /b 1
  )
)

if not exist .env.local (
  copy .env.example .env.local >nul
  echo Created .env.local - add your RESEND_API_KEY there so the contact form can email you.
)

echo.
echo Starting Inspire Media at http://localhost:3000  - close this window to stop.
start "" cmd /c "timeout /t 6 >nul & start http://localhost:3000"
call npm run dev
pause
