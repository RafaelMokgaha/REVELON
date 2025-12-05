import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Pricing } from './pages/Pricing';
import { Account } from './pages/Account';
import { Admin } from './pages/Admin';

const App: React.FC = () => {
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      // Check if we are in an environment that supports key selection (AI Studio)
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const has = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(has);
      } else {
        // Fallback for dev/other environments where aistudio might not be injected
        // We assume env vars are handled externally in that case
        setHasApiKey(true);
      }
    };
    checkKey();
  }, []);

  if (!hasApiKey) {
    return (
       <div className="min-h-screen bg-darker flex flex-col items-center justify-center p-4 text-center font-sans">
         <div className="bg-surface p-8 rounded-2xl border border-gray-700 shadow-2xl max-w-lg w-full">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-300 mb-4">
              AI Image Enhancer
            </h1>
            <p className="text-gray-300 mb-8 text-lg">
              To access our premium AI image enhancement models, you must connect your Google Cloud Project with a valid API Key.
            </p>
            
            <button
              onClick={async () => {
                if (window.aistudio) {
                  await window.aistudio.openSelectKey();
                  // Optimistic update to avoid race condition delay
                  setHasApiKey(true);
                }
              }}
              className="w-full bg-primary hover:bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-green-900/20"
            >
              Connect API Key
            </button>
            
            <div className="mt-8 pt-6 border-t border-gray-700">
               <a
                  href="https://ai.google.dev/gemini-api/docs/billing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-primary transition-colors underline"
               >
                 View API Billing & Pricing Documentation
               </a>
            </div>
         </div>
       </div>
    );
  }

  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/account" element={<Account />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;