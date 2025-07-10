import { useEffect, useRef, useCallback } from 'react';

interface WebSocketOptions {
  onMessage?: (data: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

export function useWebSocket(options: WebSocketOptions = {}) {
  const socketRef = useRef<WebSocket | null>(null);
  const { onMessage, onConnect, onDisconnect, onError } = options;

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onopen = () => {
      console.log('WebSocket connected');
      onConnect?.();
    };

    socketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage?.(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    socketRef.current.onclose = (event) => {
      console.log('WebSocket disconnected');
      onDisconnect?.();
      
      // Only attempt to reconnect if it wasn't a manual close (code 1000)
      if (event.code !== 1000) {
        setTimeout(() => {
          connect();
        }, 3000);
      }
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      onError?.(error);
    };
  }, [onMessage, onConnect, onDisconnect, onError]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close(1000, 'Manual disconnect');
      socketRef.current = null;
    }
  }, []);

  const send = useCallback((data: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    send,
    disconnect,
    connect,
    isConnected: socketRef.current?.readyState === WebSocket.OPEN,
  };
}
