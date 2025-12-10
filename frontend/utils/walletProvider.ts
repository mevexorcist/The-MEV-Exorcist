import { ethers } from 'ethers';

/**
 * Wallet provider selector utility
 * Checks for Mini App wallet provider availability and falls back to standard provider
 * Maintains compatibility with existing ethers.js code
 */

export interface WalletProviderOptions {
  miniAppProvider?: any;
  fallbackRpcUrl?: string;
}

/**
 * Get the appropriate Ethereum provider based on availability
 * Priority: Mini App provider > fallback RPC provider
 * 
 * @param options - Configuration options for provider selection
 * @returns ethers.js compatible provider
 */
export function getWalletProvider(options: WalletProviderOptions): ethers.Provider {
  const { miniAppProvider, fallbackRpcUrl } = options;
  
  // If Mini App provider is available, wrap it with ethers.js
  if (miniAppProvider) {
    try {
      return new ethers.BrowserProvider(miniAppProvider);
    } catch (error) {
      console.warn('Failed to create provider from Mini App wallet:', error);
    }
  }
  
  // Fall back to JSON-RPC provider
  if (fallbackRpcUrl) {
    return new ethers.JsonRpcProvider(fallbackRpcUrl);
  }
  
  // Last resort: use default provider (not recommended for production)
  console.warn('No wallet provider available, using default provider');
  return ethers.getDefaultProvider();
}

/**
 * Check if Mini App wallet provider is available
 * 
 * @param miniAppProvider - The Mini App wallet provider to check
 * @returns true if provider is available and valid
 */
export function isMiniAppProviderAvailable(miniAppProvider?: any): boolean {
  return !!miniAppProvider && typeof miniAppProvider === 'object';
}

/**
 * Get signer from provider if available
 * Returns null if no signer is available (read-only mode)
 * 
 * @param provider - ethers.js provider
 * @returns Signer instance or null
 */
export async function getSigner(provider: ethers.Provider): Promise<ethers.Signer | null> {
  try {
    if (provider instanceof ethers.BrowserProvider) {
      return await provider.getSigner();
    }
  } catch (error) {
    console.warn('Failed to get signer from provider:', error);
  }
  
  return null;
}

/**
 * Get wallet address from provider
 * Returns null if no wallet is connected
 * 
 * @param provider - ethers.js provider
 * @returns Wallet address or null
 */
export async function getWalletAddress(provider: ethers.Provider): Promise<string | null> {
  try {
    const signer = await getSigner(provider);
    if (signer) {
      return await signer.getAddress();
    }
  } catch (error) {
    console.warn('Failed to get wallet address:', error);
  }
  
  return null;
}
