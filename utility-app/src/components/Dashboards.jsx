// =============================================================================
// UMS DASHBOARD COMPONENTS
// =============================================================================

import React, { useState, useMemo } from 'react';
import { 
  Users, Zap, FileText, Plus, Search, Droplets, Flame, 
  Pencil, Trash2, X, FilePlus, CreditCard, CheckCircle,
  History, Clock, Receipt, BarChart3, AlertTriangle,
  TrendingUp, ArrowUpRight, ArrowDownRight, Download,
  MessageSquare, Gauge, Filter, MoreHorizontal
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Card, Badge, Button, Input, Modal, StatCard, Table, EmptyState, IconButton, Select } from './UI';
import { UTILITY_TYPES, BILL_STATUS, COMPLAINT_PRIORITY, COMPLAINT_STATUS, CHART_COLORS } from '../utils/constants';

// =============================================================================
// ADMIN DASHBOARD
// =============================================================================

export const AdminDashboard = ({ db, actions, currentView }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', address: '', phone: '', email: '' });
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editingTariff, setEditingTariff] = useState(null);
  const [usageModalCustomer, setUsageModalCustomer] = useState(null);
  const [usageForm, setUsageForm] = useState({ meterId: '', reading: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = useMemo(() => 
    db.customers.filter(c => 
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [db.customers, searchTerm]
  );

  // Overview View
  const OverviewView = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Customers" value={db.customers.length} icon={Users} color="blue" />
        <StatCard title="Active Meters" value={db.meters.length} icon={Gauge} color="emerald" />
        <StatCard title="Bills Generated" value={db.bills.length} icon={FileText} color="purple" />
        <StatCard 
          title="Pending Payments" 
          value={db.bills.filter(b => b.status === 'Unpaid').length} 
          icon={AlertTriangle} 
          color="amber" 
        />
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="font-bold text-slate-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="outline" icon={Plus} onClick={() => setShowAddModal(true)}>
            Add Customer
          </Button>
          <Button variant="outline" icon={Gauge} onClick={() => {
            if (db.customers.length === 0) {
              alert('Please add a customer first before installing meters.');
            } else {
              alert('To install a meter:\n1. Go to Customers view\n2. Click the ⚡💧🔥 icons next to any customer');
            }
          }}>
            Install Meter
          </Button>
          <Button variant="outline" icon={FileText} onClick={() => {
            alert('Reports are available in the Manager dashboard.\nSelect "Manager" role to view reports.');
          }}>
            Generate Report
          </Button>
          <Button variant="outline" icon={MessageSquare} onClick={() => {
            alert('Complaints management coming soon!\nThis feature will allow tracking customer complaints.');
          }}>
            View Complaints
          </Button>
        </div>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <History size={18} className="text-slate-400" /> Recent Readings
          </h3>
          <div className="space-y-3">
            {db.readings.slice(0, 5).map(r => {
              const meter = db.meters.find(m => m.id === r.meterId);
              const customer = db.customers.find(c => c.id === meter?.customerId);
              const util = Object.values(UTILITY_TYPES).find(u => u.id === meter?.typeId);
              return (
                <div key={r.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${util?.bg}`}>
                      {util?.id === 1 ? <Zap size={16} className={util.color} /> : 
                       util?.id === 2 ? <Droplets size={16} className={util.color} /> : 
                       <Flame size={16} className={util?.color} />}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{customer?.name}</p>
                      <p className="text-xs text-slate-500">{r.consumption} {util?.unit}</p>
                    </div>
                  </div>
                  <Badge type="success">{r.value}</Badge>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" /> Unpaid Bills
          </h3>
          <div className="space-y-3">
            {db.bills.filter(b => b.status === 'Unpaid').slice(0, 5).map(bill => {
              const customer = db.customers.find(c => c.id === bill.customerId);
              return (
                <div key={bill.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{customer?.name}</p>
                    <p className="text-xs text-slate-500">Due: {new Date(bill.dueDate).toLocaleDateString()}</p>
                  </div>
                  <span className="font-bold text-amber-700">LKR {bill.amount?.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );

  // Customers View
  const CustomersView = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Customer Management</h3>
          <p className="text-sm text-slate-500">Manage all customer accounts and meters</p>
        </div>
        <Button icon={Plus} onClick={() => setShowAddModal(true)}>
          Add Customer
        </Button>
      </div>

      <div className="flex gap-4">
        <Input 
          placeholder="Search customers..." 
          icon={Search}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          containerClassName="flex-1 max-w-md"
        />
        <Button variant="outline" icon={Filter}>Filters</Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Meters</th>
                <th className="px-6 py-4">Balance</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-12 text-slate-400">No customers found</td></tr>
              ) : filteredCustomers.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/50 group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                        {c.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{c.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{c.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-700">{c.phone}</p>
                    <p className="text-xs text-slate-500">{c.address}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {db.meters.filter(m => m.customerId === c.id).map(m => {
                        const util = Object.values(UTILITY_TYPES).find(u => u.id === m.typeId);
                        return (
                          <Badge 
                            key={m.id} 
                            className={`${util?.bg} ${util?.color} ${util?.border} cursor-pointer`}
                            title="Double click to remove"
                            onDoubleClick={() => {
                              if(window.confirm(`Remove ${util?.name} meter?`)) actions.removeMeter(m.id);
                            }}
                          >
                            {util?.name}
                          </Badge>
                        );
                      })}
                      {db.meters.filter(m => m.customerId === c.id).length === 0 && (
                        <span className="text-slate-400 text-xs italic">No meters</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${(c.outstandingBalance || 0) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      LKR {(c.outstandingBalance || 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <IconButton icon={Zap} color="amber" title="Add Electricity Meter" 
                        onClick={() => actions.addMeter({ id: `MTR-E-${Date.now()}`, customerId: c.id, typeId: 1, lastReading: 0, status: 'Active' })} />
                      <IconButton icon={Droplets} color="cyan" title="Add Water Meter" 
                        onClick={() => actions.addMeter({ id: `MTR-W-${Date.now()}`, customerId: c.id, typeId: 2, lastReading: 0, status: 'Active' })} />
                      <IconButton icon={Flame} color="rose" title="Add Gas Meter" 
                        onClick={() => actions.addMeter({ id: `MTR-G-${Date.now()}`, customerId: c.id, typeId: 3, lastReading: 0, status: 'Active' })} />
                      <div className="w-px h-5 bg-slate-200 mx-1" />
                      <IconButton icon={FilePlus} color="emerald" title="Add Usage" 
                        onClick={() => {
                          const customerMeters = db.meters.filter(m => m.customerId === c.id);
                          if (customerMeters.length === 0) { alert("No meters installed!"); return; }
                          setUsageModalCustomer(c);
                          setUsageForm({ meterId: customerMeters[0].id, reading: '' });
                        }} />
                      <IconButton icon={Pencil} color="blue" title="Edit" onClick={() => setEditingCustomer(c)} />
                      <IconButton icon={Trash2} color="rose" title="Delete Customer & All Data" 
                        onClick={() => { 
                          if(window.confirm(`Delete ${c.name}?\n\nThis will also delete all meters, bills, and payments for this customer.`)) {
                            actions.removeCustomer(c.id); 
                          }
                        }} />
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

  // Tariffs View
  const TariffsView = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900">Tariff Configuration</h3>
        <p className="text-sm text-slate-500">Manage utility rates and charges</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {db.tariffs.map(t => {
          const util = Object.values(UTILITY_TYPES).find(u => u.id === t.typeId);
          return (
            <Card key={t.id} className="p-6 hover:shadow-lg transition-shadow" hover>
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${util?.bg}`}>
                  {util?.id === 1 ? <Zap size={24} className={util.color} /> : 
                   util?.id === 2 ? <Droplets size={24} className={util.color} /> : 
                   <Flame size={24} className={util?.color} />}
                </div>
                <IconButton icon={Pencil} color="blue" onClick={() => setEditingTariff(t)} />
              </div>
              <h4 className="font-bold text-slate-900 mb-1">{t.name}</h4>
              <Badge className={`${util?.bg} ${util?.color} ${util?.border} mb-4`}>{util?.name}</Badge>
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500 text-sm">Rate per {util?.unit}</span>
                  <span className="font-semibold text-slate-900">LKR {t.rate?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-sm">Fixed Charge</span>
                  <span className="font-semibold text-slate-900">LKR {t.fixed?.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {currentView === 'Overview' && <OverviewView />}
      {currentView === 'Customers' && <CustomersView />}
      {currentView === 'Tariffs' && <TariffsView />}
      {(currentView === 'Meters' || currentView === 'Complaints') && (
        <EmptyState 
          icon={currentView === 'Meters' ? Gauge : MessageSquare}
          title={`${currentView} Management`}
          description="This feature is coming soon"
        />
      )}

      {/* Add Customer Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Customer">
        <div className="space-y-4">
          <Input label="Full Name" placeholder="Enter customer name" value={newCustomer.name} 
            onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} />
          <Input label="Address" placeholder="Enter address" value={newCustomer.address} 
            onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" placeholder="07X XXXX XXX" value={newCustomer.phone} 
              onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} />
            <Input label="Email" type="email" placeholder="email@example.com" value={newCustomer.email} 
              onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={() => { 
              actions.addCustomer(newCustomer); 
              setShowAddModal(false); 
              setNewCustomer({ name: '', address: '', phone: '', email: '' }); 
            }}>Create Customer</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Customer Modal */}
      <Modal isOpen={!!editingCustomer} onClose={() => setEditingCustomer(null)} title="Edit Customer">
        {editingCustomer && (
          <div className="space-y-4">
            <Input label="Full Name" value={editingCustomer.name || ''} 
              onChange={e => setEditingCustomer({...editingCustomer, name: e.target.value})} />
            <Input label="Address" value={editingCustomer.address || ''} 
              onChange={e => setEditingCustomer({...editingCustomer, address: e.target.value})} />
            <Input label="Phone" value={editingCustomer.phone || ''} 
              onChange={e => setEditingCustomer({...editingCustomer, phone: e.target.value})} />
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setEditingCustomer(null)}>Cancel</Button>
              <Button onClick={() => { actions.updateCustomer(editingCustomer); setEditingCustomer(null); }}>Save Changes</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Tariff Modal */}
      <Modal isOpen={!!editingTariff} onClose={() => setEditingTariff(null)} title="Edit Tariff">
        {editingTariff && (
          <div className="space-y-4">
            <Input label="Tariff Name" value={editingTariff.name || ''} 
              onChange={e => setEditingTariff({...editingTariff, name: e.target.value})} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Rate per Unit (LKR)" type="number" step="0.01" value={editingTariff.rate || ''} 
                onChange={e => setEditingTariff({...editingTariff, rate: parseFloat(e.target.value)})} />
              <Input label="Fixed Charge (LKR)" type="number" step="0.01" value={editingTariff.fixed || ''} 
                onChange={e => setEditingTariff({...editingTariff, fixed: parseFloat(e.target.value)})} />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setEditingTariff(null)}>Cancel</Button>
              <Button onClick={() => { actions.updateTariff(editingTariff); setEditingTariff(null); }}>Update Tariff</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Usage Modal */}
      <Modal isOpen={!!usageModalCustomer} onClose={() => setUsageModalCustomer(null)} title={`Add Usage: ${usageModalCustomer?.name}`}>
        {usageModalCustomer && (
          <div className="space-y-4">
            <Select 
              label="Select Meter"
              value={usageForm.meterId}
              onChange={e => setUsageForm({...usageForm, meterId: e.target.value})}
              options={db.meters.filter(m => m.customerId === usageModalCustomer.id).map(m => {
                const util = Object.values(UTILITY_TYPES).find(u => u.id === m.typeId);
                return { value: m.id, label: `${util?.name} (${m.id})` };
              })}
            />
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500 uppercase font-semibold">Previous Reading</p>
              <p className="text-2xl font-mono font-bold text-slate-900">
                {db.meters.find(m => m.id === usageForm.meterId)?.lastReading || 0}
              </p>
            </div>
            <Input 
              label="Current Reading" 
              type="number" 
              step="0.01"
              placeholder="Enter current reading" 
              value={usageForm.reading} 
              onChange={e => setUsageForm({...usageForm, reading: e.target.value})} 
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setUsageModalCustomer(null)}>Cancel</Button>
              <Button 
                disabled={!usageForm.reading || parseFloat(usageForm.reading) < (db.meters.find(m => m.id === usageForm.meterId)?.lastReading || 0)}
                onClick={() => { actions.submitReading(usageForm.meterId, usageForm.reading); setUsageModalCustomer(null); }}
              >Generate Bill</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// =============================================================================
// FIELD OFFICER DASHBOARD
// =============================================================================

export const FieldOfficerDashboard = ({ db, actions, currentView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMeter, setSelectedMeter] = useState(null);
  const [readingInput, setReadingInput] = useState('');

  const filteredMeters = db.meters.filter(m => {
    const customer = db.customers.find(c => c.id === m.customerId);
    return m.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
           customer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const MyTasksView = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Meter Reading Entry</h2>
        <p className="text-slate-500">Search and select a meter to enter reading</p>
      </div>

      <Input 
        placeholder="Search by Meter ID or Customer Name..." 
        icon={Search}
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />

      {!selectedMeter ? (
        <div className="space-y-3">
          {filteredMeters.length === 0 && (
            <EmptyState icon={Gauge} title="No meters found" description="Try adjusting your search" />
          )}
          {filteredMeters.map(m => {
            const customer = db.customers.find(c => c.id === m.customerId);
            const util = Object.values(UTILITY_TYPES).find(u => u.id === m.typeId);
            return (
              <Card 
                key={m.id} 
                className="p-4 cursor-pointer border-2 border-transparent hover:border-blue-400" 
                hover
                onClick={() => { setSelectedMeter(m); setReadingInput(''); }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${util?.bg}`}>
                      {util?.id === 1 ? <Zap size={24} className={util.color} /> : 
                       util?.id === 2 ? <Droplets size={24} className={util.color} /> : 
                       <Flame size={24} className={util?.color} />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{customer?.name}</p>
                      <p className="text-sm text-slate-500">{customer?.address}</p>
                      <Badge className="mt-1 font-mono" size="xs">{m.id}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Last Reading</p>
                    <p className="text-lg font-mono font-bold text-slate-900">{m.lastReading}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-6">
          <button 
            onClick={() => setSelectedMeter(null)} 
            className="text-sm text-slate-500 hover:text-blue-600 mb-6 flex items-center gap-1"
          >
            ← Back to list
          </button>
          
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-slate-900">Enter New Reading</h3>
            <Badge className="mt-2 font-mono">{selectedMeter.id}</Badge>
          </div>
          
          <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl mb-6 text-center">
            <p className="text-xs uppercase text-slate-500 font-semibold tracking-wider">Previous Reading</p>
            <p className="text-4xl font-mono font-bold text-slate-900 mt-2">{selectedMeter.lastReading}</p>
          </div>
          
          <Input 
            type="number" 
            placeholder="Enter current reading..."
            className="text-center text-2xl font-mono py-4"
            value={readingInput} 
            onChange={e => setReadingInput(e.target.value)} 
          />
          
          {readingInput && parseFloat(readingInput) >= selectedMeter.lastReading && (
            <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-sm text-emerald-700 font-medium">
                Consumption: <span className="font-bold">{(parseFloat(readingInput) - selectedMeter.lastReading).toFixed(2)}</span> units
              </p>
            </div>
          )}
          
          <Button 
            className="w-full mt-6" 
            size="lg"
            disabled={!readingInput || parseFloat(readingInput) < selectedMeter.lastReading}
            onClick={() => { actions.submitReading(selectedMeter.id, readingInput); setSelectedMeter(null); }}
          >
            Submit Reading & Generate Bill
          </Button>
        </Card>
      )}
    </div>
  );

  const HistoryView = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900">Reading History</h3>
        <p className="text-sm text-slate-500">View all submitted meter readings</p>
      </div>
      
      {db.readings.length === 0 ? (
        <EmptyState icon={History} title="No readings yet" description="Start by entering meter readings" />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b">
              <tr>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Meter</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4 text-right">Reading</th>
                <th className="px-6 py-4 text-right">Consumption</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {db.readings.map(r => {
                const meter = db.meters.find(m => m.id === r.meterId);
                const customer = db.customers.find(c => c.id === meter?.customerId);
                const util = Object.values(UTILITY_TYPES).find(u => u.id === meter?.typeId);
                return (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(r.date).toLocaleDateString()}
                      <span className="text-xs text-slate-400 ml-2">
                        {new Date(r.date).toLocaleTimeString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`${util?.bg} ${util?.color} font-mono`}>{r.meterId}</Badge>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">{customer?.name}</td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-slate-900">{r.value}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-emerald-600 font-semibold">+{r.consumption}</span>
                      <span className="text-xs text-slate-500 ml-1">{util?.unit}</span>
                    </td>
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

// =============================================================================
// CASHIER DASHBOARD
// =============================================================================

export const CashierDashboard = ({ db, actions, currentView }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Cash');
  const unpaidBills = db.bills.filter(b => ['Unpaid', 'Overdue', 'Partial'].includes(b.status));

  const BillingView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Pending Payments</h3>
          <p className="text-sm text-slate-500">{unpaidBills.length} bills awaiting payment</p>
        </div>
        <div className="flex items-center gap-2">
          <Select 
            value={selectedPaymentMethod}
            onChange={e => setSelectedPaymentMethod(e.target.value)}
            options={[
              { value: 'Cash', label: 'Cash' },
              { value: 'Card', label: 'Card' },
              { value: 'Online', label: 'Online' },
              { value: 'Bank Transfer', label: 'Bank Transfer' },
            ]}
          />
        </div>
      </div>

      {unpaidBills.length === 0 ? (
        <EmptyState 
          icon={CheckCircle} 
          title="All caught up!" 
          description="No pending bills to process"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {unpaidBills.map(bill => {
            const customer = db.customers.find(c => c.id === bill.customerId);
            const meter = db.meters.find(m => m.id === bill.meterId);
            const util = meter ? Object.values(UTILITY_TYPES).find(u => u.id === meter.typeId) : null;
            const statusStyle = BILL_STATUS[bill.status] || BILL_STATUS.Unpaid;
            const amountDue = bill.amount - (bill.paidAmount || 0);
            
            return (
              <Card key={bill.id} className={`p-5 border-l-4 ${bill.status === 'Overdue' ? 'border-l-rose-500' : 'border-l-amber-500'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-bold text-slate-900">{customer?.name}</p>
                    <p className="text-xs text-slate-500 font-mono mt-1">{bill.id}</p>
                  </div>
                  <Badge className={`${statusStyle.bg} ${statusStyle.color} ${statusStyle.border}`}>
                    {bill.status}
                  </Badge>
                </div>
                
                {util && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`p-1.5 rounded ${util.bg}`}>
                      {util.id === 1 ? <Zap size={14} className={util.color} /> : 
                       util.id === 2 ? <Droplets size={14} className={util.color} /> : 
                       <Flame size={14} className={util?.color} />}
                    </div>
                    <span className="text-sm text-slate-600">{util.name}</span>
                    <span className="text-sm text-slate-500">• {bill.consumption} {util.unit}</span>
                  </div>
                )}
                
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-500 text-sm">Total</span>
                    <span className="font-medium">LKR {bill.amount?.toFixed(2)}</span>
                  </div>
                  {bill.paidAmount > 0 && (
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-500 text-sm">Paid</span>
                      <span className="text-emerald-600">- LKR {bill.paidAmount?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-dashed border-slate-200">
                    <span className="font-semibold text-slate-700">Amount Due</span>
                    <span className="text-xl font-bold text-slate-900">LKR {amountDue.toFixed(2)}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-4" 
                  icon={CreditCard}
                  onClick={() => actions.payBill(bill.id, selectedPaymentMethod)}
                >
                  Process Payment
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  const TransactionsView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Transaction History</h3>
          <p className="text-sm text-slate-500">All processed payments</p>
        </div>
        <Button variant="outline" icon={Download}>Export</Button>
      </div>

      {db.payments.length === 0 ? (
        <EmptyState icon={Receipt} title="No transactions" description="Process payments to see history" />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b">
              <tr>
                <th className="px-6 py-4">Payment ID</th>
                <th className="px-6 py-4">Bill ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {db.payments.map(p => {
                const bill = db.bills.find(b => b.id === p.billId);
                const customer = db.customers.find(c => c.id === (p.customerId || bill?.customerId));
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono text-slate-500">{p.id}</td>
                    <td className="px-6 py-4 font-mono text-slate-500">{p.billId}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{customer?.name}</td>
                    <td className="px-6 py-4">
                      <Badge type="primary">{p.method || 'Cash'}</Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{new Date(p.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600">LKR {p.amount?.toFixed(2)}</td>
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
      {(currentView === 'Billing' || currentView === 'Overview') && <BillingView />}
      {currentView === 'Transactions' && <TransactionsView />}
    </div>
  );
};

// =============================================================================
// MANAGER DASHBOARD
// =============================================================================

export const ManagerDashboard = ({ db, currentView }) => {
  const totalRevenue = db.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalOutstanding = db.bills.filter(b => b.status !== 'Paid').reduce((sum, b) => sum + (b.amount - (b.paidAmount || 0)), 0);
  const paidBillsCount = db.bills.filter(b => b.status === 'Paid').length;
  const unpaidBillsCount = db.bills.filter(b => b.status !== 'Paid').length;

  // Revenue trend data
  const revenueData = useMemo(() => {
    const grouped = db.payments.reduce((acc, p) => {
      const date = new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const existing = acc.find(d => d.name === date);
      if (existing) existing.amount += p.amount; 
      else acc.push({ name: date, amount: p.amount });
      return acc;
    }, []);
    return grouped.slice(-7);
  }, [db.payments]);

  // Consumption by utility type
  const consumptionByType = useMemo(() => [
    { name: 'Electricity', value: db.readings.filter(r => {
      const meter = db.meters.find(m => m.id === r.meterId);
      return meter?.typeId === 1;
    }).reduce((sum, r) => sum + (r.consumption || 0), 0), color: CHART_COLORS.electricity },
    { name: 'Water', value: db.readings.filter(r => {
      const meter = db.meters.find(m => m.id === r.meterId);
      return meter?.typeId === 2;
    }).reduce((sum, r) => sum + (r.consumption || 0), 0), color: CHART_COLORS.water },
    { name: 'Gas', value: db.readings.filter(r => {
      const meter = db.meters.find(m => m.id === r.meterId);
      return meter?.typeId === 3;
    }).reduce((sum, r) => sum + (r.consumption || 0), 0), color: CHART_COLORS.gas },
  ], [db.readings, db.meters]);

  const AnalyticsView = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Revenue" 
          value={`LKR ${totalRevenue.toLocaleString()}`} 
          icon={TrendingUp} 
          color="emerald"
          trend={12.5}
        />
        <StatCard 
          title="Outstanding" 
          value={`LKR ${totalOutstanding.toLocaleString()}`} 
          icon={AlertTriangle} 
          color="amber"
        />
        <StatCard 
          title="Bills Paid" 
          value={paidBillsCount} 
          icon={CheckCircle} 
          color="blue"
        />
        <StatCard 
          title="Bills Pending" 
          value={unpaidBillsCount} 
          icon={Clock} 
          color="rose"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-blue-500" /> Revenue Trend
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`LKR ${value.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Gauge size={18} className="text-purple-500" /> Consumption by Utility
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={consumptionByType} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={60} 
                  outerRadius={100} 
                  paddingAngle={5}
                  dataKey="value"
                >
                  {consumptionByType.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [value.toLocaleString(), 'Units']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );

  const ReportsView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Financial Reports</h3>
          <p className="text-sm text-slate-500">Comprehensive billing and revenue analysis</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={Filter}>Filter</Button>
          <Button variant="outline" icon={Download}>Export PDF</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-emerald-500 to-green-600 text-white">
          <p className="text-emerald-100 text-sm font-medium">Total Revenue Collected</p>
          <p className="text-3xl font-bold mt-2">LKR {totalRevenue.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-2 text-emerald-100">
            <ArrowUpRight size={16} />
            <span className="text-sm">12.5% from last month</span>
          </div>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-amber-500 to-orange-600 text-white">
          <p className="text-amber-100 text-sm font-medium">Pending Collections</p>
          <p className="text-3xl font-bold mt-2">LKR {totalOutstanding.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-2 text-amber-100">
            <AlertTriangle size={16} />
            <span className="text-sm">{unpaidBillsCount} unpaid bills</span>
          </div>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <p className="text-blue-100 text-sm font-medium">Total Bills Generated</p>
          <p className="text-3xl font-bold mt-2">{db.bills.length}</p>
          <div className="flex items-center gap-1 mt-2 text-blue-100">
            <FileText size={16} />
            <span className="text-sm">{paidBillsCount} paid ({Math.round(paidBillsCount/db.bills.length*100) || 0}%)</span>
          </div>
        </Card>
      </div>

      {/* All Bills Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h4 className="font-semibold text-slate-800">All Bills</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b">
              <tr>
                <th className="px-6 py-4">Bill ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Utility</th>
                <th className="px-6 py-4">Usage</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {db.bills.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-12 text-slate-400">No bills generated yet</td></tr>
              ) : db.bills.map(b => {
                const customer = db.customers.find(c => c.id === b.customerId);
                const meter = db.meters.find(m => m.id === b.meterId);
                const util = meter ? Object.values(UTILITY_TYPES).find(u => u.id === meter.typeId) : null;
                const statusStyle = BILL_STATUS[b.status] || BILL_STATUS.Unpaid;
                return (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono text-slate-500">{b.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{customer?.name}</td>
                    <td className="px-6 py-4">
                      {util ? <Badge className={`${util.bg} ${util.color}`}>{util.name}</Badge> : '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono">
                      {b.consumption ? `${b.consumption} ${util?.unit}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{new Date(b.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">LKR {b.amount?.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <Badge className={`${statusStyle.bg} ${statusStyle.color} ${statusStyle.border}`}>{b.status}</Badge>
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

  const DefaultersView = () => {
    const overdueBills = db.bills.filter(b => b.status === 'Overdue');
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Defaulters Report</h3>
          <p className="text-sm text-slate-500">Customers with overdue payments</p>
        </div>

        {overdueBills.length === 0 ? (
          <EmptyState 
            icon={CheckCircle} 
            title="No defaulters!" 
            description="All customers are up to date with payments"
          />
        ) : (
          <div className="space-y-4">
            {overdueBills.map(bill => {
              const customer = db.customers.find(c => c.id === bill.customerId);
              const daysOverdue = Math.floor((new Date() - new Date(bill.dueDate)) / (1000 * 60 * 60 * 24));
              
              return (
                <Card key={bill.id} className="p-5 border-l-4 border-l-rose-500">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center">
                        <AlertTriangle size={24} className="text-rose-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{customer?.name}</p>
                        <p className="text-sm text-slate-500">{customer?.phone} • {customer?.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Days Overdue</p>
                        <p className="text-xl font-bold text-rose-600">{daysOverdue}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Amount Due</p>
                        <p className="text-xl font-bold text-slate-900">LKR {(bill.amount - (bill.paidAmount || 0)).toFixed(2)}</p>
                      </div>
                      <Button variant="outline" size="sm">Send Reminder</Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {(currentView === 'Analytics' || currentView === 'Overview') && <AnalyticsView />}
      {currentView === 'Reports' && <ReportsView />}
      {currentView === 'Defaulters' && <DefaultersView />}
    </div>
  );
};
