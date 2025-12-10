# MEV Exorcist Mini App Deployment Guide

This guide covers deploying The MEV Exorcist as a Farcaster Mini App on Base network.

## Prerequisites

- [ ] Alchemy API key with Base network access
- [ ] Vercel account (or alternative hosting)
- [ ] Railway/Render account for backend (or alternative)
- [ ] Domain name (optional but recommended)
- [ ] App images created (icon, preview, splash)

## Important Note

This app uses the official `@farcaster/frame-sdk` for Mini App integration. The SDK is lightweight and compatible with Next.js 14 App Router.

## Step 1: Prepare Images

1. Create required images following `frontend/public/IMAGE-REQUIREMENTS.md`:
   - `icon.png` (512x512px)
   - `preview.png` (1200x630px)
   - `splash.png` (1200x1200px)

2. Place images in `frontend/public/` directory

3. Verify images are accessible locally:
   ```bash
   cd frontend
   npm run dev
   # Visit http://localhost:3000/icon.png
   ```

## Step 2: Deploy Backend

### Option A: Railway

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login and initialize:
   ```bash
   railway login
   cd backend
   railway init
   ```

3. Set environment variables:
   ```bash
   railway variables set ALCHEMY_WSS_URL="wss://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY"
   railway variables set UNISWAP_V3_ROUTER="0x2626664c2603336E57B271c5C0b26F421741e481"
   railway variables set NETWORK_NAME="base"
   railway variables set EXPLORER_URL="https://basescan.org"
   railway variables set ALLOWED_ORIGINS="*"
   ```

4. Deploy:
   ```bash
   railway up
   ```

5. Get your backend URL:
   ```bash
   railway domain
   ```

### Option B: Render

1. Connect GitHub repository to Render

2. Create new Web Service

3. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node

4. Add environment variables in Render dashboard:
   ```
   ALCHEMY_WSS_URL=wss://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY
   UNISWAP_V3_ROUTER=0x2626664c2603336E57B271c5C0b26F421741e481
   NETWORK_NAME=base
   EXPLORER_URL=https://basescan.org
   ALLOWED_ORIGINS=*
   ```

5. Deploy and note your backend URL

## Step 3: Deploy Frontend

### Using Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login and deploy:
   ```bash
   cd frontend
   vercel
   ```

3. Set environment variables:
   ```bash
   vercel env add NEXT_PUBLIC_BACKEND_URL
   # Enter your backend URL from Step 2

   vercel env add NEXT_PUBLIC_EXPLORER_URL
   # Enter: https://basescan.org

   vercel env add NEXT_PUBLIC_NETWORK_NAME
   # Enter: base

   vercel env add NEXT_PUBLIC_APP_URL
   # Enter your Vercel URL (e.g., https://mev-exorcist.vercel.app)
   ```

4. Redeploy with environment variables:
   ```bash
   vercel --prod
   ```

## Step 4: Update farcaster.json

1. Edit `frontend/public/farcaster.json` with your production URLs:
   ```json
   {
     "version": "1.0.0",
     "name": "The MEV Exorcist",
     "iconUrl": "https://your-domain.com/icon.png",
     "homeUrl": "https://your-domain.com",
     "imageUrl": "https://your-domain.com/preview.png",
     "splashImageUrl": "https://your-domain.com/splash.png",
     "splashBackgroundColor": "#000000",
     "webhookUrl": "https://your-domain.com/api/webhook"
   }
   ```

2. Redeploy frontend:
   ```bash
   vercel --prod
   ```

## Step 5: Verify Deployment

### Backend Verification

1. Test health endpoint:
   ```bash
   curl https://your-backend-url.com/health
   ```

   Expected response:
   ```json
   {
     "status": "ok",
     "connections": 0,
     "uptime": 123.456
   }
   ```

2. Check WebSocket connection:
   - Open browser console on frontend
   - Look for "CONNECTED" status
   - Verify transactions appear

### Frontend Verification

1. Test standalone mode:
   - Visit your frontend URL
   - Verify app loads correctly
   - Check that transactions stream works

2. Test images:
   - Visit `https://your-domain.com/icon.png`
   - Visit `https://your-domain.com/preview.png`
   - Visit `https://your-domain.com/splash.png`

3. Test farcaster.json:
   - Visit `https://your-domain.com/farcaster.json`
   - Verify JSON is valid

## Step 6: Submit to Farcaster

### Prepare for Submission

1. Ensure all images are optimized and loading
2. Test the app thoroughly in standalone mode
3. Verify all links work (BaseScan, share URLs)
4. Check mobile responsiveness

