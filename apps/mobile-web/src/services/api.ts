/**
 * API SERVICE — All backend API calls
 */

import axios, { AxiosError, AxiosInstance } from 'axios';
import type {
  ApiResponse, LoginResponse, User, Address,
  Category, Worker, WorkerProfile, Booking,
} from '@/types';

const AUTH_URL    = import.meta.env.VITE_AUTH_URL    || 'http://localhost:3001';
const USER_URL    = import.meta.env.VITE_USER_URL    || 'http://localhost:3002';
const WORKER_URL  = import.meta.env.VITE_WORKER_URL  || 'http://localhost:3003';
const BOOKING_URL = import.meta.env.VITE_BOOKING_URL || 'http://localhost:3004';
const PAYMENT_URL = import.meta.env.VITE_PAYMENT_URL || 'http://localhost:3006';
const AI_URL      = import.meta.env.VITE_AI_URL      || 'http://localhost:3007';
const ADMIN_URL   = import.meta.env.VITE_ADMIN_URL   || 'http://localhost:3008';

const createApiClient = (baseURL: string): AxiosInstance => {
  const client = axios.create({
    baseURL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
  });

  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('seva_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiResponse>) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('seva_token');
        localStorage.removeItem('seva_user');
      }
      return Promise.reject(error);
    }
  );

  return client;
};

const authApi    = createApiClient(AUTH_URL);
const userApi    = createApiClient(USER_URL);
const workerApi  = createApiClient(WORKER_URL);
const bookingApi = createApiClient(BOOKING_URL);
const paymentApi = createApiClient(PAYMENT_URL);
const aiApi      = createApiClient(AI_URL);

// ─── AUTH ───
export const auth = {
  sendOtp:   (phone: string)            => authApi.post<ApiResponse>('/auth/send-otp',   { phone }).then((r) => r.data),
  verifyOtp: (phone: string, otp: string) => authApi.post<ApiResponse<LoginResponse>>('/auth/verify-otp', { phone, otp }).then((r) => r.data),
  logout:    ()                         => authApi.post<ApiResponse>('/auth/logout').then((r) => r.data),
};

// ─── USER ───
export const user = {
  getProfile:    () => userApi.get<ApiResponse<User>>('/users/me').then((r) => r.data),
  updateProfile: (u: Partial<User>) => userApi.put<ApiResponse<User>>('/users/me', u).then((r) => r.data),

  getAddresses:    () => userApi.get<ApiResponse<{ addresses: Address[]; count: number }>>('/users/addresses').then((r) => r.data),
  createAddress:   (a: Partial<Address>) => userApi.post<ApiResponse<Address>>('/users/addresses', a).then((r) => r.data),
  deleteAddress:   (id: string) => userApi.delete<ApiResponse>(`/users/addresses/${id}`).then((r) => r.data),
  setDefaultAddr:  (id: string) => userApi.put<ApiResponse>(`/users/addresses/${id}/default`).then((r) => r.data),

  uploadPhoto: (photoBase64: string) =>
    userApi.post<ApiResponse<{ url: string; sizeKb: number }>>('/users/me/photo', { photo: photoBase64 }).then((r) => r.data),

  /**
   * Generic image upload — reviews, chat photos, problem AI photos
   * folder: 'reviews' | 'chat' | 'problem-photos' | 'addresses'
   * Returns Cloudinary CDN URL (or base64 in dev fallback)
   */
  uploadImage: (photoBase64: string, folder: 'reviews' | 'chat' | 'problem-photos' | 'addresses' | 'worker-photos' | 'worker-docs') =>
    userApi.post<ApiResponse<{ url: string; publicId: string | null; width?: number; height?: number; bytes?: number }>>(
      '/users/upload-image',
      { photo: photoBase64, folder }
    ).then((r) => r.data),

  // Rewards
  getRewards:      () => userApi.get<ApiResponse<any>>('/users/me/rewards').then((r) => r.data),
  applyReferral:   (code: string) => userApi.post<ApiResponse<any>>('/users/me/apply-referral', { code }).then((r) => r.data),
  redeemPoints:    (points: number) => userApi.post<ApiResponse<any>>('/users/me/redeem-points', { points }).then((r) => r.data),
};

