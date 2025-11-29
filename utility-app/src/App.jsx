// =============================================================================
// UTILITY MANAGEMENT SYSTEM (UMS) - Main Application
// =============================================================================

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, ClipboardList, CreditCard, TrendingUp, Zap, 
  Droplets, Flame, ArrowRight, Shield, BarChart3, Users
} from 'lucide-react';
import { DashboardLayout } from './components/Layout';
import { AdminDashboard, FieldOfficerDashboard, CashierDashboard, ManagerDashboard } from './components/Dashboards';
import { Toast, LoadingSpinner } from './components/UI';
import * as api from './utils/api';

// =============================================================================
// MAIN APP COMPONENT
// =============================================================================

export default function App() {
  // State
  const [user, setUser] = useState(null);
  const [db, setDb] = useState({ 
    customers: [], meters: [], readings: [], bills: [], 
    payments: [], tariffs: [], complaints: [] 
  });
  const [notification, setNotification] = useState(null);
  const [currentView, setCurrentView] = useState('Overview');
  const [isLoading, setIsLoading] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // ==========================================================================
  // DATA FETCHING
  // ==========================================================================

  const fetchData = async () => {
    try {
      const data = await api.fetchInitialData();
      if (data) {
        setDb(data);
        console.log('✅ Data loaded from server:', data);
      }
    } catch (err) {
      console.warn('⚠️ Running in offline mode:', err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Mouse tracking for parallax effect on login screen
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };

    if (!user) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [user]);

  // ==========================================================================
  // TOAST NOTIFICATIONS
  // ==========================================================================

  const showToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // ==========================================================================
  // ACTION HANDLERS
  // ==========================================================================

  const actions = {
    addCustomer: async (customer) => {
      try {
        setIsLoading(true);
        await api.addCustomer(customer);
        await fetchData();
        showToast('Customer created successfully');
      } catch (error) {
        showToast('Failed to add customer', 'error');
      } finally {
        setIsLoading(false);
      }
    },

    updateCustomer: async (customer) => {
      try {
        await api.updateCustomer(customer.id, customer);
        await fetchData();
        showToast('Customer updated successfully');
      } catch (error) {
        showToast('Failed to update customer', 'error');
      }
    },

    removeCustomer: async (customerId) => {
      try {
        await api.deleteCustomer(customerId);
        await fetchData();
        showToast('Customer removed');
      } catch (error) {
        showToast('Failed to remove customer', 'error');
      }
    },

    addMeter: async (meter) => {
      try {
        await api.addMeter(meter);
        await fetchData();
        showToast('Meter installed successfully');
      } catch (error) {
        showToast('Failed to add meter', 'error');
      }
    },

    removeMeter: async (meterId) => {
      try {
        await api.deleteMeter(meterId);
        await fetchData();
        showToast('Meter removed');
      } catch (error) {
        // Local fallback
        setDb(prev => ({
          ...prev,
          meters: prev.meters.filter(m => m.id !== meterId)
        }));
        showToast('Meter removed');
      }
    },

    updateTariff: async (tariff) => {
      try {
        await api.updateTariff(tariff.id, tariff);
        await fetchData();
        showToast('Tariff updated successfully');
      } catch (error) {
        showToast('Failed to update tariff', 'error');
      }
    },

    submitReading: async (meterId, currentReading) => {
      try {
        setIsLoading(true);
        const result = await api.submitReading(meterId, currentReading);
        await fetchData();
        showToast(`Bill generated: LKR ${result.amount?.toFixed(2) || 'N/A'}`);
      } catch (error) {
        showToast('Failed to submit reading', 'error');
      } finally {
        setIsLoading(false);
      }
    },

    payBill: async (billId, paymentMethod = 'Cash') => {
      try {
        setIsLoading(true);
        const bill = db.bills.find(b => b.id === billId);
        if (!bill) throw new Error('Bill not found');
        
        const amount = bill.amount - (bill.paidAmount || 0);
        await api.processPayment(billId, amount, paymentMethod);
        await fetchData();
        showToast('Payment processed successfully');
      } catch (error) {
        showToast('Failed to process payment', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // ==========================================================================
  // LOGIN SCREEN
  // ==========================================================================

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Gradient Orbs */}
          <div 
            className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-3xl"
            style={{ 
              background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)',
              top: '10%',
              left: '10%',
              transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)`
            }}
          />
          <div 
            className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
            style={{ 
              background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)',
              bottom: '10%',
              right: '10%',
              transform: `translate(${mousePos.x * -40}px, ${mousePos.y * -40}px)`
            }}
          />
          <div 
            className="absolute w-[400px] h-[400px] rounded-full opacity-15 blur-3xl"
            style={{ 
              background: 'radial-gradient(circle, #06B6D4 0%, transparent 70%)',
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)`
            }}
          />

          {/* Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{ 
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
              transform: `translate(${mousePos.x * 10}px, ${mousePos.y * 10}px)`
            }}
          />

          {/* Floating Icons */}
          <div 
            className="absolute text-amber-500/10"
            style={{ 
              top: '15%', left: '20%',
              transform: `translate(${mousePos.x * 60}px, ${mousePos.y * 60}px) rotate(${mousePos.x * 10}deg)`
            }}
          >
            <Zap size={140} strokeWidth={1} />
          </div>
          <div 
            className="absolute text-cyan-500/10"
            style={{ 
              top: '60%', left: '10%',
              transform: `translate(${mousePos.x * 50}px, ${mousePos.y * 50}px)`
            }}
          >
            <Droplets size={120} strokeWidth={1} />
          </div>
          <div 
            className="absolute text-rose-500/10"
            style={{ 
              top: '25%', right: '15%',
              transform: `translate(${mousePos.x * 70}px, ${mousePos.y * 70}px)`
            }}
          >
            <Flame size={130} strokeWidth={1} />
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 w-full max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            
            {/* Left: Brand Section */}
            <div className="text-center md:text-left p-8">
              {/* Logo */}
              <div className="inline-flex items-center gap-3 mb-8">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/30">
                    <Zap size={28} className="text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white tracking-tight">UMS Portal</h1>
                  <p className="text-slate-500 text-sm">Utility Management System</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-md">
                Next-generation utility management platform for electricity, water, and gas services.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-8">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
                  <Zap size={16} className="text-amber-400" />
                  <span className="text-amber-300 text-sm font-medium">Electricity</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                  <Droplets size={16} className="text-cyan-400" />
                  <span className="text-cyan-300 text-sm font-medium">Water</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20">
                  <Flame size={16} className="text-rose-400" />
                  <span className="text-rose-300 text-sm font-medium">Gas</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 max-w-md">
                <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-2xl font-bold text-white">{db.customers.length || '50K+'}</p>
                  <p className="text-xs text-slate-500">Customers</p>
                </div>
                <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-2xl font-bold text-white">{db.meters.length || '120K+'}</p>
                  <p className="text-xs text-slate-500">Meters</p>
                </div>
                <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-2xl font-bold text-white">99.9%</p>
                  <p className="text-xs text-slate-500">Uptime</p>
                </div>
              </div>
            </div>

            {/* Right: Login Cards */}
            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 shadow-2xl">
              <div className="flex items-center gap-2 mb-6">
                <Shield size={20} className="text-blue-400" />
                <h2 className="text-xl font-bold text-white">Select Portal</h2>
              </div>
              
              <div className="space-y-3">
                {[
                  { 
                    role: 'admin', 
                    name: 'Administrator', 
                    icon: LayoutDashboard,
                    desc: 'System Configuration & Management',
                    gradient: 'from-blue-600 to-indigo-600',
                    shadowColor: 'shadow-blue-500/30'
                  },
                  { 
                    role: 'officer', 
                    name: 'Field Officer', 
                    icon: ClipboardList,
                    desc: 'Meter Readings & Inspections',
                    gradient: 'from-emerald-600 to-teal-600',
                    shadowColor: 'shadow-emerald-500/30'
                  },
                  { 
                    role: 'cashier', 
                    name: 'Cashier', 
                    icon: CreditCard,
                    desc: 'Payments & Billing',
                    gradient: 'from-purple-600 to-pink-600',
                    shadowColor: 'shadow-purple-500/30'
                  },
                  { 
                    role: 'manager', 
                    name: 'Manager', 
                    icon: TrendingUp,
                    desc: 'Reports & Analytics',
                    gradient: 'from-amber-600 to-orange-600',
                    shadowColor: 'shadow-amber-500/30'
                  }
                ].map((u, i) => (
                  <button 
                    key={u.role}
                    onClick={() => { 
                      setUser({ role: u.role, name: u.name }); 
                      setCurrentView('Overview'); 
                    }}
                    className={`
                      group w-full p-4 rounded-2xl bg-white/5 border border-white/10
                      hover:bg-gradient-to-r hover:${u.gradient} hover:border-transparent
                      hover:shadow-xl hover:${u.shadowColor}
                      hover:-translate-y-0.5 hover:scale-[1.02]
                      transition-all duration-300 ease-out text-left
                    `}
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`
                        w-12 h-12 rounded-xl bg-gradient-to-br ${u.gradient}
                        flex items-center justify-center text-white shadow-lg ${u.shadowColor}
                        group-hover:scale-110 transition-transform duration-300
                      `}>
                        <u.icon size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white group-hover:text-white text-lg">
                          {u.name}
                        </h3>
                        <p className="text-sm text-slate-400 group-hover:text-white/80">
                          {u.desc}
                        </p>
                      </div>
                      <ArrowRight 
                        size={20} 
                        className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" 
                      />
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-white/10 text-center">
                <p className="text-xs text-slate-500">
                  © 2024 UMS Portal • Version 2.0
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // MAIN APPLICATION
  // ==========================================================================

  return (
    <DashboardLayout 
      user={user} 
      onLogout={() => setUser(null)}
      currentView={currentView}
      onViewChange={setCurrentView}
    >
      {/* Toast Notifications */}
      {notification && (
        <Toast 
          message={notification.msg} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
            <LoadingSpinner size="lg" />
            <p className="text-slate-600 font-medium">Processing...</p>
          </div>
        </div>
      )}

      {/* Role-based Dashboard */}
      {user.role === 'admin' && (
        <AdminDashboard db={db} actions={actions} currentView={currentView} />
      )}
      {user.role === 'officer' && (
        <FieldOfficerDashboard db={db} actions={actions} currentView={currentView} />
      )}
      {user.role === 'cashier' && (
        <CashierDashboard db={db} actions={actions} currentView={currentView} />
      )}
      {user.role === 'manager' && (
        <ManagerDashboard db={db} currentView={currentView} />
      )}
    </DashboardLayout>
  );
}
