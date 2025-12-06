import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: React.MouseEventHandler<HTMLDivElement> }> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`glass-card rounded-3xl p-6 transition-all duration-300 relative overflow-hidden group ${onClick ? 'cursor-pointer active:scale-[0.98] hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/10' : ''} ${className}`}
  >
    {/* Subtle gradient sheen on hover */}
    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none duration-700" />
    <div className="relative z-10">
      {children}
    </div>
  </div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'danger' | 'secondary' | 'ghost' | 'neon'; size?: 'sm' | 'md' | 'lg' }> = ({ 
  children, variant = 'primary', size = 'md', className = '', ...props 
}) => {
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 border border-indigo-500/50',
    neon: 'btn-neon',
    danger: 'bg-rose-600/90 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/20 border border-rose-500/50',
    secondary: 'bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white border border-transparent dark:border-white/5',
    ghost: 'bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-5 py-2.5 rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-2xl',
  };

  return (
    <button 
      className={`${sizes[size]} font-display font-medium tracking-wide transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; color?: 'green' | 'red' | 'blue' | 'gray' | 'yellow' | 'purple' | 'cyan' }> = ({ children, color = 'gray' }) => {
  const colors = {
    green: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]',
    red: 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]',
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]',
    yellow: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]',
    gray: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold border ${colors[color]}`}>
      {children}
    </span>
  );
};

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className = '', ...props }, ref) => (
  <input
    ref={ref}
    className={`w-full input-base rounded-xl px-4 py-3 font-medium transition-all outline-none border focus:ring-2 focus:ring-indigo-500/20 ${className}`}
    {...props}
  />
));
Input.displayName = 'Input';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className = '', ...props }, ref) => (
  <select
    ref={ref}
    className={`w-full input-base rounded-xl px-4 py-3 font-medium transition-all outline-none border focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer ${className}`}
    {...props}
  />
));
Select.displayName = 'Select';
