# 🔄 Guide: Switch dari Sepolia ke Base Chain

## 📋 Overview

Guide ini akan membantu kamu switch MEV Exorcist dari **Ethereum Sepolia testnet** ke **Base mainnet**.

**Keuntungan Base:**
- ✅ Volume transaksi lebih tinggi
- ✅ Lebih banyak Uniswap V3 swaps
- ✅ Real MEV opportunities
- ✅ Faster block times (~2 seconds)

---

## 🎯 Step-by-Step Instructions

### Step 1: Setup Alchemy untuk Base

1. **Buka Alchemy Dashboard:**
   - https://dashboard.alchemy.com
   - Login dengan akun kamu

2. **Create New App atau Edit Existing:**
   - Klik "Create App" atau pilih app yang ada
   - **Name:** MEV Exorcist Base (atau nama lain)
   - **Network:** Base
   - **Chain:** Base Mainnet

3. **Get WebSocket URL:**
   - Klik pada app kamu
   - Klik "API Key" atau "View Key"
   - Copy **full API key**
   - Format WebSocket URL: `wss://base-mainnet.g.alchemy.com/v2/VxzNAdEeOM4JedsLKlxqE`

**Example:**
```
wss://base-mainnet.g.alchemy.com/v2/AbCdEfGh1234567890IjKlMnOpQrStUvWx
```

---

### Step 2: Update Railway Environment Variables (Backend)

1. **Buka Railway Dashboard:**
   - https://railway.app/dashboard
   - Pilih project: **The-MEV-Exorcist**
   - Klik service: **backend**

2. **Go to Variables Tab:**
   - Klik "Variables" di sidebar

3. **Update Variables:**

| Variable Name | New Value |
|--------------|-----------|
| `ALCHEMY_WSS_URL` | `wss://base-mainnet.g.alchemy.com/v2/YOUR_BASE_API_KEY` |
| `UNISWAP_V3_ROUTER` | `0x2626664c2603336E57B271c5C0b26F421741e481` |
| `PORT` | `3001` (tetap sama) |
| `RISK_THRESHOLD_ETH` | `0.1` (tetap sama) |
| `NODE_ENV` | `production` (tetap sama) |

**IMPORTANT:** Ganti `YOUR_BASE_API_KEY` dengan API key Base yang baru!

4. **Save Changes:**
   - Railway akan otomatis redeploy
   - Tunggu 1-2 menit

---

### Step 3: Update Vercel Environment Variables (Frontend)

1. **Buka Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Pilih project: **mev-exorcist** (atau nama project kamu)

2. **Go to Settings → Environment Variables:**
   - Klik "Settings" di top menu
   - Klik "Environment Variables" di sidebar

3. **Update Variable:**

| Variable Name | New Value |
|--------------|-----------|
| `NEXT_PUBLIC_ETHERSCAN_BASE` | `https://basescan.org` |
| `NEXT_PUBLIC_BACKEND_URL` | `https://the-mev-exorcist-production.up.railway.app` (tetap sama) |

4. **Save and Redeploy:**
   - Klik "Save"
   - Go to "Deployments" tab
   - Klik "..." pada deployment terbaru
   - Klik "Redeploy"

---

### Step 4: Deploy Frontend Code Changes

Frontend code sudah saya update (text "Sepolia testnet" → "Base mainnet").

**Deploy changes:**

```bash
cd frontend
git add .
git commit -m "Switch to Base mainnet"
git push
```

Vercel akan otomatis redeploy setelah push.

**Atau manual redeploy di Vercel:**
1. Go to Vercel Dashboard
2. Klik project kamu
3. Go to "Deployments" tab
4. Klik "Redeploy" pada deployment terbaru

---

### Step 5: Verify Deployment

**1. Check Railway Logs (Backend):**

1. Railway Dashboard → Backend service
2. Go to "Deployments" tab
3. Klik deployment terbaru
4. Check logs untuk:
   - ✅ `=== MEV EXORCIST BACKEND ===`
   - ✅ `WebSocket URL: wss://base-mainnet.g.alchemy.com...`
   - ✅ `✓ Connected to Alchemy WebSocket`
   - ✅ `✓ Subscribed to pending transactions`
   - ✅ `🔍 Monitoring mempool for MEV targets...`

**2. Test Backend Health:**

```bash
curl https://the-mev-exorcist-production.up.railway.app/health
```

