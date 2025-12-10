# Script to update Vercel environment variables
# Usage: .\update-vercel-env.ps1 -BackendUrl "https://your-backend.railway.app"

param(
    [Parameter(Mandatory=$true)]
    [string]$BackendUrl
)

Write-Host "🔧 MEV Exorcist - Update Vercel Environment Variables" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Backend URL: $BackendUrl" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Adding environment variables to Vercel..." -ForegroundColor Yellow
Write-Host ""

Set-Location frontend

# Add NEXT_PUBLIC_BACKEND_URL
Write-Host "Adding NEXT_PUBLIC_BACKEND_URL for production..." -ForegroundColor Yellow
$BackendUrl | vercel env add NEXT_PUBLIC_BACKEND_URL production

Write-Host "Adding NEXT_PUBLIC_BACKEND_URL for preview..." -ForegroundColor Yellow
$BackendUrl | vercel env add NEXT_PUBLIC_BACKEND_URL preview

Write-Host "Adding NEXT_PUBLIC_BACKEND_URL for development..." -ForegroundColor Yellow
"http://localhost:3001" | vercel env add NEXT_PUBLIC_BACKEND_URL development

# Add NEXT_PUBLIC_ETHERSCAN_BASE
Write-Host "Adding NEXT_PUBLIC_ETHERSCAN_BASE for production..." -ForegroundColor Yellow
"https://sepolia.etherscan.io" | vercel env add NEXT_PUBLIC_ETHERSCAN_BASE production

Write-Host "Adding NEXT_PUBLIC_ETHERSCAN_BASE for preview..." -ForegroundColor Yellow
"https://sepolia.etherscan.io" | vercel env add NEXT_PUBLIC_ETHERSCAN_BASE preview

Write-Host "Adding NEXT_PUBLIC_ETHERSCAN_BASE for development..." -ForegroundColor Yellow
"https://sepolia.etherscan.io" | vercel env add NEXT_PUBLIC_ETHERSCAN_BASE development

Write-Host ""
Write-Host "✅ Environment variables added successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Redeploying to production..." -ForegroundColor Yellow
vercel --prod

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Your frontend is now connected to: $BackendUrl" -ForegroundColor Cyan
Write-Host "🌐 Visit: https://frontend-e3xkuk5xp-falcora.vercel.app" -ForegroundColor Cyan
Write-Host ""

Set-Location ..
