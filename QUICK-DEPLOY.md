# ⚡ Quick Deploy Reference

## 🎯 Langkah Cepat (15 menit)

### 1️⃣ Pastikan Git Push Selesai
```bash
git status
# Jika masih ada changes, push lagi:
git push origin main
```

### 2️⃣ Deploy Backend (5 menit)

**Railway (Recommended):**
1. 🌐 https://railway.app → Sign up dengan GitHub
2. ➕ New Project → Deploy from GitHub repo
3. 📁 Pilih `The-MEV-Exorcist`
4. ⚙️ Settings → Root Directory: `backend`
5. 🔐 Variables → Tambahkan:
   ```
   ALCHEMY_WSS_URL=wss://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
   UNISWAP_V3_ROUTER=0xE592427A0AEce92De3Edee1F18E0157C05861564
   PORT=3001
   RISK_THRESHOLD_ETH=0.1
   NODE_ENV=production
   ```
6. 🚀 Deploy
7. 📋 Copy URL backend Anda

**Test Backend:**
```bash
curl https://your-backend.railway.app/health
# Should return: {"status":"ok",...}
```

### 3️⃣ Deploy Frontend (5 menit)

**Vercel:**
1. 🌐 https://vercel.com → Sign up dengan GitHub
2. ➕ Add New Project → Import `The-MEV-Exorcist`
3. ⚙️ Root Directory: `frontend`
4. 🔐 Environment Variables:
   ```
   NEXT_PUBLIC_BACKEND_URL=https://your-backend.railway.app
   NEXT_PUBLIC_ETHERSCAN_BASE=https://sepolia.etherscan.io
   ```
   (Pilih: Production, Preview, Development)
5. 🚀 Deploy
6. 📋 Copy URL frontend Anda

### 4️⃣ Verify (2 menit)

1. ✅ Buka frontend URL di browser
2. ✅ Check connection status: "CONNECTED" (green)
3. ✅ Open DevTools → Network → WS (WebSocket connected)
4. ✅ Tunggu 5-10 menit untuk transactions muncul

---

## 🔑 Yang Anda Butuhkan

- [ ] GitHub account
- [ ] Alchemy API key (https://www.alchemy.com)
- [ ] Railway account (https://railway.app)
- [ ] Vercel account (https://vercel.com)

---

## 📝 URLs Anda

Setelah deploy, simpan URLs ini:

```
Backend:  https://________________________.railway.app
Frontend: https://________________________.vercel.app
Health:   https://________________________.railway.app/health
```

---

## 🆘 Troubleshooting Cepat

### Backend tidak connect ke Alchemy
- Check `ALCHEMY_WSS_URL` di Railway environment variables
- Verify API key valid

### Frontend tidak connect ke backend
- Check `NEXT_PUBLIC_BACKEND_URL` di Vercel
- Pastikan URL backend benar (include https://)
- Redeploy frontend setelah fix

### No transactions
- Tunggu 5-10 menit (Sepolia testnet low volume)
- Check backend logs di Railway dashboard

---

## 📚 Dokumentasi Lengkap

- **Panduan Lengkap:** `DEPLOYMENT-GUIDE.md`
- **Quick Start:** `frontend/DEPLOY-QUICKSTART.md`
- **Checklist:** `frontend/DEPLOYMENT-CHECKLIST.md`
- **Production Ready:** `PRODUCTION-READINESS.md`

---

## ✅ Selesai!

Jika semua langkah berhasil:
- ✅ Backend deployed dan running
- ✅ Frontend deployed dan connected
- ✅ Transactions mulai muncul
- 🎉 **MEV Exorcist LIVE!**

Share URL frontend Anda dan enjoy! 🚀
