import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const socket = io(SOCKET_URL, {
  autoConnect: false,   // Don't connect automatically
  withCredentials: true,
  auth: (cb) => {
    cb({ token: localStorage.getItem('token') });
  },
});

export default socket;