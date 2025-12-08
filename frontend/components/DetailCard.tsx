'use client';

import { ClassifiedTransaction } from '@/types/transaction';
import { useEffect, useRef } from 'react';

interface DetailCardProps {
  transaction: ClassifiedTransaction | null;
  onClose: () => void;
}

export function DetailCard({ transaction, onClose }: DetailCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (transaction) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [transaction, onClose]);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (transaction) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [transaction, onClose]);

  if (!transaction) {
    return null;
  }

  // Truncate address to format: 0x1234...5678
  const truncateAddress = (address: string): string => {
    if (address.length < 10) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Format ETH value with exactly 4 decimal precision
  const formatEthValue = (value: string): string => {
    const num = parseFloat(value);
    return num.toFixed(4);
  };

  // Generate Etherscan link
  const etherscanBase = process.env.NEXT_PUBLIC_ETHERSCAN_BASE || 'https://sepolia.etherscan.io';
  const etherscanLink = `${etherscanBase}/tx/${transaction.hash}`;

  return (
    <div className="fixed inset-0 bg-void-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div
        ref={cardRef}
        className="bg-void-black border-4 border-blood-red p-8 max-w-2xl w-full font-mono relative pulse-border gpu-accelerated"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-blood-red hover:text-white text-2xl font-bold"
          aria-label="Close"
        >
          ×
        </button>

        {/* HUNTED status label */}
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold text-blood-red tracking-wider">
            HUNTED
          </h2>
        </div>

        {/* Transaction details */}
        <div className="space-y-4 text-matrix-green">
          {/* Victim wallet address */}
          <div>
            <div className="text-sm opacity-70 mb-1">VICTIM WALLET</div>
            <div className="text-xl font-bold text-blood-red">
              {truncateAddress(transaction.from)}
            </div>
          </div>

          {/* ETH value */}
          <div>
            <div className="text-sm opacity-70 mb-1">ETH VALUE</div>
            <div className="text-2xl font-bold text-blood-red">
              {formatEthValue(transaction.ethValue)} ETH
            </div>
          </div>

          {/* Transaction hash with Etherscan link */}
          <div>
            <div className="text-sm opacity-70 mb-1">TRANSACTION HASH</div>
            <a
              href={etherscanLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-matrix-green hover:text-white underline break-all"
            >
              {transaction.hash}
            </a>
          </div>

          {/* Function name */}
          <div>
            <div className="text-sm opacity-70 mb-1">FUNCTION</div>
            <div className="text-lg">
              {transaction.functionName}
            </div>
          </div>

          {/* Timestamp */}
          <div>
            <div className="text-sm opacity-70 mb-1">DETECTED AT</div>
            <div className="text-lg">
              {new Date(transaction.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
