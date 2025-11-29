import React, { useState } from 'react';
import { Users, Zap, FileText, Plus, Search, AlertTriangle, CreditCard, Droplets, Flame } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// CORRECTED IMPORTS:
// 1. UI is in the same folder (components), so we use './UI'
// 2. data is in 'utils' folder one level up, so we use '../utils/data'
import { Card, Badge, Button } from './UI';
import { UTILITY_TYPES } from '../utils/data';

export const AdminDashboard = ({ db, actions }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', address: '', phone: '' });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Users /></div>
          <div><p className="text-sm text-slate-500">Total Customers</p><p className="text-2xl font-bold">{db.customers.length}</p></div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg"><Zap /></div>
          <div><p className="text-sm text-slate-500">Active Meters</p><p className="text-2xl font-bold">{db.meters.length}</p></div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><FileText /></div>
          <div><p className="text-sm text-slate-500">Bills Generated</p><p className="text-2xl font-bold">{db.bills.length}</p></div>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800">Customer Database</h3>
        <Button onClick={() => setShowAddModal(true)}><Plus size={16} className="inline mr-2" /> New Customer</Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Address</th>
                <th className="px-6 py-4">Meters</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {db.customers.map(c => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-mono text-slate-500">{c.id}</td>
                  <td className="px-6 py-4 font-medium">{c.name}</td>
                  <td className="px-6 py-4 text-slate-600">{c.address}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      {db.meters.filter(m => m.customerId === c.id).map(m => {
                         const util = Object.values(UTILITY_TYPES).find(u => u.id === m.typeId);
                         return <Badge key={m.id} type="default">{util?.name}</Badge>
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-600 hover:underline" onClick={() => actions.addMeter({ id: `M-${Date.now()}`, customerId: c.id, typeId: 1, lastReading: 0, status: 'Active' })}>+ Add Meter</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Add Customer</h3>
            <div className="space-y-4">
              <input className="w-full border p-2 rounded" placeholder="Full Name" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} />
              <input className="w-full border p-2 rounded" placeholder="Address" value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} />
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button onClick={() => { actions.addCustomer(newCustomer); setShowAddModal(false); }}>Create</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export const FieldOfficerDashboard = ({ db, actions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMeter, setSelectedMeter] = useState(null);
  const [readingInput, setReadingInput] = useState('');

  const filteredMeters = db.meters.filter(m => {
    const customer = db.customers.find(c => c.id === m.customerId);
    return m.id.toLowerCase().includes(searchTerm.toLowerCase()) || customer?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-3 text-slate-400" size={20} />
        <input type="text" placeholder="Search Meter ID or Customer..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      {!selectedMeter ? (
        <div className="space-y-4">
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
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${util.bg}`}>
                    {util.id === 1 ? <Zap size={20} className={util.color} /> : util.id === 2 ? <Droplets size={20} className={util.color} /> : <Flame size={20} className={util.color} />}
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
};

export const CashierDashboard = ({ db, actions }) => {
  const unpaidBills = db.bills.filter(b => b.status === 'Unpaid');

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-800">Pending Payments</h3>
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
                <span className="text-2xl font-bold">${bill.amount.toFixed(2)}</span>
              </div>
              <Button className="w-full" onClick={() => actions.payBill(bill.id)}><CreditCard size={16} className="mr-2 inline" /> Process Payment</Button>
            </Card>
          );
        })}
        {unpaidBills.length === 0 && <p className="text-slate-400 col-span-3 text-center py-10">No unpaid bills found.</p>}
      </div>
    </div>
  );
};

export const ManagerDashboard = ({ db }) => {
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-bold mb-4">Revenue Trend</h3>
          <div className="h-64"><ResponsiveContainer width="100%" height="100%"><LineChart data={revenueData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis /><Tooltip /><Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={3} /></LineChart></ResponsiveContainer></div>
        </Card>
        <Card className="p-6">
          <h3 className="font-bold mb-4">Consumption Share</h3>
          <div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={usageByType} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value">{usageByType.map((entry, idx) => <Cell key={`cell-${idx}`} fill={['#EAB308', '#3B82F6', '#EF4444'][idx]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div>
        </Card>
      </div>
    </div>
  );
};