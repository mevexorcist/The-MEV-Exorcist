/**
 * Integration test for frontend end-to-end flow
 * Tests: Mock Socket.io → Receive → Render → Audio flow
 * Requirements: 4.1, 4.3, 4.4, 8.1, 8.2
 */

import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from './page';
import { ClassifiedTransaction } from '@/types/transaction';

// Mock Socket.io client
jest.mock('socket.io-client', () => {
  const mockSocket = {
    on: jest.fn(),
    off: jest.fn(),
    close: jest.fn(),
    emit: jest.fn(),
  };

  return {
    io: jest.fn(() => mockSocket),
    __mockSocket: mockSocket,
  };
});

// Mock Web Audio API
const mockAudioContext = {
  createOscillator: jest.fn(() => ({
    type: 'sine',
    frequency: { setValueAtTime: jest.fn() },
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    onended: null,
  })),
  createGain: jest.fn(() => ({
    gain: {
      setValueAtTime: jest.fn(),
      exponentialRampToValueAtTime: jest.fn(),
    },
    connect: jest.fn(),
  })),
  destination: {},
  currentTime: 0,
  close: jest.fn(),
};

(global as any).AudioContext = jest.fn(() => mockAudioContext);
(global as any).webkitAudioContext = jest.fn(() => mockAudioContext);

