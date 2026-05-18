/**
 * CHAT SCREEN — Real-time messaging between customer & worker
 * URL: /chat/:bookingId
 *
 * Features:
 *   - Real-time text messages (Socket.io)
 *   - Image upload (Cloudinary) — tap paperclip
 *   - Voice notes (browser MediaRecorder) — hold mic
 *   - Typing indicator
 *   - Read receipts (✓ / ✓✓)
 *   - Auto-scroll to bottom
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Send, Camera, Mic, Square, Check, CheckCheck,
  Phone, X, Play, Pause, Image as ImageIcon,
} from 'lucide-react';
import { booking as bookingApi } from '@/services/api';
import type { Booking } from '@/types';
import { useChat, type ChatMessage } from '@/hooks/useChat';
import { uploadToCloud, optimizeCloudinaryUrl } from '@/utils/image-upload';

export const ChatScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [input, setInput] = useState('');
  const [lightbox, setLightbox] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, role, isConnected, isTyping, sendText, sendImage, sendVoice, notifyTyping, markRead } = useChat(id);

  // ── Load booking metadata ──
  useEffect(() => {
    if (!id) return;
    bookingApi.getById(id).then((r) => r.data && setBooking(r.data));
  }, [id]);

  // ── Auto-scroll on new message ──
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    markRead();
  }, [messages, markRead]);

  // ── Handlers ──
  const handleSend = () => {
    if (!input.trim()) return;
    sendText(input);
    setInput('');
    notifyTyping(false);
  };

  const handleFile = async (file: File | null) => {
    if (!file) return;
    const toastId = toast.loading('Uploading image...');
    try {
      const url = await uploadToCloud(file, 'chat', { maxWidth: 1400, quality: 0.8 });
      if (!url) { toast.error('Upload failed', { id: toastId }); return; }
      sendImage(url);
      toast.success('Image sent', { id: toastId });
    } catch {
      toast.error('Upload failed', { id: toastId });
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  const otherName = role === 'customer' ? booking?.workerName : 'Customer';

  return (
    <div className="w-full h-full bg-cream-50 dark:bg-ink-900 flex flex-col">
      {/* HEADER */}
      <div className="px-4 pt-12 pb-3 bg-white dark:bg-ink-800 border-b border-ink-100 dark:border-ink-700">
        <div className="flex items-center gap-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-cream-100 dark:bg-ink-700 flex items-center justify-center">
            <ArrowLeft size={18} className="text-ink-700 dark:text-cream-100" />
          </motion.button>

          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-ink-900 dark:text-cream-50 truncate">
              {otherName || 'Chat'}
            </p>
            <p className="text-[10px] text-ink-400 flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-ink-300'}`} />
              {isConnected ? (isTyping ? 'typing...' : 'online') : 'connecting...'}
            </p>
          </div>

          {booking?.workerPhone && role === 'customer' && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => (window.location.href = `tel:${booking.workerPhone}`)}
              className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center"
            >
              <Phone size={16} className="text-emerald-600" />
            </motion.button>
          )}
        </div>
      </div>

      {/* MESSAGES */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 mx-auto border border-ink-200 dark:border-ink-700 rounded-2xl flex items-center justify-center mb-4">
              <Send size={20} strokeWidth={1.5} className="text-ink-400" />
            </div>
            <p className="font-display text-xl text-ink-900 dark:text-cream-50 tracking-tight mb-1">
              Say hello
            </p>
            <p className="text-xs text-ink-400">Send a message to start chatting</p>
          </div>
        ) : (
          messages.map((m, i) => {
            const isMine = role && m.senderType === role;
            const prev   = messages[i - 1];
            const showAvatar = !prev || prev.senderType !== m.senderType;
            return (
              <MessageBubble
                key={m.id}
                msg={m}
                isMine={!!isMine}
                showHead={showAvatar}
                onImageClick={(u) => setLightbox(u)}
              />
            );
          })
        )}

        {isTyping && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 rounded-2xl w-fit">
            <span className="w-1.5 h-1.5 bg-ink-400 rounded-full animate-pulse" />
            <span className="w-1.5 h-1.5 bg-ink-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-ink-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
          </motion.div>
        )}
      </div>

      {/* INPUT BAR */}
      <div className="px-3 py-3 bg-white dark:bg-ink-800 border-t border-ink-100 dark:border-ink-700 flex items-end gap-2">
        <button
          onClick={() => fileRef.current?.click()}
          className="w-10 h-10 rounded-full bg-cream-100 dark:bg-ink-700 flex items-center justify-center flex-shrink-0"
        >
          <Camera size={16} className="text-ink-700 dark:text-cream-100" />
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] || null)} />

        <textarea
          value={input}
          onChange={(e) => { setInput(e.target.value); notifyTyping(true); }}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 bg-cream-50 dark:bg-ink-900 rounded-2xl px-4 py-2.5 text-sm outline-none text-ink-900 dark:text-cream-50 placeholder:text-ink-400 resize-none max-h-32"
        />

        {input.trim() ? (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            className="w-10 h-10 rounded-full bg-ink-900 dark:bg-cream-50 text-cream-50 dark:text-ink-900 flex items-center justify-center flex-shrink-0"
          >
            <Send size={15} strokeWidth={2.5} />
          </motion.button>
        ) : (
          <VoiceRecorder onSend={sendVoice} />
        )}
      </div>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 bg-ink-900/95 z-[100] flex items-center justify-center p-4"
          >
            <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
              <X size={18} className="text-white" />
            </button>
            <img src={optimizeCloudinaryUrl(lightbox, { width: 1400 })} alt="" className="max-w-full max-h-full object-contain rounded-2xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────── Message bubble ───────
