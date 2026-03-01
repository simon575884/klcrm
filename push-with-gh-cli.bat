@echo off
echo ========================================
echo Installing GitHub CLI and Pushing...
echo ========================================

REM Install GitHub CLI
echo Installing GitHub CLI...
winget install --id GitHub.cli -e

REM Authenticate
echo.
echo Authenticating with GitHub...
gh auth login

REM Push
echo.
echo Pushing to GitHub...
gh repo create klcrm --public --source=. --remote=origin --push

echo.
echo ========================================
echo Done! Check: https://github.com/simon575884/klcrm
echo ========================================
pause
