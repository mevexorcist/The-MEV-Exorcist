'use client';

import { ReactNode, useEffect } from 'react';
import sdk from '@farcaster/frame-sdk';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    // Initialize Frame SDK when app loads
    const initFrameSDK = async () => {
      try {
        await sdk.actions.ready();
        console.log('Frame SDK initialized');
      } catch (error) {
        console.warn('Frame SDK not available (running in standalone mode):', error);
      }
    };

    initFrameSDK();
  }, []);

  return <>{children}</>;
}
