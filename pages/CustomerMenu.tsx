
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Search, ChevronRight, User, MapPin, Phone } from 'lucide-react';
import { db } from '../services/database';
import { MenuItem, CartItem, OrderStatus, PaymentMethod } from '../types';
import Layout from '../components/Layout';

const CustomerMenu = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [isProcessing, setIsProcessing] = useState(false);

  // Customer Details State
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [errors, setErrors] = useState<{phone?: string, name?: string}>({});

  useEffect(() => {
    setMenu(db.getMenu());
    if (tableId === 'counter') {
      setCustomerAddress('Parcel / Takeaway');
    }
  }, [tableId]);

  const categories = ['All', ...Array.from(new Set(menu.map(m => m.category)))];

  const addToCart = (item: MenuItem, variant: 'Full' | 'Half') => {
    setCart(prev => {
      const existing = prev.find(i => i.menuItemId === item.id && i.variant === variant);
      if (existing) {
        return prev.map(i => i.menuItemId === item.id && i.variant === variant 
          ? { ...i, quantity: i.quantity + 1 } 
          : i
        );
      }
      return [...prev, {
        menuItemId: item.id,
        name: item.name,
        variant,
        price: variant === 'Full' ? item.priceFull : item.priceHalf!,
        quantity: 1
      }];
    });
  };

  const removeFromCart = (menuItemId: string, variant: 'Full' | 'Half') => {
    setCart(prev => {
      const existing = prev.find(i => i.menuItemId === menuItemId && i.variant === variant);
      if (existing && existing.quantity > 1) {
        return prev.map(i => i.menuItemId === menuItemId && i.variant === variant
          ? { ...i, quantity: i.quantity - 1 }
          : i
        );
      }
      return prev.filter(i => !(i.menuItemId === menuItemId && i.variant === variant));
    });
  };

  const validate = () => {
    const newErrors: any = {};
    if (!customerName.trim()) newErrors.name = "Name is required";
    
    // 10 Digit Phone Validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!customerPhone.match(phoneRegex)) {
      newErrors.phone = "Please enter a valid 10-digit mobile number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const placeOrder = async () => {
    if (cart.length === 0) return;
    
    if (!validate()) return;

    setIsProcessing(true);

    // Simulate API delay
    setTimeout(() => {
      const order = db.createOrder({
        tableId: tableId,
        items: cart,
        totalAmount: cartTotal,
        paymentMethod,
        customerDetails: {
          name: customerName,
          phone: customerPhone,
          address: customerAddress || 'Dine-in'
        }
      });
      setIsProcessing(false);
      navigate(`/track/${order.id}`);
    }, 2000);
  };

  const filteredMenu = menu.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (isCartOpen) {
    return (
      <Layout role="customer">
        <div className="max-w-md mx-auto bg-dragon-dark min-h-[80vh] flex flex-col">
          <div className="flex items-center gap-2 mb-6 cursor-pointer text-dragon-gold" onClick={() => setIsCartOpen(false)}>
            <ChevronRight className="rotate-180" /> Back to Menu
          </div>
          
          <h2 className="text-2xl font-serif text-white mb-6 border-b border-gray-800 pb-2">Checkout</h2>
          
          <div className="flex-1 overflow-y-auto space-y-6 mb-6">
            {/* Customer Details Form */}
            <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 space-y-4">
              <h3 className="text-dragon-gold font-bold flex items-center gap-2"><User size={18}/> Contact Details</h3>
              
              <div>
                <label className="text-xs text-gray-400 block mb-1">Full Name *</label>
                <input 
                  type="text" 
                  className={`w-full bg-black border ${errors.name ? 'border-red-500' : 'border-gray-700'} rounded p-2 text-white`}
                  placeholder="John Doe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Mobile Number (10 Digits) *</label>
                <input 
                  type="tel" 
                  maxLength={10}
                  className={`w-full bg-black border ${errors.phone ? 'border-red-500' : 'border-gray-700'} rounded p-2 text-white`}
                  placeholder="9876543210"
                  value={customerPhone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setCustomerPhone(val);
                  }}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Address / Table Note</label>
                <textarea 
                  className="w-full bg-black border border-gray-700 rounded p-2 text-white h-20"
                  placeholder={tableId === 'counter' ? "Parcel / Takeaway" : "Table 5, Corner Seat..."}
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                />
              </div>
            </div>

            {/* Cart Items */}
            <div className="space-y-4">
              <h3 className="text-white font-bold px-1">Order Items</h3>
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Your cart is empty.</p>
              ) : (
                cart.map((item, idx) => (
                  <div key={`${item.menuItemId}-${item.variant}`} className="flex justify-between items-center bg-gray-900 p-3 rounded-lg border border-gray-800">
                    <div>
                      <h4 className="text-white font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-400">{item.variant} • ₹{item.price}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-black rounded-lg p-1 border border-gray-700">
                      <button onClick={() => removeFromCart(item.menuItemId, item.variant)} className="p-1 hover:text-red-500"><Minus size={16}/></button>
                      <span className="font-bold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => addToCart(menu.find(m => m.id === item.menuItemId)!, item.variant)} className="p-1 hover:text-green-500"><Plus size={16}/></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 shadow-xl">
             <div className="flex justify-between mb-2 text-gray-400">
               <span>Subtotal</span>
               <span>₹{cartTotal}</span>
             </div>
             <div className="flex justify-between mb-6 text-xl font-bold text-dragon-gold">
               <span>Total</span>
               <span>₹{cartTotal}</span>
             </div>

             <div className="space-y-3 mb-6">
               <label className="text-sm text-gray-400 block mb-2">Payment Method</label>
               <div className="grid grid-cols-2 gap-3">
                 <button 
                   onClick={() => setPaymentMethod(PaymentMethod.CASH)}
                   className={`p-3 rounded-lg border ${paymentMethod === PaymentMethod.CASH ? 'border-dragon-gold bg-dragon-gold/10 text-dragon-gold' : 'border-gray-700 text-gray-400'}`}
                 >
                   Cash
                 </button>
                 <button 
                   onClick={() => setPaymentMethod(PaymentMethod.ONLINE)}
                   className={`p-3 rounded-lg border ${paymentMethod === PaymentMethod.ONLINE ? 'border-dragon-gold bg-dragon-gold/10 text-dragon-gold' : 'border-gray-700 text-gray-400'}`}
                 >
                   UPI / Online
                 </button>
               </div>
             </div>

             <button 
              disabled={cart.length === 0 || isProcessing}
              onClick={placeOrder}
              className="w-full bg-dragon-red hover:bg-red-800 text-white font-bold py-4 rounded-lg flex justify-center items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {isProcessing ? 'Processing...' : `Place Order • ₹${cartTotal}`}
             </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="customer">
      <div className="sticky top-0 bg-black/95 z-40 pb-4 pt-2 -mx-4 px-4 border-b border-gray-800">
        <div className="relative mb-4">
          <input 
            type="text"
            placeholder="Search for dishes..."
            className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 pl-10 text-white focus:outline-none focus:border-dragon-gold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-3.5 text-gray-500 w-5 h-5" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat 
                  ? 'bg-dragon-gold text-black' 
                  : 'bg-gray-800 text-gray-400 border border-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {filteredMenu.map(item => (
          <div key={item.id} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-lg flex flex-col">
            <div className="h-48 overflow-hidden relative">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2">
                 <span className={`px-2 py-1 rounded text-xs font-bold ${item.isVeg ? 'bg-green-900 text-green-400 border border-green-700' : 'bg-red-900 text-red-400 border border-red-700'}`}>
                   {item.isVeg ? 'VEG' : 'NON-VEG'}
                 </span>
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-serif text-lg font-bold text-white">{item.name}</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{item.description}</p>
              
              <div className="mt-auto space-y-3">
                 <div className="flex justify-between items-center bg-black/50 p-2 rounded">
                    <span className="text-gray-300">Full <span className="text-dragon-gold font-bold ml-1">₹{item.priceFull}</span></span>
                    <button 
                      onClick={() => addToCart(item, 'Full')}
                      className="bg-dragon-red text-white px-3 py-1 rounded text-sm hover:bg-red-800"
                    >
                      ADD +
                    </button>
                 </div>
                 {item.priceHalf && (
                   <div className="flex justify-between items-center bg-black/50 p-2 rounded">
                      <span className="text-gray-300">Half <span className="text-dragon-gold font-bold ml-1">₹{item.priceHalf}</span></span>
                      <button 
                        onClick={() => addToCart(item, 'Half')}
                        className="bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                      >
                        ADD +
                      </button>
                   </div>
                 )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {cartCount > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-50 animate-bounce-slight">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-dragon-gold text-black font-bold py-3 px-6 rounded-xl shadow-2xl flex justify-between items-center border-2 border-yellow-600"
          >
            <div className="flex items-center gap-2">
              <div className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
                {cartCount}
              </div>
              <span className="text-lg">View Cart</span>
            </div>
            <span className="text-xl">₹{cartTotal}</span>
          </button>
        </div>
      )}
    </Layout>
  );
};

export default CustomerMenu;
