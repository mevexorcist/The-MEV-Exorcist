import { ethers } from 'ethers';
import { DecodedTransaction } from './ABIDecoder';

export interface ClassifiedTransaction {
  hash: string;
  from: string;
  ethValue: string; // formatted with 4 decimals
  riskLevel: 'HIGH' | 'LOW';
  timestamp: number;
  functionName: string;
}

/**
 * Risk classifier that analyzes decoded transactions
 * and assigns risk levels based on ETH value thresholds
 */
export class RiskClassifier {
  private riskThresholdEth: bigint;

  constructor(riskThresholdEth: string = '0.1') {
    // Convert ETH threshold to wei (1 ETH = 10^18 wei)
    this.riskThresholdEth = ethers.parseEther(riskThresholdEth);
  }

  /**
   * Classifies a decoded transaction by extracting relevant data
   * and assigning a risk level based on ETH value
   */
  classify(tx: DecodedTransaction): ClassifiedTransaction {
    const riskLevel = this.calculateRiskLevel(tx.value);
    const ethValue = this.formatEthValue(tx.value);

    return {
      hash: tx.hash,
      from: tx.from,
      ethValue,
      riskLevel,
      timestamp: Date.now(),
      functionName: tx.functionName,
    };
  }

  /**
   * Calculates risk level based on ETH value threshold
   * Returns 'HIGH' if value exceeds threshold, 'LOW' otherwise
   */
  calculateRiskLevel(ethValue: bigint): 'HIGH' | 'LOW' {
    return ethValue > this.riskThresholdEth ? 'HIGH' : 'LOW';
  }

  /**
   * Formats ETH value with exactly 4 decimal precision
   */
  private formatEthValue(weiValue: bigint): string {
    const ethValue = ethers.formatEther(weiValue);
    const numValue = parseFloat(ethValue);
    return numValue.toFixed(4);
  }
}
