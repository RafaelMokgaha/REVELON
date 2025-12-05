import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    
    login(email, name);
    // Since login is async but mocked, we wait a bit in reality, 
    // but the context handles loading state. 
    // Navigate happens after effect updates, but for simplicity:
    setTimeout(() => {
        navigate('/');
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md bg-surface p-8 rounded-2xl border border-gray-700 shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Welcome Back</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-dark border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
              placeholder="John Doe"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-dark border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
              placeholder="john@example.com"
              required
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-primary hover:bg-green-600 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : 'Sign In / Register'}
            </button>
            <p className="text-center text-xs text-gray-500 mt-4">
              Note: This is a demo. Use "admin@ravelon.com" for Admin access.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};