### Submit to Farcaster Directory

1. Visit Farcaster Mini App submission portal
2. Provide your app URL: `https://your-domain.com`
3. Farcaster will verify:
   - `farcaster.json` is accessible
   - Images load correctly
   - App works in iframe
   - Security headers are correct

4. Wait for approval (usually 1-3 days)

## Step 7: Testing in Farcaster

### Test in Warpcast

1. Open Warpcast app
2. Search for "MEV Exorcist" in Mini Apps
3. Launch the app
4. Test features:
   - [ ] App loads correctly
   - [ ] User profile displays
   - [ ] Transactions stream works
   - [ ] Share button works
   - [ ] Deep links work

### Test Sharing

1. View a high-risk transaction
2. Click share button
3. Verify cast is pre-filled with:
   - Transaction details
   - Deep link to app
4. Post the cast
5. Click the link in the cast
6. Verify app opens with transaction details

## Troubleshooting

### Backend Issues

**Problem**: Backend not connecting to Base network

**Solution**:
- Verify Alchemy API key is correct
- Check that Base network is enabled on your Alchemy account
- Test WebSocket URL manually

**Problem**: CORS errors in browser console

**Solution**:
- Check `ALLOWED_ORIGINS` environment variable
- Verify frontend URL is allowed
- Check browser console for specific CORS error

### Frontend Issues

**Problem**: Mini App features not working

**Solution**:
- Verify `@neynar/react` is installed
- Check that `MiniAppProvider` wraps the app
- Test in actual Farcaster client (not standalone browser)

**Problem**: Images not loading

**Solution**:
- Verify images are in `frontend/public/` directory
- Check image URLs in `farcaster.json`
- Test image URLs directly in browser
- Ensure images are optimized (< 500KB)

**Problem**: Share button not working

**Solution**:
- Verify `NEXT_PUBLIC_APP_URL` is set correctly
- Check that app is running in Farcaster client
- Test deep link URL format

### Base Network Issues

**Problem**: No transactions appearing

**Solution**:
- Verify Base network has active Uniswap V3 activity
- Check Alchemy dashboard for API usage
- Verify Uniswap V3 Router address is correct for Base
- Check backend logs for errors

## Monitoring

### Backend Monitoring

Monitor these metrics:
- Health check response time
- Number of connected clients
- Transaction processing rate
- WebSocket connection stability
- Error rates

### Frontend Monitoring

Monitor these metrics:
- Page load time
- Mini App launch rate
- Share button click rate
- Error rates
- User engagement

### Analytics

The app includes built-in analytics tracking:
- Mini App launches
- Transaction views
- Share actions
- Errors

Analytics respects user privacy preferences (Do Not Track).

## Security Checklist

- [ ] HTTPS enabled on both frontend and backend
- [ ] CORS configured correctly
- [ ] Security headers set (CSP, X-Frame-Options, etc.)
- [ ] API keys stored securely (not in code)
- [ ] Rate limiting enabled on backend
- [ ] Input validation on all user inputs
- [ ] Error messages don't expose sensitive info

## Performance Optimization

### Frontend

- [ ] Images optimized (< 500KB each)
- [ ] Code splitting enabled
- [ ] Lazy loading for components
- [ ] Service worker for offline support
- [ ] CDN for static assets

### Backend

- [ ] Connection pooling for database
- [ ] Caching for frequent queries
- [ ] Compression enabled
- [ ] WebSocket connection limits
- [ ] Graceful shutdown handling

## Maintenance

### Regular Tasks

- Monitor Alchemy API usage
- Check error logs weekly
- Update dependencies monthly
- Test in latest Farcaster clients
- Verify Base network configuration

### Updates

When updating the app:
1. Test changes locally
2. Deploy to staging environment
3. Test in Farcaster staging
4. Deploy to production
5. Monitor for errors
6. Announce updates in Farcaster

## Support

For issues:
- Check backend logs
- Check frontend browser console
- Verify environment variables
- Test health check endpoint
- Check Alchemy dashboard

## Next Steps

After successful deployment:
1. Announce the Mini App on Farcaster
2. Share example transactions
3. Gather user feedback
4. Monitor usage and errors
5. Plan feature updates

## Resources

- [Farcaster Mini Apps Documentation](https://docs.farcaster.xyz/developers/frames/v2)
- [Neynar Documentation](https://docs.neynar.com)
- [Base Network Documentation](https://docs.base.org)
- [Alchemy Documentation](https://docs.alchemy.com)
- [Vercel Documentation](https://vercel.com/docs)
