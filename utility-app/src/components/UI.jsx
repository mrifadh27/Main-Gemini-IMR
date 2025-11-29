import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Card = ({ children, className = "" }) => (
  <div className={twMerge("bg-white rounded-xl shadow-sm border border-slate-200", className)}>
    {children}
  </div>
);

export const Badge = ({ children, type = 'default' }) => {
  const styles = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-rose-100 text-rose-700',
    primary: 'bg-blue-100 text-blue-700',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[type] || styles.default}`}>
      {children}
    </span>
  );
};

export const Button = ({ children, onClick, variant = 'primary', className = "", disabled = false }) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
    outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50'
  };
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={twMerge(`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`, variants[variant], className)}
    >
      {children}
    </button>
  );
};