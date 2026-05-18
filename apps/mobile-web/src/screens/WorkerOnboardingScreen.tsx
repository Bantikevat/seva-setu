/**
 * WORKER ONBOARDING SCREEN
 * 4-step flow: Basic Info → Skills → Documents → Success
 * Route: /worker-onboard
 * Logic: if worker already exists → redirect to /worker-mode
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ArrowLeft, ArrowRight, CheckCircle, Upload, User,
  Briefcase, FileText, Star, Camera,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { workerSelf, worker as workerApi } from '@/services/api';
import { uploadToCloud } from '@/utils/image-upload';
import type { Category } from '@/types';

const STEPS = [
  { label: 'Basic Info',  icon: User },
  { label: 'Skills',      icon: Briefcase },
  { label: 'Documents',   icon: FileText },
  { label: 'Done!',       icon: Star },
];

export const WorkerOnboardingScreen = () => {
  const navigate = useNavigate();

  const [checking, setChecking]   = useState(true);
  const [step, setStep]           = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Step 1
  const [name, setName]   = useState('');
  const [bio, setBio]     = useState('');

  // Step 2
  const [categories, setCategories]       = useState<Category[]>([]);
  const [selectedCatId, setSelectedCatId] = useState('');
  const [expYears, setExpYears]           = useState(1);

  // Step 3
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoUrl,  setProfilePhotoUrl]  = useState('');
  const [aadhaarFile,      setAadhaarFile]       = useState<File | null>(null);
  const [aadhaarUrl,       setAadhaarUrl]        = useState('');
  const [uploading,        setUploading]         = useState(false);

  const profileInputRef = useRef<HTMLInputElement>(null);
  const aadhaarInputRef = useRef<HTMLInputElement>(null);

  // Check if already a worker
  useEffect(() => {
    workerSelf.getMe()
      .then(() => navigate('/worker-mode', { replace: true }))
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [navigate]);

  // Load categories for step 2
  useEffect(() => {
    workerApi.getCategories()
      .then((res) => setCategories(res.data?.categories || []))
      .catch(() => {});
  }, []);

  const handleProfilePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfilePhotoFile(file);
    setProfilePhotoUrl(URL.createObjectURL(file));
  };

  const handleAadhaar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAadhaarFile(file);
    setAadhaarUrl(URL.createObjectURL(file));
  };

  const uploadFiles = async () => {
    setUploading(true);
    try {
      let photoUrl = '';
      let docUrl   = '';

      if (profilePhotoFile) {
        const url = await uploadToCloud(profilePhotoFile, 'worker-photos', { maxWidth: 400, quality: 0.8 });
        if (url) photoUrl = url;
      }
      if (aadhaarFile) {
        const url = await uploadToCloud(aadhaarFile, 'worker-docs', { maxWidth: 1200, quality: 0.85 });
        if (url) docUrl = url;
      }
      return { photoUrl, docUrl };
    } finally {
      setUploading(false);
    }
  };

  const handleNext = async () => {
    if (step === 0) {
      if (!name.trim()) { toast.error('Naam zaroori hai'); return; }
      setStep(1);
    } else if (step === 1) {
      if (!selectedCatId) { toast.error('Ek skill select karo'); return; }
      setStep(2);
    } else if (step === 2) {
      setSubmitting(true);
      try {
        const { photoUrl, docUrl } = await uploadFiles();

        // Register as worker
        await workerSelf.register({
          name:         name.trim(),
          bio:          bio.trim() || undefined,
          profilePhoto: photoUrl || undefined,
          aadhaarUrl:   docUrl   || undefined,
        });

        // Add primary skill
        await workerSelf.addSkill({
          categoryId:     selectedCatId,
          experienceYears: expYears,
          isPrimary:      true,
        });

        setStep(3);
      } catch (err: any) {
        const msg = err?.response?.data?.message || 'Registration fail ho gayi';
        toast.error(msg);
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (checking) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-ink-950">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-ink-950 overflow-y-auto pb-10">
      {/* Header */}
      <div className="bg-ink-900 px-5 pt-12 pb-5">
        <div className="flex items-center gap-3 mb-5">
          {step < 3 && (
            <button
              onClick={() => step === 0 ? navigate(-1) : setStep(step - 1)}
              className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div>
            <p className="text-[10px] tracking-widest uppercase text-slate-400 font-bold">Seva Setu</p>
            <h1 className="text-lg font-extrabold text-white">Worker Bano</h1>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done    = i < step;
            const current = i === step;
            return (
              <div key={i} className="flex items-center gap-1 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  done    ? 'bg-green-500 text-white' :
                  current ? 'bg-primary-500 text-white' :
                  'bg-white/10 text-slate-500'
                }`}>
                  {done ? <CheckCircle size={14} /> : <Icon size={14} />}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 rounded transition-all ${done ? 'bg-green-500' : 'bg-white/10'}`} />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-1.5">
          {STEPS.map((s, i) => (
            <span key={i} className={`text-[9px] font-bold uppercase tracking-wide ${i === step ? 'text-primary-400' : 'text-slate-600'}`}>
              {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="bg-ink-900 border border-ink-800 rounded-3xl p-5">
                <p className="text-white font-extrabold text-xl mb-1">Apna Parichay Do</p>
                <p className="text-slate-400 text-sm mb-5">Customers yahi dekhenge</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Poora Naam *
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jaise: Ramesh Kumar"
                      className="w-full p-4 bg-ink-800 border-2 border-ink-700 rounded-2xl text-white font-medium outline-none focus:border-primary-500 placeholder:text-slate-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Apne Baare Mein (Optional)
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Jaise: 5 saal ka anubhav, reliable aur time pe..."
                      rows={3}
                      className="w-full p-4 bg-ink-800 border-2 border-ink-700 rounded-2xl text-white font-medium outline-none focus:border-primary-500 resize-none placeholder:text-slate-600"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-primary-500/10 border border-primary-500/30 rounded-2xl p-4">
                <p className="text-primary-400 text-xs font-bold">💡 Tip</p>
                <p className="text-slate-300 text-xs mt-1">
                  Achha naam aur bio dekar zyada customers attract kar sakte ho. Honest raho!
                </p>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="bg-ink-900 border border-ink-800 rounded-3xl p-5">
                <p className="text-white font-extrabold text-xl mb-1">Tumhari Skill</p>
                <p className="text-slate-400 text-sm mb-5">Kya kaam karte ho?</p>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  {categories.map((cat) => (
                    <motion.button
                      key={cat.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedCatId(cat.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        selectedCatId === cat.id
                          ? 'border-primary-500 bg-primary-500/20'
                          : 'border-ink-700 bg-ink-800'
                      }`}
                    >
                      <div className="text-3xl mb-2">{cat.emoji}</div>
                      <p className={`text-sm font-bold ${selectedCatId === cat.id ? 'text-primary-400' : 'text-white'}`}>
                        {cat.name}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">₹{cat.basePrice}/visit</p>
                    </motion.button>
                  ))}
                </div>

                {selectedCatId && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Kitne Saal Ka Anubhav?
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 5, 7, 10].map((yr) => (
                        <button
                          key={yr}
                          onClick={() => setExpYears(yr)}
                          className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${
                            expYears === yr
                              ? 'bg-primary-500 text-white'
                              : 'bg-ink-800 text-slate-400'
                          }`}
                        >
                          {yr}+
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="bg-ink-900 border border-ink-800 rounded-3xl p-5">
                <p className="text-white font-extrabold text-xl mb-1">Documents</p>
                <p className="text-slate-400 text-sm mb-5">Trust badhane ke liye zaroori hai</p>

                {/* Profile Photo */}
                <div className="mb-5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Profile Photo (Optional)
                  </label>
                  <input ref={profileInputRef} type="file" accept="image/*" className="hidden" onChange={handleProfilePhoto} />
                  <button
                    onClick={() => profileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-ink-600 rounded-2xl p-5 flex flex-col items-center gap-2 hover:border-primary-500 transition"
                  >
                    {profilePhotoUrl ? (
                      <img src={profilePhotoUrl} alt="Profile" className="w-20 h-20 rounded-2xl object-cover" />
                    ) : (
                      <>
                        <div className="w-14 h-14 bg-ink-800 rounded-2xl flex items-center justify-center">
                          <Camera size={24} className="text-slate-500" />
                        </div>
                        <p className="text-slate-400 text-sm font-medium">Apni Photo Lagao</p>
                      </>
                    )}
                    <p className="text-[10px] text-slate-600">Tap to {profilePhotoUrl ? 'change' : 'upload'}</p>
                  </button>
                </div>

                {/* Aadhaar */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Aadhaar Card (Optional — Admin Review)
                  </label>
                  <input ref={aadhaarInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleAadhaar} />
                  <button
                    onClick={() => aadhaarInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-ink-600 rounded-2xl p-5 flex flex-col items-center gap-2 hover:border-blue-500 transition"
                  >
                    {aadhaarUrl ? (
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                          <FileText size={22} className="text-blue-400" />
                        </div>
                        <div className="text-left">
                          <p className="text-white font-bold text-sm">Document Selected</p>
                          <p className="text-[10px] text-slate-500">{aadhaarFile?.name}</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-14 h-14 bg-ink-800 rounded-2xl flex items-center justify-center">
                          <Upload size={24} className="text-slate-500" />
                        </div>
                        <p className="text-slate-400 text-sm font-medium">Aadhaar Upload Karo</p>
                      </>
                    )}
                    <p className="text-[10px] text-slate-600">Tap to {aadhaarUrl ? 'change' : 'upload'}</p>
                  </button>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4">
                <p className="text-blue-400 text-xs font-bold">🔒 Privacy</p>
                <p className="text-slate-300 text-xs mt-1">
                  Aadhaar sirf admin dekh sakta hai verify karne ke liye. Customers ko nahi dikhta.
                </p>
              </div>

              <p className="text-center text-slate-500 text-xs">
                Documents optional hain — baad mein bhi upload kar sakte ho
              </p>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="flex flex-col items-center text-center pt-10"
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="w-28 h-28 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-2xl"
              >
                <CheckCircle size={52} className="text-white" />
              </motion.div>

              <h2 className="text-3xl font-extrabold text-white mb-3">Badhai Ho! 🎉</h2>
              <p className="text-slate-400 text-base mb-2">
                Tumhari registration ho gayi.
              </p>
              <p className="text-slate-500 text-sm mb-8 max-w-xs">
                Admin 24 ghante mein verify karega. Verify hone ke baad tumhara profile customers ko dikhne lagega.
              </p>

              <div className="w-full bg-ink-900 border border-ink-800 rounded-3xl p-5 mb-6 text-left space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Next Steps</p>
                {[
                  { emoji: '⏳', text: 'Admin 24 ghante mein verify karega' },
                  { emoji: '📲', text: 'Verify hone pe notification aayega' },
                  { emoji: '💰', text: 'Har booking pe earning seedha aayegi' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-2xl">{item.emoji}</span>
                    <p className="text-slate-300 text-sm">{item.text}</p>
                  </div>
                ))}
              </div>

              <Button
                fullWidth
                size="lg"
                onClick={() => navigate('/worker-mode', { replace: true })}
                leftIcon={<Briefcase size={18} />}
              >
                Worker Dashboard Dekho
              </Button>

              <button
                onClick={() => navigate('/home', { replace: true })}
                className="mt-3 text-slate-500 text-sm hover:text-slate-300"
              >
                Home pe wapas jao
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next button — only for steps 0-2 */}
        {step < 3 && (
          <div className="mt-6">
            <Button
              fullWidth
              size="lg"
              onClick={handleNext}
              loading={submitting || uploading}
              rightIcon={step < 2 ? <ArrowRight size={18} /> : undefined}
            >
              {uploading   ? 'Documents upload ho rahe hain...' :
               submitting  ? 'Register ho raha hai...' :
               step === 2  ? 'Register Karo' :
               'Aage Badho'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
