import { ethers } from 'ethers';
import ioClient from 'socket.io-client';
import { TransactionProcessor } from './TransactionProcessor';
import { TransactionBroadcaster } from './TransactionBroadcaster';
import { ClassifiedTransaction } from './RiskClassifier';

/**
 * Integration test for end-to-end backend flow
 * Tests: Mock Alchemy WebSocket → Process → Broadcast flow
 * Validates: Requirements 1.1, 1.3, 3.5
 */
describe('Backend Integration - End-to-End Flow', () => {
  let broadcaster: TransactionBroadcaster;
  let clientSocket: ReturnType<typeof ioClient>;
  const TEST_PORT = 3002;
  const UNISWAP_V3_ROUTER = '0xE592427A0AEce92De3Edee1F18E0157C05861564';

  beforeAll((done) => {
    // Start broadcaster
    broadcaster = new TransactionBroadcaster(TEST_PORT);
    broadcaster.start();

    // Wait for server to start
    setTimeout(done, 100);
  });

  afterAll(async () => {
    if (clientSocket) {
      clientSocket.close();
    }
    await broadcaster.close();
  });

  beforeEach((done) => {
    // Create fresh client connection for each test
    clientSocket = ioClient(`http://localhost:${TEST_PORT}`);
    clientSocket.on('connect', done);
  });

  afterEach(() => {
    if (clientSocket) {
      clientSocket.close();
    }
  });

  it('should broadcast classified transactions to connected clients', (done) => {
    // Create a mock classified transaction
    const mockTransaction: ClassifiedTransaction = {
      hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      ethValue: '0.5000',
      riskLevel: 'HIGH',
      timestamp: Date.now(),
      functionName: 'exactInputSingle',
    };

    // Listen for broadcast transaction
    clientSocket.on('transaction', (transaction: ClassifiedTransaction) => {
      try {
        // Verify transaction was received correctly
        expect(transaction.hash).toBe(mockTransaction.hash);
        expect(transaction.from).toBe(mockTransaction.from);
        expect(transaction.riskLevel).toBe('HIGH');
        expect(transaction.ethValue).toBe('0.5000');
        expect(transaction.functionName).toBe('exactInputSingle');
        expect(transaction.timestamp).toBeGreaterThan(0);
        done();
      } catch (error) {
        done(error);
      }
    });

    // Broadcast the transaction
    setTimeout(() => {
      broadcaster.broadcast(mockTransaction);
    }, 100);
  }, 10000);

  it('should broadcast to multiple connected clients', (done) => {
    const mockTransaction: ClassifiedTransaction = {
      hash: '0x1111111111111111111111111111111111111111111111111111111111111111',
      from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      ethValue: '0.2000',
      riskLevel: 'HIGH',
      timestamp: Date.now(),
      functionName: 'exactInput',
    };

    // Create second client
    const client2 = ioClient(`http://localhost:${TEST_PORT}`);
    
    let receivedCount = 0;
    const checkDone = () => {
      receivedCount++;
      if (receivedCount === 2) {
        client2.close();
        done();
      }
    };

    clientSocket.on('transaction', (transaction: ClassifiedTransaction) => {
      expect(transaction.hash).toBe(mockTransaction.hash);
      checkDone();
    });

    client2.on('connect', () => {
      client2.on('transaction', (transaction: ClassifiedTransaction) => {
        expect(transaction.hash).toBe(mockTransaction.hash);
        checkDone();
      });

      // Broadcast after both clients are connected
      setTimeout(() => {
        broadcaster.broadcast(mockTransaction);
      }, 100);
    });
  }, 10000);

  it('should verify transaction processor filters by target address', async () => {
    // Create mock provider that returns a non-Uniswap transaction
    const mockProvider = {
      getTransaction: jest.fn().mockResolvedValue({
        hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        to: '0x0000000000000000000000000000000000000001', // Not Uniswap
        value: ethers.parseEther('1.0'),
        data: '0x',
        gasPrice: ethers.parseUnits('50', 'gwei'),
        gasLimit: BigInt(21000),
      }),
    } as any;

    const processor = new TransactionProcessor(mockProvider, UNISWAP_V3_ROUTER);

    const txHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
    const transaction = await processor.processTransactionHash(txHash);
    
    expect(transaction).not.toBeNull();
    expect(processor.isTargetTransaction(transaction!)).toBe(false);
  });

  it('should verify transaction processor accepts Uniswap transactions', async () => {
    // Create mock provider that returns a Uniswap transaction
    const mockProvider = {
      getTransaction: jest.fn().mockResolvedValue({
        hash: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
        from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        to: UNISWAP_V3_ROUTER,
        value: ethers.parseEther('0.05'),
        data: '0x',
        gasPrice: ethers.parseUnits('50', 'gwei'),
        gasLimit: BigInt(200000),
      }),
    } as any;

    const processor = new TransactionProcessor(mockProvider, UNISWAP_V3_ROUTER);

    const txHash = '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321';
    const transaction = await processor.processTransactionHash(txHash);
    
    expect(transaction).not.toBeNull();
    expect(processor.isTargetTransaction(transaction!)).toBe(true);
  });
});
