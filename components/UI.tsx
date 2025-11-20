
import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: React.MouseEventHandler<HTMLDivElement> }> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`glass-card rounded-2xl p-5 transition-all duration-300 text-slate-800 dark:text-slate-100 ${onClick ? 'cursor-pointer active:scale-[0.99]' : ''} ${className}`}
  >
    {children}
  </div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'danger' | 'secondary' | 'ghost' | 'neon'; size?: 'sm' | 'md' | 'lg' }> = ({ 
  children, variant = 'primary', size = 'md', className = '', ...props 
}) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 dark:bg-gradient-to-r dark:from-blue-600 dark:to-indigo-600 dark:hover:from-blue-500 dark:hover:to-indigo-500 dark:border dark:border-white/10',
    neon: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 dark:bg-gradient-to-r dark:from-cyan-500 dark:to-blue-500 dark:shadow-[0_0_15px_rgba(6,182,212,0.5)] dark:border dark:border-cyan-400/30',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/30',
    secondary: 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-sm dark:glass-button dark:hover:bg-white/5 dark:text-slate-200 dark:border-transparent',
    ghost: 'bg-transparent hover:bg-slate-100/50 dark:hover:bg-white/5 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button 
      className={`${sizes[size]} rounded-xl font-semibold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; color?: 'green' | 'red' | 'blue' | 'gray' | 'yellow' | 'purple' }> = ({ children, color = 'gray' }) => {
  const colors = {
    green: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 dark:shadow-[0_0_10px_rgba(16,185,129,0.1)]',
    red: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 dark:shadow-[0_0_10px_rgba(244,63,94,0.1)]',
    blue: 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20 dark:shadow-[0_0_10px_rgba(6,182,212,0.1)]',
    purple: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20 dark:shadow-[0_0_10px_rgba(168,85,247,0.1)]',
    yellow: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 dark:shadow-[0_0_10px_rgba(245,158,11,0.1)]',
    gray: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
  };

  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${colors[color]}`}>
      {children}
    </span>
  );
};

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className = '', ...props }, ref) => (
  <input
    ref={ref}
    className={`w-full bg-white/80 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all placeholder-slate-400 dark:placeholder-slate-600 backdrop-blur-sm shadow-sm dark:shadow-none ${className}`}
    {...props}
  />
));
Input.displayName = 'Input';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className = '', ...props }, ref) => (
  <select
    ref={ref}
    className={`w-full bg-white/80 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all appearance-none backdrop-blur-sm shadow-sm dark:shadow-none ${className}`}
    {...props}
  />
));
Select.displayName = 'Select';
