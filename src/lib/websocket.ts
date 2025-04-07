export const WS_STATUS = {
  CONNECTING: "connecting",
  OPEN: "open",
  CLOSING: "closing",
  CLOSED: "closed",
  ERROR: "error",
} as const;

export type WebSocketStatus = (typeof WS_STATUS)[keyof typeof WS_STATUS];

export type MessageListener = (message: string) => void;

export type StatusListener = (status: WebSocketStatus) => void;

export class WebSocketError extends Error {
  public code?: number;
  public originalError?: any;

  constructor(message: string, code?: number, originalError?: any) {
    super(message);
    this.name = "WebSocketError";
    this.code = code;
    this.originalError = originalError;
  }
}

class WebSocketManager {
  private socket: WebSocket | null;
  private url: string;
  private reconnectAttempts: number;
  private maxReconnectAttempts: number;
  private reconnectTimeout: NodeJS.Timeout | null;
  private reconnectInterval: number;
  private messageListeners: MessageListener[];
  private statusListeners: StatusListener[];
  private status: WebSocketStatus;

  constructor() {
    this.socket = null;
    this.url = "ws://85.104.114.145:1200/"; // ws://85.104.114.145:1200/ ws://192.168.1.202:80/
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = null;
    this.reconnectInterval = 3000; // 3 saniyelik aralıklarla yeniden bağlanma
    this.messageListeners = [];
    this.statusListeners = [];
    this.status = WS_STATUS.CLOSED;
  }

  public connect(): Promise<WebSocketStatus> {
    return new Promise((resolve, reject) => {
      if (
        this.socket &&
        (this.socket.readyState === WebSocket.OPEN ||
          this.socket.readyState === WebSocket.CONNECTING)
      ) {
        console.log("WebSocket zaten bağlı veya bağlanıyor");
        resolve(this.status);
        return;
      }

      this.updateStatus(WS_STATUS.CONNECTING);

      try {
        this.socket = new WebSocket(this.url);

        this.socket.onopen = (event) => {
          this.handleOpen(event);
          resolve(WS_STATUS.OPEN);
        };

        this.socket.onmessage = this.handleMessage.bind(this);

        this.socket.onclose = (event) => {
          this.handleClose(event);

          if (this.status === WS_STATUS.CONNECTING) {
            reject(
              new WebSocketError("WebSocket bağlantısı kurulamadı", event.code)
            );
          }
        };

        this.socket.onerror = (event) => {
          this.handleError(event);
          reject(
            new WebSocketError("WebSocket bağlantı hatası", undefined, event)
          );
        };
      } catch (error) {
        this.updateStatus(WS_STATUS.ERROR);
        this.scheduleReconnect();
        reject(
          new WebSocketError("WebSocket oluşturma hatası", undefined, error)
        );
      }
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.updateStatus(WS_STATUS.CLOSING);
      this.socket.close();
      this.socket = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.reconnectAttempts = 0;
    this.updateStatus(WS_STATUS.CLOSED);
  }

  public sendMessage(message: string): boolean {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
      console.log("WebSocket mesaj gönderildi:", message);
      return true;
    } else {
      console.error("WebSocket bağlı değil, mesaj gönderilemedi:", message);
      return false;
    }
  }

  public login(username: string, password: string): boolean {
    return this.sendMessage(`LOGIN "${username}" "${password}"`);
  }

  public logout(): boolean {
    return this.sendMessage("LOGOUT");
  }

  public addMessageListener(listener: MessageListener): void {
    this.messageListeners.push(listener);
  }

  public removeMessageListener(listener: MessageListener): void {
    this.messageListeners = this.messageListeners.filter((l) => l !== listener);
  }

  public addStatusListener(listener: StatusListener): void {
    this.statusListeners.push(listener);
  }

  public removeStatusListener(listener: StatusListener): void {
    this.statusListeners = this.statusListeners.filter((l) => l !== listener);
  }

  public getStatus(): WebSocketStatus {
    return this.status;
  }

  private handleOpen(event: Event): void {
    console.log("WebSocket bağlantısı açıldı");
    this.reconnectAttempts = 0;
    this.updateStatus(WS_STATUS.OPEN);
  }

  private handleMessage(event: MessageEvent): void {
    const message = event.data;

    this.messageListeners.forEach((listener) => {
      try {
        listener(message);
      } catch (error) {
        console.error("Mesaj dinleyicisi hatası:", error);
      }
    });
  }

  private handleClose(event: CloseEvent): void {
    console.log(
      `WebSocket bağlantısı kapandı. Kod: ${event.code}, Neden: ${event.reason}`
    );
    this.socket = null;
    this.updateStatus(WS_STATUS.CLOSED);

    if (event.code !== 1000) {
      this.scheduleReconnect();
    }
  }

  private handleError(event: Event): void {
    console.error("WebSocket hatası:", event);
    this.updateStatus(WS_STATUS.ERROR);
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      console.log(
        `${this.reconnectInterval}ms sonra yeniden bağlanılacak. Deneme: ${
          this.reconnectAttempts + 1
        }/${this.maxReconnectAttempts}`
      );

      this.reconnectTimeout = setTimeout(() => {
        this.reconnectAttempts++;
        this.connect().catch((error) => {
          console.error("Yeniden bağlanma hatası:", error);
        });
      }, this.reconnectInterval);
    } else {
      console.error(
        `Maksimum yeniden bağlanma denemesi aşıldı (${this.maxReconnectAttempts})`
      );
      this.updateStatus(WS_STATUS.ERROR);
    }
  }

  private updateStatus(status: WebSocketStatus): void {
    this.status = status;

    this.statusListeners.forEach((listener) => {
      try {
        listener(status);
      } catch (error) {
        console.error("Durum dinleyicisi hatası:", error);
      }
    });
  }
}

const wsManager = new WebSocketManager();

export default wsManager;