Expected response:
```json
{"status":"ok","connections":0,"uptime":123}
```

**3. Check Frontend:**

1. Open: https://mev-exorcist.vercel.app
2. Verify:
   - ✅ Status shows "CONNECTED" (green)
   - ✅ Text shows "Watching for Uniswap V3 swaps on Base mainnet"
   - ✅ Radar is animating

**4. Wait for Transactions:**

Base mainnet has much higher volume than Sepolia, so you should see transactions within **1-5 minutes**.

---

## 📊 Expected Results

**On Base Mainnet:**
- 🚀 **More transactions:** Base has higher DeFi activity
- ⚡ **Faster blocks:** ~2 second block times
- 💰 **Real MEV:** Actual MEV opportunities (not testnet)
- 🎯 **More Uniswap swaps:** Higher trading volume

**Transaction frequency:**
- Sepolia: 1-2 swaps per hour (if lucky)
- Base: 10-50+ swaps per hour (depending on market activity)

---

## 🔧 Troubleshooting

### Problem: Backend still shows Sepolia in logs

**Solution:**
- Make sure you updated `ALCHEMY_WSS_URL` in Railway
- Check that Railway redeployed after variable change
- Restart backend service manually if needed

### Problem: No transactions appearing

**Solution:**
- Wait 5-10 minutes (Base has more volume but still depends on market activity)
- Check Railway logs for errors
- Verify Uniswap V3 Router address is correct: `0x2626664c2603336E57B271c5C0b26F421741e481`

### Problem: Frontend still shows "Sepolia testnet"

**Solution:**
- Make sure frontend code changes were deployed
- Check Vercel deployment logs
- Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache

### Problem: Etherscan links not working

**Solution:**
- Make sure `NEXT_PUBLIC_ETHERSCAN_BASE` is set to `https://basescan.org`
- Redeploy frontend after changing environment variable

---

## 📝 Configuration Summary

### Backend (Railway)

```bash
ALCHEMY_WSS_URL=wss://base-mainnet.g.alchemy.com/v2/YOUR_BASE_API_KEY
UNISWAP_V3_ROUTER=0x2626664c2603336E57B271c5C0b26F421741e481
PORT=3001
RISK_THRESHOLD_ETH=0.1
NODE_ENV=production
```

### Frontend (Vercel)

```bash
NEXT_PUBLIC_BACKEND_URL=https://the-mev-exorcist-production.up.railway.app
NEXT_PUBLIC_ETHERSCAN_BASE=https://basescan.org
```

---

## 🎯 Quick Checklist

Before switching to Base, make sure:

- [ ] Alchemy account has Base app created
- [ ] Base API key copied (full key, ~32 characters)
- [ ] Railway variables updated with Base WebSocket URL
- [ ] Railway variables updated with Base Uniswap V3 Router
- [ ] Railway redeployed successfully
- [ ] Vercel variables updated with Basescan URL
- [ ] Frontend code changes deployed
- [ ] Backend logs show "base-mainnet" in WebSocket URL
- [ ] Backend logs show "Connected to Alchemy WebSocket"
- [ ] Frontend shows "CONNECTED" status
- [ ] Frontend text shows "Base mainnet"

---

## 🚀 Alternative: Base Sepolia (Testnet)

If you want to test on Base testnet first:

**Alchemy WebSocket URL:**
```
wss://base-sepolia.g.alchemy.com/v2/YOUR_API_KEY
```

**Uniswap V3 Router (Base Sepolia):**
- Check if Uniswap V3 is deployed on Base Sepolia
- May not be available yet

**Basescan URL:**
```
https://sepolia.basescan.org
```

**Note:** Base Sepolia may have even lower volume than Ethereum Sepolia.

---

## 📞 Need Help?

If you encounter issues:

1. **Check Railway Logs:**
   - Look for specific error messages
   - Share error messages if you need help

2. **Check Vercel Logs:**
   - Go to Deployments → Click deployment → View logs
   - Look for build or runtime errors

3. **Verify API Keys:**
   - Make sure Base API key is valid
   - Test API key in Alchemy dashboard

4. **Check Network:**
   - Make sure you're using Base Mainnet (not Sepolia)
   - Verify Uniswap V3 Router address is correct

---

**Last Updated:** December 9, 2024  
**Status:** Ready to switch to Base  
**Action Required:** Follow steps above to switch from Sepolia to Base

