/**
 * BOOKING REMINDER — Free browser notifications, no paid service needed
 * Schedules a notification 1 hour before booking time
 */

import { notify, requestPermission } from './notifications';

const REMINDER_KEY = 'seva_reminders';

interface Reminder {
  bookingId: string;
  bookingNumber: string;
  scheduledAt: string;
  workerName: string;
  categoryName: string;
  timerId?: number;
}

const getSaved = (): Record<string, Reminder> => {
  try {
    return JSON.parse(localStorage.getItem(REMINDER_KEY) || '{}');
  } catch {
    return {};
  }
};

const saveAll = (reminders: Record<string, Reminder>) => {
  localStorage.setItem(REMINDER_KEY, JSON.stringify(reminders));
};

export const scheduleReminder = async (booking: {
  id: string;
  bookingNumber: string;
  scheduledAt: string;
  workerName: string;
  categoryName: string;
}): Promise<boolean> => {
  const granted = await requestPermission();
  if (!granted) return false;

  const serviceTime = new Date(booking.scheduledAt).getTime();
  const reminderTime = serviceTime - 60 * 60 * 1000; // 1 hour before
  const now = Date.now();

  if (reminderTime <= now) return false; // already past

  const delay = reminderTime - now;

  const timerId = window.setTimeout(() => {
    notify(
      `🔔 Reminder: ${booking.categoryName} in 1 hour`,
      `${booking.workerName} ${new Date(booking.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} pe aayenge`,
      { url: `/booking/${booking.id}`, vibrate: true }
    );
    // Clean up after firing
    const saved = getSaved();
    delete saved[booking.id];
    saveAll(saved);
  }, delay);

  const saved = getSaved();
  saved[booking.id] = { ...booking, bookingId: booking.id, timerId };
  saveAll(saved);

  return true;
};

export const cancelReminder = (bookingId: string) => {
  const saved = getSaved();
  if (saved[bookingId]?.timerId) {
    window.clearTimeout(saved[bookingId].timerId);
  }
  delete saved[bookingId];
  saveAll(saved);
};

export const hasReminder = (bookingId: string): boolean => {
  return !!getSaved()[bookingId];
};

// Re-register reminders on app load (in case page was refreshed)
export const restoreReminders = () => {
  const saved = getSaved();
  const now = Date.now();
  const valid: Record<string, Reminder> = {};

  for (const [id, reminder] of Object.entries(saved)) {
    const serviceTime = new Date(reminder.scheduledAt).getTime();
    const reminderTime = serviceTime - 60 * 60 * 1000;
    if (reminderTime > now) {
      scheduleReminder({ ...reminder, id: reminder.bookingId }); // re-schedule
      valid[id] = reminder;
    }
  }
  saveAll(valid);
};
