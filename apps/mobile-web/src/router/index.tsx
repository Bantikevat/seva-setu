/**
 * ROUTER — React Router setup
 */

import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { SplashScreen } from '@/screens/SplashScreen';
import { OnboardScreen } from '@/screens/OnboardScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { OtpScreen } from '@/screens/OtpScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { WorkersScreen } from '@/screens/WorkersScreen';
import { WorkerDetailScreen } from '@/screens/WorkerDetailScreen';
import { BookingsScreen } from '@/screens/BookingsScreen';
import { BookingDetailScreen } from '@/screens/BookingDetailScreen';
import { WorkerDashboardScreen } from '@/screens/WorkerDashboardScreen';
import { WorkerOnboardingScreen } from '@/screens/WorkerOnboardingScreen';
import { WorkerEarningsScreen } from '@/screens/WorkerEarningsScreen';
import { WorkerScheduleScreen } from '@/screens/WorkerScheduleScreen';
import { AdminScreen } from '@/screens/AdminScreen';
import { TrackingScreen } from '@/screens/TrackingScreen';
import { SearchScreen } from '@/screens/SearchScreen';
import { HelpScreen } from '@/screens/HelpScreen';
import { ReviewsScreen } from '@/screens/ReviewsScreen';
import { ChatScreen } from '@/screens/ChatScreen';
import { RewardsScreen } from '@/screens/RewardsScreen';
import { TermsScreen } from '@/screens/TermsScreen';
import { PrivacyScreen } from '@/screens/PrivacyScreen';
import { LeaderboardScreen } from '@/screens/LeaderboardScreen';
import { BundlePackagesScreen } from '@/screens/BundlePackagesScreen';
import { WorkerGalleryScreen } from '@/screens/WorkerGalleryScreen';
import { FavoritesScreen } from '@/screens/FavoritesScreen';
import { NotificationsScreen } from '@/screens/NotificationsScreen';
import { NotFoundScreen } from '@/screens/NotFoundScreen';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export const router = createBrowserRouter([
  { path: '/',         element: <SplashScreen /> },
  { path: '/onboard',  element: <OnboardScreen /> },
  { path: '/login',    element: <LoginScreen /> },
  { path: '/otp',      element: <OtpScreen /> },

  // Protected
  { path: '/home',           element: <ProtectedRoute><HomeScreen /></ProtectedRoute> },
  { path: '/profile',        element: <ProtectedRoute><ProfileScreen /></ProtectedRoute> },
  { path: '/workers',        element: <ProtectedRoute><WorkersScreen /></ProtectedRoute> },
  { path: '/worker/:id',     element: <ProtectedRoute><WorkerDetailScreen /></ProtectedRoute> },
  { path: '/bookings',       element: <ProtectedRoute><BookingsScreen /></ProtectedRoute> },
  { path: '/booking/:id',    element: <ProtectedRoute><BookingDetailScreen /></ProtectedRoute> },
  { path: '/tracking/:id',   element: <ProtectedRoute><TrackingScreen /></ProtectedRoute> },
  { path: '/search',         element: <ProtectedRoute><SearchScreen /></ProtectedRoute> },
  { path: '/help',                element: <ProtectedRoute><HelpScreen /></ProtectedRoute> },
  { path: '/worker/:id/reviews',  element: <ProtectedRoute><ReviewsScreen /></ProtectedRoute> },
  { path: '/chat/:id',            element: <ProtectedRoute><ChatScreen /></ProtectedRoute> },
  { path: '/rewards',             element: <ProtectedRoute><RewardsScreen /></ProtectedRoute> },

  // Legal — public (no auth needed)
  { path: '/terms',               element: <TermsScreen /> },
  { path: '/privacy',             element: <PrivacyScreen /> },
  { path: '/leaderboard',         element: <LeaderboardScreen /> },
  { path: '/packages',            element: <ProtectedRoute><BundlePackagesScreen /></ProtectedRoute> },
  { path: '/worker-gallery',      element: <ProtectedRoute><WorkerGalleryScreen /></ProtectedRoute> },
  { path: '/favorites',           element: <ProtectedRoute><FavoritesScreen /></ProtectedRoute> },
  { path: '/notifications',       element: <ProtectedRoute><NotificationsScreen /></ProtectedRoute> },
  { path: '/worker-mode',    element: <ProtectedRoute><WorkerDashboardScreen /></ProtectedRoute> },
  { path: '/worker-onboard',   element: <ProtectedRoute><WorkerOnboardingScreen /></ProtectedRoute> },
  { path: '/worker-earnings',  element: <ProtectedRoute><WorkerEarningsScreen /></ProtectedRoute> },
  { path: '/worker-schedule',  element: <ProtectedRoute><WorkerScheduleScreen /></ProtectedRoute> },
  { path: '/admin',          element: <ProtectedRoute><AdminScreen /></ProtectedRoute> },

  { path: '*', element: <NotFoundScreen /> },
]);
