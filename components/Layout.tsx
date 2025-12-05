import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wand2, Crown, User, LayoutDashboard, LogOut, Menu, X, Coins } from 'lucide-react';
import { Role } from '../types';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const isActive = (path: string) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
    <Link
      to={to}
      onClick={() => setIsMobileMenuOpen(false)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
        isActive(to) ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:text-white hover:bg-surface'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-darker flex flex-col">
      {/* Top Navigation */}
      <nav className="border-b border-gray-800 bg-dark/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24">
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src="https://static.wixstatic.com/media/a827d0_a1f5a012b54544a7b220148190b77feb~mv2.png" 
                alt="Logo" 
                className="h-20 w-auto object-contain"
              />
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <NavLink to="/" icon={Wand2} label="Enhance" />
              <NavLink to="/pricing" icon={Crown} label="Pricing" />
              
              {user ? (
                <>
                  <div className="flex items-center bg-surface px-3 py-1 rounded-full border border-gray-700">
                    <Coins size={16} className="text-yellow-400 mr-2" />
                    <span className="text-sm font-medium">{user.credits}</span>
                  </div>
                  
                  {user.role === Role.ADMIN && (
                    <NavLink to="/admin" icon={LayoutDashboard} label="Admin" />
                  )}
                  
                  <Link to="/account" className="flex items-center space-x-2 text-gray-300 hover:text-white ml-4">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center border border-gray-600">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </Link>
                </>
              ) : (
                <Link to="/login" className="bg-primary hover:bg-green-600 text-white px-5 py-2 rounded-lg font-medium transition-colors">
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-gray-400 hover:text-white"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-surface border-b border-gray-700 animate-fade-in">
          <div className="px-4 py-4 space-y-2">
            <NavLink to="/" icon={Wand2} label="Enhance" />
            <NavLink to="/pricing" icon={Crown} label="Pricing" />
            {user && (
               <>
                <div className="px-4 py-2 flex items-center text-gray-300">
                    <Coins size={16} className="text-yellow-400 mr-2" />
                    <span>Credits: {user.credits}</span>
                </div>
                <NavLink to="/account" icon={User} label="Account" />
                {user.role === Role.ADMIN && (
                    <NavLink to="/admin" icon={LayoutDashboard} label="Admin" />
                )}
                <button 
                    onClick={logout}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
               </>
            )}
            {!user && (
                 <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center bg-primary text-white py-3 rounded-lg font-bold">
                  Login
                </Link>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Bottom Sticky Mobile Nav (Optional, mostly for app-like feel) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-dark/90 backdrop-blur-lg border-t border-gray-800 flex justify-around p-3 z-40">
        <Link to="/" className={`flex flex-col items-center ${isActive('/') ? 'text-primary' : 'text-gray-500'}`}>
            <Wand2 size={24} />
            <span className="text-[10px] mt-1">Enhance</span>
        </Link>
        <Link to="/pricing" className={`flex flex-col items-center ${isActive('/pricing') ? 'text-primary' : 'text-gray-500'}`}>
            <Crown size={24} />
            <span className="text-[10px] mt-1">Upgrade</span>
        </Link>
        <Link to={user ? "/account" : "/login"} className={`flex flex-col items-center ${isActive('/account') || isActive('/login') ? 'text-primary' : 'text-gray-500'}`}>
            <User size={24} />
            <span className="text-[10px] mt-1">{user ? 'Account' : 'Login'}</span>
        </Link>
      </div>
      
      {/* Spacer for bottom nav */}
      <div className="md:hidden h-20" />
    </div>
  );
};