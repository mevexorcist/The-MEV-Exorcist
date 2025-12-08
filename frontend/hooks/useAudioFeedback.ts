'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

interface UseAudioFeedbackReturn {
  playTick: () => void;
  playSiren: () => void;
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

export function useAudioFeedback(): UseAudioFeedbackReturn {
  const [isEnabled, setIsEnabled] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundQueueRef = useRef<Array<() => void>>([]);
  const isPlayingRef = useRef(false);

  // Initialize AudioContext on first user interaction
  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        try {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          setIsEnabled(true);
        } catch (error) {
          console.error('Failed to initialize AudioContext:', error);
        }
      }
    };

    // Listen for first user interaction
    const events = ['click', 'touchstart', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, initAudio, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, initAudio);
      });
      
      // Cleanup AudioContext
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Process sound queue
  const processQueue = useCallback(() => {
    if (isPlayingRef.current || soundQueueRef.current.length === 0) {
      return;
    }

    isPlayingRef.current = true;
    const nextSound = soundQueueRef.current.shift();
    
    if (nextSound) {
      nextSound();
    }
  }, []);

  // Play tick sound (100ms sine wave at 800Hz)
  const playTick = useCallback(() => {
    if (!isEnabled || !audioContextRef.current) {
      return;
    }

    const playSound = () => {
      const ctx = audioContextRef.current!;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);

      oscillator.onended = () => {
        isPlayingRef.current = false;
        processQueue();
      };
    };

    soundQueueRef.current.push(playSound);
    processQueue();
  }, [isEnabled, processQueue]);

  // Play siren sound (500ms oscillating square wave 400-800Hz)
  const playSiren = useCallback(() => {
    if (!isEnabled || !audioContextRef.current) {
      return;
    }

    const playSound = () => {
      const ctx = audioContextRef.current!;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = 'square';
      
      // Oscillate between 400Hz and 800Hz
      const duration = 0.5;
      const oscillationFrequency = 10; // 10 Hz oscillation
      
      oscillator.frequency.setValueAtTime(400, ctx.currentTime);
      
      // Create oscillation effect
      for (let i = 0; i < duration * oscillationFrequency; i++) {
        const time = ctx.currentTime + (i / oscillationFrequency);
        const freq = i % 2 === 0 ? 800 : 400;
        oscillator.frequency.setValueAtTime(freq, time);
      }

      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);

      oscillator.onended = () => {
        isPlayingRef.current = false;
        processQueue();
      };
    };

    soundQueueRef.current.push(playSound);
    processQueue();
  }, [isEnabled, processQueue]);

  const setEnabled = useCallback((enabled: boolean) => {
    setIsEnabled(enabled);
    
    // Clear queue if disabling
    if (!enabled) {
      soundQueueRef.current = [];
      isPlayingRef.current = false;
    }
  }, []);

  return {
    playTick,
    playSiren,
    isEnabled,
    setEnabled,
  };
}
