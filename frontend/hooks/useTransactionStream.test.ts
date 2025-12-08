import { renderHook, waitFor } from '@testing-library/react';
import { useTransactionStream } from './useTransactionStream';
import { io } from 'socket.io-client';
import { ClassifiedTransaction } from '@/types/transaction';

// Mock socket.io-client
jest.mock('socket.io-client');

describe('useTransactionStream', () => {
  let mockSocket: any;

  beforeEach(() => {
    // Create a mock socket with event emitter functionality
    mockSocket = {
      on: jest.fn(),
      off: jest.fn(),
      close: jest.fn(),
      emit: jest.fn(),
    };

    // Mock io to return our mock socket
    (io as jest.Mock).mockReturnValue(mockSocket);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with empty transactions and disconnected state', () => {
    const { result } = renderHook(() => useTransactionStream('http://localhost:3001'));

    expect(result.current.transactions).toEqual([]);
    expect(result.current.isConnected).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should create socket connection with correct configuration', () => {
    const backendUrl = 'http://localhost:3001';
    renderHook(() => useTransactionStream(backendUrl));

    expect(io).toHaveBeenCalledWith(backendUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });
  });

  it('should set error when no backend URL is provided', () => {
    const { result } = renderHook(() => useTransactionStream(''));

    expect(result.current.error).toBe('Backend URL not configured');
    expect(io).not.toHaveBeenCalled();
  });

  it('should register all required event listeners', () => {
    renderHook(() => useTransactionStream('http://localhost:3001'));

    expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('connect_error', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('reconnect_attempt', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('reconnect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('reconnect_failed', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('transaction', expect.any(Function));
  });

  it('should update state when connected', async () => {
    const { result } = renderHook(() => useTransactionStream('http://localhost:3001'));

    // Get the connect handler and call it
    const connectHandler = mockSocket.on.mock.calls.find(
      (call: any[]) => call[0] === 'connect'
    )?.[1];
    
    connectHandler();

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
      expect(result.current.error).toBe(null);
    });
  });

  it('should update state when disconnected', async () => {
    const { result } = renderHook(() => useTransactionStream('http://localhost:3001'));

    // First connect
    const connectHandler = mockSocket.on.mock.calls.find(
      (call: any[]) => call[0] === 'connect'
    )?.[1];
    connectHandler();

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    // Then disconnect
    const disconnectHandler = mockSocket.on.mock.calls.find(
      (call: any[]) => call[0] === 'disconnect'
    )?.[1];
    disconnectHandler('transport close');

    await waitFor(() => {
      expect(result.current.isConnected).toBe(false);
      expect(result.current.error).toBe('Connection lost. Attempting to reconnect...');
    });
  });

  it('should handle connection errors', async () => {
    const { result } = renderHook(() => useTransactionStream('http://localhost:3001'));

    const errorHandler = mockSocket.on.mock.calls.find(
      (call: any[]) => call[0] === 'connect_error'
    )?.[1];
    
    errorHandler({ message: 'Network error' });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(false);
      expect(result.current.error).toBe('Unable to connect to backend: Network error');
    });
  });

  it('should add transactions to the array when received', async () => {
    const { result } = renderHook(() => useTransactionStream('http://localhost:3001'));

    const transactionHandler = mockSocket.on.mock.calls.find(
      (call: any[]) => call[0] === 'transaction'
    )?.[1];

    const mockTransaction: ClassifiedTransaction = {
      hash: '0x123',
      from: '0xabc',
      ethValue: '0.5000',
      riskLevel: 'HIGH',
      timestamp: Date.now(),
      functionName: 'swapExactTokensForTokens',
    };

    transactionHandler(mockTransaction);

    await waitFor(() => {
      expect(result.current.transactions).toHaveLength(1);
      expect(result.current.transactions[0]).toEqual(mockTransaction);
    });
  });

  it('should accumulate multiple transactions', async () => {
    const { result } = renderHook(() => useTransactionStream('http://localhost:3001'));

    const transactionHandler = mockSocket.on.mock.calls.find(
      (call: any[]) => call[0] === 'transaction'
    )?.[1];

    const transaction1: ClassifiedTransaction = {
      hash: '0x123',
      from: '0xabc',
      ethValue: '0.5000',
      riskLevel: 'HIGH',
      timestamp: Date.now(),
      functionName: 'swapExactTokensForTokens',
    };

    const transaction2: ClassifiedTransaction = {
      hash: '0x456',
      from: '0xdef',
      ethValue: '0.0500',
      riskLevel: 'LOW',
      timestamp: Date.now(),
      functionName: 'swapExactTokensForTokens',
    };

    transactionHandler(transaction1);
    transactionHandler(transaction2);

    await waitFor(() => {
      expect(result.current.transactions).toHaveLength(2);
      expect(result.current.transactions[0]).toEqual(transaction1);
      expect(result.current.transactions[1]).toEqual(transaction2);
    });
  });

  it('should cleanup socket on unmount', () => {
    const { unmount } = renderHook(() => useTransactionStream('http://localhost:3001'));

    unmount();

    expect(mockSocket.off).toHaveBeenCalledWith('connect');
    expect(mockSocket.off).toHaveBeenCalledWith('disconnect');
    expect(mockSocket.off).toHaveBeenCalledWith('connect_error');
    expect(mockSocket.off).toHaveBeenCalledWith('reconnect_attempt');
    expect(mockSocket.off).toHaveBeenCalledWith('reconnect');
    expect(mockSocket.off).toHaveBeenCalledWith('reconnect_failed');
    expect(mockSocket.off).toHaveBeenCalledWith('transaction');
    expect(mockSocket.close).toHaveBeenCalled();
  });

  it('should handle reconnection attempts', async () => {
    const { result } = renderHook(() => useTransactionStream('http://localhost:3001'));

    const reconnectAttemptHandler = mockSocket.on.mock.calls.find(
      (call: any[]) => call[0] === 'reconnect_attempt'
    )?.[1];
    
    reconnectAttemptHandler(3);

    await waitFor(() => {
      expect(result.current.error).toBe('Reconnecting... (attempt 3)');
    });
  });

  it('should handle successful reconnection', async () => {
    const { result } = renderHook(() => useTransactionStream('http://localhost:3001'));

    const reconnectHandler = mockSocket.on.mock.calls.find(
      (call: any[]) => call[0] === 'reconnect'
    )?.[1];
    
    reconnectHandler(2);

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
      expect(result.current.error).toBe(null);
    });
  });

  it('should handle reconnection failure', async () => {
    const { result } = renderHook(() => useTransactionStream('http://localhost:3001'));

    const reconnectFailedHandler = mockSocket.on.mock.calls.find(
      (call: any[]) => call[0] === 'reconnect_failed'
    )?.[1];
    
    reconnectFailedHandler();

    await waitFor(() => {
      expect(result.current.error).toBe('Failed to reconnect to backend');
    });
  });
});
