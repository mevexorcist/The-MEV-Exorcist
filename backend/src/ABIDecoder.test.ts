import { ABIDecoder } from './ABIDecoder';
import * as fc from 'fast-check';
import { ethers } from 'ethers';

describe('ABIDecoder', () => {
  let decoder: ABIDecoder;

  beforeEach(() => {
    decoder = new ABIDecoder();
  });

  describe('isSwapFunction', () => {
    it('should identify swap functions correctly', () => {
      expect(decoder.isSwapFunction('exactInputSingle')).toBe(true);
      expect(decoder.isSwapFunction('exactInput')).toBe(true);
      expect(decoder.isSwapFunction('exactOutputSingle')).toBe(true);
      expect(decoder.isSwapFunction('exactOutput')).toBe(true);
      expect(decoder.isSwapFunction('multicall')).toBe(false);
      expect(decoder.isSwapFunction('unwrapWETH9')).toBe(false);
      expect(decoder.isSwapFunction('refundETH')).toBe(false);
    });
  });

  describe('decode', () => {
    it('should decode exactInputSingle transaction', () => {
      // Create a sample exactInputSingle transaction
      const iface = new ethers.Interface([
        'function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)',
      ]);

      const params = {
        tokenIn: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
        tokenOut: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
        fee: 3000,
        recipient: '0x1234567890123456789012345678901234567890',
        deadline: Math.floor(Date.now() / 1000) + 3600,
        amountIn: ethers.parseEther('1.0'),
        amountOutMinimum: ethers.parseUnits('1000', 6),
        sqrtPriceLimitX96: 0,
      };

      const inputData = iface.encodeFunctionData('exactInputSingle', [params]);
      const txHash = '0x' + '1'.repeat(64);
      const from = '0xabcdef1234567890abcdef1234567890abcdef12';
      const to = '0xE592427A0AEce92De3Edee1F18E0157C05861564';
      const value = '0';

      const decoded = decoder.decode(inputData, txHash, from, to, value);

      expect(decoded).not.toBeNull();
      expect(decoded?.functionName).toBe('exactInputSingle');
      expect(decoded?.hash).toBe(txHash);
      expect(decoded?.from).toBe(from);
      expect(decoded?.to).toBe(to);
      expect(decoded?.parameters.amountIn).toBe(ethers.parseEther('1.0'));
      expect(decoded?.parameters.amountOutMin).toBe(ethers.parseUnits('1000', 6));
      expect(decoded?.parameters.recipient).toBe(params.recipient);
      expect(decoded?.parameters.deadline).toBe(params.deadline);
    });

    it('should return null for invalid input data', () => {
      const invalidData = '0xinvaliddata';
      const txHash = '0x' + '2'.repeat(64);
      const from = '0xabcdef1234567890abcdef1234567890abcdef12';
      const to = '0xE592427A0AEce92De3Edee1F18E0157C05861564';
      const value = '0';

      const decoded = decoder.decode(invalidData, txHash, from, to, value);

      expect(decoded).toBeNull();
    });
  });

  // Feature: mev-exorcist, Property 4: Router transaction decoding
  // Validates: Requirements 2.3
  describe('Property 4: Router transaction decoding', () => {
    it('should successfully decode any valid Uniswap V3 swap transaction', () => {
      fc.assert(
        fc.property(
          // Generate random swap parameters
          fc.record({
            tokenIn: fc.string({ minLength: 40, maxLength: 40 }).map((s: string) => '0x' + s.replace(/[^0-9a-f]/gi, '0').toLowerCase().slice(0, 40)),
            tokenOut: fc.string({ minLength: 40, maxLength: 40 }).map((s: string) => '0x' + s.replace(/[^0-9a-f]/gi, '0').toLowerCase().slice(0, 40)),
            fee: fc.constantFrom(500, 3000, 10000), // Valid Uniswap V3 fee tiers
            recipient: fc.string({ minLength: 40, maxLength: 40 }).map((s: string) => '0x' + s.replace(/[^0-9a-f]/gi, '0').toLowerCase().slice(0, 40)),
            deadline: fc.integer({ min: Math.floor(Date.now() / 1000), max: Math.floor(Date.now() / 1000) + 86400 }),
            amountIn: fc.bigInt({ min: 1n, max: ethers.parseEther('1000') }),
            amountOutMinimum: fc.bigInt({ min: 1n, max: ethers.parseEther('1000') }),
          }),
          fc.string({ minLength: 64, maxLength: 64 }).map((s: string) => '0x' + s.replace(/[^0-9a-f]/gi, '0').toLowerCase().slice(0, 64)), // txHash
          fc.string({ minLength: 40, maxLength: 40 }).map((s: string) => '0x' + s.replace(/[^0-9a-f]/gi, '0').toLowerCase().slice(0, 40)), // from
          fc.string({ minLength: 40, maxLength: 40 }).map((s: string) => '0x' + s.replace(/[^0-9a-f]/gi, '0').toLowerCase().slice(0, 40)), // to
          (params, txHash, from, to) => {
            // Create valid transaction input data
            const iface = new ethers.Interface([
              'function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)',
            ]);

            const inputData = iface.encodeFunctionData('exactInputSingle', [{
              ...params,
              sqrtPriceLimitX96: 0,
            }]);

            // Decode the transaction
            const decoded = decoder.decode(inputData, txHash, from, to, '0');

            // Property: For any valid Uniswap V3 Router transaction, decoding should succeed
            expect(decoded).not.toBeNull();
            expect(decoded?.functionName).toBe('exactInputSingle');
            expect(decoded?.hash).toBe(txHash);
            expect(decoded?.from).toBe(from);
            expect(decoded?.to).toBe(to);
            
            // Verify parameters are extracted
            expect(decoded?.parameters.amountIn).toBeDefined();
            expect(decoded?.parameters.amountOutMin).toBeDefined();
            expect(decoded?.parameters.recipient).toBeDefined();
            expect(decoded?.parameters.deadline).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: mev-exorcist, Property 5: Swap parameter extraction
  // Validates: Requirements 2.5
  describe('Property 5: Swap parameter extraction', () => {
    it('should extract all swap parameters from decoded swap transactions', () => {
      fc.assert(
        fc.property(
          // Generate random swap parameters
          fc.record({
            tokenIn: fc.string({ minLength: 40, maxLength: 40 }).map((s: string) => '0x' + s.replace(/[^0-9a-f]/gi, '0').toLowerCase().slice(0, 40)),
            tokenOut: fc.string({ minLength: 40, maxLength: 40 }).map((s: string) => '0x' + s.replace(/[^0-9a-f]/gi, '0').toLowerCase().slice(0, 40)),
            fee: fc.constantFrom(500, 3000, 10000),
            recipient: fc.string({ minLength: 40, maxLength: 40 }).map((s: string) => '0x' + s.replace(/[^0-9a-f]/gi, '0').toLowerCase().slice(0, 40)),
            deadline: fc.integer({ min: Math.floor(Date.now() / 1000), max: Math.floor(Date.now() / 1000) + 86400 }),
            amountIn: fc.bigInt({ min: 1n, max: ethers.parseEther('1000') }),
            amountOutMinimum: fc.bigInt({ min: 1n, max: ethers.parseEther('1000') }),
          }),
          (params) => {
            // Create valid transaction input data
            const iface = new ethers.Interface([
              'function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)',
            ]);

            const inputData = iface.encodeFunctionData('exactInputSingle', [{
              ...params,
              sqrtPriceLimitX96: 0,
            }]);

            const txHash = '0x' + '1'.repeat(64);
            const from = '0xabcdef1234567890abcdef1234567890abcdef12';
            const to = '0xE592427A0AEce92De3Edee1F18E0157C05861564';

            // Decode the transaction
            const decoded = decoder.decode(inputData, txHash, from, to, '0');

            // Property: For any decoded swap transaction, all swap parameters should be extracted
            expect(decoded).not.toBeNull();
            
            if (decoded && decoder.isSwapFunction(decoded.functionName)) {
              // Verify all expected parameters are present
              expect(decoded.parameters.amountIn).toBe(params.amountIn);
              expect(decoded.parameters.amountOutMin).toBe(params.amountOutMinimum);
              // Normalize addresses to lowercase for comparison (ethers returns checksum format)
              expect(decoded.parameters.recipient?.toLowerCase()).toBe(params.recipient.toLowerCase());
              expect(decoded.parameters.deadline).toBe(params.deadline);
              
              // Verify no parameters are undefined
              expect(decoded.parameters.amountIn).toBeDefined();
              expect(decoded.parameters.amountOutMin).toBeDefined();
              expect(decoded.parameters.recipient).toBeDefined();
              expect(decoded.parameters.deadline).toBeDefined();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should extract parameters from exactInput (multi-hop) transactions', () => {
      fc.assert(
        fc.property(
          fc.record({
            path: fc.string({ minLength: 100, maxLength: 100 }).map((s: string) => '0x' + s.replace(/[^0-9a-f]/gi, '0').toLowerCase().slice(0, 100)),
            recipient: fc.string({ minLength: 40, maxLength: 40 }).map((s: string) => '0x' + s.replace(/[^0-9a-f]/gi, '0').toLowerCase().slice(0, 40)),
            deadline: fc.integer({ min: Math.floor(Date.now() / 1000), max: Math.floor(Date.now() / 1000) + 86400 }),
            amountIn: fc.bigInt({ min: 1n, max: ethers.parseEther('1000') }),
            amountOutMinimum: fc.bigInt({ min: 1n, max: ethers.parseEther('1000') }),
          }),
          (params) => {
            const iface = new ethers.Interface([
              'function exactInput((bytes path, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum)) external payable returns (uint256 amountOut)',
            ]);

            const inputData = iface.encodeFunctionData('exactInput', [params]);

            const txHash = '0x' + '2'.repeat(64);
            const from = '0xabcdef1234567890abcdef1234567890abcdef12';
            const to = '0xE592427A0AEce92De3Edee1F18E0157C05861564';

            const decoded = decoder.decode(inputData, txHash, from, to, '0');

            // Property: exactInput should also extract swap parameters
            expect(decoded).not.toBeNull();
            expect(decoded?.functionName).toBe('exactInput');
            
            if (decoded && decoder.isSwapFunction(decoded.functionName)) {
              expect(decoded.parameters.amountIn).toBe(params.amountIn);
              expect(decoded.parameters.amountOutMin).toBe(params.amountOutMinimum);
              // Normalize addresses to lowercase for comparison (ethers returns checksum format)
              expect(decoded.parameters.recipient?.toLowerCase()).toBe(params.recipient.toLowerCase());
              expect(decoded.parameters.deadline).toBe(params.deadline);
              expect(decoded.parameters.path).toBe(params.path);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
