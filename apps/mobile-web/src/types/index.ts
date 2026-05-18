/**
 * TYPES — All TypeScript types
 */

export interface User {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  profilePhoto: string | null;
  cityId: string | null;
  createdAt?: string;
  referralCode?: string;
  totalJobs?: number;
}

export interface Address {
  id: string;
  label: string;
  fullAddress: string;
  latitude: number;
  longitude: number;
  cityId: string | null;
  isDefault: boolean;
  createdAt?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  code?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  isNewUser: boolean;
}

export interface Category {
  id: string;
  name: string;
  nameHindi: string;
  emoji: string;
  basePrice: number;
}

export interface Worker {
  id: string;
  name: string;
  profilePhoto: string | null;
  ratingAverage: number;
  totalJobs: number;
  isVerified: boolean;
  isAvailable: boolean;
  latitude: number | null;
  longitude: number | null;
  skill: string;
  skillEmoji: string;
  pricePerVisit: number;
  experienceYears: number;
  distanceKm: number | null;
}

export interface WorkerProfile extends Omit<Worker, 'skill' | 'skillEmoji' | 'pricePerVisit' | 'distanceKm'> {
  phone: string;
  bio: string | null;
  isActive: boolean;
  totalEarnings: number;
  skills: WorkerSkill[];
  reviewsCount: number;
  joinedAt: string;
}

export interface WorkerSkill {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryEmoji: string;
  experienceYears: number;
  isPrimary: boolean;
}

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'on_the_way'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export interface Booking {
  id: string;
  bookingNumber: string;

  customerId: string;
  workerId: string;
  workerName: string;
  workerPhone: string;

  categoryId: string;
  categoryName: string;
  categoryEmoji: string;

  scheduledAt: string;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;

  fullAddress: string;
  latitude: number;
  longitude: number;

  basePrice: number;
  platformFee: number;
  totalAmount: number;
  workerPayout: number;
  paymentStatus: string;

  status: BookingStatus;
  notes: string | null;
  rating: number | null;
  review: string | null;
  cancellationReason: string | null;
  cancelledBy: string | null;

  createdAt: string;
  updatedAt: string;
}
