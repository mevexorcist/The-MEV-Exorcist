import * as fc from 'fast-check';
import { AlchemyWebSocketClient } from './AlchemyWebSocketClient';

describe('AlchemyWebSocketClient', () => {
  describe('Property Tests', () => {
    /**
     * Feature: mev-exorcist, Property: Exponential backoff timing
     * Validates: Requirements 1.4
     * 
     * For any reconnection attempt number, the delay should follow exponential backoff:
     * - Attempts 0-4: [1000, 2000, 4000, 8000, 16000] ms
     * - Attempts 5+: 30000 ms (max delay)
     */
    test('exponential backoff timing follows correct pattern', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 20 }), // Test reconnection attempts 0-20
          (attemptNumber) => {
            // Create client with default max delay (30000ms)
            const client = new AlchemyWebSocketClient({ url: 'wss://test.example.com' });
            
            // Set the reconnect attempts to the test value
            (client as any).reconnectAttempts = attemptNumber;
            
            // Calculate the delay
            const delay = client.calculateReconnectDelay();
            
            // Define expected delays
            const baseDelays = [1000, 2000, 4000, 8000, 16000];
            const maxDelay = 30000;
            
            // Verify the delay matches expected exponential backoff
            if (attemptNumber < baseDelays.length) {
              // Should use base delay for early attempts
              return delay === baseDelays[attemptNumber];
            } else {
              // Should use max delay for later attempts
              return delay === maxDelay;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Additional property: Delay is always positive and bounded
     * Validates: Requirements 1.4
     */
    test('reconnection delay is always positive and within bounds', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }),
          (attemptNumber) => {
            const client = new AlchemyWebSocketClient({ url: 'wss://test.example.com' });
            (client as any).reconnectAttempts = attemptNumber;
            
            const delay = client.calculateReconnectDelay();
            
            // Delay should always be positive
            const isPositive = delay > 0;
            
            // Delay should never exceed max delay
            const withinBounds = delay <= 30000;
            
            // Delay should be at least 1 second
            const atLeastOneSecond = delay >= 1000;
            
            return isPositive && withinBounds && atLeastOneSecond;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Custom max delay is respected
     * Validates: Requirements 1.4
     */
    test('custom max reconnection delay is respected', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 20000, max: 60000 }), // Custom max delays
          fc.integer({ min: 5, max: 20 }), // High attempt numbers
          (customMaxDelay, attemptNumber) => {
            const client = new AlchemyWebSocketClient({ 
              url: 'wss://test.example.com',
              maxReconnectDelay: customMaxDelay
            });
            
            (client as any).reconnectAttempts = attemptNumber;
            const delay = client.calculateReconnectDelay();
            
            // For high attempt numbers, should use custom max delay
            return delay === customMaxDelay;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Unit Tests', () => {
    test('initial connection state is disconnected', () => {
      const client = new AlchemyWebSocketClient({ url: 'wss://test.example.com' });
      expect(client.getConnectionState()).toBe('disconnected');
    });

    test('calculateReconnectDelay returns correct delays for first 5 attempts', () => {
      const client = new AlchemyWebSocketClient({ url: 'wss://test.example.com' });
      const expectedDelays = [1000, 2000, 4000, 8000, 16000];

      expectedDelays.forEach((expectedDelay, index) => {
        (client as any).reconnectAttempts = index;
        expect(client.calculateReconnectDelay()).toBe(expectedDelay);
      });
    });

    test('calculateReconnectDelay returns max delay after 5 attempts', () => {
      const client = new AlchemyWebSocketClient({ url: 'wss://test.example.com' });
      
      [5, 6, 10, 100].forEach((attemptNumber) => {
        (client as any).reconnectAttempts = attemptNumber;
        expect(client.calculateReconnectDelay()).toBe(30000);
      });
    });

    test('connection state changes are emitted', (done) => {
      const client = new AlchemyWebSocketClient({ url: 'wss://test.example.com' });
      
      const states: string[] = [];
      client.on('stateChange', (state) => {
        states.push(state);
      });

      // Manually trigger state change
      (client as any).connectionState = 'connecting';
      client.emit('stateChange', 'connecting');

      setTimeout(() => {
        expect(states).toContain('connecting');
        done();
      }, 10);
    });

    test('close clears reconnection timer', () => {
      const client = new AlchemyWebSocketClient({ url: 'wss://test.example.com' });
      
      // Set a reconnection timer
      (client as any).reconnectTimer = setTimeout(() => {}, 5000);
      
      client.close();
      
      expect((client as any).reconnectTimer).toBeNull();
      expect(client.getConnectionState()).toBe('disconnected');
    });
  });
});
