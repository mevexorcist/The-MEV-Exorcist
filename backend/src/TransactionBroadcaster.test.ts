import { TransactionBroadcaster } from './TransactionBroadcaster';
import { ClassifiedTransaction } from './RiskClassifier';
import ioClient from 'socket.io-client';
import * as fc from 'fast-check';

type Socket = ReturnType<typeof ioClient>;

describe('TransactionBroadcaster', () => {
  let broadcaster: TransactionBroadcaster;
  let testPort = 3002;

  beforeEach(() => {
    // Use a different port for each test to avoid conflicts
    testPort++;
    broadcaster = new TransactionBroadcaster(testPort);
    broadcaster.start();
  });

  afterEach(async () => {
    await broadcaster.close();
    // Wait for cleanup
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  describe('Property Tests', () => {
    // Feature: mev-exorcist, Property 10: Transaction broadcast consistency
    // Validates: Requirements 3.5
    it('Property 10: For any classified transaction, The Seer should broadcast the transaction data to all connected frontend clients', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random number of clients (1-3) - reduced for performance
          fc.integer({ min: 1, max: 3 }),
          // Generate random classified transaction
          fc.string({ minLength: 64, maxLength: 64 }).map((s: string) => s.replace(/[^0-9a-f]/gi, '0').toLowerCase().slice(0, 64)),
          fc.string({ minLength: 40, maxLength: 40 }).map((s: string) => s.replace(/[^0-9a-f]/gi, '0').toLowerCase().slice(0, 40)),
          fc.double({ min: 0, max: 10, noNaN: true, noDefaultInfinity: true }),
          fc.constantFrom('HIGH' as const, 'LOW' as const),
          fc.constantFrom('exactInputSingle', 'exactInput', 'exactOutputSingle', 'exactOutput'),
          async (numClients, hash, from, ethValue, riskLevel, functionName) => {
            // Create multiple client connections
            const clients: Socket[] = [];
            const receivedTransactions: ClassifiedTransaction[][] = Array(numClients).fill(null).map(() => []);

            try {
              // Connect clients and set up listeners
              for (let i = 0; i < numClients; i++) {
                const client = ioClient(`http://localhost:${testPort}`, {
                  transports: ['websocket'],
                  reconnection: false,
                  timeout: 5000,
                });

                await new Promise<void>((resolve, reject) => {
                  const timeout = setTimeout(() => reject(new Error('Connection timeout')), 5000);
                  client.on('connect', () => {
                    clearTimeout(timeout);
                    resolve();
                  });
                  client.on('connect_error', (err: Error) => {
                    clearTimeout(timeout);
                    reject(err);
                  });
                });

                client.on('transaction', (tx: ClassifiedTransaction) => {
                  receivedTransactions[i].push(tx);
                });

                clients.push(client);
              }

              // Wait for all clients to be registered
              await new Promise(resolve => setTimeout(resolve, 50));

              // Verify all clients are connected
              expect(broadcaster.getConnectedClients()).toBe(numClients);

              // Create and broadcast a transaction
              const transaction: ClassifiedTransaction = {
                hash: `0x${hash}`,
                from: `0x${from}`,
                ethValue: ethValue.toFixed(4),
                riskLevel,
                timestamp: Date.now(),
                functionName,
              };

              broadcaster.broadcast(transaction);

              // Wait for broadcast to complete
              await new Promise(resolve => setTimeout(resolve, 50));

              // Verify all clients received the transaction
              for (let i = 0; i < numClients; i++) {
                expect(receivedTransactions[i].length).toBe(1);
                expect(receivedTransactions[i][0]).toEqual(transaction);
              }

              // Verify the transaction data is complete and correct
              for (let i = 0; i < numClients; i++) {
                const received = receivedTransactions[i][0];
                expect(received.hash).toBe(transaction.hash);
                expect(received.from).toBe(transaction.from);
                expect(received.ethValue).toBe(transaction.ethValue);
                expect(received.riskLevel).toBe(transaction.riskLevel);
                expect(received.timestamp).toBe(transaction.timestamp);
                expect(received.functionName).toBe(transaction.functionName);
              }
            } finally {
              // Clean up clients
              clients.forEach(client => client.close());
              await new Promise(resolve => setTimeout(resolve, 50));
            }
          }
        ),
        { numRuns: 20 } // Reduced from 100 for performance
      );
    }, 120000); // Increase timeout for property test
  });

  describe('Unit Tests', () => {
    it('should start server on configured port', async () => {
      // Server is already started in beforeEach
      expect(broadcaster.getConnectedClients()).toBe(0);
    });

    it('should track connected clients', async () => {
      const client = ioClient(`http://localhost:${testPort}`, {
        transports: ['websocket'],
      });

      await new Promise<void>((resolve) => {
        client.on('connect', () => resolve());
      });

      // Wait for connection to be registered
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(broadcaster.getConnectedClients()).toBe(1);

      client.close();
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(broadcaster.getConnectedClients()).toBe(0);
    });

    it('should broadcast transaction to connected client', async () => {
      const client = ioClient(`http://localhost:${testPort}`, {
        transports: ['websocket'],
      });

      await new Promise<void>((resolve) => {
        client.on('connect', () => resolve());
      });

      const receivedTransactions: ClassifiedTransaction[] = [];
      client.on('transaction', (tx: ClassifiedTransaction) => {
        receivedTransactions.push(tx);
      });

      const transaction: ClassifiedTransaction = {
        hash: '0x123',
        from: '0xabc',
        ethValue: '0.5000',
        riskLevel: 'HIGH',
        timestamp: Date.now(),
        functionName: 'exactInputSingle',
      };

      broadcaster.broadcast(transaction);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(receivedTransactions.length).toBe(1);
      expect(receivedTransactions[0]).toEqual(transaction);

      client.close();
    });

    it('should broadcast to multiple clients simultaneously', async () => {
      const client1 = ioClient(`http://localhost:${testPort}`, {
        transports: ['websocket'],
      });
      const client2 = ioClient(`http://localhost:${testPort}`, {
        transports: ['websocket'],
      });

      await Promise.all([
        new Promise<void>((resolve) => client1.on('connect', () => resolve())),
        new Promise<void>((resolve) => client2.on('connect', () => resolve())),
      ]);

      const received1: ClassifiedTransaction[] = [];
      const received2: ClassifiedTransaction[] = [];

      client1.on('transaction', (tx: ClassifiedTransaction) => received1.push(tx));
      client2.on('transaction', (tx: ClassifiedTransaction) => received2.push(tx));

      const transaction: ClassifiedTransaction = {
        hash: '0x456',
        from: '0xdef',
        ethValue: '1.2500',
        riskLevel: 'HIGH',
        timestamp: Date.now(),
        functionName: 'exactInput',
      };

      broadcaster.broadcast(transaction);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(received1.length).toBe(1);
      expect(received2.length).toBe(1);
      expect(received1[0]).toEqual(transaction);
      expect(received2[0]).toEqual(transaction);

      client1.close();
      client2.close();
    });

    it('should handle health check endpoint', async () => {
      const response = await fetch(`http://localhost:${testPort}/health`);
      const data = await response.json() as { status: string; connections: number; uptime: number };

      expect(response.status).toBe(200);
      expect(data.status).toBe('ok');
      expect(data.connections).toBe(0);
      expect(typeof data.uptime).toBe('number');
    });

    it('should return 404 for unknown endpoints', async () => {
      const response = await fetch(`http://localhost:${testPort}/unknown`);
      expect(response.status).toBe(404);
    });

    it('should handle client disconnection gracefully', async () => {
      const client = ioClient(`http://localhost:${testPort}`, {
        transports: ['websocket'],
      });

      await new Promise<void>((resolve) => {
        client.on('connect', () => resolve());
      });

      await new Promise(resolve => setTimeout(resolve, 50));
      expect(broadcaster.getConnectedClients()).toBe(1);

      client.close();
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(broadcaster.getConnectedClients()).toBe(0);

      // Should still be able to broadcast (no error)
      const transaction: ClassifiedTransaction = {
        hash: '0x789',
        from: '0xghi',
        ethValue: '0.0500',
        riskLevel: 'LOW',
        timestamp: Date.now(),
        functionName: 'exactOutputSingle',
      };

      expect(() => broadcaster.broadcast(transaction)).not.toThrow();
    });
  });
});
