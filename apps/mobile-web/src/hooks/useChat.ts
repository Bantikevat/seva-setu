/**
 * useChat — React hook for real-time booking chat
 *
 * Connects to booking-service WebSocket, joins the booking room,
 * loads history, sends messages, tracks typing + read status.
 *
 *   const { messages, sendText, sendImage, sendVoice, typing, isConnected } = useChat(bookingId);
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { chat as chatApi } from '@/services/api';

const SOCKET_URL = ((import.meta as any).env?.VITE_BOOKING_API as string | undefined) || 'http://localhost:3004';

export interface ChatMessage {
  id:          string;
  bookingId:   string;
  senderType:  'customer' | 'worker';
  senderId:    string;
  messageType: 'text' | 'image' | 'voice';
  content:     string | null;
  mediaUrl:    string | null;
  isRead:      boolean;
  createdAt:   string;
  _pending?:   boolean;  // optimistic UI flag
}

export interface UseChatResult {
  messages:    ChatMessage[];
  role:        'customer' | 'worker' | null;
  isConnected: boolean;
  isTyping:    boolean;       // *other* party is typing
  sendText:    (text: string) => void;
  sendImage:   (url: string) => void;
  sendVoice:   (url: string, duration?: number) => void;
  notifyTyping: (isTyping: boolean) => void;
  markRead:    () => void;
}

export const useChat = (bookingId: string | null | undefined): UseChatResult => {
  const [messages, setMessages]       = useState<ChatMessage[]>([]);
  const [role, setRole]               = useState<'customer' | 'worker' | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping]       = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const typingTimer = useRef<number | null>(null);

  // ── Initial history fetch ──
  useEffect(() => {
    if (!bookingId) return;
    chatApi
      .history(bookingId)
      .then((res) => {
        if (res.data) {
          setMessages(res.data.messages || []);
          setRole(res.data.role || null);
        }
      })
      .catch(() => {});
  }, [bookingId]);

  // ── Socket lifecycle ──
  useEffect(() => {
    if (!bookingId) return;
    const token = localStorage.getItem('seva_token');
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('chat:join', { bookingId });
    });

    socket.on('chat:joined', ({ role: r }) => setRole(r));

    socket.on('chat:message', (m: ChatMessage) => {
      setMessages((prev) => {
        // Replace optimistic message if exists (match by content+sender)
        const optimisticIdx = prev.findIndex(
          (p) =>
            p._pending &&
            p.senderId === m.senderId &&
            p.messageType === m.messageType &&
            ((m.content && p.content === m.content) || (m.mediaUrl && p.mediaUrl === m.mediaUrl))
        );
        if (optimisticIdx >= 0) {
          const next = [...prev];
          next[optimisticIdx] = m;
          return next;
        }
        // Avoid duplicates
        if (prev.find((p) => p.id === m.id)) return prev;
        return [...prev, m];
      });
    });

    socket.on('chat:typing', ({ isTyping: t }) => setIsTyping(!!t));

    socket.on('chat:read', () => {
      setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
    });

    socket.on('disconnect', () => setIsConnected(false));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [bookingId]);

  // ── Senders ──
  const sendText = useCallback((text: string) => {
    if (!bookingId || !text.trim() || !socketRef.current) return;
    const tempId = 'tmp-' + Date.now();
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        bookingId,
        senderType: role || 'customer',
        senderId: 'me',
        messageType: 'text',
        content: text.trim(),
        mediaUrl: null,
        isRead: false,
        createdAt: new Date().toISOString(),
        _pending: true,
      },
    ]);
    socketRef.current.emit('chat:send', { bookingId, messageType: 'text', content: text.trim() });
  }, [bookingId, role]);

  const sendImage = useCallback((url: string) => {
    if (!bookingId || !socketRef.current) return;
    socketRef.current.emit('chat:send', { bookingId, messageType: 'image', mediaUrl: url });
  }, [bookingId]);

  const sendVoice = useCallback((url: string) => {
    if (!bookingId || !socketRef.current) return;
    socketRef.current.emit('chat:send', { bookingId, messageType: 'voice', mediaUrl: url });
  }, [bookingId]);

  const notifyTyping = useCallback((typing: boolean) => {
    if (!bookingId || !socketRef.current) return;
    socketRef.current.emit('chat:typing', { bookingId, isTyping: typing });
    if (typing) {
      if (typingTimer.current) window.clearTimeout(typingTimer.current);
      typingTimer.current = window.setTimeout(() => {
        socketRef.current?.emit('chat:typing', { bookingId, isTyping: false });
      }, 3000);
    }
  }, [bookingId]);

  const markRead = useCallback(() => {
    if (!bookingId || !socketRef.current) return;
    socketRef.current.emit('chat:read', { bookingId });
  }, [bookingId]);

  return { messages, role, isConnected, isTyping, sendText, sendImage, sendVoice, notifyTyping, markRead };
};
