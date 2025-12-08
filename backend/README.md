# MEV Exorcist Backend (The Seer)

The backend component of the MEV Exorcist application that monitors the Ethereum Sepolia testnet mempool for potential MEV attack targets.

## Overview

The Seer connects to Alchemy's WebSocket API to receive pending transactions in real-time, filters for Uniswap V3 swap transactions, classifies them by MEV risk level, and broadcasts them to connected frontend clients via Socket.io.

## Features

- Real-time mempool monitoring via Alchemy WebSocket
- Automatic reconnection with exponential backoff
- Transaction filtering by Uniswap V3 Router address
- ABI decoding for swap function calls
- Risk classification based on ETH value threshold
- Socket.io broadcasting to multiple clients
- Health check endpoint for deployment monitoring
- Graceful shutdown handling

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Alchemy API key with WebSocket access (Sepolia testnet)

## Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your Alchemy API key
```

## Configuration

Create a `.env` file with the following variables:

```bash
# Required: Alchemy WebSocket URL for Sepolia testnet
ALCHEMY_WSS_URL=wss://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY

# Required: Uniswap V3 Router address on Sepolia
UNISWAP_V3_ROUTER=0xE592427A0AEce92De3Edee1F18E0157C05861564

# Optional: Server port (default: 3001)
PORT=3001

# Optional: Risk threshold in ETH (default: 0.1)
RISK_THRESHOLD_ETH=0.1

# Optional: Node environment (default: development)
NODE_ENV=development
```

## Development

```bash
# Run in development mode with auto-reload
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Production Build

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## API Endpoints

### Health Check

**GET** `/health`

Returns the current health status of the backend.

**Response:**
```json
{
  "status": "ok",
  "connections": 2,
  "uptime": 123.456
}
```

- `status`: Always "ok" if server is running
- `connections`: Number of connected Socket.io clients
- `uptime`: Server uptime in seconds

### Socket.io Events

**Event:** `transaction`

Emitted when a classified transaction is detected.

**Payload:**
```typescript
{
  hash: string;           // Transaction hash
  from: string;           // Sender address
  ethValue: string;       // ETH value (formatted with 4 decimals)
  riskLevel: 'HIGH' | 'LOW';  // Risk classification
  timestamp: number;      // Unix timestamp
  functionName: string;   // Swap function name
}
```

## Deployment

The backend can be deployed to various platforms. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Quick Deploy Options

#### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### Render
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Render will automatically detect `render.yaml`
4. Configure environment variables
5. Deploy

#### Docker
```bash
# Build image
docker build -t mev-exorcist-backend .

# Run container
docker run -p 3001:3001 \
  -e ALCHEMY_WSS_URL="wss://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY" \
  -e UNISWAP_V3_ROUTER="0xE592427A0AEce92De3Edee1F18E0157C05861564" \
  mev-exorcist-backend
```

### Verify Deployment

After deploying, verify the backend is working:

```bash
# Test health check
curl https://your-backend-url.com/health

# Or use the verification script
node scripts/verify-deployment.js https://your-backend-url.com
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MEV Exorcist Backend                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Alchemy    │───▶│ Transaction  │───▶│     ABI      │  │
│  │  WebSocket   │    │  Processor   │    │   Decoder    │  │
│  │    Client    │    │              │    │              │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                                         │          │
│         │                                         ▼          │
│         │                                  ┌──────────────┐  │
│         │                                  │     Risk     │  │
│         │                                  │  Classifier  │  │
│         │                                  │              │  │
│         │                                  └──────────────┘  │
│         │                                         │          │
│         │                                         ▼          │
│         │                                  ┌──────────────┐  │
│         └─────────────────────────────────▶│  Socket.io   │  │
│                                             │  Broadcaster │  │
│                                             │              │  │
│                                             └──────────────┘  │
│                                                     │          │
└─────────────────────────────────────────────────────┼─────────┘
                                                      │
                                                      ▼
                                              Frontend Clients
```

## Components

### AlchemyWebSocketClient
Manages WebSocket connection to Alchemy with automatic reconnection.

### TransactionProcessor
Fetches transaction details and filters by Uniswap V3 Router address.

### ABIDecoder
Decodes transaction input data using Uniswap V3 ABI.

### RiskClassifier
Analyzes transactions and assigns risk levels based on ETH value.

### TransactionBroadcaster
Broadcasts classified transactions to all connected Socket.io clients.

## Testing

The backend includes comprehensive test coverage:

- **Unit Tests**: Test individual components in isolation
- **Property-Based Tests**: Test properties across random inputs using fast-check
- **Integration Tests**: Test end-to-end transaction processing pipeline

```bash
# Run all tests
npm test

# Run specific test file
npm test -- ABIDecoder.test.ts

# Run with coverage
npm run test:coverage
```

## Monitoring

### Logs

The backend logs important events:

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

✓ LOW | 0.0500 ETH | exactInputSingle | 0x1234567890...
🚨 HIGH | 0.5000 ETH | exactInput | 0xabcdef1234...
```

### Metrics

Monitor these metrics in production:

- Health check response time
- Number of connected clients
- Transaction processing rate
- WebSocket connection stability
- Memory usage
- CPU usage

## Troubleshooting

### WebSocket Connection Issues

**Problem**: "Failed to connect to Alchemy"

**Solutions**:
- Verify `ALCHEMY_WSS_URL` is correct
- Check Alchemy API key is valid
- Ensure WebSocket access is enabled on your Alchemy account
- Check network/firewall settings

### No Transactions Detected

**Problem**: Backend runs but no transactions appear

**Solutions**:
- Verify you're using Sepolia testnet (not mainnet)
- Check Sepolia has active Uniswap V3 activity
- Verify `UNISWAP_V3_ROUTER` address is correct
- Check Alchemy dashboard for API usage/errors

### High Memory Usage

**Problem**: Backend uses excessive memory

**Solutions**:
- Ensure production build is used (`npm run build` then `npm start`)
- Check for memory leaks in logs
- Monitor transaction processing rate
- Consider upgrading server resources

## Security

- Never commit `.env` files to version control
- Store API keys securely
- Use environment variables for sensitive configuration
- Restrict CORS origins in production
- Use HTTPS for all external connections
- Monitor API usage to prevent abuse

## Performance

- Supports ~100 concurrent WebSocket connections
- Transaction processing: <50ms per transaction
- Memory usage: ~512MB under normal load
- Automatic reconnection with exponential backoff
- Transaction queue for high-volume periods

## License

MIT

## Support

For issues and questions:
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help
- Review logs for error messages
- Verify environment variables are correct
- Test health check endpoint
- Check Alchemy dashboard for API issues
#   m e v - e x o r c i s t - b a c k e n d  
 #   D e p l o y m e n t   t e s t  
 