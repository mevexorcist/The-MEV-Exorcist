# 🚀 MEV Exorcist - Panduan Deployment Lengkap

## Status Saat Ini

✅ Backend: Siap untuk deploy  
✅ Frontend: Siap untuk deploy  
✅ Konfigurasi: Lengkap  
✅ Tests: Passing  

---

## Langkah 1: Persiapan Git Repository

### 1.1 Commit Semua Perubahan

```bash
# Tambahkan semua file baru
git add .

# Commit dengan pesan yang jelas
git commit -m "feat: Complete MEV Exorcist implementation with deployment configs"

# Push ke GitHub
git push origin main
```

**Catatan:** Pastikan Anda sudah push ke GitHub karena Vercel akan connect ke repository GitHub Anda.

---

## Langkah 2: Deploy Backend ke Railway/Render

### Option A: Railway (Recommended)

#### 2.1 Buat Akun Railway
1. Kunjungi https://railway.app
2. Sign up dengan GitHub account
3. Authorize Railway untuk akses repository

#### 2.2 Deploy Backend
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Pilih repository `The-MEV-Exorcist`
4. Railway akan auto-detect Node.js project

#### 2.3 Configure Environment Variables
Di Railway Dashboard → Variables, tambahkan:

```bash
ALCHEMY_WSS_URL=wss://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
UNISWAP_V3_ROUTER=0xE592427A0AEce92De3Edee1F18E0157C05861564
PORT=3001
RISK_THRESHOLD_ETH=0.1
NODE_ENV=production
```

**PENTING:** Ganti `YOUR_ALCHEMY_API_KEY` dengan API key Alchemy Anda!

#### 2.4 Set Root Directory
1. Di Settings → Service
2. Set "Root Directory" ke `backend`
3. Set "Start Command" ke `npm start`

#### 2.5 Deploy
1. Click "Deploy"
2. Tunggu build selesai (~2-3 menit)
3. Railway akan memberikan URL, contoh: `https://mev-exorcist-backend.up.railway.app`

#### 2.6 Verify Backend
```bash
# Test health endpoint
curl https://your-backend-url.railway.app/health

# Should return: {"status":"ok","connections":0,"uptime":...}
```

### Option B: Render

#### 2.1 Buat Akun Render
1. Kunjungi https://render.com
2. Sign up dengan GitHub account

#### 2.2 Deploy Backend
1. Click "New +" → "Web Service"
2. Connect GitHub repository
3. Pilih `The-MEV-Exorcist`
4. Configure:
   - **Name:** mev-exorcist-backend
   - **Root Directory:** backend
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

#### 2.3 Configure Environment Variables
Tambahkan di Environment tab:

```bash
ALCHEMY_WSS_URL=wss://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
UNISWAP_V3_ROUTER=0xE592427A0AEce92De3Edee1F18E0157C05861564
PORT=3001
RISK_THRESHOLD_ETH=0.1
NODE_ENV=production
```

#### 2.4 Deploy
1. Click "Create Web Service"
2. Tunggu build selesai (~3-5 menit)
3. Render akan memberikan URL, contoh: `https://mev-exorcist-backend.onrender.com`

---

## Langkah 3: Deploy Frontend ke Vercel

### 3.1 Buat Akun Vercel
1. Kunjungi https://vercel.com
2. Sign up dengan GitHub account
3. Authorize Vercel untuk akses repository

### 3.2 Import Project
1. Click "Add New..." → "Project"
2. Import `The-MEV-Exorcist` repository
3. Vercel akan auto-detect Next.js

### 3.3 Configure Project Settings

**Framework Preset:** Next.js (auto-detected)  
**Root Directory:** `frontend`  
**Build Command:** `npm run build` (auto-detected)  
**Output Directory:** `.next` (auto-detected)

### 3.4 Configure Environment Variables

Di "Environment Variables" section, tambahkan:

| Name | Value | Environments |
|------|-------|--------------|
| `NEXT_PUBLIC_BACKEND_URL` | `https://your-backend-url.railway.app` | Production, Preview, Development |
| `NEXT_PUBLIC_ETHERSCAN_BASE` | `https://sepolia.etherscan.io` | Production, Preview, Development |

**PENTING:** Ganti `your-backend-url.railway.app` dengan URL backend Anda dari Railway/Render!

### 3.5 Deploy
1. Click "Deploy"
2. Tunggu build selesai (~1-2 menit)
3. Vercel akan memberikan URL, contoh: `https://mev-exorcist.vercel.app`

---

## Langkah 4: Verify Deployment

### 4.1 Test Backend

```bash
# Test health endpoint
curl https://your-backend-url.railway.app/health

# Expected response:
# {"status":"ok","connections":0,"uptime":123}
```

