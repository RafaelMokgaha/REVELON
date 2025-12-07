import React, { useState } from 'react';
import { PLANS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { upgradeUserPlan } from '../services/mockDb';
import { CheckCircle2, Crown, Loader2, CreditCard } from 'lucide-react';
import { PlanType } from '../types';
import { useNavigate } from 'react-router-dom';

export const Pricing: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [processingPlanId, setProcessingPlanId] = useState<PlanType | null>(null);

  const handleSubscribe = async (planId: PlanType) => {
    if (!user) {
        navigate('/login');
        return;
    }
    
    // Start processing
    setProcessingPlanId(planId);

    // Simulate Payment Gateway Delay (e.g. Stripe/PayFast)
    setTimeout(() => {
        // 1. Perform Upgrade in DB
        upgradeUserPlan(user.id, planId);
        
        // 2. Refresh Context to update UI immediately
        refreshUser();
        
        // 3. Stop processing
        setProcessingPlanId(null);
        
        // 4. Notify and Redirect
        alert(`🎉 Subscription Successful! You are now on the ${planId.replace('_', ' ')} plan.`);
        navigate('/account'); // Send to account to see new status, or home to use features
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-5xl font-bold">Simple, Transparent Pricing</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Choose the plan that fits your needs. Unlock maximum potential with our Pro plans.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {PLANS.map((plan) => {
            const isCurrent = user?.plan === plan.id;
            const isPopular = plan.id === PlanType.PREMIUM_YEARLY;
            const isProcessing = processingPlanId === plan.id;

            return (
                <div 
                    key={plan.id}
                    className={`relative bg-surface rounded-2xl p-8 border flex flex-col transition-all duration-300 ${
                        isPopular ? 'border-primary shadow-2xl shadow-primary/20 scale-105 z-10' : 'border-gray-700 hover:border-gray-600'
                    }`}
                >
                    {isPopular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-bold flex items-center shadow-lg">
                            <Crown size={14} className="mr-1" /> Best Value
                        </div>
                    )}

                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-gray-100">{plan.name}</h3>
                        <div className="mt-4 flex items-baseline">
                            <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                            <span className="ml-1 text-gray-400">/{plan.period}</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-400 font-medium">
                          {plan.creditsPerDay > 1000 ? 'Unlimited' : plan.creditsPerDay} Credits / Day
                        </p>
                    </div>

                    <ul className="space-y-4 mb-8 flex-grow">
                        {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start">
                                <CheckCircle2 className={`h-5 w-5 mr-3 shrink-0 ${isPopular ? 'text-primary' : 'text-gray-500'}`} />
                                <span className="text-gray-300 text-sm">{feature}</span>
                            </li>
                        ))}
                    </ul>

                    <button
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={isCurrent || isProcessing || processingPlanId !== null}
                        className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center ${
                            isCurrent 
                            ? 'bg-gray-700 text-gray-400 cursor-default' 
                            : isPopular 
                                ? 'bg-primary hover:bg-green-600 text-white shadow-lg hover:shadow-green-500/20' 
                                : 'bg-gray-700 hover:bg-gray-600 text-white'
                        }`}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="animate-spin mr-2 h-5 w-5" />
                                Processing...
                            </>
                        ) : isCurrent ? (
                            'Current Plan'
                        ) : (
                            <>
                                {plan.price !== 'R0' && <CreditCard className="mr-2 h-4 w-4" />}
                                {plan.price === 'R0' ? 'Get Started' : 'Subscribe Now'}
                            </>
                        )}
                    </button>
                    {plan.price !== 'R0' && (
                         <p className="text-center text-xs text-gray-500 mt-2">Secure payment via Stripe/PayFast</p>
                    )}
                </div>
            )
        })}
      </div>
    </div>
  );
};