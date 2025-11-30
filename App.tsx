import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { Plus, BarChart2, BookOpen, Zap, LayoutGrid, Settings, Trash2, CheckCircle, XCircle, Menu, X, BrainCircuit, TrendingUp, LogOut, Newspaper, Layers, PieChart, ChevronUp, User as UserIcon, Camera, Upload, CheckSquare, ArrowRight, Image as ImageIcon, Calendar as CalendarIcon, Target, Activity, ChevronLeft, ChevronRight, Search, Shield, Bell, CreditCard, Sun, Moon, Maximize2, Globe, AlertTriangle, Send, Bot, Wand2, Sparkles, Battery, Flame, Edit2, Quote, Smile, Frown, Meh, Clock, Play, Pause, RotateCcw, Sliders, Lock, Mail, UserCheck, Wallet, Percent, DollarSign, Download, ChevronDown, Target as TargetIcon, Home, Check, Terminal, Copy, Monitor, Wifi, CloudLightning, Laptop } from 'lucide-react';
import { Card, Button, Input, Select, Badge } from './components/UI';
import { EquityCurve, WinLossChart, PairPerformanceChart, DayOfWeekChart, StrategyChart } from './components/Charts';
import { analyzeTradePsychology, analyzeTradeScreenshot, generatePerformanceReview, getLiveMarketNews, chatWithTradeCoach, parseTradeFromNaturalLanguage } from './services/geminiService';
import { Trade, Account, DisciplineLog, CalendarEvent, TradeDirection, TradeOutcome, TradingSession, ChatMessage, DateRange } from './types';
import { 
    subscribeToAuth, loginUser, logoutUser, registerUser, subscribeToTrades, 
    addTradeToDb, deleteTradeFromDb, subscribeToAccounts, 
    addAccountToDb, deleteAccountFromDb, updateAccountBalance, 
    subscribeToDiscipline, updateDisciplineLog, initializeTodayLog,
    uploadScreenshotToStorage, updateTradeInDb, resetPassword
} from './services/dataService';
import { User } from 'firebase/auth';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';

export const ThemeContext = React.createContext({
  theme: 'dark',
  toggleTheme: () => {},
});

// --- SUB-COMPONENTS ---

const AppLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 20H80V35H60V80H40V35H20V20Z" fill="url(#logoGradient)" />
        <path d="M10 85L35 60L55 75L90 30" stroke="#00f3ff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse"/>
        <defs>
            <linearGradient id="logoGradient" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00f3ff"/>
                <stop offset="1" stopColor="#bd00ff"/>
            </linearGradient>
        </defs>
    </svg>
);

const BackgroundBlobs = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none opacity-60 dark:opacity-100 transition-opacity duration-500">
    <div className="absolute top-0 left-[-10%] w-[500px] h-[500px] bg-indigo-300/40 dark:bg-indigo-600/20 rounded-full blur-[120px] animate-blob mix-blend-multiply dark:mix-blend-screen" />
    <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-cyan-300/40 dark:bg-cyan-600/10 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen" />
    <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-purple-300/40 dark:bg-purple-600/10 rounded-full blur-[130px] animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen" />
  </div>
);

const Navigation: React.FC<{ activeTab: string; setActiveTab: (t: string) => void; onLogout: () => void }> = ({ activeTab, setActiveTab, onLogout }) => {
  const navItems = [
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'discipline', label: 'Mindset', icon: Zap },
    { id: 'news', label: 'Red Folder', icon: Flame },
    { id: 'ai-coach', label: 'AI Coach', icon: Bot },
  ];

  return (
    <aside className="hidden md:flex flex-col w-20 hover:w-64 h-screen fixed left-0 top-0 glass-panel border-r border-white/40 dark:border-white/5 z-50 transition-all duration-300 group overflow-hidden">
      <div className="p-5 flex items-center gap-4">
        <div className="w-10 h-10 flex items-center justify-center shrink-0">
            <AppLogo className="w-10 h-10" />
        </div>
        <h1 className="text-xl font-display font-bold dark:text-white text-slate-800 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          TradeFlow
        </h1>
      </div>
      
      <nav className="flex-1 px-3 space-y-2 mt-8">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 pl-6 py-3 rounded-xl transition-all duration-200 whitespace-nowrap overflow-hidden ${
              activeTab === item.id 
                ? 'bg-white shadow-md dark:bg-white/10 text-cyan-700 dark:text-cyan-400 dark:shadow-[0_0_15px_rgba(6,182,212,0.15)] border border-white/60 dark:border-cyan-500/20' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <item.icon size={24} className="shrink-0" />
            <span className="font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-200 dark:border-white/5 space-y-2">
         <button 
            onClick={() => setActiveTab('profile')} 
            className={`w-full flex items-center gap-4 pl-6 py-3 rounded-xl transition-all whitespace-nowrap ${activeTab === 'profile' ? 'bg-white shadow-md dark:bg-white/10 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
         >
             <UserIcon size={24} className="shrink-0" />
             <span className="font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">Profile</span>
         </button>
        <button onClick={onLogout} className="w-full flex items-center gap-4 pl-6 py-3 text-slate-500 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl transition-all whitespace-nowrap">
           <LogOut size={24} className="shrink-0" />
           <span className="font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">Logout</span>
        </button>
      </div>
    </aside>
  );
};

const MobileBottomNav: React.FC<{ activeTab: string; setActiveTab: (t: string) => void }> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'journal', icon: Home },
    { id: 'analytics', icon: PieChart },
    { id: 'ai-coach', icon: Bot },
    { id: 'news', icon: Flame },
    { id: 'discipline', icon: Zap },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[72px] bg-white/90 dark:bg-[#030712]/90 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 flex items-center justify-around z-50 px-2 pb-safe">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`relative flex flex-col items-center justify-center w-16 h-full transition-all duration-300 ${
              isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <div className={`relative transition-transform duration-300 ${isActive ? '-translate-y-1' : ''}`}>
                <item.icon 
                    size={isActive ? 26 : 24} 
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`${isActive ? 'drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]' : ''}`}
                />
                {isActive && (
                    <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1 h-1 bg-cyan-500 rounded-full animate-fade-in" />
                )}
            </div>
          </button>
        );
      })}
    </nav>
  );
};

