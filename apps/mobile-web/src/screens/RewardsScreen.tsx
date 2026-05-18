/**
 * REWARDS SCREEN â€” Refer & Earn + Points
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ArrowLeft, Gift, Copy, Share2, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { user } from '@/services/api';
import { whatsAppShare, shareNative, copyToClipboard } from '@/utils/free-features';
import { logger } from '@/utils/logger';

export const RewardsScreen = () => {
  const navigate = useNavigate();
  const [rewards, setRewards] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [redeemAmount, setRedeemAmount] = useState(100);

  const load = async () => {
    setLoading(true);
    try {
      const res = await user.getRewards();
      if (res.data) setRewards(res.data);
    } catch (err) {
      logger.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRedeem = async () => {
    try {
      const res = await user.redeemPoints(redeemAmount);
      if (res.success && res.data) {
        toast.success(`âœ¨ ${res.message}`);
        await load();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Redemption failed');
    }
  };

  const referMessage = rewards?.referralCode
    ? `ðŸŽ‰ Seva Setu try karo â€” Premium home services. Use my code *${rewards.referralCode}* and get 100 bonus points!\n\nDownload: http://localhost:5173`
    : '';

  if (loading || !rewards) {
    return (
      <div className="w-full h-full bg-slate-50 dark:bg-zinc-950 p-4 pt-14">
        <div className="skeleton h-32 mb-4" />
        <div className="skeleton h-48" />
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-slate-50 dark:bg-zinc-950 overflow-y-auto pb-10">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white p-5 pt-12 rounded-b-3xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full"></div>

        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigate('/profile')} className="w-10 h-10 bg-white/20 backdrop-blur-xl border border-white/25 rounded-xl flex items-center justify-center">
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-lg font-extrabold">Rewards & Referrals</h2>
          </div>

          {/* Points card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-4"
          >
            <Sparkles className="inline mb-2" size={32} />
            <p className="text-5xl font-extrabold mb-1">{rewards.points}</p>
            <p className="text-xs opacity-80 uppercase tracking-wider font-semibold">Total Points</p>
            <p className="text-sm mt-2 opacity-90">â‰ˆ â‚¹{rewards.rupeesValue} value</p>
          </motion.div>

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="bg-white/15 backdrop-blur-xl rounded-xl p-3 text-center">
              <p className="text-lg font-extrabold">{rewards.lifetimePoints}</p>
              <p className="text-[10px] opacity-80">Lifetime</p>
            </div>
            <div className="bg-white/15 backdrop-blur-xl rounded-xl p-3 text-center">
              <p className="text-lg font-extrabold">{rewards.referralsCount}</p>
              <p className="text-[10px] opacity-80">Referrals</p>
            </div>
            <div className="bg-white/15 backdrop-blur-xl rounded-xl p-3 text-center">
              <p className="text-lg font-extrabold">{rewards.transactions.length}</p>
              <p className="text-[10px] opacity-80">Activities</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-5">
        {/* Refer & Earn Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-5 shadow-card"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center text-2xl">
              ðŸŽ
            </div>
            <div>
              <h3 className="font-extrabold text-lg">Refer & Earn â‚¹200</h3>
              <p className="text-xs text-slate-500">Friend signs up â†’ You get â‚¹200 worth points</p>
            </div>
          </div>

          {/* Code box */}
          <div className="bg-gradient-to-r from-orange-50 to-pink-50 dark:from-zinc-800 dark:to-zinc-800 border-2 border-dashed border-orange-300 dark:border-zinc-700 rounded-xl p-4 mb-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Your Referral Code</p>
            <p className="text-2xl font-extrabold text-primary-500 tracking-widest font-mono">
              {rewards.referralCode}
            </p>
          </div>

          {/* Share buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                whatsAppShare('', referMessage);
                toast.success('Opening WhatsApp...');
              }}
              className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl p-3 flex flex-col items-center gap-1"
            >
              <span className="text-xl">ðŸ’¬</span>
              <span className="text-[10px] font-bold">WhatsApp</span>
            </button>
            <button
              onClick={() => shareNative({ title: 'Refer Seva Setu', text: referMessage })}
              className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl p-3 flex flex-col items-center gap-1"
            >
              <Share2 size={20} />
              <span className="text-[10px] font-bold">Share</span>
            </button>
            <button
              onClick={async () => {
                await copyToClipboard(rewards.referralCode);
                toast.success('Code copied!');
              }}
              className="bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-xl p-3 flex flex-col items-center gap-1"
            >
              <Copy size={20} />
              <span className="text-[10px] font-bold">Copy</span>
            </button>
          </div>
        </motion.div>

        {/* Redeem Points */}
        {rewards.points >= 10 && (
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center text-2xl">
                ðŸ’°
              </div>
              <div>
                <h3 className="font-extrabold text-lg">Redeem Points</h3>
                <p className="text-xs text-slate-500">10 points = â‚¹1</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-800 rounded-xl p-3 mb-3">
              <p className="text-xs text-slate-500 mb-1">Redeem amount</p>
              <div className="flex items-center justify-between">
                <input
                  type="range"
                  min="10"
                  max={rewards.points}
                  step="10"
                  value={redeemAmount}
                  onChange={(e) => setRedeemAmount(Number(e.target.value))}
                  className="flex-1 mr-3"
                />
                <p className="font-extrabold text-primary-500 min-w-[80px] text-right">
                  {redeemAmount} pts
                </p>
              </div>
              <p className="text-xs text-green-600 font-bold mt-2 text-center">
                = â‚¹{Math.round(redeemAmount * 0.1)} discount
              </p>
            </div>

            <Button onClick={handleRedeem} fullWidth>
              Redeem {redeemAmount} points
            </Button>
          </div>
        )}

        {/* Transactions */}
        <div>
          <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <TrendingUp size={14} /> Recent Activity
          </h3>
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
            {rewards.transactions.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">No activity yet</div>
            ) : (
              rewards.transactions.map((t: any, i: number) => (
                <div key={i} className={`p-3 flex items-center gap-3 ${i !== rewards.transactions.length - 1 ? 'border-b border-slate-100 dark:border-zinc-800' : ''}`}>
                  <div className="w-9 h-9 bg-primary-50 dark:bg-primary-500/20 text-primary-500 rounded-xl flex items-center justify-center">
                    {t.type === 'signup_bonus' ? 'ðŸŽ‰' :
                     t.type === 'referral_bonus' ? 'ðŸ¤' :
                     t.type === 'booking_reward' ? 'ðŸŽ¯' :
                     t.type === 'redemption' ? 'ðŸ’¸' :
                     t.type === 'referred_bonus' ? 'ðŸŽ' : 'â­'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{t.description}</p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <p className={`text-sm font-extrabold ${t.points >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {t.points >= 0 ? '+' : ''}{t.points}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
