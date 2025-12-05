
import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { Plus, BarChart2, BookOpen, Zap, LayoutGrid, Settings, Trash2, CheckCircle, XCircle, Menu, X, BrainCircuit, TrendingUp, LogOut, Newspaper, Layers, PieChart, ChevronUp, User as UserIcon, Camera, Upload, CheckSquare, ArrowRight, Image as ImageIcon, Calendar as CalendarIcon, Target, Activity, ChevronLeft, ChevronRight, Search, Shield, Bell, CreditCard, Sun, Moon, Maximize2, Globe, AlertTriangle, Send, Bot, Wand2, Sparkles, Battery, Flame, Edit2, Quote, Smile, Frown, Meh, Clock, Play, Pause, RotateCcw, Sliders, Lock, Mail, UserCheck, Wallet, Percent, DollarSign, Download, ChevronDown, Target as TargetIcon, Home, Check, Terminal, Copy, Monitor, Wifi, CloudLightning, Laptop, Hourglass, Scale, Filter, Info, Eye, Briefcase, FileText, AlertOctagon, Timer, Radio, ArrowUpRight, BookMarked, Calculator, PenTool, Lightbulb, Thermometer, Paperclip, Users, Heart, MessageCircle, Share2, Award, Trophy, Hash, ThumbsUp, ThumbsDown, Zap as ZapIcon, Loader2 } from 'lucide-react';
import { Card, Button, Input, Select, Badge } from './components/UI';
import { EquityCurve, WinLossChart, PairPerformanceChart, DayOfWeekChart, StrategyChart, HourlyPerformanceChart, LongShortChart, TradeCalendar } from './components/Charts';
import { analyzeTradePsychology, analyzeTradeScreenshot, generatePerformanceReview, getLiveMarketNews, chatWithTradeCoach, parseTradeFromNaturalLanguage, generateTradingStrategy, critiqueTradingStrategy, analyzeDeepPsychology } from './services/geminiService';
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
    <div className={`relative flex items-center justify-center ${className}`}>
        {/* Abstract Infinity Chart Logo - Geometric & Sexy */}
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
            <path d="M24 4L42 14V34L24 44L6 34V14L24 4Z" stroke="url(#logo_grad)" strokeWidth="2" fill="rgba(6,182,212,0.05)"/>
            <path d="M16 24L22 30L32 18" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="32" cy="18" r="3" fill="#22d3ee" className="animate-pulse"/>
            <defs>
                <linearGradient id="logo_grad" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#22d3ee" />
                    <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
            </defs>
        </svg>
    </div>
);

const BackgroundBlobs = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none opacity-100 transition-opacity duration-500">
    <div className="absolute top-0 left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] animate-blob mix-blend-screen" />
    <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-screen" />
    <div className="absolute bottom-[-10%] left-[20%] w-[700px] h-[700px] bg-purple-600/10 rounded-full blur-[130px] animate-blob animation-delay-4000 mix-blend-screen" />
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
  </div>
);

const Navigation: React.FC<{ activeTab: string; setActiveTab: (t: string) => void; onLogout: () => void }> = ({ activeTab, setActiveTab, onLogout }) => {
  const navItems = [
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'playbook', label: 'Playbook', icon: BookMarked },
    { id: 'community', label: 'The Pit', icon: Users },
    { id: 'discipline', label: 'Mindset', icon: Zap },
    { id: 'news', label: 'Red Folder', icon: Flame },
    { id: 'ai-coach', label: 'AI Coach', icon: Bot },
  ];

  return (
    <aside className="hidden md:flex flex-col w-20 hover:w-64 h-screen fixed left-0 top-0 glass-panel border-r border-white/5 z-50 transition-all duration-300 group overflow-hidden bg-[#05070A]/95 backdrop-blur-2xl">
      <div className="p-5 flex items-center gap-4 border-b border-white/5 h-20">
        <div className="w-10 h-10 flex items-center justify-center shrink-0">
            <AppLogo className="w-10 h-10" />
        </div>
        <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <h1 className="text-xl font-display font-bold text-white whitespace-nowrap tracking-tight">
            TradeFlow
            </h1>
            <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase">Pro Terminal</span>
        </div>
      </div>
      
      <nav className="flex-1 px-3 space-y-2 mt-8">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 pl-4 py-3 rounded-xl transition-all duration-200 whitespace-nowrap overflow-hidden group/btn relative ${
              activeTab === item.id 
                ? 'text-cyan-400 bg-cyan-500/5 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                : 'text-slate-500 hover:bg-white/5 hover:text-white'
            }`}
          >
            {activeTab === item.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-500 rounded-r-full shadow-[0_0_10px_cyan]"></div>}
            <item.icon size={20} className={`shrink-0 transition-transform group-hover/btn:scale-110 ${activeTab === item.id ? 'text-cyan-400' : ''}`} />
            <span className="font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-white/5 space-y-2 bg-gradient-to-t from-black/50 to-transparent">
         <button 
            onClick={() => setActiveTab('profile')} 
            className={`w-full flex items-center gap-4 pl-4 py-3 rounded-xl transition-all whitespace-nowrap ${activeTab === 'profile' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
         >
             <UserIcon size={20} className="shrink-0" />
             <span className="font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">Profile</span>
         </button>
        <button onClick={onLogout} className="w-full flex items-center gap-4 pl-4 py-3 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all whitespace-nowrap">
           <LogOut size={20} className="shrink-0" />
           <span className="font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">Logout</span>
        </button>
      </div>
    </aside>
  );
};

const MobileBottomNav: React.FC<{ activeTab: string; setActiveTab: (t: string) => void }> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'journal', icon: Home },
    { id: 'community', icon: Users },
    { id: 'playbook', icon: BookMarked },
    { id: 'profile', icon: UserIcon },
    { id: 'discipline', icon: Zap },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[80px] bg-[#05070A]/95 backdrop-blur-xl border-t border-white/10 flex items-center justify-around z-50 px-2 pb-safe">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`relative flex flex-col items-center justify-center w-16 h-full transition-all duration-300 ${
              isActive ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <div className={`relative transition-transform duration-300 ${isActive ? '-translate-y-2 scale-110' : ''}`}>
                <item.icon 
                    size={isActive ? 24 : 22} 
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`${isActive ? 'drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : ''}`}
                />
                {isActive && (
                    <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1 h-1 bg-cyan-400 rounded-full animate-fade-in shadow-[0_0_5px_cyan]" />
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
        <div className="h-full flex flex-col items-center justify-center py-6 relative overflow-hidden bg-black/40 rounded-2xl border border-white/5">
            <div className={`relative w-32 h-32 flex items-center justify-center rounded-full transition-all duration-[4000ms] ease-in-out ${
                !active ? 'scale-100 bg-slate-800' :
                phase === 'Inhale' ? 'scale-125 bg-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.4)]' :
                phase === 'Exhale' ? 'scale-90 bg-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.2)]' :
                'scale-110 bg-white/10 border border-white/20'
            }`}>
                <div className="text-center z-10">
                    <div className={`text-sm font-bold ${active ? 'text-white' : 'text-slate-400'}`}>
                        {active ? phase : "Start"}
                    </div>
                    {active && (
                        <div className="text-2xl font-mono mt-1 font-bold text-cyan-400">
                            {timer}
                        </div>
                    )}
                </div>
            </div>
            
            <div className="mt-6 w-full px-12">
                <Button 
                    variant={active ? 'danger' : 'secondary'} 
                    onClick={() => { setActive(!active); setTimer(4); setPhase('Inhale'); }}
                    className="w-full text-xs"
                    size="sm"
                >
                    {active ? <><Pause size={12} /> Stop</> : <><Play size={12} /> Start Breathing</>}
                </Button>
            </div>
        </div>
    );
};

const WelcomeToast: React.FC<{ username: string; visible: boolean }> = ({ username, visible }) => {
    if (!visible) return null;
    return <div className="fixed top-24 right-4 bg-emerald-500/90 text-white p-4 rounded-xl shadow-xl z-[100] animate-fade-in backdrop-blur-md">Welcome back, {username}!</div>;
};

