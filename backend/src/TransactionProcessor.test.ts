import { ethers } from 'ethers';
import * as fc from 'fast-check';
import { TransactionProcessor, Transaction } from './TransactionProcessor';

describe('TransactionProcessor', () => {
  const UNISWAP_V3_ROUTER = '0xE592427A0AEce92De3Edee1F18E0157C05861564';
  
  // Helper to create a mock provider
  const createMockProvider = (mockTransaction: any) => {
    return {
      getTransaction: jest.fn().mockResolvedValue(mockTransaction),
    } as unknown as ethers.JsonRpcProvider;
  };

  // Helper to generate hex strings
  const hexString = (length: number) => 
    fc.array(fc.integer({ min: 0, max: 15 }), { minLength: length, maxLength: length })
      .map(arr => '0x' + arr.map(n => n.toString(16)).join(''));

  describe('Property Tests', () => {
    // Feature: mev-exorcist, Property 1: Transaction detail fetching consistency
    // Validates: Requirements 1.3
    test('Property 1: For any transaction hash, processTransactionHash should fetch complete transaction details', async () => {
      await fc.assert(
        fc.asyncProperty(
          hexString(64), // transaction hash
          hexString(40), // from address
          hexString(40), // to address
          fc.bigInt({ min: 0n, max: 10000000000000000000n }), // value (0-10 ETH in wei)
          hexString(100), // input data
          fc.bigInt({ min: 1000000000n, max: 100000000000n }), // gasPrice (1-100 gwei)
          fc.bigInt({ min: 21000n, max: 10000000n }), // gas limit
          async (hash: string, from: string, to: string, value: bigint, input: string, gasPrice: bigint, gas: bigint) => {
            // Create mock ethers transaction
            const mockEthersTransaction = {
              hash,
              from,
              to,
              value,
              data: input,
              gasPrice,
              gasLimit: gas,
            };

            const mockProvider = createMockProvider(mockEthersTransaction);
            const processor = new TransactionProcessor(mockProvider, UNISWAP_V3_ROUTER);

            const result = await processor.processTransactionHash(hash);

            // Verify transaction details are fetched and converted correctly
            expect(result).not.toBeNull();
            expect(result?.hash).toBe(hash);
            expect(result?.from).toBe(from);
            expect(result?.to).toBe(to);
            expect(result?.value).toBe(value.toString());
            expect(result?.input).toBe(input);
            expect(result?.gasPrice).toBe(gasPrice.toString());
            expect(result?.gas).toBe(gas.toString());
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: mev-exorcist, Property 2: Router address filtering
    // Feature: mev-exorcist, Property 3: Non-router transaction filtering
    // Validates: Requirements 2.1, 2.2
    test('Property 2 & 3: For any transaction, isTargetTransaction should correctly filter by Uniswap V3 Router address', () => {
      fc.assert(
        fc.property(
          hexString(64), // hash
          hexString(40), // from
          fc.option(hexString(40), { nil: null }), // to (can be null)
          fc.string(), // value
          fc.string(), // input
          fc.option(fc.string(), { nil: null }), // gasPrice
          fc.string(), // gas
          (hash: string, from: string, to: string | null, value: string, input: string, gasPrice: string | null, gas: string) => {
            const mockProvider = {} as ethers.JsonRpcProvider;
            const processor = new TransactionProcessor(mockProvider, UNISWAP_V3_ROUTER);

            const transaction: Transaction = {
              hash,
              from,
              to,
              value,
              input,
              gasPrice,
              gas,
            };

            const result = processor.isTargetTransaction(transaction);

            // Property: Should return true only if 'to' matches Uniswap V3 Router (case-insensitive)
            if (to === null || to === undefined) {
              expect(result).toBe(false);
            } else if (to.toLowerCase() === UNISWAP_V3_ROUTER.toLowerCase()) {
              expect(result).toBe(true);
            } else {
              expect(result).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Unit Tests', () => {
    test('processTransactionHash returns null when transaction not found', async () => {
      const mockProvider = createMockProvider(null);
      const processor = new TransactionProcessor(mockProvider, UNISWAP_V3_ROUTER);

      const result = await processor.processTransactionHash('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');

      expect(result).toBeNull();
    });

    test('processTransactionHash returns null when provider throws error', async () => {
      const mockProvider = {
        getTransaction: jest.fn().mockRejectedValue(new Error('Network error')),
      } as unknown as ethers.JsonRpcProvider;
      
      const processor = new TransactionProcessor(mockProvider, UNISWAP_V3_ROUTER);

      const result = await processor.processTransactionHash('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');

      expect(result).toBeNull();
    });

    test('isTargetTransaction returns true for Uniswap V3 Router address', () => {
      const mockProvider = {} as ethers.JsonRpcProvider;
      const processor = new TransactionProcessor(mockProvider, UNISWAP_V3_ROUTER);

      const transaction: Transaction = {
        hash: '0xabc',
        from: '0x123',
        to: UNISWAP_V3_ROUTER,
        value: '1000000000000000000',
        input: '0x',
        gasPrice: '20000000000',
        gas: '21000',
      };

      expect(processor.isTargetTransaction(transaction)).toBe(true);
    });

    test('isTargetTransaction returns true for Uniswap V3 Router address (case insensitive)', () => {
      const mockProvider = {} as ethers.JsonRpcProvider;
      const processor = new TransactionProcessor(mockProvider, UNISWAP_V3_ROUTER);

      const transaction: Transaction = {
        hash: '0xabc',
        from: '0x123',
        to: UNISWAP_V3_ROUTER.toLowerCase(),
        value: '1000000000000000000',
        input: '0x',
        gasPrice: '20000000000',
        gas: '21000',
      };

      expect(processor.isTargetTransaction(transaction)).toBe(true);
    });

    test('isTargetTransaction returns false for non-router address', () => {
      const mockProvider = {} as ethers.JsonRpcProvider;
      const processor = new TransactionProcessor(mockProvider, UNISWAP_V3_ROUTER);

      const transaction: Transaction = {
        hash: '0xabc',
        from: '0x123',
        to: '0x0000000000000000000000000000000000000000',
        value: '1000000000000000000',
        input: '0x',
        gasPrice: '20000000000',
        gas: '21000',
      };

      expect(processor.isTargetTransaction(transaction)).toBe(false);
    });

    test('isTargetTransaction returns false when to address is null', () => {
      const mockProvider = {} as ethers.JsonRpcProvider;
      const processor = new TransactionProcessor(mockProvider, UNISWAP_V3_ROUTER);

      const transaction: Transaction = {
        hash: '0xabc',
        from: '0x123',
        to: null,
        value: '1000000000000000000',
        input: '0x',
        gasPrice: '20000000000',
        gas: '21000',
      };

      expect(processor.isTargetTransaction(transaction)).toBe(false);
    });
  });
});
