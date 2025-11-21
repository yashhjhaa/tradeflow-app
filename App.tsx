
import React, { useState, useEffect, useRef } from 'react';
import { Plus, BarChart2, BookOpen, Zap, LayoutGrid, Settings, Trash2, CheckCircle, XCircle, Menu, X, BrainCircuit, TrendingUp, LogOut, Newspaper, Layers, PieChart, ChevronUp, User as UserIcon, Camera, Upload, CheckSquare, ArrowRight, Image as ImageIcon, Calendar as CalendarIcon, Target, Activity, ChevronLeft, ChevronRight, Search, Shield, Bell, CreditCard, Sun, Moon, Maximize2, Globe, AlertTriangle, Send, Bot, Wand2, Sparkles, Battery, Flame, Edit2, Quote, Smile, Frown, Meh, Clock, Play, Pause, RotateCcw, Sliders, Lock, Mail, UserCheck, Wallet, Percent, DollarSign, Download, ChevronDown, Target as TargetIcon } from 'lucide-react';
import { Card, Button, Input, Select, Badge } from './components/UI';
import { EquityCurve, WinLossChart, PairPerformanceChart, DayOfWeekChart, StrategyChart } from './components/Charts';
import { analyzeTradePsychology, analyzeTradeScreenshot, generatePerformanceReview, getLiveMarketNews, chatWithTradeCoach, parseTradeFromNaturalLanguage } from './services/geminiService';
import { Trade, Account, DisciplineLog, CalendarEvent, TradeDirection, TradeOutcome, TradingSession, ChatMessage } from './types';
import { 
    subscribeToAuth, loginUser, logoutUser, registerUser, subscribeToTrades, 
    addTradeToDb, deleteTradeFromDb, subscribeToAccounts, 
    addAccountToDb, deleteAccountFromDb, updateAccountBalance, 
    subscribeToDiscipline, updateDisciplineLog, initializeTodayLog,
    uploadScreenshotToStorage, updateTradeInDb
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

const MobileFloatingNav: React.FC<{ activeTab: string; setActiveTab: (t: string) => void; onLogout: () => void }> = ({ activeTab, setActiveTab, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const navItems = [
    { id: 'journal', label: 'Journal', icon: BookOpen, color: 'text-cyan-600 dark:text-cyan-400' },
    { id: 'analytics', label: 'Stats', icon: PieChart, color: 'text-purple-600 dark:text-purple-400' },
    { id: 'discipline', label: 'Mindset', icon: Zap, color: 'text-amber-600 dark:text-yellow-400' },
    { id: 'news', label: 'Red Folder', icon: Flame, color: 'text-rose-600 dark:text-rose-500' },
    { id: 'ai-coach', label: 'AI Coach', icon: Bot, color: 'text-pink-600 dark:text-pink-400' },
    { id: 'profile', label: 'Profile', icon: UserIcon, color: 'text-blue-600 dark:text-blue-400' },
  ];

  return (
    <div className="md:hidden fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {isOpen && (
        <div className="flex flex-col gap-3 mb-2 animate-slide-up origin-bottom-right">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsOpen(false);
              }}
              className={`flex items-center justify-end gap-3 group`}
            >
              <span className="bg-white/90 dark:bg-black/80 dark:text-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg backdrop-blur-md shadow-lg border border-slate-200 dark:border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.label}
              </span>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center glass-card transition-all duration-200 shadow-lg ${activeTab === item.id ? 'bg-slate-100 dark:bg-white/15 border-cyan-500/50' : ''}`}>
                <item.icon size={20} className={`${item.color}`} />
              </div>
            </button>
          ))}
          <button
            onClick={onLogout}
             className={`flex items-center justify-end gap-3 group`}
          >
             <span className="bg-white/90 dark:bg-black/80 dark:text-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg backdrop-blur-md shadow-lg border border-slate-200 dark:border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                Logout
              </span>
             <div className="w-12 h-12 rounded-full flex items-center justify-center bg-rose-500/10 border border-rose-500/30 text-rose-500 shadow-lg glass-card">
                <LogOut size={20} />
             </div>
          </button>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl shadow-cyan-500/20 dark:shadow-[0_0_20px_rgba(0,243,255,0.3)] transition-all duration-300 z-50 ${isOpen ? 'bg-slate-100 dark:bg-slate-800 rotate-90 border border-slate-300 dark:border-slate-600' : 'bg-gradient-to-tr from-cyan-600 to-blue-600 dark:from-cyan-500 dark:to-blue-600 border border-white/20 text-white'}`}
      >
        {isOpen ? <X size={28} className="text-slate-600 dark:text-slate-300" /> : <AppLogo className="w-8 h-8" />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-sm z-[-1]" onClick={() => setIsOpen(false)} />
      )}
    </div>
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
        rMultiple: 0, riskPercentage: 0, setup: '', accountId: currentAccountId
    });
    const [checklist, setChecklist] = useState({
        plan: false, emotion: false, sl: false, tp: false, bias: false
    });
    const [screenshot, setScreenshot] = useState<string>('');
    const [aiAnalysis, setAiAnalysis] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState('');
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
                    rMultiple: 0, riskPercentage: 0, setup: '', accountId: currentAccountId
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
        if (formData.pnl && formData.accountId) {
            const acc = accounts.find(a => a.id === formData.accountId);
            if (acc && acc.balance) {
                const risk = (formData.pnl / acc.balance) * 100;
                setFormData(prev => ({ ...prev, riskPercentage: parseFloat(risk.toFixed(2)) }));
            }
        }
    }, [formData.pnl, formData.accountId, accounts]);

    if (!isOpen) return null;

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
                entryPrice: formData.entryPrice ? Number(formData.entryPrice) : undefined,
                sl: formData.sl ? Number(formData.sl) : undefined,
                tp: formData.tp ? Number(formData.tp) : undefined,
                lotSize: formData.lotSize ? Number(formData.lotSize) : undefined,
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
                                    <label className="text-xs text-slate-500 dark:text-slate-400">Risk %</label>
                                    <div className={`w-full px-4 py-3 rounded-xl border text-sm font-mono flex items-center ${
                                        (formData.riskPercentage || 0) > 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400' : 
                                        (formData.riskPercentage || 0) < 0 ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-400' : 
                                        'bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-900/30 dark:border-slate-700'
                                    }`}>
                                        {formData.riskPercentage}%
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 dark:text-slate-400">Setup Strategy</label>
                                    <Input value={formData.setup} onChange={e => setFormData({...formData, setup: e.target.value})} placeholder="e.g. Breakout, Reversal" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 dark:text-slate-400">R-Multiple</label>
                                    <Input type="number" value={formData.rMultiple} onChange={e => setFormData({...formData, rMultiple: parseFloat(e.target.value)})} placeholder="2.5" />
                                </div>
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

