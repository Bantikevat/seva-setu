/**
 * VOICE NOTES — Record audio describing the problem
 * 10x feature: No app has this for service booking!
 * Uses browser MediaRecorder API — completely FREE
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Play, Pause, Trash2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

interface VoiceNoteProps {
  onRecord: (audioBase64: string | null) => void;
}

export const VoiceNote = ({ onRecord }: VoiceNoteProps) => {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [waveform, setWaveform] = useState<number[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<any>(null);
  const animFrameRef = useRef<any>(null);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Convert to base64 for backend
        const reader = new FileReader();
        reader.onloadend = () => onRecord(reader.result as string);
        reader.readAsDataURL(blob);

        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((d) => {
          if (d >= 30) { stopRecording(); return d; }
          return d + 1;
        });
      }, 1000);

      // Animate waveform
      const updateWave = () => {
        setWaveform((prev) => [...prev.slice(-19), Math.random() * 0.7 + 0.3]);
        animFrameRef.current = requestAnimationFrame(updateWave);
      };
      updateWave();
    } catch (err) {
      toast.error('Microphone permission denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setWaveform([]);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current && audioUrl) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setPlaying(false);
    }
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
    } else {
      audioRef.current?.play();
      setPlaying(true);
    }
  };

  const deleteAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setDuration(0);
    setPlaying(false);
    onRecord(null);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-900/20 dark:via-cyan-900/20 dark:to-teal-900/20 border border-blue-200 dark:border-blue-900/40 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={12} className="text-blue-500" />
        <p className="text-xs font-bold tracking-wider uppercase text-blue-600 dark:text-blue-400">
          Voice Note (Optional)
        </p>
      </div>

      {!audioUrl && !recording && (
        <button
          onClick={startRecording}
          className="w-full flex items-center gap-3 group"
        >
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
            <Mic size={24} />
          </div>
          <div className="flex-1 text-left">
            <p className="font-extrabold text-sm">Record voice note</p>
            <p className="text-xs text-slate-500 mt-0.5">Describe problem in Hindi/English (max 30s)</p>
          </div>
        </button>
      )}

      {/* Recording UI */}
      <AnimatePresence>
        {recording && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3"
          >
            <motion.button
              onClick={stopRecording}
              whileTap={{ scale: 0.9 }}
              className="w-14 h-14 bg-red-500 rounded-2xl flex items-center justify-center text-white shadow-medium relative"
            >
              <Square size={20} className="fill-white" />
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute inset-0 bg-red-500 rounded-2xl"
              />
            </motion.button>

            <div className="flex-1">
              {/* Waveform */}
              <div className="flex items-center gap-0.5 h-8 mb-1">
                {waveform.map((h, i) => (
                  <div
                    key={i}
                    className="w-1 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-full transition-all"
                    style={{ height: `${h * 100}%` }}
                  />
                ))}
              </div>
              <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Recording... {formatTime(duration)}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Playback UI */}
      {audioUrl && !recording && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <button
            onClick={togglePlay}
            className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-md"
          >
            {playing ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
          </button>
          <div className="flex-1">
            {/* Static waveform */}
            <div className="flex items-center gap-0.5 h-8 mb-1">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-full"
                  style={{ height: `${30 + Math.random() * 70}%` }}
                />
              ))}
            </div>
            <p className="text-xs font-bold text-slate-600">
              {playing ? 'Playing...' : 'Tap play'} • {formatTime(duration)}
            </p>
          </div>
          <button
            onClick={deleteAudio}
            className="w-10 h-10 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl flex items-center justify-center"
          >
            <Trash2 size={16} />
          </button>
        </motion.div>
      )}
    </div>
  );
};
