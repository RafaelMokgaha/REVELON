import { PlanType, PricingPlan } from './types';

export const APP_NAME = "Ravelon";

export const PLANS: PricingPlan[] = [
  {
    id: PlanType.FREE,
    name: 'Starter',
    price: 'R0',
    period: 'forever',
    creditsPerDay: 3,
    features: ['3 Enhancements daily', 'Standard speed', 'Basic support', 'Watch ads to gain credits']
  },
  {
    id: PlanType.PREMIUM_MONTHLY,
    name: 'Pro Monthly',
    price: 'R150',
    period: 'month',
    creditsPerDay: 10000,
    features: ['Unlimited Enhancements daily', 'High priority processing', 'No ads', 'Premium badge']
  },
  {
    id: PlanType.PREMIUM_YEARLY,
    name: 'Pro Yearly',
    price: 'R500',
    period: 'year',
    creditsPerDay: 10000,
    features: ['Best Value', 'Unlimited Enhancements daily', 'High priority processing', 'No ads', 'Chat with Admin', 'Premium badge']
  }
];

export const MOCK_ADMIN_EMAIL = "admin@ravelon.com";
export const MOCK_ADMIN_PASS = "admin123";

// Logic constants
export const FREE_DAILY_CREDITS = 3;
export const GUEST_DAILY_LIMIT = 3;
export const PREMIUM_DAILY_CREDITS = 50; // Fallback
export const AD_WATCH_REWARD = 1;
export const MAX_AD_REWARDS = 5;