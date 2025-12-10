/**
 * Utility functions for generating blockchain explorer links
 * Supports BaseScan for Base network
 */

/**
 * Get the base URL for the block explorer
 * Defaults to BaseScan for Base network
 */
export function getExplorerBaseUrl(): string {
  return process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://basescan.org';
}

/**
 * Generate a transaction link for the block explorer
 * 
 * @param txHash - Transaction hash
 * @returns Full URL to view transaction on block explorer
 */
export function generateTransactionLink(txHash: string): string {
  const baseUrl = getExplorerBaseUrl();
  return `${baseUrl}/tx/${txHash}`;
}

/**
 * Generate an address link for the block explorer
 * 
 * @param address - Ethereum address
 * @returns Full URL to view address on block explorer
 */
export function generateAddressLink(address: string): string {
  const baseUrl = getExplorerBaseUrl();
  return `${baseUrl}/address/${address}`;
}

/**
 * Generate a block link for the block explorer
 * 
 * @param blockNumber - Block number
 * @returns Full URL to view block on block explorer
 */
export function generateBlockLink(blockNumber: number | string): string {
  const baseUrl = getExplorerBaseUrl();
  return `${baseUrl}/block/${blockNumber}`;
}

/**
 * Get the network name from environment
 * Defaults to 'base'
 */
export function getNetworkName(): string {
  return process.env.NEXT_PUBLIC_NETWORK_NAME || 'base';
}
