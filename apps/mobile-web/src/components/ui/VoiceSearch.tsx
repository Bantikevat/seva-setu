import { useState, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  onResult: (text: string) => void;
  lang?: string;
}

interface SpeechRecognitionEvent {
  results: { [key: number]: { [key: number]: { transcript: string } } };
}

type SR = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (e: SpeechRecognitionEvent) => void;
  onerror: () => void;
  onend:   () => void;
};

export const VoiceSearch = ({ onResult, lang = 'hi-IN' }: Props) => {
  const [listening, setListening] = useState(false);
  const ref = useRef<SR | null>(null);

  const SpeechRecognition = (window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR }).SpeechRecognition
    || (window as unknown as { webkitSpeechRecognition?: new () => SR }).webkitSpeechRecognition;

  if (!SpeechRecognition) return null;

  const toggle = () => {
    if (listening) { ref.current?.stop(); return; }
    const rec = new SpeechRecognition();
    rec.lang = lang;
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      onResult(text);
    };
    rec.onerror = () => toast.error('Voice input fail — try again');
    rec.onend   = () => setListening(false);
    rec.start();
    ref.current = rec;
    setListening(true);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Voice search"
      className={`p-2 rounded-full transition ${
        listening
          ? 'bg-red-500 text-white animate-pulse'
          : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
      }`}
    >
      {listening ? <MicOff size={18} /> : <Mic size={18} />}
    </button>
  );
};
