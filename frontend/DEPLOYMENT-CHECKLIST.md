# Frontend Deployment Checklist

Quick reference checklist for deploying The MEV Exorcist frontend to Vercel.

## Pre-Deployment

- [ ] Backend is deployed and accessible
- [ ] Backend URL is known (e.g., `https://your-backend.railway.app`)
- [ ] Backend health endpoint responds: `https://your-backend.railway.app/health`
- [ ] Local build succeeds: `npm run build`
- [ ] All tests pass: `npm test`
- [ ] Code committed and pushed to Git repository

## Vercel Configuration

- [ ] `vercel.json` exists in frontend directory
- [ ] Security headers configured in `vercel.json`
- [ ] CSP policy allows WebSocket connections
- [ ] Build command set to `npm run build`
- [ ] Framework detected as Next.js

## Environment Variables in Vercel

Configure these in Vercel Dashboard → Settings → Environment Variables:

- [ ] `NEXT_PUBLIC_BACKEND_URL` = Your backend URL
- [ ] `NEXT_PUBLIC_ETHERSCAN_BASE` = `https://sepolia.etherscan.io`
- [ ] Variables set for: Production, Preview, Development

## Initial Deployment

- [ ] Repository connected to Vercel
- [ ] Frontend directory selected as root (if monorepo)
- [ ] Environment variables added
- [ ] First deployment triggered
- [ ] Build completes successfully
- [ ] Preview URL generated

## Preview Testing

### Basic Functionality
- [ ] Page loads without errors
- [ ] Title "THE MEV EXORCIST" displays
- [ ] Black background applied
- [ ] Radar visualization visible and rotating
- [ ] Transaction stream container visible

### Connection Testing
- [ ] Open DevTools → Network tab
- [ ] WebSocket connection established to backend
- [ ] Connection status shows "Connected"
- [ ] No connection errors in console

### Browser Testing
- [ ] Chrome (latest) - all features work
- [ ] Firefox (latest) - all features work
- [ ] Safari (latest) - all features work
- [ ] Edge (latest) - all features work

### Mobile Testing
- [ ] iOS Safari - responsive layout works
- [ ] Android Chrome - responsive layout works
- [ ] Touch interactions work on mobile
- [ ] Audio works after user interaction

## Functional Testing

### Transaction Display
- [ ] Transactions appear in stream (if backend active)
- [ ] Low-risk transactions show in green
- [ ] High-risk transactions show in red
- [ ] Pulsing border animation on high-risk transactions
- [ ] Transaction stream limited to 50 items

### Radar Visualization
- [ ] Radar rotates slowly in normal state (green)
- [ ] Radar speeds up and turns red on high-risk transaction
- [ ] Alert state maintained for 3 seconds
- [ ] Returns to normal state after timeout

### Detail Card
- [ ] Detail card appears on high-risk transaction
- [ ] Wallet address displayed in truncated format
- [ ] ETH value shown with 4 decimal precision
- [ ] Transaction hash is clickable Etherscan link
- [ ] "HUNTED" status label displayed in red
- [ ] Close button works
- [ ] Click outside closes card

### Audio System
- [ ] Audio permission requested on first interaction
- [ ] Tick sound plays on low-risk transaction
- [ ] Siren sound plays on high-risk transaction
- [ ] Audio can be enabled/disabled
- [ ] Sound effects queue properly (no overlap)

## Performance Testing

- [ ] Initial page load < 2 seconds
- [ ] Time to Interactive < 3 seconds
- [ ] No layout shifts (CLS < 0.1)
- [ ] Animations run at 60 FPS
- [ ] Memory usage stable over time
- [ ] No memory leaks after 10 minutes

## Security Verification

- [ ] HTTPS enforced (automatic on Vercel)
- [ ] CSP headers present in response
- [ ] X-Frame-Options: DENY header present
- [ ] No sensitive data in client-side code
- [ ] Environment variables not exposed in bundle
- [ ] External links use HTTPS

## Production Deployment

- [ ] Preview deployment fully tested
- [ ] All issues resolved
- [ ] Merge to main branch
- [ ] Production deployment triggered
- [ ] Production URL accessible
- [ ] Repeat functional tests on production

## Post-Deployment

- [ ] Production URL shared with team
- [ ] Vercel Analytics enabled
- [ ] Error monitoring configured
- [ ] Performance monitoring active
- [ ] Deployment notifications set up
- [ ] Documentation updated with production URL

## Troubleshooting

### If build fails:
1. Check build logs in Vercel Dashboard
2. Run `npm run build` locally to reproduce
3. Fix errors and redeploy

### If connection fails:
1. Verify `NEXT_PUBLIC_BACKEND_URL` is correct
2. Check backend is running: visit `/health` endpoint
3. Check browser console for WebSocket errors
4. Verify CORS settings on backend

### If audio doesn't work:
1. Check browser console for audio errors
2. Verify user has interacted with page first
3. Test on different browsers
4. Check browser audio permissions

### If performance is slow:
1. Check Vercel Analytics for bottlenecks
2. Verify CDN is serving static assets
3. Check for console errors
4. Monitor network tab for slow requests

## Rollback Procedure

If critical issues found in production:

1. Go to Vercel Dashboard → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"
4. Verify rollback successful
5. Fix issues before redeploying

## Sign-Off

Deployment completed by: _______________

Date: _______________

Production URL: _______________

Backend URL: _______________

Notes:
_______________________________________________
_______________________________________________
_______________________________________________
