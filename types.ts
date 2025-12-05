export enum PlanType {
  FREE = 'FREE',
  PREMIUM_MONTHLY = 'PREMIUM_MONTHLY',
  PREMIUM_YEARLY = 'PREMIUM_YEARLY'
}

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  plan: PlanType;
  credits: number;
  lastLogin: string;
  lastCreditReset: string;
}

export interface EnhancementRecord {
  id: string;
  userId: string;
  originalImage: string; // Base64
  enhancedImage: string; // Base64
  createdAt: string;
}

export interface PricingPlan {
  id: PlanType;
  name: string;
  price: string;
  period: string;
  creditsPerDay: number;
  features: string[];
}
