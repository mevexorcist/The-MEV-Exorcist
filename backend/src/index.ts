import dotenv from 'dotenv';
import { ethers } from 'ethers';
import { AlchemyWebSocketClient } from './AlchemyWebSocketClient';
import { TransactionProcessor } from './TransactionProcessor';
import { ABIDecoder } from './ABIDecoder';
import { RiskClassifier } from './RiskClassifier';
import { TransactionBroadcaster } from './TransactionBroadcaster';

// Load environment variables
dotenv.config();

/**
 * Configuration interface for the MEV Exorcist backend
 */
interface BackendConfig {
  ALCHEMY_WSS_URL: string;
  ALCHEMY_HTTP_URL: string;
  UNISWAP_V3_ROUTER: string;
  PORT: number;
  RISK_THRESHOLD_ETH: string;
  NODE_ENV: string;
}

/**
 * Load and validate configuration from environment variables
 */
function loadConfiguration(): BackendConfig {
  const ALCHEMY_WSS_URL = process.env.ALCHEMY_WSS_URL;
  const UNISWAP_V3_ROUTER = process.env.UNISWAP_V3_ROUTER;
  const PORT = parseInt(process.env.PORT || '3001', 10);
  const RISK_THRESHOLD_ETH = process.env.RISK_THRESHOLD_ETH || '0.1';
  const NODE_ENV = process.env.NODE_ENV || 'development';

  // Validate required configuration
  if (!ALCHEMY_WSS_URL) {
    throw new Error('ALCHEMY_WSS_URL environment variable is required');
  }

  if (!UNISWAP_V3_ROUTER) {
    throw new Error('UNISWAP_V3_ROUTER environment variable is required');
  }

  // Convert WSS URL to HTTP URL for JSON-RPC calls
  const ALCHEMY_HTTP_URL = ALCHEMY_WSS_URL.replace('wss://', 'https://').replace('/v2/', '/v2/');

  return {
    ALCHEMY_WSS_URL,
    ALCHEMY_HTTP_URL,
    UNISWAP_V3_ROUTER,
    PORT,
    RISK_THRESHOLD_ETH,
    NODE_ENV,
  };
}

/**
 * Main server class that integrates all backend components
 */
class MEVExorcistServer {
  private config: BackendConfig;
  private wsClient: AlchemyWebSocketClient;
  private processor: TransactionProcessor;
  private decoder: ABIDecoder;
  private classifier: RiskClassifier;
  private broadcaster: TransactionBroadcaster;
  private isShuttingDown = false;

  constructor(config: BackendConfig) {
    this.config = config;

    // Initialize components
    const provider = new ethers.JsonRpcProvider(config.ALCHEMY_HTTP_URL);
    
    this.wsClient = new AlchemyWebSocketClient({ url: config.ALCHEMY_WSS_URL });
    this.processor = new TransactionProcessor(provider, config.UNISWAP_V3_ROUTER);
    this.decoder = new ABIDecoder();
    this.classifier = new RiskClassifier(config.RISK_THRESHOLD_ETH);
    this.broadcaster = new TransactionBroadcaster(config.PORT);
  }

  /**
   * Start the MEV Exorcist server
   */
  async start(): Promise<void> {
    console.log('=== MEV EXORCIST BACKEND ===');
    console.log('Configuration:');
    console.log(`  Environment: ${this.config.NODE_ENV}`);
    console.log(`  WebSocket URL: ${this.config.ALCHEMY_WSS_URL.substring(0, 50)}...`);
    console.log(`  Uniswap V3 Router: ${this.config.UNISWAP_V3_ROUTER}`);
    console.log(`  Server Port: ${this.config.PORT}`);
    console.log(`  Risk Threshold: ${this.config.RISK_THRESHOLD_ETH} ETH`);
    console.log('');

    // Start Socket.io broadcaster
    this.broadcaster.start();
    console.log('✓ Transaction broadcaster started');

    // Set up WebSocket event handlers
    this.setupWebSocketHandlers();

    // Connect to Alchemy WebSocket
    try {
      await this.wsClient.connect();
      console.log('✓ Connected to Alchemy WebSocket');

      // Subscribe to pending transactions
      this.wsClient.subscribe('pendingTransactions');
      console.log('✓ Subscribed to pending transactions');
      console.log('');
      console.log('🔍 Monitoring mempool for MEV targets...');
      console.log('');
    } catch (error) {
      console.error('✗ Failed to connect to Alchemy:', error);
      throw error;
    }

    // Set up graceful shutdown
    this.setupGracefulShutdown();
  }