// ─── COUPONS ───
export const coupons = {
  list: () => bookingApi.get<ApiResponse<any>>('/bookings/coupons').then((r) => r.data),
  apply: (code: string, amount: number, category?: string) =>
    bookingApi.post<ApiResponse<any>>('/bookings/apply-coupon', { code, amount, category }).then((r) => r.data),
};

// ─── WORKER ───
export const worker = {
  getCategories: () => workerApi.get<ApiResponse<{ categories: Category[]; count: number }>>('/workers/categories').then((r) => r.data),

  search: (params: { category?: string; sort?: string; lat?: number; lng?: number; verified?: boolean; available?: boolean; minRating?: number }) =>
    workerApi.get<ApiResponse<{ workers: Worker[]; count: number }>>('/workers/search', { params }).then((r) => r.data),

  getProfile: (id: string) => workerApi.get<ApiResponse<WorkerProfile>>(`/workers/${id}`).then((r) => r.data),
};

// ─── WORKER SELF (logged-in worker's own profile) ───
export const workerSelf = {
  getMe:     () => workerApi.get<ApiResponse<WorkerProfile>>('/workers/me').then((r) => r.data),
  updateMe:  (data: { name?: string; bio?: string; profilePhoto?: string; latitude?: number; longitude?: number }) =>
    workerApi.put<ApiResponse<WorkerProfile>>('/workers/me', data).then((r) => r.data),
  register:  (data: { name: string; bio?: string; latitude?: number; longitude?: number; cityId?: string; profilePhoto?: string; aadhaarUrl?: string }) =>
    workerApi.post<ApiResponse<WorkerProfile>>('/workers/register', data).then((r) => r.data),
  addSkill:  (data: { categoryId: string; experienceYears: number; isPrimary: boolean }) =>
    workerApi.post<ApiResponse<any>>('/workers/me/skills', data).then((r) => r.data),
  setAvailability: (isAvailable: boolean) =>
    workerApi.put<ApiResponse<any>>('/workers/me/availability', { isAvailable }).then((r) => r.data),
  getSchedule: () =>
    workerApi.get<ApiResponse<{ schedule: Record<string, { active: boolean; start: string; end: string }> }>>('/workers/me/schedule').then((r) => r.data),
  updateSchedule: (schedule: Record<string, { active: boolean; start: string; end: string }>) =>
    workerApi.put<ApiResponse<any>>('/workers/me/schedule', { schedule }).then((r) => r.data),
};

// ─── BOOKING ───
export const booking = {
  create: (data: { workerId: string; categoryId: string; addressId: string; scheduledAt: string; notes?: string }) =>
    bookingApi.post<ApiResponse<Booking>>('/bookings', data).then((r) => r.data),

  myBookings: (status?: string) =>
    bookingApi.get<ApiResponse<{ bookings: Booking[]; count: number }>>('/bookings/my', { params: { status } }).then((r) => r.data),

  getById: (id: string) =>
    bookingApi.get<ApiResponse<Booking>>(`/bookings/${id}`).then((r) => r.data),

  cancel: (id: string, reason?: string) =>
    bookingApi.put<ApiResponse<Booking>>(`/bookings/${id}/cancel`, { reason }).then((r) => r.data),

  rate: (id: string, rating: number, review?: string, photoUrls: string[] = []) =>
    bookingApi.post<ApiResponse<{ booking: Booking; review: Review }>>(`/bookings/${id}/rate`, { rating, review, photoUrls }).then((r) => r.data),
};

