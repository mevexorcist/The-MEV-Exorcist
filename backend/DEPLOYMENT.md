# MEV Exorcist Backend - Deployment Guide

This guide covers deploying the MEV Exorcist backend to various cloud platforms.

## Prerequisites

- Node.js 18+ installed locally for testing
- Alchemy API key for Ethereum Sepolia testnet
- Account on your chosen deployment platform (Railway, Render, or Docker-based hosting)

## Environment Variables

The following environment variables must be configured in your deployment platform:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ALCHEMY_WSS_URL` | Yes | - | WebSocket URL from Alchemy (e.g., `wss://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY`) |
| `UNISWAP_V3_ROUTER` | Yes | - | Uniswap V3 Router address on Sepolia: `0xE592427A0AEce92De3Edee1F18E0157C05861564` |
| `PORT` | No | 3001 | Port for the Socket.io server (usually auto-assigned by platform) |
| `RISK_THRESHOLD_ETH` | No | 0.1 | ETH value threshold for high-risk classification |
| `NODE_ENV` | No | production | Node environment (set to `production` for deployments) |

## Deployment Options

### Option 1: Railway

Railway provides automatic deployments from Git repositories with zero configuration.

#### Steps:

1. **Create Railway Account**
   - Visit [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select the `backend` directory as the root

3. **Configure Environment Variables**
   - Go to your project settings
   - Add the required environment variables:
     - `ALCHEMY_WSS_URL`: Your Alchemy WebSocket URL
     - `UNISWAP_V3_ROUTER`: `0xE592427A0AEce92De3Edee1F18E0157C05861564`
     - `RISK_THRESHOLD_ETH`: `0.1`
     - `NODE_ENV`: `production`

4. **Deploy**
   - Railway will automatically detect the `railway.json` configuration
   - The service will build and deploy automatically
   - Note the public URL provided by Railway

5. **Verify Deployment**
   - Visit `https://your-app.railway.app/health`
   - You should see: `{"status":"ok","connections":0,"uptime":...}`

#### Railway Configuration

The `railway.json` file is already configured with:
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Health check endpoint: `/health`
- Automatic restart on failure

### Option 2: Render

Render provides a simple deployment process with a web-based dashboard.

#### Steps:

1. **Create Render Account**
   - Visit [render.com](https://render.com)
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing the backend

3. **Configure Service**
   - Name: `mev-exorcist-backend`
   - Region: Choose closest to your users
   - Branch: `main` (or your default branch)
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

4. **Configure Environment Variables**
   - Add the required environment variables in the "Environment" section:
     - `ALCHEMY_WSS_URL`: Your Alchemy WebSocket URL
     - `UNISWAP_V3_ROUTER`: `0xE592427A0AEce92De3Edee1F18E0157C05861564`
     - `RISK_THRESHOLD_ETH`: `0.1`
     - `NODE_ENV`: `production`
     - `PORT`: Leave empty (Render auto-assigns)

5. **Configure Health Check**
   - Health Check Path: `/health`
   - Health Check Timeout: 100 seconds

6. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy automatically
   - Note the public URL provided by Render

7. **Verify Deployment**
   - Visit `https://your-app.onrender.com/health`
   - You should see: `{"status":"ok","connections":0,"uptime":...}`

#### Render Configuration

The `render.yaml` file is already configured and can be used for "Infrastructure as Code" deployment:
- Go to Render Dashboard → "New +" → "Blueprint"
- Connect your repository
- Render will automatically detect and use `render.yaml`

### Option 3: Docker (Self-Hosted or Cloud)

Use the provided Dockerfile for deployment to any Docker-compatible platform (AWS ECS, Google Cloud Run, Azure Container Instances, DigitalOcean App Platform, etc.).

#### Steps:

1. **Build Docker Image**
   ```bash
   cd backend
   docker build -t mev-exorcist-backend .
   ```

2. **Test Locally**
   ```bash
   docker run -p 3001:3001 \
     -e ALCHEMY_WSS_URL="wss://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY" \
     -e UNISWAP_V3_ROUTER="0xE592427A0AEce92De3Edee1F18E0157C05861564" \
     -e RISK_THRESHOLD_ETH="0.1" \
     -e NODE_ENV="production" \
     mev-exorcist-backend
   ```

3. **Verify Health Check**
   ```bash
   curl http://localhost:3001/health
   ```

4. **Push to Container Registry**
   ```bash
   # Example for Docker Hub
   docker tag mev-exorcist-backend your-username/mev-exorcist-backend
   docker push your-username/mev-exorcist-backend
   ```

5. **Deploy to Your Platform**
   - Follow your platform's specific instructions for deploying containers
   - Ensure environment variables are configured
   - Ensure the health check endpoint is configured: `/health`

## Health Check Endpoint

The backend includes a health check endpoint at `/health` that returns:

```json
{
  "status": "ok",
  "connections": 0,
  "uptime": 123.456
}
```

- `status`: Always "ok" if the server is running
- `connections`: Number of currently connected Socket.io clients
- `uptime`: Server uptime in seconds

This endpoint is used by deployment platforms to verify the service is healthy.

## Verifying WebSocket Connection

After deployment, verify that the backend can connect to Alchemy:

1. **Check Logs**
   - Railway: Go to your project → "Deployments" → Click on latest deployment → "View Logs"
   - Render: Go to your service → "Logs" tab
   - Docker: `docker logs <container-id>`

2. **Look for Success Messages**
   ```
   === MEV EXORCIST BACKEND ===
   Configuration:
     Environment: production
     WebSocket URL: wss://eth-sepolia.g.alchemy.com/v2/...
     Uniswap V3 Router: 0xE592427A0AEce92De3Edee1F18E0157C05861564
     Server Port: 3001
     Risk Threshold: 0.1 ETH
   
   ✓ Transaction broadcaster started
   ✓ Connected to Alchemy WebSocket
   ✓ Subscribed to pending transactions
   
   🔍 Monitoring mempool for MEV targets...
   ```

3. **Check for Errors**
   - If you see connection errors, verify your `ALCHEMY_WSS_URL` is correct
   - Ensure the URL includes your API key
   - Check that the Alchemy API key has WebSocket access enabled

## Testing the Deployment

### 1. Health Check Test
```bash
curl https://your-deployed-backend.com/health
```

Expected response:
```json
{"status":"ok","connections":0,"uptime":45.123}
```

### 2. Frontend Connection Test

Update your frontend's `.env.local` with the deployed backend URL:
```bash
NEXT_PUBLIC_BACKEND_URL=https://your-deployed-backend.com
```

Start the frontend locally and verify it connects to the deployed backend.

### 3. Monitor Logs

Watch the logs for incoming transactions:
```
✓ LOW | 0.0500 ETH | exactInputSingle | 0x1234567890...
🚨 HIGH | 0.5000 ETH | exactInput | 0xabcdef1234...
```

## Troubleshooting

### WebSocket Connection Fails

**Problem**: Backend logs show "Failed to connect to Alchemy"

**Solutions**:
- Verify `ALCHEMY_WSS_URL` is correct and includes your API key
- Check that your Alchemy API key is valid and has WebSocket access
- Ensure the URL starts with `wss://` not `https://`
- Try creating a new API key in Alchemy dashboard

### Health Check Fails

**Problem**: Deployment platform reports unhealthy service

**Solutions**:
- Verify the health check path is set to `/health`
- Check that the `PORT` environment variable matches what the platform expects
- Review logs for startup errors
- Ensure the build completed successfully

### No Transactions Appearing

**Problem**: Backend is running but no transactions are logged

**Solutions**:
- Verify you're connected to Sepolia testnet (not mainnet)
- Check that Sepolia has active Uniswap V3 transactions (testnet activity varies)
- Verify the `UNISWAP_V3_ROUTER` address is correct for Sepolia
- Check Alchemy dashboard to ensure your API key has remaining credits

### High Memory Usage

**Problem**: Backend uses too much memory

**Solutions**:
- Ensure you're using the production build (`npm run build` then `npm start`)
- Check for memory leaks in logs
- Consider upgrading to a higher-tier plan on your platform
- Review the transaction processing pipeline for bottlenecks

## Production Considerations

### Security

- **Never commit `.env` files** to version control
- Store sensitive environment variables securely in your deployment platform
- Consider restricting CORS origins in `TransactionBroadcaster.ts` for production
- Use HTTPS for all external connections
- Rotate Alchemy API keys periodically

### Monitoring

- Set up uptime monitoring (e.g., UptimeRobot, Pingdom)
- Configure alerts for health check failures
- Monitor WebSocket connection stability
- Track the number of connected clients
- Set up log aggregation for error tracking

### Scaling

- The current architecture supports ~100 concurrent WebSocket connections
- For higher load, consider:
  - Upgrading to a larger instance
  - Implementing connection pooling
  - Using a message queue for transaction processing
  - Deploying multiple instances with load balancing

### Cost Optimization

- **Railway**: Free tier includes 500 hours/month, then $5/month for Hobby plan
- **Render**: Free tier available with limitations, then $7/month for Starter plan
- **Alchemy**: Free tier includes 300M compute units/month
- Monitor your Alchemy usage to avoid unexpected charges

## Next Steps

After deploying the backend:

1. Note the public URL of your deployed backend
2. Update the frontend's `NEXT_PUBLIC_BACKEND_URL` environment variable
3. Deploy the frontend to Vercel (see frontend deployment guide)
4. Test the complete system end-to-end
5. Set up monitoring and alerts

## Support

For issues specific to:
- **Railway**: [Railway Documentation](https://docs.railway.app)
- **Render**: [Render Documentation](https://render.com/docs)
- **Alchemy**: [Alchemy Documentation](https://docs.alchemy.com)
- **Docker**: [Docker Documentation](https://docs.docker.com)
