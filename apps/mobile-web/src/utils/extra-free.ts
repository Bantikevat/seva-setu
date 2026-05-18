/**
 * EXTRA FREE FEATURES
 * - Calendar export (.ics)
 * - Reverse geocoding (Nominatim — FREE!)
 * - Translations (Hindi/English)
 */
import { logger } from './logger';

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  CALENDAR EXPORT (.ics) â€” FREE
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
/**
 * Generate .ics calendar file for booking
 * User can add to Google Calendar, Apple Calendar etc.
 */
export const downloadCalendarEvent = (booking: {
  bookingNumber: string;
  categoryName: string;
  workerName: string;
  scheduledAt: string;
  fullAddress: string;
}) => {
  const start = new Date(booking.scheduledAt);
  const end = new Date(start.getTime() + 90 * 60 * 1000); // +90 min

  const formatDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SevaSetu//Booking//EN',
    'BEGIN:VEVENT',
    `UID:${booking.bookingNumber}@sevasetu.in`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(start)}`,
    `DTEND:${formatDate(end)}`,
    `SUMMARY:Seva Setu â€” ${booking.categoryName} Service`,
    `DESCRIPTION:Booking #${booking.bookingNumber}\\nWorker: ${booking.workerName}\\nAddress: ${booking.fullAddress}`,
    `LOCATION:${booking.fullAddress}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Worker arriving in 30 min',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `seva-setu-${booking.bookingNumber}.ics`;
  link.click();
  URL.revokeObjectURL(url);
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  REVERSE GEOCODING â€” Nominatim (FREE OpenStreetMap)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
/**
 * Convert GPS coords to human-readable address
 * Uses OpenStreetMap Nominatim â€” completely FREE, no API key
 */
export const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&accept-language=hi,en`,
      { headers: { 'User-Agent': 'SevaSetu/1.0' } }
    );
    const data = await res.json();
    return data.display_name || null;
  } catch (err) {
    logger.error('Reverse geocoding failed:', err);
    return null;
  }
};

/**
 * Convert address to GPS coords
 */
export const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=in`,
      { headers: { 'User-Agent': 'SevaSetu/1.0' } }
    );
    const data = await res.json();
    if (data.length === 0) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch (err) {
    return null;
  }
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  TRANSLATIONS (Hindi / English) â€” FREE
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type Lang = 'hi' | 'en';

const translations: Record<string, Record<Lang, string>> = {
  // Common
  'Home':              { hi: 'à¤¹à¥‹à¤®',         en: 'Home' },
  'Search':            { hi: 'à¤–à¥‹à¤œà¥‡à¤‚',       en: 'Search' },
  'Bookings':          { hi: 'à¤¬à¥à¤•à¤¿à¤‚à¤—',      en: 'Bookings' },
  'Profile':           { hi: 'à¤ªà¥à¤°à¥‹à¤«à¤¾à¤‡à¤²',   en: 'Profile' },
  'Login':             { hi: 'à¤²à¥‰à¤—à¤¿à¤¨',       en: 'Login' },
  'Logout':            { hi: 'à¤²à¥‰à¤—à¤†à¤‰à¤Ÿ',     en: 'Logout' },
  'Save':              { hi: 'à¤¸à¥‡à¤µ',         en: 'Save' },
  'Cancel':            { hi: 'à¤°à¤¦à¥à¤¦ à¤•à¤°à¥‡à¤‚',  en: 'Cancel' },

  // Auth
  'Enter your phone':  { hi: 'à¤«à¥‹à¤¨ à¤¨à¤‚à¤¬à¤° à¤¡à¤¾à¤²à¥‡à¤‚', en: 'Enter your phone' },
  'Send OTP':          { hi: 'OTP à¤­à¥‡à¤œà¥‡à¤‚',  en: 'Send OTP' },
  'Verify':            { hi: 'à¤¸à¤¤à¥à¤¯à¤¾à¤ªà¤¿à¤¤ à¤•à¤°à¥‡à¤‚', en: 'Verify' },
  'Welcome back!':     { hi: 'à¤µà¤¾à¤ªà¤¸à¥€ à¤ªà¤° à¤¸à¥à¤µà¤¾à¤—à¤¤!', en: 'Welcome back!' },

  // Home
  'Categories':        { hi: 'à¤¶à¥à¤°à¥‡à¤£à¤¿à¤¯à¤¾à¤',   en: 'Categories' },
  'Top Rated Pros':    { hi: 'à¤Ÿà¥‰à¤ª à¤°à¥‡à¤Ÿà¥‡à¤¡',   en: 'Top Rated Pros' },
  'Book Now':          { hi: 'à¤…à¤­à¥€ à¤¬à¥à¤• à¤•à¤°à¥‡à¤‚', en: 'Book Now' },

  // Booking
  'My Bookings':       { hi: 'à¤®à¥‡à¤°à¥€ à¤¬à¥à¤•à¤¿à¤‚à¤—', en: 'My Bookings' },
  'No bookings yet':   { hi: 'à¤…à¤­à¥€ à¤•à¥‹à¤ˆ à¤¬à¥à¤•à¤¿à¤‚à¤— à¤¨à¤¹à¥€à¤‚', en: 'No bookings yet' },
  'Pay Now':           { hi: 'à¤…à¤­à¥€ à¤­à¥à¤—à¤¤à¤¾à¤¨ à¤•à¤°à¥‡à¤‚', en: 'Pay Now' },
  'Live Tracking':     { hi: 'à¤²à¤¾à¤‡à¤µ à¤Ÿà¥à¤°à¥ˆà¤•à¤¿à¤‚à¤—', en: 'Live Tracking' },
  'Rate Worker':       { hi: 'à¤•à¤¾à¤®à¤—à¤¾à¤° à¤•à¥‹ à¤°à¥‡à¤Ÿ à¤•à¤°à¥‡à¤‚', en: 'Rate Worker' },

  // Status
  'pending':           { hi: 'à¤ªà¥‡à¤‚à¤¡à¤¿à¤‚à¤—',     en: 'Pending' },
  'confirmed':         { hi: 'à¤ªà¥à¤·à¥à¤Ÿà¤¿',      en: 'Confirmed' },
  'on_the_way':        { hi: 'à¤°à¤¾à¤¸à¥à¤¤à¥‡ à¤®à¥‡à¤‚',  en: 'On The Way' },
  'in_progress':       { hi: 'à¤šà¤¾à¤²à¥‚',        en: 'In Progress' },
  'completed':         { hi: 'à¤ªà¥‚à¤°à¤¾ à¤¹à¥à¤†',    en: 'Completed' },
  'cancelled':         { hi: 'à¤°à¤¦à¥à¤¦',        en: 'Cancelled' },
};

let currentLang: Lang = (localStorage.getItem('seva_lang') as Lang) || 'en';

export const t = (key: string): string => {
  return translations[key]?.[currentLang] || key;
};

export const setLanguage = (lang: Lang) => {
  currentLang = lang;
  localStorage.setItem('seva_lang', lang);
  // Trigger re-render
  window.dispatchEvent(new Event('lang-change'));
};

export const getLanguage = (): Lang => currentLang;
