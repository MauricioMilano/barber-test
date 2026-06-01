import { useEffect, useState, useCallback } from 'react';

interface UseSSEOptions {
  role: 'barber' | 'admin' | 'totem';
  onMessage?: (event: MessageEvent) => void;
  onError?: (error: Event) => void;
  onConnect?: () => void;
}

interface SSEMessage {
  event: string;
  data: any;
}

export function useSSE({ role, onMessage, onError, onConnect }: UseSSEOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<SSEMessage[]>([]);

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    let eventSource: EventSource;
    let reconnectTimer: NodeJS.Timeout;

    const connect = () => {
      const url = `${baseUrl}/api/sse/stream?role=${role}`;
      
      try {
        eventSource = new EventSource(url);

        eventSource.onopen = () => {
          console.log(`[SSE] Connected as ${role}`);
          setIsConnected(true);
          onConnect?.();
        };

        eventSource.onmessage = (event) => {
          console.log(`[SSE] Message:`, event.data);
          try {
            const data = JSON.parse(event.data);
            const message = { event: 'message', data };
            setMessages((prev) => [...prev.slice(-99), message]);
            onMessage?.(event);
          } catch (err) {
            console.error('[SSE] Parse error:', err);
          }
        };

        eventSource.onerror = (error) => {
          console.error('[SSE] Error:', error);
          setIsConnected(false);
          onError?.(error);
          
          clearTimeout(reconnectTimer);
          reconnectTimer = setTimeout(() => {
            if (eventSource) {
              eventSource.close();
            }
            connect();
          }, 5000);
        };

        const eventNames = ['nova-comanda', 'comanda-paga', 'atendimento-iniciado', 'atendimento-finalizado', 'connected'];
        
        eventNames.forEach((eventName) => {
          eventSource.addEventListener(eventName, (event: MessageEvent) => {
            console.log(`[SSE] ${eventName}:`, event.data);
            try {
              const data = JSON.parse(event.data);
              const message = { event: eventName, data };
              setMessages((prev) => [...prev.slice(-99), message]);
              onMessage?.(event);
            } catch (err) {
              console.error(`[SSE] ${eventName} parse error:`, err);
            }
          });
        });
      } catch (err) {
        console.error('[SSE] Failed to create EventSource:', err);
      }
    };

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (eventSource) {
        eventSource.close();
      }
      setIsConnected(false);
    };
  }, [role]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    isConnected,
    messages,
    clearMessages,
  };
}