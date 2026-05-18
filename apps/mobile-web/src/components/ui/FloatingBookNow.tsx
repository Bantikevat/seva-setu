import { useNavigate, useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';

const HIDE_ON = ['/login', '/otp', '/onboard', '/', '/splash', '/booking/', '/chat/', '/worker-mode', '/admin'];

export const FloatingBookNow = () => {
  const nav = useNavigate();
  const loc = useLocation();
  if (HIDE_ON.some((p) => loc.pathname === p || loc.pathname.startsWith(p))) return null;

  return (
    <button
      onClick={() => nav('/workers')}
      aria-label="Book a service"
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9996] bg-primary-500 text-white px-5 py-3 rounded-full font-bold text-sm shadow-2xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform sm:left-auto sm:right-24 sm:translate-x-0"
      style={{ boxShadow: '0 8px 30px rgba(255, 107, 53, 0.4)' }}
    >
      <Plus size={18} strokeWidth={3} /> Book a Service
    </button>
  );
};
