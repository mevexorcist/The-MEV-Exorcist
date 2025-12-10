import { useState, useEffect } from 'react';
import sdk from '@farcaster/frame-sdk';

export interface MiniAppUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
}

export interface MiniAppContextData {
  isMiniApp: boolean;
  user?: MiniAppUser;
  wallet: {
    ethProvider?: any;
  };
  actions: {
    ready: () => Promise<void>;
    openUrl: (url: string) => Promise<void>;
  };
}

/**
 * Custom hook that uses Frame SDK directly
 * Provides type-safe access to Mini App context, wallet, and actions
 * Handles cases where context is unavailable (standalone mode)
 */
export function useMiniAppContext(): MiniAppContextData {
  const [context, setContext] = useState<MiniAppContextData>({
    isMiniApp: false,
    user: undefined,
    wallet: {
      ethProvider: undefined,
    },
    actions: {
      ready: async () => {},
      openUrl: async (url: string) => {
        // Fallback to window.open
        window.open(url, '_blank');
      },
    },
  });

  useEffect(() => {
    // Check if Frame SDK is available
    const checkFrameContext = async () => {
      try {
        // Try to get context from Frame SDK
        const frameContext = await sdk.context;
        
        if (frameContext && frameContext.user) {
          setContext({
            isMiniApp: true,
            user: {
              fid: frameContext.user.fid,
              username: frameContext.user.username,
              displayName: frameContext.user.displayName,
              pfpUrl: frameContext.user.pfpUrl,
            },
            wallet: {
              ethProvider: sdk.wallet?.ethProvider,
            },
            actions: {
              ready: sdk.actions.ready,
              openUrl: sdk.actions.openUrl,
            },
          });
        }
      } catch (error) {
        // Not in Frame context, use defaults
        console.log('Running in standalone mode');
      }
    };

    checkFrameContext();
  }, []);

  return context;
}
