import { useState, useEffect, useCallback, useRef } from "react";

// Module-level socket ref — set by registerChatSocket
const chatState = { socket: null, listeners: new Set() };

export function registerChatSocket(socket) {
  chatState.socket = socket;
  // Remove old listener if re-registering
  socket.off("chat-message");
  socket.on("chat-message", (msg) => {
    chatState.listeners.forEach((fn) => fn(msg));
  });
}

export function useChat() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const handler = (msg) => setMessages((prev) => [...prev, msg]);
    chatState.listeners.add(handler);
    return () => chatState.listeners.delete(handler);
  }, []);

  const sendMessage = useCallback((message) => {
    chatState.socket?.emit("chat-message", { message });
  }, []);

  return { messages, sendMessage };
}
