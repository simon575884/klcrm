@echo off
echo ========================================
echo Pushing to GitHub...
echo ========================================
echo.
echo You will be prompted for:
echo Username: simon575884
echo Password: YOUR_GITHUB_TOKEN
echo.
echo If you don't have a token, get it from:
echo https://github.com/settings/tokens
echo.
pause

REM Set Git path
set PATH=%PATH%;C:\Program Files\Git\bin

REM Push to GitHub
git push -u origin main

echo.
echo ========================================
echo If successful, check:
echo https://github.com/simon575884/klcrm
echo ========================================
pause
