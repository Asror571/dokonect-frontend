import api from './api';

export interface SendMessagePayload {
  content: string;
  type?: 'TEXT' | 'IMAGE' | 'FILE' | 'ORDER_LINK';
  fileUrl?: string;
  orderId?: string;
}

// GET /api/chat/rooms — barcha chat xonalari
export const getChatRoomsFn = async () => {
  const res = await api.get('/api/chat/rooms');
  return res.data;
};

// GET /api/chat/rooms/:roomId/messages
export const getChatMessagesFn = async (roomId: string) => {
  const res = await api.get(`/api/chat/rooms/${roomId}/messages`);
  return res.data;
};