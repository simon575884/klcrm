@echo off
echo ========================================
echo K&L Auto Repair CRM - GitHub Push
echo ========================================
echo.

REM Set Git path
set PATH=%PATH%;C:\Program Files\Git\bin

REM Configure Git user
echo Configuring Git user...
git config --global user.email "klmobileexp@yahoo.com"
git config --global user.name "K&L Auto Repair"

REM Initialize Git repository
echo Initializing Git repository...
git init

REM Add all files
echo Adding files...
git add .

REM Commit
echo Committing files...
git commit -m "Initial commit - K&L Auto Repair CRM with Supabase"

REM Set branch to main
echo Setting branch to main...
git branch -M main

REM Add remote origin
echo Adding remote origin...
git remote add origin https://github.com/simon575884/klcrm.git

REM Push to GitHub
echo Pushing to GitHub...
git push -u origin main

echo.
echo ========================================
echo Done! Check GitHub repository.
echo ========================================
pause
