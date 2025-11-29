// =============================================================================
// UMS CONSTANTS AND CONFIGURATION
// =============================================================================

export const API_BASE_URL = 'http://localhost:5000/api';

export const UTILITY_TYPES = {
  ELEC: { 
    id: 1, 
    name: 'Electricity', 
    unit: 'kWh', 
    color: 'text-amber-500', 
    bg: 'bg-amber-50', 
    border: 'border-amber-200',
    gradient: 'from-amber-500 to-orange-600',
    icon: 'Zap'
  },
  WATER: { 
    id: 2, 
    name: 'Water', 
    unit: 'm³', 
    color: 'text-cyan-500', 
    bg: 'bg-cyan-50', 
    border: 'border-cyan-200',
    gradient: 'from-cyan-500 to-blue-600',
    icon: 'Droplets'
  },
  GAS: { 
    id: 3, 
    name: 'Gas', 
    unit: 'units', 
    color: 'text-rose-500', 
    bg: 'bg-rose-50', 
    border: 'border-rose-200',
    gradient: 'from-rose-500 to-red-600',
    icon: 'Flame'
  },
};

export const CUSTOMER_TYPES = {
  1: { name: 'Household', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  2: { name: 'Business', color: 'text-purple-600', bg: 'bg-purple-50' },
  3: { name: 'Government', color: 'text-blue-600', bg: 'bg-blue-50' },
};

export const BILL_STATUS = {
  Paid: { color: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-200' },
  Unpaid: { color: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-200' },
  Overdue: { color: 'text-rose-700', bg: 'bg-rose-100', border: 'border-rose-200' },
  Partial: { color: 'text-sky-700', bg: 'bg-sky-100', border: 'border-sky-200' },
  Cancelled: { color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-200' },
};

export const COMPLAINT_PRIORITY = {
  Low: { color: 'text-slate-600', bg: 'bg-slate-100' },
  Medium: { color: 'text-amber-600', bg: 'bg-amber-100' },
  High: { color: 'text-orange-600', bg: 'bg-orange-100' },
  Critical: { color: 'text-rose-600', bg: 'bg-rose-100' },
};

export const COMPLAINT_STATUS = {
  Open: { color: 'text-blue-600', bg: 'bg-blue-100' },
  'In Progress': { color: 'text-amber-600', bg: 'bg-amber-100' },
  Resolved: { color: 'text-emerald-600', bg: 'bg-emerald-100' },
  Closed: { color: 'text-slate-600', bg: 'bg-slate-100' },
};

export const NAV_ITEMS = {
  admin: [
    { label: 'Overview', icon: 'LayoutDashboard' },
    { label: 'Customers', icon: 'Users' },
    { label: 'Meters', icon: 'Gauge' },
    { label: 'Tariffs', icon: 'FileText' },
    { label: 'Complaints', icon: 'MessageSquare' },
  ],
  officer: [
    { label: 'My Tasks', icon: 'ClipboardList' },
    { label: 'History', icon: 'History' },
  ],
  cashier: [
    { label: 'Billing', icon: 'CreditCard' },
    { label: 'Transactions', icon: 'Receipt' },
  ],
  manager: [
    { label: 'Analytics', icon: 'TrendingUp' },
    { label: 'Reports', icon: 'FileText' },
    { label: 'Defaulters', icon: 'AlertTriangle' },
  ],
};

export const CHART_COLORS = {
  electricity: '#F59E0B',
  water: '#06B6D4',
  gas: '#EF4444',
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
};