const MessageBubble = ({ msg, isMine, showHead, onImageClick }: { msg: ChatMessage; isMine: boolean; showHead: boolean; onImageClick: (u: string) => void }) => {
  const time = new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${showHead ? 'mt-2' : 'mt-0.5'}`}
    >
      <div className={`max-w-[78%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
        {msg.messageType === 'text' && (
          <div className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
            isMine
              ? 'bg-ink-900 dark:bg-cream-50 text-cream-50 dark:text-ink-900 rounded-br-sm'
              : 'bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 text-ink-900 dark:text-cream-50 rounded-bl-sm'
          }`}>
            {msg.content}
          </div>
        )}

        {msg.messageType === 'image' && msg.mediaUrl && (
          <button onClick={() => onImageClick(msg.mediaUrl!)} className="rounded-2xl overflow-hidden">
            <img
              src={optimizeCloudinaryUrl(msg.mediaUrl, { width: 600 })}
              className="max-w-[240px] max-h-[300px] object-cover"
              alt=""
            />
          </button>
        )}

        {msg.messageType === 'voice' && msg.mediaUrl && (
          <VoicePlayer url={msg.mediaUrl} isMine={isMine} />
        )}

        <div className={`flex items-center gap-1 mt-1 px-1 ${isMine ? '' : 'self-start'}`}>
          <span className="text-[10px] text-ink-400">{time}</span>
          {isMine && (
            msg.isRead
              ? <CheckCheck size={11} className="text-primary-500" />
              : <Check size={11} className="text-ink-400" />
          )}
          {msg._pending && <span className="text-[10px] text-ink-400">·</span>}
        </div>
      </div>
    </motion.div>
  );
};

// ─────── Voice recorder ───────
const VoiceRecorder = ({ onSend }: { onSend: (url: string) => void }) => {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((t) => t.stop());

        // Cap voice notes at 60s / ~500KB. Store inline as data URL.
        // (Production: upload to Cloudinary 'video' resource_type via a dedicated endpoint.)
        if (blob.size > 800 * 1024) {
          toast.error('Voice note too long — try again');
          return;
        }
        const reader = new FileReader();
        reader.onload = () => onSend(reader.result as string);
        reader.readAsDataURL(blob);
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
      setSeconds(0);
      timerRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      toast.error('Mic access denied');
    }
  };

  const stop = () => {
    mediaRef.current?.stop();
    setRecording(false);
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
  };

  if (recording) {
    return (
      <button
        onClick={stop}
        className="h-10 px-4 rounded-full bg-red-500 text-white flex items-center gap-2 flex-shrink-0 animate-pulse"
      >
        <Square size={11} className="fill-white" />
        <span className="text-xs font-mono">{String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}</span>
      </button>
    );
  }
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={start}
      className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center flex-shrink-0"
    >
      <Mic size={15} strokeWidth={2.5} />
    </motion.button>
  );
};

// ─────── Voice player ───────
const VoicePlayer = ({ url, isMine }: { url: string; isMine: boolean }) => {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggle = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(url);
      audioRef.current.onended = () => setPlaying(false);
    }
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else         { audioRef.current.play(); setPlaying(true); }
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-2xl ${
      isMine ? 'bg-ink-900 dark:bg-cream-50 text-cream-50 dark:text-ink-900' : 'bg-white dark:bg-ink-800 border border-ink-100 text-ink-900 dark:text-cream-50'
    }`}>
      <button onClick={toggle} className="w-8 h-8 rounded-full bg-current/10 flex items-center justify-center">
        {playing ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
      </button>
      <div className="flex items-center gap-0.5 py-1">
        {[3, 5, 8, 6, 4, 7, 5, 3, 6, 4].map((h, i) => (
          <span key={i} className={`w-0.5 rounded-full ${isMine ? 'bg-cream-50/60 dark:bg-ink-900/60' : 'bg-ink-400'}`} style={{ height: `${h * 2}px` }} />
        ))}
      </div>
      <span className="text-[10px] opacity-60 font-mono">Voice</span>
    </div>
  );
};
