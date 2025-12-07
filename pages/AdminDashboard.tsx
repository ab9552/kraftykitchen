
import React, { useEffect, useState } from 'react';
import { db } from '../services/database';
import Layout from '../components/Layout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, ShoppingBag, Clock, Plus, Trash2, QrCode, TrendingUp, TrendingDown, Wallet, Download, FileText, CreditCard, Banknote } from 'lucide-react';
import { MenuItem, Expense, Order, PaymentStatus, PaymentMethod } from '../types';

const AdminDashboard = () => {
  const [stats, setStats] = useState(db.getStats());
  const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'tables' | 'finances'>('overview');
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  
  // Menu Form State
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({ category: 'Starters', isVeg: true, image: 'https://picsum.photos/200/200' });

  // Expense Form State
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({ category: 'Inventory', date: Date.now() });

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000); // Auto-refresh stats
    return () => clearInterval(interval);
  }, []);

  const refreshData = () => {
    setStats(db.getStats());
    setMenu(db.getMenu());
    setExpenses(db.getExpenses());
    // Get all orders for the list
    setOrders(db.getOrders().reverse().slice(0, 10)); // Last 10 orders
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if(newItem.name && newItem.priceFull) {
      db.addMenuItem({
        id: crypto.randomUUID(),
        name: newItem.name,
        category: newItem.category!,
        description: newItem.description || '',
        priceFull: Number(newItem.priceFull),
        priceHalf: newItem.priceHalf ? Number(newItem.priceHalf) : undefined,
        isVeg: newItem.isVeg!,
        image: newItem.image!
      });
      refreshData();
      setNewItem({ category: 'Starters', isVeg: true, image: 'https://picsum.photos/200/200' });
    }
  };

  const handleDeleteItem = (id: string) => {
    if(confirm('Are you sure?')) {
      db.deleteMenuItem(id);
      refreshData();
    }
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (newExpense.amount && newExpense.description) {
      db.addExpense({
        id: crypto.randomUUID(),
        description: newExpense.description,
        amount: Number(newExpense.amount),
        category: newExpense.category!,
        date: Date.now() // For simplicity in this demo, always using now. In real app, allow date selection.
      });
      setNewExpense({ category: 'Inventory', amount: 0, description: '' });
      refreshData();
    }
  };

  const handleDeleteExpense = (id: string) => {
    if(confirm('Delete this expense entry?')) {
      db.deleteExpense(id);
      refreshData();
    }
  };

  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert("No data available to export.");
      return;
    }

    // Convert array of objects to CSV string
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(fieldName => {
        let value = row[fieldName] || '';
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportOrders = (period: 'today' | 'all') => {
    const allOrders = db.getOrders();
    let filteredOrders = allOrders;

    if (period === 'today') {
      const today = new Date();
      today.setHours(0,0,0,0);
      filteredOrders = allOrders.filter(o => o.createdAt >= today.getTime());
    }

    const csvData = filteredOrders.map(o => ({
      Date: new Date(o.createdAt).toLocaleDateString(),
      Time: new Date(o.createdAt).toLocaleTimeString(),
      Token: o.token,
      Customer: o.customerDetails?.name || 'Guest',
      Phone: o.customerDetails?.phone || 'N/A',
      Address: o.customerDetails?.address || '',
      Table: o.tableId,
      Items: o.items.map(i => `${i.quantity}x ${i.name}`).join(' | '),
      TotalAmount: o.totalAmount,
      PaymentMethod: o.paymentMethod,
      PaymentStatus: o.paymentStatus,
      OrderStatus: o.status
    }));

    downloadCSV(csvData, `KraftyKitchen_Sales_${period}_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportExpenses = () => {
    const allExpenses = db.getExpenses();
    const csvData = allExpenses.map(e => ({
      Date: new Date(e.date).toLocaleDateString(),
      Category: e.category,
      Description: e.description,
      Amount: e.amount
    }));
    downloadCSV(csvData, `KraftyKitchen_Expenses_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const chartData = [
    { name: 'Revenue', amount: stats.totalRevenue },
    { name: 'Expenses', amount: stats.totalExpenses },
  ];
  
  const COLORS = ['#10B981', '#EF4444'];

  const renderOverview = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Today's Revenue</p>
              <h3 className="text-2xl font-bold text-white mt-1">₹{stats.todayRevenue}</h3>
            </div>
            <div className="bg-green-500/20 p-2 rounded text-green-500"><DollarSign size={20} /></div>
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Active Orders</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.activeOrders}</h3>
            </div>
            <div className="bg-blue-500/20 p-2 rounded text-blue-500"><Clock size={20} /></div>
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Total Orders</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.totalOrders}</h3>
            </div>
            <div className="bg-purple-500/20 p-2 rounded text-purple-500"><ShoppingBag size={20} /></div>
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Today's Profit</p>
              <h3 className={`text-2xl font-bold mt-1 ${stats.todayProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stats.todayProfit >= 0 ? '+' : ''}₹{stats.todayProfit}
              </h3>
            </div>
            <div className="bg-yellow-500/20 p-2 rounded text-yellow-500"><TrendingUp size={20} /></div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
         <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">Recent Orders (Live)</h3>
            <button onClick={() => exportOrders('today')} className="text-xs flex items-center gap-1 text-dragon-gold hover:underline">
               <Download size={14}/> Export Today's Orders
            </button>
         </div>
         <div className="overflow-x-auto">
           <table className="w-full text-left text-gray-300">
             <thead className="bg-gray-900 text-gray-400 text-xs uppercase">
               <tr>
                 <th className="p-3">Token</th>
                 <th className="p-3">Customer</th>
                 <th className="p-3">Contact</th>
                 <th className="p-3">Items</th>
                 <th className="p-3">Amount</th>
                 <th className="p-3">Status</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-700">
               {orders.map(order => (
                 <tr key={order.id} className="hover:bg-gray-700/50">
                   <td className="p-3 font-mono text-dragon-gold">{order.token}</td>
                   <td className="p-3 font-bold text-white">{order.customerDetails?.name || 'Guest'}</td>
                   <td className="p-3 text-sm">
                     <div>{order.customerDetails?.phone}</div>
                     <div className="text-xs text-gray-500">{order.customerDetails?.address}</div>
                   </td>
                   <td className="p-3 text-sm">{order.items.length} items</td>
                   <td className="p-3 font-bold">₹{order.totalAmount}</td>
                   <td className="p-3">
                     <span className={`px-2 py-1 rounded text-xs ${
                       order.status === 'COMPLETED' ? 'bg-green-900 text-green-300' : 
                       order.status === 'PENDING' ? 'bg-yellow-900 text-yellow-300' : 
                       'bg-blue-900 text-blue-300'
                     }`}>
                       {order.status}
                     </span>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
      </div>
    </div>
  );

  const renderMenu = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
      <div className="lg:col-span-1 bg-gray-800 p-6 rounded-xl border border-gray-700 h-fit">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Plus size={18}/> Add New Item</h3>
        <form onSubmit={handleAddItem} className="space-y-4">
          <input type="text" placeholder="Item Name" className="w-full bg-gray-900 border border-gray-600 p-3 rounded text-white" required value={newItem.name || ''} onChange={e => setNewItem({...newItem, name: e.target.value})} />
          
          <div className="grid grid-cols-2 gap-4">
            <input type="number" placeholder="Full Price" className="w-full bg-gray-900 border border-gray-600 p-3 rounded text-white" required value={newItem.priceFull || ''} onChange={e => setNewItem({...newItem, priceFull: Number(e.target.value)})} />
            <input type="number" placeholder="Half Price (Opt)" className="w-full bg-gray-900 border border-gray-600 p-3 rounded text-white" value={newItem.priceHalf || ''} onChange={e => setNewItem({...newItem, priceHalf: Number(e.target.value)})} />
          </div>

          <select className="w-full bg-gray-900 border border-gray-600 p-3 rounded text-white" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}>
            <option>Starters</option>
            <option>Soups</option>
            <option>Rice</option>
            <option>Noodles</option>
            <option>Main Course</option>
            <option>Beverages</option>
          </select>

          <textarea placeholder="Description" className="w-full bg-gray-900 border border-gray-600 p-3 rounded text-white h-24" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})}></textarea>
          
          <div className="flex items-center gap-3 text-gray-300">
            <input type="checkbox" checked={newItem.isVeg} onChange={e => setNewItem({...newItem, isVeg: e.target.checked})} className="w-5 h-5 rounded accent-green-500" />
            <label>Is Vegetarian?</label>
          </div>

          <button type="submit" className="w-full bg-dragon-gold text-black font-bold py-3 rounded hover:bg-yellow-400">Add to Menu</button>
        </form>
      </div>

      <div className="lg:col-span-2 space-y-4">
        {menu.map(item => (
          <div key={item.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img src={item.image} alt="" className="w-16 h-16 rounded object-cover bg-gray-700" />
              <div>
                <h4 className="text-white font-bold">{item.name}</h4>
                <p className="text-sm text-gray-400">{item.category} • ₹{item.priceFull}</p>
              </div>
            </div>
            <button onClick={() => handleDeleteItem(item.id)} className="p-2 text-red-400 hover:bg-red-900/30 rounded"><Trash2 size={20} /></button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTables = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-fadeIn">
      {db.getTables().map(table => (
        <div key={table.id} className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col items-center text-center hover:border-dragon-gold transition-colors group">
          <div className="bg-white p-2 rounded-lg mb-4">
            <QrCode className="w-24 h-24 text-black" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Table {table.number}</h3>
          <button 
            onClick={() => window.open(`#/table/${table.id}`, '_blank')}
            className="text-xs text-dragon-gold border border-dragon-gold px-3 py-1 rounded hover:bg-dragon-gold hover:text-black transition-colors"
          >
            Simulate Scan
          </button>
        </div>
      ))}
    </div>
  );

  const renderFinances = () => {
    // Calculate Daily Income Breakdown
    const todayOrders = db.getOrders().filter(o => o.createdAt >= new Date().setHours(0,0,0,0));
    const cashIncome = todayOrders.filter(o => o.paymentMethod === PaymentMethod.CASH && o.paymentStatus === PaymentStatus.PAID).reduce((acc, c) => acc + c.totalAmount, 0);
    const onlineIncome = todayOrders.filter(o => o.paymentMethod === PaymentMethod.ONLINE && o.paymentStatus === PaymentStatus.PAID).reduce((acc, c) => acc + c.totalAmount, 0);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
        
        {/* Daily Breakdown Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <p className="text-gray-400 text-sm">Today's Total Revenue</p>
              <h3 className="text-3xl font-bold text-white">₹{stats.todayRevenue}</h3>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 relative overflow-hidden">
               <div className="relative z-10">
                 <p className="text-gray-400 text-sm flex items-center gap-2"><Banknote size={16}/> Cash Collection</p>
                 <h3 className="text-3xl font-bold text-green-400">₹{cashIncome}</h3>
               </div>
               <Banknote className="absolute right-4 bottom-4 text-green-500/10 w-16 h-16" />
            </div>
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 relative overflow-hidden">
               <div className="relative z-10">
                 <p className="text-gray-400 text-sm flex items-center gap-2"><CreditCard size={16}/> Online / UPI</p>
                 <h3 className="text-3xl font-bold text-blue-400">₹{onlineIncome}</h3>
               </div>
               <CreditCard className="absolute right-4 bottom-4 text-blue-500/10 w-16 h-16" />
            </div>
             <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <p className="text-gray-400 text-sm">Net Profit (Month)</p>
              <h3 className={`text-3xl font-bold ${stats.monthProfit >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                 {stats.monthProfit >= 0 ? '+' : ''}₹{stats.monthProfit}
              </h3>
            </div>
        </div>

        {/* Add Expense Form */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-fit">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Wallet size={18}/> Add Daily Expense</h3>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <input 
                type="text" 
                placeholder="Description (e.g. Vegetables)" 
                className="w-full bg-gray-900 border border-gray-600 p-3 rounded text-white" 
                required 
                value={newExpense.description || ''} 
                onChange={e => setNewExpense({...newExpense, description: e.target.value})} 
              />
              
              <input 
                type="number" 
                placeholder="Amount (₹)" 
                className="w-full bg-gray-900 border border-gray-600 p-3 rounded text-white" 
                required 
                value={newExpense.amount || ''} 
                onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})} 
              />

              <select 
                className="w-full bg-gray-900 border border-gray-600 p-3 rounded text-white" 
                value={newExpense.category} 
                onChange={e => setNewExpense({...newExpense, category: e.target.value})}
              >
                <option>Inventory</option>
                <option>Staff Salary</option>
                <option>Maintenance</option>
                <option>Utilities</option>
                <option>Other</option>
              </select>

              <button type="submit" className="w-full bg-red-600 text-white font-bold py-3 rounded hover:bg-red-700">Add Expense</button>
            </form>

            <div className="mt-8 border-t border-gray-700 pt-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><FileText size={18}/> Reports Center</h3>
              <div className="space-y-3">
                 <button onClick={() => exportOrders('today')} className="w-full flex items-center justify-between bg-gray-900 hover:bg-gray-700 p-3 rounded text-sm text-gray-300 transition-colors">
                    <span>Today's Sales Report (CSV)</span>
                    <Download size={16} />
                 </button>
                 <button onClick={() => exportOrders('all')} className="w-full flex items-center justify-between bg-gray-900 hover:bg-gray-700 p-3 rounded text-sm text-gray-300 transition-colors">
                    <span>Full Sales History (CSV)</span>
                    <Download size={16} />
                 </button>
                 <button onClick={exportExpenses} className="w-full flex items-center justify-between bg-gray-900 hover:bg-gray-700 p-3 rounded text-sm text-gray-300 transition-colors">
                    <span>Expense Report (CSV)</span>
                    <Download size={16} />
                 </button>
              </div>
            </div>
        </div>

        {/* Expenses List & Chart */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4">Financial Overview</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                    <XAxis type="number" stroke="#9CA3AF" />
                    <YAxis dataKey="name" type="category" stroke="#9CA3AF" />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', color: '#fff' }} />
                    <Bar dataKey="amount" fill="#8884d8">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4">Recent Expenses</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {expenses.length === 0 && <p className="text-gray-500 text-center">No expenses recorded yet.</p>}
                  {expenses.slice().reverse().map(exp => (
                    <div key={exp.id} className="flex justify-between items-center bg-gray-900 p-3 rounded border border-gray-800">
                      <div>
                        <p className="font-bold text-white">{exp.description}</p>
                        <p className="text-xs text-gray-500">{new Date(exp.date).toLocaleDateString()} • {exp.category}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-red-400 font-bold">-₹{exp.amount}</span>
                        <button onClick={() => handleDeleteExpense(exp.id)} className="text-gray-600 hover:text-red-500"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
        </div>
      </div>
    );
  };

  return (
    <Layout role="admin">
      <div className="flex gap-4 mb-8 border-b border-gray-700 pb-1 overflow-x-auto">
        <button onClick={() => setActiveTab('overview')} className={`pb-3 px-2 font-medium transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'text-dragon-gold border-b-2 border-dragon-gold' : 'text-gray-400'}`}>Overview</button>
        <button onClick={() => setActiveTab('finances')} className={`pb-3 px-2 font-medium transition-colors whitespace-nowrap ${activeTab === 'finances' ? 'text-dragon-gold border-b-2 border-dragon-gold' : 'text-gray-400'}`}>Finances & P/L</button>
        <button onClick={() => setActiveTab('menu')} className={`pb-3 px-2 font-medium transition-colors whitespace-nowrap ${activeTab === 'menu' ? 'text-dragon-gold border-b-2 border-dragon-gold' : 'text-gray-400'}`}>Menu Management</button>
        <button onClick={() => setActiveTab('tables')} className={`pb-3 px-2 font-medium transition-colors whitespace-nowrap ${activeTab === 'tables' ? 'text-dragon-gold border-b-2 border-dragon-gold' : 'text-gray-400'}`}>Tables & QR</button>
      </div>
      
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'menu' && renderMenu()}
      {activeTab === 'tables' && renderTables()}
      {activeTab === 'finances' && renderFinances()}
    </Layout>
  );
};

export default AdminDashboard;
