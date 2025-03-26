
import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from "sonner";

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [url, setUrl] = useState('');
  const wsRef = useRef<WebSocket | null>(null);
  
  const connect = useCallback((wsUrl: string) => {
    if (isConnected || isConnecting) {
      disconnect();
    }
    
    try {
      setIsConnecting(true);
      setUrl(wsUrl);
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        toast.success("WebSocket connected");
      };
      
      ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;
        toast.info("WebSocket disconnected");
      };
      
      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnecting(false);
        toast.error("Failed to connect to WebSocket");
        ws.close();
      };
      
      wsRef.current = ws;
    } catch (error) {
      setIsConnecting(false);
      console.error("WebSocket connection error:", error);
      toast.error("Invalid WebSocket URL");
    }
  }, [isConnected, isConnecting]);
  
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
    }
  }, []);
  
  const sendMessage = useCallback((data: string | ArrayBuffer) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      toast.error("WebSocket not connected");
      return false;
    }
    
    try {
      wsRef.current.send(data);
      return true;
    } catch (error) {
      console.error("Error sending WebSocket message:", error);
      return false;
    }
  }, []);
  
  // Clean up WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);
  
  return {
    url,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    sendMessage
  };
}
