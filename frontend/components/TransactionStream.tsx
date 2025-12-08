'use client';

import { ClassifiedTransaction } from '@/types/transaction';

interface TransactionStreamProps {
  transactions: ClassifiedTransaction[];
  maxItems?: number;
  onTransactionClick?: (tx: ClassifiedTransaction) => void;
}

export function TransactionStream({
  transactions,
  maxItems = 50,
  onTransactionClick,
}: TransactionStreamProps) {
  // Implement FIFO removal - keep only the last maxItems transactions
  const displayTransactions = transactions.slice(-maxItems);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {displayTransactions.map((tx) => (
          <div
            key={tx.hash}
            onClick={() => onTransactionClick?.(tx)}
            className={`
              p-4 rounded font-mono text-sm cursor-pointer transition-all gpu-accelerated
              ${tx.riskLevel === 'HIGH' 
                ? 'text-blood-red border-2 pulse-border' 
                : 'text-matrix-green border border-gray-700'
              }
              hover:opacity-80
            `}
          >
            <div className="flex justify-between items-center">
              <span className="font-bold">{tx.riskLevel}</span>
              <span>{tx.ethValue} ETH</span>
            </div>
            <div className="text-xs mt-2 opacity-70">
              {tx.hash.substring(0, 10)}...{tx.hash.substring(tx.hash.length - 8)}
            </div>
            <div className="text-xs opacity-70">
              From: {tx.from.substring(0, 6)}...{tx.from.substring(tx.from.length - 4)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
