'use client';

import { useEffect, useState, useRef } from 'react';

interface RadarVisualizationProps {
  alertState: 'normal' | 'alert';
  onAlertStateChange?: (state: 'normal' | 'alert') => void;
}

export function RadarVisualization({
  alertState,
  onAlertStateChange,
}: RadarVisualizationProps) {
  const [internalAlertState, setInternalAlertState] = useState<'normal' | 'alert'>(alertState);
  const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync external alertState with internal state
  useEffect(() => {
    if (alertState === 'alert') {
      // Clear any existing timeout
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }

      // Set to alert state
      setInternalAlertState('alert');

      // Set timeout to return to normal after 3 seconds
      alertTimeoutRef.current = setTimeout(() => {
        setInternalAlertState('normal');
        onAlertStateChange?.('normal');
      }, 3000);
    }
  }, [alertState, onAlertStateChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
    };
  }, []);

  const isAlert = internalAlertState === 'alert';
  const rotationDuration = isAlert ? '2s' : '10s';
  const color = isAlert ? '#FF0000' : '#00FF00';

  return (
    <div className="flex items-center justify-center p-8">
      <svg
        width="300"
        height="300"
        viewBox="0 0 300 300"
        className="radar-svg gpu-accelerated"
      >
        {/* Outer circle */}
        <circle
          cx="150"
          cy="150"
          r="140"
          fill="none"
          stroke={color}
          strokeWidth="2"
          opacity="0.3"
        />

        {/* Middle circle */}
        <circle
          cx="150"
          cy="150"
          r="100"
          fill="none"
          stroke={color}
          strokeWidth="2"
          opacity="0.5"
        />

        {/* Inner circle */}
        <circle
          cx="150"
          cy="150"
          r="60"
          fill="none"
          stroke={color}
          strokeWidth="2"
          opacity="0.7"
        />

        {/* Center dot */}
        <circle
          cx="150"
          cy="150"
          r="5"
          fill={color}
        />

        {/* Rotating sweep line */}
        <g
          style={{
            transformOrigin: '150px 150px',
            animation: `rotate ${rotationDuration} linear infinite`,
          }}
        >
          <line
            x1="150"
            y1="150"
            x2="150"
            y2="10"
            stroke={color}
            strokeWidth="3"
            opacity="0.8"
          />
          {/* Sweep gradient effect */}
          <defs>
            <radialGradient id={`radarGradient-${isAlert ? 'alert' : 'normal'}`}>
              <stop offset="0%" stopColor={color} stopOpacity="0.6" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </radialGradient>
          </defs>
          <path
            d="M 150 150 L 150 10 A 140 140 0 0 1 290 150 Z"
            fill={`url(#radarGradient-${isAlert ? 'alert' : 'normal'})`}
            opacity="0.3"
          />
        </g>

        {/* Grid lines */}
        <line x1="150" y1="10" x2="150" y2="290" stroke={color} strokeWidth="1" opacity="0.2" />
        <line x1="10" y1="150" x2="290" y2="150" stroke={color} strokeWidth="1" opacity="0.2" />
      </svg>

      <style jsx>{`
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
