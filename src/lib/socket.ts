import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://dokonect-server.onrender.com';

const socket = io(SOCKET_URL, {
  auth: { token: localStorage.getItem('accessToken') },
  autoConnect: false,
  transports: ['websocket', 'polling'],
});

export default socket;