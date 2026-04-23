import api from './api';

// GET /api/notifications
export const getNotificationsFn = async () => {
  const res = await api.get('/api/notifications');
  return res.data;
};

// GET /api/notifications/unread-count
export const getUnreadNotificationsCountFn = async () => {
  const res = await api.get('/api/notifications/unread-count');
  return res.data;
};

// PATCH /api/notifications/:id/read
export const markNotificationReadFn = async (id: string) => {
  const res = await api.patch(`/api/notifications/${id}/read`);
  return res.data;
};

// PATCH /api/notifications/read-all
export const markAllNotificationsReadFn = async () => {
  const res = await api.patch('/api/notifications/read-all');
  return res.data;
};