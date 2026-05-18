import { useMemo } from 'react';
import { Lightbulb } from 'lucide-react';

const TIPS = [
  'AC ka filter mahine mein 1 baar saaf karo — bijli kam lagti hai',
  'Geyser ka thermostat 50°C pe rakho — safe + bijli kam',
  'RO water filter 6 mahine mein change karwa lo',
  'Fridge ke peeche dust saaf karo — cooling improve hoti hai',
  'LED bulb 80% kam bijli khate hain regular bulb se',
  'Pipe leakage ignore mat karo — 1 liter/ghanta = 8,760 L saal mein!',
  'Washing machine mein clothes overload mat karo — bearing kharab hota hai',
  'Wood furniture mein lemon polish saal mein 2 baar lagao',
  'Bathroom cleaning ke liye baking soda + vinegar — chemical se safe',
  'Inverter battery distilled water hi use karo — tap water nahi',
  'Pankhe ke blades dust se 15% efficiency kam hoti hai',
  'Gas stove ka burner choke ho jata hai — har mahine saaf karo',
];

export const TipOfTheDay = () => {
  const tip = useMemo(() => {
    const day = new Date().getDate();
    return TIPS[day % TIPS.length];
  }, []);

  return (
    <div className="mx-4 my-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-3 flex items-start gap-3">
      <div className="w-9 h-9 rounded-full bg-yellow-400 flex-shrink-0 flex items-center justify-center">
        <Lightbulb size={18} className="text-white" />
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-yellow-700 dark:text-yellow-400 mb-0.5">Tip of the Day</p>
        <p className="text-xs text-yellow-900 dark:text-yellow-200 leading-relaxed">{tip}</p>
      </div>
    </div>
  );
};