  /**
   * Set up WebSocket event handlers for the transaction processing pipeline
   */
  private setupWebSocketHandlers(): void {
    // Handle incoming messages (pending transactions)
    this.wsClient.on('message', async (message: any) => {
      // Alchemy sends subscription confirmations and transaction notifications
      if (message.method === 'eth_subscription' && message.params) {
        const txHash = message.params.result?.hash || message.params.result;
        
        if (txHash && typeof txHash === 'string') {
          await this.processTransaction(txHash);
        }
      }
    });

    // Handle connection state changes
    this.wsClient.on('stateChange', (state: string) => {
      console.log(`WebSocket state: ${state}`);
    });

    // Handle errors
    this.wsClient.on('error', (error: Error) => {
      console.error('WebSocket error:', error.message);
    });

    // Handle reconnection attempts
    this.wsClient.on('reconnecting', (info: { attempt: number; delay: number }) => {
      console.log(`Reconnecting... (attempt ${info.attempt}, delay ${info.delay}ms)`);
    });

    // Handle successful reconnection
    this.wsClient.on('connected', () => {
      console.log('✓ WebSocket reconnected successfully');
      // Resubscribe to pending transactions after reconnection
      try {
        this.wsClient.subscribe('pendingTransactions');
        console.log('✓ Resubscribed to pending transactions');
      } catch (error) {
        console.error('Failed to resubscribe:', error);
      }
    });
  }

  /**
   * Transaction processing pipeline
   * Processes a transaction hash through all stages: fetch → filter → decode → classify → broadcast
   */
  private async processTransaction(txHash: string): Promise<void> {
    try {
      // Stage 1: Fetch transaction details
      const transaction = await this.processor.processTransactionHash(txHash);
      if (!transaction) {
        return; // Transaction fetch failed, already logged
      }

      // Stage 2: Filter by target address (Uniswap V3 Router)
      if (!this.processor.isTargetTransaction(transaction)) {
        return; // Not a Uniswap V3 transaction, skip silently
      }

      // Stage 3: Decode transaction input data
      const decoded = this.decoder.decode(
        transaction.input,
        transaction.hash,
        transaction.from,
        transaction.to!,
        transaction.value
      );

      if (!decoded) {
        return; // Decoding failed, already logged
      }

      // Stage 4: Check if it's a swap function
      if (!this.decoder.isSwapFunction(decoded.functionName)) {
        return; // Not a swap function, skip silently
      }

      // Stage 5: Classify transaction by risk level
      const classified = this.classifier.classify(decoded);

      // Stage 6: Broadcast to connected clients
      this.broadcaster.broadcast(classified);

      // Log detected transaction
      const riskEmoji = classified.riskLevel === 'HIGH' ? '🚨' : '✓';
      const riskColor = classified.riskLevel === 'HIGH' ? '\x1b[31m' : '\x1b[32m';
      const resetColor = '\x1b[0m';
      
      console.log(
        `${riskEmoji} ${riskColor}${classified.riskLevel}${resetColor} | ` +
        `${classified.ethValue} ETH | ` +
        `${classified.functionName} | ` +
        `${classified.hash.substring(0, 10)}...`
      );
    } catch (error) {
      console.error(`Error processing transaction ${txHash}:`, error);
    }
  }

  /**
   * Set up graceful shutdown handlers
   */
  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      if (this.isShuttingDown) {
        return;
      }

      this.isShuttingDown = true;
      console.log('');
      console.log(`Received ${signal}, shutting down gracefully...`);

      try {
        // Close WebSocket connection
        this.wsClient.close();
        console.log('✓ WebSocket connection closed');

        // Close Socket.io server
        await this.broadcaster.close();
        console.log('✓ Socket.io server closed');

        console.log('✓ Shutdown complete');
        process.exit(0);
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    // Handle termination signals
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      console.error('Uncaught exception:', error);
      shutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled rejection at:', promise, 'reason:', reason);
      shutdown('unhandledRejection');
    });
  }
}

/**
 * Main entry point
 */
async function main() {
  try {
    // Load configuration
    const config = loadConfiguration();

    // Create and start server
    const server = new MEVExorcistServer(config);
    await server.start();
  } catch (error) {
    console.error('Failed to start MEV Exorcist server:', error);
    process.exit(1);
  }
}

// Start the server
main();
