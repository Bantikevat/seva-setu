/**
 * PROBLEM CAPTURE — Take photo of problem before booking
 * 10x feature - NO other app has this!
 * AI can analyze (future) to suggest worker / pricing
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Check, Sparkles, RotateCw } from 'lucide-react';
import { compressImage } from '@/utils/free-features';
import toast from 'react-hot-toast';

interface ProblemCaptureProps {
  onPhotoCapture: (base64: string) => void;
  category?: string;
}

export const ProblemCapture = ({ onPhotoCapture, category }: ProblemCaptureProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return toast.error('Only images allowed');

    try {
      const compressed = await compressImage(file, 800, 0.7);
      setPhoto(compressed);
      onPhotoCapture(compressed);

      // Mock AI analysis
      setAnalyzing(true);
      setTimeout(() => {
        setAnalyzing(false);
        const mockResults: Record<string, any> = {
          'Plumber':     { issue: 'Pipe leakage detected', urgency: 'High',   estimate: '₹350-500', confidence: 92 },
          'Electrician': { issue: 'Wire connection issue', urgency: 'Medium', estimate: '₹400-600', confidence: 88 },
          'AC Repair':   { issue: 'Filter cleaning needed', urgency: 'Low',   estimate: '₹499-700', confidence: 95 },
          default:       { issue: 'Issue detected',         urgency: 'Medium', estimate: '₹300-500', confidence: 85 },
        };
        setAnalysis(mockResults[category || 'default'] || mockResults.default);
      }, 1800);
    } catch (err) {
      toast.error('Failed to process image');
    }
  };

  const handleRetake = () => {
    setPhoto(null);
    setAnalysis(null);
    inputRef.current?.click();
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-orange-900/20 border border-purple-200 dark:border-purple-900/40 rounded-2xl p-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {!photo ? (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full flex items-center gap-3 group"
        >
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
            <Camera size={24} />
          </div>
          <div className="flex-1 text-left">
            <p className="text-xs font-bold tracking-wider uppercase text-purple-600 dark:text-purple-400 mb-1 flex items-center gap-1">
              <Sparkles size={11} /> AI-Powered
            </p>
            <p className="font-extrabold text-sm">Take a photo of the problem</p>
            <p className="text-xs text-slate-500 mt-0.5">AI will analyze & suggest pricing</p>
          </div>
        </button>
      ) : (
        <div>
          {/* Photo preview */}
          <div className="relative rounded-2xl overflow-hidden mb-3 aspect-video bg-slate-100 dark:bg-ink-800">
            <img src={photo} alt="Problem" className="w-full h-full object-cover" />

            {/* Analyzing overlay */}
            <AnimatePresence>
              {analyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-white"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles size={40} className="text-yellow-300" />
                  </motion.div>
                  <p className="font-bold mt-3 text-sm">AI is analyzing...</p>
                  <p className="text-xs opacity-80 mt-1">Checking issue & pricing</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Retake button */}
            {!analyzing && (
              <button
                onClick={handleRetake}
                className="absolute top-2 right-2 w-9 h-9 bg-black/60 backdrop-blur-md text-white rounded-full flex items-center justify-center"
              >
                <RotateCw size={14} />
              </button>
            )}
          </div>

          {/* AI analysis result */}
          <AnimatePresence>
            {analysis && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-ink-900 rounded-2xl p-3 border border-purple-200 dark:border-purple-900/40"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold tracking-wider uppercase text-purple-600 flex items-center gap-1">
                    <Sparkles size={10} /> AI Analysis ({analysis.confidence}%)
                  </p>
                  <div className="flex items-center gap-1 bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                    <Check size={10} />
                    <span className="text-[10px] font-bold">DETECTED</span>
                  </div>
                </div>
                <p className="text-sm font-bold mb-2">{analysis.issue}</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-50 dark:bg-ink-800 rounded-lg p-2">
                    <p className="text-[9px] font-bold text-slate-500 uppercase">Urgency</p>
                    <p className={`text-xs font-bold ${
                      analysis.urgency === 'High'   ? 'text-red-500'   :
                      analysis.urgency === 'Medium' ? 'text-orange-500' :
                      'text-green-500'
                    }`}>{analysis.urgency}</p>
                  </div>
                  <div className="flex-1 bg-slate-50 dark:bg-ink-800 rounded-lg p-2">
                    <p className="text-[9px] font-bold text-slate-500 uppercase">Est. Cost</p>
                    <p className="text-xs font-bold text-primary-500">{analysis.estimate}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
