import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChefHat, LayoutDashboard, UtensilsCrossed, LogOut, Coffee } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  role?: 'admin' | 'chef' | 'customer';
}

const Layout: React.FC<LayoutProps> = ({ children, role = 'customer' }) => {
  const location = useLocation();

  if (role === 'customer') {
    return (
      <div className="min-h-screen bg-black/95 text-yellow-500 font-sans pb-20">
        <header className="bg-dragon-red p-4 shadow-lg border-b-4 border-dragon-gold sticky top-0 z-50">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-dragon-gold p-1.5 rounded-full">
                <UtensilsCrossed className="w-6 h-6 text-dragon-red" />
              </div>
              <h1 className="text-xl font-serif font-bold tracking-wide text-dragon-gold drop-shadow-md">
                KRAFTY KITCHEN
              </h1>
            </div>
            <Link to="/" className="flex items-center gap-2 bg-black/20 hover:bg-black/40 text-dragon-gold px-3 py-1.5 rounded-lg transition-all text-sm font-bold border border-dragon-gold/20">
               <LogOut size={16} />
               <span>Exit</span>
            </Link>
          </div>
        </header>
        <main className="container mx-auto p-4 animate-fadeIn">
          {children}
        </main>
      </div>
    );
  }

  // Admin / Chef Layout
  const isActive = (path: string) => location.pathname === path ? 'bg-dragon-red text-white' : 'text-gray-400 hover:text-white hover:bg-white/10';

  return (
    <div className="min-h-screen flex bg-gray-900 text-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-black border-r border-gray-800 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
          <div className="bg-dragon-red p-2 rounded">
             <ChefHat className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-lg tracking-wider">KRAFTY ADMIN</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {role === 'admin' && (
            <>
              <Link to="/admin" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/admin')}`}>
                <LayoutDashboard size={20} />
                Dashboard
              </Link>
              <Link to="/admin/menu" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/admin/menu')}`}>
                <Coffee size={20} />
                Menu Management
              </Link>
              <Link to="/admin/tables" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/admin/tables')}`}>
                <UtensilsCrossed size={20} />
                Tables & QR
              </Link>
            </>
          )}
          {role === 'chef' && (
            <Link to="/chef" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/chef')}`}>
              <ChefHat size={20} />
              Kitchen Orders
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-gray-800">
           <Link to="/" className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-lg">
             <LogOut size={20} />
             Logout
           </Link>
        </div>
      </aside>

      {/* Mobile Header for Admin/Chef */}
      <div className="flex-1 flex flex-col">
        <header className="md:hidden bg-black p-4 border-b border-gray-800 flex justify-between items-center">
             <span className="font-bold">Krafty Kitchen Panel</span>
             <Link to="/" className="text-sm text-red-400">Exit</Link>
        </header>
        <main className="flex-1 p-6 overflow-auto bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;