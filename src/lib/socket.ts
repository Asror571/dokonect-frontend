import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://dokonect-server.onrender.com';

// polling birinchi — Render free tier uchun
const socket = io(SOCKET_URL, {
  auth: { token: localStorage.getItem('accessToken') },
  autoConnect: false,
  transports: ['polling', 'websocket'],
  reconnectionAttempts: 3,
  reconnectionDelay: 3000,
  timeout: 10000,
});

socket.on('connect_error', () => {
  // Backend mavjud bo'lmaganda silent fail
});
socket.on('error', () => {});

export default socket;