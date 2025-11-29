import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, ClipboardList, CreditCard, TrendingUp, Zap, AlertTriangle, 
  CheckCircle, Users, FileText, Plus, Search, Droplets, Flame, LogOut, Menu, 
  Trash2, History, Clock, Receipt, BarChart3, Pencil, X, FilePlus, ArrowRight
} from 'lucide-react';
import { 
  LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { twMerge } from 'tailwind-merge';

// --- 1. UTILS ---

const UTILITY_TYPES = {
  ELEC: { id: 1, name: 'Electricity', unit: 'kWh', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  WATER: { id: 2, name: 'Water', unit: 'm³', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  GAS: { id: 3, name: 'Gas', unit: 'units', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
};

// --- 2. UI COMPONENTS ---

const Card = ({ children, className = "" }) => (
  <div className={twMerge("bg-white rounded-xl shadow-sm border border-slate-200", className)}>
    {children}
  </div>
);

const Badge = ({ children, type = 'default', className, ...props }) => {
  const styles = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-rose-100 text-rose-700',
    primary: 'bg-blue-100 text-blue-700',
  };
  return (
    <span 
      className={twMerge(`px-2.5 py-0.5 rounded-full text-xs font-medium border border-transparent select-none transition-all`, styles[type] || styles.default, className)}
      {...props}
    >
      {children}
    </span>
  );
};

const Button = ({ children, onClick, variant = 'primary', className = "", disabled = false }) => {
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

// --- 3. DASHBOARD COMPONENTS ---

const AdminDashboard = ({ db, actions, currentView }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', address: '', phone: '' });
  
  // Edit States
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editingTariff, setEditingTariff] = useState(null);
  const [usageModalCustomer, setUsageModalCustomer] = useState(null);
  const [usageForm, setUsageForm] = useState({ meterId: '', reading: '' });

  const OverviewView = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-5 flex items-center gap-4">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Users /></div>
        <div><p className="text-sm text-slate-500">Total Customers</p><p className="text-2xl font-bold text-slate-800">{db.customers.length}</p></div>
      </Card>
      <Card className="p-5 flex items-center gap-4">
        <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg"><Zap /></div>
        <div><p className="text-sm text-slate-500">Active Meters</p><p className="text-2xl font-bold text-slate-800">{db.meters.length}</p></div>
      </Card>
      <Card className="p-5 flex items-center gap-4">
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><FileText /></div>
        <div><p className="text-sm text-slate-500">Bills Generated</p><p className="text-2xl font-bold text-slate-800">{db.bills.length}</p></div>
      </Card>
    </div>
  );

  const CustomersView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800">Customer Database</h3>
        <Button onClick={() => setShowAddModal(true)}><Plus size={16} className="inline mr-2" /> New Customer</Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Address</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Meters</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {db.customers.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400">No customers found. Add one to get started!</td>
                </tr>
              )}
              {db.customers.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 group">
                  <td className="px-6 py-4 font-mono text-slate-500">{c.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{c.name}</td>
                  <td className="px-6 py-4 text-slate-600">{c.address}</td>
                  <td className="px-6 py-4 text-slate-600">{c.phone}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {db.meters.filter(m => m.customerId === c.id).map(m => {
                         const util = Object.values(UTILITY_TYPES).find(u => u.id === m.typeId);
                         return (
                           <Badge 
                             key={m.id} 
                             type="default"
                             title="Double click to remove"
                             className={`cursor-pointer hover:scale-105 ${util?.bg} ${util?.color} ${util?.border}`}
                             onDoubleClick={() => {
                               if(window.confirm(`Remove ${util?.name} meter for ${c.name}?`)) {
                                 actions.removeMeter(m.id);
                               }
                             }}
                           >
                             {util?.name}
                           </Badge>
                         )
                      })}
                      {db.meters.filter(m => m.customerId === c.id).length === 0 && <span className="text-slate-300 text-xs italic">No meters</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end items-center gap-2 opacity-100">
                      <button title="Add Electricity Meter" onClick={() => actions.addMeter({ id: `M-E-${Date.now()}`, customerId: c.id, typeId: 1, lastReading: 0, status: 'Active' })} className="p-2 bg-yellow-50 text-yellow-600 rounded-full hover:bg-yellow-100 border border-yellow-200 transition-colors"><Zap size={14} /></button>
                      <button title="Add Water Meter" onClick={() => actions.addMeter({ id: `M-W-${Date.now()}`, customerId: c.id, typeId: 2, lastReading: 0, status: 'Active' })} className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 border border-blue-200 transition-colors"><Droplets size={14} /></button>
                      <button title="Add Gas Meter" onClick={() => actions.addMeter({ id: `M-G-${Date.now()}`, customerId: c.id, typeId: 3, lastReading: 0, status: 'Active' })} className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 border border-red-200 transition-colors"><Flame size={14} /></button>
                      <div className="w-px h-4 bg-slate-300 mx-1"></div>
                      
                      <button title="Add Usage" onClick={() => { 
                          const customerMeters = db.meters.filter(m => m.customerId === c.id);
                          if (customerMeters.length === 0) { alert("No meters installed!"); return; }
                          setUsageModalCustomer(c);
                          setUsageForm({ meterId: customerMeters[0].id, reading: '' });
                        }} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                        <FilePlus size={16} />
                      </button>

                      <button title="Edit Customer" onClick={() => setEditingCustomer(c)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Pencil size={16} />
                      </button>

                      <button title="Remove Customer" onClick={() => { if(window.confirm(`Delete ${c.name}?`)) { actions.removeCustomer(c.id); } }} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const TariffsView = () => (
    <div className="space-y-6">
       <div className="flex items-center justify-between"><h3 className="text-lg font-bold text-slate-800">Tariff Configuration</h3></div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Utility Type</th>
                <th className="px-6 py-4">Rate Per Unit</th>
                <th className="px-6 py-4">Fixed Charge</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {db.tariffs.map(t => {
                const util = Object.values(UTILITY_TYPES).find(u => u.id === t.typeId);
                return (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono text-slate-500">T00{t.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{t.name}</td>
                    <td className="px-6 py-4"><Badge className={`${util?.bg} ${util?.color} ${util?.border}`}>{util?.name || 'Unknown'}</Badge></td>
                    <td className="px-6 py-4 font-mono">LKR {t.rate.toFixed(2)} / {util?.unit}</td>
                    <td className="px-6 py-4 font-mono">LKR {t.fixed.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <button title="Edit Tariff" onClick={() => setEditingTariff(t)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Pencil size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {currentView === 'Overview' && <OverviewView />}
      {currentView === 'Customers' && <CustomersView />}
      {currentView === 'Tariffs' && <TariffsView />}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Add New Customer</h3>
            <div className="space-y-4">
              <input className="w-full border p-2 rounded" placeholder="Full Name" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} />
              <input className="w-full border p-2 rounded" placeholder="Address" value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} />
              <input className="w-full border p-2 rounded" placeholder="Phone" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} />
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button onClick={() => { 
                  actions.addCustomer(newCustomer); 
                  setShowAddModal(false); 
                  setNewCustomer({ name: '', address: '', phone: '' }); // Clear form
                }}>Create</Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 relative">
            <button onClick={() => setEditingCustomer(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20}/></button>
            <h3 className="text-lg font-bold mb-4">Edit Customer: {editingCustomer.id}</h3>
            <div className="space-y-4">
              <input className="w-full border p-2 rounded mt-1" value={editingCustomer.name} onChange={e => setEditingCustomer({...editingCustomer, name: e.target.value})} />
              <input className="w-full border p-2 rounded mt-1" value={editingCustomer.address} onChange={e => setEditingCustomer({...editingCustomer, address: e.target.value})} />
              <input className="w-full border p-2 rounded mt-1" value={editingCustomer.phone} onChange={e => setEditingCustomer({...editingCustomer, phone: e.target.value})} />
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="secondary" onClick={() => setEditingCustomer(null)}>Cancel</Button>
                <Button onClick={() => { actions.updateCustomer(editingCustomer); setEditingCustomer(null); }}>Save Changes</Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Add Usage Modal */}
      {usageModalCustomer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 relative">
            <button onClick={() => setUsageModalCustomer(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20}/></button>
            <h3 className="text-lg font-bold mb-4">Add Usage: {usageModalCustomer.name}</h3>
            <div className="space-y-4">
              <select className="w-full border p-2 rounded mt-1 bg-white" value={usageForm.meterId} onChange={(e) => setUsageForm({...usageForm, meterId: e.target.value})}>
                {db.meters.filter(m => m.customerId === usageModalCustomer.id).map(m => {
                  const util = Object.values(UTILITY_TYPES).find(u => u.id === m.typeId);
                  return <option key={m.id} value={m.id}>{util?.name} ({m.id})</option>
                })}
              </select>
              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <p className="text-xs text-slate-500 uppercase">Previous Reading</p>
                <p className="text-xl font-mono font-bold text-slate-700">{db.meters.find(m => m.id === usageForm.meterId)?.lastReading || 0}</p>
              </div>
              <input type="number" className="w-full border p-2 rounded mt-1 text-lg font-mono" placeholder="0.00" value={usageForm.reading} onChange={e => setUsageForm({...usageForm, reading: e.target.value})} />
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="secondary" onClick={() => setUsageModalCustomer(null)}>Cancel</Button>
                <Button disabled={!usageForm.reading || parseFloat(usageForm.reading) < (db.meters.find(m => m.id === usageForm.meterId)?.lastReading || 0)} onClick={() => { actions.submitReading(usageForm.meterId, usageForm.reading); setUsageModalCustomer(null); }}>Generate Bill</Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Tariff Modal */}
      {editingTariff && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 relative">
            <button onClick={() => setEditingTariff(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20}/></button>
            <h3 className="text-lg font-bold mb-4">Edit Tariff</h3>
            <div className="space-y-4">
              <input className="w-full border p-2 rounded mt-1" value={editingTariff.name} onChange={e => setEditingTariff({...editingTariff, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" step="0.01" className="w-full border p-2 rounded mt-1" value={editingTariff.rate} onChange={e => setEditingTariff({...editingTariff, rate: parseFloat(e.target.value)})} />
                <input type="number" step="0.01" className="w-full border p-2 rounded mt-1" value={editingTariff.fixed} onChange={e => setEditingTariff({...editingTariff, fixed: parseFloat(e.target.value)})} />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="secondary" onClick={() => setEditingTariff(null)}>Cancel</Button>
                <Button onClick={() => { actions.updateTariff(editingTariff); setEditingTariff(null); }}>Update Tariff</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

const FieldOfficerDashboard = ({ db, actions, currentView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMeter, setSelectedMeter] = useState(null);
  const [readingInput, setReadingInput] = useState('');

  const filteredMeters = db.meters.filter(m => {
    const customer = db.customers.find(c => c.id === m.customerId);
    return m.id.toLowerCase().includes(searchTerm.toLowerCase()) || customer?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const MyTasksView = () => (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-3 text-slate-400" size={20} />
        <input type="text" placeholder="Search Meter ID or Customer..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      {!selectedMeter ? (
        <div className="space-y-4">
          {filteredMeters.length === 0 && <div className="text-center text-slate-400 py-8">No active meters found.</div>}
          {filteredMeters.map(m => {
            const customer = db.customers.find(c => c.id === m.customerId);
            const util = Object.values(UTILITY_TYPES).find(u => u.id === m.typeId);
            return (
              <Card key={m.id} className="p-4 cursor-pointer hover:border-blue-400" onClick={() => { setSelectedMeter(m); setReadingInput(''); }}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-800">{customer?.name}</h4>
                    <p className="text-sm text-slate-500">{customer?.address}</p>
                    <div className="mt-2 inline-block px-2 py-1 bg-slate-100 rounded text-xs font-mono">{m.id}</div>
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${util?.bg}`}>
                    {util?.id === 1 ? <Zap size={20} className={util.color} /> : util?.id === 2 ? <Droplets size={20} className={util.color} /> : <Flame size={20} className={util?.color} />}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="p-6">
          <button onClick={() => setSelectedMeter(null)} className="text-sm text-slate-500 mb-4">← Back</button>
          <h3 className="text-xl font-bold text-slate-900 mb-1">Enter Reading</h3>
          <div className="bg-slate-50 p-4 rounded-lg mb-6 border border-slate-200">
            <p className="text-xs uppercase text-slate-400 font-bold">Previous</p>
            <p className="text-2xl font-mono text-slate-700">{selectedMeter.lastReading}</p>
          </div>
          <input type="number" className="w-full text-3xl font-mono p-4 border rounded-lg mb-4" placeholder="0000.00" value={readingInput} onChange={e => setReadingInput(e.target.value)} />
          <Button className="w-full py-3" disabled={!readingInput || parseFloat(readingInput) < selectedMeter.lastReading} onClick={() => { actions.submitReading(selectedMeter.id, readingInput); setSelectedMeter(null); }}>Submit Reading</Button>
        </Card>
      )}
    </div>
  );

  const HistoryView = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Clock className="text-slate-500" /> Reading History</h3>
      {db.readings.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <History className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500">No readings submitted yet.</p>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Meter ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Reading</th>
                <th className="px-6 py-4">Consumption</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {db.readings.map((r) => {
                 const meter = db.meters.find(m => m.id === r.meterId);
                 const customer = db.customers.find(c => c.id === meter?.customerId);
                 const util = Object.values(UTILITY_TYPES).find(u => u.id === meter?.typeId);
                 return (
                   <tr key={r.id} className="hover:bg-slate-50">
                     <td className="px-6 py-4 text-slate-500">{new Date(r.date).toLocaleDateString()} <span className="text-xs text-slate-400">{new Date(r.date).toLocaleTimeString()}</span></td>
                     <td className="px-6 py-4 font-mono"><Badge className={`${util?.bg} ${util?.color} border-none`}>{r.meterId}</Badge></td>
                     <td className="px-6 py-4 font-medium">{customer?.name}</td>
                     <td className="px-6 py-4 font-mono">{r.value}</td>
                     <td className="px-6 py-4 font-bold text-slate-700">+{r.consumption} <span className="text-xs font-normal text-slate-400">{util?.unit}</span></td>
                   </tr>
                 );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {(currentView === 'My Tasks' || currentView === 'Overview') && <MyTasksView />}
      {currentView === 'History' && <HistoryView />}
    </div>
  );
};

const CashierDashboard = ({ db, actions, currentView }) => {
  const unpaidBills = db.bills.filter(b => b.status === 'Unpaid');

  const BillingView = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-800">Pending Bills</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {unpaidBills.map(bill => {
          const customer = db.customers.find(c => c.id === bill.customerId);
          return (
            <Card key={bill.id} className="p-5 border-l-4 border-l-rose-500">
              <div className="flex justify-between mb-4">
                <div><h4 className="font-bold">{customer?.name}</h4><p className="text-xs text-slate-500">#{bill.id}</p></div>
                <Badge type="danger">Unpaid</Badge>
              </div>
              <div className="pt-2 border-t flex justify-between items-end mb-4">
                <span className="font-bold">Total Due</span>
                <span className="text-2xl font-bold">LKR {bill.amount.toFixed(2)}</span>
              </div>
              <Button className="w-full" onClick={() => actions.payBill(bill.id)}><CreditCard size={16} className="mr-2 inline" /> Process Payment</Button>
            </Card>
          );
        })}
        {unpaidBills.length === 0 && (
          <div className="col-span-3 text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No pending bills found. Great job!</p>
          </div>
        )}
      </div>
    </div>
  );

  const TransactionsView = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Receipt className="text-slate-500" /> Transaction History</h3>
      <Card className="overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Payment ID</th>
              <th className="px-6 py-4">Bill ID</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Amount</th>
              <th className="px-6 py-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {db.payments.length === 0 && (
               <tr><td colSpan="6" className="text-center py-8 text-slate-400">No payments recorded yet.</td></tr>
            )}
            {db.payments.map(p => {
              const bill = db.bills.find(b => b.id === p.billId);
              const customer = db.customers.find(c => c.id === bill?.customerId);
              return (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-mono text-slate-500">{p.id}</td>
                  <td className="px-6 py-4 font-mono text-slate-500">{p.billId}</td>
                  <td className="px-6 py-4 font-medium">{customer?.name}</td>
                  <td className="px-6 py-4 text-slate-500">{new Date(p.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right font-bold text-slate-800">LKR {p.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center"><Badge type="success">Completed</Badge></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {(currentView === 'Billing' || currentView === 'Overview') && <BillingView />}
      {currentView === 'Transactions' && <TransactionsView />}
    </div>
  );
};

const ManagerDashboard = ({ db, currentView }) => {
  const revenueData = db.bills.reduce((acc, bill) => {
    const date = new Date(bill.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const existing = acc.find(d => d.name === date);
    if (existing) existing.amount += bill.amount; else acc.push({ name: date, amount: bill.amount });
    return acc;
  }, []).slice(-7);

  const usageByType = [
    { name: 'Electricity', value: db.meters.filter(m => m.typeId === 1).reduce((acc, m) => acc + m.lastReading, 0) },
    { name: 'Water', value: db.meters.filter(m => m.typeId === 2).reduce((acc, m) => acc + m.lastReading, 0) },
    { name: 'Gas', value: db.meters.filter(m => m.typeId === 3).reduce((acc, m) => acc + m.lastReading, 0) },
  ];

  const AnalyticsView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2"><BarChart3 size={18} className="text-blue-500"/> Revenue Trend</h3>
        <div className="h-64"><ResponsiveContainer width="100%" height="100%"><LineChart data={revenueData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis /><Tooltip /><Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={3} /></LineChart></ResponsiveContainer></div>
      </Card>
      <Card className="p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2"><PieChart size={18} className="text-purple-500"/> Consumption Share</h3>
        <div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={usageByType} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value">{usageByType.map((entry, idx) => <Cell key={`cell-${idx}`} fill={['#EAB308', '#3B82F6', '#EF4444'][idx]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div>
      </Card>
    </div>
  );

  const ReportsView = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-800">Financial Performance Report</h3>
      <div className="grid grid-cols-3 gap-4 mb-6">
         <Card className="p-4 text-center">
            <p className="text-xs text-slate-500 uppercase font-bold">Total Revenue</p>
            <p className="text-2xl font-bold text-emerald-600">LKR {db.payments.reduce((a,b)=>a+b.amount,0).toFixed(2)}</p>
         </Card>
         <Card className="p-4 text-center">
            <p className="text-xs text-slate-500 uppercase font-bold">Pending Collections</p>
            <p className="text-2xl font-bold text-amber-600">LKR {db.bills.filter(b=>b.status==='Unpaid').reduce((a,b)=>a+b.amount,0).toFixed(2)}</p>
         </Card>
         <Card className="p-4 text-center">
            <p className="text-xs text-slate-500 uppercase font-bold">Total Bills</p>
            <p className="text-2xl font-bold text-blue-600">{db.bills.length}</p>
         </Card>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Bill ID</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Utility Type</th>
              <th className="px-6 py-4">Usage</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Amount (LKR)</th>
              <th className="px-6 py-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {db.bills.length === 0 && (
               <tr><td colSpan="7" className="text-center py-8 text-slate-400">No bills generated yet.</td></tr>
            )}
            {db.bills.map(b => {
               const customer = db.customers.find(c => c.id === b.customerId);
               const reading = db.readings.find(r => r.id === b.readingId);
               const meter = db.meters.find(m => m.id === b.meterId);
               const util = meter ? Object.values(UTILITY_TYPES).find(u => u.id === meter.typeId) : null;

               return (
                 <tr key={b.id} className="hover:bg-slate-50">
                   <td className="px-6 py-4 font-mono text-slate-500">{b.id}</td>
                   <td className="px-6 py-4 font-medium">{customer?.name}</td>
                   <td className="px-6 py-4">
                      {util ? <Badge className={`${util.bg} ${util.color} ${util.border}`}>{util.name}</Badge> : '-'}
                   </td>
                   <td className="px-6 py-4 text-slate-600 font-mono">
                      {reading ? `${reading.consumption} ${util?.unit}` : '-'}
                   </td>
                   <td className="px-6 py-4 text-slate-500">{new Date(b.date).toLocaleDateString()}</td>
                   <td className="px-6 py-4 text-right font-bold">LKR {b.amount.toFixed(2)}</td>
                   <td className="px-6 py-4 text-center">
                     <Badge type={b.status === 'Paid' ? 'success' : b.status === 'Unpaid' ? 'warning' : 'danger'}>{b.status}</Badge>
                   </td>
                 </tr>
               )
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {(currentView === 'Analytics' || currentView === 'Overview') && <AnalyticsView />}
      {currentView === 'Reports' && <ReportsView />}
    </div>
  );
};

// --- 4. LAYOUT COMPONENT ---

const navItems = {
  admin: [{ label: 'Overview', icon: LayoutDashboard }, { label: 'Customers', icon: Users }, { label: 'Tariffs', icon: FileText }],
  officer: [{ label: 'My Tasks', icon: ClipboardList }, { label: 'History', icon: History }],
  cashier: [{ label: 'Billing', icon: CreditCard }, { label: 'Transactions', icon: Receipt }],
  manager: [{ label: 'Analytics', icon: TrendingUp }, { label: 'Reports', icon: FileText }],
};

const DashboardLayout = ({ children, user, onLogout, currentView, onViewChange }) => {
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
            <button 
              key={idx} 
              onClick={() => onViewChange && onViewChange(item.label)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                (currentView === item.label || (!currentView && idx === 0))
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
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

// --- 5. MAIN APP ---

export default function App() {
  const [user, setUser] = useState(null); 
  // Initialize with EMPTY data
  const [db, setDb] = useState({ customers: [], meters: [], readings: [], bills: [], payments: [], tariffs: [] });
  const [notification, setNotification] = useState(null);
  const [currentView, setCurrentView] = useState('Overview');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Fetch data from SQL Server via Node API on load
  const fetchData = () => {
    fetch('http://localhost:5000/api/initial-data')
      .then(res => res.json())
      .then(data => {
        // Only use DB data if it exists, otherwise fallback to empty
        if (data) {
            setDb(data);
            console.log("Data loaded from SQL Server:", data);
        }
      })
      .catch(err => {
          console.warn("Running in offline mode. Database connection failed:", err);
          // We just stay with the initial empty state, so the app doesn't crash.
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Normalize mouse position relative to center of screen (-1 to 1)
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };

    if (!user) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [user]);

  // --- Actions ---
  const showToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const actions = {
    addCustomer: async (customer) => {
      // Call Backend API to add customer
      try {
        const res = await fetch('http://localhost:5000/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(customer)
        });
        if (res.ok) {
            fetchData(); // Refresh data from backend
            showToast("Customer created");
        } else {
            showToast("Failed to add customer", "error");
        }
      } catch (error) {
        console.error(error);
        showToast("Connection Error", "error");
      }
    },
    updateCustomer: async (updatedCustomer) => {
      try {
        const res = await fetch(`http://localhost:5000/api/customers/${updatedCustomer.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedCustomer)
        });
        if (res.ok) {
          fetchData(); // Reload from DB
          showToast("Customer details updated");
        } else {
           showToast("Update failed", "error");
        }
      } catch (e) { console.error(e); }
    },
    updateTariff: (updatedTariff) => {
      // Update local state for demo, would be API call in real app
      setDb(prev => ({
        ...prev,
        tariffs: prev.tariffs.map(t => t.id === updatedTariff.id ? updatedTariff : t)
      }));
      showToast("Tariff updated successfully");
    },
    addMeter: async (meter) => {
      try {
          const res = await fetch('http://localhost:5000/api/meters', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(meter)
          });
          if(res.ok) {
              fetchData();
              showToast("Meter installed");
          }
      } catch(e) { console.error(e); }
    },
    removeMeter: (meterId) => {
      // Local state update for demo
      setDb(prev => ({
        ...prev,
        meters: prev.meters.filter(m => m.id !== meterId),
      }));
      showToast("Meter removed successfully", "success");
    },
    removeCustomer: async (customerId) => {
      try {
          await fetch(`http://localhost:5000/api/customers/${customerId}`, { method: 'DELETE' });
          fetchData();
          showToast("Customer removed", "error");
      } catch(e) { console.error(e); }
    },
    submitReading: async (meterId, currentReading) => {
      try {
        const response = await fetch('http://localhost:5000/api/add-reading', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ meterId, currentReading })
        });
        
        const result = await response.json();
        
        if (response.ok) {
          showToast(`Bill generated: LKR ${result.amount}`);
          fetchData(); // Refresh all data from DB
        } else {
          showToast(result.message || "Error adding reading", "error");
        }
      } catch (err) {
        console.error(err);
        showToast("Server connection failed", "error");
      }
    },
    payBill: async (billId) => {
      const bill = db.bills.find(b => b.id === billId);
      await fetch('http://localhost:5000/api/pay-bill', {
          method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ billId, amount: bill.amount })
      });
      fetchData();
      showToast("Payment processed");
    }
  };

  // --- Login View ---
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans text-slate-100">
        
        {/* Parallax Background Layer */}
        <div className="absolute inset-0 overflow-hidden bg-slate-900">
          {/* Layer 1: The Image (User Uploaded) */}
          <div 
            className="absolute -inset-[50px] bg-cover bg-center opacity-40 transition-transform duration-100 ease-out"
            style={{ 
              backgroundImage: 'url("/utility-bg.jpg")', // User needs to save image here
              transform: `translate(${mousePos.x * -15}px, ${mousePos.y * -15}px) scale(1.1)` 
            }}
          />
          
          {/* Layer 2: Grid Lines (Medium Speed) */}
          <div 
            className="absolute inset-0 opacity-[0.05]" 
            style={{ 
              backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
              backgroundSize: '50px 50px',
              transform: `translate(${mousePos.x * 40}px, ${mousePos.y * 40}px) perspective(500px) rotateX(20deg)`
            }}
          />

          {/* Layer 3: Floating Utility Icons (Fastest - The "Hero" Elements) */}
          <div 
            className="absolute top-[20%] left-[15%] text-blue-500/20 animate-pulse duration-[4s]"
            style={{ transform: `translate(${mousePos.x * 60}px, ${mousePos.y * 60}px)` }}
          >
            <Droplets size={120} strokeWidth={1} />
          </div>
          <div 
            className="absolute top-[30%] right-[20%] text-yellow-500/20 animate-pulse duration-[3s]"
            style={{ transform: `translate(${mousePos.x * 80}px, ${mousePos.y * 80}px)` }}
          >
            <Zap size={140} strokeWidth={1} />
          </div>
          <div 
            className="absolute bottom-[20%] left-[25%] text-red-500/10 animate-pulse duration-[5s]"
            style={{ transform: `translate(${mousePos.x * 50}px, ${mousePos.y * 50}px)` }}
          >
            <Flame size={160} strokeWidth={1} />
          </div>
        </div>

        <Card className="w-full max-w-5xl grid md:grid-cols-2 overflow-hidden shadow-2xl border-0 z-10 backdrop-blur-md bg-white/5 rounded-2xl ring-1 ring-white/10">
          
          {/* Left Side: Brand Information */}
          <div className="p-12 flex flex-col justify-between relative bg-black/40">
            <div>
              <div className="flex gap-2 mb-8">
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
                <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
              </div>
              <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">UMS Portal</h1>
              <p className="text-slate-300 text-lg font-light">Next-Gen Utility Management System</p>
            </div>

            <div className="space-y-6">
               <div className="flex items-center gap-4 group p-3 rounded-xl hover:bg-white/10 transition-all cursor-default">
                 <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/10 group-hover:scale-110 transition-transform duration-300"><Droplets /></div>
                 <div><p className="font-semibold text-blue-100">Water Management</p><p className="text-xs text-blue-200/60">Real-time flow monitoring</p></div>
               </div>
               <div className="flex items-center gap-4 group p-3 rounded-xl hover:bg-white/10 transition-all cursor-default">
                 <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-400 shadow-lg shadow-yellow-500/10 group-hover:scale-110 transition-transform duration-300"><Zap /></div>
                 <div><p className="font-semibold text-yellow-100">Electricity Grid</p><p className="text-xs text-yellow-200/60">Smart metering infrastructure</p></div>
               </div>
               <div className="flex items-center gap-4 group p-3 rounded-xl hover:bg-white/10 transition-all cursor-default">
                 <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 shadow-lg shadow-red-500/10 group-hover:scale-110 transition-transform duration-300"><Flame /></div>
                 <div><p className="font-semibold text-red-100">Gas Distribution</p><p className="text-xs text-red-200/60">Automated supply tracking</p></div>
               </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-center text-xs text-slate-400">
              <p>© 2024 UMS Corp.</p>
              <div className="flex gap-4">
                <span className="hover:text-white cursor-pointer">Privacy</span>
                <span className="hover:text-white cursor-pointer">Terms</span>
              </div>
            </div>
          </div>

          {/* Right Side: Login Roles */}
          <div className="p-12 bg-white/95 flex flex-col justify-center relative">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Select Portal</h2>
            <div className="grid grid-cols-1 gap-4">
              {[
                { 
                  role: 'admin', 
                  name: 'Rifadh Admin', 
                  icon: LayoutDashboard, 
                  baseColor: 'blue',
                  desc: 'System Configuration',
                  className: 'hover:bg-blue-600 hover:border-blue-600 group-hover:text-white',
                  iconClass: 'group-hover:text-blue-600 group-hover:bg-white'
                },
                { 
                  role: 'officer', 
                  name: 'Frank Field', 
                  icon: ClipboardList, 
                  baseColor: 'emerald', 
                  desc: 'Meter Readings',
                  className: 'hover:bg-emerald-600 hover:border-emerald-600 group-hover:text-white',
                  iconClass: 'group-hover:text-emerald-600 group-hover:bg-white'
                },
                { 
                  role: 'cashier', 
                  name: 'Charlie Cash', 
                  icon: CreditCard, 
                  baseColor: 'purple', 
                  desc: 'Payments & Billing',
                  className: 'hover:bg-purple-600 hover:border-purple-600 group-hover:text-white',
                  iconClass: 'group-hover:text-purple-600 group-hover:bg-white'
                },
                { 
                  role: 'manager', 
                  name: 'Mary Manager', 
                  icon: TrendingUp, 
                  baseColor: 'amber', 
                  desc: 'Reports & Analytics',
                  className: 'hover:bg-amber-600 hover:border-amber-600 group-hover:text-white',
                  iconClass: 'group-hover:text-amber-600 group-hover:bg-white'
                }
              ].map((u, i) => (
                <button 
                  key={u.role} 
                  onClick={() => { setUser({ role: u.role, name: u.name }); setCurrentView('Overview'); }} 
                  className={`group relative w-full p-4 rounded-xl border border-slate-100 bg-white 
                  hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]
                  transition-all duration-300 ease-out text-left flex items-center gap-4 overflow-hidden
                  ${u.className}`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {/* Icon Container */}
                  <div className={`relative z-10 w-14 h-14 rounded-xl bg-slate-50 text-slate-600 
                    flex items-center justify-center 
                    transition-colors duration-300 shadow-sm
                    ${u.iconClass}`}
                  >
                    <u.icon size={28} />
                  </div>
                  
                  {/* Text Content */}
                  <div className="relative z-10">
                    <h3 className="font-bold text-slate-800 text-lg group-hover:text-white transition-colors duration-300 capitalize">
                      {u.role}
                    </h3>
                    <p className="text-sm text-slate-500 group-hover:text-white/90 transition-colors duration-300">
                      {u.desc}
                    </p>
                  </div>

                  {/* Arrow Icon - Slides in from right */}
                  <div className="ml-auto relative z-10 opacity-0 -translate-x-4 
                    group-hover:opacity-100 group-hover:translate-x-0 
                    text-white transition-all duration-300"
                  >
                    <ArrowRight size={24} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <DashboardLayout 
      user={user} 
      onLogout={() => setUser(null)}
      currentView={currentView}
      onViewChange={setCurrentView}
    >
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-xl z-50 flex items-center gap-3 ${notification.type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}>
          {notification.type === 'error' ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
          <span className="font-medium">{notification.msg}</span>
        </div>
      )}
      
      {user.role === 'admin' && <AdminDashboard db={db} actions={actions} currentView={currentView} />}
      {user.role === 'officer' && <FieldOfficerDashboard db={db} actions={actions} currentView={currentView} />}
      {user.role === 'cashier' && <CashierDashboard db={db} actions={actions} currentView={currentView} />}
      {user.role === 'manager' && <ManagerDashboard db={db} currentView={currentView} />}
    </DashboardLayout>
  );
}