/**
 * Weather Widget — Open-Meteo API (FREE, no key, unlimited)
 * Ujjain coords pre-set; can detect via GPS too.
 */
import { useEffect, useState } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, Wind } from 'lucide-react';

const UJJAIN_LAT = 23.1765;
const UJJAIN_LNG = 75.7885;

const WEATHER_TIPS: Record<string, string> = {
  rain:  'Baarish hai! AC/cooler check karwa lo aaj',
  hot:   'Garmi badh rahi hai — AC repair fast book karo',
  cold:  'Thand hai — geyser/heater repair ke liye accha time',
  clear: 'Mausam saaf hai — house cleaning ka best time',
};

export const WeatherWidget = () => {
  const [temp, setTemp]   = useState<number | null>(null);
  const [code, setCode]   = useState<number>(0);
  const [tip, setTip]     = useState('');

  useEffect(() => {
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${UJJAIN_LAT}&longitude=${UJJAIN_LNG}&current_weather=true`)
      .then((r) => r.json())
      .then((d) => {
        const t = d.current_weather?.temperature;
        const c = d.current_weather?.weathercode || 0;
        setTemp(Math.round(t));
        setCode(c);
        if (c >= 51 && c <= 67)      setTip(WEATHER_TIPS.rain);
        else if (t > 35)             setTip(WEATHER_TIPS.hot);
        else if (t < 15)             setTip(WEATHER_TIPS.cold);
        else                         setTip(WEATHER_TIPS.clear);
      })
      .catch(() => {});
  }, []);

  if (temp === null) return null;

  const Icon = code >= 51 ? CloudRain : code >= 71 ? CloudSnow : code >= 1 ? Cloud : Sun;
  const grad = code >= 51 ? 'from-blue-400 to-indigo-600' : 'from-amber-400 to-orange-500';

  return (
    <div className={`mx-4 my-3 bg-gradient-to-br ${grad} text-white rounded-2xl p-4 flex items-center gap-3 shadow-lg`}>
      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
        <Icon size={24} />
      </div>
      <div className="flex-1">
        <p className="text-xs opacity-90 flex items-center gap-1">
          <Wind size={12} /> Ujjain · Abhi
        </p>
        <p className="text-2xl font-bold">{temp}°C</p>
      </div>
      <div className="text-right text-[11px] opacity-95 max-w-[140px] leading-tight">
        {tip}
      </div>
    </div>
  );
};
