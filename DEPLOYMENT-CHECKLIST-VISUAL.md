# 📋 Visual Deployment Checklist

## Pre-Deployment ✅

```
┌─────────────────────────────────────┐
│  PRE-DEPLOYMENT CHECKLIST           │
├─────────────────────────────────────┤
│ [ ] Code committed to Git           │
│ [ ] Code pushed to GitHub           │
│ [ ] Alchemy API key ready           │
│ [ ] Railway account created         │
│ [ ] Vercel account created          │
└─────────────────────────────────────┘
```

---

## Backend Deployment 🔧

```
┌─────────────────────────────────────────────────┐
│  RAILWAY BACKEND DEPLOYMENT                     │
├─────────────────────────────────────────────────┤
│                                                 │
│  Step 1: Create Project                        │
│  [ ] Go to https://railway.app                 │
│  [ ] Sign up with GitHub                       │
│  [ ] Click "New Project"                       │
│  [ ] Select "Deploy from GitHub repo"          │
│  [ ] Choose "The-MEV-Exorcist"                 │
│                                                 │
│  Step 2: Configure                             │
│  [ ] Settings → Root Directory: "backend"      │
│  [ ] Settings → Start Command: "npm start"     │
│                                                 │
│  Step 3: Environment Variables                 │
│  [ ] Add ALCHEMY_WSS_URL                       │
│  [ ] Add UNISWAP_V3_ROUTER                     │
│  [ ] Add PORT=3001                             │
│  [ ] Add RISK_THRESHOLD_ETH=0.1                │
│  [ ] Add NODE_ENV=production                   │
│                                                 │
│  Step 4: Deploy                                │
│  [ ] Click "Deploy"                            │
│  [ ] Wait for build (~2-3 min)                 │
│  [ ] Copy backend URL                          │
│                                                 │
│  Step 5: Verify                                │
│  [ ] Test: curl <backend-url>/health           │
│  [ ] Response: {"status":"ok",...}             │
│                                                 │
└─────────────────────────────────────────────────┘

Backend URL: https://_________________.railway.app
```

---

## Frontend Deployment 🎨

```
┌─────────────────────────────────────────────────┐
│  VERCEL FRONTEND DEPLOYMENT                     │
├─────────────────────────────────────────────────┤
│                                                 │
│  Step 1: Import Project                        │
│  [ ] Go to https://vercel.com                  │
│  [ ] Sign up with GitHub                       │
│  [ ] Click "Add New..." → "Project"            │
│  [ ] Import "The-MEV-Exorcist"                 │
│                                                 │
│  Step 2: Configure                             │
│  [ ] Framework: Next.js (auto-detected)        │
│  [ ] Root Directory: "frontend"                │
│  [ ] Build Command: npm run build              │
│  [ ] Output Directory: .next                   │
│                                                 │
│  Step 3: Environment Variables                 │
│  [ ] Add NEXT_PUBLIC_BACKEND_URL               │
│      Value: <your-backend-url>                 │
│      Environments: All                         │
│  [ ] Add NEXT_PUBLIC_ETHERSCAN_BASE            │
│      Value: https://sepolia.etherscan.io       │
│      Environments: All                         │
│                                                 │
│  Step 4: Deploy                                │
│  [ ] Click "Deploy"                            │
│  [ ] Wait for build (~1-2 min)                 │
│  [ ] Copy frontend URL                         │
│                                                 │
│  Step 5: Verify                                │
│  [ ] Open frontend URL in browser              │
│  [ ] Check: No console errors                  │
│  [ ] Check: Connection status "CONNECTED"      │
│  [ ] Check: WebSocket in Network tab           │
│                                                 │
└─────────────────────────────────────────────────┘

Frontend URL: https://_________________.vercel.app
```

---

## Verification Flow 🔍

