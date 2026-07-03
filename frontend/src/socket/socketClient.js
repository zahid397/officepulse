// frontend/src/socket/socketClient.js
// Singleton Socket.io client. Auto-connects using VITE_SOCKET_URL.
// Exposes helpers to subscribe to the three OfficePulse events.

import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1500,
    });
  }
  return socket;
}

// Convenience helper: subscribe to an OfficePulse event with auto-cleanup
export function subscribe(event, handler) {
  const s = getSocket();
  s.on(event, handler);
  return () => s.off(event, handler);
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
