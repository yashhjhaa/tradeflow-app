
export enum TradeDirection {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum TradeOutcome {
  WIN = 'WIN',
  LOSS = 'LOSS',
  BREAKEVEN = 'BREAKEVEN',
  PENDING = 'PENDING',
}

export enum TradingSession {
  ASIA = 'Asia',
  LONDON = 'London',
  NY = 'New York',
}

export interface Account {
  id: string;
  name: string;
  broker: string;
  balance: number;
  currency: string;
  userId?: string;
}

export interface Trade {
  id: string;
  accountId: string;
  userId?: string;
  date: string; // ISO date string YYYY-MM-DD
  pair: string;
  direction: TradeDirection;
  entryPrice?: number; // Optional
  exitPrice?: number;  // Optional
  sl?: number;         // Optional
  tp?: number;         // Optional
  lotSize?: number;    // Optional
  notes: string;
  tags: string[];
  outcome: TradeOutcome;
  pnl?: number;
  rMultiple?: number;
  riskPercentage?: number; // New field for risk %
  session: TradingSession;
  aiAnalysis?: string; 
  sentimentAnalysis?: string; // Specific psychology analysis
  screenshot?: string; // Base64 string or URL
  confidence?: number; // 1-100
  setup?: string; // e.g. "Breakout"
  checklistScore?: string; // Grade (A, B, C...)
  dailyBias?: 'Bullish' | 'Bearish' | 'Neutral'; // AI Context
}

export interface DisciplineLog {
  id: string;
  userId?: string;
  date: string;
  followedPlan: boolean;
  noRevenge: boolean;
  calmEmotion: boolean;
  journaled: boolean;
  notes: string;
  mood?: number; // 0-100
  intention?: string;
}

export interface CalendarEvent {
  id: string;
  time: string; // e.g. "08:30 AM"
  currency: string; // e.g. "USD"
  impact: 'High' | 'Medium' | 'Low';
  event: string;
  actual: string;
  forecast: string;
  previous: string;
  consensus?: string;
  isBetter?: boolean; // For coloring Actual green/red
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  image?: string;
  timestamp: number;
}

export interface TradeFilter {
  pair: string;
  outcome: TradeOutcome | 'all';
  direction: TradeDirection | 'all';
}

export type DateRange = '7d' | '30d' | '90d' | 'all';

// --- PLAYBOOK STRATEGY TYPE ---
export interface PlaybookEntry {
    id: string;
    userId?: string;
    title: string;
    content: string; // The rules/markdown
    type: 'ai' | 'manual';
    rating?: string; // AI Critique score
    image?: string; // Base64 or URL
    checklist?: string[];
    dangerZones?: string;
    tags?: string[];
    createdAt?: string;
}

// --- CHALLENGE TYPES ---
export type VerificationType = 'manual' | 'max_loss' | 'max_trades' | 'journal_all';

export interface ChallengeTask {
    id: string;
    label: string;
    completed: boolean;
    verificationType: VerificationType;
    threshold?: number; // e.g. 500 for max loss, 3 for max trades
    status?: 'pending' | 'passing' | 'failed' | 'completed'; // For Tribunal Live Status
}

export interface ChallengeDay {
    dayNumber: number; // 1 to totalDays
    date: string; // ISO
    tasks: ChallengeTask[];
    status: 'completed' | 'failed' | 'active' | 'pending';
    notes?: string;
}

export interface Challenge {
    id: string;
    userId: string;
    title: string; // e.g., "Trader 75"
    description: string;
    totalDays: number; // e.g. 75
    startDate: string;
    currentDay: number;
    status: 'active' | 'completed' | 'failed';
    days: ChallengeDay[];
    rules: string[]; // List of rules
    theme: 'iron' | 'monk' | 'savage' | 'custom';
    xp: number;
    stakes?: string; // Custom stakes
    themeColor?: string; // Custom theme color hex or tailwind class
}
