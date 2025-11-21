
import React, { useState, useEffect, useRef } from 'react';
import { Plus, BarChart2, BookOpen, Zap, LayoutGrid, Settings, Trash2, CheckCircle, XCircle, Menu, X, BrainCircuit, TrendingUp, LogOut, Newspaper, Layers, PieChart, ChevronUp, User as UserIcon, Camera, Upload, CheckSquare, ArrowRight, Image as ImageIcon, Calendar as CalendarIcon, Target, Activity, ChevronLeft, ChevronRight, Search, Shield, Bell, CreditCard, Sun, Moon, Maximize2, Globe, AlertTriangle, Send, Bot, Wand2, Sparkles, Battery, Flame, Edit2, Quote, Smile, Frown, Meh, Clock, Play, Pause, RotateCcw, Sliders, Lock, Mail, UserCheck, Wallet, Percent, DollarSign, Download, ChevronDown, Target as TargetIcon, Home, Check } from 'lucide-react';
import { Card, Button, Input, Select, Badge } from './components/UI';
import { EquityCurve, WinLossChart, PairPerformanceChart, DayOfWeekChart, StrategyChart } from './components/Charts';
import { analyzeTradePsychology, analyzeTradeScreenshot, generatePerformanceReview, getLiveMarketNews, chatWithTradeCoach, parseTradeFromNaturalLanguage } from './services/geminiService';
import { Trade, Account, DisciplineLog, CalendarEvent, TradeDirection, TradeOutcome, TradingSession, ChatMessage } from './types';
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

// New Toast Component for Welcome Message
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

