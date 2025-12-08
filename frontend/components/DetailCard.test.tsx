import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { DetailCard } from './DetailCard';
import { ClassifiedTransaction } from '@/types/transaction';
import * as fc from 'fast-check';

// Generators for property-based testing
const arbitraryAddress = fc
  .string({ minLength: 40, maxLength: 40 })
  .map((s: string) => '0x' + s.replace(/[^0-9a-f]/gi, '0').toLowerCase().slice(0, 40));

const arbitraryHash = fc
  .string({ minLength: 64, maxLength: 64 })
  .map((s: string) => '0x' + s.replace(/[^0-9a-f]/gi, '0').toLowerCase().slice(0, 64));

const arbitraryEthValue = fc
  .double({ min: 0, max: 10, noNaN: true, noDefaultInfinity: true })
  .map((n) => n.toFixed(4));

const arbitraryRiskLevel = fc.constantFrom('HIGH' as const, 'LOW' as const);

const arbitraryFunctionName = fc.constantFrom(
  'exactInputSingle',
  'exactInput',
  'exactOutputSingle',
  'exactOutput',
  'swapExactTokensForTokens'
);

const arbitraryTransaction = fc.record({
  hash: arbitraryHash,
  from: arbitraryAddress,
  ethValue: arbitraryEthValue,
  riskLevel: arbitraryRiskLevel,
  timestamp: fc.integer({ min: 1000000000000, max: Date.now() }),
  functionName: arbitraryFunctionName,
}) as fc.Arbitrary<ClassifiedTransaction>;

