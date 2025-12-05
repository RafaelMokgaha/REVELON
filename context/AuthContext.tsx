import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { getUserById, createUser, checkAndResetCredits } from '../services/mockDb';

interface AuthContextType {
  user: User | null;
  login: (email: string, name: string) => void;
  logout: () => void;
  refreshUser: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedId = localStorage.getItem('ravelon_current_user_id');
    if (storedId) {
      const foundUser = getUserById(storedId);
      if (foundUser) {
        // Check for daily credit reset on load
        const updatedUser = checkAndResetCredits(foundUser.id);
        setUser(updatedUser || foundUser);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, name: string) => {
    setIsLoading(true);
    // Simulate API delay
    setTimeout(() => {
        const loggedUser = createUser(email, name);
        localStorage.setItem('ravelon_current_user_id', loggedUser.id);
        setUser(loggedUser);
        setIsLoading(false);
    }, 800);
  };

  const logout = () => {
    localStorage.removeItem('ravelon_current_user_id');
    setUser(null);
  };

  const refreshUser = () => {
      if (user) {
          const updated = getUserById(user.id);
          if (updated) setUser(updated);
      }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};