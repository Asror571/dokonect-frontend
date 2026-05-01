import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://dokonect-server.onrender.com';

let socket: Socket | null = null;

export const useSocket = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const user  = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token || !user.id) return;

    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected');
      socket?.emit('join:user', user.id);

      if (user.role === 'DRIVER' && user.driverId) {
        socket?.emit('join:driver', user.driverId);
      } else if (user.role === 'DISTRIBUTOR' && user.distributorId) {
        socket?.emit('join:distributor', user.distributorId);
      }
    });

    socket.on('connect_error', (err) => {
      console.log('❌ Socket error:', err.message);
    });

    // Yangi buyurtma (Distributor)
    socket.on('order:new', (order: any) => {
      toast.success(`Yangi buyurtma: ${order.client?.user?.name || 'Mijoz'}`, {
        duration: 5000, icon: '📦',
      });
      queryClient.invalidateQueries({ queryKey: ['distributor-orders'] });
      queryClient.invalidateQueries({ queryKey: ['distributor-recent-orders'] });
    });

    // Buyurtma qabul qilindi (Client)
    socket.on('order:accepted', () => {
      toast.success("Buyurtmangiz qabul qilindi!", { icon: '✅' });
      queryClient.invalidateQueries({ queryKey: ['store-orders'] });
    });

    // Buyurtma holati o'zgardi
    socket.on('order:status_update', (order: any) => {
      toast(`Buyurtma holati: ${order.status}`, { icon: '📍' });
      queryClient.invalidateQueries({ queryKey: ['distributor-orders'] });
      queryClient.invalidateQueries({ queryKey: ['store-orders'] });
    });

    // Driver joylashuvi
    socket.on('driver:location', (data: any) => {
      window.dispatchEvent(new CustomEvent('driver-location-update', { detail: data }));
    });

    // Haydovchiga buyurtma taklifi
    socket.on('order:offer', (data: any) => {
      toast.success(`Yangi yetkazish taklifi!`, {
        duration: (data.expiresIn || 30) * 1000, icon: '🚚',
      });
      window.dispatchEvent(new CustomEvent('order-offer', { detail: data }));
    });

    // Kam qolgan mahsulot (Distributor)
    socket.on('stock:low_alert', (product: any) => {
      toast.error(`Kam qoldi: ${product.name} (${product.stockQty} ta)`, {
        duration: 8000, icon: '⚠️',
      });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, []);

  return socket;
};

export const useOrderSocket = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const s = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    s.on('order:new', () => {
      queryClient.invalidateQueries({ queryKey: ['distributor-orders'] });
      queryClient.invalidateQueries({ queryKey: ['distributor-recent-orders'] });
      queryClient.invalidateQueries({ queryKey: ['distributor-dashboard'] });
    });

    s.on('order:status_update', () => {
      queryClient.invalidateQueries({ queryKey: ['distributor-orders'] });
    });

    return () => { s.disconnect(); };
  }, []);
};

export const getSocket = () => socket;