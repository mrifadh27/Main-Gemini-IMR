// =============================================================================
// UMS LAYOUT COMPONENT
// =============================================================================

import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, FileText, ClipboardList, CreditCard, 
  TrendingUp, LogOut, Zap, Menu, X, History, Receipt, 
  AlertTriangle, MessageSquare, Gauge, Bell, Settings,
  Droplets, Flame, ChevronDown
} from 'lucide-react';
import { NAV_ITEMS } from '../utils/constants';

// Icon mapping
const iconMap = {
  LayoutDashboard, Users, FileText, ClipboardList, CreditCard,
  TrendingUp, History, Receipt, AlertTriangle, MessageSquare, Gauge
};

export const DashboardLayout = ({ children, user, onLogout, currentView, onViewChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const navItems = NAV_ITEMS[user.role] || NAV_ITEMS.admin;

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative z-30 w-72 h-full flex flex-col
        bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950
        transition-transform duration-300 ease-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Zap size={22} className="text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
            </div>
            <div>
              <h1 className="font-bold text-white text-lg tracking-tight">UMS Portal</h1>
              <p className="text-xs text-slate-500">Utility Management</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Main Menu
          </p>
          {navItems.map((item, idx) => {
            const Icon = iconMap[item.icon] || LayoutDashboard;
            const isActive = currentView === item.label || (!currentView && idx === 0);
            
            return (
              <button 
                key={idx}
                onClick={() => {
                  onViewChange?.(item.label);
                  setIsMobileMenuOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-200 group
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }
                `}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'group-hover:text-blue-400'} />
                <span>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Utility Shortcuts */}
        <div className="p-4 border-t border-white/5">
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Quick Stats
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-amber-500/10 rounded-xl p-3 text-center">
              <Zap size={18} className="text-amber-500 mx-auto mb-1" />
              <p className="text-xs text-slate-400">Elec</p>
            </div>
            <div className="bg-cyan-500/10 rounded-xl p-3 text-center">
              <Droplets size={18} className="text-cyan-500 mx-auto mb-1" />
              <p className="text-xs text-slate-400">Water</p>
            </div>
            <div className="bg-rose-500/10 rounded-xl p-3 text-center">
              <Flame size={18} className="text-rose-500 mx-auto mb-1" />
              <p className="text-xs text-slate-400">Gas</p>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 mb-4 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/30">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-500 capitalize flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {user.role}
              </p>
            </div>
            <ChevronDown size={16} className="text-slate-500" />
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-rose-500/10 transition-all text-sm font-medium group"
          >
            <LogOut size={16} className="group-hover:text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 h-16 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div>
              <h2 className="font-bold text-slate-900 capitalize">{user.role} Dashboard</h2>
              <p className="text-xs text-slate-500">Welcome back, {user.name.split(' ')[0]}!</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50">
                  <h4 className="font-semibold text-slate-900 mb-3">Notifications</h4>
                  <div className="space-y-3">
                    <div className="flex gap-3 p-3 bg-amber-50 rounded-xl">
                      <AlertTriangle size={18} className="text-amber-500 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-slate-800">5 Overdue Bills</p>
                        <p className="text-xs text-slate-500">Require immediate attention</p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
                      <Users size={18} className="text-blue-500 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-slate-800">New Customer Registered</p>
                        <p className="text-xs text-slate-500">2 minutes ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Settings */}
            <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
              <Settings size={20} />
            </button>
            
            {/* Status */}
            <div className="hidden sm:flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-700">Online</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
