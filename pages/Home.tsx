import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { enhanceImageWithGemini } from '../services/geminiService';
import { deductCredit, saveEnhancementRecord, addCredits, getGuestCredits, deductGuestCredit } from '../services/mockDb';
import { ComparisonSlider } from '../components/ComparisonSlider';
import { Upload, Zap, Loader2, Play, Lock, UserPlus, Download } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AD_WATCH_REWARD, MAX_AD_REWARDS } from '../constants';
import { PlanType } from '../types';
import { AdOverlay } from '../components/AdOverlay';
import { BannerAd } from '../components/BannerAd';

export const Home: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adsWatched, setAdsWatched] = useState(0);
  const [guestCredits, setGuestCredits] = useState<number>(0);

  // Forced Ad State
  const [showForcedAd, setShowForcedAd] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [adActionName, setAdActionName] = useState("");

  useEffect(() => {
    if (!user) {
        setGuestCredits(getGuestCredits());
    }
  }, [user, enhancedImage]);

  // Helper to determine if user needs to see ads (Starter or Guest)
  const shouldShowAd = () => {
      if (!user) return true; // Guest always sees ads
      return user.plan === PlanType.FREE;
  };

  // The Gatekeeper for actions
  const executeWithAdGate = (action: () => void, actionName: string) => {
      if (shouldShowAd()) {
          setAdActionName(actionName);
          setPendingAction(() => action);
          setShowForcedAd(true);
      } else {
          action();
      }
  };

  const handleAdComplete = () => {
      setShowForcedAd(false);
      if (pendingAction) {
          pendingAction();
          setPendingAction(null);
      }
  };

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
    // Reset value so same file can be selected again
    e.target.value = ''; 
  };

  const handleUploadClick = () => {
      executeWithAdGate(() => {
          fileInputRef.current?.click();
      }, "Upload");
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

    // Wrap the actual API call in the ad gate
    executeWithAdGate(async () => {
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
    }, "Enhance");
  };

  const handleDownload = (e: React.MouseEvent) => {
      e.preventDefault(); // Stop default download
      if (!enhancedImage) return;

      executeWithAdGate(() => {
          // Programmatic download
          const link = document.createElement('a');
          link.href = enhancedImage;
          link.download = 'enhanced-ravelon.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      }, "Download");
  };

  // Rewritten to force Ad Overlay before granting credit
  const handleWatchRewardAd = () => {
    if (!user) return;
    
    // Define the action that runs ONLY after the ad finishes
    const grantCreditAction = () => {
        addCredits(user.id, AD_WATCH_REWARD);
        refreshUser();
        setAdsWatched(prev => prev + 1);
        setError(null); // Clear any "no credits" errors
    };

    // Trigger the forced ad overlay
    setAdActionName("Claim Credit");
    setPendingAction(() => grantCreditAction);
    setShowForcedAd(true);
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      // Even drag and drop triggers the ad gate
      const file = e.dataTransfer.files?.[0];
      if (file) {
        executeWithAdGate(() => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setOriginalImage(ev.target?.result as string);
                setEnhancedImage(null);
                setError(null);
            };
            reader.readAsDataURL(file);
        }, "Upload");
      }
  };

  const isGuestBlocked = !user && guestCredits <= 0;
  const isUserBlocked = user && user.credits <= 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Forced Ad Overlay */}
      <AdOverlay 
        isOpen={showForcedAd} 
        onComplete={handleAdComplete} 
        actionName={adActionName} 
      />

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

      {/* Credit Alert (Logged In) - Logic for watching ads to gain credit */}
      {isUserBlocked && !enhancedImage && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center text-red-400">
            <Lock className="mr-2" />
            <span>0 Credits remaining today.</span>
          </div>
          <div className="flex gap-2">
             <button 
                onClick={handleWatchRewardAd}
                disabled={adsWatched >= MAX_AD_REWARDS}
                className="bg-primary hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm flex items-center transition-colors disabled:opacity-50 disabled:bg-gray-700 font-bold shadow-lg"
             >
                <Play className="mr-2 h-4 w-4" />
                {adsWatched >= MAX_AD_REWARDS ? 'Daily Ad Limit Reached' : 'Watch Ad (+1 Credit)'}
             </button>
             <Link to="/pricing" className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-white text-sm font-bold">
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
            onClick={handleUploadClick}
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
            {shouldShowAd() && (
                <span className="mt-2 text-[10px] text-gray-500 bg-gray-800 px-2 py-0.5 rounded border border-gray-600">
                    Ad supported
                </span>
            )}
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
                    <p className="text-green-400 font-medium animate-pulse">Loading... Please wait.</p>
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
                   <button
                    onClick={handleDownload}
                    className="bg-white text-dark px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center"
                   >
                       <Download className="mr-2 h-5 w-5" />
                       Download HD
                   </button>
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

      {/* Banner Ad Area - Only for Starter Users */}
      {shouldShowAd() && (
        <BannerAd />
      )}
    </div>
  );
};