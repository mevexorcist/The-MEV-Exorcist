'use client';

import { ClassifiedTransaction } from '@/types/transaction';
import { useMiniAppContext } from '@/hooks/useMiniAppContext';
import { analytics } from '@/utils/analytics';
import { useState } from 'react';

interface ShareButtonProps {
  transaction: ClassifiedTransaction;
}

/**
 * ShareButton component for sharing MEV alerts on Farcaster
 * Formats cast text with transaction details and generates deep link
 */
export function ShareButton({ transaction }: ShareButtonProps) {
  const { actions, isMiniApp } = useMiniAppContext();
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const handleShare = async () => {
    setIsSharing(true);
    setShareError(null);

    // Track share click
    analytics.track('share_click', {
      transaction_hash: transaction.hash,
      risk_level: transaction.riskLevel,
    });

    try {
      // Get app URL from environment or use default
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mev-exorcist.vercel.app';
      
      // Generate deep link with transaction hash
      const deepLink = `${appUrl}?tx=${transaction.hash}`;
      
      // Format cast text with transaction details
      const riskEmoji = transaction.riskLevel === 'HIGH' ? '🚨' : '✓';
      const castText = 
        `${riskEmoji} ${transaction.riskLevel} RISK MEV Target Detected!\n\n` +
        `💰 Value: ${transaction.ethValue} ETH\n` +
        `🔍 Function: ${transaction.functionName}\n` +
        `⏰ ${new Date(transaction.timestamp).toLocaleString()}\n\n` +
        `View details: ${deepLink}`;
      
      // Create Warpcast share URL
      const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(castText)}`;
      
      if (isMiniApp) {
        // Use Mini App SDK to open URL
        await actions.openUrl(shareUrl);
      } else {
        // Fallback: open in new window
        window.open(shareUrl, '_blank');
      }
      
      // Track successful share
      analytics.trackShare(transaction.hash, true);
    } catch (error) {
      console.error('Failed to share transaction:', error);
      setShareError('Failed to share. Please try again.');
      
      // Track share error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      analytics.trackShare(transaction.hash, false, errorMessage);
      
      // Fallback: copy to clipboard
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mev-exorcist.vercel.app';
        const deepLink = `${appUrl}?tx=${transaction.hash}`;
        await navigator.clipboard.writeText(deepLink);
        setShareError('Link copied to clipboard!');
      } catch (clipboardError) {
        console.error('Failed to copy to clipboard:', clipboardError);
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleShare}
        disabled={isSharing}
        className={`
          px-4 py-2 rounded font-mono text-sm
          border border-matrix-green text-matrix-green
          hover:bg-matrix-green hover:text-void-black
          transition-colors duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center justify-center gap-2
        `}
      >
        {isSharing ? (
          <>
            <span className="animate-spin">⚡</span>
            <span>Sharing...</span>
          </>
        ) : (
          <>
            <span>📢</span>
            <span>Share on Farcaster</span>
          </>
        )}
      </button>
      
      {shareError && (
        <div className="text-xs text-matrix-green opacity-70 text-center">
          {shareError}
        </div>
      )}
    </div>
  );
}
