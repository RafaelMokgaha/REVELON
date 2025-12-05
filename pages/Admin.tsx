import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUsers, banUser, addCredits } from '../services/mockDb';
import { User, Role } from '../types';
import { useNavigate } from 'react-router-dom';
import { Trash2, PlusCircle, Search } from 'lucide-react';

export const Admin: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!user || user.role !== Role.ADMIN) {
        navigate('/');
        return;
    }
    setAllUsers(getUsers());
  }, [user, navigate]);

  const refreshList = () => {
    setAllUsers(getUsers());
  };

  const handleBan = (id: string) => {
    if(confirm("Ban this user?")) {
        banUser(id);
        refreshList();
    }
  };

  const handleManualCredit = (id: string) => {
      const amount = prompt("Amount of credits to add:");
      if(amount) {
          addCredits(id, parseInt(amount));
          refreshList();
      }
  };

  const filteredUsers = allUsers.filter(u => 
    u.email.toLowerCase().includes(filter.toLowerCase()) || 
    u.name.toLowerCase().includes(filter.toLowerCase())
  );

  if (!user || user.role !== Role.ADMIN) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Admin Dashboard</h2>
        <div className="bg-surface text-gray-300 px-4 py-2 rounded-lg border border-gray-700">
            Total Users: {allUsers.length}
        </div>
      </div>

      <div className="bg-surface p-4 rounded-xl border border-gray-700 flex items-center">
        <Search className="text-gray-400 mr-2" />
        <input 
            type="text" 
            placeholder="Search users by name or email..." 
            className="bg-transparent border-none focus:outline-none text-white w-full"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <div className="bg-surface rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-800 text-gray-400">
                    <tr>
                        <th className="p-4">User</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Plan</th>
                        <th className="p-4">Credits</th>
                        <th className="p-4">Last Active</th>
                        <th className="p-4">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                    {filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-gray-700/50">
                            <td className="p-4">
                                <div className="font-bold">{u.name}</div>
                                <div className="text-xs text-gray-400">{u.email}</div>
                            </td>
                            <td className="p-4">
                                <span className={`text-xs px-2 py-1 rounded ${u.role === Role.ADMIN ? 'bg-purple-500/20 text-purple-300' : 'bg-gray-700 text-gray-300'}`}>
                                    {u.role}
                                </span>
                            </td>
                            <td className="p-4">
                                <span className={`text-xs px-2 py-1 rounded ${u.plan.includes('PREMIUM') ? 'bg-primary/20 text-primary' : 'bg-gray-600 text-gray-300'}`}>
                                    {u.plan}
                                </span>
                            </td>
                            <td className="p-4 font-mono">{u.credits}</td>
                            <td className="p-4 text-sm text-gray-400">{new Date(u.lastLogin).toLocaleDateString()}</td>
                            <td className="p-4 flex gap-2">
                                <button 
                                    onClick={() => handleManualCredit(u.id)}
                                    className="p-2 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20"
                                    title="Add Credits"
                                >
                                    <PlusCircle size={16} />
                                </button>
                                {u.id !== user.id && (
                                    <button 
                                        onClick={() => handleBan(u.id)}
                                        className="p-2 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20"
                                        title="Ban User"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};