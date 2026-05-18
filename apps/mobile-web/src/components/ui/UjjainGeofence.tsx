/**
 * UJJAIN GEOFENCE — Alert users outside service area
 * Shows a banner if user's location is >50km from Ujjain
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X } from 'lucide-react';

// Ujjain city center coordinates
const UJJAIN_LAT = 23.1765;
const UJJAIN_LNG = 75.7885;
const RADIUS_KM = 50;

const haversineKm = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const UjjainGeofence = () => {
  const [outsideArea, setOutsideArea] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [distanceKm, setDistanceKm] = useState(0);

  useEffect(() => {
    // Don't re-check if already dismissed this session
    if (sessionStorage.getItem('geofence_dismissed')) return;

    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const dist = haversineKm(pos.coords.latitude, pos.coords.longitude, UJJAIN_LAT, UJJAIN_LNG);
        setDistanceKm(Math.round(dist));
        if (dist > RADIUS_KM) setOutsideArea(true);
      },
      () => {}, // silent fail — don't block app
      { timeout: 5000, maximumAge: 60000 }
    );
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('geofence_dismissed', '1');
  };

  return (
    <AnimatePresence>
      {outsideArea && !dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mx-4 mb-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-4 flex items-start gap-3"
        >
          <MapPin size={18} className="text-amber-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Aap Ujjain se bahar hain ({distanceKm} km)
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5 leading-relaxed">
              Hum abhi sirf Ujjain aur 50km aas-paas service karte hain. Jaldi aur sheher aayenge!
            </p>
          </div>
          <button onClick={handleDismiss} className="flex-shrink-0 text-amber-400 hover:text-amber-600 transition">
            <X size={16} strokeWidth={2.5} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
