import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserRecords } from '../services/mockDb';
import { EnhancementRecord, PlanType } from '../types';
import { Clock, Download, MessageSquare, ShieldCheck, Zap, LogOut } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { MOCK_ADMIN_EMAIL } from '../constants';

export const Account: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<EnhancementRecord[]>([]);

  useEffect(() => {
    if (!user) {
        navigate('/login');
        return;
    }
    setHistory(getUserRecords(user.id));
  }, [user, navigate]);

  if (!user) return null;

  const isProYearly = user.plan === PlanType.PREMIUM_YEARLY;
  const isPro = user.plan === PlanType.PREMIUM_MONTHLY || isProYearly;

  const handleLogout = () => {
      logout();
      navigate('/');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Profile Header */}
      <div className="bg-surface p-6 rounded-2xl border border-gray-700 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-green-700 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{user.name}</h2>
            <p className="text-gray-400">{user.email}</p>
            {isPro && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 text-purple-300 mt-1 border border-purple-500/30">
                    <ShieldCheck className="w-3 h-3 mr-1" /> PRO MEMBER
                </span>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-3 w-full md:w-auto">
          <div className="text-right w-full">
            <p className="text-sm text-gray-400">Current Plan</p>
            <p className="text-xl font-bold text-primary uppercase tracking-wide">{user.plan.replace('_', ' ')}</p>
          </div>
          
          <div className="bg-dark px-6 py-3 rounded-xl border border-gray-600 flex items-center justify-between w-full md:w-auto min-w-[200px]">
             <span className="text-gray-400 text-sm mr-4">Credits</span>
             <div className="flex items-center">
                 <Zap className="text-yellow-400 w-4 h-4 mr-1 fill-yellow-400" />
                 <span className="font-mono font-bold text-white text-lg">
                    {user.credits > 1000 ? 'Unlimited' : user.credits}
                 </span>
             </div>
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center space-x-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 px-4 py-2 rounded-lg transition-colors text-sm font-bold mt-2"
          >
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Pro Features / Upsell */}
      {!isPro ? (
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-1 shadow-lg">
              <div className="bg-surface rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center">
                      <div className="p-3 bg-yellow-500/10 rounded-full mr-4">
                          <Zap className="text-yellow-400 h-6 w-6" />
                      </div>
                      <div>
                          <h4 className="font-bold text-white">Unlock Pro Features</h4>
                          <p className="text-sm text-gray-400">Get unlimited enhancements, no ads, and magic editing.</p>
                      </div>
                  </div>
                  <Link to="/pricing" className="bg-primary hover:bg-green-600 text-white px-6 py-2 rounded-lg font-bold transition-colors whitespace-nowrap">
                      Upgrade Now
                  </Link>
              </div>
          </div>
      ) : isProYearly && (
          // Yearly Pro Exclusive Section
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in">
              <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-500/20 rounded-full">
                    <MessageSquare className="text-purple-300 h-6 w-6" />
                  </div>
                  <div>
                      <h4 className="font-bold text-white text-lg">VIP Support Access</h4>
                      <p className="text-sm text-purple-200">As a Yearly Pro member, you have direct access to our admin team.</p>
                  </div>
              </div>
              <a 
                href={`mailto:${MOCK_ADMIN_EMAIL}?subject=VIP Support Request from ${user.email}`}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center shadow-lg shadow-purple-900/20"
              >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Chat with Admin
              </a>
          </div>
      )}

      {/* History Grid */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center text-white">
            <Clock className="mr-2 text-primary" /> Recent Enhancements
        </h3>
        
        {history.length === 0 ? (
            <div className="text-center py-16 text-gray-500 bg-surface rounded-xl border border-gray-700 border-dashed">
                <p className="mb-4">No history yet.</p>
                <Link to="/" className="text-primary hover:underline font-bold">Start enhancing images</Link>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {history.map(record => (
                    <div key={record.id} className="bg-surface rounded-xl border border-gray-700 overflow-hidden group hover:border-primary/50 transition-colors shadow-lg">
                        <div className="relative h-48 bg-black/50">
                            <img src={record.enhancedImage} alt="Enhanced" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <a 
                                    href={record.enhancedImage} 
                                    download={`enhanced-ravelon-${record.id}.png`}
                                    className="bg-white text-dark p-2 rounded-full hover:bg-primary hover:text-white transition-colors transform hover:scale-110"
                                    title="Download"
                                >
                                    <Download size={20} />
                                </a>
                            </div>
                        </div>
                        <div className="p-4 flex justify-between items-center text-sm text-gray-400 bg-gray-800/50">
                            <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                            <span className="text-xs bg-gray-700 px-2 py-1 rounded">HD</span>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};