type WebSocketEvent = {
  type: string;
  [key: string]: unknown;
};

type Listener = (event: WebSocketEvent) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private listeners: Set<Listener> = new Set();
  private reconnectTimeout: number = 5000;
  private maxReconnectAttempts: number = 10;
  private reconnectAttempts: number = 0;
  private manualClose: boolean = false;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    // For dev, it might be localhost:8000. In prod, it should match the API URL.
    const apiHost = process.env.NEXT_PUBLIC_API_URL 
      ? process.env.NEXT_PUBLIC_API_URL.replace(/^https?:\/\//, "")
      : "localhost:8000";
    
    this.url = `${protocol}//${apiHost}/api/v1/ws`;
  }

  connect(token?: string) {
    if (this.ws?.readyState === WebSocket.OPEN) return;
    
    this.manualClose = false;
    const fullUrl = token ? `${this.url}?token=${token}` : this.url;
    
    console.log("[WS] Connecting...");
    this.ws = new WebSocket(fullUrl);

    this.ws.onopen = () => {
      console.log("[WS] Connected");
      this.reconnectAttempts = 0;
      
      // Start heartbeat
      if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = setInterval(() => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send("ping");
        }
      }, 30000); // 30s heartbeat
    };

    this.ws.onmessage = (event) => {
      if (event.data === "pong") return;
      try {
        const data = JSON.parse(event.data);
        this.listeners.forEach((l) => l(data));
      } catch (e) {
        console.error("[WS] Error parsing message", e);
      }
    };

    this.ws.onclose = () => {
      if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
      if (!this.manualClose && this.reconnectAttempts < this.maxReconnectAttempts) {
        console.log(`[WS] Disconnected. Reconnecting in ${this.reconnectTimeout}ms...`);
        setTimeout(() => {
          this.reconnectAttempts++;
          this.connect(token);
        }, this.reconnectTimeout);
      }
    };

    this.ws.onerror = (e) => {
      console.error("[WS] Error", e);
    };
  }

  disconnect() {
    this.manualClose = true;
    this.ws?.close();
    this.ws = null;
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  send(data: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(typeof data === "string" ? data : JSON.stringify(data));
    }
  }
}

export const wsClient = typeof window !== "undefined" ? new WebSocketClient() : null;
