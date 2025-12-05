import React from 'react';
import { ExternalLink } from 'lucide-react';

export const BannerAd: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto mt-8 p-1 rounded-lg bg-gradient-to-r from-gray-800 to-gray-700 shadow-lg overflow-hidden border border-gray-600">
      <div className="bg-surface w-full h-32 md:h-24 flex flex-col md:flex-row items-center justify-between px-6 py-4 relative overflow-hidden">
        
        {/* Ad Label */}
        <div className="absolute top-0 right-0 bg-gray-600 text-[10px] px-2 py-0.5 text-gray-300">
          SPONSORED
        </div>

        {/* Content */}
        <div className="flex items-center space-x-4 z-10">
          <div className="bg-blue-600 p-3 rounded-lg hidden md:block">
            <ExternalLink className="text-white h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold text-gray-100 text-lg">Stop Wasting Time on Low Res Images</h4>
            <p className="text-sm text-gray-400">Upgrade to Pro for 4K exports and batch processing.</p>
          </div>
        </div>

        {/* CTA */}
        <a 
          href="#/pricing" 
          className="mt-4 md:mt-0 bg-white text-black px-6 py-2 rounded-full font-bold text-sm hover:bg-gray-200 transition-colors z-10"
        >
          Remove Ads
        </a>

        {/* Decorative Background */}
        <div className="absolute -left-10 -bottom-20 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute right-20 -top-10 w-20 h-20 bg-primary/10 rounded-full blur-xl pointer-events-none"></div>
      </div>
    </div>
  );
};