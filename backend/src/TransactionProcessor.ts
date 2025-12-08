import { ethers } from 'ethers';

export interface Transaction {
  hash: string;
  from: string;
  to: string | null;
  value: string;
  input: string;
  gasPrice: string | null;
  gas: string;
}

/**
 * Transaction processor that fetches transaction details from Alchemy
 * and filters by target address (Uniswap V3 Router)
 */
export class TransactionProcessor {
  private provider: ethers.JsonRpcProvider;
  private targetAddress: string;

  constructor(provider: ethers.JsonRpcProvider, targetAddress: string) {
    this.provider = provider;
    this.targetAddress = targetAddress.toLowerCase();
  }

  /**
   * Fetches complete transaction details from Alchemy
   * Returns null if transaction fetch fails
   */
  async processTransactionHash(txHash: string): Promise<Transaction | null> {
    try {
      const tx = await this.provider.getTransaction(txHash);
      
      if (!tx) {
        console.error(`Transaction not found: ${txHash}`);
        return null;
      }

      // Convert ethers transaction to our Transaction interface
      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value.toString(),
        input: tx.data,
        gasPrice: tx.gasPrice ? tx.gasPrice.toString() : null,
        gas: tx.gasLimit.toString(),
      };
    } catch (error) {
      console.error(`Failed to fetch transaction ${txHash}:`, error);
      return null;
    }
  }

  /**
   * Checks if transaction targets the Uniswap V3 Router address
   */
  isTargetTransaction(tx: Transaction): boolean {
    if (!tx.to) {
      return false;
    }
    return tx.to.toLowerCase() === this.targetAddress;
  }
}
