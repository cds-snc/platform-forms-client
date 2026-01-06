import { useEffect, useRef, useState } from "react";

type InitPayload = { type: "init"; payload: string };
type MessagePayload = { type: "message"; payload: unknown };
type ClosedPayload = { type: "closed"; formId?: string; closedAt?: string };
type SSEPayload = InitPayload | MessagePayload | ClosedPayload;

export const useSSE = (url: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<SSEPayload[]>([]);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const shouldReconnectRef = useRef(true);
  const maxReconnectAttempts = 5;

  const safeParse = (raw: string): SSEPayload | null => {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.type === "string") return parsed as SSEPayload;
      return null;
    } catch (_e) {
      return null;
    }
  };

  const connect = () => {
    if (!shouldReconnectRef.current) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
      reconnectAttemptsRef.current = 0;
    };

    eventSource.addEventListener("message", (event: MessageEvent) => {
      const data = safeParse(event.data);
      if (data) setMessages((prev) => [...prev, data]);
    });

    eventSource.addEventListener("init", (event: MessageEvent) => {
      const data = safeParse(event.data);
      if (data) setMessages((prev) => [...prev, data]);
    });

    eventSource.addEventListener("closed", (event: MessageEvent) => {
      const data = safeParse(event.data);
      if (data) setMessages((prev) => [...prev, data]);
      setIsConnected(false);
      setError(null);
      shouldReconnectRef.current = false;
      try {
        eventSource.close();
      } catch (_e) {
        // ignore
      }
    });

    eventSource.onerror = () => {
      setIsConnected(false);
      if (!shouldReconnectRef.current) return;
      setError("Connection lost, attempting to reconnect...");
      try {
        eventSource.close();
      } catch (_e) {
        // ignore
      }
      handleReconnect();
    };
  };

  const handleReconnect = () => {
    if (!shouldReconnectRef.current) return;
    if (reconnectAttemptsRef.current < maxReconnectAttempts) {
      const retryTimeout = 1000 * Math.pow(2, reconnectAttemptsRef.current);
      setTimeout(() => {
        reconnectAttemptsRef.current += 1;
        connect();
      }, retryTimeout);
    } else {
      setError("Maximum reconnect attempts reached.");
    }
  };

  useEffect(() => {
    shouldReconnectRef.current = true;
    reconnectAttemptsRef.current = 0;
    connect();

    return () => {
      shouldReconnectRef.current = false;
      eventSourceRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return { isConnected, messages, error };
};
