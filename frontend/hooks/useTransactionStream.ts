'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { ClassifiedTransaction } from '@/types/transaction';

interface UseTransactionStreamReturn {
  transactions: ClassifiedTransaction[];
  isConnected: boolean;
  error: string | null;
}

export function useTransactionStream(backendUrl: string): UseTransactionStreamReturn {
  const [transactions, setTransactions] = useState<ClassifiedTransaction[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Don't connect if no backend URL is provided
    if (!backendUrl) {
      setError('Backend URL not configured');
      return;
    }

    // Create socket connection
    const socket = io(backendUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    socketRef.current = socket;

    // Handle connection event
    socket.on('connect', () => {
      console.log('Connected to MEV Exorcist backend');
      setIsConnected(true);
      setError(null);
    });

    // Handle disconnection event
    socket.on('disconnect', (reason) => {
      console.log('Disconnected from backend:', reason);
      setIsConnected(false);
      
      // Set user-friendly error message
      if (reason === 'io server disconnect') {
        setError('Server disconnected. Attempting to reconnect...');
      } else if (reason === 'transport close' || reason === 'transport error') {
        setError('Connection lost. Attempting to reconnect...');
      }
    });

    // Handle connection errors
    socket.on('connect_error', (err) => {
      console.error('Connection error:', err.message);
      setIsConnected(false);
      setError(`Unable to connect to backend: ${err.message}`);
    });

    // Handle reconnection attempts
    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Reconnection attempt ${attemptNumber}`);
      setError(`Reconnecting... (attempt ${attemptNumber})`);
    });

    // Handle successful reconnection
    socket.on('reconnect', (attemptNumber) => {
      console.log(`Reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
      setError(null);
    });

    // Handle reconnection failure
    socket.on('reconnect_failed', () => {
      console.error('Reconnection failed');
      setError('Failed to reconnect to backend');
    });

    // Handle incoming transactions
    socket.on('transaction', (transaction: ClassifiedTransaction) => {
      console.log('Received transaction:', transaction);
      setTransactions((prev) => [...prev, transaction]);
    });

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up socket connection');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('reconnect_attempt');
      socket.off('reconnect');
      socket.off('reconnect_failed');
      socket.off('transaction');
      socket.close();
    };
  }, [backendUrl]);

  return {
    transactions,
    isConnected,
    error,
  };
}
