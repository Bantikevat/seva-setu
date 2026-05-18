/**
 * PREMIUM ICONS — Beautiful gradient icon containers
 * Use everywhere instead of plain emojis
 */

import { motion } from 'framer-motion';
import {
  Wrench, Zap, Snowflake, Sparkles, Hammer, ChefHat,
  Palette, Heart, Home, Search, ClipboardList, User,
  Bell, MapPin, Calendar, CreditCard, Phone, MessageCircle,
  Star, BadgeCheck, Settings, LogOut, Camera, Edit3, Plus,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Plumber:     Wrench,
  Electrician: Zap,
  'AC Repair': Snowflake,
  Cleaning:    Sparkles,
  Carpenter:   Hammer,
  Cook:        ChefHat,
  Beauty:      Heart,
  Painter:     Palette,
};

interface PremiumIconProps {
  category?: string;
  icon?: LucideIcon;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  gradient?: string;
  emoji?: string;
  animate?: boolean;
}

export const PremiumIcon = ({
  category,
  icon: CustomIcon,
  size = 'md',
  gradient = 'from-primary-500 to-orange-500',
  emoji,
  animate = false,
}: PremiumIconProps) => {
  const Icon = CustomIcon || (category && iconMap[category]);

  const sizes = {
    sm: { box: 'w-9 h-9 rounded-xl',  icon: 16, emoji: 'text-base' },
    md: { box: 'w-12 h-12 rounded-2xl', icon: 22, emoji: 'text-2xl' },
    lg: { box: 'w-16 h-16 rounded-2xl', icon: 28, emoji: 'text-3xl' },
    xl: { box: 'w-20 h-20 rounded-3xl', icon: 36, emoji: 'text-4xl' },
  };

  const s = sizes[size];

  return (
    <motion.div
      animate={animate ? { rotate: [0, 5, -5, 0] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
      className={`${s.box} bg-gradient-to-br ${gradient} flex items-center justify-center shadow-soft relative overflow-hidden`}
    >
      {/* Inner glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />

      {/* Icon or emoji */}
      <div className="relative z-10 text-white drop-shadow-md">
        {Icon ? (
          <Icon size={s.icon} strokeWidth={2.5} />
        ) : emoji ? (
          <span className={s.emoji}>{emoji}</span>
        ) : (
          <span className={s.emoji}>🔧</span>
        )}
      </div>
    </motion.div>
  );
};

// Re-export Lucide icons for convenience
export {
  Wrench, Zap, Snowflake, Sparkles, Hammer, ChefHat, Palette, Heart,
  Home, Search, ClipboardList, User, Bell, MapPin, Calendar, CreditCard,
  Phone, MessageCircle, Star, BadgeCheck, Settings, LogOut, Camera, Edit3, Plus,
};
