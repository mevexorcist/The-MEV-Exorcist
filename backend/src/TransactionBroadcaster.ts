import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import { ClassifiedTransaction } from './RiskClassifier';

/**
 * Transaction broadcaster that manages Socket.io server
 * and broadcasts classified transactions to all connected clients
 */
export class TransactionBroadcaster {
  private io: SocketIOServer;
  private httpServer: ReturnType<typeof createServer>;
  private port: number;
  private connectedClients: Set<string>;

  constructor(port: number) {
    this.port = port;
    this.connectedClients = new Set();
    
    // Create HTTP server for Socket.io
    this.httpServer = createServer((req, res) => {
      // Health check endpoint
      if (req.url === '/health' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'ok',
          connections: this.connectedClients.size,
          uptime: process.uptime(),
        }));
        return;
      }
      
      res.writeHead(404);
      res.end();
    });

    // Initialize Socket.io server with CORS configuration
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: '*', // In production, specify allowed origins
        methods: ['GET', 'POST'],
      },
    });

    this.setupEventHandlers();
  }

  /**
   * Sets up Socket.io connection and disconnection event handlers
   */
  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      this.connectedClients.add(socket.id);
      console.log(`Client connected: ${socket.id} (Total: ${this.connectedClients.size})`);

      socket.on('disconnect', () => {
        this.connectedClients.delete(socket.id);
        console.log(`Client disconnected: ${socket.id} (Total: ${this.connectedClients.size})`);
      });
    });
  }

  /**
   * Starts the Socket.io server on the configured port
   */
  start(): void {
    this.httpServer.listen(this.port, () => {
      console.log(`TransactionBroadcaster listening on port ${this.port}`);
    });
  }

  /**
   * Broadcasts a classified transaction to all connected clients
   */
  broadcast(transaction: ClassifiedTransaction): void {
    this.io.emit('transaction', transaction);
  }

  /**
   * Returns the number of currently connected clients
   */
  getConnectedClients(): number {
    return this.connectedClients.size;
  }

  /**
   * Closes the server and all connections (for testing/shutdown)
   */
  close(): Promise<void> {
    return new Promise((resolve) => {
      this.io.close(() => {
        this.httpServer.close(() => {
          resolve();
        });
      });
    });
  }
}
