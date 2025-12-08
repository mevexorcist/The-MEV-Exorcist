# Backend Deployment Checklist

Use this checklist to ensure a successful deployment of the MEV Exorcist backend.

## Pre-Deployment

- [ ] **Obtain Alchemy API Key**
  - Sign up at [alchemy.com](https://www.alchemy.com/)
  - Create a new app for Ethereum Sepolia testnet
  - Enable WebSocket access
  - Copy the WebSocket URL (starts with `wss://`)

- [ ] **Choose Deployment Platform**
  - [ ] Railway (recommended for simplicity)
  - [ ] Render (recommended for free tier)
  - [ ] Docker-based (AWS, GCP, Azure, DigitalOcean)

- [ ] **Test Locally**
  ```bash
  cd backend
  npm install
  cp .env.example .env
  # Edit .env with your Alchemy API key
  npm run build
  npm start
  ```
  - [ ] Verify health check: `curl http://localhost:3001/health`
  - [ ] Check logs for successful connection to Alchemy

## Deployment Steps

### Railway Deployment

- [ ] **Create Railway Account**
  - Visit [railway.app](https://railway.app)
  - Sign up with GitHub

- [ ] **Create New Project**
  - Click "New Project"
  - Select "Deploy from GitHub repo"
  - Choose your repository
  - Set root directory to `backend`

- [ ] **Configure Environment Variables**
  - [ ] `ALCHEMY_WSS_URL` = `wss://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY`
  - [ ] `UNISWAP_V3_ROUTER` = `0xE592427A0AEce92De3Edee1F18E0157C05861564`
  - [ ] `RISK_THRESHOLD_ETH` = `0.1`
  - [ ] `NODE_ENV` = `production`
  - [ ] Leave `PORT` empty (Railway auto-assigns)

- [ ] **Deploy**
  - Railway will automatically build and deploy
  - Wait for deployment to complete (~2-3 minutes)

- [ ] **Note Public URL**
  - Copy the public URL from Railway dashboard
  - Format: `https://your-app.railway.app`

### Render Deployment

- [ ] **Create Render Account**
  - Visit [render.com](https://render.com)
  - Sign up with GitHub

- [ ] **Create New Web Service**
  - Click "New +" → "Web Service"
  - Connect your GitHub repository
  - Select the repository

- [ ] **Configure Service**
  - [ ] Name: `mev-exorcist-backend`
  - [ ] Region: Choose closest to your users
  - [ ] Branch: `main`
  - [ ] Root Directory: `backend`
  - [ ] Environment: `Node`
  - [ ] Build Command: `npm install && npm run build`
  - [ ] Start Command: `npm start`

- [ ] **Configure Environment Variables**
  - [ ] `ALCHEMY_WSS_URL` = `wss://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY`
  - [ ] `UNISWAP_V3_ROUTER` = `0xE592427A0AEce92De3Edee1F18E0157C05861564`
  - [ ] `RISK_THRESHOLD_ETH` = `0.1`
  - [ ] `NODE_ENV` = `production`
  - [ ] Leave `PORT` empty (Render auto-assigns)

- [ ] **Configure Health Check**
  - [ ] Health Check Path: `/health`
  - [ ] Health Check Timeout: 100 seconds

- [ ] **Deploy**
  - Click "Create Web Service"
  - Wait for deployment to complete (~3-5 minutes)

- [ ] **Note Public URL**
  - Copy the public URL from Render dashboard
  - Format: `https://your-app.onrender.com`

### Docker Deployment

- [ ] **Build Docker Image**
  ```bash
  cd backend
  docker build -t mev-exorcist-backend .
  ```

- [ ] **Test Docker Image Locally**
  ```bash
  docker run -p 3001:3001 \
    -e ALCHEMY_WSS_URL="wss://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY" \
    -e UNISWAP_V3_ROUTER="0xE592427A0AEce92De3Edee1F18E0157C05861564" \
    -e RISK_THRESHOLD_ETH="0.1" \
    -e NODE_ENV="production" \
    mev-exorcist-backend
  ```
  - [ ] Verify health check: `curl http://localhost:3001/health`

- [ ] **Push to Container Registry**
  - [ ] Tag image: `docker tag mev-exorcist-backend your-registry/mev-exorcist-backend`
  - [ ] Push image: `docker push your-registry/mev-exorcist-backend`

- [ ] **Deploy to Platform**
  - Follow platform-specific instructions
  - Configure environment variables
  - Set health check endpoint to `/health`

## Post-Deployment Verification

- [ ] **Test Health Check Endpoint**
  ```bash
  curl https://your-backend-url.com/health
  ```
  - [ ] Verify response: `{"status":"ok","connections":0,"uptime":...}`

- [ ] **Run Verification Script**
  ```bash
  node scripts/verify-deployment.js https://your-backend-url.com
  ```
  - [ ] All tests should pass

- [ ] **Check Deployment Logs**
  - [ ] Look for: `✓ Connected to Alchemy WebSocket`
  - [ ] Look for: `✓ Subscribed to pending transactions`
  - [ ] Look for: `🔍 Monitoring mempool for MEV targets...`
  - [ ] No error messages in logs

- [ ] **Monitor for Transactions**
  - [ ] Wait 1-2 minutes
  - [ ] Check logs for transaction detections
  - [ ] Format: `✓ LOW | 0.0500 ETH | exactInputSingle | 0x...`
  - [ ] Note: Sepolia testnet may have low activity

- [ ] **Test WebSocket Connection**
  - [ ] Use frontend locally to connect to deployed backend
  - [ ] Update `.env.local`: `NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.com`
  - [ ] Start frontend: `npm run dev`
  - [ ] Verify connection in browser console

## Configuration Verification

- [ ] **Environment Variables Set Correctly**
  - [ ] `ALCHEMY_WSS_URL` starts with `wss://`
  - [ ] `ALCHEMY_WSS_URL` includes API key
  - [ ] `UNISWAP_V3_ROUTER` is correct Sepolia address
  - [ ] `NODE_ENV` is set to `production`

- [ ] **Platform Configuration**
  - [ ] Health check endpoint configured: `/health`
  - [ ] Auto-deploy enabled (optional)
  - [ ] Restart policy configured (on failure)

## Monitoring Setup

- [ ] **Set Up Uptime Monitoring**
  - [ ] Use UptimeRobot, Pingdom, or similar
  - [ ] Monitor health check endpoint
  - [ ] Set alert threshold: 2 failures in 5 minutes

- [ ] **Configure Alerts**
  - [ ] Email alerts for downtime
  - [ ] Slack/Discord webhook (optional)

- [ ] **Monitor Logs**
  - [ ] Check logs daily for errors
  - [ ] Monitor WebSocket connection stability
  - [ ] Track transaction detection rate

- [ ] **Monitor Alchemy Usage**
  - [ ] Check Alchemy dashboard for API usage
  - [ ] Ensure within free tier limits (300M compute units/month)
  - [ ] Set up usage alerts

## Troubleshooting

If deployment fails, check:

- [ ] **Build Errors**
  - [ ] Review build logs in platform dashboard
  - [ ] Verify `npm run build` works locally
  - [ ] Check TypeScript compilation errors

- [ ] **Connection Errors**
  - [ ] Verify `ALCHEMY_WSS_URL` is correct
  - [ ] Check Alchemy API key is valid
  - [ ] Ensure WebSocket access is enabled in Alchemy

- [ ] **Health Check Failures**
  - [ ] Verify health check path is `/health`
  - [ ] Check if server is starting correctly
  - [ ] Review startup logs for errors

- [ ] **No Transactions Detected**
  - [ ] Verify using Sepolia testnet (not mainnet)
  - [ ] Check Sepolia has active Uniswap V3 transactions
  - [ ] Verify `UNISWAP_V3_ROUTER` address is correct

## Next Steps

After successful backend deployment:

- [ ] **Save Backend URL**
  - [ ] Document the public URL
  - [ ] Share with team members

- [ ] **Update Frontend Configuration**
  - [ ] Set `NEXT_PUBLIC_BACKEND_URL` in frontend
  - [ ] Deploy frontend to Vercel (see frontend deployment guide)

- [ ] **Test End-to-End**
  - [ ] Connect frontend to deployed backend
  - [ ] Verify transactions appear in UI
  - [ ] Test audio feedback
  - [ ] Test radar visualization
  - [ ] Test detail card display

- [ ] **Documentation**
  - [ ] Document deployment date and configuration
  - [ ] Note any issues encountered and solutions
  - [ ] Update team documentation with URLs

## Rollback Plan

If deployment has critical issues:

- [ ] **Railway/Render**
  - [ ] Use platform's rollback feature
  - [ ] Revert to previous deployment
  - [ ] Check logs for root cause

- [ ] **Docker**
  - [ ] Deploy previous image version
  - [ ] Tag: `your-registry/mev-exorcist-backend:previous`

- [ ] **Emergency**
  - [ ] Stop the service temporarily
  - [ ] Fix issues locally
  - [ ] Test thoroughly
  - [ ] Redeploy

## Success Criteria

Deployment is successful when:

- [x] Health check endpoint returns 200 OK
- [x] Logs show successful Alchemy connection
- [x] Logs show subscription to pending transactions
- [x] Transactions are being detected and logged
- [x] Frontend can connect via Socket.io
- [x] No errors in logs for 5+ minutes
- [x] Verification script passes all tests

## Support Resources

- **Railway**: [docs.railway.app](https://docs.railway.app)
- **Render**: [render.com/docs](https://render.com/docs)
- **Alchemy**: [docs.alchemy.com](https://docs.alchemy.com)
- **Docker**: [docs.docker.com](https://docs.docker.com)
- **Project Documentation**: See `DEPLOYMENT.md` and `README.md`