const LoginScreen: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState('');
    
    const handleAuth = async () => {
        try {
            if(isRegister) await registerUser(email, pass, username);
            else await loginUser(email, pass);
        } catch(e: any) { alert(e.message || e); }
    }
    
    return (
        <div className="relative h-screen w-full flex items-center justify-center bg-[#030305] overflow-hidden font-sans selection:bg-cyan-500/30">
            {/* --- IMMERSIVE BACKGROUND (Kept the cool visuals) --- */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-purple-600/10 rounded-full blur-[120px] animate-blob mix-blend-screen pointer-events-none"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-cyan-600/10 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-screen pointer-events-none"></div>
                {/* Cyber Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
            </div>
            
            {/* --- CLEAN PROFESSIONAL CARD --- */}
            <div className="relative z-10 w-full max-w-[400px] p-6">
                <div className="bg-[#05070A]/80 backdrop-blur-2xl rounded-3xl border border-white/5 shadow-2xl p-8 flex flex-col items-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50 pointer-events-none"></div>
                    
                    {/* Logo Area */}
                    <div className="mb-8 flex flex-col items-center z-10">
                         <AppLogo className="w-20 h-20 mb-6" />
                         <h1 className="text-3xl font-display font-bold text-white tracking-tight">
                             TradeFlow
                         </h1>
                         <div className="flex items-center gap-2 mt-2">
                             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                             <p className="text-xs text-slate-400 font-mono tracking-widest uppercase">System Online</p>
                         </div>
                    </div>

                    {/* Form - Clean Labels */}
                    <div className="w-full space-y-4 z-10">
                        {isRegister && (
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-400 ml-1">Username</label>
                                <Input 
                                    placeholder="trader123" 
                                    value={username} 
                                    onChange={e => setUsername(e.target.value)}
                                    className="bg-black/40 border-white/10 text-white placeholder:text-slate-600 focus:border-cyan-500/50"
                                />
                            </div>
                        )}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-400 ml-1">Email Address</label>
                            <Input 
                                placeholder="name@example.com" 
                                value={email} 
                                onChange={e => setEmail(e.target.value)}
                                className="bg-black/40 border-white/10 text-white placeholder:text-slate-600 focus:border-cyan-500/50"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-400 ml-1">Password</label>
                            <Input 
                                type="password" 
                                placeholder="••••••••" 
                                value={pass} 
                                onChange={e => setPass(e.target.value)}
                                className="bg-black/40 border-white/10 text-white placeholder:text-slate-600 focus:border-cyan-500/50"
                            />
                        </div>

                        <Button variant="neon" className="w-full py-3 mt-4 text-sm font-bold tracking-wide" onClick={handleAuth}>
                            {isRegister ? 'INITIALIZE ACCOUNT' : 'AUTHENTICATE'}
                        </Button>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 flex items-center justify-between w-full text-xs text-slate-500 z-10">
                        <button onClick={() => setIsRegister(!isRegister)} className="hover:text-cyan-400 transition-colors">
                            {isRegister ? 'Return to Login' : 'Request Access'}
                        </button>
                        <button className="hover:text-cyan-400 transition-colors">
                            Recovery Protocol
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ... [Keep AddTradeModal, TradeDetailsModal, ConnectBrokerModal as is but update styles slightly if needed] ...
const AddTradeModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (t: Partial<Trade>) => void; accounts: Account[]; currentAccountId: string; initialData?: Partial<Trade> }> = ({ isOpen, onClose, onSave, accounts, currentAccountId, initialData }) => {
    const [formData, setFormData] = useState<Partial<Trade>>({
        pair: '', direction: TradeDirection.BUY, outcome: TradeOutcome.PENDING, 
        pnl: 0, notes: '', session: TradingSession.NY, setup: '', riskPercentage: 1, 
        date: new Date().toISOString().split('T')[0], tags: [], ...initialData
    });
    const [screenshotPreview, setScreenshotPreview] = useState(initialData?.screenshot || '');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { 
        setFormData({ 
            pair: '', direction: TradeDirection.BUY, outcome: TradeOutcome.PENDING, 
            pnl: 0, notes: '', session: TradingSession.NY, setup: '', riskPercentage: 1, 
            date: new Date().toISOString().split('T')[0], tags: [], ...initialData 
        }); 
        setScreenshotPreview(initialData?.screenshot || ''); 
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleScreenshot = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setScreenshotPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const runVisionAnalysis = async () => {
        if (!screenshotPreview) return;
        setIsAnalyzing(true);
        const analysis = await analyzeTradeScreenshot(screenshotPreview, formData.pair || 'Asset');
        setFormData(prev => ({ ...prev, notes: (prev.notes || '') + '\n\n[AI Vision]: ' + analysis }));
        setIsAnalyzing(false);
    };

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!formData.tags?.includes(tagInput.trim())) {
                setFormData(prev => ({...prev, tags: [...(prev.tags || []), tagInput.trim()]}));
            }
            setTagInput('');
        }
    }

    const handleSaveClick = async () => {
        setIsSaving(true);
        await onSave({ ...formData, screenshot: screenshotPreview, accountId: currentAccountId });
        setIsSaving(false);
    }

    return (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0B0F19] border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col md:flex-row animate-slide-up">
                {/* Inputs */}
                <div className="p-8 flex-1 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-display font-bold text-white">Log Trade</h2>
                        <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={24}/></button>
                    </div>
                    {/* ... (Existing inputs) ... */}
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="text-xs text-slate-400 mb-1 block">Pair</label>
                            <Input placeholder="EURUSD" value={formData.pair} onChange={e => setFormData({...formData, pair: e.target.value.toUpperCase()})} />
                         </div>
                         <div>
                            <label className="text-xs text-slate-400 mb-1 block">Date</label>
                            <Input type="date" value={typeof formData.date === 'string' ? formData.date.split('T')[0] : ''} onChange={e => setFormData({...formData, date: e.target.value})} />
                         </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                         <div>
                            <label className="text-xs text-slate-400 mb-1 block">Direction</label>
                             <div className="flex bg-slate-800 rounded-xl p-1">
                                 <button onClick={() => setFormData({...formData, direction: TradeDirection.BUY})} className={`flex-1 py-2 rounded-lg text-sm font-bold ${formData.direction === TradeDirection.BUY ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'}`}>BUY</button>
                                 <button onClick={() => setFormData({...formData, direction: TradeDirection.SELL})} className={`flex-1 py-2 rounded-lg text-sm font-bold ${formData.direction === TradeDirection.SELL ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'}`}>SELL</button>
                             </div>
                         </div>
                         <div className="col-span-2">
                             <label className="text-xs text-slate-400 mb-1 block">Outcome & PnL</label>
                             <div className="flex gap-2">
                                 <Select value={formData.outcome} onChange={e => setFormData({...formData, outcome: e.target.value as any})} className="flex-1">
                                     <option value={TradeOutcome.PENDING}>Pending</option>
                                     <option value={TradeOutcome.WIN}>Win</option>
                                     <option value={TradeOutcome.LOSS}>Loss</option>
                                     <option value={TradeOutcome.BREAKEVEN}>BE</option>
                                 </Select>
                                 <Input type="number" placeholder="PnL" value={formData.pnl} onChange={e => setFormData({...formData, pnl: Number(e.target.value)})} className="flex-1" />
                             </div>
                         </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                         <div>
                            <label className="text-xs text-slate-400 mb-1 block">Session</label>
                            <Select value={formData.session} onChange={e => setFormData({...formData, session: e.target.value as any})}>
                                <option value={TradingSession.ASIA}>Asia</option>
                                <option value={TradingSession.LONDON}>London</option>
                                <option value={TradingSession.NY}>New York</option>
                            </Select>
                         </div>
                         <div>
                            <label className="text-xs text-slate-400 mb-1 block">Risk %</label>
                            <Input type="number" step="0.1" placeholder="1.0" value={formData.riskPercentage} onChange={e => setFormData({...formData, riskPercentage: Number(e.target.value)})} />
                         </div>
                         <div>
                            <label className="text-xs text-slate-400 mb-1 block">R-Multiple</label>
                            <Input type="number" step="0.1" placeholder="2.5" value={formData.rMultiple} onChange={e => setFormData({...formData, rMultiple: Number(e.target.value)})} />
                         </div>
                    </div>

                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">Tags (Press Enter)</label>
                        <div className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2 flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-cyan-500/20">
                            {formData.tags?.map(tag => (
                                <Badge key={tag} color="gray">{tag} <button onClick={() => setFormData(prev => ({...prev, tags: prev.tags?.filter(t => t !== tag)}))} className="ml-1 hover:text-white">&times;</button></Badge>
                            ))}
                            <input 
                                className="bg-transparent border-none outline-none text-sm text-white flex-1 min-w-[100px]" 
                                placeholder="Add tag..." 
                                value={tagInput}
                                onChange={e => setTagInput(e.target.value)}
                                onKeyDown={handleAddTag}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">Notes & Analysis</label>
                        <textarea 
                            className="w-full h-24 bg-slate-900 border border-white/10 rounded-xl p-4 text-white resize-none focus:ring-1 focus:ring-cyan-500 outline-none" 
                            placeholder="Why did you take this trade?"
                            value={formData.notes}
                            onChange={e => setFormData({...formData, notes: e.target.value})}
                        />
                    </div>

                    <Button variant="neon" className="w-full" onClick={handleSaveClick} disabled={isSaving}>
                        {isSaving ? <><Loader2 className="animate-spin" size={18}/> Saving Trade...</> : 'Save to Journal'}
                    </Button>
                </div>
                {/* Media */}
                 <div className="p-8 bg-slate-900/50 border-l border-white/5 w-full md:w-[350px] space-y-6">
                     <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Evidence</h3>
                     
                     <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                         {screenshotPreview ? (
                             <img src={screenshotPreview} alt="Chart" className="w-full h-48 object-cover rounded-xl border border-white/10" />
                         ) : (
                             <div className="w-full h-48 bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 gap-2 hover:bg-slate-800 hover:border-cyan-500 transition-colors">
                                 <Camera size={24} />
                                 <span className="text-xs">Upload Screenshot</span>
                             </div>
                         )}
                         <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleScreenshot} />
                         {screenshotPreview && <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity rounded-xl">Change Image</div>}
                     </div>

                     {screenshotPreview && (
                         <Button variant="secondary" size="sm" className="w-full" onClick={runVisionAnalysis} disabled={isAnalyzing}>
                             {isAnalyzing ? <><Sparkles className="animate-spin" size={14}/> Scanning...</> : <><Eye size={14}/> AI Scan Chart</>}
                         </Button>
                     )}
                     
                     <div className="bg-indigo-900/10 p-4 rounded-xl border border-indigo-500/10">
                         <h4 className="text-xs font-bold text-indigo-400 mb-2 flex items-center gap-2"><Lightbulb size={12}/> Pro Tip</h4>
                         <p className="text-xs text-slate-400">Upload a chart image to let Gemini automatically analyze the market structure.</p>
                     </div>
                </div>
            </div>
        </div>
    );
};