// ─── REVIEWS ───
export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  workerId: string;
  rating: number;
  comment: string | null;
  photoUrls: string[];
  workerReply: string | null;
  workerReplyAt: string | null;
  isVerified: boolean;
  helpfulCount: number;
  createdAt: string;
  customerName?: string | null;
  customerPhoto?: string | null;
}

export interface ReviewSummary {
  average: number;
  total: number;
  counts: Record<number, number>;
}

export const reviews = {
  /** List reviews for a worker, with filters and rating summary */
  forWorker: (workerId: string, opts: { rating?: number; withPhotos?: boolean; limit?: number; offset?: number } = {}) => {
    const qs = new URLSearchParams();
    if (opts.rating)     qs.set('rating', String(opts.rating));
    if (opts.withPhotos) qs.set('withPhotos', 'true');
    if (opts.limit)      qs.set('limit', String(opts.limit));
    if (opts.offset)     qs.set('offset', String(opts.offset));
    return bookingApi
      .get<ApiResponse<{ reviews: Review[]; summary: ReviewSummary }>>(`/reviews/worker/${workerId}?${qs}`)
      .then((r) => r.data);
  },

  summary: (workerId: string) =>
    bookingApi.get<ApiResponse<ReviewSummary>>(`/reviews/worker/${workerId}/summary`).then((r) => r.data),

  /** Worker replies to a customer review (once) */
  reply: (reviewId: string, reply: string) =>
    bookingApi.post<ApiResponse<Review>>(`/reviews/${reviewId}/reply`, { reply }).then((r) => r.data),

  markHelpful: (reviewId: string) =>
    bookingApi.post<ApiResponse<{ success: boolean }>>(`/reviews/${reviewId}/helpful`).then((r) => r.data),
};

// ─── TRACKING ───
export const tracking = {
  latest: (bookingId: string) =>
    bookingApi.get<ApiResponse<{ latitude: number; longitude: number; timestamp: string; source: 'live' | 'static' } | null>>(
      `/tracking/${bookingId}/latest`
    ).then((r) => r.data),

  trail: (bookingId: string) =>
    bookingApi.get<ApiResponse<{ points: { lat: number; lng: number; t: string }[] }>>(
      `/tracking/${bookingId}/trail`
    ).then((r) => r.data),
};

// ─── CHAT ───
export const chat = {
  history: (bookingId: string, limit = 100) =>
    bookingApi.get<ApiResponse<{ messages: any[]; role: 'customer' | 'worker' }>>(
      `/chat/${bookingId}/history`, { params: { limit } }
    ).then((r) => r.data),

  send: (bookingId: string, payload: { messageType: 'text' | 'image' | 'voice'; content?: string; mediaUrl?: string }) =>
    bookingApi.post<ApiResponse<any>>(`/chat/${bookingId}/send`, payload).then((r) => r.data),

  unreadCount: () =>
    bookingApi.get<ApiResponse<{ count: number; role: string }>>('/chat/unread-count').then((r) => r.data),
};

// ─── PAYMENT ───
export const payment = {
  createOrder: (bookingId: string) =>
    paymentApi.post<ApiResponse<any>>('/payments/order', { bookingId }).then((r) => r.data),

  verify: (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string; method?: string }) =>
    paymentApi.post<ApiResponse<any>>('/payments/verify', data).then((r) => r.data),

  history: () =>
    paymentApi.get<ApiResponse<any>>('/payments/history').then((r) => r.data),

  getById: (id: string) =>
    paymentApi.get<ApiResponse<any>>(`/payments/${id}`).then((r) => r.data),

  refund: (id: string, reason?: string) =>
    paymentApi.post<ApiResponse<any>>(`/payments/${id}/refund`, { reason }).then((r) => r.data),

  workerEarnings: () =>
    paymentApi.get<ApiResponse<any>>('/payments/worker/earnings').then((r) => r.data),
};