const LoginScreen: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
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
        // Do NOT call onLogin() here, forcing them to log in manually
      } else {
        // Login Flow
        await loginUser(email, password);
        // onLogin will be handled by the auth state listener in App
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
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-600/30 rounded-full blur-3xl animate-pulse-slow animation-delay-2000" />
      
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
                    Sign In
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

const JournalView: React.FC<{
    trades: Trade[];
    accounts: Account[];
    onAdd: () => void;
    onEdit: (t: Trade) => void;
    onDelete: (id: string) => void;
}> = ({ trades, accounts, onAdd, onEdit, onDelete }) => {
    // Sort by date desc
    const sortedTrades = [...trades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Trade Journal</h2>
                    <p className="text-slate-500 dark:text-slate-400">Track your edge.</p>
                </div>
                <Button variant="neon" onClick={onAdd}>
                    <Plus size={20} /> <span className="hidden md:inline">Log Trade</span>
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {sortedTrades.map(trade => {
                    const account = accounts.find(a => a.id === trade.accountId);
                    return (
                        <Card key={trade.id} className="flex flex-col md:flex-row gap-4 hover:border-cyan-500/30 transition-all group" onClick={() => onEdit(trade)}>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <Badge color={trade.direction === TradeDirection.BUY ? 'green' : 'red'}>{trade.direction}</Badge>
                                        <span className="font-bold text-lg text-slate-800 dark:text-white">{trade.pair}</span>
                                        <span className="text-xs text-slate-500">{new Date(trade.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge color={
                                            trade.outcome === TradeOutcome.WIN ? 'green' :
                                            trade.outcome === TradeOutcome.LOSS ? 'red' :
                                            trade.outcome === TradeOutcome.BREAKEVEN ? 'gray' : 'yellow'
                                        }>{trade.outcome}</Badge>
                                        <button onClick={(e) => { e.stopPropagation(); onDelete(trade.id); }} className="p-2 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300">
                                    <div className="flex items-center gap-1"><DollarSign size={14} className="text-cyan-500"/> {trade.pnl ? `$${trade.pnl}` : '--'}</div>
                                    <div className="flex items-center gap-1"><TargetIcon size={14} className="text-purple-500"/> {trade.rMultiple ? `${trade.rMultiple}R` : '--'}</div>
                                    <div className="flex items-center gap-1"><Wallet size={14} className="text-blue-500"/> {account?.name || 'Unknown'}</div>
                                </div>
                            </div>
                        </Card>
                    );
                })}
                {trades.length === 0 && (
                    <div className="text-center py-20 text-slate-500">
                        <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No trades logged yet. Start your journey.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const AnalyticsView: React.FC<{ trades: Trade[], accounts: Account[], selectedAccount: string }> = ({ trades, accounts, selectedAccount }) => {
    const filteredTrades = selectedAccount === 'all' ? trades : trades.filter(t => t.accountId === selectedAccount);
    
    const totalPnL = filteredTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
    const winRate = filteredTrades.length > 0 
        ? (filteredTrades.filter(t => t.outcome === TradeOutcome.WIN).length / filteredTrades.filter(t => t.outcome !== TradeOutcome.PENDING).length * 100) 
        : 0;

    return (
        <div className="space-y-6 animate-fade-in pb-20">
             <h2 className="text-3xl font-display font-bold">Analytics</h2>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
                     <div className="text-slate-500 text-sm mb-1">Net PnL</div>
                     <div className={`text-3xl font-bold ${totalPnL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>${totalPnL.toFixed(2)}</div>
                 </Card>
                 <Card>
                     <div className="text-slate-500 text-sm mb-1">Win Rate</div>
                     <div className="text-3xl font-bold text-slate-800 dark:text-white">{winRate.toFixed(1)}%</div>
                 </Card>
                 <Card>
                     <div className="text-slate-500 text-sm mb-1">Total Trades</div>
                     <div className="text-3xl font-bold text-slate-800 dark:text-white">{filteredTrades.length}</div>
                 </Card>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Card className="min-h-[300px]">
                     <h3 className="font-bold mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-cyan-500"/> Equity Curve</h3>
                     <EquityCurve trades={filteredTrades} />
                 </Card>
                 <Card className="min-h-[300px]">
                     <h3 className="font-bold mb-4 flex items-center gap-2"><PieChart size={18} className="text-purple-500"/> Win/Loss Ratio</h3>
                     <WinLossChart trades={filteredTrades} />
                 </Card>
                 <Card className="min-h-[300px]">
                     <h3 className="font-bold mb-4">Performance by Pair</h3>
                     <PairPerformanceChart trades={filteredTrades} />
                 </Card>
                 <Card className="min-h-[300px]">
                     <h3 className="font-bold mb-4">Strategy Performance</h3>
                     <StrategyChart trades={filteredTrades} />
                 </Card>
             </div>
        </div>
    );
};

const DisciplineView: React.FC<{ logs: DisciplineLog[], userId: string }> = ({ logs, userId }) => {
    const today = new Date().toISOString().split('T')[0];
    const todayLog = logs.find(l => l.date === today);
    
    const handleCheck = async (field: keyof DisciplineLog) => {
        if (!todayLog) return;
        await updateDisciplineLog({ ...todayLog, [field]: !todayLog[field] }, userId);
    };

    useEffect(() => {
        initializeTodayLog(userId);
    }, [userId]);

    return (
        <div className="space-y-6 animate-fade-in pb-20">
             <div className="flex justify-between items-center">
                <h2 className="text-3xl font-display font-bold">Mindset & Discipline</h2>
                <BreathingExercise />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Card className="relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-3 opacity-10"><Zap size={100} /></div>
                     <h3 className="font-bold text-xl mb-4">Daily Commitment</h3>
                     <div className="space-y-3">
                         {[
                             { id: 'followedPlan', label: 'Followed Trading Plan' },
                             { id: 'noRevenge', label: 'No Revenge Trading' },
                             { id: 'calmEmotion', label: 'Maintained Emotional Balance' },
                             { id: 'journaled', label: 'Journaled All Trades' },
                         ].map((item) => (
                             <div key={item.id} 
                                onClick={() => handleCheck(item.id as keyof DisciplineLog)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                                    // @ts-ignore
                                    todayLog?.[item.id] 
                                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                                    : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 text-slate-400'
                                }`}
                             >
                                 <span className="font-semibold">{item.label}</span>
                                 {/* @ts-ignore */}
                                 {todayLog?.[item.id] ? <CheckCircle className="text-emerald-500"/> : <div className="w-6 h-6 rounded-full border-2 border-slate-600" />}
                             </div>
                         ))}
                     </div>
                 </Card>
                 
                 <Card>
                     <h3 className="font-bold text-xl mb-4">Streak</h3>
                     <div className="flex items-center gap-2">
                         {logs.slice(-7).map(log => {
                             const score = [log.followedPlan, log.noRevenge, log.calmEmotion, log.journaled].filter(Boolean).length;
                             return (
                                 <div key={log.id} className="flex-1 flex flex-col items-center gap-2">
                                     <div className={`w-full aspect-square rounded-lg ${
                                         score === 4 ? 'bg-emerald-500' : 
                                         score === 3 ? 'bg-emerald-500/50' :
                                         score > 0 ? 'bg-emerald-500/20' : 'bg-slate-800'
                                     }`} />
                                     <span className="text-xs text-slate-500">{new Date(log.date).getDate()}</span>
                                 </div>
                             )
                         })}
                     </div>
                 </Card>
             </div>
        </div>
    );
};

const NewsView: React.FC<{ news: { sentiment: string, events: CalendarEvent[] } }> = ({ news }) => {
    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <h2 className="text-3xl font-display font-bold">Market Intelligence</h2>
            
            <Card className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-indigo-500/30">
                <h3 className="font-bold text-lg text-indigo-300 mb-2 flex items-center gap-2"><Sparkles size={18}/> AI Market Sentiment</h3>
                <div className="text-slate-200 leading-relaxed whitespace-pre-line">
                    {news.sentiment || "Analyzing market conditions..."}
                </div>
            </Card>

            <MarketSessionClocks />

            <h3 className="font-bold text-xl mt-8 mb-4">High Impact Events (This Week)</h3>
            <div className="space-y-3">
                {news.events.length > 0 ? news.events.map((event, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-12 text-center">
                                <div className="text-xs text-slate-500">{event.time.split(' ')[0]}</div>
                                <div className="font-bold text-slate-200">{event.time.split(' ').slice(1).join(' ')}</div>
                            </div>
                            <Badge color="red">{event.currency}</Badge>
                            <div>
                                <div className="font-bold text-slate-200">{event.event}</div>
                                <div className="text-xs text-slate-500">Forecast: {event.forecast} • Prev: {event.previous}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`font-mono font-bold ${event.isBetter ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {event.actual || '--'}
                            </div>
                            <div className="text-xs text-slate-500">Actual</div>
                        </div>
                    </div>
                )) : (
                    <div className="text-center p-8 text-slate-500">Loading calendar data...</div>
                )}
            </div>
        </div>
    );
};

const AICoachView: React.FC<{ 
    chatHistory: ChatMessage[]; 
    onSend: (msg: string, img?: string) => Promise<void>;
    isTyping: boolean;
}> = ({ chatHistory, onSend, isTyping }) => {
    const [input, setInput] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const handleSend = () => {
        if (!input.trim()) return;
        onSend(input);
        setInput('');
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col animate-fade-in">
             <h2 className="text-3xl font-display font-bold mb-4">AI Trading Coach</h2>
             <Card className="flex-1 flex flex-col overflow-hidden p-0 bg-slate-900/80 backdrop-blur-xl border-slate-800">
                 <div className="flex-1 overflow-y-auto p-4 space-y-4">
                     {chatHistory.length === 0 && (
                         <div className="text-center py-20 opacity-50">
                             <Bot size={64} className="mx-auto mb-4 text-cyan-500" />
                             <p>Ask me about your trades, psychology, or market analysis.</p>
                         </div>
                     )}
                     {chatHistory.map(msg => (
                         <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                             <div className={`max-w-[80%] p-4 rounded-2xl ${
                                 msg.role === 'user' 
                                 ? 'bg-cyan-600 text-white rounded-tr-none' 
                                 : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                             }`}>
                                 <div className="whitespace-pre-wrap">{msg.text}</div>
                             </div>
                         </div>
                     ))}
                     {isTyping && (
                         <div className="flex justify-start">
                             <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-700 flex gap-2">
                                 <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
                                 <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-75" />
                                 <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150" />
                             </div>
                         </div>
                     )}
                     <div ref={bottomRef} />
                 </div>
                 <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                     <div className="flex gap-2">
                         <Input 
                            value={input} 
                            onChange={e => setInput(e.target.value)} 
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            placeholder="Ask your coach..." 
                            className="flex-1"
                         />
                         <Button onClick={handleSend} variant="neon" disabled={!input.trim() || isTyping}>
                             <Send size={20} />
                         </Button>
                     </div>
                 </div>
             </Card>
        </div>
    );
};

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
  const [isTyping, setIsTyping] = useState(false);
  
  const [isAddTradeOpen, setIsAddTradeOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Partial<Trade> | undefined>(undefined);
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountBroker, setNewAccountBroker] = useState('');
  const [newAccountBalance, setNewAccountBalance] = useState('');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

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
          // User just logged in
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
    setEditingTrade(undefined);
    setIsAddTradeOpen(false);
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

  const handleSendChat = async (text: string, image?: string) => {
      const newUserMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text, timestamp: Date.now(), image };
      setChatHistory(prev => [...prev, newUserMsg]);
      setIsTyping(true);
      
      const response = await chatWithTradeCoach(chatHistory, text, image);
      
      const newAiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', text: response, timestamp: Date.now() };
      setChatHistory(prev => [...prev, newAiMsg]);
      setIsTyping(false);
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
             <WelcomeToast username={user.displayName || 'Trader'} visible={showWelcome} />
             <Navigation activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
             <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
             
             <main className="md:pl-24 p-4 md:p-8 relative z-10 max-w-7xl mx-auto min-h-screen pb-24">
                 <div className="flex justify-between items-center mb-6">
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

                 {activeTab === 'journal' && <JournalView 
                    trades={trades} 
                    accounts={accounts} 
                    onAdd={() => { setEditingTrade(undefined); setIsAddTradeOpen(true); }}
                    onEdit={(t) => { setEditingTrade(t); setIsAddTradeOpen(true); }}
                    onDelete={handleDeleteTrade}
                 />}
                 {activeTab === 'analytics' && <AnalyticsView trades={trades} accounts={accounts} selectedAccount={selectedAccount} />}
                 {activeTab === 'discipline' && <DisciplineView logs={disciplineLogs} userId={user.uid} />}
                 {activeTab === 'news' && <NewsView news={news} />}
                 {activeTab === 'ai-coach' && <AICoachView chatHistory={chatHistory} onSend={handleSendChat} isTyping={isTyping} />}
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
