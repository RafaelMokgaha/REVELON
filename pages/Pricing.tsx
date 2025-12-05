import React from 'react';
import { PLANS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { upgradeUserPlan } from '../services/mockDb';
import { CheckCircle2, Crown } from 'lucide-react';
import { PlanType } from '../types';

export const Pricing: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const handleSubscribe = (planId: PlanType) => {
    if (!user) {
        alert("Please login first");
        return;
    }
    // Simulate Stripe Checkout
    const confirm = window.confirm(`Proceed to payment for ${planId}? (Mock Payment)`);
    if (confirm) {
        upgradeUserPlan(user.id, planId);
        refreshUser();
        alert("Payment Successful! Plan upgraded.");
    }
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

            return (
                <div 
                    key={plan.id}
                    className={`relative bg-surface rounded-2xl p-8 border flex flex-col ${isPopular ? 'border-primary shadow-2xl shadow-primary/20 scale-105' : 'border-gray-700'}`}
                >
                    {isPopular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-bold flex items-center">
                            <Crown size={14} className="mr-1" /> Most Popular
                        </div>
                    )}

                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-gray-100">{plan.name}</h3>
                        <div className="mt-4 flex items-baseline">
                            <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                            <span className="ml-1 text-gray-400">/{plan.period}</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-400">
                          {plan.creditsPerDay > 1000 ? 'Unlimited' : plan.creditsPerDay} Credits / Day
                        </p>
                    </div>

                    <ul className="space-y-4 mb-8 flex-grow">
                        {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start">
                                <CheckCircle2 className="text-primary h-5 w-5 mr-3 shrink-0" />
                                <span className="text-gray-300 text-sm">{feature}</span>
                            </li>
                        ))}
                    </ul>

                    <button
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={isCurrent}
                        className={`w-full py-3 rounded-lg font-bold transition-all ${
                            isCurrent 
                            ? 'bg-gray-700 text-gray-400 cursor-default' 
                            : isPopular 
                                ? 'bg-primary hover:bg-green-600 text-white' 
                                : 'bg-gray-700 hover:bg-gray-600 text-white'
                        }`}
                    >
                        {isCurrent ? 'Current Plan' : 'Subscribe Now'}
                    </button>
                </div>
            )
        })}
      </div>
    </div>
  );
};