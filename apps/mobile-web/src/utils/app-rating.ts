/**
 * APP RATING PROMPT — Show after 3 completed bookings
 * Uses Web Intent / Play Store deep link (free, no SDK needed)
 */

const RATING_KEY = 'seva_rating';
const BOOKINGS_KEY = 'seva_completed_bookings';

export const trackCompletedBooking = () => {
  const count = parseInt(localStorage.getItem(BOOKINGS_KEY) || '0', 10) + 1;
  localStorage.setItem(BOOKINGS_KEY, String(count));
  return count;
};

export const hasRated = (): boolean => !!localStorage.getItem(RATING_KEY);

export const markRated = () => localStorage.setItem(RATING_KEY, '1');

export const shouldShowRating = (): boolean => {
  if (hasRated()) return false;
  const count = parseInt(localStorage.getItem(BOOKINGS_KEY) || '0', 10);
  return count >= 3;
};

export const openPlayStore = () => {
  // Android Play Store deep link — replace with real package name before publishing
  const packageName = 'in.sevasetu.app';
  const playUrl = `https://play.google.com/store/apps/details?id=${packageName}`;
  // Try intent first (Android native), fallback to browser
  window.open(playUrl, '_blank');
  markRated();
};
