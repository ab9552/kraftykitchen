import React from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CustomerMenu from './pages/CustomerMenu';
import CustomerOrder from './pages/CustomerOrder';
import AdminDashboard from './pages/AdminDashboard';
import ChefDashboard from './pages/ChefDashboard';

const Landing = () => (
  <div className="min-h-screen bg-dragon-dark text-white flex flex-col items-center justify-center p-6 text-center">
    <div className="max-w-md w-full space-y-8">
      <div>
        <h1 className="text-4xl font-serif font-bold text-dragon-gold mb-2">Krafty Kitchen</h1>
        <p className="text-gray-400 text-lg">By Chef Akhlaque</p>
        <p className="text-gray-500 text-sm mt-1">Premium Hotel Order Management System</p>
      </div>

      <div className="grid gap-4">
        <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
          <h2 className="text-xl font-bold mb-4">I am a Customer</h2>
          <p className="text-sm text-gray-500 mb-4">Select an option to simulate an order:</p>
          <div className="space-y-3">
            <Link to="/table/table-1" className="block w-full bg-dragon-red text-white py-3 rounded-lg font-bold hover:bg-red-800 transition shadow-lg shadow-red-900/20">
               Dine-In (Table 1)
            </Link>
            <Link to="/table/counter" className="block w-full bg-gray-700 text-white py-3 rounded-lg font-bold hover:bg-gray-600 transition border border-gray-600">
               Walking Customer / Parcel
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Link to="/admin" className="p-6 bg-gray-900 rounded-xl border border-gray-800 hover:border-dragon-gold transition group">
             <h2 className="text-lg font-bold text-gray-200 group-hover:text-dragon-gold">Admin Panel</h2>
             <p className="text-xs text-gray-500 mt-2">Manage menu & stats</p>
          </Link>
          <Link to="/chef" className="p-6 bg-gray-900 rounded-xl border border-gray-800 hover:border-dragon-gold transition group">
             <h2 className="text-lg font-bold text-gray-200 group-hover:text-dragon-gold">Chef Panel</h2>
             <p className="text-xs text-gray-500 mt-2">Kitchen Display System</p>
          </Link>
        </div>
      </div>
      
      <p className="text-xs text-gray-600 mt-10">
        Note: This demo uses LocalStorage. Data persists until you clear browser cache.
        Mobile Apps (React Native/Flutter) share this same API logic but use native UI components.
      </p>
    </div>
  </div>
);

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        
        {/* Customer Routes */}
        <Route path="/table/:tableId" element={<CustomerMenu />} />
        <Route path="/track/:orderId" element={<CustomerOrder />} />
        
        {/* Staff Routes */}
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/chef" element={<ChefDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;