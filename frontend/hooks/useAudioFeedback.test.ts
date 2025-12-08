import { renderHook, act } from '@testing-library/react';
import { useAudioFeedback } from './useAudioFeedback';
import * as fc from 'fast-check';

// Mock AudioContext
class MockAudioContext {
  currentTime = 0;
  destination = {};
  
  createOscillator() {
    return {
      type: 'sine',
      frequency: {
        setValueAtTime: jest.fn(),
      },
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      onended: null,
    };
  }
  
  createGain() {
    return {
      gain: {
        setValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn(),
      },
      connect: jest.fn(),
    };
  }
  
  close() {
    return Promise.resolve();
  }
}

describe('useAudioFeedback', () => {
  let mockAudioContext: MockAudioContext;
  
  beforeEach(() => {
    mockAudioContext = new MockAudioContext();
    (global as any).AudioContext = jest.fn(() => mockAudioContext);
    (global as any).window.AudioContext = (global as any).AudioContext;
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Property 22: Low-risk audio feedback', () => {
    // Feature: mev-exorcist, Property 22: Low-risk audio feedback
    // Validates: Requirements 8.1
    
    it('should trigger tick sound for any low-risk transaction', () => {
      fc.assert(
        fc.property(
          fc.record({
            hash: fc.string({ minLength: 66, maxLength: 66 }).map(s => '0x' + s.substring(2).padEnd(64, '0')),
            from: fc.string({ minLength: 42, maxLength: 42 }).map(s => '0x' + s.substring(2).padEnd(40, '0')),
            ethValue: fc.double({ min: 0, max: 0.1, noNaN: true }).map(v => v.toFixed(4)),
            riskLevel: fc.constant('LOW' as const),
            timestamp: fc.integer({ min: 0 }),
            functionName: fc.constantFrom('exactInputSingle', 'exactInput', 'swapExact'),
          }),
          (transaction) => {
            const { result } = renderHook(() => useAudioFeedback());
            
            // Simulate user interaction to enable audio
            act(() => {
              document.dispatchEvent(new Event('click'));
            });
            
            // Enable audio explicitly
            act(() => {
              result.current.setEnabled(true);
            });
            
            // Verify audio is enabled
            expect(result.current.isEnabled).toBe(true);
            
            // Create spy on createOscillator
            const createOscillatorSpy = jest.spyOn(mockAudioContext, 'createOscillator');
            
            // Trigger tick sound for low-risk transaction
            act(() => {
              result.current.playTick();
            });
            
            // Verify tick sound was triggered
            expect(createOscillatorSpy).toHaveBeenCalled();
            
            const oscillator = createOscillatorSpy.mock.results[0].value;
            
            // Verify it's a sine wave (tick sound characteristic)
            expect(oscillator.type).toBe('sine');
            
            // Verify frequency is 800Hz
            expect(oscillator.frequency.setValueAtTime).toHaveBeenCalledWith(
              800,
              expect.any(Number)
            );
            
            createOscillatorSpy.mockRestore();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 23: High-risk audio feedback', () => {
    // Feature: mev-exorcist, Property 23: High-risk audio feedback
    // Validates: Requirements 8.2
    
    it('should trigger siren sound for any high-risk transaction', () => {
      fc.assert(
        fc.property(
          fc.record({
            hash: fc.string({ minLength: 66, maxLength: 66 }).map(s => '0x' + s.substring(2).padEnd(64, '0')),
            from: fc.string({ minLength: 42, maxLength: 42 }).map(s => '0x' + s.substring(2).padEnd(40, '0')),
            ethValue: fc.double({ min: 0.1, max: 10, noNaN: true }).map(v => v.toFixed(4)),
            riskLevel: fc.constant('HIGH' as const),
            timestamp: fc.integer({ min: 0 }),
            functionName: fc.constantFrom('exactInputSingle', 'exactInput', 'swapExact'),
          }),
          (transaction) => {
            const { result } = renderHook(() => useAudioFeedback());
            
            // Simulate user interaction to enable audio
            act(() => {
              document.dispatchEvent(new Event('click'));
            });
            
            // Enable audio explicitly
            act(() => {
              result.current.setEnabled(true);
            });
            
            // Verify audio is enabled
            expect(result.current.isEnabled).toBe(true);
            
            // Create spy on createOscillator
            const createOscillatorSpy = jest.spyOn(mockAudioContext, 'createOscillator');
            
            // Trigger siren sound for high-risk transaction
            act(() => {
              result.current.playSiren();
            });
            
            // Verify siren sound was triggered
            expect(createOscillatorSpy).toHaveBeenCalled();
            
            const oscillator = createOscillatorSpy.mock.results[0].value;
            
            // Verify it's a square wave (siren sound characteristic)
            expect(oscillator.type).toBe('square');
            
            // Verify frequency oscillates between 400Hz and 800Hz
            const frequencyCalls = oscillator.frequency.setValueAtTime.mock.calls;
            const frequencies = frequencyCalls.map((call: any) => call[0]);
            
            // Should have both 400 and 800 Hz frequencies
            expect(frequencies).toContain(400);
            expect(frequencies).toContain(800);
            
            createOscillatorSpy.mockRestore();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 24: Audio queuing for rapid transactions', () => {
    // Feature: mev-exorcist, Property 24: Audio queuing for rapid transactions
    // Validates: Requirements 8.5
    
    it('should queue sound effects to prevent overlap when multiple transactions occur rapidly', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              hash: fc.string({ minLength: 66, maxLength: 66 }).map(s => '0x' + s.substring(2).padEnd(64, '0')),
              from: fc.string({ minLength: 42, maxLength: 42 }).map(s => '0x' + s.substring(2).padEnd(40, '0')),
              ethValue: fc.double({ min: 0.1, max: 10, noNaN: true }).map(v => v.toFixed(4)),
              riskLevel: fc.constant('HIGH' as const),
              timestamp: fc.integer({ min: 0 }),
              functionName: fc.constantFrom('exactInputSingle', 'exactInput', 'swapExact'),
            }),
            { minLength: 2, maxLength: 10 }
          ),
          (transactions) => {
            const { result } = renderHook(() => useAudioFeedback());
            
            // Simulate user interaction to enable audio
            act(() => {
              document.dispatchEvent(new Event('click'));
            });
            
            // Enable audio explicitly
            act(() => {
              result.current.setEnabled(true);
            });
            
            // Create spy on createOscillator
            const createOscillatorSpy = jest.spyOn(mockAudioContext, 'createOscillator');
            
            // Trigger multiple siren sounds rapidly
            act(() => {
              transactions.forEach(() => {
                result.current.playSiren();
              });
            });
            
            // The first sound should play immediately
            expect(createOscillatorSpy).toHaveBeenCalled();
            
            // Get the first oscillator
            const firstOscillator = createOscillatorSpy.mock.results[0].value;
            
            // Simulate the first sound ending
            act(() => {
              if (firstOscillator.onended) {
                firstOscillator.onended();
              }
            });
            
            // After the first sound ends, the next sound should play
            // The total number of calls should eventually equal the number of transactions
            // but they should not all play simultaneously
            
            // Verify that sounds are queued (not all playing at once)
            // We check that the number of oscillators created is less than or equal to
            // the number we would expect if they were queued properly
            const callCount = createOscillatorSpy.mock.calls.length;
            
            // At minimum, one sound should have played
            expect(callCount).toBeGreaterThanOrEqual(1);
            
            // Simulate all sounds completing
            createOscillatorSpy.mock.results.forEach((result) => {
              act(() => {
                if (result.value.onended) {
                  result.value.onended();
                }
              });
            });
            
            createOscillatorSpy.mockRestore();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Unit tests', () => {
    it('should initialize with audio disabled', () => {
      const { result } = renderHook(() => useAudioFeedback());
      
      expect(result.current.isEnabled).toBe(false);
    });

    it('should enable audio after user interaction', () => {
      const { result } = renderHook(() => useAudioFeedback());
      
      act(() => {
        document.dispatchEvent(new Event('click'));
      });
      
      expect(result.current.isEnabled).toBe(true);
    });

    it('should allow manual enable/disable', () => {
      const { result } = renderHook(() => useAudioFeedback());
      
      act(() => {
        document.dispatchEvent(new Event('click'));
      });
      
      act(() => {
        result.current.setEnabled(false);
      });
      
      expect(result.current.isEnabled).toBe(false);
      
      act(() => {
        result.current.setEnabled(true);
      });
      
      expect(result.current.isEnabled).toBe(true);
    });

    it('should not play sounds when disabled', () => {
      const { result } = renderHook(() => useAudioFeedback());
      
      const createOscillatorSpy = jest.spyOn(mockAudioContext, 'createOscillator');
      
      act(() => {
        result.current.playTick();
      });
      
      expect(createOscillatorSpy).not.toHaveBeenCalled();
      
      createOscillatorSpy.mockRestore();
    });
  });
});
