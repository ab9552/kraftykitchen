
import React, { useEffect, useState } from 'react';
import { db } from '../services/database';
import { Order, OrderStatus } from '../types';
import Layout from '../components/Layout';
import { Clock, Check, Play, Bell, User, Phone, MapPin } from 'lucide-react';

const ChefDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = () => {
      const allOrders = db.getOrders();
      // Filter for orders relevant to kitchen
      const active = allOrders.filter(o => 
        o.status !== OrderStatus.COMPLETED && 
        o.status !== OrderStatus.CANCELLED
      ).sort((a, b) => a.createdAt - b.createdAt);
      setOrders(active);
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = (id: string, status: OrderStatus) => {
    db.updateOrderStatus(id, status);
    // Force refresh
    const allOrders = db.getOrders();
    const active = allOrders.filter(o => 
      o.status !== OrderStatus.COMPLETED && 
      o.status !== OrderStatus.CANCELLED
    ).sort((a, b) => a.createdAt - b.createdAt);
    setOrders(active);
  };

  const updateTime = (id: string, current: number, change: number) => {
    db.updateWaitTime(id, Math.max(5, current + change));
    // Force refresh
    setOrders(prev => prev.map(o => o.id === id ? {...o, estimatedTime: Math.max(5, current + change)} : o));
  };

  const getStatusColor = (status: OrderStatus) => {
    switch(status) {
      case OrderStatus.PENDING: return 'border-l-4 border-yellow-500 bg-yellow-900/10';
      case OrderStatus.ACCEPTED: return 'border-l-4 border-blue-500 bg-blue-900/10';
      case OrderStatus.PREPARING: return 'border-l-4 border-orange-500 bg-orange-900/10';
      case OrderStatus.READY: return 'border-l-4 border-green-500 bg-green-900/10';
      default: return 'border-gray-700';
    }
  };

  return (
    <Layout role="chef">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif text-white">Krafty Kitchen KDS</h1>
          <p className="text-dragon-gold text-sm font-bold">Head Chef: Akhlaque</p>
        </div>
        <div className="flex items-center gap-2 text-dragon-gold animate-pulse">
           <Bell /> 
           <span className="font-bold">{orders.filter(o => o.status === OrderStatus.PENDING).length} Pending</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {orders.map(order => (
          <div key={order.id} className={`bg-gray-800 rounded-lg shadow-xl overflow-hidden flex flex-col ${getStatusColor(order.status)}`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-700 flex justify-between items-start bg-gray-800/50">
               <div>
                 <span className="text-xs text-gray-500 uppercase tracking-wider block">Token</span>
                 <h2 className="text-3xl font-bold text-white font-mono">{order.token}</h2>
                 <p className="text-sm text-gray-400 mt-1 font-bold">
                   {order.tableId === 'counter' ? '📦 Parcel / Walk-in' : `Table: ${order.tableId.replace('table-', '')}`}
                 </p>
               </div>
               <div className="text-right">
                 <div className="flex items-center gap-1 text-gray-300 text-sm justify-end">
                   <Clock size={14} />
                   <span>{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                 </div>
                 <div className="mt-2 flex items-center gap-1 bg-black/40 rounded p-1">
                   <button onClick={() => updateTime(order.id, order.estimatedTime, -5)} className="text-gray-500 hover:text-white px-2 font-bold">-</button>
                   <span className="text-dragon-gold font-bold min-w-[30px] text-center">{order.estimatedTime}m</span>
                   <button onClick={() => updateTime(order.id, order.estimatedTime, 5)} className="text-gray-500 hover:text-white px-2 font-bold">+</button>
                 </div>
               </div>
            </div>

            {/* Customer Details */}
            <div className="px-4 py-2 bg-black/20 border-b border-gray-700/50 text-xs text-gray-400 space-y-1">
               <div className="flex items-center gap-2">
                 <User size={12} className="text-dragon-gold"/>
                 <span className="text-white">{order.customerDetails?.name || 'Guest'}</span>
               </div>
               <div className="flex items-center gap-2">
                 <Phone size={12} className="text-dragon-gold"/>
                 <span>{order.customerDetails?.phone || 'N/A'}</span>
               </div>
               {order.customerDetails?.address && (
                <div className="flex items-center gap-2">
                  <MapPin size={12} className="text-dragon-gold"/>
                  <span className="truncate">{order.customerDetails.address}</span>
                </div>
               )}
            </div>

            {/* Items */}
            <div className="p-4 flex-1 overflow-y-auto max-h-[300px]">
              <ul className="space-y-3">
                {order.items.map((item, i) => (
                  <li key={i} className="flex justify-between items-start border-b border-gray-700/50 pb-2 last:border-0 last:pb-0">
                    <span className="text-gray-200 font-medium">
                      <span className="text-dragon-gold font-bold mr-2 text-lg">{item.quantity}x</span> 
                      {item.name}
                    </span>
                    <span className="text-xs text-gray-500 uppercase mt-1 bg-gray-900 px-2 py-1 rounded">{item.variant}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="p-3 bg-gray-900 border-t border-gray-700 grid grid-cols-1 gap-2">
              {order.status === OrderStatus.PENDING && (
                <button 
                  onClick={() => updateStatus(order.id, OrderStatus.ACCEPTED)}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold"
                >
                  Accept Order
                </button>
              )}
              {order.status === OrderStatus.ACCEPTED && (
                <button 
                  onClick={() => updateStatus(order.id, OrderStatus.PREPARING)}
                  className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white rounded font-bold flex items-center justify-center gap-2"
                >
                  <Play size={16} /> Start Cooking
                </button>
              )}
              {order.status === OrderStatus.PREPARING && (
                <button 
                  onClick={() => updateStatus(order.id, OrderStatus.READY)}
                  className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded font-bold flex items-center justify-center gap-2"
                >
                  <Check size={16} /> Mark Ready
                </button>
              )}
              {order.status === OrderStatus.READY && (
                <button 
                  onClick={() => updateStatus(order.id, OrderStatus.COMPLETED)}
                  className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded font-bold"
                >
                  Complete & Clear
                </button>
              )}
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="col-span-full text-center py-20 text-gray-600">
            <h3 className="text-xl">No active orders</h3>
            <p>Wait for customers to place orders via QR code.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ChefDashboard;
