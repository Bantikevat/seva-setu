/**
 * ReviewsList — Editorial display of worker reviews
 *
 * Features:
 *   - Rating breakdown bars (5★…1★)
 *   - Filter by star count + photo-only toggle
 *   - Lightbox for photo viewing
 *   - Worker reply highlighted
 *   - "Helpful" votes
 */

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Star, Camera, ThumbsUp, X, BadgeCheck, Reply } from 'lucide-react';
import { reviews as reviewsApi, type Review, type ReviewSummary } from '@/services/api';
import { optimizeCloudinaryUrl } from '@/utils/image-upload';

interface Props {
  workerId: string;
  workerName?: string;
}

export const ReviewsList = ({ workerId, workerName }: Props) => {
  const [data, setData] = useState<{ reviews: Review[]; summary: ReviewSummary } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [withPhotos, setWithPhotos] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [helpfulIds, setHelpfulIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLoading(true);
    reviewsApi
      .forWorker(workerId, { rating: filterRating || undefined, withPhotos, limit: 30 })
      .then((r) => r.data && setData(r.data))
      .catch(() => toast.error('Reviews load nahi ho sake'))
      .finally(() => setLoading(false));
  }, [workerId, filterRating, withPhotos]);

  const handleHelpful = async (id: string) => {
    if (helpfulIds.has(id)) return;
    setHelpfulIds((prev) => new Set(prev).add(id));
    try {
      await reviewsApi.markHelpful(id);
    } catch {
      setHelpfulIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  const summary = data?.summary;
  const list    = data?.reviews || [];

  return (
    <div>
      {/* SUMMARY */}
      {summary && summary.total > 0 && (
        <div className="bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 rounded-3xl p-6 mb-4">
          <div className="flex items-center gap-6 mb-5">
            <div className="text-center">
              <p className="font-display text-5xl tracking-tight text-ink-900 dark:text-cream-50 leading-none">
                {summary.average.toFixed(1)}
              </p>
              <div className="flex items-center gap-0.5 justify-center mt-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={11}
                    className={s <= Math.round(summary.average) ? 'fill-primary-500 text-primary-500' : 'text-ink-200'}
                  />
                ))}
              </div>
              <p className="text-[10px] text-ink-400 mt-2 uppercase tracking-wider">
                {summary.total} review{summary.total !== 1 && 's'}
              </p>
            </div>

            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map((s) => {
                const count = summary.counts?.[s] || 0;
                const pct = summary.total ? (count / summary.total) * 100 : 0;
                return (
                  <button
                    key={s}
                    onClick={() => setFilterRating(filterRating === s ? null : s)}
                    className="w-full flex items-center gap-2 group"
                  >
                    <span className={`text-[10px] font-mono tabular-nums w-3 ${filterRating === s ? 'text-primary-500 font-bold' : 'text-ink-400'}`}>{s}</span>
                    <Star size={9} className={filterRating === s ? 'fill-primary-500 text-primary-500' : 'fill-ink-300 text-ink-300'} />
                    <div className="flex-1 h-1.5 bg-ink-100 dark:bg-ink-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="h-full bg-primary-500"
                      />
                    </div>
                    <span className="text-[10px] text-ink-400 w-5 text-right">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex items-center gap-2 pt-3 border-t border-ink-100 dark:border-ink-700">
            <button
              onClick={() => setWithPhotos(!withPhotos)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                withPhotos
                  ? 'bg-ink-900 text-cream-50 dark:bg-cream-50 dark:text-ink-900'
                  : 'bg-cream-100 dark:bg-ink-700 text-ink-700 dark:text-cream-100'
              }`}
            >
              <Camera size={11} />
              With photos
            </button>

            {filterRating && (
              <button
                onClick={() => setFilterRating(null)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-primary-50 text-primary-600"
              >
                {filterRating}★ only
                <X size={11} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* LIST */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-cream-100 dark:bg-ink-800 h-32 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-ink-200 dark:border-ink-700 rounded-2xl">
          <Star size={20} strokeWidth={1.5} className="text-ink-300 mx-auto mb-3" />
          <p className="font-display text-xl text-ink-900 dark:text-cream-50 mb-1">
            {summary?.total === 0 ? 'No reviews yet' : 'No matches'}
          </p>
          <p className="text-xs text-ink-400">
            {summary?.total === 0 ? 'Be the first to review.' : 'Try removing filters'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((r, i) => (
            <motion.article
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 rounded-3xl p-5"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  {r.customerPhoto ? (
                    <img src={optimizeCloudinaryUrl(r.customerPhoto, { width: 80, height: 80, crop: 'fill' })}
                         className="w-10 h-10 rounded-full object-cover flex-shrink-0" alt="" />
                  ) : (
                    <div className="w-10 h-10 bg-cream-100 dark:bg-ink-700 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-sm text-ink-700 dark:text-cream-100">
                        {(r.customerName || 'C').charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-ink-900 dark:text-cream-50 truncate">
                      {r.customerName || 'Customer'}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={10} className={s <= r.rating ? 'fill-primary-500 text-primary-500' : 'text-ink-200'} />
                        ))}
                      </div>
                      {r.isVerified && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 font-medium">
                          <BadgeCheck size={10} className="fill-emerald-500 text-white" /> Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-ink-400 flex-shrink-0">
                  {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>

              {/* Comment */}
              {r.comment && (
                <p className="text-sm text-ink-700 dark:text-cream-100 leading-relaxed mb-3">{r.comment}</p>
              )}

              {/* Photos */}
              {r.photoUrls.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {r.photoUrls.slice(0, 5).map((url, j) => (
                    <button
                      key={j}
                      onClick={() => setLightbox(url)}
                      className="aspect-square rounded-xl overflow-hidden bg-cream-100"
                    >
                      <img
                        src={optimizeCloudinaryUrl(url, { width: 200, height: 200, crop: 'fill' })}
                        className="w-full h-full object-cover hover:scale-105 transition"
                        alt=""
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Worker reply */}
              {r.workerReply && (
                <div className="mt-3 ml-6 bg-cream-50 dark:bg-ink-900 border-l-2 border-primary-500 rounded-r-xl p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Reply size={11} className="text-primary-500" />
                    <p className="text-[10px] tracking-[0.2em] uppercase text-primary-500 font-medium">
                      {workerName || 'Worker'} replied
                    </p>
                    {r.workerReplyAt && (
                      <p className="text-[10px] text-ink-400 ml-auto">
                        {new Date(r.workerReplyAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-ink-700 dark:text-cream-100 leading-relaxed">{r.workerReply}</p>
                </div>
              )}

              {/* Footer — helpful */}
              <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-ink-100 dark:border-ink-700">
                <button
                  onClick={() => handleHelpful(r.id)}
                  disabled={helpfulIds.has(r.id)}
                  className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full transition ${
                    helpfulIds.has(r.id)
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-ink-500 hover:bg-cream-50 dark:hover:bg-ink-700'
                  }`}
                >
                  <ThumbsUp size={11} className={helpfulIds.has(r.id) ? 'fill-primary-500 text-primary-500' : ''} />
                  Helpful{helpfulIds.has(r.id) || r.helpfulCount > 0 ? ` · ${r.helpfulCount + (helpfulIds.has(r.id) ? 1 : 0)}` : ''}
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      )}

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
            <img
              src={optimizeCloudinaryUrl(lightbox, { width: 1400 })}
              className="max-w-full max-h-full object-contain rounded-2xl"
              alt=""
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
