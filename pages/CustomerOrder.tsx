import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, CheckCircle, ChefHat, ShoppingBag, RefreshCw } from 'lucide-react';
import { db } from '../services/database';
import { Order, OrderStatus } from '../types';
import Layout from '../components/Layout';

const CustomerOrder = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    // Polling for simulation
    const interval = setInterval(() => {
      const o = db.getOrderById(orderId!);
      setOrder(o);
      setNow(Date.now());
    }, 2000);

    return () => clearInterval(interval);
  }, [orderId]);

  if (!order) {
    return (
      <Layout>
        <div className="text-center mt-20">
          <RefreshCw className="w-10 h-10 animate-spin mx-auto text-dragon-gold" />
          <p className="mt-4">Loading order details...</p>
        </div>
      </Layout>
    );
  }

  const steps = [
    { status: OrderStatus.PENDING, label: 'Pending', icon: Clock },
    { status: OrderStatus.ACCEPTED, label: 'Accepted', icon: CheckCircle },
    { status: OrderStatus.PREPARING, label: 'Preparing', icon: ChefHat },
    { status: OrderStatus.READY, label: 'Ready', icon: ShoppingBag },
  ];

  const currentStepIndex = steps.findIndex(s => s.status === order.status);
  const progressPercent = Math.max(5, ((currentStepIndex + 1) / steps.length) * 100);

  return (
    <Layout role="customer">
      <div className="max-w-lg mx-auto">
        <div className="bg-gradient-to-br from-dragon-red to-red-900 rounded-2xl p-6 text-center text-white shadow-lg border border-red-700 mb-6">
          <p className="text-sm opacity-80 uppercase tracking-widest mb-1">Token Number</p>
          <h1 className="text-5xl font-bold font-mono tracking-tighter mb-4">{order.token}</h1>
          <div className="inline-block bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
             Estimated Wait: <span className="font-bold text-dragon-gold text-lg">{order.estimatedTime} mins</span>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-6">
           <h3 className="text-xl font-serif text-white mb-6">Order Status</h3>
           <div className="relative">
             {/* Line */}
             <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-700"></div>
             
             <div className="space-y-8">
               {steps.map((step, idx) => {
                 const isCompleted = idx <= currentStepIndex;
                 const isCurrent = idx === currentStepIndex;
                 const Icon = step.icon;

                 return (
                   <div key={step.label} className="relative flex items-center gap-4">
                      <div className={`z-10 w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isCompleted ? 'bg-dragon-gold border-dragon-gold text-black' : 'bg-gray-800 border-gray-600 text-gray-500'}`}>
                         <Icon size={18} />
                      </div>
                      <div className={isCurrent ? 'animate-pulse' : ''}>
                        <p className={`font-bold ${isCompleted ? 'text-white' : 'text-gray-500'}`}>{step.label}</p>
                        {isCurrent && <p className="text-xs text-dragon-gold mt-1">Happening now...</p>}
                      </div>
                   </div>
                 )
               })}
             </div>
           </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
           <h3 className="text-lg font-serif text-white mb-4">Order Summary</h3>
           <div className="space-y-3 mb-4">
             {order.items.map((item, idx) => (
               <div key={idx} className="flex justify-between text-sm">
                 <span className="text-gray-300">{item.quantity} x {item.name} ({item.variant})</span>
                 <span className="text-gray-400">₹{item.price * item.quantity}</span>
               </div>
             ))}
           </div>
           <div className="border-t border-gray-800 pt-3 flex justify-between font-bold text-lg text-dragon-gold">
             <span>Total Paid</span>
             <span>₹{order.totalAmount}</span>
           </div>
        </div>

        <div className="mt-8 text-center">
          <Link to={`/table/${order.tableId}`} className="text-dragon-gold underline hover:text-white">
            Place another order
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default CustomerOrder;