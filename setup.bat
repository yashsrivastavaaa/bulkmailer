@echo off
setlocal
npm install
if not exist .env.local copy .env.local.example .env.local
 echo.
echo Setup complete. Edit .env.local, then run: npm run dev
pause