### 4.2 Test Frontend

1. Buka URL Vercel Anda di browser
2. Cek DevTools → Console (tidak ada error)
3. Cek DevTools → Network → WS (WebSocket connection)
4. Verify connection status shows "CONNECTED" (green)

### 4.3 Test End-to-End

1. Tunggu beberapa menit untuk transactions muncul
2. Verify transactions appear in stream
3. Click pada transaction untuk test detail card
4. Test audio (click untuk enable)

---

## Langkah 5: Troubleshooting

### Problem: Backend tidak connect ke Alchemy

**Solution:**
1. Check environment variable `ALCHEMY_WSS_URL` di Railway/Render
2. Verify API key valid
3. Check backend logs untuk error messages

### Problem: Frontend tidak connect ke backend

**Solution:**
1. Check environment variable `NEXT_PUBLIC_BACKEND_URL` di Vercel
2. Verify backend URL correct (include https://)
3. Check backend is running (visit /health endpoint)
4. Check CORS settings di backend

### Problem: "Unable to connect to backend"

**Solution:**
1. Verify backend is deployed and running
2. Check backend URL in Vercel environment variables
3. Redeploy frontend after fixing environment variables

### Problem: No transactions appearing

**Solution:**
1. Check backend logs - is it receiving transactions from Alchemy?
2. Verify Alchemy WebSocket connection in backend logs
3. Sepolia testnet may have low volume - wait 5-10 minutes
4. Check backend is filtering correctly (Uniswap V3 Router address)

---

## Langkah 6: Post-Deployment

### 6.1 Enable Monitoring

**Vercel Analytics:**
1. Go to Vercel Dashboard → Your Project → Analytics
2. Enable Analytics
3. Monitor page views, performance

**Backend Monitoring:**
1. Check Railway/Render logs regularly
2. Monitor for errors
3. Check WebSocket connection stability

### 6.2 Custom Domain (Optional)

**Vercel:**
1. Go to Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

**Railway:**
1. Go to Settings → Domains
2. Add custom domain
3. Configure DNS

### 6.3 Set Up Alerts (Optional)

**Vercel:**
- Enable deployment notifications (Slack, Discord, Email)

**Railway/Render:**
- Enable deployment notifications
- Set up uptime monitoring

---

## Checklist Deployment

### Pre-Deployment
- [ ] Code committed to Git
- [ ] Code pushed to GitHub
- [ ] Alchemy API key ready
- [ ] Railway/Render account created
- [ ] Vercel account created

### Backend Deployment
- [ ] Backend deployed to Railway/Render
- [ ] Environment variables configured
- [ ] Health endpoint responding
- [ ] WebSocket connection to Alchemy verified
- [ ] Backend URL noted for frontend config

### Frontend Deployment
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured (with backend URL)
- [ ] Build succeeded
- [ ] Preview deployment tested
- [ ] Production deployment promoted

### Verification
- [ ] Backend health endpoint works
- [ ] Frontend loads without errors
- [ ] WebSocket connection established
- [ ] Connection status shows "CONNECTED"
- [ ] Transactions appear in stream (wait 5-10 min)
- [ ] Detail card works
- [ ] Audio works (after user interaction)
- [ ] Tested on Chrome
- [ ] Tested on mobile (optional)

### Post-Deployment
- [ ] Monitoring enabled
- [ ] Error tracking configured (optional)
- [ ] Custom domain configured (optional)
- [ ] Team notified of URLs

---

## URLs to Save

After deployment, save these URLs:

```
Backend URL: https://_____________________.railway.app
Frontend URL: https://_____________________.vercel.app
Backend Health: https://_____________________.railway.app/health
```

---

## Quick Commands Reference

### Local Development
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

### Verify Deployment Config
```bash
cd frontend
npm run verify-deployment
```

### Test Build Locally
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

### View Logs
```bash
# Railway CLI
railway logs

# Render
# View in dashboard

# Vercel CLI
vercel logs
```

---

## Support

### Documentation
- Backend: `backend/DEPLOYMENT.md`
- Frontend: `frontend/DEPLOYMENT.md`
- Quick Start: `frontend/DEPLOY-QUICKSTART.md`
- Testing: `frontend/TESTING-CHECKLIST.md`

### Platform Docs
- Railway: https://docs.railway.app
- Render: https://render.com/docs
- Vercel: https://vercel.com/docs

---

## Selamat! 🎉

Jika semua langkah di atas berhasil, aplikasi MEV Exorcist Anda sudah live di production!

**Share URLs Anda:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.railway.app`

**Next Steps:**
- Monitor performance
- Gather user feedback
- Iterate and improve

---

**Last Updated:** December 9, 2024  
**Version:** 1.0.0
