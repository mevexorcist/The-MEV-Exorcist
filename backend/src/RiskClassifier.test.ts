import { RiskClassifier, ClassifiedTransaction } from './RiskClassifier';
import { DecodedTransaction } from './ABIDecoder';
import { ethers } from 'ethers';
import * as fc from 'fast-check';

describe('RiskClassifier', () => {
  let classifier: RiskClassifier;

  beforeEach(() => {
    classifier = new RiskClassifier('0.1');
  });

  describe('Property Tests', () => {
    // Feature: mev-exorcist, Property 6: ETH value extraction
    // Validates: Requirements 3.1
    test('Property 6: For any swap transaction decoded by The Seer, the system should extract the ETH value being swapped', () => {
      fc.assert(
        fc.property(
          // Generate random ETH values from 0 to 10 ETH
          fc.bigInt({ min: 0n, max: ethers.parseEther('10') }),
          fc.string({ minLength: 64, maxLength: 64 }).map((s: string) => s.replace(/[^0-9a-f]/gi, '0').toLowerCase().slice(0, 64)),
          fc.string({ minLength: 40, maxLength: 40 }).map((s: string) => s.replace(/[^0-9a-f]/gi, '0').toLowerCase().slice(0, 40)),
          fc.string({ minLength: 40, maxLength: 40 }).map((s: string) => s.replace(/[^0-9a-f]/gi, '0').toLowerCase().slice(0, 40)),
          fc.constantFrom('exactInputSingle', 'exactInput', 'exactOutputSingle', 'exactOutput'),
          (value, hash, from, to, functionName) => {
            const decodedTx: DecodedTransaction = {
              hash: `0x${hash}`,
              from: `0x${from}`,
              to: `0x${to}`,
              value,
              functionName,
              parameters: {
                amountIn: ethers.parseEther('1'),
                amountOutMin: ethers.parseEther('0.9'),
              },
            };

            const classified = classifier.classify(decodedTx);

            // Verify ETH value is extracted and formatted
            expect(classified.ethValue).toBeDefined();
            expect(typeof classified.ethValue).toBe('string');
            
            // Verify the extracted value matches the input value when converted back
            const extractedWei = ethers.parseEther(classified.ethValue);
            const originalEth = parseFloat(ethers.formatEther(value));
            const extractedEth = parseFloat(classified.ethValue);
            
            // Allow small floating point differences (within 0.0001 ETH precision)
            expect(Math.abs(originalEth - extractedEth)).toBeLessThan(0.00005);
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: mev-exorcist, Property 7: High-risk classification threshold
    // Feature: mev-exorcist, Property 8: Low-risk classification threshold
    // Validates: Requirements 3.2, 3.3
    test('Property 7 & 8: Risk classification thresholds - values >0.1 ETH are HIGH, values <=0.1 ETH are LOW', () => {
      fc.assert(
        fc.property(
          // Generate random ETH values from 0 to 10 ETH
          fc.double({ min: 0, max: 10, noNaN: true, noDefaultInfinity: true }),
          fc.string({ minLength: 64, maxLength: 64 }).map((s: string) => s.replace(/[^0-9a-f]/gi, '0').toLowerCase().slice(0, 64)),
          fc.string({ minLength: 40, maxLength: 40 }).map((s: string) => s.replace(/[^0-9a-f]/gi, '0').toLowerCase().slice(0, 40)),
          fc.string({ minLength: 40, maxLength: 40 }).map((s: string) => s.replace(/[^0-9a-f]/gi, '0').toLowerCase().slice(0, 40)),
          fc.constantFrom('exactInputSingle', 'exactInput', 'exactOutputSingle', 'exactOutput'),
          (ethValue, hash, from, to, functionName) => {
            const weiValue = ethers.parseEther(ethValue.toFixed(18));
            
            const decodedTx: DecodedTransaction = {
              hash: `0x${hash}`,
              from: `0x${from}`,
              to: `0x${to}`,
              value: weiValue,
              functionName,
              parameters: {},
            };

            const classified = classifier.classify(decodedTx);

            // Property 7: Values > 0.1 ETH should be HIGH risk
            // Property 8: Values <= 0.1 ETH should be LOW risk
            if (ethValue > 0.1) {
              expect(classified.riskLevel).toBe('HIGH');
            } else {
              expect(classified.riskLevel).toBe('LOW');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: mev-exorcist, Property 9: High-risk data extraction completeness
    // Validates: Requirements 3.4
    test('Property 9: For any transaction classified as High Risk, The Seer should extract sender address, hash, ETH value, and risk level', () => {
      fc.assert(
        fc.property(
          // Generate values > 0.1 ETH to ensure HIGH risk
          fc.double({ min: 0.1001, max: 10, noNaN: true, noDefaultInfinity: true }),
          fc.string({ minLength: 64, maxLength: 64 }).map((s: string) => s.replace(/[^0-9a-f]/gi, '0').toLowerCase().slice(0, 64)),
          fc.string({ minLength: 40, maxLength: 40 }).map((s: string) => s.replace(/[^0-9a-f]/gi, '0').toLowerCase().slice(0, 40)),
          fc.string({ minLength: 40, maxLength: 40 }).map((s: string) => s.replace(/[^0-9a-f]/gi, '0').toLowerCase().slice(0, 40)),
          fc.constantFrom('exactInputSingle', 'exactInput', 'exactOutputSingle', 'exactOutput'),
          (ethValue, hash, from, to, functionName) => {
            const weiValue = ethers.parseEther(ethValue.toFixed(18));
            
            const decodedTx: DecodedTransaction = {
              hash: `0x${hash}`,
              from: `0x${from}`,
              to: `0x${to}`,
              value: weiValue,
              functionName,
              parameters: {},
            };

            const classified = classifier.classify(decodedTx);

            // Verify this is HIGH risk
            expect(classified.riskLevel).toBe('HIGH');

            // Verify all required fields are present and not null/undefined
            expect(classified.from).toBeDefined();
            expect(classified.from).not.toBeNull();
            expect(classified.from).toBe(`0x${from}`);

            expect(classified.hash).toBeDefined();
            expect(classified.hash).not.toBeNull();
            expect(classified.hash).toBe(`0x${hash}`);

            expect(classified.ethValue).toBeDefined();
            expect(classified.ethValue).not.toBeNull();
            expect(typeof classified.ethValue).toBe('string');

            expect(classified.riskLevel).toBeDefined();
            expect(classified.riskLevel).not.toBeNull();
            expect(classified.riskLevel).toBe('HIGH');

            // Also verify timestamp and functionName are present
            expect(classified.timestamp).toBeDefined();
            expect(typeof classified.timestamp).toBe('number');
            
            expect(classified.functionName).toBeDefined();
            expect(classified.functionName).toBe(functionName);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Unit Tests', () => {
    test('should classify transaction with value > 0.1 ETH as HIGH risk', () => {
      const decodedTx: DecodedTransaction = {
        hash: '0x123',
        from: '0xabc',
        to: '0xdef',
        value: ethers.parseEther('0.5'),
        functionName: 'exactInputSingle',
        parameters: {},
      };

      const result = classifier.classify(decodedTx);

      expect(result.riskLevel).toBe('HIGH');
      expect(result.hash).toBe('0x123');
      expect(result.from).toBe('0xabc');
      expect(result.functionName).toBe('exactInputSingle');
    });

    test('should classify transaction with value <= 0.1 ETH as LOW risk', () => {
      const decodedTx: DecodedTransaction = {
        hash: '0x456',
        from: '0x789',
        to: '0xabc',
        value: ethers.parseEther('0.05'),
        functionName: 'exactInput',
        parameters: {},
      };

      const result = classifier.classify(decodedTx);

      expect(result.riskLevel).toBe('LOW');
      expect(result.hash).toBe('0x456');
      expect(result.from).toBe('0x789');
    });

    test('should format ETH value with exactly 4 decimal places', () => {
      const decodedTx: DecodedTransaction = {
        hash: '0x123',
        from: '0xabc',
        to: '0xdef',
        value: ethers.parseEther('1.23456789'),
        functionName: 'exactInputSingle',
        parameters: {},
      };

      const result = classifier.classify(decodedTx);

      expect(result.ethValue).toBe('1.2346');
      expect(result.ethValue.split('.')[1].length).toBe(4);
    });

    test('should handle boundary case of exactly 0.1 ETH as LOW risk', () => {
      const decodedTx: DecodedTransaction = {
        hash: '0x123',
        from: '0xabc',
        to: '0xdef',
        value: ethers.parseEther('0.1'),
        functionName: 'exactInputSingle',
        parameters: {},
      };

      const result = classifier.classify(decodedTx);

      expect(result.riskLevel).toBe('LOW');
    });

    test('should handle zero value transactions', () => {
      const decodedTx: DecodedTransaction = {
        hash: '0x123',
        from: '0xabc',
        to: '0xdef',
        value: 0n,
        functionName: 'exactInputSingle',
        parameters: {},
      };

      const result = classifier.classify(decodedTx);

      expect(result.riskLevel).toBe('LOW');
      expect(result.ethValue).toBe('0.0000');
    });

    test('should include timestamp in classified transaction', () => {
      const decodedTx: DecodedTransaction = {
        hash: '0x123',
        from: '0xabc',
        to: '0xdef',
        value: ethers.parseEther('0.5'),
        functionName: 'exactInputSingle',
        parameters: {},
      };

      const before = Date.now();
      const result = classifier.classify(decodedTx);
      const after = Date.now();

      expect(result.timestamp).toBeGreaterThanOrEqual(before);
      expect(result.timestamp).toBeLessThanOrEqual(after);
    });
  });
});
