type EventCallback = (...args: any[]) => void;

class EventEmitter {
  private events: { [key: string]: EventCallback[] } = {};

  on(event: string, callback: EventCallback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event: string, callback: EventCallback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  emit(event: string, ...args: any[]) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(...args));
  }
}

export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

class WebSocketService extends EventEmitter {
  private socket: WebSocket | null = null;
  private status: WebSocketStatus = 'disconnected';
  private branchId: string | null = null;
  private token: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private connectionTimeout: NodeJS.Timeout | null = null;

  private getWebSocketUrl(branchId: string): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    console.log("Protocol for WebSocket:", protocol);
    // Host is the same as the API host
    const host = import.meta.env.VITE_API_URL.replace(/^https?:\/\//, '').replace(/\/api\/?$/, '');
    return `${protocol}//${host}/api/Branch/live/${branchId}`;
  }

  connect(branchId: string, token: string): void {
    if (this.isConnecting) {
      console.log('Connection already in progress, skipping...');
      return;
    }

    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected, skipping...');
      return;
    }

    this.isConnecting = true;
    this.branchId = branchId;
    this.token = token;
    this.updateStatus('connecting');

    try {
      this.socket = new WebSocket(this.getWebSocketUrl(branchId));

      // Set a connection timeout
      this.connectionTimeout = setTimeout(() => {
        if (this.socket?.readyState !== WebSocket.OPEN) {
          console.log('Connection timeout, closing socket...');
          this.socket?.close();
          this.handleError(new Error('Connection timeout'));
        }
      }, 10000); // 10 second timeout

      this.socket.onopen = () => {
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }
        this.updateStatus('connected');
      };

      this.socket.onclose = () => {
        this.isConnecting = false;
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }
        this.updateStatus('disconnected');
        this.attemptReconnect();
      };

      this.socket.onerror = (error) => {
        this.isConnecting = false;
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }
        this.handleError(error);
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.emit('message', message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
    } catch (error) {
      this.isConnecting = false;
      this.handleError(error);
    }
  }

  disconnect(): void {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnecting = false;
    this.branchId = null;
    this.token = null;
    this.updateStatus('disconnected');
  }

  private handleError(error: any): void {
    console.error('WebSocket error:', error);
    this.updateStatus('error');
    this.attemptReconnect();
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts || !this.branchId || !this.token) {
      console.log('Max reconnection attempts reached or missing credentials');
      return;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      this.connect(this.branchId!, this.token!);
    }, Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)); // Exponential backoff with max 30s
  }

  private updateStatus(status: WebSocketStatus): void {
    this.status = status;
    this.emit('statusChange', status);
  }

  getStatus(): WebSocketStatus {
    return this.status;
  }
}

export const websocketService = new WebSocketService(); 