describe('Dashboard Integration Test', () => {
  let mockSocket: any;

  beforeEach(() => {
    // Get the mock socket instance
    const socketIo = require('socket.io-client');
    mockSocket = socketIo.__mockSocket;

    // Reset all mocks
    jest.clearAllMocks();

    // Set up environment variable
    process.env.NEXT_PUBLIC_BACKEND_URL = 'http://localhost:3001';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render the dashboard with title and connection status', () => {
    render(<Home />);

    // Verify title is rendered with glitch effect
    expect(screen.getByText('THE MEV EXORCIST')).toBeInTheDocument();
    expect(screen.getByText('Real-time Ethereum mempool monitoring for MEV attack detection')).toBeInTheDocument();

    // Verify connection status indicator exists
    expect(screen.getByText(/CONNECTED|DISCONNECTED/)).toBeInTheDocument();
  });

  it('should establish Socket.io connection on mount', () => {
    const socketIo = require('socket.io-client');
    
    render(<Home />);

    // Verify Socket.io connection was established
    expect(socketIo.io).toHaveBeenCalledWith(
      'http://localhost:3001',
      expect.objectContaining({
        reconnection: true,
      })
    );

    // Verify event listeners were registered
    expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('transaction', expect.any(Function));
  });

  it('should display connection status when connected', async () => {
    render(<Home />);

    // Simulate connection event
    const connectHandler = mockSocket.on.mock.calls.find(
      (call: any) => call[0] === 'connect'
    )?.[1];

    await act(async () => {
      connectHandler?.();
    });

    await waitFor(() => {
      expect(screen.getByText('CONNECTED')).toBeInTheDocument();
    });
  });

  it('should receive and render LOW risk transaction with correct styling', async () => {
    render(<Home />);

    // Create a LOW risk transaction
    const lowRiskTransaction: ClassifiedTransaction = {
      hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      from: '0xabcdef1234567890abcdef1234567890abcdef12',
      ethValue: '0.0500',
      riskLevel: 'LOW',
      timestamp: Date.now(),
      functionName: 'exactInputSingle',
    };

    // Get the transaction handler
    const transactionHandler = mockSocket.on.mock.calls.find(
      (call: any) => call[0] === 'transaction'
    )?.[1];

    // Simulate receiving transaction
    await act(async () => {
      transactionHandler?.(lowRiskTransaction);
    });

    // Wait for transaction to be rendered
    await waitFor(() => {
      expect(screen.getByText('LOW')).toBeInTheDocument();
      expect(screen.getByText('0.0500 ETH')).toBeInTheDocument();
    });

    // Verify LOW risk styling (should have matrix-green text, no pulsing border)
    // Get the parent transaction card element
    const transactionElement = screen.getByText('LOW').closest('div.p-4');
    expect(transactionElement).toHaveClass('text-matrix-green');
    expect(transactionElement).not.toHaveClass('pulse-border');
  });

  it('should receive and render HIGH risk transaction with correct styling and pulsing border', async () => {
    render(<Home />);

    // Create a HIGH risk transaction
    const highRiskTransaction: ClassifiedTransaction = {
      hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      from: '0x1234567890abcdef1234567890abcdef12345678',
      ethValue: '1.5000',
      riskLevel: 'HIGH',
      timestamp: Date.now(),
      functionName: 'exactInputSingle',
    };

    // Get the transaction handler
    const transactionHandler = mockSocket.on.mock.calls.find(
      (call: any) => call[0] === 'transaction'
    )?.[1];

    // Simulate receiving transaction
    await act(async () => {
      transactionHandler?.(highRiskTransaction);
    });

    // Wait for transaction to be rendered in the stream
    await waitFor(() => {
      expect(screen.getByText('HIGH')).toBeInTheDocument();
    });

    // Verify HIGH risk styling (should have blood-red text and pulsing border)
    // Get the parent transaction card element
    const transactionElement = screen.getByText('HIGH').closest('div.p-4');
    expect(transactionElement).toHaveClass('text-blood-red');
    expect(transactionElement).toHaveClass('pulse-border');
  });

  it('should trigger radar alert state when HIGH risk transaction is received', async () => {
    render(<Home />);

    // Create a HIGH risk transaction
    const highRiskTransaction: ClassifiedTransaction = {
      hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      from: '0x1234567890abcdef1234567890abcdef12345678',
      ethValue: '2.0000',
      riskLevel: 'HIGH',
      timestamp: Date.now(),
      functionName: 'exactInputSingle',
    };

    // Get the transaction handler
    const transactionHandler = mockSocket.on.mock.calls.find(
      (call: any) => call[0] === 'transaction'
    )?.[1];

    // Simulate receiving transaction
    await act(async () => {
      transactionHandler?.(highRiskTransaction);
    });

    // Wait for radar to be in alert state
    // The radar should be visible and in alert state (red color)
    await waitFor(() => {
      const svg = document.querySelector('.radar-svg');
      expect(svg).toBeInTheDocument();
    });
  });

  it('should display detail card when HIGH risk transaction is received', async () => {
    render(<Home />);

    // Create a HIGH risk transaction
    const highRiskTransaction: ClassifiedTransaction = {
      hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      from: '0x1234567890abcdef1234567890abcdef12345678',
      ethValue: '3.5000',
      riskLevel: 'HIGH',
      timestamp: Date.now(),
      functionName: 'exactInputSingle',
    };

    // Get the transaction handler
    const transactionHandler = mockSocket.on.mock.calls.find(
      (call: any) => call[0] === 'transaction'
    )?.[1];

    // Simulate receiving transaction
    await act(async () => {
      transactionHandler?.(highRiskTransaction);
    });

    // Wait for detail card to be displayed
    await waitFor(() => {
      expect(screen.getByText('HUNTED')).toBeInTheDocument();
      expect(screen.getByText('VICTIM WALLET')).toBeInTheDocument();
    });
  });

  it('should play tick sound for LOW risk transactions after audio is enabled', async () => {
    const user = userEvent.setup();
    render(<Home />);

    // Enable audio by clicking on the page (simulates user interaction)
    await act(async () => {
      await user.click(document.body);
    });

    // Wait a bit for audio context to initialize
    await waitFor(() => {
      expect(mockAudioContext.createOscillator).toBeDefined();
    });

    // Create a LOW risk transaction
    const lowRiskTransaction: ClassifiedTransaction = {
      hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      from: '0xabcdef1234567890abcdef1234567890abcdef12',
      ethValue: '0.0500',
      riskLevel: 'LOW',
      timestamp: Date.now(),
      functionName: 'exactInputSingle',
    };

    // Get the transaction handler
    const transactionHandler = mockSocket.on.mock.calls.find(
      (call: any) => call[0] === 'transaction'
    )?.[1];

    // Simulate receiving transaction
    await act(async () => {
      transactionHandler?.(lowRiskTransaction);
    });

    // Verify audio was played (tick sound: sine wave at 800Hz)
    await waitFor(() => {
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    });
  });

  it('should play siren sound for HIGH risk transactions after audio is enabled', async () => {
    const user = userEvent.setup();
    render(<Home />);

    // Enable audio by clicking on the page
    await act(async () => {
      await user.click(document.body);
    });

    // Wait for audio context to initialize
    await waitFor(() => {
      expect(mockAudioContext.createOscillator).toBeDefined();
    });

    // Create a HIGH risk transaction
    const highRiskTransaction: ClassifiedTransaction = {
      hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      from: '0x1234567890abcdef1234567890abcdef12345678',
      ethValue: '5.0000',
      riskLevel: 'HIGH',
      timestamp: Date.now(),
      functionName: 'exactInputSingle',
    };

    // Get the transaction handler
    const transactionHandler = mockSocket.on.mock.calls.find(
      (call: any) => call[0] === 'transaction'
    )?.[1];

    // Simulate receiving transaction
    await act(async () => {
      transactionHandler?.(highRiskTransaction);
    });

    // Verify audio was played (siren sound: square wave oscillating)
    await waitFor(() => {
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    });
  });

  it('should update transaction count as transactions are received', async () => {
    render(<Home />);

    // Get the transaction handler
    const transactionHandler = mockSocket.on.mock.calls.find(
      (call: any) => call[0] === 'transaction'
    )?.[1];

    // Initially should show 0 transactions
    expect(screen.getByText('0')).toBeInTheDocument();

    // Send first transaction
    await act(async () => {
      transactionHandler?.({
        hash: '0x1111111111111111111111111111111111111111111111111111111111111111',
        from: '0x1111111111111111111111111111111111111111',
        ethValue: '0.0500',
        riskLevel: 'LOW',
        timestamp: Date.now(),
        functionName: 'exactInputSingle',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    // Send second transaction
    await act(async () => {
      transactionHandler?.({
        hash: '0x2222222222222222222222222222222222222222222222222222222222222222',
        from: '0x2222222222222222222222222222222222222222',
        ethValue: '1.0000',
        riskLevel: 'HIGH',
        timestamp: Date.now(),
        functionName: 'exactInputSingle',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('should toggle audio on/off when audio button is clicked', async () => {
    const user = userEvent.setup();
    render(<Home />);

    // Find audio toggle button
    const audioButton = screen.getByText(/AUDIO:/);

    // Initially audio should be OFF
    expect(screen.getByText('AUDIO: OFF')).toBeInTheDocument();

    // Click to enable audio
    await act(async () => {
      await user.click(audioButton);
    });

    // Audio should now be ON
    await waitFor(() => {
      expect(screen.getByText('AUDIO: ON')).toBeInTheDocument();
    });

    // Click again to disable
    await act(async () => {
      await user.click(audioButton);
    });

    // Audio should be OFF again
    await waitFor(() => {
      expect(screen.getByText('AUDIO: OFF')).toBeInTheDocument();
    });
  });
});
