import api from './api';

export interface CreateReviewPayload {
  productId: string;
  orderId: string;
  rating: number;        // 1-5
  comment?: string;
  images?: string[];
}

export interface ReplyReviewPayload {
  comment: string;
}

// GET /api/reviews/products/:productId — mahsulot sharhlari
export const getProductReviewsFn = async (productId: string) => {
  const res = await api.get(`/api/reviews/products/${productId}`);
  return res.data;
};

// POST /api/reviews — yangi sharh
export const createReviewFn = async (data: CreateReviewPayload) => {
  const res = await api.post('/api/reviews', data);
  return res.data;
};

// POST /api/reviews/:reviewId/reply — sharh javob
export const replyReviewFn = async ({
  reviewId,
  data,
}: {
  reviewId: string;
  data: ReplyReviewPayload;
}) => {
  const res = await api.post(`/api/reviews/${reviewId}/reply`, data);
  return res.data;
};