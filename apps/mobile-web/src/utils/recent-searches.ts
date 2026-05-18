const KEY = 'seva_recent_searches';
const MAX = 8;

export const getRecentSearches = (): string[] => {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
};

export const addRecentSearch = (query: string) => {
  const q = query.trim();
  if (!q) return;
  const list = getRecentSearches().filter((s) => s.toLowerCase() !== q.toLowerCase());
  list.unshift(q);
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
};

export const clearRecentSearches = () => localStorage.removeItem(KEY);
