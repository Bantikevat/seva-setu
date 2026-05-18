/**
 * BOOKING DETAIL SCREEN
 * URL: /booking/:id
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, MapPin, Calendar, Star, X, Navigation, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { RatingForm } from '@/components/ui/RatingForm';
import { booking as bookingApi, payment as paymentApi, getErrorMessage } from '@/services/api';
import { payViaUpi, whatsAppShareBooking, shareNative, getQrCodeUrl, copyToClipboard } from '@/utils/free-features';
import { downloadCalendarEvent } from '@/utils/extra-free';
import { printReceipt } from '@/utils/receipt';
import { notify, requestPermission } from '@/utils/notifications';
import { successBurst, fireworks } from '@/utils/confetti';
import { useShakeDetection } from '@/utils/gestures';
import { useAuthStore } from '@/store/auth.store';
import { ComplaintForm } from '@/components/ui/ComplaintForm';
import { BeforeAfterPhotos } from '@/components/ui/BeforeAfterPhotos';
import { scheduleReminder, hasReminder } from '@/utils/booking-reminder';
import { trackCompletedBooking } from '@/utils/app-rating';
import { pushNotification } from '@/screens/NotificationsScreen';
import { LiveETACountdown } from '@/components/ui/LiveETACountdown';
import { TipWorker } from '@/components/ui/TipWorker';
import { googleCalendarUrl, downloadIcs } from '@/utils/add-to-calendar';
import { generatePdfReceipt } from '@/utils/pdf-receipt';
import { useGamification } from '@/store/gamification.store';
import { CalendarPlus } from 'lucide-react';
import type { Booking, BookingStatus } from '@/types';

const statusColors: Record<BookingStatus, string> = {
  pending:     'from-yellow-400 to-orange-500',
  confirmed:   'from-blue-400 to-indigo-500',
  on_the_way:  'from-purple-400 to-pink-500',
  in_progress: 'from-orange-400 to-red-500',
  completed:   'from-green-400 to-emerald-500',
  cancelled:   'from-red-400 to-red-600',
  rejected:    'from-red-400 to-red-600',
};

const STATUS_STEPS = [
  { key: 'pending',     label: 'Booked' },
  { key: 'confirmed',   label: 'Confirmed' },
  { key: 'on_the_way',  label: 'On The Way' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed',   label: 'Completed' },
];

export const BookingDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bookingData, setBookingData] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  // Cancel
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Rate
  const [rateOpen, setRateOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [rating_, setRating_] = useState(false);

  // Payment
  const [paying, setPaying] = useState(false);

  // 10x SHAKE-TO-CANCEL (mobile only — gracefully degrades on desktop)
  useShakeDetection(() => {
    if (bookingData && ['pending', 'confirmed'].includes(bookingData.status) && !cancelOpen) {
      toast('📳 Shake detected — Cancel this booking?', { icon: '⚠️', duration: 3000 });
      setCancelOpen(true);
    }
  }, 25);

  const load = async () => {
    setLoading(true);
    try {
      const res = await bookingApi.getById(id!);
      if (res.data) {
        setBookingData(res.data);
        // Track completed bookings for app rating prompt + gamification
        if (res.data.status === 'completed') {
          const key = `seva_rated_${id}`;
          if (!localStorage.getItem(key)) {
            localStorage.setItem(key, '1');
            trackCompletedBooking();
            useGamification.getState().recordBooking(res.data.totalAmount || 0);
          }
        }
      }
    } catch (err) {
      toast.error('Booking nahi mili');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await bookingApi.cancel(id!, cancelReason);
      toast.success('Booking cancel ho gayi');
      setCancelOpen(false);
      await load();
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  const handlePay = async () => {
    if (!bookingData) return;
    setPaying(true);
    try {
      // 1. Create Razorpay order
      const orderRes = await paymentApi.createOrder(bookingData.id);
      if (!orderRes.data?.razorpayOrder) {
        toast.error('Order create nahi ho saka');
        return;
      }

      const { razorpayOrder } = orderRes.data;

      // 2. In DEV mode — auto verify (simulates Razorpay popup success)
      toast.loading('Processing payment...', { id: 'pay' });
      await new Promise((r) => setTimeout(r, 1500));

      const verifyRes = await paymentApi.verify({
        razorpay_order_id:   razorpayOrder.id,
        razorpay_payment_id: `pay_dev_${Date.now()}`,
        razorpay_signature:  'dev_signature',
        method:              'upi',
      });

      toast.dismiss('pay');
      if (verifyRes.success) {
        successBurst();  // 🎉 CONFETTI!
        toast.success('✅ Payment successful! 🎉');
        await load();
      } else {
        toast.error(verifyRes.message);
      }
    } catch (err: any) {
      toast.dismiss('pay');
      toast.error(getErrorMessage(err));
    } finally {
      setPaying(false);
    }
  };

  const handleRate = async () => {
    setRating_(true);
    try {
      await bookingApi.rate(id!, rating, review);
      if (rating === 5) fireworks();  // 🎆 5-star fireworks!
      else successBurst();
      pushNotification({
        type: 'review',
        title: `⭐ Review diya — ${rating}/5 stars`,
        body: `Aapne ${bookingData?.workerName} ko rate kiya. Shukriya!`,
        url: `/booking/${id}`,
      });
      toast.success('Review save ho gaya. Thank you!');
      setRateOpen(false);
      await load();
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setRating_(false);
    }
  };

  if (loading || !bookingData) {
    return (
      <div className="w-full h-full bg-slate-50 dark:bg-zinc-950 p-4 pt-14">
        <div className="skeleton h-48 mb-4" />
        <div className="skeleton h-32" />
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === bookingData.status);
  const isActive = ['pending', 'confirmed', 'on_the_way', 'in_progress'].includes(bookingData.status);
  const canCancel = ['pending', 'confirmed'].includes(bookingData.status);
  const canRate = bookingData.status === 'completed' && !bookingData.rating;

  return (
    <div className="w-full h-full bg-ink-50 dark:bg-ink-950 overflow-y-auto pb-10">
      {/* 3D TICKET HEADER */}
      <div className="relative pb-6">
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${statusColors[bookingData.status]}`} />

        {/* Decorative orbs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="absolute top-12 left-4 w-11 h-11 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl flex items-center justify-center text-white z-10"
        >
          <ArrowLeft size={20} />
        </motion.button>

        {/* Chat button — only when booking is active */}
        {isActive && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(`/chat/${id}`)}
            className="absolute top-12 right-4 w-11 h-11 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl flex items-center justify-center text-white z-10"
            aria-label="Chat"
          >
            <MessageCircle size={20} />
          </motion.button>
        )}

        {/* 3D TICKET CARD */}
        <div className="relative pt-16 px-4">
          <motion.div
            initial={{ y: 40, opacity: 0, rotateX: -10 }}
            animate={{ y: 0, opacity: 1, rotateX: 0 }}
            transition={{ type: 'spring', damping: 18 }}
            style={{ transformStyle: 'preserve-3d' }}
            className="relative"
          >
            {/* Main ticket */}
            <div className="bg-white dark:bg-ink-900 rounded-3xl shadow-2xl overflow-hidden">
              {/* Top stub */}
              <div className={`bg-gradient-to-br ${statusColors[bookingData.status]} p-5 text-white relative overflow-hidden`}>
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />

                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-[10px] font-bold tracking-widest uppercase opacity-80">
                      Service Booking
                    </div>
                    <div className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                      {bookingData.status.replace(/_/g, ' ')}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <motion.div
                      animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-6xl drop-shadow-lg"
                    >
                      {bookingData.categoryEmoji}
                    </motion.div>
                    <div>
                      <p className="text-2xl font-extrabold tracking-tight">{bookingData.categoryName}</p>
                      <p className="text-[10px] font-mono opacity-80 mt-0.5">{bookingData.bookingNumber}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Perforation line (ticket tear) */}
              <div className="relative h-6 bg-white dark:bg-ink-900">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 bg-ink-50 dark:bg-ink-950 rounded-full -translate-x-1/2" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 bg-ink-50 dark:bg-ink-950 rounded-full translate-x-1/2" />
                <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-slate-200 dark:border-ink-700" />
              </div>

              {/* Bottom — Amount + Booking summary */}
              <div className="p-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-1">Amount</p>
                    <p className="text-2xl font-extrabold text-primary-500">₹{bookingData.totalAmount}</p>
                    {bookingData.paymentStatus === 'paid' && (
                      <span className="inline-flex items-center gap-1 mt-1 bg-green-50 dark:bg-green-900/20 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        ✓ PAID
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-1">Worker</p>
                    <p className="text-sm font-extrabold">{bookingData.workerName}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{bookingData.workerPhone}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

      </div>

      {/* Progress tracker */}
      {isActive && currentStepIndex >= 0 && (
        <div className="px-4 -mt-4 relative z-10">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-premium"
          >
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Status Tracker
            </p>
            <div className="relative flex justify-between">
              <div className="absolute top-3 left-3 right-3 h-1 bg-slate-200 dark:bg-zinc-700 rounded-full" />
              <div
                className="absolute top-3 left-3 h-1 bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-500"
                style={{ width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 95}%` }}
              />
              {STATUS_STEPS.map((step, i) => (
                <div key={step.key} className="flex flex-col items-center z-10">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                      i <= currentStepIndex
                        ? 'bg-primary-500 text-white'
                        : 'bg-slate-200 dark:bg-zinc-700 text-slate-400'
                    }`}
                  >
                    {i <= currentStepIndex ? '✓' : i + 1}
                  </div>
                  <span className={`text-[9px] mt-1 font-semibold text-center max-w-[55px] ${
                    i === currentStepIndex ? 'text-primary-500' : 'text-slate-500'
                  }`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Cancelled banner */}
      {bookingData.status === 'cancelled' && (
        <div className="mx-4 mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-2xl p-4">
          <p className="font-bold text-red-700 dark:text-red-400 text-sm mb-1">❌ Booking Cancelled</p>
          <p className="text-xs text-red-600 dark:text-red-300">
            By {bookingData.cancelledBy} • {bookingData.cancellationReason}
          </p>
        </div>
      )}

      {/* Worker card */}
      <div className="px-4 pt-5">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Worker</h3>
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-300 to-red-300 rounded-2xl flex items-center justify-center text-2xl">
            👤
          </div>
          <div className="flex-1">
            <p className="font-bold text-slate-900 dark:text-slate-100">{bookingData.workerName}</p>
            <p className="text-xs text-slate-500">{bookingData.categoryName}</p>
          </div>
          <a
            href={`tel:${bookingData.workerPhone}`}
            className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center"
          >
            <Phone size={18} />
          </a>
        </div>
      </div>

      {/* Schedule + Address */}
      <div className="px-4 pt-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-primary-50 dark:bg-primary-500/20 text-primary-500 rounded-xl flex items-center justify-center">
              <Calendar size={16} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500 mb-0.5">Scheduled</p>
              <p className="text-sm font-semibold">
                {new Date(bookingData.scheduledAt).toLocaleString('en-IN', {
                  weekday: 'short', day: 'numeric', month: 'short',
                  hour: '2-digit', minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-zinc-800"></div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-primary-50 dark:bg-primary-500/20 text-primary-500 rounded-xl flex items-center justify-center">
              <MapPin size={16} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500 mb-0.5">Address</p>
              <p className="text-sm font-semibold">{bookingData.fullAddress}</p>
            </div>
          </div>

          {bookingData.notes && (
            <>
              <div className="border-t border-slate-100 dark:border-zinc-800"></div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Notes</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">"{bookingData.notes}"</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="px-4 pt-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Payment</h3>
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Service charge</span>
            <span className="font-semibold">₹{bookingData.basePrice}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Platform fee</span>
            <span className="font-semibold">₹{bookingData.platformFee}</span>
          </div>
          <div className="border-t border-slate-100 dark:border-zinc-800 my-2"></div>
          <div className="flex justify-between text-base">
            <span className="font-bold">Total</span>
            <span className="font-extrabold text-primary-500">₹{bookingData.totalAmount}</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-slate-400">
              Status: <span className={`font-bold uppercase ${
                bookingData.paymentStatus === 'paid' ? 'text-green-500' :
                bookingData.paymentStatus === 'refunded' ? 'text-red-500' :
                'text-yellow-500'
              }`}>{bookingData.paymentStatus}</span>
            </span>
            {bookingData.paymentStatus === 'paid' && (
              <span className="text-[10px] text-green-500 font-bold">✓ PAID</span>
            )}
          </div>
        </div>

        {/* Pay Now button — only if not paid */}
        {bookingData.paymentStatus !== 'paid' && bookingData.paymentStatus !== 'refunded' && bookingData.status !== 'cancelled' && (
          <div className="mt-3 space-y-2">
            <Button
              onClick={handlePay}
              loading={paying}
              fullWidth
              size="lg"
              leftIcon={<span className="text-base">💳</span>}
            >
              Pay ₹{bookingData.totalAmount} via Card / NetBanking
            </Button>

            {/* FREE — Direct UPI Payment */}
            <Button
              variant="outline"
              fullWidth
              size="lg"
              onClick={() => {
                payViaUpi('sevasetu@paytm', bookingData.totalAmount, bookingData.bookingNumber);
                toast.success('UPI app khul rahi hai...');
              }}
              leftIcon={<span className="text-base">📱</span>}
            >
              Pay ₹{bookingData.totalAmount} via UPI (Direct)
            </Button>

            <p className="text-[10px] text-slate-500 text-center">
              💡 UPI direct: GPay / PhonePe / Paytm — no fees
            </p>
          </div>
        )}
      </div>

      {/* FREE FEATURES — Share, QR */}
      <div className="px-4 pt-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Quick Actions</h3>
        <div className="grid grid-cols-5 gap-2">
          <button
            onClick={() => {
              const user = useAuthStore.getState().user;
              whatsAppShareBooking(user?.phone || '0000000000', bookingData);
            }}
            className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl p-3 flex flex-col items-center gap-1 transition hover:bg-emerald-100"
          >
            <span className="text-2xl">💬</span>
            <span className="text-[10px] font-bold">WhatsApp</span>
          </button>
          <button
            onClick={() => shareNative({
              title: `Booking ${bookingData.bookingNumber}`,
              text: `${bookingData.categoryEmoji} ${bookingData.categoryName} booked with ${bookingData.workerName}`,
              url: window.location.href,
            })}
            className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl p-3 flex flex-col items-center gap-1 transition hover:bg-blue-100"
          >
            <span className="text-2xl">📤</span>
            <span className="text-[10px] font-bold">Share</span>
          </button>
          <button
            onClick={async () => {
              await copyToClipboard(bookingData.bookingNumber);
              toast.success('Booking # copied!');
            }}
            className="bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-2xl p-3 flex flex-col items-center gap-1 transition hover:bg-purple-100"
          >
            <span className="text-2xl">📋</span>
            <span className="text-[10px] font-bold">Copy ID</span>
          </button>
          <button
            onClick={() => {
              downloadCalendarEvent(bookingData);
              toast.success('📅 Calendar event downloaded!');
            }}
            className="bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-2xl p-3 flex flex-col items-center gap-1 transition hover:bg-orange-100"
          >
            <span className="text-2xl">📅</span>
            <span className="text-[10px] font-bold">Calendar</span>
          </button>
          <button
            onClick={() => {
              generatePdfReceipt({
                bookingNumber: bookingData.bookingNumber,
                customerName:  useAuthStore.getState().user?.name || undefined,
                workerName:    bookingData.workerName,
                categoryName:  bookingData.categoryName,
                scheduledAt:   bookingData.scheduledAt,
                address:       bookingData.fullAddress,
                basePrice:     bookingData.basePrice,
                platformFee:   bookingData.platformFee,
                totalAmount:   bookingData.totalAmount,
                paymentStatus: bookingData.paymentStatus,
              });
              toast.success('PDF print dialog khul gaya');
            }}
            className="bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 rounded-2xl p-3 flex flex-col items-center gap-1 transition hover:bg-slate-200"
          >
            <span className="text-2xl">📄</span>
            <span className="text-[10px] font-bold">PDF Bill</span>
          </button>
        </div>

        {/* Enable Notifications */}
        {Notification.permission !== 'granted' && (
          <button
            onClick={async () => {
              const granted = await requestPermission();
              if (granted) {
                notify('🔔 Notifications enabled!', 'You will get live updates for this booking', { vibrate: true });
                toast.success('Notifications enabled!');
              } else {
                toast.error('Permission denied');
              }
            }}
            className="w-full mt-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl py-3 px-4 flex items-center justify-center gap-2 font-bold text-sm"
          >
            🔔 Enable Live Notifications (FREE)
          </button>
        )}

        {/* QR Code (FREE) */}
        <div className="mt-3 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-3 flex items-center gap-3">
          <img
            src={getQrCodeUrl(`https://sevasetu.in/booking/${bookingData.id}`, 80)}
            alt="QR Code"
            className="w-16 h-16 rounded-lg"
          />
          <div className="flex-1">
            <p className="text-xs font-bold mb-0.5">Scan to share</p>
            <p className="text-[10px] text-slate-500">
              Scan QR to view booking on any device
            </p>
          </div>
        </div>
      </div>

      {/* Rating display */}
      {bookingData.rating && (
        <div className="px-4 pt-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 rounded-2xl p-4">
            <p className="text-xs font-bold text-yellow-700 dark:text-yellow-400 mb-2 uppercase tracking-wider">Your Review</p>
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={20}
                  className={s <= bookingData.rating! ? 'fill-yellow-500 text-yellow-500' : 'text-slate-300'}
                />
              ))}
            </div>
            {bookingData.review && (
              <p className="text-sm text-slate-700 dark:text-slate-300">"{bookingData.review}"</p>
            )}
          </div>
        </div>
      )}

      {/* LIVE ETA — visible for confirmed/upcoming bookings */}
      {(bookingData.status === 'confirmed' || bookingData.status === 'on_the_way') && bookingData.scheduledAt && (
        <LiveETACountdown scheduledAt={bookingData.scheduledAt} />
      )}

      {/* ADD TO CALENDAR — visible for upcoming bookings */}
      {(bookingData.status === 'pending' || bookingData.status === 'confirmed') && bookingData.scheduledAt && (
        <div className="px-4 pt-2 flex gap-2">
          <a
            href={googleCalendarUrl({
              title:       `${bookingData.categoryName || 'Service'} - Seva Setu`,
              description: `Booking #${bookingData.bookingNumber}. Worker: ${bookingData.workerName || 'TBD'}`,
              location:    bookingData.fullAddress || '',
              start:       new Date(bookingData.scheduledAt),
              durationMinutes: 90,
            })}
            target="_blank"
            rel="noopener"
            className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-sm font-bold py-3 rounded-xl"
          >
            <CalendarPlus size={16} /> Google Calendar
          </a>
          <button
            onClick={() => downloadIcs({
              title:       `${bookingData.categoryName || 'Service'} - Seva Setu`,
              description: `Booking #${bookingData.bookingNumber}`,
              location:    bookingData.fullAddress || '',
              start:       new Date(bookingData.scheduledAt!),
              durationMinutes: 90,
            })}
            className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-sm font-bold py-3 rounded-xl"
          >
            <CalendarPlus size={16} /> .ics
          </button>
        </div>
      )}

      {/* TIP THE WORKER — visible after completion */}
      {bookingData.status === 'completed' && bookingData.workerName && (
        <TipWorker workerName={bookingData.workerName} />
      )}

      {/* BEFORE / AFTER PHOTOS — visible when booking is done */}
      {bookingData.status === 'completed' && (
        <div className="px-4 pt-4">
          <BeforeAfterPhotos
            bookingId={id!}
            existingPhotos={(bookingData as any).proofPhotos || []}
            workerMode={false}
          />
        </div>
      )}

      {/* COMPLAINT — only after completed */}
      {bookingData.status === 'completed' && (
        <div className="px-4 pt-4 pb-2">
          <ComplaintForm bookingId={id!} bookingNumber={bookingData.bookingNumber} />
        </div>
      )}

      {/* Actions */}
      <div className="px-4 pt-6 space-y-3">
        {isActive && (
          <Button fullWidth size="lg" onClick={() => navigate(`/tracking/${id}`)} leftIcon={<Navigation size={18} />}>
            Live Tracking
          </Button>
        )}

        {/* BOOKING REMINDER — schedule 1 hr before */}
        {isActive && bookingData.scheduledAt && (
          <Button
            variant="outline"
            fullWidth
            onClick={async () => {
              if (hasReminder(id!)) {
                toast('Reminder already set hai ✓');
                return;
              }
              const set = await scheduleReminder({
                id: id!,
                bookingNumber: bookingData.bookingNumber,
                scheduledAt: bookingData.scheduledAt,
                workerName: bookingData.workerName,
                categoryName: bookingData.categoryName,
              });
              if (set) toast.success('🔔 Reminder set! 1 ghante pehle notification aayegi.');
              else toast.error('Notification permission do pehle.');
            }}
          >
            🔔 Remind Me 1 Hour Before
          </Button>
        )}

        {canCancel && (
          <Button variant="danger" fullWidth onClick={() => setCancelOpen(true)} leftIcon={<X size={18} />}>
            Cancel Booking
          </Button>
        )}
        {canRate && (
          <Button fullWidth size="lg" onClick={() => setRateOpen(true)} leftIcon={<Star size={18} />}>
            Rate Worker
          </Button>
        )}
      </div>

      {/* Cancel Modal */}
      <BottomSheet isOpen={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel Booking?">
        <textarea
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="Cancel reason batao (optional)"
          rows={3}
          className="w-full p-3 border-2 border-slate-200 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-800 focus:border-red-500 outline-none text-sm"
        />
        <div className="flex gap-2 mt-4">
          <Button variant="outline" fullWidth onClick={() => setCancelOpen(false)}>Nahi, rakhna hai</Button>
          <Button variant="danger" fullWidth onClick={handleCancel} loading={cancelling}>Haan, cancel</Button>
        </div>
      </BottomSheet>

      {/* Rate Modal — new RatingForm with photo support */}
      <BottomSheet isOpen={rateOpen} onClose={() => setRateOpen(false)} title="Rate Your Experience">
        <RatingForm
          bookingId={id!}
          workerName={bookingData.workerName}
          onSubmitted={async () => {
            fireworks();
            setRateOpen(false);
            await load();
          }}
        />
      </BottomSheet>
    </div>
  );
};