const BreathingExercise: React.FC = () => {
    const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Hold '>('Inhale');
    const [active, setActive] = useState(false);
    const [timer, setTimer] = useState(4);

    useEffect(() => {
        if (!active) return;
        
        const interval = setInterval(() => {
            setTimer(prev => {
                if (prev === 1) {
                    setPhase(p => {
                        if (p === 'Inhale') return 'Hold';
                        if (p === 'Hold') return 'Exhale';
                        if (p === 'Exhale') return 'Hold ';
                        return 'Inhale';
                    });
                    return 4;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [active]);

    return (
        <div className="flex flex-col items-center justify-center py-8 relative">
            <div className={`relative w-48 h-48 flex items-center justify-center rounded-full transition-all duration-[4000ms] ease-in-out ${
                !active ? 'scale-100 bg-slate-200 dark:bg-slate-800' :
                phase === 'Inhale' ? 'scale-125 bg-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.4)]' :
                phase === 'Exhale' ? 'scale-90 bg-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.2)]' :
                'scale-110 bg-white/10 border border-white/20'
            }`}>
                <div className="text-center z-10">
                    <div className={`text-2xl font-bold ${active ? 'text-white' : 'text-slate-400'}`}>
                        {active ? phase : "Ready?"}
                    </div>
                    <div className="text-4xl font-mono mt-2 font-bold text-cyan-400">
                        {active ? timer : "4-4-4"}
                    </div>
                </div>
                
                {active && (
                    <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 animate-ping opacity-20" />
                )}
            </div>
            
            <div className="mt-8 flex gap-4">
                <Button 
                    variant={active ? 'danger' : 'neon'} 
                    onClick={() => { setActive(!active); setTimer(4); setPhase('Inhale'); }}
                    className="min-w-[140px]"
                >
                    {active ? <><Pause size={18} /> Stop</> : <><Play size={18} /> Start Zen Mode</>}
                </Button>
            </div>
            <p className="mt-4 text-xs text-slate-500 max-w-xs text-center">Box breathing (4s In, 4s Hold, 4s Out, 4s Hold) resets your nervous system and reduces tilt.</p>
        </div>
    );
};

const MarketSessionClocks: React.FC = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getSessionStatus = (tz: string, start: number, end: number) => {
        // Simplified session logic
        const hour = parseInt(time.toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', hour12: false }));
        const isOpen = hour >= start && hour < end;
        return isOpen;
    };

    const sessions = [
        { name: 'London', tz: 'Europe/London', start: 8, end: 16, icon: '🇬🇧' },
        { name: 'New York', tz: 'America/New_York', start: 8, end: 17, icon: '🇺🇸' },
        { name: 'Tokyo', tz: 'Asia/Tokyo', start: 9, end: 15, icon: '🇯🇵' },
        { name: 'Sydney', tz: 'Australia/Sydney', start: 10, end: 16, icon: '🇦🇺' },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {sessions.map(s => {
                const isOpen = getSessionStatus(s.tz, s.start, s.end);
                const localTime = time.toLocaleTimeString('en-US', { timeZone: s.tz, hour: '2-digit', minute:'2-digit' });
                
                return (
                    <Card key={s.name} className={`relative overflow-hidden border-0 ${isOpen ? 'bg-gradient-to-b from-slate-800 to-slate-900 ring-1 ring-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-slate-900/50 opacity-60'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xl">{s.icon}</span>
                            {isOpen && <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"/>}
                        </div>
                        <div className="text-2xl font-bold text-white font-mono tracking-wider">{localTime}</div>
                        <div className={`text-xs uppercase font-bold mt-1 ${isOpen ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {s.name} {isOpen ? 'OPEN' : 'CLOSED'}
                        </div>
                    </Card>
                );
            })}
        </div>
    );
};

const EquitySimulator: React.FC<{ currentBalance: number }> = ({ currentBalance }) => {
    const [winRate, setWinRate] = useState(50);
    const [rr, setRr] = useState(2);
    const [risk, setRisk] = useState(1);

    const generateProjection = () => {
        let balance = currentBalance;
        const data = [{ trade: 0, balance }];
        
        for (let i = 1; i <= 50; i++) {
            const isWin = Math.random() * 100 < winRate;
            const riskAmt = balance * (risk / 100);
            const outcome = isWin ? riskAmt * rr : -riskAmt;
            balance += outcome;
            data.push({ trade: i, balance });
        }
        return data;
    };

    const [data, setData] = useState(generateProjection());

    useEffect(() => {
        setData(generateProjection());
    }, [winRate, rr, risk]);

    return (
        <Card className="h-full flex flex-col bg-slate-900/50 border-cyan-500/20">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-white flex items-center gap-2"><Wand2 className="text-purple-500"/> What-If Simulator</h3>
                <Button size="sm" variant="ghost" onClick={() => setData(generateProjection())}><RotateCcw size={14}/></Button>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                    <label className="text-xs text-slate-400 mb-1 block">Win Rate: {winRate}%</label>
                    <input type="range" min="20" max="80" value={winRate} onChange={e => setWinRate(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                </div>
                <div>
                    <label className="text-xs text-slate-400 mb-1 block">Risk/Reward: 1:{rr}</label>
                    <input type="range" min="0.5" max="5" step="0.1" value={rr} onChange={e => setRr(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                </div>
                <div>
                    <label className="text-xs text-slate-400 mb-1 block">Risk Per Trade: {risk}%</label>
                    <input type="range" min="0.25" max="5" step="0.25" value={risk} onChange={e => setRisk(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500" />
                </div>
            </div>

            <div className="flex-1 min-h-[200px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorSim" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.2} />
                        <XAxis dataKey="trade" hide />
                        <YAxis hide domain={['auto', 'auto']} />
                        <RechartsTooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', fontSize: '12px' }}
                            formatter={(value: number) => [`$${value.toFixed(0)}`, 'Proj. Balance']}
                        />
                        <Area type="monotone" dataKey="balance" stroke="#a855f7" strokeWidth={2} fill="url(#colorSim)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            <div className="text-center text-xs text-slate-500 mt-2">
                Projected growth over next 50 trades based on parameters (Monte Carlo Lite)
            </div>
        </Card>
    );
};

// --- CONNECT MODAL (Direct Data Fetch) ---
const ConnectBrokerModal: React.FC<{ isOpen: boolean; onClose: () => void; userId: string }> = ({ isOpen, onClose, userId }) => {
    const [method, setMethod] = useState<'cloud' | 'local'>('local');
    const [step, setStep] = useState(1);
    const [copied, setCopied] = useState(false);
    
    // MetaApi Cloud State
    const [apiToken, setApiToken] = useState('');
    const [accountId, setAccountId] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('');

    // Local Script State
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [server, setServer] = useState('');

    if (!isOpen) return null;

    const handleMetaApiConnect = async () => {
        if (!apiToken || !accountId) {
            setConnectionStatus("Error: Please enter both MetaApi Token and Account ID.");
            return;
        }
        setIsConnecting(true);
        setConnectionStatus('Connecting to MetaApi Cloud...');

        try {
            // 1. Fetch Account Information (Validates Token & ID)
            const baseUrl = `https://mt-provisioning-api-v1.agiliumtrade.ai`; 
            
            const response = await fetch(`${baseUrl}/users/current/accounts/${accountId}`, {
                headers: { 
                    'auth-token': apiToken,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) throw new Error("Invalid Token. Please check your MetaApi API Key.");
                if (response.status === 404) throw new Error("Account ID not found. Check the ID.");
                throw new Error("Failed to connect to Broker Relay.");
            }
            
            const info = await response.json();
            setConnectionStatus(`Connected to ${info.name} (${info.login})`);

            // 2. Fetch Recent History (Last 30 days)
            const clientApiUrl = `https://mt-client-api-v1.new-york.agiliumtrade.ai`; 
            setConnectionStatus('Syncing Trade History...');
            
            const startTime = new Date();
            startTime.setDate(startTime.getDate() - 30);
            
            const historyRes = await fetch(`${clientApiUrl}/users/current/accounts/${accountId}/history-orders?startTime=${startTime.toISOString()}`, {
                headers: { 'auth-token': apiToken }
            });
            
            if (!historyRes.ok) throw new Error("Connected but failed to fetch history.");

            const historyData = await historyRes.json();
            const orders = historyData.historyOrders || [];

            // 3. Map & Save to Firestore
            let importedCount = 0;
            for (const order of orders) {
                // Assuming 'ORDER_TYPE_BUY' and 'ORDER_TYPE_SELL' are actual trades
                if (order.type !== 'ORDER_TYPE_BUY' && order.type !== 'ORDER_TYPE_SELL') continue;
                
                const trade: Trade = {
                    id: order.id, // MetaApi order ID can serve as unique ID
                    accountId: 'metaapi_imported', // Assign a default account ID for imported trades
                    userId: userId,
                    date: new Date(order.doneTime || order.createTime).toISOString(),
                    pair: order.symbol,
                    direction: order.type === 'ORDER_TYPE_BUY' ? TradeDirection.BUY : TradeDirection.SELL,
                    outcome: order.profit > 0 ? TradeOutcome.WIN : order.profit < 0 ? TradeOutcome.LOSS : TradeOutcome.BREAKEVEN,
                    pnl: order.profit,
                    session: TradingSession.NY, // Default or infer from time
                    notes: `Imported from MetaApi`,
                    tags: ['AutoSync'],
                    setup: 'Live Execution',
                    checklistScore: 'C',
                    rMultiple: 0, // MetaApi might not directly provide R-Multiple
                    entryPrice: order.price, // Assuming order.price is entry price
                    lotSize: order.volume
                };
                
                await addTradeToDb(trade, userId);
                importedCount++;
            }

            setConnectionStatus(`Success! Synced ${importedCount} trades.`);
            setTimeout(() => onClose(), 2000);

        } catch (error: any) {
            console.error("MetaApi Error:", error);
            setConnectionStatus(`Error: ${error.message}`);
        } finally {
            setIsConnecting(false);
        }
    };

    // Data Fetching Script (Python) - The direct method
    const pythonScript = `
import MetaTrader5 as mt5
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
import time

# --- 1. SETUP ---
# Replace with your MT5 details (or leave blank if already logged in)
LOGIN = 123456 
PASSWORD = "YOUR_PASSWORD"
SERVER = "MetaQuotes-Demo"
USER_ID = "${userId}"

# --- 2. CONNECT FIREBASE ---
# Download 'serviceAccountKey.json' from Firebase Console > Project Settings > Service Accounts
# Place it in the same directory as this script
cred = credentials.Certificate("serviceAccountKey.json") 
firebase_admin.initialize_app(cred)
db = firestore.client()

# --- 3. FETCH DATA ---
if not mt5.initialize():
    print("MT5 Init Failed")
    mt5.shutdown()
    quit()

# mt5.login(LOGIN, password=PASSWORD, server=SERVER) # Uncomment this line and fill details to auto-login

print("Fetching history...")
from_date = datetime(2024, 1, 1) # Adjust start date as needed
to_date = datetime.now()
deals = mt5.history_deals_get(from_date, to_date)

if deals:
    print(f"Found {len(deals)} deals. Syncing to TradeFlow...")
    for deal in deals:
        # We only want 'ENTRY_OUT' deals (closed trades with PnL)
        if deal.entry == mt5.DEAL_ENTRY_OUT: 
            direction = "BUY" if deal.type == mt5.DEAL_TYPE_BUY else "SELL"
            outcome = "WIN" if deal.profit > 0 else ("LOSS" if deal.profit < 0 else "BREAKEVEN")
            
            # Use deal.ticket as Firestore document ID for idempotence
            doc_ref = db.collection('trades').document(str(deal.ticket))
            doc_ref.set({
                'userId': USER_ID,
                'pair': deal.symbol,
                'direction': direction,
                'date': datetime.fromtimestamp(deal.time).isoformat(),
                'pnl': deal.profit,
                'outcome': outcome,
                'setup': 'MT5 Python Sync',
                'accountId': 'mt5_synced', # Default account for synced trades
                'entryPrice': deal.price,
                'notes': f'Synced automatically via Python bridge. Deal ID: {deal.ticket}'
            })
    print("Sync Complete!")
else:
    print("No history found in MT5 for the selected period.")

mt5.shutdown()
`;

    const handleCopy = () => {
        navigator.clipboard.writeText(pythonScript);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
            <Card className="w-full max-w-2xl bg-slate-900 border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] relative flex flex-col overflow-hidden max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X /></button>
                
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <Laptop className="text-white" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-display font-bold text-white">Connect Broker</h2>
                            <p className="text-slate-400 text-sm">Fetch trade history directly from MetaTrader</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex p-1 bg-slate-800 rounded-xl mb-6">
                        <button 
                            onClick={() => setMethod('local')}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${method === 'local' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Laptop size={16} /> Python Bridge (Free)
                        </button>
                        <button 
                            onClick={() => setMethod('cloud')}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${method === 'cloud' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Wifi size={16} /> MetaApi Cloud
                        </button>
                    </div>

                    {method === 'local' && (
                        <div className="space-y-5 animate-fade-in">
                             <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 text-sm">
                                <strong className="text-white block mb-1">Direct Data Fetch</strong>
                                Since browsers cannot access your desktop apps directly, running this simple script on your PC is the most secure and direct way to push your MT5 history to TradeFlow.
                            </div>
                            
                            <div className="relative group">
                                <div className="absolute top-0 left-0 w-full h-8 bg-slate-800 rounded-t-xl border-b border-slate-700 flex items-center px-4 gap-2">
                                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                    <div className="text-xs text-slate-500 ml-2 font-mono">sync_trades.py</div>
                                </div>
                                <pre className="bg-slate-950 text-slate-300 p-4 pt-10 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800 h-64 selection:bg-cyan-900">
                                    {pythonScript}
                                </pre>
                                <div className="absolute top-2 right-2">
                                    <Button onClick={handleCopy} size="sm" variant="secondary">
                                        {copied ? <Check size={14}/> : <Copy size={14}/>}
                                    </Button>
                                </div>
                            </div>
                            
                            <div className="text-xs text-slate-500 text-center">
                                1. Install Python & Libraries (`pip install MetaTrader5 firebase-admin`) <br/>
                                2. Run script. Trades will appear instantly.
                            </div>
                        </div>
                    )}

                    {method === 'cloud' && (
                        <div className="space-y-5 animate-fade-in">
                            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm">
                                Use <a href="https://metaapi.cloud" target="_blank" className="underline font-bold">MetaApi.cloud</a> to bridge your broker account. This allows direct sync without running any code on your PC.
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs uppercase font-bold text-slate-500">MetaApi Access Token</label>
                                <Input 
                                    type="password" 
                                    value={apiToken} 
                                    onChange={e => setApiToken(e.target.value)} 
                                    placeholder="Paste your token here" 
                                    className="bg-black/30 border-white/10 text-white"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs uppercase font-bold text-slate-500">MetaApi Account ID</label>
                                <Input 
                                    value={accountId} 
                                    onChange={e => setAccountId(e.target.value)} 
                                    placeholder="e.g. c7f3e1..." 
                                    className="bg-black/30 border-white/10 text-white"
                                />
                            </div>

                            {connectionStatus && (
                                <div className={`text-sm font-mono p-2 rounded ${connectionStatus.includes('Error') ? 'text-rose-400 bg-rose-900/20' : 'text-emerald-400 bg-emerald-900/20'}`}>
                                    {connectionStatus}
                                </div>
                            )}

                            <Button onClick={handleMetaApiConnect} variant="neon" className="w-full h-12 text-lg mt-2" disabled={isConnecting}>
                                {isConnecting ? (
                                    <span className="flex items-center gap-2"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</span>
                                ) : 'Sync Trades Now'}
                            </Button>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

const AddTradeModal: React.FC<{ 
    isOpen: boolean, 
    onClose: () => void, 
    onSave: (t: Trade) => Promise<void>, 
    accounts: Account[],
    currentAccountId: string, 
    initialData?: Partial<Trade> 
}> = ({ isOpen, onClose, onSave, accounts, currentAccountId, initialData }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Partial<Trade>>({
        pair: '', direction: TradeDirection.BUY, outcome: TradeOutcome.PENDING, 
        pnl: 0, session: TradingSession.NY, notes: '', checklistScore: 'D',
        rMultiple: 0, riskPercentage: 0, setup: '', accountId: currentAccountId,
        entryPrice: undefined, exitPrice: undefined, sl: undefined, tp: undefined, lotSize: undefined
    });
    const [checklist, setChecklist] = useState({
        plan: false, emotion: false, sl: false, tp: false, bias: false
    });
    const [screenshot, setScreenshot] = useState<string>('');
    const [aiAnalysis, setAiAnalysis] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState('');
    const [magicInput, setMagicInput] = useState('');
    const [isMagicParsing, setIsMagicParsing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(prev => ({ ...prev, ...initialData, accountId: initialData.accountId || currentAccountId }));
                if (initialData.screenshot) setScreenshot(initialData.screenshot);
                if (initialData.aiAnalysis) setAiAnalysis(initialData.aiAnalysis);
                setStep(initialData.id ? 2 : 2); 
            } else {
                setFormData({
                    pair: '', direction: TradeDirection.BUY, outcome: TradeOutcome.PENDING, 
                    pnl: 0, session: TradingSession.NY, notes: '', checklistScore: 'D',
                    rMultiple: 0, riskPercentage: 0, setup: '', accountId: currentAccountId,
                    entryPrice: undefined, exitPrice: undefined, sl: undefined, tp: undefined, lotSize: undefined
                });
                setChecklist({ plan: false, emotion: false, sl: false, tp: false, bias: false });
                setStep(1);
                setScreenshot('');
                setAiAnalysis('');
            }
        }
    }, [isOpen, initialData, currentAccountId]);

    useEffect(() => {
        const score = Object.values(checklist).filter(Boolean).length;
        const grade = score === 5 ? 'A' : score === 4 ? 'B' : score === 3 ? 'C' : score === 2 ? 'D' : 'F';
        setFormData(prev => ({ ...prev, checklistScore: grade }));
    }, [checklist]);

    useEffect(() => {
        if (formData.pnl !== undefined && formData.accountId) {
            const acc = accounts.find(a => a.id === formData.accountId);
            if (acc && acc.balance) {
                const risk = (formData.pnl / acc.balance) * 100;
                setFormData(prev => ({ ...prev, riskPercentage: parseFloat(risk.toFixed(2)) }));
            }
        } else {
            setFormData(prev => ({ ...prev, riskPercentage: undefined }));
        }
    }, [formData.pnl, formData.accountId, accounts]);

    if (!isOpen) return null;

    const handleMagicLog = async () => {
        if(!magicInput) return;
        setIsMagicParsing(true);
        const data = await parseTradeFromNaturalLanguage(magicInput);
        setFormData(prev => ({...prev, ...data}));
        setIsMagicParsing(false);
        setMagicInput('');
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                setScreenshot(base64);
                setIsAnalyzing(true);
                const analysis = await analyzeTradeScreenshot(base64, formData.pair || '');
                setAiAnalysis(analysis);
                setIsAnalyzing(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        setError('');
        if (!formData.pair) { setError('Enter a Pair (e.g. EURUSD)'); return; }
        if (!formData.accountId) { setError('Select an Account'); return; }
        
        try {
            const trade: Trade = {
                id: formData.id || '', // Preserve ID if editing
                accountId: formData.accountId,
                date: formData.date || new Date().toISOString(),
                pair: formData.pair.toUpperCase(),
                direction: formData.direction as TradeDirection,
                outcome: formData.outcome as TradeOutcome,
                pnl: Number(formData.pnl || 0),
                session: formData.session as TradingSession,
                checklistScore: formData.checklistScore,
                aiAnalysis: aiAnalysis,
                screenshot: screenshot,
                rMultiple: Number(formData.rMultiple || 0),
                riskPercentage: Number(formData.riskPercentage || 0),
                setup: formData.setup || '',
                notes: formData.notes || '',
                tags: [],
                entryPrice: formData.entryPrice,
                exitPrice: formData.exitPrice,
                sl: formData.sl,
                tp: formData.tp,
                lotSize: formData.lotSize,
            };
            
            await onSave(trade);
            onClose();
        } catch (e) {
            setError('Failed to save trade.');
            console.error(e);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/80 backdrop-blur-sm animate-fade-in">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-white/50 dark:border-cyan-500/30 shadow-2xl relative flex flex-col">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white"><X /></button>
                
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {step === 1 ? <CheckSquare className="text-cyan-600 dark:text-cyan-500"/> : <Plus className="text-cyan-600 dark:text-cyan-500"/>} 
                        {initialData?.id ? 'Edit Trade' : step === 1 ? 'Pre-Trade Checklist' : 'Log Trade Details'}
                    </h2>
                    {!initialData?.id && (
                        <div className="flex gap-1 mt-2">
                            <div className={`h-1 rounded-full flex-1 transition-all ${step >= 1 ? 'bg-cyan-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                            <div className={`h-1 rounded-full flex-1 transition-all ${step >= 2 ? 'bg-cyan-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto">
                    {step === 1 && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                <h3 className="text-slate-500 dark:text-slate-400 text-sm uppercase font-bold mb-3">Discipline Rules</h3>
                                {[
                                    { id: 'plan', label: 'I have a pre-defined take-profit level' },
                                    { id: 'emotion', label: 'I am not emotionally influenced by last trade' },
                                    { id: 'sl', label: 'I have a predefined Stop Loss' },
                                    { id: 'tp', label: 'I have a predefined Take Profit' },
                                    { id: 'bias', label: 'Trade aligns with Daily Bias' },
                                ].map(rule => (
                                    <label key={rule.id} className="flex items-center gap-3 p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors">
                                        <input 
                                            type="checkbox" 
                                            // @ts-ignore
                                            checked={checklist[rule.id]} 
                                            // @ts-ignore
                                            onChange={() => setChecklist(prev => ({ ...prev, [rule.id]: !prev[rule.id] }))}
                                            className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-cyan-600 focus:ring-cyan-500 bg-white dark:bg-slate-900" 
                                        />
                                        <span className="text-slate-700 dark:text-slate-200">{rule.label}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="flex justify-end items-center gap-4 mt-4">
                                <div className="text-right">
                                    <div className="text-xs text-slate-500">Setup Grade</div>
                                    <div className={`text-4xl font-bold ${formData.checklistScore === 'A' ? 'text-emerald-500' : formData.checklistScore === 'F' ? 'text-rose-500' : 'text-yellow-500'}`}>
                                        {formData.checklistScore}
                                    </div>
                                </div>
                                <Button onClick={() => setStep(2)} variant="neon" className="px-8">Continue <ArrowRight size={16}/></Button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-fade-in">
                            {error && (
                                <div className="p-3 bg-rose-50 border border-rose-200 dark:bg-rose-500/20 dark:border-rose-500/30 rounded-lg flex items-center gap-2 text-rose-600 dark:text-rose-300 text-sm">
                                    <AlertTriangle size={16} /> {error}
                                </div>
                            )}

                            {/* Magic Log inside modal */}
                            <div className="flex gap-2">
                                <Input 
                                    value={magicInput}
                                    onChange={(e) => setMagicInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleMagicLog()}
                                    placeholder="Magic Paste: 'Long Gold @ 2030, SL 2025, TP 2040, Lot 0.5...'"
                                    className="bg-cyan-500/5 border-cyan-500/20 text-sm"
                                />
                                <Button variant="secondary" size="sm" onClick={handleMagicLog} disabled={!magicInput || isMagicParsing}>
                                    {isMagicParsing ? <Sparkles className="animate-spin" size={16}/> : <Wand2 size={16}/>}
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 dark:text-slate-400">Account</label>
                                    <Select value={formData.accountId} onChange={e => setFormData({...formData, accountId: e.target.value})}>
                                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name} (${a.balance})</option>)}
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 dark:text-slate-400">Date</label>
                                    <Input type="date" value={formData.date?.split('T')[0]} onChange={(e) => setFormData({...formData, date: new Date(e.target.value).toISOString()})} className="" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 dark:text-slate-400">Pair *</label>
                                    <Input value={formData.pair} onChange={e => setFormData({...formData, pair: e.target.value})} placeholder="EURUSD" autoFocus />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 dark:text-slate-400">Direction</label>
                                    <div className="flex gap-2">
                                        <button onClick={() => setFormData({...formData, direction: TradeDirection.BUY})} className={`flex-1 py-2.5 rounded-xl font-bold border transition-all ${formData.direction === TradeDirection.BUY ? 'bg-emerald-100 border-emerald-500 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}>BUY</button>
                                        <button onClick={() => setFormData({...formData, direction: TradeDirection.SELL})} className={`flex-1 py-2.5 rounded-xl font-bold border transition-all ${formData.direction === TradeDirection.SELL ? 'bg-rose-100 border-rose-500 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}>SELL</button>
                                    </div>
                                </div>
                            </div>

                            {/* Technical Details Row */}
                            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500">Entry Price</label>
                                    <Input type="number" step="0.00001" value={formData.entryPrice || ''} onChange={e => setFormData({...formData, entryPrice: parseFloat(e.target.value)})} placeholder="1.0000" className="h-8 text-sm" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500">Exit Price</label>
                                    <Input type="number" step="0.00001" value={formData.exitPrice || ''} onChange={e => setFormData({...formData, exitPrice: parseFloat(e.target.value)})} placeholder="1.0050" className="h-8 text-sm" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500">Lot Size</label>
                                    <Input type="number" step="0.01" value={formData.lotSize || ''} onChange={e => setFormData({...formData, lotSize: parseFloat(e.target.value)})} placeholder="1.0" className="h-8 text-sm" />
                                </div>
                            </div>

                            {/* Risk Management Row */}
                            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500">Stop Loss</label>
                                    <Input type="number" step="0.00001" value={formData.sl || ''} onChange={e => setFormData({...formData, sl: parseFloat(e.target.value)})} placeholder="0.0000" className="h-8 text-sm" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500">Take Profit</label>
                                    <Input type="number" step="0.00001" value={formData.tp || ''} onChange={e => setFormData({...formData, tp: parseFloat(e.target.value)})} placeholder="0.0000" className="h-8 text-sm" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500">R-Multiple</label>
                                    <Input type="number" step="0.1" value={formData.rMultiple || ''} onChange={e => setFormData({...formData, rMultiple: parseFloat(e.target.value)})} placeholder="2.5R" className="h-8 text-sm" />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50">
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 dark:text-slate-400">Outcome</label>
                                    <Select value={formData.outcome} onChange={e => setFormData({...formData, outcome: e.target.value as TradeOutcome})}>
                                        <option value={TradeOutcome.PENDING}>Pending</option>
                                        <option value={TradeOutcome.WIN}>Win</option>
                                        <option value={TradeOutcome.LOSS}>Loss</option>
                                        <option value={TradeOutcome.BREAKEVEN}>Breakeven</option>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 dark:text-slate-400">PnL ($)</label>
                                    <Input type="number" value={formData.pnl} onChange={e => setFormData({...formData, pnl: parseFloat(e.target.value)})} placeholder="0.00" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 dark:text-slate-400">Risk % (Auto)</label>
                                    <div className={`w-full px-4 py-3 rounded-xl border text-sm font-mono flex items-center ${
                                        (formData.riskPercentage || 0) > 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400' : 
                                        (formData.riskPercentage || 0) < 0 ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-400' : 
                                        'bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-900/30 dark:border-slate-700'
                                    }`}>
                                        {formData.riskPercentage?.toFixed(2)}%
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-slate-500 dark:text-slate-400">Setup Strategy</label>
                                <Input value={formData.setup} onChange={e => setFormData({...formData, setup: e.target.value})} placeholder="e.g. Breakout, Reversal" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-slate-500 dark:text-slate-400">Screenshot & Analysis</label>
                                <div className="flex gap-4 items-start">
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-20 h-20 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 transition-all shrink-0"
                                    >
                                        {screenshot ? (
                                            <img src={screenshot} alt="Trade" className="w-full h-full object-cover rounded-lg" />
                                        ) : (
                                            <Camera className="text-slate-400" size={20} />
                                        )}
                                        <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleImageUpload} />
                                    </div>
                                    <div className="flex-1">
                                        {isAnalyzing ? (
                                            <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs animate-pulse pt-2"><BrainCircuit size={14}/> AI Analyzing...</div>
                                        ) : aiAnalysis ? (
                                            <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2 rounded border border-slate-200 dark:border-slate-700">
                                                <span className="font-bold text-cyan-600 dark:text-cyan-400">AI Insight:</span> {aiAnalysis}
                                            </div>
                                        ) : (
                                            <div className="text-xs text-slate-400 italic pt-2">Upload chart for auto-analysis</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-slate-500 dark:text-slate-400">Key Learnings / Notes</label>
                                <textarea 
                                    value={formData.notes}
                                    onChange={e => setFormData({...formData, notes: e.target.value})}
                                    className="w-full bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500 transition-all h-20 resize-none"
                                    placeholder="What did you learn?"
                                />
                            </div>

                            <div className="pt-2 flex gap-3">
                                {!initialData?.id && <Button onClick={() => setStep(1)} variant="ghost" className="flex-1">Back</Button>}
                                <Button onClick={handleSubmit} variant="neon" className="flex-[2]">Save Trade</Button>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

const WelcomeToast: React.FC<{ username: string, visible: boolean }> = ({ username, visible }) => {
    if (!visible) return null;
    return (
        <div className="fixed top-6 right-6 z-[100] animate-slide-up">
            <div className="glass-panel bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.2)] flex items-center gap-3 backdrop-blur-xl">
                <div className="bg-emerald-500 text-white p-1.5 rounded-full">
                    <Check size={16} strokeWidth={3} />
                </div>
                <div>
                    <div className="font-bold text-sm">Access Granted</div>
                    <div className="text-xs text-emerald-600/80 dark:text-emerald-400/80">Welcome back, {username}</div>
                </div>
            </div>
        </div>
    );
};

// Fix: Removed React.FC for better type inference with plain function components.
const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    
    try {
      if (isRegister) {
        // Registration Flow
        await registerUser(email, password, username);
        setSuccessMsg("Account initialized successfully. Please access terminal with credentials.");
        setIsRegister(false); // Switch back to login
        setEmail('');
        setPassword('');
      } else {
        // Login Flow
        await loginUser(email, password);
      }
    } catch (err: any) {
        if (err.code === 'auth/operation-not-allowed') {
            setError("Please enable Email/Password Auth in your Firebase Console.");
        } else {
            setError(err.message.replace('Firebase: ', ''));
        }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
      if (!email) {
          setError("Please enter your email address to reset password.");
          return;
      }
      try {
          setLoading(true);
          await resetPassword(email);
          setSuccessMsg("Password reset link sent to neural net (Check Email).");
          setError('');
      } catch (e: any) {
          setError(e.message);
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#030712] selection:bg-cyan-500/30">
      {/* Animated Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/30 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-600/30 rounded-full blur-[100px] animate-pulse-slow animation-delay-2000 mix-blend-multiply dark:mix-blend-screen" />
      
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />

      <div className="relative z-10 w-full max-w-md p-6 animate-fade-in">
        {/* Logo & Branding */}
        <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-3xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 border border-white/10 backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.3)] relative">
                <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full" />
                <AppLogo className="w-12 h-12 text-white relative z-10" />
            </div>
            <h1 className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-blue-400 tracking-tight mb-2">
                TradeFlow
            </h1>
            <p className="text-slate-400 font-light tracking-wide">Identify Your Edge. Master Your Mind.</p>
        </div>

        {/* Auth Card */}
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
            <div className="absolute inset-0 border border-cyan-500/0 group-hover:border-cyan-500/20 transition-all duration-500 rounded-3xl" />
            
            {/* Toggle Switch */}
            <div className="relative flex p-1 rounded-xl bg-black/40 mb-8 border border-white/5">
                <div className={`absolute inset-y-1 w-[calc(50%-4px)] bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg transition-all duration-300 ease-out shadow-lg ${isRegister ? 'left-[calc(50%+2px)]' : 'left-1'}`} />
                <button 
                    type="button"
                    onClick={() => { setIsRegister(false); setError(''); setSuccessMsg(''); }}
                    className={`relative z-10 flex-1 py-2.5 text-sm font-bold transition-colors ${!isRegister ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    Log In
                </button>
                <button 
                    type="button"
                    onClick={() => { setIsRegister(true); setError(''); setSuccessMsg(''); }}
                    className={`relative z-10 flex-1 py-2.5 text-sm font-bold transition-colors ${isRegister ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    Sign Up
                </button>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
                {error && (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start gap-3 animate-slide-up">
                        <AlertTriangle size={18} className="shrink-0 mt-0.5" /> 
                        <span>{error}</span>
                    </div>
                )}
                
                {successMsg && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-start gap-3 animate-slide-up">
                        <CheckCircle size={18} className="shrink-0 mt-0.5" /> 
                        <span>{successMsg}</span>
                    </div>
                )}

                <div className={`space-y-5 transition-all duration-300`}>
                    {isRegister && (
                        <div className="group/input space-y-1.5 animate-slide-up">
                            <label className="text-xs font-bold text-cyan-300/80 uppercase tracking-wider ml-1">Username</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 w-10 flex items-center justify-center text-slate-500 group-focus-within/input:text-cyan-400 transition-colors">
                                    <UserIcon size={18} />
                                </div>
                                <input 
                                    value={username} 
                                    onChange={e => setUsername(e.target.value)} 
                                    placeholder="Choose a unique handle"
                                    className="w-full bg-black/30 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:bg-black/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                                    required={isRegister}
                                    minLength={3}
                                />
                            </div>
                        </div>
                    )}

                    <div className="group/input space-y-1.5">
                        <label className="text-xs font-bold text-cyan-300/80 uppercase tracking-wider ml-1">Email</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 w-10 flex items-center justify-center text-slate-500 group-focus-within/input:text-cyan-400 transition-colors">
                                <Mail size={18} />
                            </div>
                            <input 
                                type="email"
                                value={email} 
                                onChange={e => setEmail(e.target.value)} 
                                placeholder="trader@example.com" 
                                className="w-full bg-black/30 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:bg-black/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                                required 
                            />
                        </div>
                    </div>

                    <div className="group/input space-y-1.5">
                        <div className="flex justify-between">
                            <label className="text-xs font-bold text-cyan-300/80 uppercase tracking-wider ml-1">Password</label>
                            {!isRegister && (
                                <button 
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className="text-[10px] text-slate-400 hover:text-cyan-400 transition-colors uppercase font-bold tracking-wide"
                                >
                                    Forgot Password?
                                </button>
                            )}
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 w-10 flex items-center justify-center text-slate-500 group-focus-within/input:text-cyan-400 transition-colors">
                                <Lock size={18} />
                            </div>
                            <input 
                                type="password"
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                placeholder="••••••••" 
                                className="w-full bg-black/30 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:bg-black/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                                required 
                                minLength={6}
                            />
                        </div>
                    </div>
                </div>

                <Button type="submit" variant="neon" className="w-full mt-8 h-12 text-lg shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:scale-[1.02]" disabled={loading}>
                    {loading ? (
                        <span className="flex items-center gap-2"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</span>
                    ) : isRegister ? 'Sign Up' : 'Log In'}
                </Button>
            </form>
        </div>
        
        <div className="text-center mt-8 text-xs text-slate-600 mix-blend-plus-lighter">
             &copy; {new Date().getFullYear()} TradeFlow. All rights reserved.
        </div>
      </div>
    </div>
  );
};

// Define props for NewsView
interface NewsViewProps {
  news: { sentiment: string, events: CalendarEvent[] };
}

// Define props for AICoachView
interface AICoachViewProps {
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  isSending: boolean;
  setIsSending: React.Dispatch<React.SetStateAction<boolean>>;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [activeTab, setActiveTab] = useState('journal');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [disciplineLogs, setDisciplineLogs] = useState<DisciplineLog[]>([]);
  const [news, setNews] = useState<{sentiment: string, events: CalendarEvent[]}>({ sentiment: '', events: [] });
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  
  const [isAddTradeOpen, setIsAddTradeOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Partial<Trade> | undefined>(undefined);
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountBroker, setNewAccountBroker] = useState('');
  const [newAccountBalance, setNewAccountBalance] = useState('');
  const [isConnectOpen, setIsConnectOpen] = useState(false);

  // New state for AI Coach loading
  const [isAICoachSending, setIsAICoachSending] = useState(false);

  // New state for Toast notifications
  const [toastMessage, setToastMessage] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
      setToastMessage({ message, type });
      setTimeout(() => setToastMessage(null), 3000); // Hide after 3 seconds
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [theme]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((u) => {
      if (u && !user) {
          setShowWelcome(true);
          setTimeout(() => setShowWelcome(false), 5000);
      }
      setUser(u);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
      if (!user) return;
      const unsubTrades = subscribeToTrades(user.uid, setTrades);
      const unsubAccounts = subscribeToAccounts(user.uid, setAccounts);
      const unsubDiscipline = subscribeToDiscipline(user.uid, setDisciplineLogs);
      initializeTodayLog(user.uid);
      
      const loadNews = async () => {
          const data = await getLiveMarketNews();
          setNews(data);
      }
      loadNews();

      return () => {
          unsubTrades();
          unsubAccounts();
          unsubDiscipline();
      };
  }, [user]);

  const handleLogout = useCallback(() => {
    logoutUser();
    setUser(null);
  }, []);
  
  const handleSaveTrade = useCallback(async (trade: Trade) => {
    try {
        if (trade.id) {
           await updateTradeInDb(trade);
           showToast('Trade updated successfully!', 'success');
        } else {
           await addTradeToDb(trade, user!.uid);
           showToast('Trade logged successfully!', 'success');
        }
        setEditingTrade(undefined);
        setIsAddTradeOpen(false);
    } catch (error) {
        showToast('Failed to save trade.', 'error');
        console.error("Save Trade Error:", error);
    }
  }, [user, showToast]);

  const handleDeleteTrade = useCallback(async (id: string) => {
    if (window.confirm('Are you sure you want to delete this trade?')) {
        try {
            await deleteTradeFromDb(id);
            showToast('Trade deleted.', 'success');
        } catch (error) {
            showToast('Failed to delete trade.', 'error');
            console.error("Delete Trade Error:", error);
        }
    }
  }, [showToast]);
  
  const handleAddAccount = useCallback(async () => {
      if (!newAccountName || !newAccountBalance || !user) return;
      try {
        const account: Account = {
            id: Date.now().toString(), // Firebase will assign real ID on addDoc
            name: newAccountName,
            broker: newAccountBroker || 'Custom',
            balance: parseFloat(newAccountBalance),
            currency: 'USD',
            userId: user.uid
        };
        await addAccountToDb(account, user.uid);
        showToast('Account created successfully!', 'success');
        setNewAccountName('');
        setNewAccountBroker('');
        setNewAccountBalance('');
      } catch (error) {
          showToast('Failed to add account.', 'error');
          console.error("Add Account Error:", error);
      }
  }, [newAccountName, newAccountBalance, newAccountBroker, user, showToast]);

  const handleDeleteAccount = useCallback(async (id: string) => {
      if(window.confirm('Are you sure? This will delete the account and all associated trades!')) {
          try {
              await deleteAccountFromDb(id);
              showToast('Account deleted.', 'success');
              if (selectedAccount === id) setSelectedAccount('all');
          } catch (error) {
              showToast('Failed to delete account.', 'error');
              console.error("Delete Account Error:", error);
          }
      }
  }, [selectedAccount, showToast]);

  // --- Views defined inside App to access state ---
  const JournalView = () => {
      // Filter states
      const [pairFilter, setPairFilter] = useState('all');
      const [outcomeFilter, setOutcomeFilter] = useState<TradeOutcome | 'all'>('all');
      const [directionFilter, setDirectionFilter] = useState<TradeDirection | 'all'>('all');

      let filteredTrades = selectedAccount === 'all' 
        ? trades 
        : trades.filter(t => t.accountId === selectedAccount);
      
      // Apply additional filters
      if (pairFilter !== 'all') {
          filteredTrades = filteredTrades.filter(t => t.pair === pairFilter);
      }
      if (outcomeFilter !== 'all') {
          filteredTrades = filteredTrades.filter(t => t.outcome === outcomeFilter);
      }
      if (directionFilter !== 'all') {
          filteredTrades = filteredTrades.filter(t => t.direction === directionFilter);
      }

      const sortedTrades = [...filteredTrades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const [magicInput, setMagicInput] = useState('');
      const [isParsing, setIsParsing] = useState(false);
      const [expandedTradeId, setExpandedTradeId] = useState<string | null>(null);

      const totalPnL = filteredTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
      const winCount = filteredTrades.filter(t => t.outcome === TradeOutcome.WIN).length;
      const totalDecidedTrades = filteredTrades.filter(t => t.outcome !== TradeOutcome.PENDING).length;
      const winRate = totalDecidedTrades > 0 ? (winCount / totalDecidedTrades) * 100 : 0;
      
      const bestPairEntry = Object.entries(filteredTrades.reduce((acc, t) => {
          acc[t.pair] = (acc[t.pair] || 0) + (t.pnl || 0);
          return acc;
      }, {} as Record<string, number>)).sort((a,b) => b[1] - a[1])[0];
      const bestPair = bestPairEntry ? bestPairEntry[0] : '--';

      const handleMagicLog = async () => {
          if(!magicInput || !user) return;
          setIsParsing(true);
          try {
            const data = await parseTradeFromNaturalLanguage(magicInput);
            setEditingTrade(data); // Pre-fill the modal
            setIsAddTradeOpen(true);
            setMagicInput('');
            showToast('Magic Log parsed! Review details.', 'success');
          } catch (error) {
            showToast('Magic Log failed to parse.', 'error');
            console.error("Magic Log Error:", error);
          } finally {
            setIsParsing(false);
          }
      }

      const handleExportCSV = () => {
          const headers = ['Date', 'Pair', 'Direction', 'Entry Price', 'Exit Price', 'SL', 'TP', 'Lot Size', 'Outcome', 'PnL', 'R-Multiple', 'Risk %', 'Setup', 'Session', 'Notes', 'AI Analysis'];
          const rows = sortedTrades.map(t => [
              new Date(t.date).toLocaleString(),
              t.pair,
              t.direction,
              t.entryPrice || '',
              t.exitPrice || '',
              t.sl || '',
              t.tp || '',
              t.lotSize || '',
              t.outcome,
              t.pnl || '',
              t.rMultiple || '',
              t.riskPercentage || '',
              t.setup || '',
              t.session,
              `"${t.notes}"`,
              `"${t.aiAnalysis || ''}"`
          ]);
          const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
          const encodedUri = encodeURI(csvContent);
          const link = document.createElement("a");
          link.setAttribute("href", encodedUri);
          link.setAttribute("download", "trade_journal.csv");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      };

      const uniquePairs = ['all', ...new Set(trades.map(t => t.pair))];

      return (
          <div className="space-y-6 animate-fade-in pb-20">
              {/* Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="glass-panel p-4 rounded-xl border-l-4 border-l-cyan-500">
                      <div className="text-xs text-slate-500 uppercase font-bold">Net PnL</div>
                      <div className={`text-xl font-bold font-mono ${totalPnL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
                      </div>
                  </div>
                  <div className="glass-panel p-4 rounded-xl border-l-4 border-l-purple-500">
                      <div className="text-xs text-slate-500 uppercase font-bold">Win Rate</div>
                      <div className="text-xl font-bold text-slate-800 dark:text-white">{winRate.toFixed(1)}%</div>
                  </div>
                   <div className="glass-panel p-4 rounded-xl border-l-4 border-l-amber-500">
                      <div className="text-xs text-slate-500 uppercase font-bold">Top Pair</div>
                      <div className="text-xl font-bold text-slate-800 dark:text-white">{bestPair}</div>
                  </div>
                  <div className="glass-panel p-4 rounded-xl border-l-4 border-l-blue-500">
                      <div className="text-xs text-slate-500 uppercase font-bold">Total Trades</div>
                      <div className="text-xl font-bold text-slate-800 dark:text-white">{filteredTrades.length}</div>
                  </div>
              </div>

              {/* Header with Actions */}
              <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                  <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Trade Journal</h2>
                  <div className="flex gap-3 w-full md:w-auto">
                     <Button variant="secondary" onClick={handleExportCSV} size="sm" className="flex-1 md:flex-none">
                        <Download size={16} /> Export
                     </Button>
                     <Button onClick={() => { setEditingTrade(undefined); setIsAddTradeOpen(true); }} variant="neon" className="flex-1 md:flex-none">
                        <Plus size={18} /> Log Trade
                     </Button>
                  </div>
              </div>

              {/* Magic Log Input (Prominent) */}
              <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Sparkles className={`text-cyan-500 ${isParsing ? 'animate-spin' : ''}`} size={18} />
                  </div>
                  <input 
                      type="text" 
                      value={magicInput}
                      onChange={e => setMagicInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleMagicLog()}
                      placeholder="Magic Log: 'Long BTCUSD at 65k, sold at 68k, felt great...'"
                      className="w-full pl-10 pr-4 py-4 bg-white dark:bg-slate-900/60 border-2 border-transparent focus:border-cyan-500/50 rounded-2xl shadow-lg focus:outline-none text-base md:text-lg transition-all placeholder-slate-400 dark:text-white backdrop-blur-xl"
                  />
                  <div className="absolute inset-y-0 right-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="ghost" onClick={handleMagicLog} disabled={!magicInput}>
                          <ArrowRight size={18}/>
                      </Button>
                  </div>
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-3">
                  <Select value={pairFilter} onChange={e => setPairFilter(e.target.value)} className="w-full sm:w-auto text-sm">
                      <option value="all">All Pairs</option>
                      {uniquePairs.map(pair => pair !== 'all' && <option key={pair} value={pair}>{pair}</option>)}
                  </Select>
                  <Select value={outcomeFilter} onChange={e => setOutcomeFilter(e.target.value as TradeOutcome | 'all')} className="w-full sm:w-auto text-sm">
                      <option value="all">All Outcomes</option>
                      <option value={TradeOutcome.WIN}>Win</option>
                      <option value={TradeOutcome.LOSS}>Loss</option>
                      <option value={TradeOutcome.BREAKEVEN}>Breakeven</option>
                      <option value={TradeOutcome.PENDING}>Pending</option>
                  </Select>
                  <Select value={directionFilter} onChange={e => setDirectionFilter(e.target.value as TradeDirection | 'all')} className="w-full sm:w-auto text-sm">
                      <option value="all">All Directions</option>
                      <option value={TradeDirection.BUY}>BUY</option>
                      <option value={TradeDirection.SELL}>SELL</option>
                  </Select>
              </div>


              {/* Trade List / Table */}
              <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
                  {/* Desktop Header */}
                  <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-white/10 text-xs font-bold uppercase text-slate-500 tracking-wider">
                      <div className="col-span-1">Date</div>
                      <div className="col-span-2">Pair</div>
                      <div className="col-span-2">Entry/Exit</div>
                      <div className="col-span-2">SL/TP</div>
                      <div className="col-span-1 text-center">Lot</div>
                      <div className="col-span-1 text-center">Outcome</div>
                      <div className="col-span-2 text-right">PnL / R</div>
                      <div className="col-span-1 text-right"></div> {/* Actions column */}
                  </div>
                  
                  {/* Skeleton Loader */}
                  {sortedTrades.length === 0 && (trades.length === 0 ? 
                       <div className="text-center py-20 text-slate-500 flex flex-col items-center">
                           <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
                           <p>No trades logged yet. Start your journey!</p>
                       </div>
                    :
                       // Skeleton loading while filtered trades are empty but main trades array is not
                       Array.from({ length: 5 }).map((_, i) => (
                           <div key={i} className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 last:border-0 animate-pulse">
                               <div className="col-span-1 h-4 bg-slate-700 rounded" />
                               <div className="col-span-2 h-4 bg-slate-700 rounded" />
                               <div className="col-span-2 h-4 bg-slate-700 rounded" />
                               <div className="col-span-2 h-4 bg-slate-700 rounded" />
                               <div className="col-span-1 h-4 bg-slate-700 rounded" />
                               <div className="col-span-1 h-4 bg-slate-700 rounded" />
                               <div className="col-span-2 h-4 bg-slate-700 rounded" />
                               <div className="col-span-1 h-4 bg-slate-700 rounded" />
                           </div>
                       ))
                  )}

                  {sortedTrades.map(trade => (
                      <div key={trade.id} className="group border-b border-white/5 last:border-0 transition-colors hover:bg-white/5">
                          <div 
                            className="p-4 cursor-pointer"
                            onClick={() => setExpandedTradeId(expandedTradeId === trade.id ? null : trade.id)}
                          >
                              {/* Desktop Row */}
                              <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                                  <div className="col-span-1 text-sm text-slate-400 font-mono">
                                      {new Date(trade.date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                                      <span className="block text-xs opacity-50">{new Date(trade.date).toLocaleTimeString(undefined, {hour:'2-digit', minute:'2-digit'})}</span>
                                  </div>
                                  
                                  <div className="col-span-2">
                                      <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-white">
                                          {trade.pair}
                                          <span className={`text-[10px] px-1.5 rounded border ${trade.direction === TradeDirection.BUY ? 'border-emerald-500 text-emerald-500' : 'border-rose-500 text-rose-500'}`}>
                                              {trade.direction}
                                          </span>
                                      </div>
                                      {trade.setup && <div className="text-xs text-slate-500 mt-1">{trade.setup}</div>}
                                  </div>

                                  <div className="col-span-2 text-sm text-slate-400 font-mono">
                                      {trade.entryPrice ? trade.entryPrice.toFixed(4) : '--'} / {trade.exitPrice ? trade.exitPrice.toFixed(4) : '--'}
                                  </div>
                                  <div className="col-span-2 text-sm text-slate-400 font-mono">
                                      {trade.sl ? trade.sl.toFixed(4) : '--'} / {trade.tp ? trade.tp.toFixed(4) : '--'}
                                  </div>
                                  <div className="col-span-1 text-center text-sm text-slate-400 font-mono">
                                      {trade.lotSize || '--'}
                                  </div>

                                  <div className="col-span-1 text-center">
                                      <Badge color={trade.outcome === TradeOutcome.WIN ? 'green' : trade.outcome === TradeOutcome.LOSS ? 'red' : 'gray'}>
                                          {trade.outcome}
                                      </Badge>
                                  </div>

                                  <div className="col-span-2 text-right">
                                      <div className={`font-mono font-bold text-lg ${trade.pnl && trade.pnl > 0 ? 'text-emerald-400' : trade.pnl && trade.pnl < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                                          {trade.pnl && trade.pnl > 0 ? '+' : ''}{trade.pnl ? `$${trade.pnl.toFixed(2)}` : '--'}
                                      </div>
                                      <div className="text-xs text-slate-500">
                                          {trade.rMultiple ? `${trade.rMultiple.toFixed(1)}R` : ''}
                                          {trade.riskPercentage ? ` • ${trade.riskPercentage}%` : ''}
                                      </div>
                                  </div>

                                  <div className="col-span-1 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditingTrade(trade); setIsAddTradeOpen(true); }}>
                                          <Edit2 size={14} />
                                      </Button>
                                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteTrade(trade.id); }} className="text-rose-500 hover:text-rose-600">
                                          <Trash2 size={14} />
                                      </Button>
                                      <ChevronDown size={16} className={`text-slate-500 transition-transform duration-300 ${expandedTradeId === trade.id ? 'rotate-180' : ''}`} />
                                  </div>
                              </div>

                              {/* Mobile Card Layout */}
                              <div className="md:hidden flex flex-col gap-2 p-2">
                                   <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-lg text-slate-900 dark:text-white">{trade.pair}</span>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${trade.direction === TradeDirection.BUY ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                {trade.direction}
                                            </span>
                                        </div>
                                        <div className={`font-mono font-bold text-lg ${trade.pnl && trade.pnl > 0 ? 'text-emerald-400' : trade.pnl && trade.pnl < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                                            {trade.pnl && trade.pnl > 0 ? '+' : ''}{trade.pnl ? `$${trade.pnl.toFixed(2)}` : '--'}
                                        </div>
                                   </div>
                                   <div className="flex justify-between items-center text-sm text-slate-500">
                                        <div className="flex flex-col">
                                            <span>{new Date(trade.date).toLocaleDateString()}</span>
                                            {trade.setup && <span className="text-xs opacity-70">{trade.setup}</span>}
                                        </div>
                                        <div className="flex items-center gap-3">
                                             {trade.rMultiple ? <span className="text-xs font-mono">{trade.rMultiple.toFixed(1)}R</span> : null}
                                             <Badge color={trade.outcome === TradeOutcome.WIN ? 'green' : trade.outcome === TradeOutcome.LOSS ? 'red' : 'gray'}>
                                                 {trade.outcome}
                                             </Badge>
                                        </div>
                                   </div>
                              </div>
                          </div>

                          {/* Expanded Details */}
                          {expandedTradeId === trade.id && (
                              <div className="px-4 pb-6 pt-0 animate-slide-up bg-black/20">
                                  {/* Mobile Actions */}
                                  <div className="md:hidden flex gap-2 pt-4 pb-2 border-b border-white/10 mb-4">
                                      <Button variant="secondary" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); setEditingTrade(trade); setIsAddTradeOpen(true); }}>
                                          <Edit2 size={16} /> Edit
                                      </Button>
                                      <Button variant="danger" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); handleDeleteTrade(trade.id); }}>
                                          <Trash2 size={16} /> Delete
                                      </Button>
                                      <Button variant="secondary" size="sm" className="flex-1" onClick={async (e) => { e.stopPropagation(); await analyzeTradePsychology(trade); /* Update trade */ }}>
                                          <BrainCircuit size={16} /> AI Sentiment
                                      </Button>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 md:border-t border-white/10 pt-4">
                                      <div className="space-y-4">
                                          {/* Technical Details */}
                                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-300">
                                              <div><span className="text-slate-500">Entry:</span> {trade.entryPrice?.toFixed(4) || '--'}</div>
                                              <div><span className="text-slate-500">Exit:</span> {trade.exitPrice?.toFixed(4) || '--'}</div>
                                              <div><span className="text-slate-500">SL:</span> {trade.sl?.toFixed(4) || '--'}</div>
                                              <div><span className="text-slate-500">TP:</span> {trade.tp?.toFixed(4) || '--'}</div>
                                              <div><span className="text-slate-500">Lot:</span> {trade.lotSize || '--'}</div>
                                              <div><span className="text-slate-500">Session:</span> {trade.session || '--'}</div>
                                          </div>
                                          
                                          <div>
                                              <div className="text-xs uppercase text-slate-500 font-bold mb-1">Notes & Learnings</div>
                                              <p className="text-sm text-slate-300 leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5 italic">
                                                  "{trade.notes || 'No notes added.'}"
                                              </p>
                                          </div>
                                          <div className="flex gap-4">
                                              <div>
                                                  <div className="text-xs uppercase text-slate-500 font-bold mb-1">Execution Grade</div>
                                                  <div className={`text-2xl font-bold ${trade.checklistScore === 'A' ? 'text-emerald-500' : 'text-yellow-500'}`}>{trade.checklistScore}</div>
                                              </div>
                                               {/* Per-Trade Sentiment Analysis Button */}
                                              <div>
                                                  <Button size="sm" variant="secondary" onClick={async () => {
                                                      const sentiment = await analyzeTradePsychology(trade);
                                                      await updateTradeInDb({ ...trade, sentimentAnalysis: sentiment });
                                                      showToast("Sentiment analyzed!", "success");
                                                  }}>
                                                      <BrainCircuit size={16} /> Analyze Psychology
                                                  </Button>
                                              </div>
                                          </div>
                                          {trade.sentimentAnalysis && (
                                              <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-lg">
                                                  <div className="flex items-center gap-2 text-purple-400 text-xs font-bold mb-1"><Bot size={12}/> Trader Psychology</div>
                                                  <p className="text-xs text-slate-300">{trade.sentimentAnalysis}</p>
                                              </div>
                                          )}
                                          {trade.aiAnalysis && (
                                              <div className="bg-cyan-500/10 border border-cyan-500/20 p-3 rounded-lg">
                                                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold mb-1"><Bot size={12}/> AI Insight</div>
                                                  <p className="text-xs text-slate-300">{trade.aiAnalysis}</p>
                                              </div>
                                          )}
                                      </div>
                                      
                                      <div>
                                          <div className="text-xs uppercase text-slate-500 font-bold mb-2">Chart Screenshot</div>
                                          {trade.screenshot ? (
                                              <img src={trade.screenshot} alt="Chart" className="w-full rounded-lg border border-white/10 hover:scale-105 transition-transform cursor-pointer" onClick={() => window.open(trade.screenshot, '_blank')} />
                                          ) : (
                                              <div className="w-full h-40 bg-slate-800/50 rounded-lg flex flex-col items-center justify-center text-slate-600 border border-dashed border-slate-700">
                                                  <ImageIcon size={24} className="mb-2"/>
                                                  <span className="text-xs">No chart uploaded</span>
                                              </div>
                                          )}
                                      </div>
                                  </div>
                              </div>
                          )}
                      </div>
                  ))}
              </div>
          </div>
      );
  };

  const NewsView: React.FC<NewsViewProps> = ({ news }) => (
      <div className="space-y-6 animate-fade-in pb-20">
           <div className="flex justify-between items-end">
              <div>
                   <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-3">
                       <Flame className="text-rose-500 fill-rose-500/20 animate-pulse" /> Red Folder News
                   </h2>
                   <p className="text-slate-500 dark:text-slate-400 mt-2">High-impact events that move the markets.</p>
              </div>
              <div className="flex gap-2">
                  <Badge color="red">HIGH IMPACT ONLY</Badge>
              </div>
           </div>
           
           <MarketSessionClocks />

           <div className="grid gap-4">
                {news.events.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">No high impact news found for this week.</div>
                ) : (
                    news.events.map(event => (
                        <Card key={event.id} className="flex items-center justify-between p-4 group hover:bg-slate-800/50 transition-colors border-l-4 border-l-rose-500 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            
                            <div className="flex items-center gap-6 relative z-10">
                                <div className="text-center min-w-[80px]">
                                    <div className="text-lg font-bold text-slate-800 dark:text-white font-display">{event.time}</div>
                                    <div className="flex justify-center mt-2">
                                        <Badge color="red" >HIGH</Badge>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                                        <span className="text-2xl">{event.currency === 'USD' ? '🇺🇸' : event.currency === 'EUR' ? '🇪🇺' : event.currency === 'GBP' ? '🇬🇧' : event.currency === 'JPY' ? '🇯🇵' : '🌍'}</span>
                                        {event.event}
                                    </div>
                                    <div className="text-sm text-slate-500 mt-1 flex gap-4">
                                        <span>Fcst: <span className="text-slate-300 font-mono">{event.forecast || '--'}</span></span>
                                        <span>Prev: <span className="text-slate-300 font-mono">{event.previous || '--'}</span></span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right relative z-10">
                                 <div className={`font-mono font-bold text-2xl ${event.isBetter ? 'text-emerald-400' : event.actual ? 'text-rose-400' : 'text-slate-500'}`}>
                                    {event.actual || '--'}
                                 </div>
                                 <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-1">Actual</div>
                            </div>
                        </Card>
                    ))
                )}
           </div>
           
           {news.sentiment && (
                <div className="mt-8 p-6 rounded-2xl bg-slate-900/50 border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><Bot size={18} className="text-indigo-400"/> Weekly Market Outlook</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{news.sentiment.split('\n\nSources')[0]}</p>
                </div>
           )}
      </div>
  );

  const AnalyticsView = () => {
      const [dateRange, setDateRange] = useState<DateRange>('all');
      
      const getDateFilter = () => {
          const now = new Date();
          let startDate = new Date(0); // Epoch
          if (dateRange === '7d') {
              startDate.setDate(now.getDate() - 7);
          } else if (dateRange === '30d') {
              startDate.setDate(now.getDate() - 30);
          } else if (dateRange === '90d') {
              startDate.setDate(now.getDate() - 90);
          }
          return startDate;
      };

      const filterDate = getDateFilter();

      let filteredTrades = selectedAccount === 'all'
        ? trades
        : trades.filter(t => t.accountId === selectedAccount);
      
      // Apply date range filter
      filteredTrades = filteredTrades.filter(t => new Date(t.date) >= filterDate);

      const totalPnL = filteredTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
      const winCount = filteredTrades.filter(t => t.outcome === TradeOutcome.WIN).length;
      const totalDecidedTrades = filteredTrades.filter(t => t.outcome !== TradeOutcome.PENDING).length;
      const winRate = totalDecidedTrades > 0 
          ? (winCount / totalDecidedTrades * 100) 
          : 0;

      // Calculate Equity Curve starting from initial account balances
      const initialBalance = selectedAccount === 'all' 
          ? accounts.reduce((sum, acc) => sum + acc.balance, 0)
          : accounts.find(acc => acc.id === selectedAccount)?.balance || 0;
      
      let currentEquity = initialBalance;
      const equityData = filteredTrades.map((trade, index) => {
          currentEquity += trade.pnl || 0;
          return {
              name: `Trade ${index + 1}`,
              equity: currentEquity,
              date: new Date(trade.date).toLocaleDateString()
          };
      });

      return (
        <div className="space-y-6 animate-fade-in pb-20">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Analytics Dashboard</h2>
                <Select value={dateRange} onChange={e => setDateRange(e.target.value as DateRange)} className="w-40 text-sm">
                    <option value="all">All Time</option>
                    <option value="90d">Last 90 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="7d">Last 7 Days</option>
                </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 flex flex-col">
                    <h3 className="font-bold text-slate-700 dark:text-white mb-4 flex items-center gap-2"><TrendingUp size={20} className="text-cyan-500"/> Equity Curve</h3>
                    <div className="flex-1 min-h-[300px]">
                        <EquityCurve trades={filteredTrades} />
                    </div>
                </Card>
                
                {/* Fixed: Pass initialBalance to EquitySimulator */}
                <EquitySimulator currentBalance={initialBalance} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <h3 className="font-bold text-slate-700 dark:text-white mb-4 flex items-center gap-2"><PieChart size={18} className="text-emerald-500"/> Win Rate</h3>
                    <WinLossChart trades={filteredTrades} />
                </Card>
                <Card>
                    <h3 className="font-bold text-slate-700 dark:text-white mb-4 flex items-center gap-2"><Layers size={18} className="text-purple-500"/> Strategy Performance</h3>
                    <StrategyChart trades={filteredTrades} />
                </Card>
                <Card>
                    <h3 className="font-bold text-slate-700 dark:text-white mb-4 flex items-center gap-2"><Globe size={18} className="text-blue-500"/> Best Pairs</h3>
                    <PairPerformanceChart trades={filteredTrades} />
                </Card>
                 <Card>
                    <h3 className="font-bold text-slate-700 dark:text-white mb-4 flex items-center gap-2"><CalendarIcon size={18} className="text-amber-500"/> Daily Performance</h3>
                    <DayOfWeekChart trades={filteredTrades} />
                </Card>
            </div>
        </div>
      );
  };

  const DisciplineView: React.FC<{ logs: DisciplineLog[], userId: string }> = ({ logs, userId }) => {
      const today = new Date().toISOString().split('T')[0];
      const todayLog = logs.find(l => l.date === today) || {
          id: `${userId}_${today}`,
          userId,
          date: today,
          followedPlan: false,
          noRevenge: false,
          calmEmotion: false,
          journaled: false,
          notes: '',
          mood: 50,
          intention: ''
      };

      const [formState, setFormState] = useState(todayLog);
      
      const [localNotes, setLocalNotes] = useState('');
      const [localIntention, setLocalIntention] = useState('');
      const lastLoadedId = useRef<string>('');

      useEffect(() => {
          const freshLog = logs.find(l => l.date === today);
          if (freshLog) {
              setFormState(prev => ({...freshLog}));
          }
      }, [logs, today]);

      useEffect(() => {
        if (formState.id !== lastLoadedId.current) {
            setLocalIntention(formState.intention || '');
            setLocalNotes(formState.notes || '');
            lastLoadedId.current = formState.id;
        }
      }, [formState.id, formState.intention, formState.notes]);

      const handleToggle = async (field: keyof DisciplineLog) => {
          const newVal = !formState[field];
          // @ts-ignore
          const updated = { ...formState, [field]: newVal };
          setFormState(updated);
          await updateDisciplineLog(updated, userId);
      };

      const handleSlider = async (val: number) => {
          const updated = { ...formState, mood: val };
          setFormState(updated);
          await updateDisciplineLog(updated, userId);
      };
      
      const saveTextFields = async () => {
          const updated = { ...formState, notes: localNotes, intention: localIntention };
          setFormState(updated);
          await updateDisciplineLog(updated, userId);
      };

      const getHeatmapData = () => {
        const data = [];
        for (let i = 13; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const log = logs.find(l => l.date === dateStr);
            data.push({ date: dateStr, log });
        }
        return data;
      };

      return (
          <div className="space-y-6 animate-fade-in pb-20">
              <div className="flex justify-between items-end">
                  <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Mindset & Discipline</h2>
                  <BreathingExercise />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column */}
                  <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white border-cyan-500/30 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><BrainCircuit size={100} /></div>
                        <h3 className="font-bold text-xl mb-6 relative z-10">Daily Checklist</h3>
                        <div className="space-y-4 relative z-10">
                            {[
                                { id: 'followedPlan', label: 'Followed Trading Plan', icon: Target },
                                { id: 'noRevenge', label: 'No Revenge Trading', icon: Shield },
                                { id: 'calmEmotion', label: 'Stayed Calm & Focused', icon: Smile },
                                { id: 'journaled', label: 'Journaled All Trades', icon: BookOpen },
                            ].map(item => (
                                <div 
                                    key={item.id}
                                    onClick={() => handleToggle(item.id as keyof DisciplineLog)}
                                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                                        // @ts-ignore
                                        formState[item.id] 
                                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' 
                                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon size={20} />
                                        <span className="font-bold">{item.label}</span>
                                    </div>
                                    {/* @ts-ignore */}
                                    {formState[item.id] ? <CheckCircle size={24} className="text-emerald-500"/> : <div className="w-6 h-6 rounded-full border-2 border-slate-600" />}
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-white/10 relative z-10">
                             <label className="text-sm font-bold text-slate-400 mb-2 block">Daily Intention</label>
                             <Input 
                                value={localIntention}
                                onChange={(e) => setLocalIntention(e.target.value)}
                                onBlur={saveTextFields}
                                placeholder="My goal for today is..."
                                className="bg-black/20 border-white/10 text-white"
                             />
                        </div>
                    </Card>

                    <Card>
                        <h3 className="font-bold text-slate-700 dark:text-white mb-4">End of Day Reflection</h3>
                        <textarea 
                                value={localNotes}
                                onChange={(e) => setLocalNotes(e.target.value)}
                                onBlur={saveTextFields}
                                placeholder="How did you feel during the session? What did you do well? What needs improvement?"
                                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 h-32 focus:outline-none focus:border-cyan-500 resize-none"
                        />
                    </Card>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                       <Card>
                           <h3 className="font-bold text-slate-700 dark:text-white mb-4">Emotional State</h3>
                           <div className="text-center mb-6">
                               <div className="text-4xl mb-2">{formState.mood && formState.mood > 80 ? '🤩' : formState.mood && formState.mood > 60 ? '🙂' : formState.mood && formState.mood > 40 ? '😐' : formState.mood && formState.mood > 20 ? '😖' : '🤬'}</div>
                               <div className="font-bold text-cyan-500">{formState.mood}/100</div>
                           </div>
                           <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={formState.mood || 50} 
                                onChange={(e) => handleSlider(parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                           />
                           <div className="flex justify-between text-xs text-slate-500 mt-2">
                               <span>Tilted</span>
                               <span>Neutral</span>
                               <span>Flow State</span>
                           </div>
                       </Card>

                       <Card>
                            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Consistency (14 Days)</h3>
                            <div className="flex gap-2 justify-center">
                                {getHeatmapData().map((d, i) => (
                                    <div 
                                        key={i}
                                        title={`${d.date}: ${d.log ? (d.log.followedPlan ? 'Disciplined' : 'Undisciplined') : 'No Log'}`}
                                        className={`w-3 h-8 rounded-sm ${
                                            !d.log ? 'bg-slate-200 dark:bg-slate-800' :
                                            d.log.followedPlan && d.log.noRevenge ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' :
                                            d.log.followedPlan ? 'bg-emerald-500/60' :
                                            'bg-rose-500'
                                        }`}
                                    />
                                ))}
                            </div>
                            <div className="flex justify-between text-xs text-slate-400 mt-3">
                                <span>2 Weeks Ago</span>
                                <span>Today</span>
                            </div>
                        </Card>
                  </div>
              </div>
              
              {/* History Log Section */}
              <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">History Log</h3>
                  <div className="glass-panel rounded-xl overflow-hidden">
                      <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 bg-slate-50/50 dark:bg-white/5 text-xs font-bold uppercase text-slate-500">
                          <div className="col-span-2">Date</div>
                          <div className="col-span-2">Checklist</div>
                          <div className="col-span-2">Mood</div>
                          <div className="col-span-6">Reflection</div>
                      </div>
                      {logs.slice(0, 7).map(log => (
                          <div key={log.id} className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 text-sm items-center">
                              <div className="col-span-2 text-slate-400">{log.date}</div>
                              <div className="col-span-2">
                                  {log.followedPlan && log.noRevenge 
                                    ? <Badge color="green">Perfect</Badge> 
                                    : log.followedPlan 
                                        ? <Badge color="blue">Okay</Badge> 
                                        : <Badge color="red">Poor</Badge>
                                  }
                              </div>
                              <div className="col-span-2">
                                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                      <div className={`h-full ${log.mood && log.mood > 50 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${log.mood || 50}%` }}/>
                                  </div>
                              </div>
                              <div className="col-span-6 text-slate-500 truncate">{log.notes || "No notes."}</div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      );
  };

  const AICoachView: React.FC<AICoachViewProps> = ({ chatHistory, setChatHistory, isSending, setIsSending }) => {
      const [input, setInput] = useState('');
      const messagesEndRef = useRef<HTMLDivElement>(null);

      const scrollToBottom = () => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      };

      useEffect(() => {
          scrollToBottom();
      }, [chatHistory, isSending]); // Changed isLoading to isSending

      const handleSend = async () => {
          if (!input.trim()) return;
          
          const userMsg: ChatMessage = {
              id: Date.now().toString(),
              role: 'user',
              text: input,
              timestamp: Date.now()
          };
          
          setChatHistory(prev => [...prev, userMsg]);
          setInput('');
          setIsSending(true); // Use prop setter

          try {
              // chatWithTradeCoach can accept an optional image argument, but this UI doesn't provide it yet.
              const response = await chatWithTradeCoach(chatHistory, userMsg.text);
              const aiMsg: ChatMessage = {
                  id: (Date.now() + 1).toString(),
                  role: 'assistant',
                  text: response,
                  timestamp: Date.now()
              };
              setChatHistory(prev => [...prev, aiMsg]);
          } catch (e) {
              console.error(e);
              setChatHistory(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', text: "Error connecting to AI Coach.", timestamp: Date.now() }]);
          } finally {
              setIsSending(false); // Use prop setter
          }
      };

      return (
          <div className="h-[calc(100vh-140px)] flex flex-col animate-fade-in">
              <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                      <Bot className="text-white" size={24} />
                  </div>
                  <div>
                      <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">AI Performance Coach</h2>
                      <p className="text-slate-500 text-sm">Ask about psychology, strategy, or analyze your recent trades.</p>
                  </div>
              </div>

              <Card className="flex-1 flex flex-col p-0 overflow-hidden bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {chatHistory.length === 0 && (
                          <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                              <Bot size={64} className="mb-4 text-slate-600" />
                              <p>I'm ready to review your trading.</p>
                              <p className="text-sm">Ask me: "Analyze my last loss" or "How to stop revenge trading?"</p>
                          </div>
                      )}
                      
                      {chatHistory.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[80%] p-4 rounded-2xl ${
                                  msg.role === 'user' 
                                  ? 'bg-cyan-600 text-white rounded-tr-none shadow-lg shadow-cyan-500/20' 
                                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-700'
                              }`}>
                                  <div className="whitespace-pre-wrap">{msg.text}</div>
                              </div>
                          </div>
                      ))}
                      {isSending && ( 
                          <div className="flex justify-start">
                              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-700">
                                  <div className="flex gap-2">
                                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
                                  </div>
                              </div>
                          </div>
                      )}
                      <div ref={messagesEndRef} />
                  </div>
                  
                  <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                      <div className="relative flex items-center gap-2">
                          <input 
                              type="text" 
                              value={input}
                              onChange={(e) => setInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                              placeholder="Ask your coach..."
                              className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-cyan-500 rounded-xl px-4 py-3 focus:outline-none transition-all dark:text-white"
                          />
                          <Button onClick={handleSend} variant="neon" className="h-12 w-12 p-0 flex items-center justify-center rounded-xl" disabled={!input.trim() || isSending}> 
                              <Send size={20} className={isSending ? 'opacity-0' : ''} /> 
                              {isSending && <div className="absolute inset-0 flex items-center justify-center"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /></div>} 
                          </Button>
                      </div>
                  </div>
              </Card>
          </div>
      );
  };

  if (!user) {
    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <LoginScreen onLogin={() => {}} />
        </ThemeContext.Provider>
    );
  }

  const currentAccount = accounts[0] || { id: 'default', name: 'Default', balance: 0, currency: 'USD' };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} transition-colors duration-300 font-sans selection:bg-cyan-500/30`}>
             <BackgroundBlobs />
             {toastMessage && (
                <div className={`fixed top-6 right-6 z-[100] animate-slide-up`}>
                    <div className={`glass-panel px-6 py-4 rounded-2xl shadow-lg flex items-center gap-3 backdrop-blur-xl ${
                        toastMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                    }`}>
                        <div className={`p-1.5 rounded-full ${toastMessage.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'} text-white`}>
                            {toastMessage.type === 'success' ? <Check size={16} strokeWidth={3} /> : <X size={16} strokeWidth={3} />}
                        </div>
                        <div>
                            <div className="font-bold text-sm">{toastMessage.type === 'success' ? 'Success!' : 'Error!'}</div>
                            <div className="text-xs">{toastMessage.message}</div>
                        </div>
                    </div>
                </div>
            )}
             <WelcomeToast username={user.displayName || 'Trader'} visible={showWelcome} />
             <Navigation activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
             <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
             
             <main className="md:pl-24 p-4 md:p-8 relative z-10 max-w-7xl mx-auto min-h-screen pb-24">
                 {/* Header with Account Switcher */}
                 <div className="flex justify-between items-center mb-6">
                      {/* Mobile Header Left Side: Profile + Theme */}
                      <div className="flex-1 md:hidden flex items-center gap-3">
                           <button 
                                onClick={() => setActiveTab('profile')}
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg transition-transform active:scale-95 border-2 ${activeTab === 'profile' ? 'border-cyan-400' : 'border-transparent'}`}
                                style={{ background: 'linear-gradient(135deg, #06b6d4, #2563eb)' }}
                           >
                                {user?.displayName ? user.displayName[0].toUpperCase() : <UserIcon size={18}/>}
                           </button>

                           <Button variant="ghost" onClick={toggleTheme} className="rounded-full p-2 bg-white/10 backdrop-blur-md border border-white/10">
                                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                           </Button>
                      </div>
                      
                      <div className="flex items-center gap-4 ml-auto">
                           <div className="relative">
                                <select 
                                    value={selectedAccount}
                                    onChange={(e) => setSelectedAccount(e.target.value)}
                                    className="appearance-none bg-white/10 backdrop-blur-md border border-white/20 text-white pl-10 pr-10 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm font-medium cursor-pointer hover:bg-white/20 transition-colors"
                                >
                                    <option value="all" className="bg-slate-900">All Accounts</option>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id} className="bg-slate-900">{acc.name}</option>
                                    ))}
                                </select>
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-400">
                                    <CreditCard size={16} />
                                </div>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <ChevronUp size={14} className="rotate-180" />
                                </div>
                           </div>
                           
                           <div className="hidden md:block">
                                <Button variant="ghost" onClick={toggleTheme} className="rounded-full p-2 bg-white/5 hover:bg-white/10">
                                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                                </Button>
                           </div>
                      </div>
                 </div>

                 {activeTab === 'journal' && <JournalView />}
                 {/* Fixed: Pass news prop to NewsView */}
                 {activeTab === 'news' && <NewsView news={news} />}
                 {activeTab === 'analytics' && <AnalyticsView />}
                 {activeTab === 'discipline' && <DisciplineView logs={disciplineLogs} userId={user.uid} />}
                 {/* Fixed: Pass chatHistory, setChatHistory, isAICoachSending, setIsAICoachSending to AICoachView */}
                 {activeTab === 'ai-coach' && <AICoachView 
                     chatHistory={chatHistory} 
                     setChatHistory={setChatHistory} 
                     isSending={isAICoachSending} 
                     setIsSending={setIsAICoachSending} 
                 />}
                 {activeTab === 'profile' && (
                     <div className="space-y-6 animate-fade-in pb-20">
                        <h2 className="text-3xl font-display font-bold">Profile & Settings</h2>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                             <Card>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-2xl font-bold text-white">
                                        {user.displayName ? user.displayName[0] : 'T'}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">{user.displayName || 'Trader'}</h3>
                                        <p className="text-slate-500">{user.email}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                        <span className="flex items-center gap-2"><Sun size={18}/> Theme Preference</span>
                                        <button onClick={toggleTheme} className={`w-12 h-6 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-cyan-600' : 'bg-slate-300'}`}>
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${theme === 'dark' ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>
                                    <Button onClick={handleLogout} variant="danger" className="w-full">Sign Out</Button>
                                </div>
                            </Card>

                            <div className="space-y-6">
                                {/* CONNECT METATRADER CARD */}
                                <Card className="border-dashed border-2 border-slate-700 bg-transparent hover:bg-slate-900/30 group cursor-pointer transition-all" onClick={() => setIsConnectOpen(true)}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform group-hover:bg-cyan-500/20 group-hover:text-cyan-400 text-slate-500">
                                                <Wifi size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-white">Connect Broker</h3>
                                                <p className="text-slate-500 text-sm">Fetch trade history directly from MetaTrader</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" className="group-hover:text-cyan-400">Connect <ChevronRight size={18} /></Button>
                                    </div>
                                </Card>

                                <Card>
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-bold text-xl flex items-center gap-2"><Wallet className="text-cyan-500"/> Trading Accounts</h3>
                                        <Badge color="blue">{accounts.length} Active</Badge>
                                    </div>

                                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                        {accounts.map(acc => (
                                            <div key={acc.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group transition-all hover:border-rose-500/30 hover:bg-rose-500/5 relative overflow-hidden">
                                                <div>
                                                    <div className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                                        {acc.name} 
                                                        {selectedAccount === acc.id && <Badge color="green">Active</Badge>}
                                                    </div>
                                                    <div className="text-xs text-slate-500">{acc.broker} • {acc.currency}</div>
                                                </div>
                                                <div className="flex items-center gap-4 z-10 relative">
                                                    <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">${acc.balance.toLocaleString()}</span>
                                                    <button 
                                                        onClick={() => handleDeleteAccount(acc.id)}
                                                        className="bg-rose-500/10 text-rose-500 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                                                        title="Delete Account"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                                        <div className="text-sm font-bold mb-3 text-slate-500">Add New Account</div>
                                        <div className="grid grid-cols-1 gap-3">
                                            <Input 
                                                placeholder="Account Name (e.g. FTMO 100k)" 
                                                value={newAccountName} 
                                                onChange={e => setNewAccountName(e.target.value)}
                                            />
                                            <div className="grid grid-cols-2 gap-3">
                                                <Input 
                                                    placeholder="Broker" 
                                                    value={newAccountBroker} 
                                                    onChange={e => setNewAccountBroker(e.target.value)}
                                                />
                                                <Input 
                                                    placeholder="Starting Balance" 
                                                    type="number" 
                                                    value={newAccountBalance} 
                                                    onChange={e => setNewAccountBalance(e.target.value)}
                                                />
                                            </div>
                                            <Button 
                                                onClick={handleAddAccount} 
                                                variant="secondary" 
                                                disabled={!newAccountName || !newAccountBalance}
                                                className="w-full"
                                            >
                                                <Plus size={18}/> Create Account
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                     </div>
                 )}
             </main>

             <AddTradeModal 
                isOpen={isAddTradeOpen} 
                onClose={() => setIsAddTradeOpen(false)} 
                onSave={handleSaveTrade}
                accounts={accounts}
                currentAccountId={selectedAccount === 'all' ? (accounts[0]?.id || '') : selectedAccount}
                initialData={editingTrade}
             />
             
             {/* Connect Modal */}
             <ConnectBrokerModal isOpen={isConnectOpen} onClose={() => setIsConnectOpen(false)} userId={user.uid} />
        </div>
    </ThemeContext.Provider>
  );
};

export default App;
