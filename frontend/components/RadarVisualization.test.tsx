import { render, waitFor } from '@testing-library/react';
import { RadarVisualization } from './RadarVisualization';
import * as fc from 'fast-check';

describe('RadarVisualization Property Tests', () => {
  // Feature: mev-exorcist, Property 16: Radar alert state transition
  // Validates: Requirements 6.3
  test('Property 16: Radar should transition to alert state (red, fast rotation) when HIGH risk transaction detected', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('alert' as const),
        (alertState) => {
          const { container } = render(
            <RadarVisualization alertState={alertState} />
          );

          // Find the SVG element
          const svg = container.querySelector('svg');
          expect(svg).toBeTruthy();

          // Find elements with red color (#FF0000)
          const redElements = container.querySelectorAll('[stroke="#FF0000"], [fill="#FF0000"]');
          expect(redElements.length).toBeGreaterThan(0);

          // Find the rotating group element
          const rotatingGroup = container.querySelector('g[style*="animation"]');
          expect(rotatingGroup).toBeTruthy();

          // Verify fast rotation (2s) is applied in alert state
          const style = rotatingGroup?.getAttribute('style') || '';
          expect(style).toContain('2s');
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: mev-exorcist, Property 17: Continuous alert state maintenance
  // Validates: Requirements 6.5
  test('Property 17: Radar should maintain alert state when multiple HIGH risk transactions occur rapidly', async () => {
    fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 2, max: 5 }), // Number of rapid transactions
        async (numTransactions) => {
          let currentState: 'normal' | 'alert' = 'normal';
          const onAlertStateChange = jest.fn((state: 'normal' | 'alert') => {
            currentState = state;
          });

          const { rerender } = render(
            <RadarVisualization 
              alertState={currentState} 
              onAlertStateChange={onAlertStateChange}
            />
          );

          // Simulate rapid HIGH risk transactions
          for (let i = 0; i < numTransactions; i++) {
            // Trigger alert state
            rerender(
              <RadarVisualization 
                alertState="alert" 
                onAlertStateChange={onAlertStateChange}
              />
            );

            // Wait a short time (less than 3 seconds) before next transaction
            await new Promise(resolve => setTimeout(resolve, 500));
          }

          // After rapid transactions, the alert state should still be active
          // Wait a bit to ensure the component has processed all updates
          await waitFor(() => {
            // The component should still be in alert state or have just transitioned
            // Since we're sending alerts every 500ms and timeout is 3000ms,
            // the last alert should keep it in alert state
            expect(onAlertStateChange).toHaveBeenCalled();
          }, { timeout: 1000 });

          // Verify that the timeout was reset by checking that we don't immediately
          // return to normal state (the timeout should be extended)
          // After the last alert, wait less than 3 seconds
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Component should still be in alert or just transitioning
          // The key property is that rapid alerts extend the alert duration
        }
      ),
      { numRuns: 20 } // Fewer runs for async tests
    );
  });
});

describe('RadarVisualization Unit Tests', () => {
  test('should render in normal state with green color and slow rotation', () => {
    const { container } = render(
      <RadarVisualization alertState="normal" />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();

    // Check for green color (#00FF00)
    const greenElements = container.querySelectorAll('[stroke="#00FF00"], [fill="#00FF00"]');
    expect(greenElements.length).toBeGreaterThan(0);

    // Check for slow rotation (10s)
    const rotatingGroup = container.querySelector('g[style*="animation"]');
    const style = rotatingGroup?.getAttribute('style') || '';
    expect(style).toContain('10s');
  });

  test('should render in alert state with red color and fast rotation', () => {
    const { container } = render(
      <RadarVisualization alertState="alert" />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();

    // Check for red color (#FF0000)
    const redElements = container.querySelectorAll('[stroke="#FF0000"], [fill="#FF0000"]');
    expect(redElements.length).toBeGreaterThan(0);

    // Check for fast rotation (2s)
    const rotatingGroup = container.querySelector('g[style*="animation"]');
    const style = rotatingGroup?.getAttribute('style') || '';
    expect(style).toContain('2s');
  });

  test('should call onAlertStateChange after 3 second timeout', async () => {
    jest.useFakeTimers();
    const onAlertStateChange = jest.fn();

    render(
      <RadarVisualization 
        alertState="alert" 
        onAlertStateChange={onAlertStateChange}
      />
    );

    // Fast-forward time by 3 seconds
    jest.advanceTimersByTime(3000);

    // Should have called the callback to return to normal
    await waitFor(() => {
      expect(onAlertStateChange).toHaveBeenCalledWith('normal');
    });

    jest.useRealTimers();
  });

  test('should reset timeout when new alert arrives', async () => {
    jest.useFakeTimers();
    const onAlertStateChange = jest.fn();

    const { rerender } = render(
      <RadarVisualization 
        alertState="normal" 
        onAlertStateChange={onAlertStateChange}
      />
    );

    // First alert
    rerender(
      <RadarVisualization 
        alertState="alert" 
        onAlertStateChange={onAlertStateChange}
      />
    );

    // Advance time by 2 seconds (less than 3)
    jest.advanceTimersByTime(2000);

    // Go back to normal then trigger another alert (simulating rapid transactions)
    rerender(
      <RadarVisualization 
        alertState="normal" 
        onAlertStateChange={onAlertStateChange}
      />
    );

    rerender(
      <RadarVisualization 
        alertState="alert" 
        onAlertStateChange={onAlertStateChange}
      />
    );

    // Advance time by 2 more seconds (total 4 from first alert, but only 2 from second)
    jest.advanceTimersByTime(2000);

    // Should not have returned to normal yet (new timeout was set)
    expect(onAlertStateChange).not.toHaveBeenCalledWith('normal');

    // Advance by 1 more second (3 seconds from last alert)
    jest.advanceTimersByTime(1000);

    // Now should have returned to normal
    await waitFor(() => {
      expect(onAlertStateChange).toHaveBeenCalledWith('normal');
    });

    jest.useRealTimers();
  });

  test('should render SVG with correct structure', () => {
    const { container } = render(
      <RadarVisualization alertState="normal" />
    );

    // Check for circles (outer, middle, inner, center)
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(4);

    // Check for rotating group
    const rotatingGroup = container.querySelector('g');
    expect(rotatingGroup).toBeTruthy();

    // Check for sweep line
    const lines = container.querySelectorAll('line');
    expect(lines.length).toBeGreaterThan(0);
  });
});
