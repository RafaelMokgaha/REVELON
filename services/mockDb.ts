import { User, Role, PlanType, EnhancementRecord } from '../types';
import { FREE_DAILY_CREDITS, PLANS, GUEST_DAILY_LIMIT } from '../constants';

// Keys for LocalStorage
const USERS_KEY = 'ravelon_users';
const RECORDS_KEY = 'ravelon_records';
const CURRENT_USER_KEY = 'ravelon_current_user_id';
const GUEST_USAGE_KEY = 'ravelon_guest_usage';

// Helper to get today's date string
const getToday = () => new Date().toDateString();

// Helper to get credits for a specific plan
const getCreditsForPlan = (planId: PlanType): number => {
    const plan = PLANS.find(p => p.id === planId);
    return plan ? plan.creditsPerDay : FREE_DAILY_CREDITS;
};

// --- User Management ---

export const getUsers = (): User[] => {
  const stored = localStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getUserById = (id: string): User | undefined => {
  return getUsers().find(u => u.id === id);
};

export const createUser = (email: string, name: string): User => {
  const users = getUsers();
  const existing = users.find(u => u.email === email);
  if (existing) return existing;

  const newUser: User = {
    id: crypto.randomUUID(),
    email,
    name,
    role: email.includes('admin') ? Role.ADMIN : Role.USER,
    plan: PlanType.FREE,
    credits: FREE_DAILY_CREDITS,
    lastLogin: new Date().toISOString(),
    lastCreditReset: getToday()
  };

  users.push(newUser);
  saveUsers(users);
  return newUser;
};

// --- Credit Logic (Middleware Logic) ---

export const checkAndResetCredits = (userId: string): User | null => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) return null;

  const user = users[index];
  const today = getToday();

  // Reset if it's a new day
  if (user.lastCreditReset !== today) {
    user.credits = getCreditsForPlan(user.plan);
    user.lastCreditReset = today;
    users[index] = user;
    saveUsers(users);
  }

  return user;
};

export const deductCredit = (userId: string): boolean => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) return false;

  if (users[index].credits > 0) {
    users[index].credits -= 1;
    saveUsers(users);
    return true;
  }
  return false;
};

export const addCredits = (userId: string, amount: number): User | null => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) return null;

  users[index].credits += amount;
  saveUsers(users);
  return users[index];
};

export const upgradeUserPlan = (userId: string, plan: PlanType): User | null => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) return null;

  users[index].plan = plan;
  
  // STRICTLY set credits to the new plan's limit immediately upon upgrade/downgrade.
  // This prevents keeping 10,000 credits if switching from Yearly to Monthly.
  users[index].credits = getCreditsForPlan(plan);
  
  saveUsers(users);
  return users[index];
};

// --- Guest Logic ---

export const getGuestCredits = (): number => {
    const stored = localStorage.getItem(GUEST_USAGE_KEY);
    const today = getToday();
    
    if (stored) {
        const data = JSON.parse(stored);
        // If data is from a previous day, reset
        if (data.date !== today) {
            return GUEST_DAILY_LIMIT;
        }
        return Math.max(0, GUEST_DAILY_LIMIT - data.count);
    }
    
    return GUEST_DAILY_LIMIT;
};

export const deductGuestCredit = (): boolean => {
    const credits = getGuestCredits();
    if (credits <= 0) return false;

    const today = getToday();
    const stored = localStorage.getItem(GUEST_USAGE_KEY);
    let count = 0;
    
    if (stored) {
        const data = JSON.parse(stored);
        if (data.date === today) {
            count = data.count;
        }
    }

    localStorage.setItem(GUEST_USAGE_KEY, JSON.stringify({
        date: today,
        count: count + 1
    }));
    
    return true;
};

// --- Admin ---

export const banUser = (userId: string) => {
    // In a real app we'd have a 'banned' flag. Here we just delete them for simplicity
    const users = getUsers().filter(u => u.id !== userId);
    saveUsers(users);
};

// --- History ---

export const saveEnhancementRecord = (record: EnhancementRecord) => {
    const stored = localStorage.getItem(RECORDS_KEY);
    const records: EnhancementRecord[] = stored ? JSON.parse(stored) : [];
    records.push(record);
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
};

export const getUserRecords = (userId: string): EnhancementRecord[] => {
    const stored = localStorage.getItem(RECORDS_KEY);
    const records: EnhancementRecord[] = stored ? JSON.parse(stored) : [];
    return records.filter(r => r.userId === userId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};