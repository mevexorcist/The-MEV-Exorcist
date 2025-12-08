# Render Deployment - Perbaikan Konfigurasi

## Masalah yang Ditemukan

Dari screenshot, ada kesalahan konfigurasi di Render:

### ❌ Konfigurasi Salah (Sekarang)

**Root Directory:** `backend`
**Build Command:** `backend/ $ npm install && npm run build`
**Start Command:** `backend/ $ npm start`

Ini salah karena Render sudah berada di direktori `backend/`, jadi tidak perlu prefix `backend/` lagi.

---

## ✅ Konfigurasi yang Benar

### Opsi 1: Dengan Root Directory (RECOMMENDED)

**Root Directory:** `backend`
**Build Command:** `npm install && npm run build`
**Start Command:** `npm start`

### Opsi 2: Tanpa Root Directory

**Root Directory:** (kosongkan)
**Build Command:** `cd backend && npm install && npm run build`
**Start Command:** `cd backend && npm start`

---

## Langkah Perbaikan di Render

1. **Buka Service Settings**
   - Klik service Anda di Render dashboard
   - Pilih tab "Settings"

2. **Edit Build & Deploy Settings**
   - Scroll ke bagian "Build & Deploy"
   - Klik "Edit" atau ubah langsung

3. **Perbaiki Commands**
   
   **Jika Root Directory = `backend`:**
   ```
   Build Command: npm install && npm run build
   Start Command: npm start
   ```
   
   **Jika Root Directory kosong:**
   ```
   Root Directory: (hapus/kosongkan)
   Build Command: cd backend && npm install && npm run build
   Start Command: cd backend && npm start
   ```

4. **Verifikasi Environment Variables**
   
   Pastikan semua environment variables sudah diset:
   - ✅ `ALCHEMY_WSS_URL` (harus diisi dengan API key Alchemy Anda)
   - ✅ `UNISWAP_V3_ROUTER` = `0xE592427A0AEce92De3Edee1F18E0157C05861564`
   - ✅ `RISK_THRESHOLD_ETH` = `0.1`
   - ✅ `NODE_ENV` = `production`
   - ⚠️ `PORT` - HAPUS atau kosongkan (Render auto-assign)

5. **Verifikasi Health Check**
   
   **Health Check Path:** `/health`
   
   Ini sudah benar di screenshot Anda ✅

6. **Save dan Redeploy**
   - Klik "Save Changes"
   - Render akan otomatis redeploy
   - Tunggu 2-3 menit

---

## Verifikasi Deployment Berhasil

### 1. Cek Logs
Setelah deploy, cek logs untuk melihat:

```
=== MEV EXORCIST BACKEND ===
Configuration:
  Environment: production
  WebSocket URL: wss://eth-sepolia.g.alchemy.com/v2/...
  Uniswap V3 Router: 0xE592427A0AEce92De3Edee1F18E0157C05861564
  Server Port: 10000
  Risk Threshold: 0.1 ETH

✓ Transaction broadcaster started
✓ Connected to Alchemy WebSocket
✓ Subscribed to pending transactions

🔍 Monitoring mempool for MEV targets...
```

### 2. Test Health Check
```bash
curl https://your-app.onrender.com/health
```

Expected response:
```json
{"status":"ok","connections":0,"uptime":123.456}
```

### 3. Cek Status
Di Render dashboard, status harus "Live" dengan warna hijau.

---

## Troubleshooting Umum

### Error: "Build failed"

**Penyebab:** Command path salah atau dependencies tidak terinstall

**Solusi:**
1. Pastikan Root Directory benar
2. Pastikan Build Command tidak ada prefix `backend/` jika Root Directory sudah `backend`
3. Cek logs untuk error spesifik

### Error: "Health check failed"

**Penyebab:** 
- Server tidak start dengan benar
- Health check path salah
- Port tidak sesuai

**Solusi:**
1. Pastikan Health Check Path = `/health`
2. Hapus environment variable `PORT` (biarkan Render yang assign)
3. Cek logs untuk error saat startup

### Error: "Failed to connect to Alchemy"

**Penyebab:** `ALCHEMY_WSS_URL` tidak valid atau tidak diset

**Solusi:**
1. Verifikasi `ALCHEMY_WSS_URL` di Environment Variables
2. Pastikan format: `wss://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY`
3. Pastikan API key valid di Alchemy dashboard
4. Pastikan WebSocket access enabled di Alchemy

### Error: "Module not found"

**Penyebab:** Dependencies tidak terinstall atau TypeScript tidak di-compile

**Solusi:**
1. Pastikan Build Command include `npm install`
2. Pastikan Build Command include `npm run build`
3. Cek `package.json` untuk script `build` dan `start`

---

## Konfigurasi Lengkap yang Benar

### Service Settings

```
Name: mev-exorcist-backend
Environment: Node
Region: Singapore (Southeast Asia)
Branch: main
Root Directory: backend

Build Command: npm install && npm run build
Start Command: npm start

Auto-Deploy: Yes
```

### Environment Variables

```
ALCHEMY_WSS_URL=wss://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY_HERE
UNISWAP_V3_ROUTER=0xE592427A0AEce92De3Edee1F18E0157C05861564
RISK_THRESHOLD_ETH=0.1
NODE_ENV=production
```

**JANGAN set PORT** - Render akan otomatis assign port

### Health Check

```
Health Check Path: /health
Health Check Timeout: 100
```

### Instance Type

Untuk testing, gunakan **Free** tier (512 MB RAM, 0.1 CPU)
Untuk production, upgrade ke **Starter** ($7/month, 512 MB RAM, 0.5 CPU)

---

## Checklist Sebelum Deploy

- [ ] Root Directory = `backend` ATAU kosong dengan `cd backend` di commands
- [ ] Build Command tidak ada prefix `backend/` jika Root Directory sudah diset
- [ ] Start Command tidak ada prefix `backend/` jika Root Directory sudah diset
- [ ] `ALCHEMY_WSS_URL` sudah diisi dengan API key yang valid
- [ ] `UNISWAP_V3_ROUTER` = `0xE592427A0AEce92De3Edee1F18E0157C05861564`
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` tidak diset (biarkan kosong)
- [ ] Health Check Path = `/health`
- [ ] Branch = `main` atau `master` (sesuai repository Anda)

---

## Setelah Berhasil Deploy

1. **Catat URL Backend**
   ```
   https://mev-exorcist-backend.onrender.com
   ```

2. **Test dengan Verification Script**
   ```bash
   node backend/scripts/verify-deployment.js https://mev-exorcist-backend.onrender.com
   ```

3. **Update Frontend**
   - Edit `frontend/.env.local`
   - Set `NEXT_PUBLIC_BACKEND_URL=https://mev-exorcist-backend.onrender.com`

4. **Deploy Frontend ke Vercel**
   - Lihat task 18 di tasks.md

---

## Bantuan Lebih Lanjut

Jika masih ada masalah:
1. Screenshot error message dari Render logs
2. Screenshot konfigurasi Build & Deploy settings
3. Screenshot Environment Variables
4. Bagikan error message yang muncul
