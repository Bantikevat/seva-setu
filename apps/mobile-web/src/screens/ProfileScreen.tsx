/**
 * PROFILE — Editorial luxury (Cred + Apple inspired)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  ArrowLeft, LogOut, Edit3, Plus, Home, Briefcase, MapPin,
  Gift, HelpCircle, FileText, Settings, ArrowUpRight, ChevronRight,
  Camera, User as UserIcon, Heart, Package, Trophy, Trash2, Download,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { PhotoUpload } from '@/components/ui/PhotoUpload';
import { useAuthStore } from '@/store/auth.store';
import { LangToggle } from '@/components/ui/LangToggle';
import { useT } from '@/i18n/useT';
import { user, auth, getErrorMessage } from '@/services/api';
import { getCurrentLocation } from '@/utils/free-features';
import { reverseGeocode } from '@/utils/extra-free';
import type { Address } from '@/types';
import { AppVersionFooter } from '@/components/ui/AppVersionFooter';
import { BadgesGrid } from '@/components/ui/BadgesGrid';

export const ProfileScreen = () => {
  const navigate = useNavigate();
  const { user: currentUser, setUser, logout } = useAuthStore();
  const t = useT();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddr, setLoadingAddr] = useState(true);

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const [addrOpen, setAddrOpen] = useState(false);
  const [addrType, setAddrType] = useState<'Ghar' | 'Office' | 'Other'>('Ghar');
  const [addrFull, setAddrFull] = useState('');

  useEffect(() => { loadProfile(); loadAddresses(); }, []);

  const loadProfile = async () => {
    try { const res = await user.getProfile(); if (res.data) setUser(res.data); } catch {}
  };

  const loadAddresses = async () => {
    setLoadingAddr(true);
    try {
      const res = await user.getAddresses();
      if (res.data?.addresses) setAddresses(res.data.addresses);
    } catch { toast.error('Addresses load nahi ho saka'); }
    finally { setLoadingAddr(false); }
  };

  const handleSaveProfile = async () => {
    if (editName && editName.length < 2) { toast.error('Min 2 letters'); return; }
    try {
      const res = await user.updateProfile({ name: editName, email: editEmail });
      if (res.data) { setUser(res.data); toast.success('Profile updated'); setEditProfileOpen(false); }
    } catch (err: any) { toast.error(getErrorMessage(err)); }
  };

  const handleSaveAddress = async () => {
    if (addrFull.length < 10) { toast.error('Address kam se kam 10 letter'); return; }
    try {
      await user.createAddress({ label: addrType, fullAddress: addrFull, latitude: 23.1765, longitude: 75.7885 });
      toast.success('Address added');
      setAddrOpen(false);
      setAddrFull('');
      await loadAddresses();
    } catch (err: any) { toast.error(getErrorMessage(err)); }
  };

  const handleLogout = async () => {
    try {
      const { unregisterPush } = await import('@/utils/fcm');
      await unregisterPush();
    } catch {}
    try { await auth.logout(); } catch {}
    logout();
    toast.success(t('profile.loggedOut'));
    navigate('/login', { replace: true });
  };

  const handleExportData = async () => {
    try {
      const token = localStorage.getItem('seva_token');
      const baseUrl = import.meta.env.VITE_USER_URL || 'http://localhost:3002';
      const res = await fetch(`${baseUrl}/users/me/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url;
      a.download = `seva-setu-data-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data download ho gaya!');
    } catch {
      toast.error('Export fail ho gaya');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Kya aap waqai apna account delete karna chahte ho?\n\nYe action permanent hai — saara data hat jayega.'
    );
    if (!confirmed) return;
    const doubleConfirm = window.prompt('Confirm karne ke liye "DELETE" type karo:');
    if (doubleConfirm !== 'DELETE') {
      toast.error('Account delete cancel');
      return;
    }
    try {
      const token = localStorage.getItem('seva_token');
      const baseUrl = import.meta.env.VITE_USER_URL || 'http://localhost:3002';
      const res = await fetch(`${baseUrl}/users/me`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Account delete ho gaya');
      logout();
      navigate('/login', { replace: true });
    } catch {
      toast.error('Delete fail ho gaya');
    }
  };

  const menuItems = [
    { icon: Briefcase, label: t('profile.workerMode'),  badge: 'NEW',    onClick: () => navigate('/worker-onboard') },
    { icon: Settings,  label: t('profile.adminPanel'),  badge: 'OWNER',  onClick: () => navigate('/admin') },
    { icon: Heart,     label: 'Favorite Workers',       onClick: () => navigate('/favorites') },
    { icon: Package,   label: 'Bundle Deals',           badge: 'SAVE 50%', onClick: () => navigate('/packages') },
    { icon: Trophy,    label: 'Worker Leaderboard',     onClick: () => navigate('/leaderboard') },
    { icon: Gift,      label: t('profile.refer'),       badge: '₹200',   onClick: () => navigate('/rewards') },
    { icon: HelpCircle, label: t('profile.help'),       onClick: () => navigate('/help') },
    { icon: FileText,  label: t('profile.terms'),       onClick: () => navigate('/terms') },
    { icon: FileText,  label: t('profile.privacy'),     onClick: () => navigate('/privacy') },
  ];

  return (
    <div className="w-full h-full bg-cream-50 dark:bg-ink-900 overflow-y-auto pb-10">
      {/* MINIMAL HEADER */}
      <div className="px-6 pt-12 pb-3">
        <div className="flex items-center justify-between">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/home')}
            className="w-10 h-10 rounded-full bg-cream-100 dark:bg-ink-800 flex items-center justify-center"
          >
            <ArrowLeft size={18} strokeWidth={2} className="text-ink-700 dark:text-cream-100" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleLogout}
            className="w-10 h-10 rounded-full bg-cream-100 dark:bg-ink-800 flex items-center justify-center"
          >
            <LogOut size={18} strokeWidth={2} className="text-ink-700 dark:text-cream-100" />
          </motion.button>
        </div>
      </div>

      {/* PROFILE HERO — Editorial */}
      <div className="px-6 pt-6 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-[10px] tracking-[0.3em] uppercase text-ink-400 font-medium mb-3">
            {t('profile.title')}
          </p>

          {/* Avatar */}
          <div className="mb-6">
            <PhotoUpload
              currentPhoto={currentUser?.profilePhoto}
              size="lg"
              shape="circle"
              onUpload={async (b64) => {
                await user.uploadPhoto(b64);
                await loadProfile();
              }}
            />
          </div>

          {/* Name + Phone */}
          <h1 className="font-display text-[44px] leading-[1.05] tracking-[-0.03em] text-ink-900 dark:text-cream-50 mb-2 font-medium">
            {currentUser?.name || (
              <span>
                {t('profile.hello')}<br />
                <span className="italic font-normal text-primary-500">{t('profile.stranger')}</span>
              </span>
            )}
          </h1>

          <p className="text-sm text-ink-400 dark:text-cream-100/50 font-medium">
            +91 {currentUser?.phone}
          </p>

          {/* Edit button */}
          <button
            onClick={() => {
              setEditName(currentUser?.name || '');
              setEditEmail(currentUser?.email || '');
              setEditProfileOpen(true);
            }}
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary-500 hover:gap-3 transition-all"
          >
            <Edit3 size={14} strokeWidth={2.5} />
            <span>{t('profile.editProfile')}</span>
          </button>
        </motion.div>
      </div>

      {/* STATS — Editorial */}
      <div className="px-6 mb-12">
        <p className="text-[10px] tracking-[0.3em] uppercase text-ink-400 font-medium mb-6">
          {t('profile.section1')}
        </p>

        <div className="grid grid-cols-3 gap-px bg-ink-100 dark:bg-ink-700 rounded-2xl overflow-hidden">
          {[
            { value: addresses.length, label: t('profile.addresses') },
            { value: '4.9',            label: t('home.rating') },
            { value: '100',            label: t('profile.refer') },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 * i }}
              className="bg-cream-50 dark:bg-ink-900 p-5 text-center"
            >
              <p className="font-display text-3xl tracking-tight text-ink-900 dark:text-cream-50 mb-1 font-medium">
                {s.value}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-ink-400 font-medium">
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ADDRESSES */}
      <div className="px-6 mb-12">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-ink-400 font-medium mb-1">{t('profile.section2')}</p>
            <h2 className="font-display text-2xl tracking-tight text-ink-900 dark:text-cream-50">
              {t('profile.addresses')}
            </h2>
          </div>
          <button
            onClick={() => { setAddrType('Ghar'); setAddrFull(''); setAddrOpen(true); }}
            className="flex items-center gap-1 text-xs font-medium text-primary-500"
          >
            <Plus size={12} strokeWidth={2.5} />
            <span>{t('profile.addAddress')}</span>
          </button>
        </div>

        {loadingAddr ? (
          <div className="space-y-2">
            <div className="skeleton h-16" />
            <div className="skeleton h-16" />
          </div>
        ) : addresses.length === 0 ? (
          <div className="border-2 border-dashed border-ink-200 dark:border-ink-700 rounded-2xl p-8 text-center">
            <MapPin size={20} strokeWidth={1.5} className="text-ink-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-ink-700 dark:text-cream-100 mb-1">{t('profile.noAddr')}</p>
            <p className="text-xs text-ink-400 mb-4">{t('profile.addAddress')}</p>
            <button
              onClick={() => setAddrOpen(true)}
              className="text-xs font-medium text-primary-500"
            >
              {t('profile.addAddress')} →
            </button>
          </div>
        ) : (
          <div className="space-y-px">
            {addresses.map((addr, i) => (
              <motion.div
                key={addr.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="py-5 border-t border-ink-100 dark:border-ink-700 flex items-start justify-between gap-4 last:border-b"
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <MapPin size={16} strokeWidth={2} className="text-primary-500 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-display text-base text-ink-900 dark:text-cream-50 tracking-tight">
                        {addr.label}
                      </p>
                      {addr.isDefault && (
                        <span className="text-[9px] tracking-widest uppercase text-primary-500 font-medium">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-400 leading-relaxed">{addr.fullAddress}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* LANGUAGE — Editorial row */}
      <div className="px-6 mb-10">
        <p className="text-[10px] tracking-[0.3em] uppercase text-ink-400 font-medium mb-4">
          {t('profile.language')} · भाषा
        </p>
        <div className="py-4 border-t border-b border-ink-100 dark:border-ink-700 flex items-center justify-between">
          <p className="text-sm font-medium text-ink-900 dark:text-cream-50">
            English / <span className="font-hindi">हिंदी</span>
          </p>
          <LangToggle variant="inline" />
        </div>
      </div>

      {/* MENU — Editorial list */}
      <div className="px-6 mb-12">
        <p className="text-[10px] tracking-[0.3em] uppercase text-ink-400 font-medium mb-6">
          {t('profile.section3')}
        </p>

        <div className="space-y-px">
          {menuItems.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={item.onClick}
              className="py-5 border-t border-ink-100 dark:border-ink-700 flex items-center justify-between cursor-pointer group last:border-b"
            >
              <div className="flex items-center gap-4">
                <item.icon size={18} strokeWidth={2} className="text-ink-400 group-hover:text-primary-500 transition" />
                <p className="text-sm font-medium text-ink-900 dark:text-cream-50">{item.label}</p>
                {item.badge && (
                  <span className={`text-[9px] tracking-widest uppercase font-medium px-2 py-0.5 rounded-full ${
                    item.badge === 'OWNER' ? 'bg-ink-900 text-gold' :
                    item.badge === 'NEW'   ? 'bg-primary-500 text-white' :
                    'bg-primary-50 text-primary-600'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </div>
              <ArrowUpRight size={14} strokeWidth={2} className="text-ink-300 group-hover:text-primary-500 transition" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* DANGER ZONE */}
      <div className="px-6 mb-12">
        <button
          onClick={handleExportData}
          className="w-full text-left py-5 border-t border-ink-100 dark:border-ink-700 flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <Download size={18} strokeWidth={2} className="text-slate-500" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Download my data (GDPR)</p>
          </div>
          <ArrowUpRight size={14} strokeWidth={2} className="text-slate-300 group-hover:text-slate-500 transition" />
        </button>

        <button
          onClick={handleLogout}
          className="w-full text-left py-5 border-t border-ink-100 dark:border-ink-700 flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <LogOut size={18} strokeWidth={2} className="text-red-500" />
            <p className="text-sm font-medium text-red-500">Log out</p>
          </div>
          <ArrowUpRight size={14} strokeWidth={2} className="text-red-300 group-hover:text-red-500 transition" />
        </button>

        <button
          onClick={handleDeleteAccount}
          className="w-full text-left py-5 border-t border-ink-100 dark:border-ink-700 flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <Trash2 size={18} strokeWidth={2} className="text-red-600" />
            <p className="text-sm font-medium text-red-600">Delete account (permanent)</p>
          </div>
          <ArrowUpRight size={14} strokeWidth={2} className="text-red-300 group-hover:text-red-600 transition" />
        </button>
      </div>

      {/* ACHIEVEMENTS */}
      <BadgesGrid />

      {/* FOOTER */}
      <div className="text-center pb-2">
        <p className="text-[10px] tracking-[0.3em] uppercase text-ink-300 font-medium">
          Member since {new Date(currentUser?.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
        </p>
        <p className="font-display text-2xl text-ink-300 mt-3 tracking-tight italic">
          Seva Setu
        </p>
      </div>
      <AppVersionFooter />

      {/* Edit Profile Modal */}
      <BottomSheet isOpen={editProfileOpen} onClose={() => setEditProfileOpen(false)} title="Edit Profile">
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Your name"
          />
          <Input
            label="Email"
            type="email"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
            placeholder="your@email.com"
          />
          <div className="flex gap-2 pt-3">
            <Button variant="outline" fullWidth onClick={() => setEditProfileOpen(false)}>Cancel</Button>
            <Button fullWidth onClick={handleSaveProfile}>Save</Button>
          </div>
        </div>
      </BottomSheet>

      {/* Address Modal */}
      <BottomSheet isOpen={addrOpen} onClose={() => setAddrOpen(false)} title="Add Address">
        <button
          onClick={async () => {
            const loading = toast.loading('Getting location...');
            try {
              const coords = await getCurrentLocation();
              const address = await reverseGeocode(coords.lat, coords.lng);
              if (address) { setAddrFull(address); toast.success('Location detected', { id: loading }); }
              else toast.error('Could not detect', { id: loading });
            } catch { toast.error('GPS unavailable', { id: loading }); }
          }}
          className="w-full mb-4 flex items-center justify-center gap-2 py-3 px-4 border border-ink-200 dark:border-ink-700 rounded-2xl text-sm font-medium text-primary-500 hover:bg-primary-50 dark:hover:bg-ink-800 transition"
        >
          <MapPin size={14} strokeWidth={2} />
          Use current location
        </button>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {([
            { type: 'Ghar' as const,   Icon: Home,       label: 'Home' },
            { type: 'Office' as const, Icon: Briefcase,  label: 'Work' },
            { type: 'Other' as const,  Icon: MapPin,     label: 'Other' },
          ]).map((t) => (
            <button
              key={t.type}
              onClick={() => setAddrType(t.type)}
              className={`flex items-center justify-center gap-1.5 py-3 rounded-xl border-2 text-sm font-medium transition ${
                addrType === t.type
                  ? 'bg-primary-50 dark:bg-primary-500/20 border-primary-500 text-primary-500'
                  : 'bg-cream-100 dark:bg-ink-800 border-ink-100 dark:border-ink-700 text-ink-700 dark:text-cream-100'
              }`}
            >
              <t.Icon size={14} strokeWidth={2} />
              {t.label}
            </button>
          ))}
        </div>

        <Input
          label="Full Address"
          value={addrFull}
          onChange={(e) => setAddrFull(e.target.value)}
          placeholder="House no, street, city"
        />

        <div className="flex gap-2 mt-5">
          <Button variant="outline" fullWidth onClick={() => setAddrOpen(false)}>Cancel</Button>
          <Button fullWidth onClick={handleSaveAddress}>Save Address</Button>
        </div>
      </BottomSheet>
    </div>
  );
};