const TradeDetailsModal: React.FC<{ trade: Trade | null; onClose: () => void; onDelete: (id: string) => void; onEdit: (t: Trade) => void }> = ({ trade, onClose, onDelete, onEdit }) => {
    if (!trade) return null;
    const isWin = trade.outcome === TradeOutcome.WIN;
    return (
         <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
             <div className="bg-[#0B0F19] w-full max-w-5xl h-[85vh] rounded-3xl border border-white/10 flex overflow-hidden shadow-2xl relative animate-fade-in">
                 <button onClick={onClose} className="absolute top-4 right-4 z-50 bg-black/50 p-2 rounded-full hover:bg-white/10 text-white"><X size={20}/></button>
                 <div className="w-2/3 bg-black/50 relative flex items-center justify-center bg-grid-pattern">
                     {trade.screenshot ? <img src={trade.screenshot} className="w-full h-full object-contain" /> : <div className="text-slate-600 flex flex-col items-center gap-4"><ImageIcon size={48} opacity={0.5}/><span>No Screenshot Evidence</span></div>}
                     <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
                         <h2 className="text-3xl font-display font-bold text-white">{trade.pair}</h2>
                         <div className={`text-5xl font-mono font-bold mt-2 ${isWin ? 'text-emerald-500' : 'text-rose-500'}`}>{trade.pnl ? formatCurrency(trade.pnl) : '$0.00'}</div>
                     </div>
                 </div>
                 <div className="w-1/3 p-8 bg-[#0F131F] border-l border-white/10 overflow-y-auto">
                     <div className="flex items-center gap-3 mb-8"><Badge color={trade.direction === TradeDirection.BUY ? 'green' : 'red'}>{trade.direction}</Badge><Badge color="blue">{trade.session}</Badge></div>
                     <div className="space-y-6">
                         <div className="grid grid-cols-2 gap-4">
                             {/* Stats Grid */}
                             <div className="p-4 bg-white/5 rounded-xl"><span className="text-xs text-slate-400 block mb-1">Entry</span><span className="font-mono text-white">{trade.entryPrice || '---'}</span></div>
                             <div className="p-4 bg-white/5 rounded-xl"><span className="text-xs text-slate-400 block mb-1">Risk</span><span className="font-mono text-white">{trade.riskPercentage}%</span></div>
                         </div>
                         <div><h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2"><FileText size={14}/> Notes</h4><p className="text-sm text-slate-400 bg-black/20 p-4 rounded-xl border border-white/5">{trade.notes || "No notes."}</p></div>
                         {trade.aiAnalysis && <div><h4 className="text-sm font-bold text-cyan-400 mb-2 flex items-center gap-2"><Bot size={14}/> AI Insight</h4><p className="text-sm text-cyan-100/80 bg-cyan-900/10 border border-cyan-500/20 p-4 rounded-xl">{trade.aiAnalysis}</p></div>}
                     </div>
                     <div className="mt-10 flex gap-3"><Button variant="secondary" className="flex-1" onClick={() => onEdit(trade)}>Edit</Button><Button variant="danger" onClick={() => { onDelete(trade.id); onClose(); }}><Trash2 size={16}/></Button></div>
                 </div>
             </div>
        </div>
    );
};

const ConnectBrokerModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    if(!isOpen) return null;
    return <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4"><Card className="w-full max-w-md bg-[#0B0F19] text-center"><div className="flex justify-center mb-4 text-cyan-500"><CloudLightning size={48} /></div><h2 className="text-2xl font-bold text-white mb-2">Connect Broker</h2><p className="text-slate-400 mb-6 text-sm">Select your platform to sync trades via MetaApi.</p><Button variant="ghost" onClick={onClose} className="w-full">Cancel</Button></Card></div>;
};

