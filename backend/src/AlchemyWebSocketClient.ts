import WebSocket from 'ws';
import { EventEmitter } from 'events';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

export interface AlchemyWebSocketClientOptions {
  url: string;
  maxReconnectDelay?: number;
}

/**
 * WebSocket client for connecting to Alchemy's pending transaction stream
 * Implements exponential backoff reconnection logic
 */
export class AlchemyWebSocketClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private url: string;
  private connectionState: ConnectionState = 'disconnected';
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private maxReconnectDelay: number;
  private readonly baseDelays = [1000, 2000, 4000, 8000, 16000]; // 1s, 2s, 4s, 8s, 16s

  constructor(options: AlchemyWebSocketClientOptions) {
    super();
    this.url = options.url;
    this.maxReconnectDelay = options.maxReconnectDelay || 30000; // max 30s
  }

  /**
   * Establishes WebSocket connection to Alchemy
   */
  async connect(): Promise<void> {
    if (this.connectionState === 'connected' || this.connectionState === 'connecting') {
      return;
    }

    this.connectionState = 'connecting';
    this.emit('stateChange', this.connectionState);

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        const connectionTimeout = setTimeout(() => {
          if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
            this.ws.close();
            reject(new Error('Connection timeout'));
          }
        }, 10000); // 10 second timeout

        this.ws.on('open', () => {
          clearTimeout(connectionTimeout);
          this.connectionState = 'connected';
          this.reconnectAttempts = 0; // Reset on successful connection
          this.emit('stateChange', this.connectionState);
          this.emit('connected');
          resolve();
        });

        this.ws.on('message', (data: WebSocket.Data) => {
          try {
            const message = JSON.parse(data.toString());
            this.emit('message', message);
          } catch (error) {
            this.emit('error', new Error(`Failed to parse message: ${error}`));
          }
        });

        this.ws.on('error', (error: Error) => {
          clearTimeout(connectionTimeout);
          this.emit('error', error);
          if (this.connectionState === 'connecting') {
            reject(error);
          }
        });

        this.ws.on('close', () => {
          clearTimeout(connectionTimeout);
          const wasConnected = this.connectionState === 'connected';
          this.connectionState = 'disconnected';
          this.emit('stateChange', this.connectionState);
          this.emit('disconnected');

          // Trigger reconnection if we were previously connected
          if (wasConnected) {
            this.reconnect();
          }
        });
      } catch (error) {
        this.connectionState = 'disconnected';
        this.emit('stateChange', this.connectionState);
        reject(error);
      }
    });
  }

  /**
   * Subscribe to pending transactions stream
   */
  subscribe(event: 'pendingTransactions'): void {
    if (this.connectionState !== 'connected' || !this.ws) {
      throw new Error('Cannot subscribe: WebSocket not connected');
    }

    const subscribeMessage = {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_subscribe',
      params: ['alchemy_pendingTransactions'],
    };

    this.ws.send(JSON.stringify(subscribeMessage));
  }

  /**
   * Implements exponential backoff reconnection logic
   * Delays: 1s, 2s, 4s, 8s, 16s, then max 30s
   */
  reconnect(): void {
    if (this.reconnectTimer) {
      return; // Already scheduled
    }

    this.connectionState = 'reconnecting';
    this.emit('stateChange', this.connectionState);

    const delay = this.calculateReconnectDelay();
    this.emit('reconnecting', { attempt: this.reconnectAttempts + 1, delay });

    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      this.reconnectAttempts++;

      try {
        await this.connect();
        // If successful, reconnectAttempts will be reset in connect()
      } catch (error) {
        this.emit('error', new Error(`Reconnection attempt ${this.reconnectAttempts} failed: ${error}`));
        // Schedule next reconnection attempt
        this.reconnect();
      }
    }, delay);
  }

  /**
   * Calculate reconnection delay using exponential backoff
   * Returns delay in milliseconds
   */
  calculateReconnectDelay(): number {
    if (this.reconnectAttempts < this.baseDelays.length) {
      return this.baseDelays[this.reconnectAttempts];
    }
    return this.maxReconnectDelay;
  }

  /**
   * Get current connection state
   */
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Close the WebSocket connection
   */
  close(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.connectionState = 'disconnected';
    this.emit('stateChange', this.connectionState);
  }
}
