
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
