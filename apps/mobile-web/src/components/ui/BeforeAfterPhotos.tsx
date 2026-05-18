/**
 * BEFORE/AFTER PHOTOS — Worker uploads proof photos for completed bookings
 * Used by workers inside their dashboard's job detail view
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CheckCircle, X, ZoomIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadToCloud } from '@/utils/image-upload';

interface Photo {
  url: string;
  type: 'before' | 'after';
}

interface Props {
  bookingId: string;
  existingPhotos?: Photo[];
  workerMode?: boolean; // If false, customer read-only view
}

export const BeforeAfterPhotos = ({ bookingId, existingPhotos = [], workerMode = false }: Props) => {
  const [photos, setPhotos] = useState<Photo[]>(existingPhotos);
  const [uploading, setUploading] = useState<'before' | 'after' | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const handleUpload = async (type: 'before' | 'after') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Prefer rear camera on mobile
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setUploading(type);
      try {
        const url = await uploadToCloud(file, 'worker-photos');
        if (!url) { setUploading(null); return; }
        const newPhoto: Photo = { url, type };
        const updated = [...photos.filter((p) => p.type !== type), newPhoto];
        setPhotos(updated);

        // Persist to backend (fire-and-forget)
        fetch(`/api/bookings/${bookingId}/photos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photos: updated }),
        }).catch(() => {});

        toast.success(`${type === 'before' ? 'Before' : 'After'} photo upload ho gaya!`);
      } catch (err) {
        toast.error('Photo upload nahi ho saka');
      } finally {
        setUploading(null);
      }
    };
    input.click();
  };

  const beforePhoto = photos.find((p) => p.type === 'before');
  const afterPhoto = photos.find((p) => p.type === 'after');

  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-ink-400 font-medium mb-3">
        Before / After Photos
      </p>

      <div className="grid grid-cols-2 gap-3">
        {(['before', 'after'] as const).map((type) => {
          const photo = type === 'before' ? beforePhoto : afterPhoto;
          const isUploading = uploading === type;

          return (
            <div key={type}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-500 dark:text-cream-100/50 mb-1.5">
                {type === 'before' ? '📷 Before' : '✅ After'}
              </p>

              {photo ? (
                <div className="relative group">
                  <img
                    src={photo.url}
                    alt={type}
                    className="w-full h-32 object-cover rounded-2xl border-2 border-ink-100 dark:border-ink-700"
                  />
                  <button
                    onClick={() => setLightbox(photo.url)}
                    className="absolute inset-0 flex items-center justify-center bg-ink-900/0 group-hover:bg-ink-900/30 rounded-2xl transition"
                  >
                    <ZoomIn size={20} className="text-white opacity-0 group-hover:opacity-100 transition" strokeWidth={2} />
                  </button>
                  {workerMode && (
                    <button
                      onClick={() => handleUpload(type)}
                      className="absolute bottom-2 right-2 bg-white dark:bg-ink-700 rounded-full p-1.5 shadow"
                    >
                      <Camera size={12} strokeWidth={2.5} className="text-ink-600 dark:text-cream-100" />
                    </button>
                  )}
                </div>
              ) : workerMode ? (
                <button
                  onClick={() => handleUpload(type)}
                  disabled={isUploading}
                  className="w-full h-32 rounded-2xl border-2 border-dashed border-ink-200 dark:border-ink-600 flex flex-col items-center justify-center gap-2 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition"
                >
                  {isUploading ? (
                    <div className="w-5 h-5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Camera size={20} strokeWidth={2} className="text-ink-400" />
                      <span className="text-[11px] text-ink-400">Photo lo</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="w-full h-32 rounded-2xl bg-ink-50 dark:bg-ink-800 border border-ink-100 dark:border-ink-700 flex items-center justify-center">
                  <p className="text-[11px] text-ink-300">Koi photo nahi</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {beforePhoto && afterPhoto && (
        <div className="mt-3 flex items-center gap-1.5 text-green-600 dark:text-green-400">
          <CheckCircle size={14} strokeWidth={2.5} />
          <span className="text-xs font-medium">Before & after proof saved!</span>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink-900/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button className="absolute top-6 right-6 text-white" onClick={() => setLightbox(null)}>
              <X size={24} strokeWidth={2} />
            </button>
            <img src={lightbox} alt="" className="max-w-full max-h-[85vh] rounded-2xl object-contain" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
