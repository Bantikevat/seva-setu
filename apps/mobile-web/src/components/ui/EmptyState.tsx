import { ReactNode } from 'react';

interface Props {
  icon?: string;          // emoji
  title: string;
  message?: string;
  action?: ReactNode;
}

export const EmptyState = ({ icon = '📭', title, message, action }: Props) => (
  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
    <div className="text-6xl mb-4 opacity-50">{icon}</div>
    <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">{title}</h3>
    {message && <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-5">{message}</p>}
    {action}
  </div>
);
