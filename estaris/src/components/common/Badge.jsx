import React from 'react';

export default function Badge({ 
  children, 
  variant = 'neutral', 
  size = 'sm', 
  className = '',
  dot = false 
}) {
  const variantStyles = {
    neutral: 'bg-[#f4f3ef] text-[#52525b] border-[#e7e5e0]',
    dark: 'bg-[#18181b] text-white border-[#18181b]',
    amber: 'bg-amber-50 text-amber-900 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    blue: 'bg-blue-50 text-blue-900 border-blue-200',
    cyan: 'bg-stone-100 text-stone-800 border-stone-300',
    indigo: 'bg-stone-100 text-stone-800 border-stone-200',
    outline: 'bg-transparent text-[#71717a] border-[#e7e5e0]'
  };

  const dotColors = {
    neutral: 'bg-[#71717a]',
    dark: 'bg-emerald-400',
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    cyan: 'bg-stone-600',
    indigo: 'bg-stone-600',
    outline: 'bg-[#71717a]'
  };

  const sizeStyles = {
    xs: 'px-2.5 py-0.5 text-[10px] font-medium tracking-[0.04em]',
    sm: 'px-3 py-1 text-[11px] font-medium tracking-[0.03em]',
    md: 'px-3.5 py-1.5 text-xs font-semibold tracking-[0.02em]'
  };

  return (
    <span 
      className={`inline-flex items-center gap-1.5 font-sans uppercase rounded-full border transition-colors ${variantStyles[variant] || variantStyles.neutral} ${sizeStyles[size]} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || dotColors.neutral}`} />
      )}
      {children}
    </span>
  );
}
