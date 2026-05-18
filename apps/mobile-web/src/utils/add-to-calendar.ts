/**
 * Generate Google Calendar URL or ICS file for a booking
 */
interface CalEvent {
  title: string;
  description: string;
  location: string;
  start: Date;
  durationMinutes?: number;
}

const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

export const googleCalendarUrl = (e: CalEvent): string => {
  const end = new Date(e.start.getTime() + (e.durationMinutes || 60) * 60_000);
  const params = new URLSearchParams({
    action:   'TEMPLATE',
    text:     e.title,
    details:  e.description,
    location: e.location,
    dates:    `${fmt(e.start)}/${fmt(end)}`,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
};

export const downloadIcs = (e: CalEvent) => {
  const end = new Date(e.start.getTime() + (e.durationMinutes || 60) * 60_000);
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Seva Setu//EN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@sevasetu.in`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(e.start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${e.title}`,
    `DESCRIPTION:${e.description}`,
    `LOCATION:${e.location}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar' });
  const url  = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'seva-setu-booking.ics'; a.click();
  URL.revokeObjectURL(url);
};
