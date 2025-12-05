import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { enhanceImageWithGemini } from '../services/geminiService';
import { deductCredit, saveEnhancementRecord, addCredits, getGuestCredits, deductGuestCredit } from '../services/mockDb';
import { ComparisonSlider } from '../components/ComparisonSlider';
import { Upload, Zap, Loader2, Play, Lock, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AD_WATCH_REWARD, MAX_AD_REWARDS } from '../constants';

export const Home: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adsWatched, setAdsWatched] = useState(0);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [guestCredits, setGuestCredits] = useState<number>(0);

  useEffect(() => {
    if (!user) {
        setGuestCredits(getGuestCredits());
    }
  }, [user, enhancedImage]); // Refresh when image processed or user changes

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size too large. Max 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setOriginalImage(ev.target?.result as string);
        setEnhancedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEnhance = async () => {
    // Logic for Logged In User
    if (user) {
        if (user.credits <= 0) {
          setError("You are out of credits! Watch an ad or upgrade.");
          return;
        }
    } 
    // Logic for Guest
    else {
        const remaining = getGuestCredits();
        if (remaining <= 0) {
            setError("Guest Limit Reached");
            return;
        }
    }

    if (!originalImage) return;

    setIsProcessing(true);
    setError(null);

    try {
      // API Call
      const resultBase64 = await enhanceImageWithGemini(originalImage);
      setEnhancedImage(resultBase64);
      
      if (user) {
          deductCredit(user.id);
          saveEnhancementRecord({
              id: crypto.randomUUID(),
              userId: user.id,
              originalImage: originalImage,
              enhancedImage: resultBase64,
              createdAt: new Date().toISOString()
          });
          refreshUser();
      } else {
          deductGuestCredit();
          setGuestCredits(prev => prev - 1);
      }
      
    } catch (err: any) {
      setError(err.message || "Failed to enhance image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWatchAd = () => {
    if (!user) return;
    setIsWatchingAd(true);
    
    // Simulate Ad duration
    setTimeout(() => {
        addCredits(user.id, AD_WATCH_REWARD);
        refreshUser();
        setAdsWatched(prev => prev + 1);
        setIsWatchingAd(false);
        setError(null); // Clear any "no credits" errors
    }, 3000);
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            setOriginalImage(ev.target?.result as string);
            setEnhancedImage(null);
            setError(null);
        };
        reader.readAsDataURL(file);
      }
  };

  // Check if blocked (either 0 user credits OR 0 guest credits)
  const isGuestBlocked = !user && guestCredits <= 0;
  const isUserBlocked = user && user.credits <= 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-300">
          AI Image Enhancer
        </h1>
        <p className="text-gray-400 text-lg">
          Upload low-quality photos and watch them transform instantly.
        </p>
      </div>

      {/* Guest Status Bar */}
      {!user && !isGuestBlocked && (
          <div className="bg-surface/50 border border-gray-700 rounded-lg p-3 text-center text-sm text-gray-400">
              You have <span className="text-white font-bold">{guestCredits}</span> free guest enhancements left today.
          </div>
      )}

      {/* Credit Alert (Logged In) */}
      {isUserBlocked && !enhancedImage && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center text-red-400">
            <Lock className="mr-2" />
            <span>0 Credits remaining today.</span>
          </div>
          <div className="flex gap-2">
             <button 
                onClick={handleWatchAd}
                disabled={adsWatched >= MAX_AD_REWARDS || isWatchingAd}
                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm flex items-center transition-colors disabled:opacity-50"
             >
                {isWatchingAd ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <Play className="mr-2 h-4 w-4" />}
                Watch Ad (+1)
             </button>
             <Link to="/pricing" className="bg-primary hover:bg-green-600 px-4 py-2 rounded-lg text-white text-sm font-bold">
                Upgrade
             </Link>
          </div>
        </div>
      )}

      {/* Guest Limit Alert (Not Logged In) */}
      {isGuestBlocked && !enhancedImage && (
        <div className="bg-surface border border-primary/30 rounded-xl p-6 flex flex-col items-center text-center space-y-4 shadow-2xl">
            <div className="bg-primary/20 p-4 rounded-full">
                <UserPlus className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-white">Guest Limit Reached</h3>
            <p className="text-gray-400 max-w-md">
                You've used all 3 free guest enhancements for today. Create a free account to continue enhancing images and unlock more features!
            </p>
            <div className="flex gap-4 w-full md:w-auto">
                <Link to="/login" className="flex-1 md:flex-none bg-primary hover:bg-green-600 text-white px-8 py-3 rounded-xl font-bold transition-transform hover:scale-105 text-center">
                    Login / Sign Up
                </Link>
            </div>
        </div>
      )}

      {/* Main Area */}
      <div className={`bg-surface rounded-2xl border border-gray-700 p-6 shadow-xl ${isGuestBlocked && !enhancedImage ? 'opacity-50 pointer-events-none blur-[2px]' : ''}`}>
        
        {!originalImage ? (
          <div 
            className="border-2 border-dashed border-gray-600 rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-gray-700/50 transition-all"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
            />
            <div className="bg-gray-800 p-4 rounded-full mb-4">
              <Upload className="text-primary h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Click to Upload</h3>
            <p className="text-gray-400 text-sm">or drag and drop an image here</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Display Area */}
            {enhancedImage ? (
              <ComparisonSlider before={originalImage} after={enhancedImage} />
            ) : (
              <div className="relative rounded-xl overflow-hidden aspect-square md:aspect-[4/3] bg-black/50 border border-gray-700">
                <img src={originalImage} alt="Original" className="w-full h-full object-contain" />
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                    <Loader2 className="animate-spin text-primary h-12 w-12 mb-4" />
                    <p className="text-green-400 font-medium animate-pulse">Enhancing details with Gemini...</p>
                  </div>
                )}
              </div>
            )}

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
               <button 
                 onClick={() => {
                     setOriginalImage(null); 
                     setEnhancedImage(null);
                     setError(null);
                 }}
                 className="text-gray-400 hover:text-white text-sm underline"
                 disabled={isProcessing}
               >
                 Upload Different Image
               </button>

               {!enhancedImage && (
                 <button
                    onClick={handleEnhance}
                    disabled={isProcessing || isUserBlocked || isGuestBlocked}
                    className={`
                        flex items-center justify-center px-8 py-3 rounded-xl font-bold text-lg shadow-lg
                        ${isProcessing || isUserBlocked || isGuestBlocked
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                            : 'bg-primary hover:bg-green-600 text-white transform hover:scale-105 transition-all'}
                    `}
                 >
                    <Zap className="mr-2" />
                    {isProcessing ? 'Processing...' : `Enhance Image (${!user ? 'Guest' : '-1 Credit'})`}
                 </button>
               )}

               {enhancedImage && (
                   <a 
                    href={enhancedImage} 
                    download="enhanced-ravelon.png"
                    className="bg-white text-dark px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                   >
                       Download HD
                   </a>
               )}
            </div>
            
            {error && !isGuestBlocked && (
                <div className="p-3 bg-red-500/20 text-red-300 rounded-lg text-center text-sm">
                    {error}
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};