// =============================================================================
// UMS UI COMPONENTS
// =============================================================================

import React from 'react';
import { twMerge } from 'tailwind-merge';
import { X, Loader2 } from 'lucide-react';

// =============================================================================
// CARD
// =============================================================================

export const Card = ({ children, className = "", hover = false, ...props }) => (
  <div 
    className={twMerge(
      "bg-white rounded-2xl border border-slate-200/60 shadow-sm",
      hover && "transition-all duration-300 hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

// =============================================================================
// BADGE
// =============================================================================

export const Badge = ({ children, type = 'default', size = 'sm', className, ...props }) => {
  const styles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    danger: 'bg-rose-100 text-rose-700 border-rose-200',
    primary: 'bg-blue-100 text-blue-700 border-blue-200',
    info: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
  };
  
  const sizes = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };
  
  return (
    <span 
      className={twMerge(
        `inline-flex items-center rounded-full font-medium border transition-all`,
        styles[type] || styles.default,
        sizes[size] || sizes.sm,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

// =============================================================================
// BUTTON
// =============================================================================

export const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  className = "", 
  disabled = false,
  loading = false,
  icon: Icon,
  ...props
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200',
    danger: 'bg-gradient-to-r from-rose-600 to-red-600 text-white hover:from-rose-700 hover:to-red-700 shadow-lg shadow-rose-500/25',
    success: 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-500/25',
    outline: 'border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400',
    ghost: 'text-slate-600 hover:bg-slate-100',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled || loading}
      className={twMerge(
        `inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200`,
        `disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`,
        `active:scale-[0.98]`,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : Icon && <Icon size={16} />}
      {children}
    </button>
  );
};

// =============================================================================
// INPUT
// =============================================================================

export const Input = ({ 
  label, 
  error, 
  icon: Icon, 
  className = "", 
  containerClassName = "",
  ...props 
}) => (
  <div className={twMerge("space-y-1.5", containerClassName)}>
    {label && (
      <label className="block text-sm font-medium text-slate-700">{label}</label>
    )}
    <div className="relative">
      {Icon && (
        <Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      )}
      <input
        className={twMerge(
          "w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900",
          "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all",
          "placeholder:text-slate-400",
          Icon && "pl-10",
          error && "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500",
          className
        )}
        {...props}
      />
    </div>
    {error && <p className="text-sm text-rose-600">{error}</p>}
  </div>
);

// =============================================================================
// SELECT
// =============================================================================

export const Select = ({ label, options, className = "", ...props }) => (
  <div className="space-y-1.5">
    {label && (
      <label className="block text-sm font-medium text-slate-700">{label}</label>
    )}
    <select
      className={twMerge(
        "w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900",
        "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all",
        className
      )}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

// =============================================================================
// MODAL
// =============================================================================

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <Card className={twMerge("relative w-full p-6 animate-in fade-in zoom-in-95 duration-200", sizes[size])}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
        {title && (
          <h3 className="text-xl font-bold text-slate-900 mb-6 pr-8">{title}</h3>
        )}
        {children}
      </Card>
    </div>
  );
};

// =============================================================================
// STAT CARD
// =============================================================================

export const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = 'blue' }) => {
  const colors = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-500/20' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-500/20' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-500/20' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-500/20' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', ring: 'ring-purple-500/20' },
    cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', ring: 'ring-cyan-500/20' },
  };
  
  const c = colors[color] || colors.blue;
  
  return (
    <Card className="p-5" hover>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <p className={`text-sm font-medium mt-2 ${trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
            </p>
          )}
        </div>
        <div className={twMerge("p-3 rounded-xl ring-4", c.bg, c.ring)}>
          <Icon size={24} className={c.text} />
        </div>
      </div>
    </Card>
  );
};

// =============================================================================
// TABLE
// =============================================================================

export const Table = ({ columns, data, onRowClick, emptyMessage = "No data found" }) => (
  <Card className="overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50/80 text-slate-600 font-medium border-b border-slate-200">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className={twMerge("px-6 py-4", col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12 text-slate-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr 
                key={rowIdx} 
                className={twMerge(
                  "hover:bg-slate-50/60 transition-colors",
                  onRowClick && "cursor-pointer"
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={twMerge("px-6 py-4", col.cellClassName)}>
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </Card>
);

// =============================================================================
// TOAST NOTIFICATION
// =============================================================================

export const Toast = ({ message, type = 'success', onClose }) => {
  const types = {
    success: { bg: 'bg-emerald-600', icon: '✓' },
    error: { bg: 'bg-rose-600', icon: '✕' },
    warning: { bg: 'bg-amber-600', icon: '!' },
    info: { bg: 'bg-blue-600', icon: 'i' },
  };
  
  const t = types[type] || types.success;
  
  return (
    <div className={twMerge(
      "fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl text-white shadow-xl",
      "animate-in slide-in-from-right duration-300",
      t.bg
    )}>
      <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
        {t.icon}
      </span>
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 p-1 hover:bg-white/20 rounded">
        <X size={16} />
      </button>
    </div>
  );
};

// =============================================================================
// LOADING SPINNER
// =============================================================================

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };
  
  return (
    <div className={twMerge("flex items-center justify-center", className)}>
      <div className={twMerge(
        "border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin",
        sizes[size]
      )} />
    </div>
  );
};

// =============================================================================
// EMPTY STATE
// =============================================================================

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="text-center py-12 px-4">
    {Icon && (
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
        <Icon size={32} className="text-slate-400" />
      </div>
    )}
    <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
    {description && (
      <p className="text-slate-500 mb-4 max-w-md mx-auto">{description}</p>
    )}
    {action}
  </div>
);

// =============================================================================
// ICON BUTTON
// =============================================================================

export const IconButton = ({ icon: Icon, onClick, color = 'slate', title, size = 'md', className = '' }) => {
  const colors = {
    slate: 'text-slate-400 hover:text-slate-600 hover:bg-slate-100',
    blue: 'text-blue-500 hover:text-blue-600 hover:bg-blue-50',
    emerald: 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50',
    amber: 'text-amber-500 hover:text-amber-600 hover:bg-amber-50',
    rose: 'text-rose-500 hover:text-rose-600 hover:bg-rose-50',
    cyan: 'text-cyan-500 hover:text-cyan-600 hover:bg-cyan-50',
  };
  
  const sizes = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };
  
  return (
    <button
      onClick={onClick}
      title={title}
      className={twMerge(
        "rounded-lg transition-all duration-200",
        colors[color],
        sizes[size],
        className
      )}
    >
      <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
    </button>
  );
};
