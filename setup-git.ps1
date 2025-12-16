# Git Setup Script for CyberNinjas Web
# Run this script in PowerShell after restarting your terminal

Write-Host "🚀 Setting up Git repository..." -ForegroundColor Cyan

# Initialize git repository
Write-Host "`n1. Initializing git repository..." -ForegroundColor Yellow
git init

# Add remote repository
Write-Host "`n2. Adding GitHub remote..." -ForegroundColor Yellow
git remote add origin https://github.com/Wo0h0o/cyberninjas-web.git

# Check status
Write-Host "`n3. Checking repository status..." -ForegroundColor Yellow
git status

# Stage all files (respecting .gitignore)
Write-Host "`n4. Staging files..." -ForegroundColor Yellow
git add .

# Show what will be committed
Write-Host "`n5. Files to be committed:" -ForegroundColor Yellow
git status

Write-Host "`n✅ Repository initialized!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "  1. Review the files listed above" -ForegroundColor White
Write-Host "  2. Run: git commit -m 'Initial commit with Supabase login fix'" -ForegroundColor White
Write-Host "  3. Run: git push -u origin main" -ForegroundColor White
Write-Host "`n⚠️  Note: You may need to pull first if the remote has existing files" -ForegroundColor Yellow
