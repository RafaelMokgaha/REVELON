import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserRecords } from '../services/mockDb';
import { EnhancementRecord } from '../types';
import { Clock, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Account: React.FC = () => {
  const { user } = useAuth();
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

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="bg-surface p-6 rounded-2xl border border-gray-700 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-gray-400">{user.email}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Current Plan</p>
          <p className="text-xl font-bold text-primary">{user.plan.replace('_', ' ')}</p>
          <div className="mt-2 bg-dark px-4 py-2 rounded-lg inline-block border border-gray-600">
             <span className="font-mono font-bold text-yellow-400">{user.credits}</span> Credits Left
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center">
            <Clock className="mr-2" /> Recent Enhancements
        </h3>
        
        {history.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-surface rounded-xl border border-gray-700">
                No history yet. Start enhancing!
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {history.map(record => (
                    <div key={record.id} className="bg-surface rounded-xl border border-gray-700 overflow-hidden group">
                        <div className="relative h-48 bg-black/50">
                            <img src={record.enhancedImage} alt="Enhanced" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <a 
                                    href={record.enhancedImage} 
                                    download={`enhanced-${record.id}.png`}
                                    className="bg-white text-dark p-2 rounded-full hover:bg-primary hover:text-white transition-colors"
                                >
                                    <Download size={20} />
                                </a>
                            </div>
                        </div>
                        <div className="p-4 text-sm text-gray-400">
                            {new Date(record.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};