describe('DetailCard', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  // Feature: mev-exorcist, Property 18: Detail card display trigger
  // Validates: Requirements 7.1
  describe('Property 18: Detail card display trigger', () => {
    it('should display detail card for any HIGH risk transaction', () => {
      fc.assert(
        fc.property(arbitraryTransaction, (tx) => {
          // Only test HIGH risk transactions
          if (tx.riskLevel !== 'HIGH') {
            return true;
          }

          const { container } = render(
            <DetailCard transaction={tx} onClose={mockOnClose} />
          );

          // Verify the detail card is displayed
          const overlay = container.querySelector('.fixed.inset-0');
          expect(overlay).toBeInTheDocument();

          // Verify HUNTED label is present using container query
          const huntedLabel = container.querySelector('h2');
          expect(huntedLabel).toBeInTheDocument();
          expect(huntedLabel?.textContent).toBe('HUNTED');

          cleanup();
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should not display detail card when transaction is null', () => {
      const { container } = render(
        <DetailCard transaction={null} onClose={mockOnClose} />
      );

      // Verify no overlay is rendered
      const overlay = container.querySelector('.fixed.inset-0');
      expect(overlay).not.toBeInTheDocument();
    });
  });

  // Feature: mev-exorcist, Property 19: Address truncation format
  // Validates: Requirements 7.2
  describe('Property 19: Address truncation format', () => {
    it('should truncate any wallet address to format 0x1234...5678', () => {
      fc.assert(
        fc.property(arbitraryTransaction, (tx) => {
          const { container } = render(<DetailCard transaction={tx} onClose={mockOnClose} />);

          // Find the victim wallet address display using container query
          const labels = Array.from(container.querySelectorAll('.text-sm.opacity-70'));
          const victimWalletLabel = labels.find(el => el.textContent === 'VICTIM WALLET');
          expect(victimWalletLabel).toBeDefined();
          
          const addressElement = victimWalletLabel?.nextElementSibling;
          expect(addressElement).toBeInTheDocument();
          const displayedAddress = addressElement?.textContent || '';

          // Verify truncation format: 0x + 4 chars + ... (3 dots) + 4 chars
          const truncationPattern = /^0x[0-9a-fA-F]{4}\.\.\.[0-9a-fA-F]{4}$/;
          expect(displayedAddress).toMatch(truncationPattern);

          // Verify it starts with the first 6 characters of the original address
          expect(displayedAddress.substring(0, 6)).toBe(tx.from.substring(0, 6));

          // Verify it ends with the last 4 characters of the original address
          expect(displayedAddress.substring(displayedAddress.length - 4)).toBe(
            tx.from.substring(tx.from.length - 4)
          );

          cleanup();
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });

  // Feature: mev-exorcist, Property 20: ETH value precision
  // Validates: Requirements 7.3
  describe('Property 20: ETH value precision', () => {
    it('should display any ETH value with exactly 4 decimal precision', () => {
      fc.assert(
        fc.property(arbitraryTransaction, (tx) => {
          const { container } = render(<DetailCard transaction={tx} onClose={mockOnClose} />);

          // Find the ETH value display using container query
          const labels = Array.from(container.querySelectorAll('.text-sm.opacity-70'));
          const ethValueLabel = labels.find(el => el.textContent === 'ETH VALUE');
          expect(ethValueLabel).toBeDefined();
          
          const ethValueElement = ethValueLabel?.nextElementSibling;
          expect(ethValueElement).toBeInTheDocument();
          const displayedValue = ethValueElement?.textContent || '';

          // Extract the numeric part (remove " ETH" suffix)
          const numericPart = displayedValue.replace(' ETH', '').replace(/\s+/g, '');

          // Verify it has exactly 4 decimal places
          const decimalPattern = /^\d+\.\d{4}$/;
          expect(numericPart).toMatch(decimalPattern);

          // Verify the value matches the formatted transaction value
          const expectedValue = parseFloat(tx.ethValue).toFixed(4);
          expect(numericPart).toBe(expectedValue);

          cleanup();
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });

  // Feature: mev-exorcist, Property 21: Etherscan link generation
  // Validates: Requirements 7.4
  describe('Property 21: Etherscan link generation', () => {
    it('should generate correct Etherscan link for any transaction hash', () => {
      fc.assert(
        fc.property(arbitraryTransaction, (tx) => {
          const { container } = render(<DetailCard transaction={tx} onClose={mockOnClose} />);

          // Find the transaction hash link using container query
          const links = container.querySelectorAll('a[href*="etherscan.io"]');
          expect(links.length).toBeGreaterThan(0);
          
          const linkElement = links[0] as HTMLAnchorElement;

          expect(linkElement).toBeInTheDocument();
          expect(linkElement.tagName).toBe('A');

          // Verify the link href contains the transaction hash
          const href = linkElement.getAttribute('href') || '';
          expect(href).toContain(tx.hash);

          // Verify the link points to Etherscan
          expect(href).toMatch(/etherscan\.io\/tx\//);

          // Verify the link opens in a new tab
          expect(linkElement.getAttribute('target')).toBe('_blank');
          expect(linkElement.getAttribute('rel')).toBe('noopener noreferrer');

          // Verify the displayed text is the full transaction hash
          expect(linkElement.textContent).toBe(tx.hash);

          cleanup();
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Close functionality', () => {
    it('should call onClose when close button is clicked', () => {
      const mockTx: ClassifiedTransaction = {
        hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        from: '0x1234567890abcdef1234567890abcdef12345678',
        ethValue: '1.2345',
        riskLevel: 'HIGH',
        timestamp: Date.now(),
        functionName: 'exactInputSingle',
      };

      render(<DetailCard transaction={mockTx} onClose={mockOnClose} />);

      const closeButton = screen.getByLabelText('Close');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when escape key is pressed', () => {
      const mockTx: ClassifiedTransaction = {
        hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        from: '0x1234567890abcdef1234567890abcdef12345678',
        ethValue: '1.2345',
        riskLevel: 'HIGH',
        timestamp: Date.now(),
        functionName: 'exactInputSingle',
      };

      render(<DetailCard transaction={mockTx} onClose={mockOnClose} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });
});
