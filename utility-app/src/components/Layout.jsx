import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, FileText, ClipboardList, 
  CreditCard, TrendingUp, LogOut, Zap, Menu 
} from 'lucide-react';

const navItems = {
  admin: [{ label: 'Overview', icon: LayoutDashboard }, { label: 'Customers', icon: Users }, { label: 'Tariffs', icon: FileText }],
  officer: [{ label: 'My Tasks', icon: ClipboardList }, { label: 'History', icon: FileText }],
  cashier: [{ label: 'Billing', icon: CreditCard }, { label: 'Transactions', icon: FileText }],
  manager: [{ label: 'Analytics', icon: TrendingUp }, { label: 'Reports', icon: FileText }],
};

export const DashboardLayout = ({ children, user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
         <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed md:relative z-30 w-64 bg-slate-900 h-full flex flex-col text-white transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
           <div className="bg-blue-600 p-1.5 rounded-lg"><Zap size={20} /></div>
           <span className="font-bold text-lg tracking-tight">UMS Portal</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems[user.role].map((item, idx) => (
            <button key={idx} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${idx === 0 ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role}</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center gap-2 text-slate-400 hover:text-white text-sm px-2">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-500" onClick={() => setIsMobileMenuOpen(true)}><Menu /></button>
            <h2 className="font-semibold text-slate-800 capitalize">{user.role} Dashboard</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-slate-100 px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              System Operational
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};