const LoginScreen: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [taglineIndex, setTaglineIndex] = useState(0);

  const taglines = [
      "Master your psychology",
      "Find your edge",
      "Track your discipline",
      "Scale your capital"
  ];

  useEffect(() => {
      const interval = setInterval(() => {
          setTaglineIndex(prev => (prev + 1) % taglines.length);
      }, 3000);
      return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await registerUser(email, password, name);
      } else {
        await loginUser(email, password);
      }
      onLogin();
    } catch (err: any) {
        if (err.code === 'auth/operation-not-allowed') {
            setError("Please enable Email/Password Auth in your Firebase Console.");
        } else {
            setError(err.message);
        }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#030712] text-white selection:bg-cyan-500/30">
      {/* Starfield Effect */}
      <div className="absolute inset-0 z-0">
         {[...Array(50)].map((_, i) => (
             <div key={i} className="absolute bg-white rounded-full animate-pulse" 
                style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    width: `${Math.random() * 3}px`,
                    height: `${Math.random() * 3}px`,
                    opacity: Math.random() * 0.5,
                    animationDuration: `${Math.random() * 3 + 2}s`
                }}
             />
         ))}
      </div>

      {/* Cyber Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] z-0" />
      
      {/* Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[150px] z-0" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[150px] z-0" />

      <div className="relative z-10 w-full max-w-[450px] p-6 perspective-1000">
        {/* Logo Header */}
        <div className="text-center mb-8 animate-fade-in">
            <div className="relative inline-block group">
                 <div className="absolute inset-0 bg-cyan-500/50 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                 <div className="relative z-10 inline-flex items-center justify-center w-20 h-20 mb-4 rounded-2xl bg-slate-900/80 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.1)] backdrop-blur-xl">
                    <AppLogo className="w-12 h-12 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                 </div>
            </div>
            <h1 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 tracking-tighter mb-2">
                TradeFlow
            </h1>
            <div className="h-6 flex justify-center items-center gap-2 text-cyan-400/80 font-mono text-sm">
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                <p key={taglineIndex} className="animate-slide-up">
                   {taglines[taglineIndex]}
                </p>
            </div>
        </div>

        {/* 3D Card Container */}
        <div className="backdrop-blur-xl bg-slate-900/70 border border-white/10 rounded-3xl p-8 shadow-[0_0_60px_rgba(0,0,0,0.6)] relative overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(6,182,212,0.1)] hover:border-cyan-500/20 group">
            
            {/* Scanning Line Animation */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-30 animate-scan pointer-events-none" />
            
            {/* CRT Scanlines */}
            <div className="absolute inset-0 scanline opacity-5 pointer-events-none" />

            <div className="relative z-10">
                {/* Toggle Switch */}
                <div className="flex p-1 rounded-xl bg-black/40 border border-white/5 mb-8 relative">
                    <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-slate-800 rounded-lg shadow-lg transition-all duration-300 ${isRegister ? 'left-[calc(50%+2px)]' : 'left-1'}`} />
                    <button 
                        onClick={() => setIsRegister(false)}
                        className={`flex-1 py-2.5 text-sm font-bold z-10 relative transition-colors ${!isRegister ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Log In
                    </button>
                    <button 
                        onClick={() => setIsRegister(true)}
                        className={`flex-1 py-2.5 text-sm font-bold z-10 relative transition-colors ${isRegister ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Register
                    </button>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    {error && (
                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 animate-shake">
                        <AlertTriangle size={14} /> {error}
                    </div>
                    )}
                    
                    {isRegister && (
                        <div className="group">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                                    <UserIcon size={18} />
                                </div>
                                <input 
                                    value={name} 
                                    onChange={e => setName(e.target.value)} 
                                    placeholder="Trader Name" 
                                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all group-hover:border-white/20"
                                    required 
                                />
                            </div>
                        </div>
                    )}

                    <div className="group">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                                <Mail size={18} />
                            </div>
                            <input 
                                type="email"
                                value={email} 
                                onChange={e => setEmail(e.target.value)} 
                                placeholder="Email Access" 
                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all group-hover:border-white/20"
                                required 
                            />
                        </div>
                    </div>

                    <div className="group">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                                <Lock size={18} />
                            </div>
                            <input 
                                type="password"
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                placeholder="Secure Token" 
                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all group-hover:border-white/20"
                                required 
                            />
                        </div>
                    </div>

                    <Button type="submit" variant="neon" className="w-full py-4 text-lg shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] active:scale-[0.98] font-display uppercase tracking-wider" disabled={loading}>
                        {loading ? (
                            <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Authenticating...</span>
                        ) : isRegister ? 'Initialize Terminal' : 'Access System'}
                    </Button>
                </form>
            </div>
        </div>
        
        <div className="text-center mt-8 flex flex-col gap-2 opacity-50 hover:opacity-80 transition-opacity">
             <div className="text-[10px] tracking-[0.2em] text-slate-400 uppercase">Secure Connection</div>
             <div className="flex justify-center gap-4 text-slate-500">
                 <Shield size={14} />
                 <Globe size={14} />
                 <Zap size={14} />
             </div>
        </div>
      </div>
    </div>
  );
};

const AnalyticsView: React.FC<{ trades: Trade[], accounts: Account[], selectedAccount: string }> = ({ trades, accounts, selectedAccount }) => {
    const [aiReview, setAiReview] = useState('');
    const [loadingReview, setLoadingReview] = useState(false);

    const filteredTrades = selectedAccount === 'all' 
        ? trades 
        : trades.filter(t => t.accountId === selectedAccount);
    
    const relevantAccounts = selectedAccount === 'all' ? accounts : accounts.filter(a => a.id === selectedAccount);
    const startingBalance = relevantAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalPnL = filteredTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const currentEquity = startingBalance + totalPnL;

    const winRate = (filteredTrades.filter(t => t.outcome === TradeOutcome.WIN).length / (filteredTrades.length || 1)) * 100;
    
    let peak = 0;
    let maxDD = 0;
    let runningEq = 0;
    [...filteredTrades].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).forEach(t => {
        runningEq += (t.pnl || 0);
        if (runningEq > peak) peak = runningEq;
        const dd = peak - runningEq;
        if (dd > maxDD) maxDD = dd;
    });

    const handleAiReview = async () => {
        setLoadingReview(true);
        const review = await generatePerformanceReview(filteredTrades);
        setAiReview(review);
        setLoadingReview(false);
    };

    const getCalendarDays = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth(); 
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay(); 

        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null); 
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const dayTrades = filteredTrades.filter(t => t.date.startsWith(dateStr));
            const dayPnL = dayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
            const count = dayTrades.length;
            days.push({ date: i, pnl: dayPnL, count });
        }
        return days;
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Analytics Center</h2>
                <Button onClick={handleAiReview} variant="neon" size="sm" disabled={loadingReview}>
                    {loadingReview ? <Sparkles className="animate-spin"/> : <BrainCircuit size={16} />} 
                    AI Audit
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white border-none">
                    <div className="text-blue-100 text-sm mb-1">Current Equity</div>
                    <div className="text-3xl font-bold tracking-tight">${currentEquity.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    <div className="text-xs text-blue-200 mt-2 flex items-center gap-1">
                        <Activity size={12} /> Includes open/closed PnL
                    </div>
                </Card>
                <Card>
                    <div className="text-slate-500 dark:text-slate-400 text-sm mb-1">Net PnL</div>
                    <div className={`text-3xl font-bold tracking-tight ${totalPnL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </div>
                    <div className="text-xs text-slate-400 mt-2">Selected range profit/loss</div>
                </Card>
                <Card>
                    <div className="text-slate-500 dark:text-slate-400 text-sm mb-1">Win Rate</div>
                    <div className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">{winRate.toFixed(1)}%</div>
                    <div className="text-xs text-slate-400 mt-2">{filteredTrades.length} trades total</div>
                </Card>
                <Card>
                    <div className="text-slate-500 dark:text-slate-400 text-sm mb-1">Max Drawdown</div>
                    <div className="text-3xl font-bold text-rose-500 tracking-tight">-${maxDD.toFixed(2)}</div>
                    <div className="text-xs text-slate-400 mt-2">Peak to trough decline</div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <EquitySimulator currentBalance={currentEquity} />
                </div>
                <Card className="lg:col-span-2 h-96 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-cyan-500"/> Equity Curve</h3>
                    <div className="flex-1 min-h-0">
                        <EquityCurve trades={filteredTrades} />
                    </div>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="h-80 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Win/Loss Ratio</h3>
                    <div className="flex-1 min-h-0">
                        <WinLossChart trades={filteredTrades} />
                    </div>
                </Card>
                 <Card className="h-80 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Pair Performance</h3>
                    <div className="flex-1 min-h-0">
                        <PairPerformanceChart trades={filteredTrades} />
                    </div>
                </Card>
                 <Card className="h-80 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Strategy Performance</h3>
                    <div className="flex-1 min-h-0">
                        <StrategyChart trades={filteredTrades} />
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                <Card className="h-full min-h-[400px]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2"><CalendarIcon size={18} className="text-purple-500"/> Monthly PnL</h3>
                        <span className="text-sm text-slate-500">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs text-slate-400 font-bold uppercase">
                        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                        {getCalendarDays().map((day, i) => (
                            <div 
                                key={i} 
                                className={`aspect-square rounded-lg border border-slate-200 dark:border-slate-700/50 flex flex-col items-center justify-center relative transition-all hover:scale-105 ${
                                    !day ? 'bg-transparent border-none' : 
                                    day.pnl > 0 ? 'bg-emerald-500/20 border-emerald-500/30' : 
                                    day.pnl < 0 ? 'bg-rose-500/20 border-rose-500/30' : 
                                    'bg-slate-100 dark:bg-slate-800'
                                }`}
                            >
                                {day && (
                                    <>
                                        <span className="absolute top-1 left-2 text-[10px] text-slate-400">{day.date}</span>
                                        {day.count > 0 && (
                                            <>
                                                <span className={`text-xs font-bold ${day.pnl > 0 ? 'text-emerald-600 dark:text-emerald-400' : day.pnl < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'}`}>
                                                    {day.pnl > 0 ? '+' : ''}{Math.round(day.pnl)}
                                                </span>
                                                <span className="text-[9px] text-slate-500">{day.count} trds</span>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {aiReview && (
                <div className="mt-8 animate-slide-up">
                    <div className="p-6 rounded-2xl glass-panel border border-cyan-500/30 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-blue-600" />
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Bot className="text-cyan-500" /> AI Performance Audit
                        </h3>
                        <div className="prose dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300">
                            <div dangerouslySetInnerHTML={{ __html: aiReview.replace(/\*\*(.*?)\*\*/g, '<strong class="text-cyan-600 dark:text-cyan-400">$1</strong>').replace(/\n/g, '<br/>') }} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const DisciplineView: React.FC<{ logs: DisciplineLog[], userId: string }> = ({ logs, userId }) => {
    const [todayLog, setTodayLog] = useState<DisciplineLog | null>(null);
    const [quote, setQuote] = useState('');
    
    const [localIntention, setLocalIntention] = useState('');
    const [localNotes, setLocalNotes] = useState('');
    const lastLoadedId = useRef<string>('');

    useEffect(() => {
        const quotes = [
            "The goal of a successful trader is to make the best trades. Money is secondary.",
            "Risk comes from not knowing what you are doing.",
            "It's not whether you're right or wrong, but how much money you make when you're right and how much you lose when you're wrong.",
            "Amateurs focus on how much they can make. Professionals focus on how much they can lose.",
            "Trade what you see, not what you think.",
            "The market can remain irrational longer than you can remain solvent.",
            "Confidence is not 'I will profit on this trade'. Confidence is 'I will be fine if I don't'.",
            "Discipline is doing what needs to be done, even if you don't want to do it.",
        ];
        setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, []);

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const existing = logs.find(l => l.date === today);
        if (existing) {
            setTodayLog(existing);
        } else {
             setTodayLog({
                id: `${userId}_${today}`, userId, date: today,
                followedPlan: false, noRevenge: false, calmEmotion: false, journaled: false,
                notes: '', mood: 50, intention: ''
            });
        }
    }, [logs, userId]);

    useEffect(() => {
        if (todayLog && todayLog.id !== lastLoadedId.current) {
            setLocalIntention(todayLog.intention || '');
            setLocalNotes(todayLog.notes || '');
            lastLoadedId.current = todayLog.id;
        }
    }, [todayLog]);

    const handleUpdate = async (updates: Partial<DisciplineLog>) => {
        if (!todayLog) return;
        const updated = { ...todayLog, ...updates };
        setTodayLog(updated);
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

    if (!todayLog) return <div>Loading...</div>;

    const getMoodLabel = (val: number) => {
        if (val < 20) return { label: "Fear / Tilt", icon: Frown, color: "text-rose-500" };
        if (val < 45) return { label: "Anxious", icon: Meh, color: "text-orange-500" };
        if (val < 65) return { label: "Neutral / Calm", icon: Smile, color: "text-cyan-500" };
        if (val < 85) return { label: "Confident", icon: Smile, color: "text-emerald-500" };
        return { label: "Greed / Overconfident", icon: Activity, color: "text-purple-500" };
    };

    const moodInfo = getMoodLabel(todayLog.mood || 50);

    const historyLogs = [...logs]
        .filter(l => l.date !== todayLog!.date)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <div className="flex justify-between items-end">
                <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Mindset & Discipline</h2>
                <div className="text-right hidden md:block">
                    <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">Current Streak</div>
                    <div className="text-3xl font-bold text-cyan-500">{logs.filter(l => l.followedPlan && l.noRevenge).length} Days</div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-500/20">
                         <div className="flex justify-between items-center mb-4">
                             <h3 className="font-bold text-white flex items-center gap-2"><RotateCcw className="text-cyan-500"/> Zen Mode</h3>
                             <Badge color="blue">Box Breathing</Badge>
                         </div>
                         <BreathingExercise />
                    </Card>

                    <Card className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <Zap className="text-amber-500" /> Daily Checklist
                            </h3>
                            <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500">{todayLog.date}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { key: 'followedPlan', label: 'Followed Trading Plan', icon: Target },
                                { key: 'noRevenge', label: 'No Revenge Trading', icon: Shield },
                                { key: 'calmEmotion', label: 'Maintained Calm State', icon: BrainCircuit },
                                { key: 'journaled', label: 'Journaled All Trades', icon: BookOpen },
                            ].map((item) => (
                                <div 
                                    key={item.key}
                                    // @ts-ignore
                                    onClick={() => handleUpdate({ [item.key]: !todayLog[item.key] })}
                                    // @ts-ignore
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${todayLog[item.key] ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-cyan-500/50'}`}
                                >
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                        // @ts-ignore
                                        todayLog[item.key] ? 'bg-cyan-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                                    }`}>
                                        <CheckSquare size={14} />
                                    </div>
                                    <span className={`font-medium ${
                                        // @ts-ignore
                                        todayLog[item.key] ? 'text-cyan-700 dark:text-cyan-300' : 'text-slate-600 dark:text-slate-400'
                                    }`}>{item.label}</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700/50">
                             <div>
                                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Daily Intention</label>
                                 <Input 
                                    value={localIntention} 
                                    onChange={e => setLocalIntention(e.target.value)} 
                                    onBlur={() => handleUpdate({ intention: localIntention })}
                                    placeholder="My goal for today is..." 
                                />
                            </div>
                             <div>
                                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">End of Day Reflection</label>
                                 <textarea 
                                    value={localNotes}
                                    onChange={e => setLocalNotes(e.target.value)}
                                    onBlur={() => handleUpdate({ notes: localNotes })}
                                    className="w-full bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500 h-24 resize-none"
                                    placeholder="How did you feel? What can you improve?"
                                />
                            </div>
                        </div>
                    </Card>
                </div>
                
                <div className="space-y-6">
                     <Card>
                        <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <Activity className="text-cyan-500" size={18}/> Emotional State
                        </h3>
                        <div className="text-center py-4">
                             <moodInfo.icon className={`w-12 h-12 mx-auto mb-2 ${moodInfo.color}`} />
                             <div className={`text-lg font-bold ${moodInfo.color}`}>{moodInfo.label}</div>
                             <div className="text-xs text-slate-500 mb-6">How are you feeling right now?</div>
                             
                             <input 
                                type="range" 
                                min="0" max="100" 
                                value={todayLog.mood || 50}
                                onChange={e => handleUpdate({ mood: parseInt(e.target.value) })}
                                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                             />
                             <div className="flex justify-between text-xs text-slate-400 mt-2 px-1">
                                 <span>Fear</span>
                                 <span>Neutral</span>
                                 <span>Greed</span>
                             </div>
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

                    <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white border-none relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 opacity-10"><Quote size={100} /></div>
                        <h3 className="font-bold text-indigo-300 text-xs uppercase tracking-wider mb-3">Daily Wisdom</h3>
                        <p className="font-display text-lg leading-relaxed italic">
                            "{quote}"
                        </p>
                    </Card>
                </div>
            </div>

            <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <Layers size={20} className="text-purple-500"/> Previous Days
                </h3>
                <div className="space-y-3">
                    {historyLogs.length === 0 ? (
                        <div className="text-center text-slate-500 py-8 bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                            No history logs yet. Keep showing up!
                        </div>
                    ) : (
                        historyLogs.map(log => {
                            const mood = getMoodLabel(log.mood || 50);
                            const score = [log.followedPlan, log.noRevenge, log.calmEmotion, log.journaled].filter(Boolean).length;
                            
                            return (
                                <Card key={log.id} className="flex flex-col md:flex-row gap-4 md:items-center justify-between p-4 hover:border-cyan-500/30 transition-colors">
                                    <div className="flex items-center gap-4 min-w-[150px]">
                                        <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-center min-w-[60px]">
                                            <div className="text-xs text-slate-500 uppercase font-bold">{new Date(log.date).toLocaleDateString('en-US', {weekday: 'short'})}</div>
                                            <div className="font-bold text-lg text-slate-800 dark:text-white">{new Date(log.date).getDate()}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-slate-500">{new Date(log.date).toLocaleDateString('en-US', {month: 'short', year: 'numeric'})}</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                {score === 4 ? <Badge color="green">Perfect Day</Badge> : <Badge color="gray">{score}/4 Rules</Badge>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded-lg">
                                            <div className="text-xs text-slate-400 uppercase font-bold mb-1">Intention</div>
                                            <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">{log.intention || "No intention set."}</p>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded-lg">
                                            <div className="text-xs text-slate-400 uppercase font-bold mb-1">Reflection</div>
                                            <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">{log.notes || "No reflection."}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center justify-center pl-4 border-l border-slate-200 dark:border-slate-700 min-w-[100px]">
                                        <mood.icon className={`w-6 h-6 mb-1 ${mood.color}`} />
                                        <span className={`text-xs font-bold ${mood.color}`}>{mood.label}</span>
                                        <span className="text-[10px] text-slate-400">{log.mood}%</span>
                                    </div>
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
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

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      setTheme('light');
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  useEffect(() => {
    const unsubscribe = subscribeToAuth((u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const unsubTrades = subscribeToTrades(user.uid, setTrades);
      const unsubAccounts = subscribeToAccounts(user.uid, setAccounts);
      const unsubDiscipline = subscribeToDiscipline(user.uid, setDisciplineLogs);
      initializeTodayLog(user.uid);
      
      getLiveMarketNews().then(setNews);

      return () => {
        unsubTrades();
        unsubAccounts();
        unsubDiscipline();
      };
    }
  }, [user]);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
  };

  const handleSaveTrade = async (trade: Trade) => {
    if (trade.id) {
       await updateTradeInDb(trade);
    } else {
       await addTradeToDb(trade, user!.uid);
    }
  };

  const handleDeleteTrade = async (id: string) => {
    if (window.confirm('Delete this trade?')) {
        await deleteTradeFromDb(id);
    }
  }
  
  const handleAddAccount = async () => {
      if (!newAccountName || !newAccountBalance) return;
      const account: Account = {
          id: Date.now().toString(),
          name: newAccountName,
          broker: newAccountBroker || 'Custom',
          balance: parseFloat(newAccountBalance),
          currency: 'USD',
          userId: user?.uid
      };
      await addAccountToDb(account, user!.uid);
      setNewAccountName('');
      setNewAccountBroker('');
      setNewAccountBalance('');
  };

  const handleDeleteAccount = async (id: string) => {
      if(window.confirm('Are you sure? This will delete the account.')) {
          await deleteAccountFromDb(id);
          if (selectedAccount === id) setSelectedAccount('all');
      }
  };

  // --- Updated NewsView within App ---
  const NewsView = () => (
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
                            {/* Glow Effect */}
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

  if (!user) {
    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <LoginScreen onLogin={() => {}} />
        </ThemeContext.Provider>
    );
  }

  const currentAccount = accounts[0] || { id: 'default', name: 'Default', balance: 0, currency: 'USD' };

  const JournalView = () => {
      const filteredTrades = selectedAccount === 'all' 
        ? trades 
        : trades.filter(t => t.accountId === selectedAccount);
      const sortedTrades = [...filteredTrades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const [magicInput, setMagicInput] = useState('');
      const [isParsing, setIsParsing] = useState(false);
      const [expandedTradeId, setExpandedTradeId] = useState<string | null>(null);

      // Stats Calculation
      const totalPnL = filteredTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
      const winCount = filteredTrades.filter(t => t.outcome === TradeOutcome.WIN).length;
      const winRate = filteredTrades.length > 0 ? (winCount / filteredTrades.length) * 100 : 0;
      const bestPair = Object.entries(filteredTrades.reduce((acc, t) => {
          acc[t.pair] = (acc[t.pair] || 0) + (t.pnl || 0);
          return acc;
      }, {} as Record<string, number>)).sort((a,b) => b[1] - a[1])[0];

      const handleMagicLog = async () => {
          if(!magicInput) return;
          setIsParsing(true);
          const data = await parseTradeFromNaturalLanguage(magicInput);
          setEditingTrade(data);
          setIsAddTradeOpen(true);
          setMagicInput('');
          setIsParsing(false);
      }

      const handleExportCSV = () => {
          const headers = ['Date', 'Pair', 'Direction', 'Outcome', 'PnL', 'Setup', 'Notes'];
          const rows = sortedTrades.map(t => [
              new Date(t.date).toLocaleDateString(),
              t.pair,
              t.direction,
              t.outcome,
              t.pnl,
              t.setup,
              `"${t.notes}"`
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

      return (
          <div className="space-y-6 animate-fade-in pb-20">
              {/* Journal Stats Bar */}
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
                      <div className="text-xs text-slate-500 uppercase font-bold">Best Pair</div>
                      <div className="text-xl font-bold text-slate-800 dark:text-white">{bestPair ? bestPair[0] : '--'}</div>
                  </div>
                  <div className="glass-panel p-4 rounded-xl border-l-4 border-l-blue-500">
                      <div className="text-xs text-slate-500 uppercase font-bold">Total Trades</div>
                      <div className="text-xl font-bold text-slate-800 dark:text-white">{filteredTrades.length}</div>
                  </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                  <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Trade Journal</h2>
                  <div className="flex gap-3">
                     <Button variant="secondary" onClick={handleExportCSV} size="sm">
                        <Download size={16} /> Export CSV
                     </Button>
                     <Button onClick={() => { setEditingTrade(undefined); setIsAddTradeOpen(true); }} variant="neon">
                        <Plus size={18} /> Log Trade
                     </Button>
                  </div>
              </div>

              {/* Magic Input Bar */}
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
                      className="w-full pl-10 pr-4 py-4 bg-white dark:bg-slate-900/60 border-2 border-transparent focus:border-cyan-500/50 rounded-2xl shadow-lg focus:outline-none text-lg transition-all placeholder-slate-400 dark:text-white backdrop-blur-xl"
                  />
                  <div className="absolute inset-y-0 right-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="ghost" onClick={handleMagicLog} disabled={!magicInput}>
                          <ArrowRight size={18}/>
                      </Button>
                  </div>
              </div>

              {/* List View Table */}
              <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
                  <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 text-xs font-bold uppercase text-slate-500 tracking-wider">
                      <div className="col-span-2">Date</div>
                      <div className="col-span-3">Pair / Strategy</div>
                      <div className="col-span-2 text-center">Outcome</div>
                      <div className="col-span-3 text-right">PnL / R</div>
                      <div className="col-span-2 text-right">Actions</div>
                  </div>
                  
                  {sortedTrades.length === 0 && (
                       <div className="text-center py-20 text-slate-500">No trades logged yet. Start your journey!</div>
                  )}

                  {sortedTrades.map(trade => (
                      <div key={trade.id} className="group border-b border-white/5 last:border-0 transition-colors hover:bg-white/5">
                          {/* Main Row */}
                          <div 
                            className="grid grid-cols-12 gap-4 p-4 items-center cursor-pointer"
                            onClick={() => setExpandedTradeId(expandedTradeId === trade.id ? null : trade.id)}
                          >
                              <div className="col-span-2 text-sm text-slate-400 font-mono">
                                  {new Date(trade.date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                                  <span className="block text-xs opacity-50">{new Date(trade.date).toLocaleTimeString(undefined, {hour:'2-digit', minute:'2-digit'})}</span>
                              </div>
                              
                              <div className="col-span-3">
                                  <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-white">
                                      {trade.pair}
                                      <span className={`text-[10px] px-1.5 rounded border ${trade.direction === TradeDirection.BUY ? 'border-emerald-500 text-emerald-500' : 'border-rose-500 text-rose-500'}`}>
                                          {trade.direction}
                                      </span>
                                  </div>
                                  {trade.setup && <div className="text-xs text-slate-500 mt-1">{trade.setup}</div>}
                              </div>

                              <div className="col-span-2 text-center">
                                  <Badge color={trade.outcome === TradeOutcome.WIN ? 'green' : trade.outcome === TradeOutcome.LOSS ? 'red' : 'gray'}>
                                      {trade.outcome}
                                  </Badge>
                              </div>

                              <div className="col-span-3 text-right">
                                  <div className={`font-mono font-bold text-lg ${trade.pnl && trade.pnl > 0 ? 'text-emerald-400' : trade.pnl && trade.pnl < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                                      {trade.pnl && trade.pnl > 0 ? '+' : ''}{trade.pnl ? `$${trade.pnl}` : '--'}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                      {trade.rMultiple ? `${trade.rMultiple}R` : ''}
                                      {trade.riskPercentage ? ` • ${trade.riskPercentage}%` : ''}
                                  </div>
                              </div>

                              <div className="col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditingTrade(trade); setIsAddTradeOpen(true); }}>
                                      <Edit2 size={14} />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteTrade(trade.id); }} className="text-rose-500 hover:text-rose-600">
                                      <Trash2 size={14} />
                                  </Button>
                                  <ChevronDown size={16} className={`text-slate-500 transition-transform duration-300 ${expandedTradeId === trade.id ? 'rotate-180' : ''}`} />
                              </div>
                          </div>

                          {/* Expanded Details */}
                          {expandedTradeId === trade.id && (
                              <div className="px-4 pb-6 pt-0 animate-slide-up bg-black/20">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 border-t border-white/10 pt-4">
                                      <div className="space-y-4">
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
                                              <div>
                                                   <div className="text-xs uppercase text-slate-500 font-bold mb-1">Session</div>
                                                   <div className="text-sm text-white">{trade.session}</div>
                                              </div>
                                          </div>
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

  const AICoachView = () => {
     const [input, setInput] = useState('');
     const [loading, setLoading] = useState(false);
     const scrollRef = useRef<HTMLDivElement>(null);
     const fileInputRef = useRef<HTMLInputElement>(null);
     const [attachedImage, setAttachedImage] = useState<string>('');

     const handleSend = async () => {
         if ((!input.trim() && !attachedImage) || loading) return;
         
         const userMsg: ChatMessage = {
             id: Date.now().toString(),
             role: 'user',
             text: input,
             image: attachedImage,
             timestamp: Date.now()
         };
         
         const newHistory = [...chatHistory, userMsg];
         setChatHistory(newHistory);
         setInput('');
         setAttachedImage('');
         setLoading(true);

         if (input.toLowerCase().includes('log this trade') || input.length > 100) {
             const parsed = await parseTradeFromNaturalLanguage(input);
             if (parsed && parsed.pair) {
                 setEditingTrade(parsed);
                 setIsAddTradeOpen(true);
                 const botMsg: ChatMessage = { id: (Date.now()+1).toString(), role: 'assistant', text: "I've opened the trade log form with the details I extracted. Please verify and save.", timestamp: Date.now() };
                 setChatHistory([...newHistory, botMsg]);
                 setLoading(false);
                 return;
             }
         }

         const response = await chatWithTradeCoach(newHistory, userMsg.text, userMsg.image);
         const botMsg: ChatMessage = {
             id: (Date.now()+1).toString(),
             role: 'assistant',
             text: response,
             timestamp: Date.now()
         };
         setChatHistory([...newHistory, botMsg]);
         setLoading(false);
     };

     useEffect(() => {
         if(scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
     }, [chatHistory]);

     return (
         <div className="flex flex-col h-[calc(100vh-2rem)] pb-20 md:pb-0">
             <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-4">AI Trading Coach</h2>
             <Card className="flex-1 flex flex-col overflow-hidden p-0 bg-slate-50/50 dark:bg-slate-900/50">
                 <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                     {chatHistory.length === 0 && (
                         <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                             <Bot size={64} className="mb-4"/>
                             <p>Ask me to analyze a setup, review your psychology, or log a trade.</p>
                         </div>
                     )}
                     {chatHistory.map(msg => (
                         <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                             <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none'}`}>
                                 {msg.image && <img src={msg.image} alt="Context" className="max-w-full rounded-lg mb-2 border border-white/20" />}
                                 <div className="whitespace-pre-wrap text-sm">{msg.text}</div>
                             </div>
                         </div>
                     ))}
                     {loading && (
                         <div className="flex justify-start">
                             <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-bl-none p-4 border border-slate-200 dark:border-slate-700 flex gap-2 items-center text-slate-500 text-sm">
                                 <Bot size={16} className="animate-pulse"/> Thinking...
                             </div>
                         </div>
                     )}
                 </div>
                 <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                     {attachedImage && (
                         <div className="mb-2 inline-block relative">
                             <img src={attachedImage} className="h-16 rounded border border-slate-300 dark:border-slate-600" alt="attachment"/>
                             <button onClick={() => setAttachedImage('')} className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-0.5"><X size={12}/></button>
                         </div>
                     )}
                     <div className="flex gap-2">
                         <button onClick={() => fileInputRef.current?.click()} className="p-3 text-slate-400 hover:text-cyan-500 transition-colors">
                             <ImageIcon size={20}/>
                             <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={(e) => {
                                 const file = e.target.files?.[0];
                                 if(file) {
                                     const reader = new FileReader();
                                     reader.onload = (ev) => setAttachedImage(ev.target?.result as string);
                                     reader.readAsDataURL(file);
                                 }
                             }}/>
                         </button>
                         <Input 
                            value={input} 
                            onChange={e => setInput(e.target.value)} 
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            placeholder="Describe a trade to log, or ask for advice..." 
                            className="flex-1"
                         />
                         <Button onClick={handleSend} variant="neon" disabled={loading} className="px-4"><Send size={20}/></Button>
                     </div>
                 </div>
             </Card>
         </div>
     );
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} transition-colors duration-300 font-sans selection:bg-cyan-500/30`}>
             <BackgroundBlobs />
             <Navigation activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
             <MobileFloatingNav activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
             
             <main className="md:pl-24 p-4 md:p-8 relative z-10 max-w-7xl mx-auto min-h-screen">
                 {/* Header with Account Switcher */}
                 <div className="flex justify-between items-center mb-6">
                      <div className="flex-1 md:hidden">
                           <Button variant="ghost" onClick={toggleTheme} className="rounded-full p-2 bg-white/10 backdrop-blur-md">
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
                 {activeTab === 'analytics' && <AnalyticsView trades={trades} accounts={accounts} selectedAccount={selectedAccount} />}
                 {activeTab === 'discipline' && <DisciplineView logs={disciplineLogs} userId={user.uid} />}
                 {activeTab === 'news' && <NewsView />}
                 {activeTab === 'ai-coach' && <AICoachView />}
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
                 )}
             </main>

             <AddTradeModal 
                isOpen={isAddTradeOpen} 
                onClose={() => setIsAddTradeOpen(false)}
                onSave={handleSaveTrade}
                accounts={accounts}
                currentAccountId={currentAccount.id}
                initialData={editingTrade}
             />
        </div>
    </ThemeContext.Provider>
  );
};

export default App;
