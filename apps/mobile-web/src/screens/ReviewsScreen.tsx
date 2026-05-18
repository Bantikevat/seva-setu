/**
 * REVIEWS SCREEN — All reviews for a worker
 * URL: /worker/:id/reviews
 *
 * Editorial premium, fed by real API + ReviewsList component.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { worker as workerApi } from '@/services/api';
import { ReviewsList } from '@/components/ui/ReviewsList';

export const ReviewsScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    workerApi.getProfile(id).then((r) => { if (r.data) setWorker(r.data); });
  }, [id]);

  return (
    <div className="w-full h-full bg-cream-50 dark:bg-ink-900 overflow-y-auto pb-10">
      <div className="px-6 pt-12 pb-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-cream-100 dark:bg-ink-800 flex items-center justify-center"
        >
          <ArrowLeft size={18} strokeWidth={2} className="text-ink-700 dark:text-cream-100" />
        </motion.button>
      </div>

      <div className="px-6 pt-6 pb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
          <p className="text-[10px] tracking-[0.3em] uppercase text-ink-400 font-medium mb-3">Reviews</p>
          <h1 className="font-display text-[44px] leading-[1.05] tracking-[-0.03em] text-ink-900 dark:text-cream-50 mb-2 font-medium">
            What customers<br />
            <span className="italic font-normal text-primary-500">said.</span>
          </h1>
          {worker && (
            <p className="text-sm text-ink-400 mt-3">
              For <strong className="text-ink-900 dark:text-cream-100 font-medium">{worker.name}</strong>
            </p>
          )}
        </motion.div>
      </div>

      <div className="px-6">
        {id && <ReviewsList workerId={id} workerName={worker?.name} />}
      </div>
    </div>
  );
};
