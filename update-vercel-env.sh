#!/bin/bash

# Script to update Vercel environment variables
# Usage: ./update-vercel-env.sh <backend-url>

echo "🔧 MEV Exorcist - Update Vercel Environment Variables"
echo "======================================================"
echo ""

# Check if backend URL is provided
if [ -z "$1" ]; then
    echo "❌ Error: Backend URL not provided"
    echo ""
    echo "Usage: ./update-vercel-env.sh <backend-url>"
    echo "Example: ./update-vercel-env.sh https://mev-exorcist-backend.railway.app"
    echo ""
    exit 1
fi

BACKEND_URL=$1

echo "Backend URL: $BACKEND_URL"
echo ""
echo "📝 Adding environment variables to Vercel..."
echo ""

cd frontend

# Add NEXT_PUBLIC_BACKEND_URL
echo "Adding NEXT_PUBLIC_BACKEND_URL for production..."
echo "$BACKEND_URL" | vercel env add NEXT_PUBLIC_BACKEND_URL production

echo "Adding NEXT_PUBLIC_BACKEND_URL for preview..."
echo "$BACKEND_URL" | vercel env add NEXT_PUBLIC_BACKEND_URL preview

echo "Adding NEXT_PUBLIC_BACKEND_URL for development..."
echo "http://localhost:3001" | vercel env add NEXT_PUBLIC_BACKEND_URL development

# Add NEXT_PUBLIC_ETHERSCAN_BASE
echo "Adding NEXT_PUBLIC_ETHERSCAN_BASE for production..."
echo "https://sepolia.etherscan.io" | vercel env add NEXT_PUBLIC_ETHERSCAN_BASE production

echo "Adding NEXT_PUBLIC_ETHERSCAN_BASE for preview..."
echo "https://sepolia.etherscan.io" | vercel env add NEXT_PUBLIC_ETHERSCAN_BASE preview

echo "Adding NEXT_PUBLIC_ETHERSCAN_BASE for development..."
echo "https://sepolia.etherscan.io" | vercel env add NEXT_PUBLIC_ETHERSCAN_BASE development

echo ""
echo "✅ Environment variables added successfully!"
echo ""
echo "🚀 Redeploying to production..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your frontend is now connected to: $BACKEND_URL"
echo "🌐 Visit: https://frontend-e3xkuk5xp-falcora.vercel.app"
echo ""
