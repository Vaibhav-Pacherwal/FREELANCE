import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function Button({
  children,
  to,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  arrow = false,
  className = '',
  disabled = false,
  type = 'button',
  ...props
}) {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer select-none rounded-full active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary: "bg-[#18181b] text-white hover:bg-[#27272a] shadow-sm border border-[#18181b]",
    secondary: "bg-[#f4f3ef] text-[#18181b] hover:bg-[#eae8e2] border border-[#e7e5e0] shadow-sm",
    accent: "bg-[#b45309] text-white hover:bg-[#92400e] shadow-sm border border-[#b45309]",
    outline: "bg-transparent text-[#18181b] border border-[#d5d2cb] hover:border-[#18181b] hover:bg-white",
    ghost: "bg-transparent text-[#52525b] hover:text-[#18181b] hover:bg-[#f4f3ef]"
  };

  const sizes = {
    sm: "text-xs px-4 py-2 gap-1.5",
    md: "text-xs font-semibold px-5 py-2.5 gap-2",
    lg: "text-sm font-semibold px-6 py-3.5 gap-2.5"
  };

  const combinedClasses = `${baseClasses} ${variants[variant] || variants.primary} ${sizes[size]} ${className}`;

  const content = (
    <>
      <span>{children}</span>
      {arrow && (
        <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={`group ${combinedClasses}`} {...props}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer" 
        className={`group ${combinedClasses}`} 
        {...props}
      >
        {content}
      </a>
    );
  }

  return (
    <button 
      type={type} 
      onClick={onClick} 
      disabled={disabled} 
      className={`group ${combinedClasses}`} 
      {...props}
    >
      {content}
    </button>
  );
}