// --- MAIN APP ---

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('journal');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [disciplineLogs, setDisciplineLogs] = useState<DisciplineLog[]>([]);
  const [isAddTradeOpen, setIsAddTradeOpen] = useState(false);
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [editingTrade, setEditingTrade] = useState<Partial<Trade> | undefined>(undefined);
  const [magicCmd, setMagicCmd] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  
  // Realtime Clock State
  const [currentTime, setCurrentTime] = useState(new Date());

  // Red Folder Data
  const [marketNews, setMarketNews] = useState<{sentiment: string, events: CalendarEvent[]}>({ sentiment: 'Loading...', events: [] });
  const [refreshNews, setRefreshNews] = useState(0);

  // Playbook State
  const [strategyInput, setStrategyInput] = useState('');
  const [playbookEntries, setPlaybookEntries] = useState<{title: string, content: string, rating?: string}[]>([]);
  const [generatingStrat, setGeneratingStrat] = useState(false);
  const [strategyMode, setStrategyMode] = useState<'ai' | 'manual'>('ai');
  const [manualStratTitle, setManualStratTitle] = useState('');
  const [manualStratRules, setManualStratRules] = useState('');

  // Mindset State
  const [journalTab, setJournalTab] = useState<'pre' | 'mid' | 'post'>('pre');
  
  // Analytics State
  const [selectedPsychoTradeId, setSelectedPsychoTradeId] = useState<string>('');
  const [psychoAnalysisResult, setPsychoAnalysisResult] = useState<string | null>(null);
  const [isAnalyzingPsycho, setIsAnalyzingPsycho] = useState(false);

  // AI Coach State
  const [coachMessages, setCoachMessages] = useState<ChatMessage[]>([]);
  const [coachInput, setCoachInput] = useState('');
  const [coachImage, setCoachImage] = useState<string | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const coachFileRef = useRef<HTMLInputElement>(null);

  // Profile State
  const [profileSettingsTab, setProfileSettingsTab] = useState('account');

  // Load Data
  useEffect(() => {
    const unsubAuth = subscribeToAuth((u) => {
        setUser(u);
        if (u) { setShowWelcome(true); setTimeout(() => setShowWelcome(false), 3000); initializeTodayLog(u.uid); }
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (user) {
        const unsubTrades = subscribeToTrades(user.uid, setTrades);
        const unsubAccounts = subscribeToAccounts(user.uid, setAccounts);
        const unsubDisc = subscribeToDiscipline(user.uid, setDisciplineLogs);
        return () => { unsubTrades(); unsubAccounts(); unsubDisc(); };
    }
  }, [user]);

  useEffect(() => {
      getLiveMarketNews().then(setMarketNews);
      const timer = setInterval(() => setCurrentTime(new Date()), 1000);
      return () => clearInterval(timer);
  }, [refreshNews]);

  // Scroll to bottom of chat
  useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [coachMessages]);

  const getTimeInZone = (zone: string) => {
    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric', minute: 'numeric', second: 'numeric',
        timeZone: zone, hour12: true
    }).format(currentTime);
  };

  const getMarketStatus = (city: string) => {
      // Very simple approximated hours for visual effect
      const hour = parseInt(new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone: city === 'New York' ? 'America/New_York' : city === 'London' ? 'Europe/London' : city === 'Tokyo' ? 'Asia/Tokyo' : 'Australia/Sydney' }).format(currentTime));
      if (city === 'New York') return (hour >= 8 && hour < 17) ? 'OPEN' : 'CLOSED';
      if (city === 'London') return (hour >= 8 && hour < 16) ? 'OPEN' : 'CLOSED';
      if (city === 'Tokyo') return (hour >= 9 && hour < 15) ? 'OPEN' : 'CLOSED';
      if (city === 'Sydney') return (hour >= 10 && hour < 16) ? 'OPEN' : 'CLOSED';
      return 'CLOSED';
  };

  const handleSaveTrade = async (tradeData: Partial<Trade>) => {
      if (!user) {
          alert("Please sign in to log trades.");
          return;
      }
      
      const accountId = tradeData.accountId || accounts[0]?.id || 'demo';
      
      try {
          if (tradeData.id) {
              await updateTradeInDb(tradeData as Trade);
          } else {
              let outcome = tradeData.outcome || TradeOutcome.PENDING;
              if (tradeData.pnl) { outcome = tradeData.pnl > 0 ? TradeOutcome.WIN : tradeData.pnl < 0 ? TradeOutcome.LOSS : TradeOutcome.BREAKEVEN; }
              
              const newTrade: any = { 
                  ...tradeData, 
                  date: tradeData.date || new Date().toISOString(), 
                  userId: user.uid, 
                  accountId, 
                  outcome, 
                  tags: tradeData.tags || [], 
              };
              
              // 1. Save Trade FIRST to get the ID
              const savedId = await addTradeToDb(newTrade, user.uid);
              
              // 2. Trigger AI Analysis if notes exist (Async, don't block UI)
              if (newTrade.notes && !newTrade.aiAnalysis) { 
                  analyzeTradePsychology(newTrade).then(async (analysis) => { 
                      await updateTradeInDb({ ...newTrade, id: savedId, aiAnalysis: analysis }); 
                  }); 
              }
              
              // 3. Update Balance
              if (newTrade.pnl) { 
                  const acc = accounts.find(a => a.id === accountId); 
                  if (acc) await updateAccountBalance(accountId, acc.balance + newTrade.pnl); 
              }
          }
          setIsAddTradeOpen(false); 
          setEditingTrade(undefined);
      } catch (error) {
          console.error("Failed to save trade", error);
          alert("Failed to save trade. Please try again.");
      }
  };

  const handleMagicCommand = async (e: React.FormEvent) => {
      e.preventDefault(); if (!magicCmd.trim()) return;
      const parsed = await parseTradeFromNaturalLanguage(magicCmd);
      setEditingTrade(parsed); setMagicCmd(''); setIsAddTradeOpen(true);
  };

  // ... (rest of the handlers)

  const handleGenerateStrategy = async () => {
      if (!strategyInput.trim()) return;
      setGeneratingStrat(true);
      const strat = await generateTradingStrategy(strategyInput);
      setPlaybookEntries([...playbookEntries, { title: strategyInput, content: strat }]);
      setStrategyInput(''); setGeneratingStrat(false);
  };

  const handleManualStrategy = async () => {
      if (!manualStratTitle.trim() || !manualStratRules.trim()) return;
      setGeneratingStrat(true);
      const critique = await critiqueTradingStrategy(manualStratRules);
      setPlaybookEntries([...playbookEntries, { title: manualStratTitle, content: manualStratRules, rating: critique }]);
      setManualStratTitle(''); setManualStratRules(''); setGeneratingStrat(false);
  }
  
  const handlePsychoAnalysis = async () => {
      if (!selectedPsychoTradeId) return;
      setIsAnalyzingPsycho(true);
      const trade = trades.find(t => t.id === selectedPsychoTradeId);
      if (trade) {
          const result = await analyzeDeepPsychology(trade);
          setPsychoAnalysisResult(result);
      }
      setIsAnalyzingPsycho(false);
  }

  // --- AI COACH HANDLERS ---
  const handleCoachUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => setCoachImage(reader.result as string);
          reader.readAsDataURL(file);
      }
  };

  const handleCoachSend = async () => {
      if (!coachInput.trim() && !coachImage) return;
      
      const newMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'user',
          text: coachInput,
          image: coachImage || undefined,
          timestamp: Date.now()
      };

      setCoachMessages(prev => [...prev, newMessage]);
      const currentInput = coachInput;
      const currentImage = coachImage || undefined;
      
      setCoachInput('');
      setCoachImage(null);
      setCoachLoading(true);

      const responseText = await chatWithTradeCoach(coachMessages, currentInput, currentImage);
      
      const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: responseText,
          timestamp: Date.now()
      };

      setCoachMessages(prev => [...prev, aiResponse]);
      setCoachLoading(false);
  };

  const handleLogout = async () => { await logoutUser(); setTrades([]); setAccounts([]); };
  if (!user) return <LoginScreen onLogin={() => {}} />;

  const filteredTrades = selectedAccount === 'all' ? trades : trades.filter(t => t.accountId === selectedAccount);

  // Stats Calculation for Profile
  const totalPnL = filteredTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
  const totalTrades = filteredTrades.length;
  const wins = filteredTrades.filter(t => t.outcome === TradeOutcome.WIN).length;
  const losses = filteredTrades.filter(t => t.outcome === TradeOutcome.LOSS).length;
  const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : "0.0";
  const avgWin = wins > 0 ? filteredTrades.filter(t => t.outcome === TradeOutcome.WIN).reduce((a, t) => a + (t.pnl||0), 0) / wins : 0;
  const avgLoss = losses > 0 ? Math.abs(filteredTrades.filter(t => t.outcome === TradeOutcome.LOSS).reduce((a, t) => a + (t.pnl||0), 0) / losses) : 1;
  const avgRR = (avgWin / (avgLoss || 1)).toFixed(2);

  // Mock Community Data (Realtime simulation)
  const communityPosts = [
    { id: 1, user: 'CryptoKing', time: 'Just now', pair: 'BTCUSD', direction: 'LONG', roi: '+12.5%', image: 'https://images.unsplash.com/photo-1611974765270-ca12586343bb?auto=format&fit=crop&q=80&w=600', likes: 24, comments: 5 },
    { id: 2, user: 'ForexSniper', time: '2m ago', pair: 'EURUSD', direction: 'SHORT', roi: '+4.2%', image: 'https://images.unsplash.com/photo-1535320903710-d9cf113d2054?auto=format&fit=crop&q=80&w=600', likes: 11, comments: 2 },
    { id: 3, user: 'GoldBug', time: '12m ago', pair: 'XAUUSD', direction: 'LONG', roi: '-1.2%', image: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&q=80&w=600', likes: 5, comments: 8 },
  ];

  return (
    <ThemeContext.Provider value={{ theme: 'dark', toggleTheme: () => {} }}>
      <div className="flex min-h-screen bg-[#05070A] text-slate-100 font-sans selection:bg-cyan-500/30">
        <BackgroundBlobs />
        <WelcomeToast username={user.displayName || 'Trader'} visible={showWelcome} />
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

        <main className="flex-1 md:ml-20 pb-24 md:pb-0 relative z-10 transition-all duration-300">
          
          {/* Header */}
          <header className="sticky top-0 z-40 px-6 py-4 bg-[#05070A]/80 backdrop-blur-xl border-b border-white/5 flex justify-between items-center">
             <div className="flex items-center gap-4">
                 <h2 className="text-xl font-display font-bold text-white capitalize">{activeTab.replace('-', ' ')}</h2>
                 {activeTab === 'journal' && (
                     <div className="hidden md:flex items-center gap-2 bg-slate-900/50 border border-white/10 rounded-full px-4 py-2 w-96 group focus-within:ring-2 ring-cyan-500/50 transition-all">
                         <Terminal size={16} className="text-cyan-500" />
                         <form onSubmit={handleMagicCommand} className="flex-1">
                            <input className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-600" placeholder="Magic Log: 'Long BTC at 65k, SL 64k...'" value={magicCmd} onChange={e => setMagicCmd(e.target.value)} />
                         </form>
                     </div>
                 )}
             </div>
             <div className="flex items-center gap-4">
                 <Select value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)} className="w-40 h-10 py-0 text-sm bg-slate-900 border-white/10">
                     <option value="all">All Accounts</option>
                     {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                 </Select>
                 <Button size="sm" variant="neon" onClick={() => { setEditingTrade(undefined); setIsAddTradeOpen(true); }}><Plus size={18} /> <span className="hidden sm:inline">New Trade</span></Button>
             </div>
          </header>

          <div className="p-6 max-w-7xl mx-auto">
            {/* --- JOURNAL --- */}
            {activeTab === 'journal' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="bg-gradient-to-br from-indigo-900/20 to-transparent border-indigo-500/10">
                            <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-2">Net PnL</div>
                            <div className={`text-2xl font-mono font-bold ${totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {formatCurrency(totalPnL)}
                            </div>
                        </Card>
                        <Card className="bg-gradient-to-br from-cyan-900/20 to-transparent border-cyan-500/10">
                            <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-2">Win Rate</div>
                            <div className="text-2xl font-mono font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                                {winRate}%
                            </div>
                        </Card>
                         <Card className="bg-gradient-to-br from-purple-900/20 to-transparent border-purple-500/10">
                            <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-2">Profit Factor</div>
                            <div className="text-2xl font-mono font-bold text-purple-400">
                                {Math.abs(filteredTrades.filter(t => (t.pnl || 0) < 0).reduce((a, b) => a + (b.pnl || 0), 0)) > 0 
                                  ? (filteredTrades.filter(t => (t.pnl || 0) > 0).reduce((a, b) => a + (b.pnl || 0), 0) / Math.abs(filteredTrades.filter(t => (t.pnl || 0) < 0).reduce((a, b) => a + (b.pnl || 0), 0))).toFixed(2) : '∞'}
                            </div>
                        </Card>
                         <Card className="bg-gradient-to-br from-amber-900/20 to-transparent border-amber-500/10 flex flex-col justify-between">
                            <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-2">Market Bias</div>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-bold text-amber-400">Neutral</span>
                                <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded border border-amber-500/20">AI</span>
                            </div>
                        </Card>
                    </div>

                    <Card className="overflow-hidden border-0 bg-[#0B0F19]/90">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 text-xs text-slate-500 uppercase font-mono tracking-wider">
                                    <th className="p-4 font-normal">Date</th>
                                    <th className="p-4 font-normal">Pair</th>
                                    <th className="p-4 font-normal">Session</th>
                                    <th className="p-4 font-normal">Setup</th>
                                    <th className="p-4 font-normal">Tags</th>
                                    <th className="p-4 font-normal">Risk</th>
                                    <th className="p-4 font-normal">R:R</th>
                                    <th className="p-4 font-normal text-right">PnL</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredTrades.slice().reverse().map((trade) => (
                                    <tr key={trade.id} onClick={() => setSelectedTrade(trade)} className="hover:bg-white/5 transition-colors cursor-pointer group">
                                        <td className="p-4 text-sm text-slate-300 font-mono">{new Date(trade.date).toLocaleDateString()}</td>
                                        <td className="p-4"><div className="flex items-center gap-2"><Badge color={trade.direction === TradeDirection.BUY ? 'green' : 'red'}>{trade.direction}</Badge><span className="font-bold text-white">{trade.pair}</span></div></td>
                                        <td className="p-4 text-sm text-slate-400">{trade.session}</td>
                                        <td className="p-4 text-sm text-slate-400">{trade.setup || '-'}</td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-1">
                                                {trade.tags?.slice(0, 2).map(tag => <Badge key={tag} color="gray">{tag}</Badge>)}
                                                {(trade.tags?.length || 0) > 2 && <span className="text-[10px] text-slate-500">+{trade.tags!.length - 2}</span>}
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-400">{trade.riskPercentage ? `${trade.riskPercentage}%` : '-'}</td>
                                        <td className="p-4 text-sm text-slate-400">{trade.rMultiple ? `${trade.rMultiple}R` : '-'}</td>
                                        <td className={`p-4 text-right font-mono font-bold ${trade.pnl && trade.pnl > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{trade.pnl ? formatCurrency(trade.pnl) : '-'}</td>
                                    </tr>
                                ))}
                                {filteredTrades.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="p-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-4">
                                                <BookOpen size={48} opacity={0.2} />
                                                <p>No trades logged yet.</p>
                                                <Button size="sm" variant="secondary" onClick={() => setIsAddTradeOpen(true)}>Log First Trade</Button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </Card>
                </div>
            )}
            
            {/* ... (Rest of activeTab logic kept same) ... */}
            {activeTab === 'analytics' && (
                <div className="space-y-6 flex flex-col">
                    <Card className="flex items-center justify-between bg-gradient-to-r from-blue-900/20 to-transparent border-blue-500/20">
                         <div className="flex items-center gap-4">
                             <div className="p-3 bg-blue-500/10 rounded-full text-blue-400"><TargetIcon size={24}/></div>
                             <div>
                                 <h3 className="text-lg font-bold text-white">Consistency Score</h3>
                                 <p className="text-xs text-slate-400">Based on PnL variance</p>
                             </div>
                         </div>
                         <div className="text-3xl font-mono font-bold text-blue-400">88<span className="text-sm text-slate-500">/100</span></div>
                    </Card>
                    
                    {/* PSYCHO LAB */}
                    <Card className="bg-gradient-to-br from-indigo-900/20 to-transparent border-indigo-500/10">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><BrainCircuit className="text-indigo-400"/> Trade Psychology Lab</h3>
                        <p className="text-sm text-slate-400 mb-4">Select a specific trade to perform a deep behavioral analysis using your journal notes.</p>
                        
                        <div className="flex gap-4 mb-4">
                            <Select value={selectedPsychoTradeId} onChange={e => setSelectedPsychoTradeId(e.target.value)} className="bg-black/40">
                                <option value="">Select a trade to analyze...</option>
                                {filteredTrades.filter(t => t.notes).map(t => (
                                    <option key={t.id} value={t.id}>{t.pair} ({t.outcome}) - {new Date(t.date).toLocaleDateString()}</option>
                                ))}
                            </Select>
                            <Button variant="neon" onClick={handlePsychoAnalysis} disabled={!selectedPsychoTradeId || isAnalyzingPsycho}>
                                {isAnalyzingPsycho ? <Sparkles className="animate-spin"/> : 'Analyze Mindset'}
                            </Button>
                        </div>
                        
                        {psychoAnalysisResult && (
                            <div className="mt-4 p-4 bg-indigo-900/10 rounded-xl border border-indigo-500/20 animate-fade-in">
                                <h4 className="text-xs font-bold text-indigo-400 uppercase mb-2">Behavioral Profile</h4>
                                <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                                    <pre className="whitespace-pre-wrap font-sans bg-transparent border-0 p-0">{psychoAnalysisResult}</pre>
                                </div>
                            </div>
                        )}
                    </Card>

                    <Card className="h-[400px]">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><TrendingUp className="text-cyan-500"/> Equity Curve</h3>
                        <EquityCurve trades={filteredTrades} />
                    </Card>
                    <Card className="h-[400px]">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><CalendarIcon className="text-emerald-500"/> PnL Calendar</h3>
                        <TradeCalendar trades={filteredTrades} />
                    </Card>
                    {/* Charts Stack */}
                    <Card><h3 className="text-sm font-bold text-slate-400 mb-4 uppercase">Win Rate Distribution</h3><WinLossChart trades={filteredTrades} /></Card>
                    <Card><h3 className="text-sm font-bold text-slate-400 mb-4 uppercase">Pair Performance</h3><PairPerformanceChart trades={filteredTrades} /></Card>
                    <Card><h3 className="text-sm font-bold text-slate-400 mb-4 uppercase">Strategy Edge</h3><StrategyChart trades={filteredTrades} /></Card>
                    <Card><h3 className="text-sm font-bold text-slate-400 mb-4 uppercase">Hourly Edge</h3><HourlyPerformanceChart trades={filteredTrades} /></Card>
                </div>
            )}

            {/* --- PLAYBOOK --- */}
            {activeTab === 'playbook' && (
                <div className="space-y-6">
                    {/* Strategy Builder Toggle */}
                    <div className="flex gap-4 mb-4">
                        <button onClick={() => setStrategyMode('ai')} className={`flex-1 py-3 rounded-xl border font-bold transition-all ${strategyMode === 'ai' ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' : 'bg-white/5 border-white/5 text-slate-400'}`}>AI Generator</button>
                        <button onClick={() => setStrategyMode('manual')} className={`flex-1 py-3 rounded-xl border font-bold transition-all ${strategyMode === 'manual' ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' : 'bg-white/5 border-white/5 text-slate-400'}`}>Manual Builder</button>
                    </div>

                    <Card className="bg-gradient-to-r from-slate-900 to-transparent border-white/10">
                        {strategyMode === 'ai' ? (
                            <div className="flex flex-col md:flex-row gap-4 items-end">
                                <div className="flex-1 w-full">
                                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><Sparkles className="text-cyan-400"/> AI Strategy Architect</h3>
                                    <p className="text-sm text-slate-400 mb-3">Describe a concept (e.g. "Silver Bullet for London"). Gemini 3 Pro will structure a full trading plan.</p>
                                    <Input placeholder="Describe your edge..." value={strategyInput} onChange={e => setStrategyInput(e.target.value)} className="bg-black/30" />
                                </div>
                                <Button variant="neon" onClick={handleGenerateStrategy} disabled={generatingStrat} className="w-full md:w-auto min-w-[150px]">
                                    {generatingStrat ? <><Sparkles className="animate-spin"/> Thinking...</> : 'Generate Plan'}
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2"><PenTool className="text-purple-400"/> Strategy Manual</h3>
                                </div>
                                <Input placeholder="Strategy Title (e.g. 5min Scalp)" value={manualStratTitle} onChange={e => setManualStratTitle(e.target.value)} />
                                <textarea className="w-full h-40 bg-black/30 border border-white/10 rounded-xl p-4 text-white resize-none outline-none focus:border-purple-500" placeholder="Define Entry, Exit, and Risk rules here..." value={manualStratRules} onChange={e => setManualStratRules(e.target.value)} />
                                <div className="flex justify-end">
                                    <Button variant="primary" className="bg-purple-600 hover:bg-purple-500 border-purple-500/50 shadow-purple-500/20" onClick={handleManualStrategy} disabled={generatingStrat}>
                                        {generatingStrat ? 'Analyzing...' : 'Save & Rate Strategy'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {playbookEntries.map((entry, idx) => (
                            <Card key={idx} className="relative overflow-hidden group hover:border-cyan-500/30 transition-all">
                                <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                    <BookMarked size={80} className="text-white/5 rotate-12" />
                                </div>
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-display font-bold text-white">{entry.title}</h3>
                                    {entry.rating && (
                                        <Badge color="purple">Rated</Badge>
                                    )}
                                </div>
                                <div className="prose prose-invert max-w-none prose-sm mb-4">
                                    <pre className="whitespace-pre-wrap font-sans text-slate-300 text-xs bg-black/20 p-4 rounded-xl border border-white/5">{entry.content}</pre>
                                </div>
                                {entry.rating && (
                                    <div className="mt-4 pt-4 border-t border-white/10">
                                        <h4 className="text-xs font-bold text-purple-400 uppercase mb-2">AI Critique</h4>
                                        <div className="text-xs text-slate-400 bg-purple-900/10 p-3 rounded-lg border border-purple-500/10">
                                            <pre className="whitespace-pre-wrap font-sans">{entry.rating}</pre>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                </div>
            )}
            
            {/* --- COMMUNITY (THE PIT) --- */}
            {activeTab === 'community' && (
                <div className="flex gap-8">
                    {/* Main Feed */}
                    <div className="flex-1 space-y-6">
                        {/* Header Ticker */}
                        <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap bg-emerald-500/10 border border-emerald-500/20 py-2 px-4 rounded-xl text-xs font-bold text-emerald-400">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                             <span>LIVE: BTC Breaks 65k</span>
                             <span className="mx-2">•</span>
                             <span>EURUSD Longs +35%</span>
                             <span className="mx-2">•</span>
                             <span>Gold Rejects 2040</span>
                        </div>

                         {/* Compose */}
                        <Card className="bg-[#0B0F19] border-white/10">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                    {user?.displayName?.[0] || 'T'}
                                </div>
                                <div className="flex-1">
                                    <input type="text" placeholder="Share a trade idea or win..." className="w-full bg-transparent border-none outline-none text-white placeholder:text-slate-600 mb-4" />
                                    <div className="flex items-center justify-between border-t border-white/5 pt-4">
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" className="text-slate-400"><ImageIcon size={18}/></Button>
                                            <Button variant="ghost" size="sm" className="text-slate-400"><BarChart2 size={18}/></Button>
                                        </div>
                                        <Button variant="neon" size="sm">Post to Pit</Button>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Feed Stream */}
                        {communityPosts.map(post => (
                            <Card key={post.id} className="bg-[#0B0F19] border-white/10 p-0 overflow-hidden animate-slide-up">
                                <div className="p-4 flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 border border-white/5">
                                            {post.user[0]}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-sm flex items-center gap-2">{post.user} <Badge color="gray">PRO</Badge></h4>
                                            <span className="text-xs text-slate-500">{post.time}</span>
                                        </div>
                                    </div>
                                    <Badge color={post.direction === 'LONG' ? 'green' : 'red'}>{post.direction} {post.pair}</Badge>
                                </div>
                                <div className="w-full h-64 bg-slate-900 overflow-hidden relative group cursor-pointer">
                                    <img src={post.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" />
                                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-sm font-mono font-bold text-emerald-400 border border-emerald-500/30">
                                        {post.roi}
                                    </div>
                                </div>
                                <div className="p-4 border-t border-white/5 flex items-center justify-between bg-black/20">
                                    <div className="flex gap-4">
                                        <button className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors">
                                            <ThumbsUp size={18} /> <span className="text-xs font-bold">{post.likes}</span>
                                        </button>
                                        <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                                            <MessageCircle size={18} /> <span className="text-xs font-bold">{post.comments}</span>
                                        </button>
                                    </div>
                                    <button className="text-slate-500 hover:text-white"><Share2 size={18} /></button>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Sidebar Leaderboard */}
                    <div className="hidden lg:block w-80 space-y-6">
                        <Card className="bg-gradient-to-b from-slate-900 to-transparent border-white/10 sticky top-24">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2"><Trophy size={16} className="text-yellow-500"/> Top Traders</h3>
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 border border-white/5">#{i}</div>
                                            <div>
                                                <div className="text-sm font-bold text-white">Trader_{100+i}</div>
                                                <div className="text-[10px] text-slate-500">24 Trades</div>
                                            </div>
                                        </div>
                                        <div className="font-mono text-sm font-bold text-emerald-400">+{124 - i*12}%</div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* --- PROFILE --- */}
            {activeTab === 'profile' && (
                <div className="space-y-8">
                    {/* Hero Section */}
                    <div className="relative rounded-3xl overflow-hidden bg-[#0B0F19] border border-white/10 shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/30 via-cyan-900/10 to-transparent pointer-events-none"></div>
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
                        
                        <div className="relative p-10 flex flex-col md:flex-row items-center gap-8 z-10">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-cyan-400 to-indigo-600">
                                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                                        <UserIcon size={48} className="text-white" />
                                    </div>
                                </div>
                                <div className="absolute bottom-0 right-0 bg-emerald-500 w-8 h-8 rounded-full border-4 border-slate-900 flex items-center justify-center" title="Online">
                                    <Check size={14} className="text-white"/>
                                </div>
                            </div>
                            
                            <div className="text-center md:text-left flex-1">
                                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                                    <h1 className="text-3xl font-display font-bold text-white">{user?.displayName || 'Unknown Trader'}</h1>
                                    <Badge color="cyan">PRO</Badge>
                                </div>
                                <p className="text-slate-400 max-w-md mx-auto md:mx-0">Discretionary Price Action Trader targeting 1:3 RR setups during London & NY Sessions.</p>
                                
                                <div className="flex items-center justify-center md:justify-start gap-6 mt-6">
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Rank</div>
                                        <div className="text-lg font-bold text-white flex items-center gap-2">
                                            <Award className="text-yellow-500" size={18}/> 
                                            {totalPnL > 10000 ? 'Whale' : totalPnL > 1000 ? 'Shark' : 'Minnow'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Joined</div>
                                        <div className="text-lg font-bold text-white">Oct 2023</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Followers</div>
                                        <div className="text-lg font-bold text-white">1.2k</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button variant="secondary">Edit Profile</Button>
                                <Button variant="ghost"><Settings size={20}/></Button>
                            </div>
                        </div>

                        {/* Quick Stats Bar */}
                        <div className="bg-slate-900/50 border-t border-white/5 p-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                             <div>
                                 <div className="text-xs text-slate-500 uppercase mb-1">Total PnL</div>
                                 <div className={`text-2xl font-mono font-bold ${totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{formatCurrency(totalPnL)}</div>
                             </div>
                             <div>
                                 <div className="text-xs text-slate-500 uppercase mb-1">Win Rate</div>
                                 <div className="text-2xl font-mono font-bold text-cyan-400">{winRate}%</div>
                             </div>
                             <div>
                                 <div className="text-xs text-slate-500 uppercase mb-1">Avg R:R</div>
                                 <div className="text-2xl font-mono font-bold text-white">1 : {avgRR}</div>
                             </div>
                             <div>
                                 <div className="text-xs text-slate-500 uppercase mb-1">Trades</div>
                                 <div className="text-2xl font-mono font-bold text-white">{totalTrades}</div>
                             </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Achievements */}
                        <div className="lg:col-span-2 space-y-6">
                            <h3 className="text-lg font-bold text-white mb-4">Achievements</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { title: 'Sniper Entry', desc: '5 trades with < 2 pip drawdown', icon: Target, active: true },
                                    { title: 'Consistency King', desc: 'Profit everyday for 5 days', icon: TrendingUp, active: true },
                                    { title: 'Iron Mind', desc: 'No tilt for 30 days', icon: BrainCircuit, active: false },
                                    { title: 'Whale Hunter', desc: 'Catch a 10R+ trade', icon: Award, active: false },
                                ].map((ach, i) => (
                                    <div key={i} className={`p-4 rounded-2xl border flex items-center gap-4 ${ach.active ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-500/30' : 'bg-slate-900/30 border-white/5 opacity-50'}`}>
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${ach.active ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-slate-500'}`}>
                                            <ach.icon size={24} />
                                        </div>
                                        <div>
                                            <h4 className={`font-bold ${ach.active ? 'text-white' : 'text-slate-500'}`}>{ach.title}</h4>
                                            <p className="text-xs text-slate-500">{ach.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Settings Tabs */}
                            <div className="mt-8">
                                <div className="flex gap-6 border-b border-white/10 mb-6">
                                    {['Account', 'Broker Connections', 'Notifications', 'Security'].map(tab => (
                                        <button 
                                            key={tab}
                                            onClick={() => setProfileSettingsTab(tab.toLowerCase().split(' ')[0])}
                                            className={`pb-4 text-sm font-bold transition-all ${profileSettingsTab === tab.toLowerCase().split(' ')[0] ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500 hover:text-white'}`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                                <Card className="bg-[#0B0F19]">
                                    {profileSettingsTab === 'account' && (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                                                <div>
                                                    <div className="font-bold text-white">Pro Plan</div>
                                                    <div className="text-xs text-slate-500">Next billing: Oct 24, 2024</div>
                                                </div>
                                                <Button size="sm" variant="secondary">Manage Subscription</Button>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-slate-500">Display Name</label>
                                                    <Input defaultValue={user?.displayName || ''} className="bg-black/40" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-slate-500">Email</label>
                                                    <Input defaultValue={user?.email || ''} disabled className="bg-black/40 opacity-50 cursor-not-allowed" />
                                                </div>
                                                <Button className="mt-4" variant="neon">Save Changes</Button>
                                            </div>
                                        </div>
                                    )}
                                    {profileSettingsTab === 'broker' && (
                                        <div className="text-center py-12 text-slate-500">
                                            <CloudLightning size={48} className="mx-auto mb-4 opacity-20"/>
                                            <p>No active broker connections.</p>
                                            <Button variant="neon" className="mt-4" onClick={() => setIsConnectOpen(true)}>Connect Account</Button>
                                        </div>
                                    )}
                                </Card>
                            </div>
                        </div>

                        {/* Accounts List Sidebar */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-white">Trading Accounts</h3>
                                <button className="text-xs text-cyan-400 font-bold hover:underline">+ Add</button>
                            </div>
                            {accounts.map(acc => (
                                <Card key={acc.id} className="bg-gradient-to-br from-slate-900 to-slate-800 border-white/10 hover:border-cyan-500/30 transition-all cursor-pointer group">
                                    <div className="flex justify-between items-start mb-4">
                                        <Badge color="blue">{acc.broker}</Badge>
                                        <button className="text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); deleteAccountFromDb(acc.id); }}><Trash2 size={16}/></button>
                                    </div>
                                    <div className="mb-1 text-slate-400 text-sm font-medium">{acc.name}</div>
                                    <div className="text-2xl font-mono font-bold text-white">{formatCurrency(acc.balance)}</div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            {/* --- MINDSET --- */}
            {activeTab === 'discipline' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                    {/* Column 1: Daily Protocol */}
                    <div className="space-y-6">
                        <Card className="h-full bg-gradient-to-b from-slate-900 to-slate-900/50 border-cyan-500/20 flex flex-col">
                            <h3 className="text-xl font-display font-bold text-white mb-1 flex items-center gap-2"><Shield className="text-cyan-400"/> Daily Protocol</h3>
                            <p className="text-xs text-slate-500 mb-6">Non-negotiable rules for engagement.</p>
                            
                            <div className="space-y-4 flex-1">
                                {[
                                    { id: 'followedPlan', label: 'Followed Trading Plan', icon: CheckSquare },
                                    { id: 'noRevenge', label: 'No Revenge Trading', icon: XCircle },
                                    { id: 'calmEmotion', label: 'Emotional State Calm', icon: Smile },
                                    { id: 'journaled', label: 'Journaled Post-Session', icon: BookOpen },
                                ].map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer group"
                                    onClick={() => {
                                        const today = new Date().toISOString().split('T')[0];
                                        const log = disciplineLogs.find(l => l.date === today) || { id: `${user.uid}_${today}`, date: today } as DisciplineLog;
                                        // @ts-ignore
                                        updateDisciplineLog({ ...log, [item.id]: !log[item.id] }, user.uid);
                                    }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${disciplineLogs.find(l => l.date === new Date().toISOString().split('T')[0])?.[item.id as keyof DisciplineLog] ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                            <item.icon size={18} />
                                            </div>
                                            <span className="font-medium text-slate-300 group-hover:text-white">{item.label}</span>
                                        </div>
                                        <div className={`w-4 h-4 rounded-full border-2 ${disciplineLogs.find(l => l.date === new Date().toISOString().split('T')[0])?.[item.id as keyof DisciplineLog] ? 'bg-cyan-400 border-cyan-400' : 'border-slate-600'}`} />
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Column 2: Vitals & Battery */}
                    <div className="space-y-6 flex flex-col">
                        <Card className="bg-gradient-to-br from-purple-900/10 to-transparent border-purple-500/20">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Battery className="text-purple-400"/> Psycho-Capital</h3>
                            <div className="flex flex-col items-center justify-center p-6 bg-black/30 rounded-2xl border border-white/5">
                                <div className="flex items-end gap-1 h-16">
                                    {[1,2,3,4,5,6,7,8,9,10].map(i => (
                                        <div key={i} className={`w-3 rounded-sm transition-all duration-500 ${i <= 8 ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-slate-800 h-full opacity-20'}`} style={{ height: `${i*10}%`}} />
                                    ))}
                                </div>
                                <span className="text-purple-300 font-bold mt-4 tracking-widest uppercase text-sm">80% Charged</span>
                            </div>
                        </Card>
                        
                        <Card className="flex-1 bg-gradient-to-b from-slate-900 to-slate-900/50 border-white/10 flex flex-col">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Activity className="text-emerald-400"/> Bio-Regulation</h3>
                            <BreathingExercise />
                        </Card>
                    </div>

                    {/* Column 3: Session Journal */}
                    <div className="space-y-6">
                        <Card className="h-full bg-[#0B0F19] border-white/10 flex flex-col">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><PenTool className="text-slate-400"/> Session Notes</h3>
                            
                            <div className="flex p-1 bg-slate-900 rounded-xl mb-4 border border-white/5">
                                <button onClick={() => setJournalTab('pre')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${journalTab === 'pre' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-500 hover:text-white'}`}>PRE-SESSION</button>
                                <button onClick={() => setJournalTab('mid')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${journalTab === 'mid' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-500 hover:text-white'}`}>MID-SESSION</button>
                                <button onClick={() => setJournalTab('post')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${journalTab === 'post' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-500 hover:text-white'}`}>POST-SESSION</button>
                            </div>

                            <textarea className="flex-1 w-full bg-black/30 border border-white/5 rounded-xl p-4 text-slate-300 resize-none outline-none focus:border-cyan-500/50 transition-colors" placeholder={`Log your ${journalTab}-session thoughts...`} />
                            
                            <div className="mt-4 flex justify-end">
                                <Button size="sm" variant="secondary">Save Log</Button>
                            </div>
                        </Card>
                    </div>
                </div>
            )}
            
            {/* --- NEWS (RED FOLDER) --- */}
             {activeTab === 'news' && (
                <div className="space-y-8">
                    {/* Market Clock Header */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { city: 'New York', color: 'text-emerald-400', zone: 'America/New_York' },
                            { city: 'London', color: 'text-emerald-400', zone: 'Europe/London' },
                            { city: 'Tokyo', color: 'text-slate-500', zone: 'Asia/Tokyo' },
                            { city: 'Sydney', color: 'text-slate-500', zone: 'Australia/Sydney' },
                        ].map(m => {
                            const status = getMarketStatus(m.city);
                            const time = getTimeInZone(m.zone);
                            return (
                                <div key={m.city} className="relative bg-slate-900/80 border border-white/5 rounded-2xl p-4 flex justify-between items-center hover:border-white/10 transition-all overflow-hidden">
                                    {status === 'OPEN' && <div className="absolute inset-0 bg-emerald-500/5 animate-pulse-slow pointer-events-none"></div>}
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{m.city}</div>
                                        <div className="text-xl font-mono font-bold text-white tracking-tight">{time}</div>
                                    </div>
                                    <div className={`text-[10px] font-bold px-2 py-1 rounded border ${status === 'OPEN' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                                        {status}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Weekly Outlook */}
                        <Card className="md:col-span-2 bg-gradient-to-r from-slate-900 to-slate-900/50 border-white/10">
                            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><Globe className="text-cyan-400"/> Global Macro Outlook</h3>
                            <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                                <p>{marketNews.sentiment}</p>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <Badge color="blue">DXY Bullish</Badge>
                                <Badge color="gray">Risk Off</Badge>
                            </div>
                        </Card>

                        {/* Volatility Radar */}
                        <Card className="bg-[#0B0F19] border-white/10 flex flex-col items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.1)_0%,transparent_70%)] animate-pulse-slow"></div>
                            <h3 className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-4 z-10">Volatility Threat Level</h3>
                            
                            <div className="relative w-40 h-40 rounded-full border-4 border-slate-800 flex items-center justify-center z-10">
                                <div className="absolute inset-0 border-4 border-rose-500 rounded-full border-t-transparent border-l-transparent animate-spin-slow opacity-50"></div>
                                <div className="text-center">
                                    <div className="text-4xl font-black text-white">HIGH</div>
                                    <div className="text-[10px] text-rose-400 uppercase mt-1">Defcon 2</div>
                                </div>
                            </div>
                            <div className="mt-6 w-full px-6 z-10">
                                <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold mb-1">
                                    <span>Low</span>
                                    <span>Extreme</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-rose-500 w-[80%] rounded-full shadow-[0_0_15px_rgba(244,63,94,0.5)]"></div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Flight Board */}
                    <Card className="border-0 bg-transparent p-0">
                         <div className="flex items-center justify-between mb-4 px-2">
                             <h3 className="text-lg font-bold text-white flex items-center gap-2"><Flame className="text-rose-500"/> High Impact Events</h3>
                             <div className="text-xs text-slate-500">Auto-Refreshes every 5m</div>
                         </div>
                         <div className="bg-[#0F131F] border border-white/10 rounded-2xl overflow-hidden">
                             <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                 <div className="col-span-2">Time</div>
                                 <div className="col-span-1">Curr</div>
                                 <div className="col-span-5">Event</div>
                                 <div className="col-span-2 text-right">Actual</div>
                                 <div className="col-span-2 text-right">Forecast</div>
                             </div>
                             <div className="divide-y divide-white/5">
                                 {marketNews.events.length > 0 ? marketNews.events.map((e, i) => (
                                     <div key={i} className="grid grid-cols-12 gap-4 p-4 hover:bg-white/5 transition-colors items-center group">
                                         <div className="col-span-2 font-mono text-sm text-white group-hover:text-cyan-400 transition-colors">{e.time}</div>
                                         <div className="col-span-1"><Badge color={e.currency === 'USD' ? 'green' : e.currency === 'EUR' ? 'blue' : 'gray'}>{e.currency}</Badge></div>
                                         <div className="col-span-5 text-sm font-medium text-slate-300">{e.event}</div>
                                         <div className={`col-span-2 text-right font-mono text-sm ${e.isBetter ? 'text-emerald-400' : 'text-rose-400'}`}>{e.actual || '--'}</div>
                                         <div className="col-span-2 text-right font-mono text-sm text-slate-500">{e.forecast || '--'}</div>
                                     </div>
                                 )) : (
                                     [1,2,3].map(i => (
                                        <div key={i} className="p-4 text-center text-sm text-slate-500 animate-pulse">Scanning Global Feeds...</div>
                                     ))
                                 )}
                             </div>
                         </div>
                    </Card>
                </div>
            )}
            
            {activeTab === 'ai-coach' && (
                <div className="h-[calc(100vh-140px)] flex flex-col relative max-w-4xl mx-auto">
                    <Card className="flex-1 flex flex-col bg-[#0B0F19] border-white/10 overflow-hidden shadow-2xl">
                        {/* Coach Header */}
                        <div className="p-4 border-b border-white/5 bg-slate-900/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                                    <Bot size={20} className="text-cyan-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">Alpha Coach</h3>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-xs text-slate-400">Online • Gemini 3.0 Pro</span>
                                    </div>
                                </div>
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => setCoachMessages([])}>Clear Chat</Button>
                        </div>

                        {/* Chat History */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {coachMessages.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-50 space-y-4">
                                    <Bot size={48} />
                                    <p>Ready to analyze charts and psychology.</p>
                                </div>
                            )}
                            
                            {coachMessages.map((msg) => (
                                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.role === 'user' ? 'bg-indigo-500/20 border border-indigo-500/30' : 'bg-cyan-500/20 border border-cyan-500/30'}`}>
                                        {msg.role === 'user' ? <UserIcon size={16} className="text-indigo-400"/> : <Bot size={16} className="text-cyan-400"/>}
                                    </div>
                                    <div className={`max-w-[80%] space-y-2`}>
                                        {msg.image && (
                                            <img src={msg.image} alt="Upload" className="rounded-xl border border-white/10 max-w-full md:max-w-sm" />
                                        )}
                                        <div className={`p-4 rounded-2xl text-sm leading-relaxed border shadow-lg ${
                                            msg.role === 'user' 
                                            ? 'bg-indigo-600/20 border-indigo-500/20 text-indigo-100 rounded-tr-none' 
                                            : 'bg-white/5 border-white/5 text-slate-300 rounded-tl-none'
                                        }`}>
                                            <pre className="whitespace-pre-wrap font-sans">{msg.text}</pre>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {coachLoading && (
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0 mt-1"><Bot size={16} className="text-cyan-400"/></div>
                                    <div className="bg-white/5 rounded-2xl rounded-tl-none p-4 text-sm text-slate-500 border border-white/5">
                                        <div className="flex gap-1">
                                            <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                                            <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-100"></span>
                                            <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-200"></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-slate-900/50 border-t border-white/5 space-y-3">
                            {coachImage && (
                                <div className="relative inline-block">
                                    <img src={coachImage} className="h-20 w-auto rounded-lg border border-white/10" />
                                    <button onClick={() => setCoachImage(null)} className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1"><X size={10}/></button>
                                </div>
                            )}
                            <div className="flex gap-2 relative items-end">
                                <input type="file" ref={coachFileRef} className="hidden" accept="image/*" onChange={handleCoachUpload} />
                                <Button variant="ghost" className="text-slate-500 hover:text-white p-3 h-auto rounded-xl" onClick={() => coachFileRef.current?.click()}>
                                    <Paperclip size={20}/>
                                </Button>
                                <textarea 
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:ring-1 focus:ring-cyan-500 outline-none resize-none max-h-32" 
                                    placeholder="Analyze this chart..." 
                                    rows={1}
                                    value={coachInput}
                                    onChange={e => setCoachInput(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleCoachSend();
                                        }
                                    }}
                                />
                                <Button variant="neon" className="p-3 h-auto rounded-xl" onClick={handleCoachSend} disabled={coachLoading || (!coachInput.trim() && !coachImage)}>
                                    <Send size={18}/>
                                </Button>
                            </div>
                            <div className="text-[10px] text-center text-slate-600">
                                AI can make mistakes. Review analysis carefully.
                            </div>
                        </div>
                    </Card>
                </div>
            )}
          </div>
        </main>
        
        <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        <AddTradeModal isOpen={isAddTradeOpen} onClose={() => setIsAddTradeOpen(false)} onSave={handleSaveTrade} accounts={accounts} currentAccountId={selectedAccount === 'all' ? accounts[0]?.id : selectedAccount} initialData={editingTrade} />
        <TradeDetailsModal trade={selectedTrade} onClose={() => setSelectedTrade(null)} onDelete={deleteTradeFromDb} onEdit={(t) => { setSelectedTrade(null); setEditingTrade(t); setIsAddTradeOpen(true); }} />
        <ConnectBrokerModal isOpen={isConnectOpen} onClose={() => setIsConnectOpen(false)} />
        
      </div>
    </ThemeContext.Provider>
  );
};

function formatCurrency(num: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
}

export default App;
