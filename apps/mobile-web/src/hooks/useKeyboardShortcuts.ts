import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;
      const target = e.target as HTMLElement;
      // Don't intercept when typing
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      if (isMod && e.key === 'k') { e.preventDefault(); navigate('/search'); }
      if (isMod && e.key === 'h') { e.preventDefault(); navigate('/home'); }
      if (isMod && e.key === 'b') { e.preventDefault(); navigate('/bookings'); }
      if (isMod && e.key === 'p') { e.preventDefault(); navigate('/profile'); }
      if (e.key === 'Escape')     { history.length > 1 && navigate(-1); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);
};
