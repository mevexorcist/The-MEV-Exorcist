# Quick Start: Deploy to Vercel

This is a condensed guide for deploying The MEV Exorcist frontend to Vercel. For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Prerequisites

✅ Backend deployed and running (get the URL)  
✅ Code committed to Git repository  
✅ Vercel account created

## Step 1: Verify Configuration (30 seconds)

```bash
cd frontend
npm run verify-deployment
```

Expected output: ✅ All checks passed!

## Step 2: Deploy to Vercel (2 minutes)

### Option A: Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your repository
4. **Important**: Set root directory to `frontend` (if monorepo)
5. Framework: Next.js (auto-detected)
6. Click "Deploy"

### Option B: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
```

## Step 3: Configure Environment Variables (1 minute)

In Vercel Dashboard → Settings → Environment Variables, add:

| Variable | Value | Environments |
|----------|-------|--------------|
| `NEXT_PUBLIC_BACKEND_URL` | `https://your-backend.railway.app` | All |
| `NEXT_PUBLIC_ETHERSCAN_BASE` | `https://sepolia.etherscan.io` | All |

**Important**: Replace `your-backend.railway.app` with your actual backend URL!

## Step 4: Redeploy (30 seconds)

After adding environment variables:

1. Go to Deployments tab
2. Click "..." on latest deployment
3. Click "Redeploy"

## Step 5: Test (2 minutes)

Visit your Vercel URL (e.g., `https://your-app.vercel.app`)

Quick checks:
- [ ] Page loads (black background, title visible)
- [ ] Open DevTools → Network tab
- [ ] Look for WebSocket connection to backend
- [ ] Status shows "Connected"

## Troubleshooting

**Problem**: "Unable to connect to backend"
```bash
# Check backend is running
curl https://your-backend.railway.app/health

# Should return: {"status":"ok",...}
```

**Problem**: Build fails
```bash
# Test build locally first
npm run build

# Fix any errors, then redeploy
```

**Problem**: Environment variables not working
- Verify variables are prefixed with `NEXT_PUBLIC_`
- Check spelling (case-sensitive)
- Redeploy after adding variables

## Production Checklist

Use this checklist before going live:

- [ ] Preview deployment tested successfully
- [ ] Backend connection verified
- [ ] Tested on Chrome, Firefox, Safari
- [ ] Tested on mobile device
- [ ] Audio works (after user interaction)
- [ ] Transactions display correctly
- [ ] Etherscan links work

## Next Steps

✅ **Deployment complete!**

- Share URL with team
- Enable Vercel Analytics
- Set up error monitoring
- Configure custom domain (optional)

## Need Help?

- 📖 Full guide: [DEPLOYMENT.md](./DEPLOYMENT.md)
- ✅ Checklist: [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)
- 🔧 Vercel Docs: https://vercel.com/docs

## Estimated Total Time

⏱️ **5-10 minutes** from start to deployed application

---

**Pro Tip**: Use the preview deployment URL to test before promoting to production. Vercel creates a unique URL for every push!