```
┌──────────────────────────────────────────────────┐
│  VERIFICATION CHECKLIST                          │
├──────────────────────────────────────────────────┤
│                                                  │
│  Backend Health Check                           │
│  [ ] curl <backend-url>/health                  │
│  [ ] Returns: {"status":"ok","connections":0}   │
│                                                  │
│  Frontend Load Test                             │
│  [ ] Page loads without errors                  │
│  [ ] Title "THE MEV EXORCIST" visible           │
│  [ ] Black background applied                   │
│  [ ] Radar visualization rotating               │
│                                                  │
│  Connection Test                                │
│  [ ] Connection status shows "CONNECTED"        │
│  [ ] Green indicator visible                    │
│  [ ] No error messages                          │
│  [ ] WebSocket connection in DevTools           │
│                                                  │
│  Transaction Test (Wait 5-10 minutes)           │
│  [ ] Transactions appear in stream              │
│  [ ] LOW risk: green styling                    │
│  [ ] HIGH risk: red styling + pulsing border    │
│  [ ] Click transaction → detail card appears    │
│                                                  │
│  Audio Test                                     │
│  [ ] Click to enable audio                      │
│  [ ] Tick sound on LOW risk transaction         │
│  [ ] Siren sound on HIGH risk transaction       │
│                                                  │
│  Radar Test                                     │
│  [ ] Normal state: slow rotation, green         │
│  [ ] Alert state: fast rotation, red            │
│  [ ] Alert triggered by HIGH risk transaction   │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## Deployment Status 📊

```
┌─────────────────────────────────────────────────┐
│  DEPLOYMENT STATUS TRACKER                      │
├─────────────────────────────────────────────────┤
│                                                 │
│  ⬜ Pre-Deployment Complete                     │
│  ⬜ Backend Deployed                            │
│  ⬜ Frontend Deployed                           │
│  ⬜ Backend Verified                            │
│  ⬜ Frontend Verified                           │
│  ⬜ End-to-End Tested                           │
│  ⬜ Production Ready                            │
│                                                 │
│  When all boxes checked: ✅ DEPLOYMENT COMPLETE │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Quick Reference 📝

```
┌─────────────────────────────────────────────────┐
│  IMPORTANT URLS                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  Backend URL:                                   │
│  https://________________________.railway.app   │
│                                                 │
│  Frontend URL:                                  │
│  https://________________________.vercel.app    │
│                                                 │
│  Health Endpoint:                               │
│  https://________________________.railway.app   │
│         /health                                 │
│                                                 │
│  Alchemy Dashboard:                             │
│  https://dashboard.alchemy.com                  │
│                                                 │
│  Railway Dashboard:                             │
│  https://railway.app/dashboard                  │
│                                                 │
│  Vercel Dashboard:                              │
│  https://vercel.com/dashboard                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Troubleshooting Guide 🆘

```
┌─────────────────────────────────────────────────┐
│  COMMON ISSUES & SOLUTIONS                      │
├─────────────────────────────────────────────────┤
│                                                 │
│  ❌ "Unable to connect to backend"              │
│  ✅ Check NEXT_PUBLIC_BACKEND_URL in Vercel     │
│  ✅ Verify backend is running (/health)         │
│  ✅ Redeploy frontend after fixing              │
│                                                 │
│  ❌ Backend not connecting to Alchemy           │
│  ✅ Check ALCHEMY_WSS_URL in Railway            │
│  ✅ Verify API key is valid                     │
│  ✅ Check backend logs for errors               │
│                                                 │
│  ❌ No transactions appearing                   │
│  ✅ Wait 5-10 minutes (low testnet volume)      │
│  ✅ Check backend logs for Alchemy connection   │
│  ✅ Verify Uniswap V3 Router address correct    │
│                                                 │
│  ❌ Audio not working                           │
│  ✅ Click page to enable audio (required)       │
│  ✅ Check browser audio permissions             │
│  ✅ Test on different browser                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Success Indicators 🎉

```
┌─────────────────────────────────────────────────┐
│  YOU'RE LIVE WHEN YOU SEE:                      │
├─────────────────────────────────────────────────┤
│                                                 │
│  ✅ Green "CONNECTED" status                    │
│  ✅ Radar rotating smoothly                     │
│  ✅ Transactions appearing in stream            │
│  ✅ Detail cards opening on click               │
│  ✅ Audio playing on transactions               │
│  ✅ No console errors                           │
│  ✅ WebSocket connection stable                 │
│                                                 │
│  🎊 CONGRATULATIONS! MEV EXORCIST IS LIVE! 🎊   │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Next Steps 🚀

```
┌─────────────────────────────────────────────────┐
│  POST-DEPLOYMENT TASKS                          │
├─────────────────────────────────────────────────┤
│                                                 │
│  Immediate (Today)                              │
│  [ ] Share URLs with team                       │
│  [ ] Test on multiple browsers                  │
│  [ ] Test on mobile device                      │
│  [ ] Monitor for errors                         │
│                                                 │
│  This Week                                      │
│  [ ] Enable Vercel Analytics                    │
│  [ ] Set up error monitoring (Sentry)           │
│  [ ] Configure custom domain (optional)         │
│  [ ] Gather user feedback                       │
│                                                 │
│  This Month                                     │
│  [ ] Review performance metrics                 │
│  [ ] Optimize based on usage data               │
│  [ ] Plan feature improvements                  │
│  [ ] Update documentation                       │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

**Print this checklist and check off items as you complete them!** ✅

**Estimated Total Time:** 15-20 minutes

**Good luck with your deployment!** 🚀
