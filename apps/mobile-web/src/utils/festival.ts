/**
 * Festival detection — auto banner based on Indian calendar
 * Add new dates as needed.
 */
interface Festival {
  name:   string;
  emoji:  string;
  start:  string; // MM-DD
  end:    string; // MM-DD
  color:  string;
  offer:  string;
}

const FESTIVALS: Festival[] = [
  { name: 'Diwali',     emoji: '🪔', start: '10-25', end: '11-15', color: 'from-amber-500 to-orange-600',  offer: '20% OFF — DIWALI20' },
  { name: 'Holi',       emoji: '🎨', start: '03-10', end: '03-20', color: 'from-pink-500 to-purple-600',   offer: '15% OFF — HOLI15' },
  { name: 'Navratri',   emoji: '💃', start: '09-25', end: '10-05', color: 'from-red-500 to-pink-600',      offer: '10% OFF — NAVRATRI' },
  { name: 'Raksha Bandhan', emoji: '🪢', start: '08-15', end: '08-25', color: 'from-rose-500 to-amber-500', offer: '15% OFF — RAKHI15' },
  { name: 'Independence Day', emoji: '🇮🇳', start: '08-13', end: '08-17', color: 'from-orange-500 to-green-600', offer: '15% OFF — FREEDOM' },
  { name: 'New Year',   emoji: '🎉', start: '12-28', end: '01-05', color: 'from-violet-600 to-indigo-700', offer: '25% OFF — NEWYEAR' },
];

export const getCurrentFestival = (): Festival | null => {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const today = `${m}-${d}`;
  for (const f of FESTIVALS) {
    if (f.start <= f.end) {
      if (today >= f.start && today <= f.end) return f;
    } else {
      // crosses year boundary (Dec → Jan)
      if (today >= f.start || today <= f.end) return f;
    }
  }
  return null;
};
