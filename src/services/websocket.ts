
import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private static instance: WebSocketService;
  private socket: Socket | null = null;
  private handlers: Map<string, Function[]> = new Map();
  
  // Singleton pattern
  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }
  
  constructor() {
    // Connect to the WebSocket server
    // In development, connect to the local server
    // In production, it will connect to the same host
    const serverUrl = import.meta.env.DEV ? 'http://localhost:3000' : '';
    
    this.socket = io(serverUrl);
    
    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });
    
    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });
    
    // Set up listeners for all events
    this.socket.onAny((event, ...args) => {
      const handlers = this.handlers.get(event);
      if (handlers) {
        handlers.forEach(handler => handler(...args));
      }
    });
  }
  
  // Create a new room
  public createRoom(playerName: string): Promise<any> {
    return new Promise((resolve) => {
      if (!this.socket) return;
      
      this.socket.emit('create-room', playerName);
      
      this.socket.once('room-created', (data) => {
        resolve(data);
      });
    });
  }
  
  // Join an existing room
  public joinRoom(roomId: string, playerName: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) return;
      
      this.socket.emit('join-room', { roomId, playerName });
      
      this.socket.once('room-joined', (data) => {
        resolve(data);
      });
      
      this.socket.once('error', (error) => {
        reject(error);
      });
    });
  }
  
  // Leave a room
  public leaveRoom(roomId: string): void {
    if (!this.socket) return;
    this.socket.emit('leave-room', roomId);
  }
  
  // Set player ready status
  public setPlayerReady(roomId: string, isReady: boolean): void {
    if (!this.socket) return;
    this.socket.emit('player-ready', { roomId, isReady });
  }
  
  // Set player completion status
  public setPlayerComplete(roomId: string, completionTime: number): void {
    if (!this.socket) return;
    this.socket.emit('player-complete', { roomId, completionTime });
  }
  
  // Register a handler for a specific event
  public on(event: string, handler: Function): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    
    this.handlers.get(event)?.push(handler);
  }
  
  // Remove a handler for a specific event
  public off(event: string, handler: Function): void {
    const handlers = this.handlers.get(event);
    
    if (handlers) {
      const index = handlers.indexOf(handler);
      
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }
}

export default WebSocketService.getInstance();