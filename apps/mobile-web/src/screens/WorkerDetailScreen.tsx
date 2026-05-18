/**
 * WORKER DETAIL — Editorial premium luxury
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Star, BadgeCheck, Calendar, MapPin, ArrowUpRight,
  Award, Heart, Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { successBurst } from '@/utils/confetti';
import { ProblemCapture } from '@/components/ui/ProblemCapture';
import { VoiceNote } from '@/components/ui/VoiceNote';
import { worker as workerApi, user as userApi, booking as bookingApi, getErrorMessage } from '@/services/api';
import { whatsAppShareBooking } from '@/utils/free-features';
import { useFavoritesStore } from '@/store/favorites.store';
import { WorkGallery } from '@/components/ui/WorkGallery';
import { PromoCodeInput } from '@/components/ui/PromoCodeInput';
import { SlotPicker } from '@/components/ui/SlotPicker';
import { PriceEstimator } from '@/components/ui/PriceEstimator';
import { pushNotification } from '@/screens/NotificationsScreen';
import type { WorkerProfile, Address } from '@/types';
import { useRecentlyViewed } from '@/store/recently-viewed.store';

export const WorkerDetailScreen = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const category = params.get('category') || '';
  const emoji = params.get('emoji') || '🔧';
  const navigate = useNavigate();

  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { isFav, toggle: toggleFav } = useFavoritesStore();

  const [bookOpen, setBookOpen] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddrId, setSelectedAddrId] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [booking, setBooking] = useState(false);
  const [problemPhoto, setProblemPhoto] = useState<string | null>(null);
  const [voiceNote, setVoiceNote] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoCode, setPromoCode] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await workerApi.getProfile(id!);
        if (res.data) {
          setProfile(res.data);
          // Track view for Recently Viewed
          useRecentlyViewed.getState().add({
            id:    res.data.id,
            name:  res.data.name,
            skill: res.data.skills?.[0]?.categoryName,
            photo: res.data.profilePhoto,
            rating: res.data.ratingAverage,
          });
        }
      } catch { toast.error('Worker not found'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const openBookSheet = async () => {
    try {
      const res = await userApi.getAddresses();
      if (res.data) {
        setAddresses(res.data.addresses);
        const def = res.data.addresses.find((a) => a.isDefault) || res.data.addresses[0];
        if (def) setSelectedAddrId(def.id);
      }
      const t = new Date(Date.now() + 2 * 3600 * 1000);
      t.setMinutes(0); t.setSeconds(0); t.setMilliseconds(0);
      setSelectedTime(t.toISOString().slice(0, 16));
      setBookOpen(true);
    } catch { toast.error('Addresses load failed'); }
  };

  const handleBook = async () => {
    if (!profile) return;
    if (!selectedAddrId) { toast.error('Select address'); return; }
    if (!selectedTime) { toast.error('Select time'); return; }

    const primarySkill = profile.skills.find((s) => s.isPrimary) || profile.skills[0];
    if (!primarySkill) { toast.error('No skill found'); return; }

    setBooking(true);
    try {
      const result = await bookingApi.create({
        workerId:    profile.id,
        categoryId:  primarySkill.categoryId,
        addressId:   selectedAddrId,
        scheduledAt: new Date(selectedTime).toISOString(),
        notes:       notes || undefined,
      });
      successBurst();
      toast.success('Booking confirmed! 🎉');
      setBookOpen(false);
      const b = result?.data;
      if (b) {
        pushNotification({
          type: 'booking',
          title: `✅ Booking Confirmed — #${b.bookingNumber}`,
          body: `${b.categoryName} — ${profile.name} aayenge aapke ghar`,
          url: `/booking/${b.id}`,
        });
        const waMsg = `🙏 Namaste! Mera naam [Aapka naam] hai.\n\nMaine Seva Setu pe booking ki hai:\n📋 *#${b.bookingNumber}*\n🔧 ${b.categoryName}\n📅 ${new Date(b.scheduledAt).toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}\n\nKripya confirm karein. Dhanyawad! 🙏`;
        const encodedMsg = encodeURIComponent(waMsg);
        const workerPhone = profile.phone?.replace(/\D/g, '');
        if (workerPhone) {
          toast('💬 Worker ko WhatsApp message bhejna chahte ho?', {
            duration: 6000,
            icon: '📲',
          });
          setTimeout(() => {
            window.open(`https://wa.me/91${workerPhone}?text=${encodedMsg}`, '_blank');
          }, 1200);
        }
      }

      setTimeout(() => navigate(`/bookings`), 2000);
    } catch (err: any) { toast.error(getErrorMessage(err)); }
    finally { setBooking(false); }
  };

  if (loading) {
    return (
      <div className="w-full h-full bg-cream-50 dark:bg-ink-900 p-6 pt-14 space-y-4">
        <div className="skeleton h-12 w-12 rounded-full" />
        <div className="skeleton h-40 rounded-3xl" />
        <div className="skeleton h-24 rounded-2xl" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="w-full h-full bg-cream-50 dark:bg-ink-900 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="font-display text-2xl text-ink-900 dark:text-cream-50 mb-3">Worker not found</p>
          <Button onClick={() => navigate(-1)} variant="outline">Go back</Button>
        </div>
      </div>
    );
  }

  const primarySkill = profile.skills.find((s) => s.isPrimary) || profile.skills[0];
  const price = 299;

  return (
    <div className="w-full h-full bg-cream-50 dark:bg-ink-900 overflow-y-auto pb-32">
      {/* MINIMAL HEADER */}
      <div className="px-6 pt-12 pb-3">
        <div className="flex items-center justify-between">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-cream-100 dark:bg-ink-800 flex items-center justify-center">
            <ArrowLeft size={18} strokeWidth={2} className="text-ink-700 dark:text-cream-100" />
          </motion.button>

          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (id) {
                  toggleFav(id);
                  toast(isFav(id) ? 'Favorites se hataya' : '❤️ Favorites mein add kiya!', { duration: 1500 });
                }
              }}
              className="w-10 h-10 rounded-full bg-cream-100 dark:bg-ink-800 flex items-center justify-center"
            >
              <Heart size={18} className={id && isFav(id) ? 'fill-primary-500 text-primary-500' : 'text-ink-700 dark:text-cream-100'} />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} className="w-10 h-10 rounded-full bg-cream-100 dark:bg-ink-800 flex items-center justify-center">
              <Share2 size={16} strokeWidth={2} className="text-ink-700 dark:text-cream-100" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* HERO */}
      <div className="px-6 pt-6 pb-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
          <div className="w-28 h-28 bg-gradient-warm dark:bg-ink-700 rounded-3xl flex items-center justify-center mb-6 relative">
            <span className="text-6xl">{emoji}</span>
            {profile.isVerified && (
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-cream-50 dark:bg-ink-900 rounded-full flex items-center justify-center">
                <BadgeCheck size={20} className="fill-green-500 text-white" />
              </div>
            )}
          </div>

          <p className="text-[10px] tracking-[0.3em] uppercase text-primary-500 font-medium mb-2">
            {profile.skills?.[0]?.categoryName || category} · {primarySkill?.experienceYears}+ years
          </p>

          <h1 className="font-display text-[40px] leading-[1.05] tracking-[-0.03em] text-ink-900 dark:text-cream-50 font-medium mb-3">
            {profile.name}
          </h1>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Star size={14} className="fill-primary-500 text-primary-500" />
              <span className="font-medium text-ink-900 dark:text-cream-50">{profile.ratingAverage}</span>
              <span className="text-ink-400">({profile.totalJobs} reviews)</span>
            </div>

            {profile.isAvailable && (
              <span className="flex items-center gap-1 text-emerald-600">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium">Available now</span>
              </span>
            )}
          </div>
        </motion.div>
      </div>

      {/* STATS */}
      <div className="px-6 mb-12">
        <p className="text-[10px] tracking-[0.3em] uppercase text-ink-400 font-medium mb-6">01 — Profile</p>

        <div className="grid grid-cols-3 gap-px bg-ink-100 dark:bg-ink-700 rounded-2xl overflow-hidden">
          {[
            { value: primarySkill?.experienceYears || 0, label: 'Years', suffix: '+' },
            { value: profile.totalJobs,                  label: 'Jobs',  suffix: '' },
            { value: profile.ratingAverage,              label: 'Rating', suffix: '' },
          ].map((s) => (
            <div key={s.label} className="bg-cream-50 dark:bg-ink-900 p-5 text-center">
              <p className="font-display text-2xl tracking-tight text-ink-900 dark:text-cream-50 font-medium">
                {s.value}{s.suffix}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-ink-400 font-medium mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ABOUT */}
      {profile.bio && (
        <div className="px-6 mb-12">
          <p className="text-[10px] tracking-[0.3em] uppercase text-ink-400 font-medium mb-6">02 — About</p>
          <p className="font-display text-xl tracking-tight text-ink-700 dark:text-cream-100/80 leading-relaxed italic">
            "{profile.bio}"
          </p>
        </div>
      )}

      {/* SKILLS */}
      <div className="px-6 mb-12">
        <p className="text-[10px] tracking-[0.3em] uppercase text-ink-400 font-medium mb-6">03 — Expertise</p>

        <div className="space-y-px">
          {profile.skills.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
              className="py-5 border-t border-ink-100 dark:border-ink-700 flex items-baseline justify-between last:border-b"
            >
              <div className="flex items-baseline gap-4">
                <p className="font-mono text-xs text-ink-300 tabular-nums">{String(i + 1).padStart(2, '0')}</p>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-display text-xl tracking-tight text-ink-900 dark:text-cream-50">{s.categoryName}</p>
                    {s.isPrimary && <span className="text-[9px] tracking-widest uppercase text-primary-500 font-medium">Primary</span>}
                  </div>
                  <p className="text-xs text-ink-400 mt-0.5">{s.experienceYears} years experience</p>
                </div>
              </div>
              <Award size={14} strokeWidth={1.5} className="text-ink-300" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* WORK GALLERY */}
      {(profile as any).gallery?.length > 0 && (
        <div className="px-6 mb-12">
          <p className="text-[10px] tracking-[0.3em] uppercase text-ink-400 font-medium mb-6">04 — Work Gallery</p>
          <WorkGallery workerId={id!} photos={(profile as any).gallery || []} editable={false} />
        </div>
      )}

      {/* REVIEWS LINK */}
      <div className="px-6 mb-12">
        <motion.button
          onClick={() => navigate(`/worker/${id}/reviews`)}
          whileHover={{ y: -2 }}
          className="w-full text-left py-5 border-t border-b border-ink-100 dark:border-ink-700 flex items-center justify-between group"
        >
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-ink-400 font-medium mb-1">05 — Reviews</p>
            <p className="font-display text-xl tracking-tight text-ink-900 dark:text-cream-50">
              {profile.reviewsCount || profile.totalJobs} customer reviews
            </p>
          </div>
          <ArrowUpRight size={14} strokeWidth={2} className="text-ink-300 group-hover:text-primary-500 transition" />
        </motion.button>
      </div>

      <div className="h-24" />

      {/* FLOATING BOOK CTA */}
      <div className="absolute bottom-0 inset-x-0 z-40">
        <div className="absolute inset-0 bg-cream-50/95 dark:bg-ink-900/95 backdrop-blur-xl border-t border-ink-100 dark:border-ink-700" />

        <div className="relative px-6 py-5 flex items-center gap-4">
          <div className="flex-1">
            <p className="text-[10px] tracking-[0.3em] uppercase text-ink-400 font-medium">Service starts at</p>
            <p className="font-display text-2xl tracking-tight text-primary-500 font-medium">₹{price}</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={openBookSheet}
            disabled={!profile.isAvailable}
            className="inline-flex items-center gap-2 bg-ink-900 dark:bg-cream-50 text-cream-50 dark:text-ink-900 px-6 py-3.5 rounded-full text-sm font-medium disabled:opacity-50"
          >
            <Calendar size={14} strokeWidth={2.5} />
            Book Now
          </motion.button>
        </div>
      </div>

      {/* BOOK MODAL */}
      <BottomSheet isOpen={bookOpen} onClose={() => setBookOpen(false)} title="Book this service">
        <div className="space-y-5">
          <ProblemCapture onPhotoCapture={(b64) => setProblemPhoto(b64)} category={category} />
          <VoiceNote onRecord={setVoiceNote} />

          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-400 mb-2">Address</label>
            {addresses.length === 0 ? (
              <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm p-3 rounded-xl">
                Add an address first.{' '}
                <button onClick={() => navigate('/profile')} className="font-bold underline">Profile</button>
              </div>
            ) : (
              <div className="space-y-2">
                {addresses.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelectedAddrId(a.id)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition ${
                      selectedAddrId === a.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20' : 'border-ink-200 dark:border-ink-700 bg-cream-50 dark:bg-ink-800'
                    }`}
                  >
                    <p className="font-medium text-sm flex items-center gap-2">
                      <MapPin size={12} /> {a.label}
                    </p>
                    <p className="text-xs text-ink-400 mt-0.5 ml-5">{a.fullAddress}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-400 mb-2">Kab?</label>
            <SlotPicker value={selectedTime} onChange={setSelectedTime} />
          </div>

          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-ink-400 mb-2">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions?"
              rows={2}
              className="w-full p-3 border-2 border-ink-200 dark:border-ink-700 rounded-xl bg-cream-50 dark:bg-ink-800 outline-none text-sm focus:border-primary-500"
            />
          </div>

          <PriceEstimator category={category || primarySkill?.categoryName || ''} />

          <PromoCodeInput
            basePrice={price}
            onDiscount={(disc, code) => { setPromoDiscount(disc); setPromoCode(code); }}
          />

          <div className="bg-cream-100 dark:bg-ink-800 rounded-xl p-4 text-sm space-y-1.5">
            <div className="flex justify-between">
              <span className="text-ink-400">Service fee</span>
              <span className="font-medium">₹{price}</span>
            </div>
            {promoDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Promo ({promoCode})</span>
                <span className="font-medium">−₹{promoDiscount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-ink-400">Platform fee</span>
              <span className="font-medium">₹{Math.round((price - promoDiscount) * 0.1)}</span>
            </div>
            <div className="border-t border-ink-200 dark:border-ink-700 my-2" />
            <div className="flex justify-between font-display text-base">
              <span>Total</span>
              <span className="text-primary-500">₹{(price - promoDiscount) + Math.round((price - promoDiscount) * 0.1)}</span>
            </div>
          </div>

          <Button onClick={handleBook} loading={booking} disabled={addresses.length === 0} fullWidth size="lg" rightIcon={<ArrowUpRight size={16} />}>
            Confirm booking
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
};
