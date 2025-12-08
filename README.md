# The MEV Exorcist

A real-time Ethereum mempool monitoring application that visualizes potential MEV (Maximal Extractable Value) attack targets with a cyber-horror themed interface.

## Project Structure

```
.
├── backend/          # Node.js + TypeScript backend (The Seer)
│   ├── src/         # Source code
│   ├── .env.example # Environment variable template
│   └── package.json
├── frontend/        # Next.js 14 + React frontend (The Radar)
│   ├── app/         # Next.js app directory
│   ├── .env.local.example # Environment variable template
│   └── package.json
└── .kiro/
    └── specs/       # Feature specifications
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Copy the environment template and configure:
   ```bash
   cp .env.example .env
   # Edit .env with your Alchemy API key
   ```

3. Install dependencies (already done):
   ```bash
   npm install
   ```

4. Run in development mode:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Copy the environment template and configure:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your backend URL
   ```

3. Install dependencies (already done):
   ```bash
   npm install
   ```

4. Run in development mode:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   npm start
   ```

## Testing

### Backend Tests
```bash
cd backend
npm test              # Run tests once
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

### Frontend Tests
```bash
cd frontend
npm test              # Run tests once
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

## Technology Stack

### Backend (The Seer)
- Node.js v18+
- TypeScript
- WebSocket (ws) for Alchemy connection
- Socket.io for frontend communication
- ethers.js v6 for ABI decoding
- Jest + fast-check for testing

### Frontend (The Radar)
- Next.js 14
- React 18
- TypeScript
- Socket.io-client
- Framer Motion for animations
- Tailwind CSS for styling
- Jest + fast-check for testing

## Development Status

✅ Task 1: Project structure and dependencies setup complete

See `.kiro/specs/mev-exorcist/tasks.md` for the full implementation plan.
