/**
 * RatingForm — Editorial premium rating + photo review
 *
 * Use:
 *   <RatingForm bookingId={id} onSubmitted={() => ...} />
 *
 * Features:
 *   - 5-star tap rating
 *   - Optional comment textarea
 *   - Up to 5 photos (compressed + uploaded to Cloudinary)
 *   - Hindi/English via useT
 */

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Star, Camera, X, ArrowUpRight, Image as ImgIcon } from 'lucide-react';
import { booking } from '@/services/api';
import { uploadToCloud, optimizeCloudinaryUrl } from '@/utils/image-upload';
import { useT } from '@/i18n/useT';

interface Props {
  bookingId: string;
  workerName?: string;
  onSubmitted?: () => void;
}

const MAX_PHOTOS = 5;

export const RatingForm = ({ bookingId, workerName, onSubmitted }: Props) => {
  const t = useT();
  const [rating, setRating] = useState(0);
  const [hover, setHover]   = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos]   = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (photos.length >= MAX_PHOTOS) {
      toast.error(`Max ${MAX_PHOTOS} photos`);
      return;
    }
    const remaining = MAX_PHOTOS - photos.length;
    const toUpload = Array.from(files).slice(0, remaining);

    setUploadingPhotos(true);
    try {
      const urls: string[] = [];
      for (const f of toUpload) {
        if (!f.type.startsWith('image/')) continue;
        const url = await uploadToCloud(f, 'reviews', { maxWidth: 1400, quality: 0.8 });
        if (url) urls.push(url);
      }
      setPhotos((prev) => [...prev, ...urls]);
      if (urls.length) toast.success(`${urls.length} photo uploaded`);
    } catch (err: any) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setUploadingPhotos(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removePhoto = (i: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== i));
  };

  const submit = async () => {
    if (rating < 1) { toast.error('Tap a star to rate'); return; }
    setSubmitting(true);
    try {
      await booking.rate(bookingId, rating, comment.trim() || undefined, photos);
      toast.success('Review submitted. Thank you!');
      onSubmitted?.();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 rounded-3xl p-6">
      <p className="text-[10px] tracking-[0.3em] uppercase text-ink-400 font-medium mb-3">
        Your experience
      </p>
      <h3 className="font-display text-2xl tracking-tight text-ink-900 dark:text-cream-50 mb-1">
        How was {workerName || 'the work'}?
      </h3>
      <p className="text-xs text-ink-400 mb-6">Your honest review helps others choose better.</p>

      {/* Stars */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3, 4, 5].map((s) => {
          const active = (hover || rating) >= s;
          return (
            <motion.button
              key={s}
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.1 }}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(s)}
              className="p-1"
              aria-label={`${s} stars`}
            >
              <Star
                size={32}
                strokeWidth={1.5}
                className={active ? 'fill-primary-500 text-primary-500' : 'text-ink-200 dark:text-ink-600'}
              />
            </motion.button>
          );
        })}
        {rating > 0 && (
          <span className="ml-3 font-medium text-sm text-ink-700 dark:text-cream-100">
            {['Terrible', 'Bad', 'Okay', 'Good', 'Excellent'][rating - 1]}
          </span>
        )}
      </div>

      {/* Comment */}
      <p className="text-[10px] tracking-[0.3em] uppercase text-ink-400 font-medium mb-2">
        Comment <span className="opacity-50">(optional)</span>
      </p>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value.slice(0, 500))}
        rows={3}
        placeholder="Worker kaisa tha? Time pe aaya, kaam saaf kiya?"
        className="w-full bg-cream-50 dark:bg-ink-900 border border-ink-100 dark:border-ink-700 rounded-2xl p-3 text-sm text-ink-900 dark:text-cream-50 outline-none focus:border-primary-300 placeholder:text-ink-400"
      />
      <p className="text-[10px] text-ink-400 mt-1 text-right">{comment.length}/500</p>

      {/* Photos */}
      <div className="mt-4">
        <p className="text-[10px] tracking-[0.3em] uppercase text-ink-400 font-medium mb-3">
          Photos <span className="opacity-50">({photos.length}/{MAX_PHOTOS})</span>
        </p>

        <div className="grid grid-cols-5 gap-2">
          {photos.map((url, i) => (
            <motion.div
              key={url}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative aspect-square rounded-xl overflow-hidden bg-cream-100 dark:bg-ink-700 group"
            >
              <img
                src={optimizeCloudinaryUrl(url, { width: 200, height: 200, crop: 'fill' })}
                className="w-full h-full object-cover"
                alt=""
              />
              <button
                onClick={() => removePhoto(i)}
                className="absolute top-1 right-1 w-5 h-5 bg-ink-900/80 rounded-full flex items-center justify-center"
              >
                <X size={10} className="text-white" />
              </button>
            </motion.div>
          ))}

          {photos.length < MAX_PHOTOS && (
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploadingPhotos}
              className="aspect-square rounded-xl border-2 border-dashed border-ink-200 dark:border-ink-600 flex flex-col items-center justify-center gap-1 hover:border-primary-300 transition disabled:opacity-50"
            >
              {uploadingPhotos ? (
                <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Camera size={16} className="text-ink-400" />
                  <span className="text-[9px] text-ink-400 font-medium">Add</span>
                </>
              )}
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Submit */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={submit}
        disabled={submitting || rating < 1}
        className="w-full mt-6 bg-ink-900 dark:bg-cream-50 text-cream-50 dark:text-ink-900 py-4 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40"
      >
        {submitting ? (
          <div className="w-5 h-5 border-2 border-cream-100/30 border-t-cream-100 rounded-full animate-spin" />
        ) : (
          <>Submit review<ArrowUpRight size={16} strokeWidth={2.5} /></>
        )}
      </motion.button>
    </div>
  );
};
