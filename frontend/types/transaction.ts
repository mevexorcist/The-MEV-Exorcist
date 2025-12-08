// Classified transaction sent from backend
export interface ClassifiedTransaction {
  hash: string;
  from: string;
  ethValue: string; // formatted with 4 decimals
  riskLevel: 'HIGH' | 'LOW';
  timestamp: number;
  functionName: string;
}
