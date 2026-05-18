/**
 * 3D FLIP CARD — Premium worker preview
 * 10x feature: Tap to flip, see hidden details
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, BadgeCheck, MapPin, Clock, Award, Sparkles } from 'lucide-react';
import type { Worker } from '@/types';

interface FlipCardProps {
  worker: Worker;
  onBook: () => void;
}

export const FlipCard = ({ worker, onBook }: FlipCardProps) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="relative w-full h-72" style={{ perspective: '1500px' }}>
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformStyle: 'preserve-3d' }}
        className="w-full h-full relative cursor-pointer"
        onClick={() => setFlipped(!flipped)}
      >
        {/* FRONT */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-large" style={{ backfaceVisibility: 'hidden' }}>
          <div className="relative h-full bg-gradient-to-br from-orange-400 via-red-400 to-pink-500">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/20 rounded-full" />
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/15 rounded-full" />

            {/* Verified badge */}
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-green-600 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
              <BadgeCheck size={11} className="fill-green-500 text-white" /> VERIFIED
            </div>

            {/* Flip hint */}
            <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1">
              <Sparkles size={10} /> TAP TO FLIP
            </div>

            {/* Big emoji */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-9xl drop-shadow-2xl">{worker.skillEmoji}</span>
            </div>

            {/* Bottom info */}
            <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/60 to-transparent text-white">
              <h3 className="text-2xl font-extrabold tracking-tight">{worker.name}</h3>
              <p className="text-sm opacity-90">{worker.skill} • {worker.experienceYears}+ years</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full">
                  <Star size={11} className="fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-bold">{worker.ratingAverage}</span>
                </div>
                <span className="text-xs opacity-80">₹{worker.pricePerVisit}/visit</span>
              </div>
            </div>
          </div>
        </div>

        {/* BACK */}
        <div
          className="absolute inset-0 rounded-3xl overflow-hidden shadow-large bg-gradient-to-br from-ink-900 to-ink-950 text-white p-5"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/20 rounded-full blur-3xl" />

          <div className="relative h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold tracking-widest uppercase opacity-70">Worker Profile</p>
              <span className="text-2xl">{worker.skillEmoji}</span>
            </div>

            <h3 className="text-xl font-extrabold tracking-tight mb-1">{worker.name}</h3>
            <p className="text-xs opacity-80 mb-4">{worker.skill}</p>

            {/* Achievement badges */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-2">
                <Award size={14} className="text-yellow-400 mb-1" />
                <p className="text-[10px] opacity-70 font-bold uppercase">Total Jobs</p>
                <p className="text-base font-extrabold">{worker.totalJobs}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-2">
                <Star size={14} className="fill-yellow-400 text-yellow-400 mb-1" />
                <p className="text-[10px] opacity-70 font-bold uppercase">Rating</p>
                <p className="text-base font-extrabold">{worker.ratingAverage}⭐</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-2">
                <Clock size={14} className="text-blue-400 mb-1" />
                <p className="text-[10px] opacity-70 font-bold uppercase">Experience</p>
                <p className="text-base font-extrabold">{worker.experienceYears}+ yrs</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-2">
                <MapPin size={14} className="text-green-400 mb-1" />
                <p className="text-[10px] opacity-70 font-bold uppercase">Distance</p>
                <p className="text-base font-extrabold">{worker.distanceKm || '—'} km</p>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={(e) => { e.stopPropagation(); onBook(); }}
              className="mt-auto w-full bg-ink-900 text-white font-extrabold py-3 rounded-2xl shadow-medium"
            >
              Book Now → ₹{worker.pricePerVisit}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
