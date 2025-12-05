import React, { useState, useEffect } from 'react';
import { X, PlaySquare, Loader2 } from 'lucide-react';

interface AdOverlayProps {
  isOpen: boolean;
  onComplete: () => void;
  actionName: string; // "Upload", "Enhance", or "Download"
}

export const AdOverlay: React.FC<AdOverlayProps> = ({ isOpen, onComplete, actionName }) => {
  const [timeLeft, setTimeLeft] = useState(5);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(5);
      setCanClose(false);
      
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanClose(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-surface border border-gray-700 rounded-2xl overflow-hidden shadow-2xl relative">
        
        {/* Ad Header */}
        <div className="bg-black p-4 flex justify-between items-center border-b border-gray-800">
          <span className="text-gray-400 text-xs font-mono">SPONSORED CONTENT</span>
          <div className="text-white text-sm font-bold">
            {canClose ? 'Reward Granted' : `Reward in ${timeLeft}s`}
          </div>
        </div>

        {/* Ad Content (Simulated) */}
        <div className="h-64 bg-gradient-to-br from-indigo-900 to-purple-900 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=800&q=80')] opacity-20 bg-cover bg-center" />
          
          <PlaySquare className="h-16 w-16 text-white mb-4 animate-pulse" />
          <h3 className="text-2xl font-bold text-white z-10 mb-2">Upgrade to Pro!</h3>
          <p className="text-indigo-200 z-10 text-sm">
            Experience 10x faster speeds and zero interruptions.
          </p>
          
          {!canClose && (
             <div className="mt-8 flex items-center space-x-2 text-white/80">
                <Loader2 className="animate-spin h-4 w-4" />
                <span className="text-xs">Watching ad to unlock {actionName}...</span>
             </div>
          )}
        </div>

        {/* Footer / Action */}
        <div className="p-4 bg-gray-900 flex justify-end">
          <button
            onClick={onComplete}
            disabled={!canClose}
            className={`
              px-6 py-2 rounded-lg font-bold text-sm transition-all
              ${canClose 
                ? 'bg-white text-black hover:bg-gray-200 hover:scale-105' 
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'}
            `}
          >
            {canClose ? `Skip Ad & ${actionName}` : `Wait ${timeLeft}s`}
          </button>
        </div>
      </div>
      
      <p className="mt-4 text-gray-500 text-xs">
        Ads keep Ravelon free. Upgrade to Pro to remove them.
      </p>
    </div>
  );
};