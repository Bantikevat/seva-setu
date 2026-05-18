/**
 * Input — Premium input field
 * -------------------------------------------------
 * Features: label, error, prefix/suffix, focus animation
 */

import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  error?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, prefix, suffix, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 tracking-wide uppercase">
            {label}
          </label>
        )}

        <div className={`
          flex items-center
          bg-slate-50 dark:bg-zinc-800
          border-2 transition-all duration-200
          rounded-2xl overflow-hidden
          ${error
            ? 'border-red-500 focus-within:ring-4 focus-within:ring-red-100'
            : 'border-slate-200 dark:border-zinc-700 focus-within:border-primary-500 focus-within:bg-white dark:focus-within:bg-zinc-900 focus-within:ring-4 focus-within:ring-primary-100 dark:focus-within:ring-primary-900/20'
          }
        `}>
          {prefix && (
            <div className="pl-4 pr-2 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2">
              {prefix}
            </div>
          )}

          <input
            ref={ref}
            className={`
              flex-1 py-3.5 px-4 bg-transparent outline-none
              text-slate-900 dark:text-slate-100
              placeholder:text-slate-400 dark:placeholder:text-zinc-500
              text-base font-medium tracking-wide
              ${className}
            `}
            {...props}
          />

          {suffix && <div className="pr-4 text-slate-500">{suffix}</div>}
        </div>

        {error && (
          <p className="text-red-500 text-xs font-medium mt-2 ml-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
