import { MessageCircle } from 'lucide-react';

const PHONE = '916464466512';
const MSG = encodeURIComponent('Hi Seva Setu! Mujhe help chahiye.');

export const WhatsAppButton = () => (
  <a
    href={`https://wa.me/${PHONE}?text=${MSG}`}
    target="_blank"
    rel="noopener"
    aria-label="Chat on WhatsApp"
    className="fixed bottom-20 right-4 z-[9997] w-14 h-14 rounded-full bg-green-500 text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
    style={{ boxShadow: '0 8px 30px rgba(16, 185, 129, 0.4)' }}
  >
    <MessageCircle size={26} strokeWidth={2.5} fill="white" />
    <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-30" />
  </a>
);