// ─── AI ───
export const ai = {
  recommendServices: (userId: string) =>
    aiApi.post<ApiResponse<{ recommendations: any[] }>>('/ai/recommend-services', { userId }).then((r) => r.data),

  recommendWorkers: (categoryName: string, lat?: number, lng?: number) =>
    aiApi.post<ApiResponse<{ workers: any[] }>>('/ai/recommend-workers', { categoryName, lat, lng }).then((r) => r.data),

  chat: (message: string, userId?: string) =>
    aiApi.post<ApiResponse<{ reply: string; suggestions: string[] }>>('/ai/chat', { message, userId }).then((r) => r.data),

  insights: (userId: string) =>
    aiApi.get<ApiResponse<any>>(`/ai/insights/${userId}`).then((r) => r.data),
};

// Worker Earnings (uses payment service)
export const workerStats = {
  earnings: () => paymentApi.get<ApiResponse<any>>('/payments/worker/earnings').then((r) => r.data),
};

// Worker Jobs (uses booking service)
export const workerJobs = {
  list: (status?: string) =>
    bookingApi.get<ApiResponse<{ bookings: Booking[]; count: number }>>('/bookings/worker/jobs', { params: { status } }).then((r) => r.data),
  accept:   (id: string) => bookingApi.put<ApiResponse<Booking>>(`/bookings/${id}/accept`).then((r) => r.data),
  reject:   (id: string) => bookingApi.put<ApiResponse<Booking>>(`/bookings/${id}/reject`).then((r) => r.data),
  start:    (id: string) => bookingApi.put<ApiResponse<Booking>>(`/bookings/${id}/start`).then((r) => r.data),
  arrived:  (id: string) => bookingApi.put<ApiResponse<Booking>>(`/bookings/${id}/arrived`).then((r) => r.data),
  complete: (id: string) => bookingApi.put<ApiResponse<Booking>>(`/bookings/${id}/complete`).then((r) => r.data),
};

// ─── ADMIN ───
const adminAxios = axios.create({ baseURL: ADMIN_URL, timeout: 10000 });
adminAxios.interceptors.request.use((config) => {
  const pass = localStorage.getItem('seva_admin_pass');
  if (pass) config.headers['X-Admin-Pass'] = pass;
  return config;
});

export const admin = {
  setPassword: (pass: string) => localStorage.setItem('seva_admin_pass', pass),
  hasPassword: () => !!localStorage.getItem('seva_admin_pass'),
  logout: () => localStorage.removeItem('seva_admin_pass'),

  dashboard:        () => adminAxios.get<ApiResponse<any>>('/admin/dashboard').then((r) => r.data),
  listUsers:        () => adminAxios.get<ApiResponse<any>>('/admin/users').then((r) => r.data),
  listWorkers:      () => adminAxios.get<ApiResponse<any>>('/admin/workers').then((r) => r.data),
  verifyWorker:     (id: string) => adminAxios.put<ApiResponse<any>>(`/admin/workers/${id}/verify`).then((r) => r.data),
  toggleWorkerActive: (id: string) => adminAxios.put<ApiResponse<any>>(`/admin/workers/${id}/toggle-active`).then((r) => r.data),
  listBookings:     (status?: string) => adminAxios.get<ApiResponse<any>>('/admin/bookings', { params: { status } }).then((r) => r.data),
  listPayments:     () => adminAxios.get<ApiResponse<any>>('/admin/payments').then((r) => r.data),
  listCoupons:      () => adminAxios.get<ApiResponse<any>>('/admin/coupons').then((r) => r.data),
  createCoupon:     (data: any) => adminAxios.post<ApiResponse<any>>('/admin/coupons', data).then((r) => r.data),
  toggleCoupon:     (code: string) => adminAxios.put<ApiResponse<any>>(`/admin/coupons/${code}/toggle`).then((r) => r.data),
};

// ─── HELPERS ───
export const getErrorMessage = (error: any): string => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message?.includes('Network')) return 'Server se connect nahi ho saka';
  return 'Kuch gadbad ho gayi';
};
