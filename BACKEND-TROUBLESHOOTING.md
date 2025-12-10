# 🔧 Backend Troubleshooting - Error 502

## ⚠️ Current Issue

Backend URL: `https://the-mev-exorcist-production.up.railway.app`

**Error:** 502 - Application failed to respond

**Meaning:** Backend tidak merespons, kemungkinan:
1. Backend sedang starting (tunggu 1-2 menit)
2. Backend crash saat startup
3. Environment variables tidak lengkap
4. Port configuration salah

---

## 🔍 Diagnosis Steps

### Step 1: Check Railway Logs

1. **Go to Railway Dashboard:**
   https://railway.app/dashboard

2. **Select your project:** `The-MEV-Exorcist`

3. **Click on backend service**

4. **View Logs** - Look for:
   - ✅ "Server listening on port 3001"
   - ✅ "Connected to Alchemy"
   - ❌ Error messages
   - ❌ Crash logs

### Step 2: Verify Environment Variables

Check these are set in Railway:

```
ALCHEMY_WSS_URL=wss://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
UNISWAP_V3_ROUTER=0xE592427A0AEce92De3Edee1F18E0157C05861564
PORT=3001
RISK_THRESHOLD_ETH=0.1
NODE_ENV=production
```

**Common Issues:**
- ❌ Missing `ALCHEMY_WSS_URL`
- ❌ Invalid Alchemy API key
- ❌ Wrong PORT value

### Step 3: Check Build Logs

In Railway:
1. Go to Deployments tab
2. Click latest deployment
3. Check build logs for errors

**Look for:**
- ✅ "Build succeeded"
- ✅ "npm install" completed
- ❌ TypeScript errors
- ❌ Missing dependencies

---

## 🛠️ Common Fixes

### Fix 1: Backend Still Starting

**Wait 1-2 minutes**, then test again:

```bash
curl https://the-mev-exorcist-production.up.railway.app/health
```

Expected response:
```json
{"status":"ok","connections":0,"uptime":123}
```

### Fix 2: Missing Environment Variables

1. Go to Railway → Your Project → Variables
2. Add missing variables
3. Redeploy (Railway will auto-redeploy)

### Fix 3: Port Configuration

Railway automatically assigns PORT. Make sure backend code uses:

```typescript
const PORT = process.env.PORT || 3001;
```

Check `backend/src/index.ts` line where server starts.

### Fix 4: Alchemy Connection Issue

**Test Alchemy API Key:**
1. Go to https://dashboard.alchemy.com
2. Check API key is valid
3. Verify it's for Sepolia network
4. Copy correct WebSocket URL

**Format should be:**
```
wss://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
```

### Fix 5: Restart Backend

In Railway:
1. Go to your backend service
2. Click "..." menu
3. Click "Restart"
4. Wait 1-2 minutes
5. Test health endpoint again

---

## 🧪 Testing Backend

### Test 1: Health Endpoint

```bash
curl https://the-mev-exorcist-production.up.railway.app/health
```

**Expected:**
```json
{"status":"ok","connections":0,"uptime":123}
```

**If 502:** Backend not responding - check logs

**If 404:** Wrong endpoint - verify `/health` exists

**If timeout:** Network issue or backend down

### Test 2: WebSocket Connection

```bash
# Install wscat if needed
npm install -g wscat

# Test WebSocket
wscat -c wss://the-mev-exorcist-production.up.railway.app
```

**Expected:** Connection established

**If fails:** Backend WebSocket not working

---

## 📋 Checklist

Go through this checklist:

- [ ] Railway dashboard accessible
- [ ] Backend service visible in Railway
- [ ] Latest deployment shows "Success"
- [ ] Build logs show no errors
- [ ] All environment variables set
- [ ] `ALCHEMY_WSS_URL` is correct format
- [ ] Alchemy API key is valid
- [ ] Backend logs show "Server listening"
- [ ] Backend logs show "Connected to Alchemy"
- [ ] No error messages in logs
- [ ] Health endpoint responds
- [ ] WebSocket connection works

---

## 🆘 If Still Not Working

### Option 1: Check Railway Logs

Most issues show up in logs. Look for:
- Connection errors
- Missing environment variables
- Port binding errors
- Alchemy connection failures

### Option 2: Redeploy Backend

Sometimes a fresh deploy fixes issues:

1. In Railway, go to Deployments
2. Click "..." on latest deployment
3. Click "Redeploy"
4. Wait for completion
5. Test health endpoint

### Option 3: Check Backend Code

Verify `backend/src/index.ts`:

```typescript
// Should have health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    connections: io.engine.clientsCount,
    uptime: process.uptime()
  });
});

// Should use PORT from env
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
```

### Option 4: Test Locally

Test backend locally to verify it works:

```bash
cd backend

# Set environment variables
$env:ALCHEMY_WSS_URL="wss://eth-sepolia.g.alchemy.com/v2/YOUR_KEY"
$env:UNISWAP_V3_ROUTER="0xE592427A0AEce92De3Edee1F18E0157C05861564"
$env:PORT="3001"

# Run backend
npm run dev

# Test in another terminal
curl http://localhost:3001/health
```

If works locally but not on Railway → deployment issue

If doesn't work locally → code issue

---

## ✅ Success Indicators

You'll know backend is working when:

1. ✅ Health endpoint returns `{"status":"ok",...}`
2. ✅ Railway logs show "Server listening on port 3001"
3. ✅ Railway logs show "Connected to Alchemy"
4. ✅ No error messages in logs
5. ✅ Frontend connects (status shows "CONNECTED")

---

## 📞 Next Steps

### Once Backend is Fixed:

1. **Test health endpoint:**
   ```bash
   curl https://the-mev-exorcist-production.up.railway.app/health
   ```

2. **Test frontend:**
   - Open: https://frontend-kd88jpvtp-falcora.vercel.app
   - Check: Connection status "CONNECTED" (green)
   - Wait: 5-10 minutes for transactions

3. **Verify end-to-end:**
   - Transactions appear in stream
   - Detail cards work
   - Audio plays
   - Radar animates

---

## 💡 Pro Tips

1. **Check logs first** - 90% of issues show in logs
2. **Verify env vars** - Missing vars = common issue
3. **Test Alchemy key** - Invalid key = no connection
4. **Be patient** - Sepolia testnet is slow
5. **Restart if needed** - Sometimes fixes weird issues

---

## 📚 Resources

- **Railway Docs:** https://docs.railway.app
- **Alchemy Dashboard:** https://dashboard.alchemy.com
- **Backend Deployment Guide:** `backend/DEPLOYMENT.md`
- **Railway Troubleshooting:** `backend/RENDER-FIX.md`

---

**Current Status:**
- ✅ Frontend deployed and configured
- ⚠️ Backend returning 502 error
- ⏳ Need to troubleshoot backend

**Action:** Check Railway logs and environment variables
