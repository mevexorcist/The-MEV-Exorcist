'use client';

import { useState, useEffect } from 'react';
import { TransactionStream } from '@/components/TransactionStream';
import { RadarVisualization } from '@/components/RadarVisualization';
import { DetailCard } from '@/components/DetailCard';
import { useTransactionStream } from '@/hooks/useTransactionStream';
import { useAudioFeedback } from '@/hooks/useAudioFeedback';
import { ClassifiedTransaction } from '@/types/transaction';

export default function Home() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
  
  // Wire up hooks
  const { transactions, isConnected, error } = useTransactionStream(backendUrl);
  const { playTick, playSiren, isEnabled: audioEnabled, setEnabled: setAudioEnabled } = useAudioFeedback();
  
  // State for radar and detail card
  const [radarState, setRadarState] = useState<'normal' | 'alert'>('normal');
  const [selectedTransaction, setSelectedTransaction] = useState<ClassifiedTransaction | null>(null);

  // Connect transaction events to radar and audio systems
  useEffect(() => {
    if (transactions.length === 0) return;

    // Get the most recent transaction
    const latestTransaction = transactions[transactions.length - 1];

    if (latestTransaction.riskLevel === 'HIGH') {
      // Trigger radar alert state
      setRadarState('alert');
      
      // Play siren sound
      playSiren();
      
      // Show detail card for HIGH risk transactions
      setSelectedTransaction(latestTransaction);
    } else if (latestTransaction.riskLevel === 'LOW') {
      // Play tick sound for LOW risk transactions
      playTick();
    }
  }, [transactions, playTick, playSiren]);

  // Handle transaction click
  const handleTransactionClick = (tx: ClassifiedTransaction) => {
    setSelectedTransaction(tx);
  };

  // Handle detail card close
  const handleDetailCardClose = () => {
    setSelectedTransaction(null);
  };

  return (
    <div className="min-h-screen bg-void-black flex flex-col p-8">
      {/* Header with title and connection status */}
      <header className="flex flex-col items-center gap-4 mb-8">
        {/* Title with glitch effect */}
        <h1 className="text-6xl font-bold text-matrix-green glitch-text text-center">
          THE MEV EXORCIST
        </h1>
        
        <p className="text-matrix-green text-center text-xl font-mono max-w-2xl">
          Real-time Ethereum mempool monitoring for MEV attack detection
        </p>

        {/* Connection status indicator */}
        <div className="flex items-center gap-4 font-mono text-sm">
          <div className="flex items-center gap-2">
            <div 
              className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-matrix-green' : 'bg-blood-red'
              }`}
            />
            <span className={isConnected ? 'text-matrix-green' : 'text-blood-red'}>
              {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>

          {/* Audio toggle */}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`px-3 py-1 border rounded ${
              audioEnabled 
                ? 'border-matrix-green text-matrix-green' 
                : 'border-gray-600 text-gray-600'
            } hover:opacity-80 transition-opacity`}
          >
            AUDIO: {audioEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="text-blood-red text-sm font-mono border border-blood-red px-4 py-2 rounded">
            {error}
          </div>
        )}
      </header>

      {/* Main dashboard layout */}
      <main className="flex-1 flex flex-col lg:flex-row gap-8 items-start justify-center max-w-7xl mx-auto w-full">
        {/* Left side: Radar visualization */}
        <div className="flex-shrink-0">
          <RadarVisualization 
            alertState={radarState}
            onAlertStateChange={setRadarState}
          />
          
          {/* Transaction count */}
          <div className="text-center mt-4 font-mono text-matrix-green">
            <div className="text-sm opacity-70">TRANSACTIONS DETECTED</div>
            <div className="text-3xl font-bold">{transactions.length}</div>
          </div>
        </div>

        {/* Right side: Transaction stream */}
        <div className="flex-1 w-full">
          <h2 className="text-2xl font-bold text-matrix-green mb-4 font-mono text-center lg:text-left">
            MEMPOOL STREAM
          </h2>
          
          {transactions.length === 0 ? (
            <div className="text-center text-matrix-green opacity-70 font-mono p-8 border border-matrix-green rounded">
              Monitoring mempool... Waiting for transactions...
            </div>
          ) : (
            <TransactionStream
              transactions={transactions}
              maxItems={50}
              onTransactionClick={handleTransactionClick}
            />
          )}
        </div>
      </main>

      {/* Detail card overlay */}
      <DetailCard
        transaction={selectedTransaction}
        onClose={handleDetailCardClose}
      />
    </div>
  );
}
