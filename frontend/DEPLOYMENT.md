# Frontend Deployment Guide

## Vercel Deployment Configuration

This guide covers deploying The MEV Exorcist frontend to Vercel.

## Prerequisites

- Vercel account (sign up at https://vercel.com)
- Backend deployed and accessible (Railway/Render URL)
- Git repository connected to Vercel

## Step 1: Environment Variables

Configure the following environment variables in your Vercel project settings:

### Required Environment Variables

```bash
# Backend Socket.io server URL (replace with your deployed backend URL)
NEXT_PUBLIC_BACKEND_URL=https://your-backend.railway.app

# Etherscan base URL for Sepolia testnet
NEXT_PUBLIC_ETHERSCAN_BASE=https://sepolia.etherscan.io
```

### Setting Environment Variables in Vercel

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - **Name**: `NEXT_PUBLIC_BACKEND_URL`
   - **Value**: Your backend URL (e.g., `https://mev-exorcist-backend.railway.app`)
   - **Environment**: Production, Preview, Development (select all)
4. Add the Etherscan variable:
   - **Name**: `NEXT_PUBLIC_ETHERSCAN_BASE`
   - **Value**: `https://sepolia.etherscan.io`
   - **Environment**: Production, Preview, Development (select all)

## Step 2: Build Configuration

The `vercel.json` file in the frontend directory contains the build configuration:

- **Framework**: Next.js (auto-detected)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Node Version**: 18.x (recommended)

### Security Headers

The following security headers are configured in `vercel.json`:

- **Content-Security-Policy**: Restricts resource loading for security
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Restricts browser features

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your Git repository
3. Select the `frontend` directory as the root directory
4. Vercel will auto-detect Next.js framework
5. Add environment variables (see Step 1)
6. Click **Deploy**

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend directory
cd frontend

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Step 4: Test Preview Deployment

After deployment, Vercel provides a preview URL (e.g., `https://your-app-xyz.vercel.app`).

### Verification Checklist

1. **Page Load Test**
   - [ ] Page loads within 2 seconds
   - [ ] No console errors in browser DevTools
   - [ ] Title "THE MEV EXORCIST" displays with glitch effect

2. **Socket.io Connection Test**
   - [ ] Open browser DevTools → Network tab
   - [ ] Look for WebSocket connection to backend
   - [ ] Connection status should show "Connected" (if backend is running)
   - [ ] Check console for connection logs

3. **Visual Elements Test**
   - [ ] Black background (#000000) applied
   - [ ] Radar visualization displays and rotates
   - [ ] Transaction stream container visible
   - [ ] Monospace font applied throughout

4. **Backend Connection Test**
   - [ ] Verify backend is running and accessible
   - [ ] Check that Socket.io connection establishes
   - [ ] Monitor for incoming transactions (if backend is receiving data)

## Step 5: Browser and Device Testing

### Desktop Browsers

Test on the following browsers:

- [ ] **Chrome** (latest version)
  - Check DevTools console for errors
  - Test audio playback (click to enable)
  - Verify WebSocket connection

- [ ] **Firefox** (latest version)
  - Check console for errors
  - Test audio playback
  - Verify animations work smoothly

- [ ] **Safari** (latest version)
  - Check console for errors
  - Test audio playback (may require user interaction)
  - Verify WebSocket connection

- [ ] **Edge** (latest version)
  - Check console for errors
  - Test all functionality

### Mobile Devices

Test on mobile devices:

- [ ] **iOS Safari**
  - Test responsive layout
  - Verify touch interactions
  - Test audio (requires user interaction)

- [ ] **Android Chrome**
  - Test responsive layout
  - Verify touch interactions
  - Test audio playback

### Testing Procedure

1. Open the deployed URL on each browser/device
2. Open DevTools/Console (desktop) or use remote debugging (mobile)
3. Check for connection to backend
4. Wait for transactions to appear (if backend is active)
5. Click on a transaction to test detail card
6. Test audio by clicking "Enable Audio" if prompted
7. Verify all animations run smoothly (60 FPS)

## Step 6: Verify Socket.io Connection

### Connection Verification Steps

1. **Check Network Tab**
   ```
   - Open DevTools → Network tab
   - Filter by "WS" (WebSocket)
   - Look for connection to your backend URL
   - Status should be "101 Switching Protocols"
   ```

2. **Check Console Logs**
   ```
   - Look for Socket.io connection messages
   - Should see: "Connected to MEV Exorcist backend"
   - No error messages about connection failures
   ```

3. **Test with Backend**
   ```
   - Ensure backend is deployed and running
   - Backend should log: "Frontend client connected"
   - Transactions should flow from backend to frontend
   ```

### Troubleshooting Connection Issues

**Problem**: "Unable to connect to backend"
- **Solution**: Verify `NEXT_PUBLIC_BACKEND_URL` is correct
- **Solution**: Check backend is running and accessible
- **Solution**: Verify backend allows CORS from Vercel domain

**Problem**: "WebSocket connection failed"
- **Solution**: Ensure backend supports WebSocket upgrades
- **Solution**: Check firewall/security group settings on backend
- **Solution**: Verify backend URL uses `https://` (not `http://`)

**Problem**: "Connection timeout"
- **Solution**: Check backend health endpoint: `https://your-backend.com/health`
- **Solution**: Verify backend Socket.io server is running on correct port
- **Solution**: Check backend logs for connection errors

## Step 7: Production Deployment

Once preview deployment is verified:

1. **Merge to Main Branch**
   ```bash
   git checkout main
   git merge your-feature-branch
   git push origin main
   ```

2. **Vercel Auto-Deploy**
   - Vercel automatically deploys `main` branch to production
   - Monitor deployment in Vercel Dashboard
   - Check deployment logs for errors

3. **Verify Production**
   - Visit production URL
   - Run through verification checklist again
   - Test on multiple browsers/devices

## Performance Optimization

### Vercel Configuration

- **Edge Network**: Vercel automatically uses CDN for static assets
- **Image Optimization**: Next.js Image component optimized automatically
- **Code Splitting**: Next.js automatically splits code by route

### Monitoring

1. **Vercel Analytics**
   - Enable in Vercel Dashboard → Analytics
   - Monitor page load times
   - Track Core Web Vitals

2. **Real User Monitoring**
   - Check Vercel Speed Insights
   - Monitor Time to First Byte (TTFB)
   - Track Largest Contentful Paint (LCP)

### Performance Targets

- **Initial Load**: < 2 seconds
- **Time to Interactive**: < 3 seconds
- **First Contentful Paint**: < 1 second
- **Lighthouse Score**: > 90

## Security Considerations

### Content Security Policy

The CSP in `vercel.json` allows:
- **default-src 'self'**: Only load resources from same origin
- **connect-src 'self' wss://* https://***: Allow WebSocket and HTTPS connections
- **style-src 'self' 'unsafe-inline'**: Allow inline styles (required for Tailwind)
- **script-src 'self' 'unsafe-eval' 'unsafe-inline'**: Allow scripts (required for Next.js)

### HTTPS Enforcement

- Vercel automatically provides SSL certificates
- All traffic is served over HTTPS
- HTTP requests automatically redirect to HTTPS

### Environment Variable Security

- Never commit `.env.local` to Git
- Use Vercel's environment variable management
- Prefix public variables with `NEXT_PUBLIC_`
- Keep backend URLs in environment variables

## Rollback Procedure

If deployment fails or issues are discovered:

1. **Instant Rollback via Vercel Dashboard**
   - Go to Deployments tab
   - Find previous working deployment
   - Click "..." → "Promote to Production"

2. **Rollback via Git**
   ```bash
   git revert HEAD
   git push origin main
   ```

3. **Verify Rollback**
   - Check production URL
   - Verify functionality restored
   - Monitor error logs

## Common Issues and Solutions

### Issue: Build Fails

**Error**: "Module not found"
- **Solution**: Run `npm install` locally and commit `package-lock.json`
- **Solution**: Check for missing dependencies in `package.json`

**Error**: "Type errors"
- **Solution**: Run `npm run build` locally to catch TypeScript errors
- **Solution**: Fix type errors before deploying

### Issue: Environment Variables Not Working

**Error**: "Cannot read property of undefined"
- **Solution**: Verify variables are prefixed with `NEXT_PUBLIC_`
- **Solution**: Redeploy after adding environment variables
- **Solution**: Check variable names match exactly (case-sensitive)

### Issue: Slow Performance

**Problem**: Page loads slowly
- **Solution**: Check Vercel Analytics for bottlenecks
- **Solution**: Optimize images and assets
- **Solution**: Enable Vercel Speed Insights

### Issue: Audio Not Playing

**Problem**: Audio doesn't play on mobile
- **Solution**: Audio requires user interaction on mobile browsers
- **Solution**: Add "Enable Audio" button for user to click
- **Solution**: Check browser console for audio permission errors

## Support and Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **Socket.io Client Documentation**: https://socket.io/docs/v4/client-api/

## Deployment Checklist

Before marking deployment as complete:

- [ ] `vercel.json` created with headers and CSP
- [ ] Environment variables configured in Vercel
- [ ] Build settings verified (Next.js framework)
- [ ] Preview deployment tested successfully
- [ ] Socket.io connection to backend verified
- [ ] Tested on Chrome, Firefox, Safari
- [ ] Tested on mobile devices (iOS and Android)
- [ ] Production deployment completed
- [ ] Performance metrics within targets
- [ ] Security headers verified
- [ ] Error monitoring enabled
- [ ] Rollback procedure documented and tested

## Next Steps

After successful deployment:

1. Monitor Vercel Analytics for performance issues
2. Set up error tracking (e.g., Sentry)
3. Configure custom domain (optional)
4. Enable Vercel Speed Insights
5. Set up deployment notifications (Slack/Discord)
