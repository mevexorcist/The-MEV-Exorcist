import { render } from '@testing-library/react';
import { TransactionStream } from './TransactionStream';
import { ClassifiedTransaction } from '@/types/transaction';
import * as fc from 'fast-check';

// Generators for property-based testing
const arbitraryLowRiskTransaction = (): fc.Arbitrary<ClassifiedTransaction> => fc.record({
  hash: fc.string({ minLength: 66, maxLength: 66 }).map(s => '0x' + s.substring(2).padEnd(64, '0')),
  from: fc.string({ minLength: 42, maxLength: 42 }).map(s => '0x' + s.substring(2).padEnd(40, '0')),
  ethValue: fc.double({ min: 0, max: 0.09, noNaN: true, noDefaultInfinity: true }).map(v => v.toFixed(4)),
  riskLevel: fc.constant('LOW' as const),
  timestamp: fc.integer({ min: 1000000000000, max: 9999999999999 }),
  functionName: fc.constantFrom('exactInputSingle', 'exactInput', 'exactOutputSingle'),
});

const arbitraryHighRiskTransaction = (): fc.Arbitrary<ClassifiedTransaction> => fc.record({
  hash: fc.string({ minLength: 66, maxLength: 66 }).map(s => '0x' + s.substring(2).padEnd(64, '0')),
  from: fc.string({ minLength: 42, maxLength: 42 }).map(s => '0x' + s.substring(2).padEnd(40, '0')),
  ethValue: fc.double({ min: 0.1, max: 10, noNaN: true, noDefaultInfinity: true }).map(v => v.toFixed(4)),
  riskLevel: fc.constant('HIGH' as const),
  timestamp: fc.integer({ min: 1000000000000, max: 9999999999999 }),
  functionName: fc.constantFrom('exactInputSingle', 'exactInput', 'exactOutputSingle'),
});

describe('TransactionStream Property Tests', () => {
  // Feature: mev-exorcist, Property 11: Low-risk transaction styling
  // Feature: mev-exorcist, Property 15: Low-risk transaction color consistency
  // Validates: Requirements 4.3, 5.3
  test('Property 11 & 15: Low-risk transactions should display with gray styling and green color', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryLowRiskTransaction(), { minLength: 1, maxLength: 5 }),
        (transactions) => {
          const { container } = render(
            <TransactionStream transactions={transactions} />
          );

          // Find all transaction elements with matrix-green text
          const txElements = container.querySelectorAll('[class*="text-matrix-green"]');
          
          // Should have at least one LOW risk transaction rendered
          expect(txElements.length).toBeGreaterThan(0);
          
          // Check each LOW risk element
          txElements.forEach((txElement) => {
            // Verify matrix-green color is applied
            expect(txElement.className).toContain('text-matrix-green');
            
            // Verify gray border (not red)
            expect(txElement.className).toContain('border-gray-700');
            expect(txElement.className).not.toContain('border-blood-red');
            
            // Verify no pulsing border animation for LOW risk
            expect(txElement.className).not.toContain('pulse-border');
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: mev-exorcist, Property 12: High-risk transaction styling
  // Feature: mev-exorcist, Property 14: High-risk transaction color consistency
  // Validates: Requirements 4.4, 5.2
  test('Property 12 & 14: High-risk transactions should display with red styling and pulsing border', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryHighRiskTransaction(), { minLength: 1, maxLength: 5 }),
        (transactions) => {
          const { container } = render(
            <TransactionStream transactions={transactions} />
          );

          // Find all transaction elements with blood-red text
          const txElements = container.querySelectorAll('[class*="text-blood-red"]');
          
          // Should have at least one HIGH risk transaction rendered
          expect(txElements.length).toBeGreaterThan(0);
          
          // Check each HIGH risk element
          txElements.forEach((txElement) => {
            // Verify blood-red color is applied
            expect(txElement.className).toContain('text-blood-red');
            
            // Verify pulsing border animation for HIGH risk
            expect(txElement.className).toContain('pulse-border');
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: mev-exorcist, Property 13: Transaction stream size limit
  // Validates: Requirements 4.5
  test('Property 13: Transaction stream should never exceed maxItems limit with FIFO removal', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.oneof(arbitraryLowRiskTransaction(), arbitraryHighRiskTransaction()),
          { minLength: 0, maxLength: 100 }
        ),
        fc.integer({ min: 1, max: 50 }),
        (transactions, maxItems) => {
          const { container } = render(
            <TransactionStream transactions={transactions} maxItems={maxItems} />
          );

          // Count rendered transaction elements by looking for the cursor-pointer class
          const renderedTransactions = container.querySelectorAll('.cursor-pointer');
          
          // Verify the count never exceeds maxItems
          expect(renderedTransactions.length).toBeLessThanOrEqual(maxItems);
          
          // Verify FIFO: if we have more transactions than maxItems,
          // the displayed ones should be the last maxItems from the array
          if (transactions.length > maxItems) {
            expect(renderedTransactions.length).toBe(maxItems);
            
            // Check that the oldest transactions are removed
            // The first displayed transaction should match the transaction at index (length - maxItems)
            const expectedFirstTx = transactions[transactions.length - maxItems];
            const firstRenderedElement = renderedTransactions[0];
            
            // Verify by checking if the hash is present in the rendered element
            expect(firstRenderedElement.textContent).toContain(
              expectedFirstTx.hash.substring(0, 10)
            );
          } else {
            // If transactions.length <= maxItems, all should be displayed
            expect(renderedTransactions.length).toBe(transactions.length);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('TransactionStream Unit Tests', () => {
  test('should render empty state when no transactions', () => {
    const { container } = render(<TransactionStream transactions={[]} />);
    const transactions = container.querySelectorAll('[class*="p-4 rounded"]');
    expect(transactions.length).toBe(0);
  });

  test('should call onTransactionClick when transaction is clicked', () => {
    const mockClick = jest.fn();
    const transaction: ClassifiedTransaction = {
      hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      from: '0x1234567890abcdef1234567890abcdef12345678',
      ethValue: '0.5000',
      riskLevel: 'HIGH',
      timestamp: Date.now(),
      functionName: 'exactInputSingle',
    };

    const { container } = render(
      <TransactionStream 
        transactions={[transaction]} 
        onTransactionClick={mockClick}
      />
    );

    const txElement = container.querySelector('[class*="p-4 rounded"]');
    txElement?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(mockClick).toHaveBeenCalledWith(transaction);
  });

  test('should display transaction details correctly', () => {
    const transaction: ClassifiedTransaction = {
      hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      from: '0xabcdef1234567890abcdef1234567890abcdef12',
      ethValue: '1.2500',
      riskLevel: 'HIGH',
      timestamp: Date.now(),
      functionName: 'exactInputSingle',
    };

    const { container } = render(<TransactionStream transactions={[transaction]} />);

    expect(container.textContent).toContain('HIGH');
    expect(container.textContent).toContain('1.2500 ETH');
    expect(container.textContent).toContain('0xabcdef12');
  });
});
