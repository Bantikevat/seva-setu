/**
 * WORKER WORK GALLERY — Worker uploads past work photos on their profile
 * Shown on WorkerDetailScreen + editable from WorkerDashboard
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, ZoomIn, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadToCloud } from '@/utils/image-upload';

interface Props {
  workerId: string;
  photos: string[];
  editable?: boolean;
  onUpdate?: (photos: string[]) => void;
}

export const WorkGallery = ({ workerId, photos: initialPhotos, editable = false, onUpdate }: Props) => {
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const handleUpload = async () => {
    if (photos.length >= 12) {
      toast.error('Maximum 12 photos upload kar sakte ho');
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []).slice(0, 12 - photos.length);
      if (!files.length) return;

      setUploading(true);
      try {
        const rawUrls = await Promise.all(files.map((f) => uploadToCloud(f, 'worker-photos')));
        const urls = rawUrls.filter((u): u is string => !!u);
        const updated = [...photos, ...urls];
        setPhotos(updated);

        // Persist to backend
        await fetch(`/api/workers/${workerId}/gallery`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gallery: updated }),
        });

        onUpdate?.(updated);
        toast.success(`${urls.length} photo${urls.length > 1 ? 's' : ''} upload ho gaya!`);
      } catch {
        toast.error('Upload nahi ho saka. Try again karo.');
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  const handleRemove = async (url: string) => {
    const updated = photos.filter((p) => p !== url);
    setPhotos(updated);
    onUpdate?.(updated);
    await fetch(`/api/workers/${workerId}/gallery`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gallery: updated }),
    }).catch(() => {});
  };

  if (!editable && photos.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-ink-400 font-medium">
          Kaam ki Gallery ({photos.length})
        </p>
        {editable && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="flex items-center gap-1 text-xs text-primary-500 font-medium"
          >
            {uploading ? (
              <div className="w-3.5 h-3.5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Plus size={13} strokeWidth={2.5} />
            )}
            Photo Add Karo
          </button>
        )}
      </div>

      {photos.length === 0 ? (
        editable && (
          <button
            onClick={handleUpload}
            className="w-full h-28 rounded-2xl border-2 border-dashed border-ink-200 dark:border-ink-600 flex flex-col items-center justify-center gap-2 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition"
          >
            <Camera size={22} strokeWidth={2} className="text-ink-400" />
            <p className="text-xs text-ink-400">Apne kaam ki photos add karo</p>
          </button>
        )
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((url, i) => (
            <motion.div
              key={url}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.03 * i }}
              className="relative group aspect-square"
            >
              <img
                src={url}
                alt={`Work ${i + 1}`}
                className="w-full h-full object-cover rounded-xl border border-ink-100 dark:border-ink-700 cursor-pointer"
                onClick={() => setLightbox(url)}
              />
              {/* Hover overlay */}
              <div
                onClick={() => setLightbox(url)}
                className="absolute inset-0 rounded-xl bg-ink-900/0 group-hover:bg-ink-900/25 flex items-center justify-center transition cursor-pointer"
              >
                <ZoomIn size={18} className="text-white opacity-0 group-hover:opacity-100 transition" strokeWidth={2} />
              </div>
              {/* Remove button for editable */}
              {editable && (
                <button
                  onClick={() => handleRemove(url)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"
                >
                  <X size={10} className="text-white" strokeWidth={3} />
                </button>
              )}
            </motion.div>
          ))}

          {/* Add more button */}
          {editable && photos.length < 12 && (
            <button
              onClick={handleUpload}
              className="aspect-square rounded-xl border-2 border-dashed border-ink-200 dark:border-ink-600 flex flex-col items-center justify-center gap-1 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition"
            >
              <Plus size={18} strokeWidth={2} className="text-ink-400" />
              <span className="text-[10px] text-ink-400">Add</span>
            </button>
          )}
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
