/**
 * WORKER GALLERY SCREEN — Worker manages their work photo gallery
 * URL: /worker-gallery
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Images } from 'lucide-react';
import { WorkGallery } from '@/components/ui/WorkGallery';
import { workerSelf } from '@/services/api';

export const WorkerGalleryScreen = () => {
  const navigate = useNavigate();
  const [workerId, setWorkerId] = useState('');
  const [gallery, setGallery] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    workerSelf.getMe()
      .then((res) => {
        if (res.data) {
          setWorkerId(res.data.id);
          setGallery((res.data as any).gallery || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full h-full bg-cream-50 dark:bg-ink-900 overflow-y-auto pb-10">
      <div className="px-6 pt-14 pb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-ink-400 mb-6">
          <ArrowLeft size={18} strokeWidth={2} />
          <span className="text-sm">Back</span>
        </button>
        <div className="flex items-center gap-3 mb-2">
          <Images size={26} className="text-primary-500" strokeWidth={2} />
          <h1 className="font-display text-3xl tracking-tight text-ink-900 dark:text-cream-50">My Gallery</h1>
        </div>
        <p className="text-sm text-ink-400">Apne kaam ki photos add karo — customer dekh ke trust karenge</p>
      </div>

      <div className="px-6">
        {loading ? (
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square bg-ink-100 dark:bg-ink-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <WorkGallery
            workerId={workerId}
            photos={gallery}
            editable={true}
            onUpdate={setGallery}
          />
        )}
      </div>

      <div className="mx-6 mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
        <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
          💡 <strong>Tip:</strong> Before & after photos wale workers ko 3x zyada bookings milti hain! Apne best kaam ki photos add karo.
        </p>
      </div>
    </div>
  );
};
