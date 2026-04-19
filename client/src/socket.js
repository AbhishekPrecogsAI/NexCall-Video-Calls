import { io } from "socket.io-client";

// Factory function — each call returns a FRESH socket instance
// This is critical: both tabs in same browser must have independent sockets
export function createSocket() {
  return io("https://nexcall-video-calls.onrender.com", {
    autoConnect: false,
    forceNew: true,          // never reuse a cached connection
    transports: ["websocket"], // skip long-polling, go straight to WS
  });
}
