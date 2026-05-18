/**
 * AI CHAT — Floating support bot
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { ai } from '@/services/api';

interface Message {
  from: 'user' | 'ai';
  text: string;
  suggestions?: string[];
}

export const AiChat = ({ userId }: { userId?: string }) => {
  const [open, setOpen]   = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      from: 'ai',
      text: '👋 Namaste! Main Seva Setu AI assistant. Kya help chahiye?',
      suggestions: ['Book a service', 'My bookings', 'Payment help'],
    },
  ]);
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg) return;

    setMessages((m) => [...m, { from: 'user', text: msg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await ai.chat(msg, userId);
      if (res.data) {
        setMessages((m) => [...m, { from: 'ai', text: res.data!.reply, suggestions: res.data!.suggestions }]);
      }
    } catch (err) {
      setMessages((m) => [...m, { from: 'ai', text: '😔 Sorry, error aa gaya. Try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-24 right-6 z-50 w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-2xl flex items-center justify-center text-white"
        style={{ display: open ? 'none' : 'flex' }}
      >
        <Bot size={26} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 bottom-20 max-w-sm mx-auto z-50"
          >
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot size={16} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Seva Setu AI</p>
                    <p className="text-[10px] opacity-80">● Online</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="w-8 h-8 hover:bg-white/20 rounded-lg flex items-center justify-center">
                  <X size={18} />
                </button>
              </div>

              {/* Messages */}
              <div className="h-80 overflow-y-auto p-3 space-y-3 bg-slate-50 dark:bg-zinc-950">
                {messages.map((m, i) => (
                  <div key={i}>
                    <div className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                        m.from === 'user'
                          ? 'bg-primary-500 text-white rounded-br-sm'
                          : 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-slate-100 rounded-bl-sm shadow-sm'
                      }`}>
                        {m.text}
                      </div>
                    </div>
                    {m.suggestions && m.from === 'ai' && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {m.suggestions.map((s) => (
                          <button
                            key={s}
                            onClick={() => handleSend(s)}
                            className="text-[11px] bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full hover:bg-purple-200"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-zinc-800 rounded-2xl px-3 py-2 text-sm shadow-sm">
                      <span className="inline-block animate-pulse">●●●</span>
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>

              {/* Input */}
              <div className="p-3 bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your question..."
                  className="flex-1 px-3 py-2 bg-slate-100 dark:bg-zinc-800 rounded-xl text-sm outline-none"
                />
                <button
                  onClick={() => handleSend()}
                  className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
