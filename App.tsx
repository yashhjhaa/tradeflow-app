
import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { Plus, BarChart2, BookOpen, Zap, LayoutGrid, Settings, Trash2, CheckCircle, XCircle, Menu, X, BrainCircuit, TrendingUp, LogOut, Newspaper, Layers, PieChart, ChevronUp, User as UserIcon, Camera, Upload, CheckSquare, ArrowRight, Image as ImageIcon, Calendar as CalendarIcon, Target, Activity, ChevronLeft, ChevronRight, Search, Shield, Bell, CreditCard, Sun, Moon, Maximize2, Globe, AlertTriangle, Send, Bot, Wand2, Sparkles, Battery, Flame, Edit2, Quote, Smile, Frown, Meh, Clock, Play, Pause, RotateCcw, Sliders, Lock, Mail, UserCheck, Wallet, Percent, DollarSign, Download, ChevronDown, Target as TargetIcon, Home, Check, Terminal, Copy, Monitor, Wifi, CloudLightning, Laptop, Hourglass, Scale, Filter, Info, Eye, Briefcase, FileText, AlertOctagon, Timer, Radio, ArrowUpRight, BookMarked, Calculator, PenTool, Lightbulb, Thermometer, Paperclip, Users, Heart, MessageCircle, Share2, Award, Trophy, Hash, ThumbsUp, ThumbsDown, Zap as ZapIcon, Loader2, RefreshCcw, FileSpreadsheet, AlertCircle, Mic, MicOff, StopCircle, Swords, Skull, Flame as FlameIcon, Palette, Gavel, RefreshCw, BarChart } from 'lucide-react';
import { Card, Button, Input, Select, Badge } from './components/UI';
import { EquityCurve, WinLossChart, PairPerformanceChart, DayOfWeekChart, StrategyChart, HourlyPerformanceChart, LongShortChart, TradeCalendar } from './components/Charts';
import { analyzeTradePsychology, analyzeTradeScreenshot, generatePerformanceReview, getLiveMarketNews, chatWithTradeCoach, parseTradeFromNaturalLanguage, generateTradingStrategy, critiqueTradingStrategy, analyzeDeepPsychology, generateStrategyChecklist, analyzeStrategyEdgeCases, transcribeAudioNote, validateTradeAgainstStrategy, generateChallengeMotivation } from './services/geminiService';
import { Trade, Account, DisciplineLog, CalendarEvent, TradeDirection, TradeOutcome, TradingSession, ChatMessage, DateRange, Challenge, ChallengeDay, ChallengeTask } from './types';
import { 
    subscribeToAuth, loginUser, logoutUser, registerUser, subscribeToTrades, 
    addTradeToDb, deleteTradeFromDb, subscribeToAccounts, 
    addAccountToDb, deleteAccountFromDb, updateAccountBalance, 
    subscribeToDiscipline, updateDisciplineLog, initializeTodayLog,
    uploadScreenshotToStorage, updateTradeInDb, resetPassword,
    subscribeToChallenge, startChallenge, updateChallenge
} from './services/dataService';
import { User } from 'firebase/auth';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';

export const ThemeContext = React.createContext({
  theme: 'dark',
  toggleTheme: () => {},
});

// --- HELPER UTILS ---
const compressImage = (base64Str: string, maxWidth = 1024, maxHeight = 1024) => {
  return new Promise<string>((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = () => {
        resolve(base64Str); // Fallback to original if load fails
    };
  });
};

const getStringSizeInBytes = (str: string) => new Blob([str]).size;

// Confetti Effect Helper
const fireConfetti = () => {
  const colors = ['#06b6d4', '#8b5cf6', '#10b981', '#f43f5e'];
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  if(!ctx) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles: any[] = [];
  for(let i=0; i<150; i++) {
    particles.push({
      x: canvas.width/2, y: canvas.height/2,
      vx: (Math.random() - 0.5) * 20,
      vy: (Math.random() - 0.5) * 20,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1, life: Math.random() * 50 + 50
    });
  }

  const animate = () => {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    let active = false;
    particles.forEach(p => {
      if(p.life > 0) {
        active = true;
        p.x += p.vx; p.y += p.vy; p.vy += 0.5; p.life--; p.alpha -= 0.01;
        ctx.globalAlpha = p.alpha; ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 6, 6);
      }
    });
    if(active) requestAnimationFrame(animate);
    else document.body.removeChild(canvas);
  };
  animate();
};

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

const Ticker = () => {
    const items = [
        { sym: 'EURUSD', val: '1.0842', chg: '+0.12%' },
        { sym: 'GBPUSD', val: '1.2650', chg: '-0.05%' },
        { sym: 'USDJPY', val: '150.20', chg: '+0.32%' },
        { sym: 'XAUUSD', val: '2035.40', chg: '+1.20%' },
        { sym: 'BTCUSD', val: '64,250', chg: '+4.50%' },
        { sym: 'ETHUSD', val: '3,450', chg: '+3.10%' },
        { sym: 'SPX500', val: '5,080', chg: '+0.80%' },
        { sym: 'NAS100', val: '17,950', chg: '+1.10%' },
    ];

    return (
        <div className="fixed bottom-[80px] md:bottom-0 left-0 right-0 h-8 bg-[#020305] border-t border-white/5 z-40 flex items-center overflow-hidden pointer-events-none">
            <div className="animate-marquee whitespace-nowrap flex gap-8 items-center text-xs font-mono">
                {[...items, ...items, ...items].map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                        <span className="font-bold text-slate-400">{item.sym}</span>
                        <span className="text-white">{item.val}</span>
                        <span className={item.chg.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}>{item.chg}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PositionSizeCalculator = () => {
    const [balance, setBalance] = useState(10000);
    const [riskPercent, setRiskPercent] = useState(1);
    const [stopLoss, setStopLoss] = useState(20);
    const [pairType, setPairType] = useState('USD'); // USD or JPY
    
    // Formula: RiskAmt / (SL * PipValue)
    // Approx Pip Value: Standard Lot ($10 for USD pairs), ~$7 for JPY pairs (simplified)
    const riskAmount = (balance * riskPercent) / 100;
    const pipValue = pairType === 'USD' ? 10 : 7; 
    const lots = riskAmount / (stopLoss * pipValue);

    return (
        <Card className="bg-gradient-to-br from-slate-900 to-slate-900/50 border-white/10">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
                <Calculator size={16} className="text-cyan-400"/> Position Sizing
            </h3>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] text-slate-500 font-bold uppercase">Account Balance</label>
                        <Input type="number" value={balance} onChange={e => setBalance(Number(e.target.value))} className="bg-black/40 h-10 text-sm" />
                    </div>
                    <div>
                         <label className="text-[10px] text-slate-500 font-bold uppercase">Risk %</label>
                         <Input type="number" value={riskPercent} onChange={e => setRiskPercent(Number(e.target.value))} className="bg-black/40 h-10 text-sm" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] text-slate-500 font-bold uppercase">Stop Loss (Pips)</label>
                        <Input type="number" value={stopLoss} onChange={e => setStopLoss(Number(e.target.value))} className="bg-black/40 h-10 text-sm" />
                    </div>
                    <div>
                         <label className="text-[10px] text-slate-500 font-bold uppercase">Pair Type</label>
                         <div className="flex bg-black/40 rounded-xl p-1 h-10">
                             <button onClick={() => setPairType('USD')} className={`flex-1 text-xs font-bold rounded-lg ${pairType === 'USD' ? 'bg-cyan-600 text-white' : 'text-slate-500'}`}>USD</button>
                             <button onClick={() => setPairType('JPY')} className={`flex-1 text-xs font-bold rounded-lg ${pairType === 'JPY' ? 'bg-purple-600 text-white' : 'text-slate-500'}`}>JPY</button>
                         </div>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                    <div className="text-xs text-slate-400">Risk: <span className="text-rose-400 font-bold">${riskAmount.toFixed(2)}</span></div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold">Lot Size</div>
                        <div className="text-2xl font-mono font-bold text-emerald-400">{lots.toFixed(2)}</div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

const Navigation: React.FC<{ activeTab: string; setActiveTab: (t: string) => void; onLogout: () => void }> = ({ activeTab, setActiveTab, onLogout }) => {
  const navItems = [
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'playbook', label: 'Playbook', icon: BookMarked },
    { id: 'challenges', label: 'Challenges', icon: Swords }, // NEW TAB
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

// --- SUB-COMPONENTS (MobileNav, BreathingExercise, etc.) ---

const MobileBottomNav: React.FC<{ activeTab: string; setActiveTab: (t: string) => void }> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'journal', icon: Home },
    { id: 'challenges', icon: Swords }, // Added Challenges here
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

// --- NEW CHALLENGE COMPONENTS ---
const FlameStreak: React.FC<{ streak: number }> = ({ streak }) => {
    // 0-3: Yellow (Spark) | 4-7: Orange (Flame) | 8+: Blue (Plasma)
    const getFlameColor = () => {
        if(streak >= 8) return 'text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]';
        if(streak >= 4) return 'text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.8)]';
        return 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]';
    };

    const getScale = () => Math.min(1 + (streak * 0.05), 1.5);

    return (
        <div className="flex flex-col items-center">
            <div className={`transition-all duration-500 ${getFlameColor()}`} style={{ transform: `scale(${getScale()})` }}>
                <FlameIcon size={32} fill="currentColor" className="animate-pulse-slow"/>
            </div>
            <span className="text-xs font-bold text-slate-400 mt-1">{streak} Day Streak</span>
        </div>
    );
};

const CreateChallengeModal: React.FC<{ isOpen: boolean; onClose: () => void; onCreate: (c: Partial<Challenge>) => void }> = ({ isOpen, onClose, onCreate }) => {
    const [step, setStep] = useState(1);
    const [draft, setDraft] = useState<Partial<Challenge>>({
        title: '', description: '', totalDays: 30, rules: [], 
        theme: 'custom', themeColor: 'cyan', stakes: ''
    });
    const [newTaskLabel, setNewTaskLabel] = useState('');
    const [newTaskType, setNewTaskType] = useState('manual');
    const [newTaskThresh, setNewTaskThresh] = useState(0);
    const [draftTasks, setDraftTasks] = useState<{label: string, type: string, thresh?: number}[]>([]);

    if (!isOpen) return null;

    const handleAddTask = () => {
        if (!newTaskLabel.trim()) return;
        setDraftTasks([...draftTasks, { label: newTaskLabel, type: newTaskType, thresh: newTaskThresh }]);
        setNewTaskLabel(''); setNewTaskType('manual'); setNewTaskThresh(0);
    };

    const handleCreate = () => {
        if (!draft.title) return alert("Title required");
        if (draftTasks.length === 0) return alert("Add at least one rule");
        
        // Convert draftTasks to the complex ChallengeTask structure for the days generation later
        // For now, pass them as a custom field or process in parent
        // We'll attach the tasks config to the draft for the parent to process
        onCreate({
            ...draft,
            // @ts-ignore - passing temp config to be processed
            taskConfig: draftTasks 
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl bg-[#0B0F19] border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.1)] flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                            <Wand2 className="text-cyan-400"/> Protocol Architect
                        </h2>
                        <p className="text-xs text-slate-400">Design your own discipline system.</p>
                    </div>
                    <button onClick={onClose}><X size={20} className="text-slate-500 hover:text-white"/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* Progress */}
                    <div className="flex items-center gap-2 mb-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`h-1 flex-1 rounded-full ${step >= i ? 'bg-cyan-500' : 'bg-slate-800'}`}></div>
                        ))}
                    </div>

                    {step === 1 && (
                        <div className="space-y-6 animate-slide-up">
                            <h3 className="text-lg font-bold text-white">Identity & Duration</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs uppercase font-bold text-slate-500">Protocol Name</label>
                                    <Input placeholder="e.g. Project 50, Monk Mode Ultra" value={draft.title} onChange={e => setDraft({...draft, title: e.target.value})} autoFocus/>
                                </div>
                                <div>
                                    <label className="text-xs uppercase font-bold text-slate-500">Manifesto (Description)</label>
                                    <Input placeholder="What is the goal? e.g. Total dopamine detox." value={draft.description} onChange={e => setDraft({...draft, description: e.target.value})}/>
                                </div>
                                <div>
                                    <label className="text-xs uppercase font-bold text-slate-500 flex justify-between">
                                        <span>Duration</span>
                                        <span className="text-cyan-400">{draft.totalDays} Days</span>
                                    </label>
                                    <input 
                                        type="range" min="7" max="100" value={draft.totalDays} 
                                        onChange={e => setDraft({...draft, totalDays: Number(e.target.value)})}
                                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                    />
                                    <div className="flex justify-between text-[10px] text-slate-600 mt-1"><span>7 Days</span><span>100 Days</span></div>
                                </div>
                                <div>
                                    <label className="text-xs uppercase font-bold text-slate-500">Visual Theme</label>
                                    <div className="flex gap-4 mt-2">
                                        {['cyan', 'purple', 'rose', 'amber'].map(color => (
                                            <button 
                                                key={color} 
                                                onClick={() => setDraft({...draft, themeColor: color})}
                                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${draft.themeColor === color ? 'border-white scale-110' : 'border-transparent opacity-50'}`}
                                                style={{ backgroundColor: `var(--color-${color}-500)` }} // Tailwind utility approximation
                                            >
                                                <div className={`w-full h-full rounded-full bg-${color}-500`}></div> 
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-slide-up">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2"><Gavel size={18}/> Tribunal Rules</h3>
                            <p className="text-sm text-slate-400">Define your daily tasks. Connect them to the "Tribunal" for auto-verification.</p>
                            
                            {/* Rule Builder */}
                            <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] uppercase font-bold text-slate-500">Rule Description</label>
                                        <Input placeholder="e.g. No trades after 11am" value={newTaskLabel} onChange={e => setNewTaskLabel(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-slate-500">Verification</label>
                                        <Select value={newTaskType} onChange={e => setNewTaskType(e.target.value)}>
                                            <option value="manual">Manual Check</option>
                                            <option value="max_loss">Max Daily Loss</option>
                                            <option value="max_trades">Max Trade Count</option>
                                            <option value="journal_all">Journal Check</option>
                                        </Select>
                                    </div>
                                </div>
                                {(newTaskType === 'max_loss' || newTaskType === 'max_trades') && (
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-slate-500">Limit / Threshold</label>
                                        <Input type="number" placeholder={newTaskType === 'max_loss' ? 'e.g. 500 ($)' : 'e.g. 3 (trades)'} value={newTaskThresh} onChange={e => setNewTaskThresh(Number(e.target.value))} />
                                    </div>
                                )}
                                <Button size="sm" variant="secondary" className="w-full" onClick={handleAddTask} disabled={!newTaskLabel}><Plus size={16}/> Add Rule to Protocol</Button>
                            </div>

                            {/* List */}
                            <div className="space-y-2">
                                {draftTasks.map((t, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                                            <span className="text-sm text-white">{t.label}</span>
                                            {t.type !== 'manual' && <Badge color="yellow">AUTO</Badge>}
                                        </div>
                                        <button onClick={() => setDraftTasks(prev => prev.filter((_, idx) => idx !== i))} className="text-slate-500 hover:text-rose-500"><Trash2 size={14}/></button>
                                    </div>
                                ))}
                                {draftTasks.length === 0 && <div className="text-center text-xs text-slate-600 py-4">No rules added yet.</div>}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-slide-up">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2"><Flame size={18}/> The Blood Oath</h3>
                            <div className="bg-gradient-to-br from-red-900/10 to-transparent border border-red-500/20 p-6 rounded-2xl text-center space-y-4">
                                <p className="text-slate-300 text-sm">I hereby commit to the <strong>{draft.title}</strong> protocol for {draft.totalDays} days.</p>
                                <div className="text-left bg-black/40 p-4 rounded-xl space-y-1">
                                    <div className="text-xs font-bold text-slate-500 uppercase mb-2">My Stakes (Optional)</div>
                                    <textarea 
                                        className="w-full bg-transparent border-none outline-none text-sm text-white placeholder:text-slate-600 resize-none" 
                                        placeholder="If I fail, I will donate $100 to charity..."
                                        rows={2}
                                        value={draft.stakes}
                                        onChange={e => setDraft({...draft, stakes: e.target.value})}
                                    />
                                </div>
                                <div className="flex gap-2 justify-center">
                                    {draftTasks.slice(0, 3).map((t,i) => <Badge key={i} color="gray">{t.label}</Badge>)}
                                    {draftTasks.length > 3 && <Badge color="gray">+{draftTasks.length - 3}</Badge>}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-white/5 flex justify-between">
                    {step > 1 ? (
                        <Button variant="ghost" onClick={() => setStep(s => s - 1)}>Back</Button>
                    ) : (
                        <div></div>
                    )}
                    {step < 3 ? (
                        <Button variant="primary" onClick={() => setStep(s => s + 1)}>Next Step <ArrowRight size={16} className="ml-2"/></Button>
                    ) : (
                        <Button variant="neon" onClick={handleCreate}>Initialize Protocol</Button>
                    )}
                </div>
            </Card>
        </div>
    );
};

const ShareableChallengeCard: React.FC<{ challenge: Challenge, user: string, winRate: string, pnl: number }> = ({ challenge, user, winRate, pnl }) => {
    return (
        <div id="share-card" className="w-[400px] h-[600px] bg-[#05070A] relative overflow-hidden flex flex-col p-8 border border-white/10 rounded-3xl">
            {/* Background Gradients */}
            <div className="absolute top-[-20%] left-[-20%] w-[300px] h-[300px] bg-cyan-500/20 rounded-full blur-[80px]"></div>
            <div className="absolute bottom-[-20%] right-[-20%] w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[80px]"></div>
            
            {/* Header */}
            <div className="relative z-10 flex justify-between items-start mb-12">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <AppLogo className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="font-display font-bold text-white text-lg">TradeFlow</h3>
                        <p className="text-xs text-slate-400 uppercase tracking-widest">Protocol Verified</p>
                    </div>
                </div>
                <div className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono text-cyan-400">
                    {new Date().toLocaleDateString()}
                </div>
            </div>

            {/* Main Stats */}
            <div className="relative z-10 flex-1 flex flex-col justify-center space-y-8">
                <div>
                    <h1 className="text-6xl font-display font-bold text-white mb-2">Day {challenge.currentDay}</h1>
                    <h2 className="text-2xl font-medium text-slate-400">{challenge.title}</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">Win Rate</div>
                        <div className="text-2xl font-mono font-bold text-emerald-400">{winRate}%</div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">Total PnL</div>
                        <div className={`text-2xl font-mono font-bold ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {pnl >= 0 ? '+' : ''}${pnl.toFixed(0)}
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-cyan-900/10 to-transparent border-l-2 border-cyan-500">
                    <p className="text-sm italic text-slate-300 font-serif">"Discipline is doing what needs to be done, even if you don't want to do it."</p>
                </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 mt-auto flex items-center gap-3 pt-6 border-t border-white/5">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white">
                    {user[0]}
                </div>
                <span className="text-sm font-bold text-slate-300">{user}</span>
                <div className="ml-auto text-xs text-slate-500">#TradeFlowChallenge</div>
            </div>
        </div>
    );
};

const AddAccountModal: React.FC<{ isOpen: boolean; onClose: () => void; onAdd: (a: Partial<Account>) => void }> = ({ isOpen, onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [broker, setBroker] = useState('');
    const [balance, setBalance] = useState('10000');
    const [currency, setCurrency] = useState('USD');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if(!name || !broker) return alert("Please fill all fields");
        onAdd({ name, broker, balance: Number(balance), currency });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
             <Card className="w-full max-w-md bg-[#0B0F19] border-white/10 shadow-2xl">
                 <div className="flex justify-between items-center mb-6">
                     <h2 className="text-xl font-bold text-white">Add Trading Account</h2>
                     <button onClick={onClose}><X size={20} className="text-slate-500 hover:text-white"/></button>
                 </div>
                 <div className="space-y-4">
                     <div><label className="text-xs uppercase font-bold text-slate-500">Account Name</label><Input placeholder="e.g. Prop Firm Challenge" value={name} onChange={e => setName(e.target.value)} autoFocus /></div>
                     <div><label className="text-xs uppercase font-bold text-slate-500">Broker / Firm</label><Input placeholder="e.g. FTMO, IC Markets" value={broker} onChange={e => setBroker(e.target.value)} /></div>
                     <div className="grid grid-cols-2 gap-4">
                         <div><label className="text-xs uppercase font-bold text-slate-500">Initial Balance</label><Input type="number" value={balance} onChange={e => setBalance(e.target.value)} /></div>
                         <div>
                             <label className="text-xs uppercase font-bold text-slate-500">Currency</label>
                             <Select value={currency} onChange={e => setCurrency(e.target.value)}>
                                 <option value="USD">USD</option>
                                 <option value="EUR">EUR</option>
                                 <option value="GBP">GBP</option>
                             </Select>
                         </div>
                     </div>
                     <Button variant="neon" className="w-full mt-2" onClick={handleSubmit}>Create Account</Button>
                 </div>
             </Card>
        </div>
    );
};

// ... (BreathingExercise, CooldownModal, WelcomeToast, LoginScreen code remains same) ...
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

const CooldownModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [secondsLeft, setSecondsLeft] = useState(60);
    
    useEffect(() => {
        if (!isOpen) { setSecondsLeft(60); return; }
        const timer = setInterval(() => {
            setSecondsLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-xl">
             <div className="w-full max-w-lg bg-[#0B0F19] rounded-3xl border border-rose-500/30 p-8 text-center shadow-[0_0_50px_rgba(244,63,94,0.3)] animate-blob">
                 <div className="flex justify-center mb-6">
                     <AlertTriangle size={64} className="text-rose-500 animate-pulse" />
                 </div>
                 <h2 className="text-3xl font-display font-bold text-white mb-2">TILT PROTOCOL ENGAGED</h2>
                 <p className="text-rose-400 font-bold uppercase tracking-widest mb-8">Daily Loss Limit Exceeded</p>
                 
                 <div className="bg-black/40 rounded-2xl p-6 border border-white/5 mb-8">
                     <BreathingExercise />
                 </div>

                 <p className="text-slate-400 text-sm mb-6">
                    You are psychologically compromised. The terminal is locked until you regulate your nervous system.
                 </p>

                 <Button 
                    variant={secondsLeft > 0 ? 'secondary' : 'neon'} 
                    className="w-full"
                    disabled={secondsLeft > 0}
                    onClick={onClose}
                 >
                     {secondsLeft > 0 ? `Unlock in ${secondsLeft}s` : 'I Am Calm. Resume.'}
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
    const [quote, setQuote] = useState('');

    useEffect(() => {
        const quotes = [
            "We suffer more often in imagination than in reality. – Seneca",
            "The market is a device for transferring money from the impatient to the patient. – Warren Buffett",
            "Discipline is doing what needs to be done, even if you don't want to do it.",
            "Amateurs think about how much they can make. Professionals think about how much they can lose.",
            "Risk comes from not knowing what you're doing."
        ];
        setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, []);
    
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
                
                {/* Stoic Quote */}
                <div className="mt-8 text-center animate-fade-in px-4">
                    <p className="text-xs font-mono text-slate-500 italic">"{quote}"</p>
                </div>
            </div>
        </div>
    );
};

// ... (AddTradeModal, TradeDetailsModal, ConnectBrokerModal remain same) ...
const AddTradeModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (t: Partial<Trade>) => void; accounts: Account[]; currentAccountId: string; initialData?: Partial<Trade>; playbookEntries: PlaybookEntry[] }> = ({ isOpen, onClose, onSave, accounts, currentAccountId, initialData, playbookEntries }) => {
    // ... [Original code] ...
     const [formData, setFormData] = useState<Partial<Trade>>({
        pair: '', direction: TradeDirection.BUY, outcome: TradeOutcome.PENDING, 
        pnl: 0, notes: '', session: TradingSession.NY, setup: '', riskPercentage: 1, 
        date: new Date().toISOString().split('T')[0], tags: [], accountId: currentAccountId, ...initialData
    });
    const [screenshotPreview, setScreenshotPreview] = useState(initialData?.screenshot || '');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [selectedStrategyId, setSelectedStrategyId] = useState('');
    const [checklist, setChecklist] = useState<{id: string, text: string, checked: boolean}[]>([]);
    const [newChecklistItem, setNewChecklistItem] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    // Ensure accountId is set
    useEffect(() => {
        if (!formData.accountId && accounts.length > 0) {
            setFormData(prev => ({ ...prev, accountId: accounts[0].id }));
        }
    }, [accounts, formData.accountId]);

    useEffect(() => { 
        setFormData({ 
            pair: '', direction: TradeDirection.BUY, outcome: TradeOutcome.PENDING, 
            pnl: 0, notes: '', session: TradingSession.NY, setup: '', riskPercentage: 1, 
            date: new Date().toISOString().split('T')[0], tags: [], accountId: currentAccountId, ...initialData 
        }); 
        setScreenshotPreview(initialData?.screenshot || ''); 
    }, [initialData, isOpen, currentAccountId]);

    useEffect(() => {
        if (selectedStrategyId) {
            const strat = playbookEntries.find(p => p.id === selectedStrategyId);
            if (strat && strat.checklist) {
                setChecklist(strat.checklist.map((item, i) => ({ id: `strat-${i}`, text: item, checked: false })));
            } else {
                setChecklist([]);
            }
        } else {
            setChecklist([]);
        }
    }, [selectedStrategyId, playbookEntries]);

    if (!isOpen) return null;

    const handleScreenshot = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const rawBase64 = reader.result as string;
                // Compress immediately upon selection for preview and storage
                const compressed = await compressImage(rawBase64);
                setScreenshotPreview(compressed);
            };
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

    const toggleCheckItem = (id: string) => {
        setChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
    };

    const addCustomCheckItem = () => {
        if (newChecklistItem.trim()) {
            setChecklist(prev => [...prev, { id: `custom-${Date.now()}`, text: newChecklistItem, checked: false }]);
            setNewChecklistItem('');
        }
    };

    const deleteCheckItem = (id: string) => {
        setChecklist(prev => prev.filter(i => i.id !== id));
    }
    
    // Voice to Journal
    const toggleRecording = async () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                const audioChunks: Blob[] = [];

                mediaRecorder.ondataavailable = (event) => {
                    audioChunks.push(event.data);
                };

                mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    // Convert to base64
                    const reader = new FileReader();
                    reader.readAsDataURL(audioBlob);
                    reader.onloadend = async () => {
                        const base64Audio = reader.result as string;
                        setIsAnalyzing(true);
                        const result = await transcribeAudioNote(base64Audio);
                        setFormData(prev => ({
                            ...prev, 
                            notes: (prev.notes ? prev.notes + '\n' : '') + result.text,
                            tags: result.sentiment ? [...(prev.tags || []), result.sentiment] : prev.tags
                        }));
                        setIsAnalyzing(false);
                    };
                    stream.getTracks().forEach(track => track.stop());
                };

                mediaRecorder.start();
                mediaRecorderRef.current = mediaRecorder;
                setIsRecording(true);
            } catch (err) {
                console.error("Error accessing microphone:", err);
                alert("Microphone access denied or unavailable.");
            }
        }
    };

    const handleSaveClick = async () => {
        if (!formData.pair || !formData.date) {
            alert("Please fill in Pair and Date.");
            return;
        }
        if (!formData.accountId) {
             alert("Please select an Account.");
             return;
        }

        const incompleteItems = checklist.filter(i => !i.checked);
        if (incompleteItems.length > 0) {
            alert(`Please complete your execution checklist:\n\n${incompleteItems.map(i => "• " + i.text).join('\n')}`);
            return;
        }

        // GHOST VALIDATOR
        if (selectedStrategyId) {
            const strategy = playbookEntries.find(p => p.id === selectedStrategyId);
            if (strategy) {
                setIsSaving(true);
                const validation = await validateTradeAgainstStrategy(formData, strategy.content);
                setIsSaving(false);
                if (!validation.valid) {
                    if (!confirm(`GHOST WARNING: This trade violates your strategy "${strategy.title}".\n\nReason: ${validation.reason}\n\nAre you sure you want to proceed?`)) {
                        return;
                    }
                }
            }
        }

        setIsSaving(true);
        await onSave({ ...formData, screenshot: screenshotPreview, accountId: formData.accountId });
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
                    
                    {/* Account Selector */}
                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">Account</label>
                        <Select value={formData.accountId} onChange={e => setFormData({...formData, accountId: e.target.value})} className="bg-slate-900 border-white/10">
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name} ({acc.broker})</option>
                            ))}
                        </Select>
                    </div>

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
                        <label className="text-xs text-slate-400 mb-1 block flex justify-between">
                            <span>Strategy (Ghost Validator)</span>
                            <span className="text-purple-400 font-bold">AI Compliance Check</span>
                        </label>
                        <Select value={selectedStrategyId} onChange={e => setSelectedStrategyId(e.target.value)} className="bg-slate-900 border-white/10 text-white">
                            <option value="">No Strategy Selected</option>
                            {playbookEntries.map(p => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                        </Select>
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

                    <div className="relative">
                        <div className="flex justify-between items-center mb-1">
                             <label className="text-xs text-slate-400">Notes & Analysis</label>
                             <button 
                                onClick={toggleRecording} 
                                className={`text-xs flex items-center gap-1 px-2 py-0.5 rounded-full transition-all ${isRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                                 {isRecording ? <><StopCircle size={12}/> Recording...</> : <><Mic size={12}/> Voice Note</>}
                             </button>
                        </div>
                        <textarea 
                            className="w-full h-24 bg-slate-900 border border-white/10 rounded-xl p-4 text-white resize-none focus:ring-1 focus:ring-cyan-500 outline-none" 
                            placeholder="Why did you take this trade?"
                            value={formData.notes}
                            onChange={e => setFormData({...formData, notes: e.target.value})}
                        />
                    </div>

                    <Button variant="neon" className="w-full" onClick={handleSaveClick} disabled={isSaving}>
                        {isSaving ? <><Loader2 className="animate-spin" size={18}/> Saving...</> : 'Save to Journal'}
                    </Button>
                </div>
                {/* Media */}
                 <div className="p-8 bg-slate-900/50 border-l border-white/5 w-full md:w-[350px] space-y-6 flex flex-col">
                     <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Pre-Flight</h3>
                     
                     {/* Execution Checklist */}
                     <div className="bg-slate-800/30 rounded-xl border border-white/5 p-4 flex-1 overflow-y-auto min-h-[200px]">
                         <h4 className="text-xs font-bold text-emerald-400 mb-3 flex items-center gap-2">
                             <CheckSquare size={12}/> Execution Checklist
                         </h4>
                         <div className="space-y-2">
                             {checklist.map(item => (
                                 <label key={item.id} className="flex items-start gap-2 cursor-pointer group">
                                     <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${item.checked ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600 group-hover:border-cyan-500'}`}>
                                         {item.checked && <Check size={10} className="text-white" />}
                                     </div>
                                     <input type="checkbox" checked={item.checked} onChange={() => toggleCheckItem(item.id)} className="hidden" />
                                     <span className={`text-xs ${item.checked ? 'text-slate-500 line-through' : 'text-slate-300'}`}>{item.text}</span>
                                     <button onClick={(e) => { e.stopPropagation(); deleteCheckItem(item.id); }} className="ml-auto text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100"><X size={12}/></button>
                                 </label>
                             ))}
                             {checklist.length === 0 && <p className="text-xs text-slate-600 italic">No checklist items.</p>}
                         </div>
                         <div className="mt-3 pt-3 border-t border-white/5 flex gap-2">
                             <input 
                                className="bg-transparent text-xs text-white border-none outline-none flex-1 placeholder:text-slate-600"
                                placeholder="+ Add item..."
                                value={newChecklistItem}
                                onChange={e => setNewChecklistItem(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addCustomCheckItem()}
                             />
                             <button onClick={addCustomCheckItem} className="text-cyan-500 hover:text-cyan-400"><Plus size={14}/></button>
                         </div>
                     </div>

                     <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-4">Evidence</h3>
                     
                     <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                         {screenshotPreview ? (
                             <img src={screenshotPreview} alt="Chart" className="w-full h-32 object-cover rounded-xl border border-white/10" />
                         ) : (
                             <div className="w-full h-32 bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 gap-2 hover:bg-slate-800 hover:border-cyan-500 transition-colors">
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
                </div>
            </div>
        </div>
    );
};
const TradeDetailsModal: React.FC<{ trade: Trade | null; onClose: () => void; onDelete: (id: string) => void; onEdit: (t: Trade) => void; onAnalyze: (t: Trade) => void }> = ({ trade, onClose, onDelete, onEdit, onAnalyze }) => {
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
                         {trade.aiAnalysis ? (
                             <div>
                                <h4 className="text-sm font-bold text-cyan-400 mb-2 flex items-center gap-2"><Bot size={14}/> Coach's Insight</h4>
                                <div className="text-sm text-cyan-100/80 bg-cyan-900/10 border border-cyan-500/20 p-4 rounded-xl prose prose-invert max-w-none">
                                    <pre className="whitespace-pre-wrap font-sans bg-transparent border-0 p-0 text-xs">{trade.aiAnalysis}</pre>
                                </div>
                                <Button size="sm" variant="ghost" onClick={() => onAnalyze(trade)} className="mt-2 w-full text-xs text-cyan-500/50 hover:text-cyan-400">Regenerate Analysis</Button>
                             </div>
                         ) : (
                             <Button size="sm" variant="secondary" onClick={() => onAnalyze(trade)} className="w-full">
                                <Sparkles size={14} className="mr-2"/> Generate AI Analysis
                             </Button>
                         )}
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

interface PlaybookEntry {
    id: string;
    title: string;
    content: string;
    rating?: string;
    image?: string;
    checklist?: string[];
    dangerZones?: string;
    tags?: string[];
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('journal');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [disciplineLogs, setDisciplineLogs] = useState<DisciplineLog[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [isAddTradeOpen, setIsAddTradeOpen] = useState(false);
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [editingTrade, setEditingTrade] = useState<Partial<Trade> | undefined>(undefined);
  const [magicCmd, setMagicCmd] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false); // FOR SHARING
  const [isCreateChallengeOpen, setIsCreateChallengeOpen] = useState(false); // FOR CUSTOM CHALLENGES
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false); // FOR ADDING ACCOUNTS

  // Realtime Clock State
  const [currentTime, setCurrentTime] = useState(new Date());

  // Red Folder Data
  const [marketNews, setMarketNews] = useState<{sentiment: string, events: CalendarEvent[]}>({ sentiment: 'Loading...', events: [] });
  const [refreshNews, setRefreshNews] = useState(0);

  // Playbook State
  const [strategyInput, setStrategyInput] = useState('');
  const [playbookEntries, setPlaybookEntries] = useState<PlaybookEntry[]>([]);
  const [generatingStrat, setGeneratingStrat] = useState(false);
  const [strategyMode, setStrategyMode] = useState<'ai' | 'manual'>('ai');
  const [manualStratTitle, setManualStratTitle] = useState('');
  const [manualStratRules, setManualStratRules] = useState('');
  const [manualStratImage, setManualStratImage] = useState<string | null>(null);
  const stratFileRef = useRef<HTMLInputElement>(null);

  // Challenge State
  const [challengeMotivation, setChallengeMotivation] = useState('');
  const [showSergeant, setShowSergeant] = useState(false); // AI Sergeant Modal

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
  
  // Loading state for saving
  const [isSavingTrade, setIsSavingTrade] = useState(false);
  
  // Tilt Blocker State
  const [isCooldownOpen, setIsCooldownOpen] = useState(false);

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
        const unsubChallenge = subscribeToChallenge(user.uid, setActiveChallenge);
        return () => { unsubTrades(); unsubAccounts(); unsubDisc(); unsubChallenge(); };
    }
  }, [user]);

  useEffect(() => {
      if (activeChallenge) {
          generateChallengeMotivation(activeChallenge.currentDay, activeChallenge.title).then(setChallengeMotivation);
      }
  }, [activeChallenge?.currentDay]);

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
      const hour = parseInt(new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone: city === 'New York' ? 'America/New_York' : city === 'London' ? 'Europe/London' : city === 'Tokyo' ? 'Asia/Tokyo' : 'Australia/Sydney' }).format(currentTime));
      if (city === 'New York') return (hour >= 8 && hour < 17) ? 'OPEN' : 'CLOSED';
      if (city === 'London') return (hour >= 8 && hour < 16) ? 'OPEN' : 'CLOSED';
      if (city === 'Tokyo') return (hour >= 9 && hour < 15) ? 'OPEN' : 'CLOSED';
      if (city === 'Sydney') return (hour >= 10 && hour < 16) ? 'OPEN' : 'CLOSED';
      return 'CLOSED';
  };
  
  const todayStr = new Date().toISOString().split('T')[0];
  const dailyPnL = trades
    .filter(t => t.date.startsWith(todayStr))
    .reduce((acc, t) => acc + (t.pnl || 0), 0);
  const tiltLimit = -500;
  const isTiltLocked = dailyPnL <= tiltLimit;

  // --- THE TRIBUNAL: AUTO-VERIFY CHALLENGE TASKS ---
  useEffect(() => {
      if (!activeChallenge) return;
      
      const checkTribunal = async () => {
          let updatedNeeded = false;
          const currentDayObj = activeChallenge.days.find(d => d.dayNumber === activeChallenge.currentDay);
          if (!currentDayObj) return;

          const updatedTasks = currentDayObj.tasks.map(task => {
              if (task.completed || task.status === 'failed') return task; // Already done/failed

              if (task.verificationType === 'max_loss') {
                  const limit = task.threshold || 0;
                  if (dailyPnL <= -limit) {
                      updatedNeeded = true;
                      return { ...task, completed: false, status: 'failed' };
                  }
                  if (dailyPnL > -limit) return { ...task, status: 'passing' };
              }

              if (task.verificationType === 'max_trades') {
                  const limit = task.threshold || 100;
                  const todayTradesCount = trades.filter(t => t.date.startsWith(todayStr)).length;
                  if (todayTradesCount > limit) {
                      updatedNeeded = true;
                      return { ...task, completed: false, status: 'failed' };
                  }
                  return { ...task, status: 'passing' };
              }
              
              if (task.verificationType === 'journal_all') {
                  const todayTrades = trades.filter(t => t.date.startsWith(todayStr));
                  if (todayTrades.length > 0 && todayTrades.every(t => t.notes && t.notes.length > 10)) {
                      // Only mark completed if explicitly checked? Or auto-complete? 
                      // Let's mark status passing, user must still check or we auto-complete at end of day.
                      // For "Journal Check", let's make it auto-complete if true.
                      if (!task.completed) {
                           updatedNeeded = true;
                           return { ...task, completed: true, status: 'completed' };
                      }
                  }
              }

              return task;
          });

          if (updatedNeeded) {
              const updatedDays = activeChallenge.days.map(d => d.dayNumber === activeChallenge.currentDay ? { ...d, tasks: updatedTasks as any } : d);
              await updateChallenge({ ...activeChallenge, days: updatedDays });
          }
      };

      const timer = setInterval(checkTribunal, 5000); // Check every 5s
      checkTribunal(); // Initial check
      return () => clearInterval(timer);
  }, [trades, activeChallenge, dailyPnL]);

  // --- XP & GAMIFICATION ---
  const calculateXP = () => {
      if (!activeChallenge) return 0;
      let completedCount = 0;
      activeChallenge.days.forEach(d => {
          completedCount += d.tasks.filter(t => t.completed).length;
      });
      return completedCount * 100;
  };
  
  const currentXP = calculateXP();
  const currentLevel = Math.floor(currentXP / 1000) + 1;
  const xpProgress = (currentXP % 1000) / 10; // 0-100%

  // Milestones
  useEffect(() => {
      if (activeChallenge) {
          if ([7, 14, 30, 75].includes(activeChallenge.currentDay)) {
              fireConfetti();
          }
      }
  }, [activeChallenge?.currentDay]);
  
  const handleNewTradeClick = () => {
      if (isTiltLocked) {
          setIsCooldownOpen(true);
      } else {
          setEditingTrade(undefined); 
          setIsAddTradeOpen(true);
      }
  };

  const handleSaveTrade = async (tradeData: Partial<Trade>) => {
      if (!user) {
          alert("Please sign in to log trades.");
          return;
      }
      const accountId = tradeData.accountId || accounts[0]?.id || 'demo';
      setIsSavingTrade(true);
      
      try {
          // 1. Upload Screenshot (Blocking for data integrity)
          let finalScreenshot = tradeData.screenshot;
          if (tradeData.screenshot && tradeData.screenshot.startsWith('data:image')) {
               const url = await uploadScreenshotToStorage(tradeData.screenshot, user.uid);
               if (url) { finalScreenshot = url; } else {
                   // Fallback for failed upload - check size limits
                   const size = getStringSizeInBytes(tradeData.screenshot);
                   if (size > 800000) { 
                       finalScreenshot = undefined; 
                       console.warn("Screenshot upload failed and too large for Firestore."); 
                   } else { 
                       finalScreenshot = tradeData.screenshot; 
                   }
               }
          }

          const tradeToSave = { ...tradeData, screenshot: finalScreenshot };

          if (tradeToSave.id) {
              await updateTradeInDb(tradeToSave as Trade);
          } else {
              // New Trade Logic
              let outcome = tradeToSave.outcome || TradeOutcome.PENDING;
              if (tradeToSave.pnl) { 
                  outcome = tradeToSave.pnl > 0 ? TradeOutcome.WIN : tradeToSave.pnl < 0 ? TradeOutcome.LOSS : TradeOutcome.BREAKEVEN; 
              }
              const newTrade: any = { ...tradeToSave, date: tradeToSave.date || new Date().toISOString(), userId: user.uid, accountId, outcome, tags: tradeToSave.tags || [] };
              
              // 2. Save to Firestore (Blocking)
              const savedId = await addTradeToDb(newTrade, user.uid);

              // 3. AI Analysis (BACKGROUND - Non-blocking for speed)
              if (newTrade.notes && !newTrade.aiAnalysis) { 
                  analyzeTradePsychology(newTrade).then(async (analysis) => { 
                      await updateTradeInDb({ ...newTrade, id: savedId, aiAnalysis: analysis }); 
                  }).catch(console.error); 
              }

              // 4. Update Balance (Blocking - fast)
              if (newTrade.pnl) { 
                  const acc = accounts.find(a => a.id === accountId); 
                  if (acc) await updateAccountBalance(accountId, acc.balance + newTrade.pnl); 
              }
          }
          
          setIsAddTradeOpen(false); 
          setEditingTrade(undefined); 
          // Quick alert without blocking the UI rendering cycle heavily
          setTimeout(() => alert("Trade Saved!"), 100); 

      } catch (error) { 
          console.error("Failed to save trade", error); 
          alert("Failed to save trade."); 
      } finally { 
          setIsSavingTrade(false); 
      }
  };

  const handleAddAccount = async (accountData: Partial<Account>) => {
      if (!user) return;
      await addAccountToDb(accountData as Account, user.uid);
  }
  
  const handleAnalyzeTrade = async (trade: Trade) => {
      setSelectedTrade({ ...trade, aiAnalysis: "Analyzing..." });
      try {
          const analysis = await analyzeTradePsychology(trade);
          const updatedTrade = { ...trade, aiAnalysis: analysis };
          await updateTradeInDb(updatedTrade);
          setSelectedTrade(updatedTrade);
      } catch (e) { console.error(e); setSelectedTrade({ ...trade, aiAnalysis: "Failed." }); }
  };

  const handleMagicCommand = async (e: React.FormEvent) => {
      e.preventDefault(); if (!magicCmd.trim()) return;
      const parsed = await parseTradeFromNaturalLanguage(magicCmd);
      setEditingTrade(parsed); setMagicCmd(''); setIsAddTradeOpen(true);
  };

  const handleGenerateStrategy = async () => {
      if (!strategyInput.trim()) return;
      setGeneratingStrat(true);
      const stratContent = await generateTradingStrategy(strategyInput);
      const checklist = await generateStrategyChecklist(stratContent);
      const dangerZones = await analyzeStrategyEdgeCases(stratContent);
      setPlaybookEntries([...playbookEntries, { id: Date.now().toString(), title: strategyInput, content: stratContent, checklist, dangerZones }]);
      setStrategyInput(''); setGeneratingStrat(false);
  };
  
  const handleManualStrategy = async () => {
      if (!manualStratTitle.trim() || !manualStratRules.trim()) return;
      setGeneratingStrat(true);
      const critique = await critiqueTradingStrategy(manualStratRules);
      const checklist = await generateStrategyChecklist(manualStratRules);
      const dangerZones = await analyzeStrategyEdgeCases(manualStratRules);
      setPlaybookEntries([...playbookEntries, { id: Date.now().toString(), title: manualStratTitle, content: manualStratRules, rating: critique, image: manualStratImage || undefined, checklist, dangerZones }]);
      setManualStratTitle(''); setManualStratRules(''); setManualStratImage(null); setGeneratingStrat(false);
  }

  const handleStrategyImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = async () => {
              const raw = reader.result as string;
              const compressed = await compressImage(raw);
              setManualStratImage(compressed);
          };
          reader.readAsDataURL(file);
      }
  };
  
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

  // --- CHALLENGE HANDLERS ---
  const handleStartChallenge = async (type: 'monk' | 'iron' | 'savage') => {
      if (!user) return;
      
      // Verification types mapped to templates
      const templates = {
          monk: { 
              title: "Monk Mode Protocol", days: 7, desc: "A 7-day reset. Focus on meditation and selective trading.", 
              tasks: [
                  { label: "10m Meditation", type: 'manual' },
                  { label: "Max 3 Trades/Day", type: 'max_trades', thresh: 3 },
                  { label: "Journal All Trades", type: 'journal_all' }
              ] 
          },
          iron: { 
              title: "Iron Risk 30", days: 30, desc: "Strict risk management check. Violate once, start over.", 
              tasks: [
                  { label: "Max Loss $500", type: 'max_loss', thresh: 500 },
                  { label: "Review Playbook", type: 'manual' },
                  { label: "Cold Shower", type: 'manual' }
              ] 
          },
          savage: { 
              title: "Trader 75 Hard", days: 75, desc: "The ultimate test of discipline and grit.", 
              tasks: [
                  { label: "Workout 2x/day", type: 'manual' },
                  { label: "Max Loss $250", type: 'max_loss', thresh: 250 },
                  { label: "Trade A+ Setups Only", type: 'manual' },
                  { label: "Read 10 Pages", type: 'manual' }
              ] 
          }
      };
      const t = templates[type];
      
      const newChallenge: Challenge = {
          id: Date.now().toString(),
          userId: user.uid,
          title: t.title,
          description: t.desc,
          totalDays: t.days,
          startDate: new Date().toISOString(),
          currentDay: 1,
          status: 'active',
          rules: t.tasks.map(task => task.label),
          theme: type,
          xp: 0,
          days: Array.from({ length: t.days }, (_, i) => ({
              dayNumber: i + 1,
              date: new Date(Date.now() + i * 86400000).toISOString(),
              tasks: t.tasks.map((r, ri) => ({ 
                  id: `${i}_${ri}`, 
                  label: r.label, 
                  completed: false,
                  verificationType: r.type as any,
                  threshold: r.thresh,
                  status: 'pending'
              })),
              status: 'pending'
          }))
      };
      
      await startChallenge(newChallenge, user.uid);
  };
  
  const handleCreateCustomChallenge = async (custom: any) => {
      if (!user) return;
      const tasksConfig = custom.taskConfig as {label: string, type: string, thresh?: number}[];
      
      const newChallenge: Challenge = {
          id: Date.now().toString(),
          userId: user.uid,
          title: custom.title,
          description: custom.description,
          totalDays: custom.totalDays,
          startDate: new Date().toISOString(),
          currentDay: 1,
          status: 'active',
          rules: tasksConfig.map(t => t.label),
          theme: 'custom',
          themeColor: custom.themeColor,
          stakes: custom.stakes,
          xp: 0,
          days: Array.from({ length: custom.totalDays }, (_, i) => ({
              dayNumber: i + 1,
              date: new Date(Date.now() + i * 86400000).toISOString(),
              tasks: tasksConfig.map((r, ri) => ({ 
                  id: `${i}_${ri}`, 
                  label: r.label, 
                  completed: false,
                  verificationType: r.type as any,
                  threshold: r.thresh,
                  status: 'pending'
              })),
              status: 'pending'
          }))
      };
      
      await startChallenge(newChallenge, user.uid);
  };
  
  const handleChallengeTaskToggle = async (dayIdx: number, taskId: string) => {
      if (!activeChallenge) return;
      const updatedDays = [...activeChallenge.days];
      const day = updatedDays[dayIdx];
      const task = day.tasks.find(t => t.id === taskId);
      
      if (task) {
          // Tribunal Override: Don't allow manual toggle if failed by system
          if (task.status === 'failed') {
              alert("Tribunal Lock: This task has been failed by the system based on your trading data.");
              return;
          }
          task.completed = !task.completed;
          if(task.completed) task.status = 'completed';
          else task.status = 'pending';
      }
      
      // Update status if all completed
      if (day.tasks.every(t => t.completed)) day.status = 'completed';
      else day.status = 'active'; // or pending
      
      await updateChallenge({ ...activeChallenge, days: updatedDays });
  };
  
  const handleChallengeFail = async () => {
       if (!activeChallenge || !user) return;
       if (confirm("Resetting Challenge to Day 1. Are you sure?")) {
           await updateChallenge({ ...activeChallenge, status: 'failed' });
           // Re-start same challenge logic could be applied here
           alert("Challenge Failed. Restart when you are ready.");
           setActiveChallenge(null);
       }
  };
  
  const handleResetChallenge = async () => {
      if (!activeChallenge || !user) return;
      if (confirm("⚠️ ABORT PROTOCOL: This will permanently abandon your current challenge. You cannot undo this.\n\nAre you sure you want to quit?")) {
          await updateChallenge({ ...activeChallenge, status: 'failed' });
          setActiveChallenge(null);
      }
  };


  // ... (handleCoachUpload, handleCoachSend, handleExportCSV, handleLogout)
  // Re-including for completeness of file
  const handleCoachUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) { const reader = new FileReader(); reader.onloadend = async () => { const raw = reader.result as string; const compressed = await compressImage(raw); setCoachImage(compressed); }; reader.readAsDataURL(file); }
  };

  const handleCoachSend = async () => {
      if (!coachInput.trim() && !coachImage) return;
      const newMessage: ChatMessage = { id: Date.now().toString(), role: 'user', text: coachInput, image: coachImage || undefined, timestamp: Date.now() };
      setCoachMessages(prev => [...prev, newMessage]);
      const currentInput = coachInput; const currentImage = coachImage || undefined; setCoachInput(''); setCoachImage(null); setCoachLoading(true);
      const responseText = await chatWithTradeCoach(coachMessages, currentInput, currentImage);
      const aiResponse: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', text: responseText, timestamp: Date.now() };
      setCoachMessages(prev => [...prev, aiResponse]); setCoachLoading(false);
  };

  const handleExportCSV = () => {
      if (trades.length === 0) return;
      const headers = ["Date", "Pair", "Direction", "Outcome", "PnL", "Session", "Setup", "Notes"];
      const rows = trades.map(t => [ t.date.split('T')[0], t.pair, t.direction, t.outcome, t.pnl, t.session, t.setup || '', `"${(t.notes || '').replace(/"/g, '""')}"` ]);
      const csvContent = [ headers.join(","), ...rows.map(r => r.join(",")) ].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a"); link.setAttribute("href", url); link.setAttribute("download", `trade_export_${new Date().toISOString().split('T')[0]}.csv`); document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const handleLogout = async () => { await logoutUser(); setTrades([]); setAccounts([]); };
  if (!user) return <LoginScreen onLogin={() => {}} />;

  const filteredTrades = selectedAccount === 'all' ? trades : trades.filter(t => t.accountId === selectedAccount);
  const tradesByDate: Record<string, Trade[]> = {};
  filteredTrades.forEach(t => { const dateStr = t.date.split('T')[0]; if (!tradesByDate[dateStr]) tradesByDate[dateStr] = []; tradesByDate[dateStr].push(t); });
  const sortedDates = Object.keys(tradesByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  const totalPnL = filteredTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
  const totalTrades = filteredTrades.length;
  const wins = filteredTrades.filter(t => t.outcome === TradeOutcome.WIN).length;
  const losses = filteredTrades.filter(t => t.outcome === TradeOutcome.LOSS).length;
  const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : "0.0";
  const avgWin = wins > 0 ? filteredTrades.filter(t => t.outcome === TradeOutcome.WIN).reduce((a, t) => a + (t.pnl||0), 0) / wins : 0;
  const avgLoss = losses > 0 ? Math.abs(filteredTrades.filter(t => t.outcome === TradeOutcome.LOSS).reduce((a, t) => a + (t.pnl||0), 0) / losses) : 1;
  const avgRR = (avgWin / (avgLoss || 1)).toFixed(2);
  const communityPosts = [ { id: 1, user: 'CryptoKing', time: 'Just now', pair: 'BTCUSD', direction: 'LONG', roi: '+12.5%', image: 'https://images.unsplash.com/photo-1611974765270-ca12586343bb?auto=format&fit=crop&q=80&w=600', likes: 24, comments: 5 }, { id: 2, user: 'ForexSniper', time: '2m ago', pair: 'EURUSD', direction: 'SHORT', roi: '+4.2%', image: 'https://images.unsplash.com/photo-1535320903710-d9cf113d2054?auto=format&fit=crop&q=80&w=600', likes: 11, comments: 2 }, { id: 3, user: 'GoldBug', time: '12m ago', pair: 'XAUUSD', direction: 'LONG', roi: '-1.2%', image: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&q=80&w=600', likes: 5, comments: 8 } ];

  // --- PROFILE LOGIC ---
  const getRank = (pnl: number) => {
    if (pnl < 0) return { title: 'ROOKIE', color: 'gray' };
    if (pnl < 5000) return { title: 'TRADER', color: 'cyan' };
    if (pnl < 25000) return { title: 'PRO', color: 'purple' };
    if (pnl < 100000) return { title: 'ELITE', color: 'rose' };
    return { title: 'WHALE', color: 'yellow' };
  };

  const userRank = getRank(totalPnL);
  const bestTrade = filteredTrades.length > 0 ? Math.max(...filteredTrades.map(t => t.pnl || 0)) : 0;
  const worstTrade = filteredTrades.length > 0 ? Math.min(...filteredTrades.map(t => t.pnl || 0)) : 0;

  return (
    <ThemeContext.Provider value={{ theme: 'dark', toggleTheme: () => {} }}>
      <div className="flex min-h-screen bg-[#05070A] text-slate-100 font-sans selection:bg-cyan-500/30">
        <BackgroundBlobs />
        <Ticker />
        <WelcomeToast username={user.displayName || 'Trader'} visible={showWelcome} />
        <CooldownModal isOpen={isCooldownOpen} onClose={() => setIsCooldownOpen(false)} />
        <CreateChallengeModal isOpen={isCreateChallengeOpen} onClose={() => setIsCreateChallengeOpen(false)} onCreate={handleCreateCustomChallenge} />
        <AddAccountModal isOpen={isAddAccountOpen} onClose={() => setIsAddAccountOpen(false)} onAdd={handleAddAccount} />
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

        <main className="flex-1 md:ml-20 pb-24 md:pb-8 relative z-10 transition-all duration-300">
          
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
                 {/* DAILY PNL DISPLAY */}
                 <div className={`hidden md:flex flex-col items-end px-3 py-1 rounded-lg border border-white/5 ${dailyPnL >= 0 ? 'bg-emerald-500/5' : 'bg-rose-500/5'}`}>
                     <span className="text-xs uppercase font-bold text-slate-500">Daily PnL</span>
                     <span className={`font-mono text-sm font-bold ${dailyPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{formatCurrency(dailyPnL)}</span>
                 </div>

                 <Select value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)} className="w-40 h-10 py-0 text-sm bg-slate-900 border-white/10">
                     <option value="all">All Accounts</option>
                     {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                 </Select>
                 <Button 
                    size="sm" 
                    variant={isTiltLocked ? 'danger' : 'neon'} 
                    onClick={handleNewTradeClick}
                 >
                     {isTiltLocked ? <Lock size={18} /> : <Plus size={18} />} 
                     <span className="hidden sm:inline">{isTiltLocked ? 'LOCKED' : 'New Trade'}</span>
                 </Button>
             </div>
          </header>

          <div className="p-6 max-w-7xl mx-auto">
            {/* ... (Existing Journal View) ... */}
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
                            <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-2">Avg R:R</div>
                            <div className="text-2xl font-mono font-bold text-amber-400">1 : {avgRR}</div>
                        </Card>
                    </div>

                    {/* NEW JOURNAL REVAMP: DAILY GROUPS */}
                    <div className="space-y-6">
                        {sortedDates.length > 0 ? sortedDates.map(date => {
                            const dayTrades = tradesByDate[date];
                            const dayPnL = dayTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
                            return (
                                <div key={date} className="animate-slide-up">
                                    <div className="flex items-center justify-between mb-2 px-2">
                                        <h3 className="text-sm font-bold text-slate-400 flex items-center gap-2">
                                            <CalendarIcon size={14}/> {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                        </h3>
                                        <div className={`font-mono text-sm font-bold ${dayPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {dayPnL > 0 ? '+' : ''}{formatCurrency(dayPnL)}
                                        </div>
                                    </div>
                                    <Card className="overflow-hidden border-0 bg-[#0B0F19]/90 p-0">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-white/5 text-[10px] text-slate-500 uppercase font-mono tracking-wider bg-white/5">
                                                    <th className="p-3 font-normal">Pair</th>
                                                    <th className="p-3 font-normal">Session</th>
                                                    <th className="p-3 font-normal">Setup</th>
                                                    <th className="p-3 font-normal">Tags</th>
                                                    <th className="p-3 font-normal">Risk</th>
                                                    <th className="p-3 font-normal">R:R</th>
                                                    <th className="p-3 font-normal text-right">PnL</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {dayTrades.map((trade) => (
                                                    <tr key={trade.id} onClick={() => setSelectedTrade(trade)} className="hover:bg-white/5 transition-colors cursor-pointer group">
                                                        <td className="p-3">
                                                            <div className="flex items-center gap-3">
                                                                <Badge color={trade.direction === TradeDirection.BUY ? 'green' : 'red'}>{trade.direction}</Badge>
                                                                <span className="font-bold text-white text-sm">{trade.pair}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-3 text-sm text-slate-400">{trade.session}</td>
                                                        <td className="p-3 text-sm text-slate-400">{trade.setup || '-'}</td>
                                                        <td className="p-3">
                                                            <div className="flex flex-wrap gap-1">
                                                                {trade.tags?.slice(0, 2).map(tag => <Badge key={tag} color="gray">{tag}</Badge>)}
                                                                {(trade.tags?.length || 0) > 2 && <span className="text-[10px] text-slate-500">+{trade.tags!.length - 2}</span>}
                                                            </div>
                                                        </td>
                                                        <td className="p-3 text-sm text-slate-400">{trade.riskPercentage ? `${trade.riskPercentage}%` : '-'}</td>
                                                        <td className="p-3 text-sm text-slate-400">{trade.rMultiple ? `${trade.rMultiple}R` : '-'}</td>
                                                        <td className={`p-3 text-right font-mono font-bold ${trade.pnl && trade.pnl > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{trade.pnl ? formatCurrency(trade.pnl) : '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </Card>
                                </div>
                            )
                        }) : (
                            <Card className="p-12 text-center text-slate-500">
                                <div className="flex flex-col items-center gap-4">
                                    <BookOpen size={48} opacity={0.2} />
                                    <p>No trades logged yet.</p>
                                    <Button size="sm" variant="secondary" onClick={() => setIsAddTradeOpen(true)}>Log First Trade</Button>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            )}
            
            {/* --- CHALLENGES (OVERHAULED) --- */}
            {activeTab === 'challenges' && (
                <div className="h-full">
                    {!activeChallenge ? (
                        <div className="space-y-6">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl font-display font-bold text-white mb-2">Select Your Protocol</h2>
                                <p className="text-slate-400">Choose a discipline challenge to forge your mindset.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                <Card className="relative overflow-hidden group hover:border-cyan-500/50 transition-all cursor-pointer" onClick={() => handleStartChallenge('monk')}>
                                    <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/10 to-transparent opacity-50"></div>
                                    <div className="relative z-10 text-center space-y-4">
                                        <div className="w-16 h-16 mx-auto rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400"><BrainCircuit size={32}/></div>
                                        <h3 className="text-xl font-bold text-white">Monk Mode</h3>
                                        <Badge color="cyan">7 Days</Badge>
                                        <p className="text-sm text-slate-400">A short reset for focus. Meditation, minimal trading, clear mind.</p>
                                        <ul className="text-left text-xs text-slate-300 space-y-2 bg-black/30 p-4 rounded-xl">
                                            <li>• 10m Meditation Daily</li>
                                            <li>• No Overtrading (Max 3)</li>
                                            <li>• Journal All Trades</li>
                                        </ul>
                                        <Button className="w-full" variant="neon">Begin Protocol</Button>
                                    </div>
                                </Card>
                                <Card className="relative overflow-hidden group hover:border-purple-500/50 transition-all cursor-pointer transform md:-translate-y-4 shadow-[0_0_50px_rgba(168,85,247,0.1)]" onClick={() => handleStartChallenge('iron')}>
                                    <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-transparent opacity-50"></div>
                                    <div className="relative z-10 text-center space-y-4">
                                        <div className="w-16 h-16 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400"><Shield size={32}/></div>
                                        <h3 className="text-xl font-bold text-white">Iron Risk</h3>
                                        <Badge color="purple">30 Days</Badge>
                                        <p className="text-sm text-slate-400">Strict risk management. One violation resets the clock.</p>
                                        <ul className="text-left text-xs text-slate-300 space-y-2 bg-black/30 p-4 rounded-xl">
                                            <li>• Max Loss $500</li>
                                            <li>• Review Playbook</li>
                                            <li>• Cold Shower</li>
                                        </ul>
                                        <Button className="w-full bg-purple-600 hover:bg-purple-500" variant="primary">Begin Protocol</Button>
                                    </div>
                                </Card>
                                <Card className="relative overflow-hidden group hover:border-rose-500/50 transition-all cursor-pointer" onClick={() => handleStartChallenge('savage')}>
                                    <div className="absolute inset-0 bg-gradient-to-b from-rose-900/10 to-transparent opacity-50"></div>
                                    <div className="relative z-10 text-center space-y-4">
                                        <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400"><Skull size={32}/></div>
                                        <h3 className="text-xl font-bold text-white">Trader 75</h3>
                                        <Badge color="red">75 Days</Badge>
                                        <p className="text-sm text-slate-400">The ultimate test. Mental and physical hardening.</p>
                                        <ul className="text-left text-xs text-slate-300 space-y-2 bg-black/30 p-4 rounded-xl">
                                            <li>• 2x Workouts Daily</li>
                                            <li>• Max Loss $250</li>
                                            <li>• Trade Only A+ Setups</li>
                                        </ul>
                                        <Button className="w-full" variant="danger">Begin Protocol</Button>
                                    </div>
                                </Card>
                                
                                {/* CUSTOM CHALLENGE CARD */}
                                <Card className="relative overflow-hidden group hover:border-amber-500/50 transition-all cursor-pointer flex flex-col items-center justify-center border-dashed border-2 border-white/10" onClick={() => setIsCreateChallengeOpen(true)}>
                                    <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4 group-hover:scale-110 transition-transform"><Wand2 size={32}/></div>
                                    <h3 className="text-lg font-bold text-white mb-2">Create Custom</h3>
                                    <p className="text-xs text-slate-500 text-center">Design your own rules, duration, and tribunal system.</p>
                                </Card>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-fade-in relative">
                            {/* --- HERO HEADER --- */}
                            <div className="flex items-end justify-between mb-4 border-b border-white/5 pb-4">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-3xl font-display font-bold text-white flex items-center gap-3">
                                            {activeChallenge.title}
                                            <Badge color="cyan">Level {currentLevel}</Badge>
                                        </h2>
                                        {/* RESET / ABORT BUTTON */}
                                        <Button 
                                            variant="ghost" 
                                            className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10" 
                                            size="sm"
                                            onClick={handleResetChallenge}
                                        >
                                            <RefreshCw size={14} className="mr-2"/> Abort Protocol
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-1000" style={{ width: `${xpProgress}%` }}></div>
                                        </div>
                                        <span className="text-xs text-slate-500">{currentXP} XP</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="secondary" size="sm" onClick={() => setShowShareCard(!showShareCard)}>
                                        <Share2 size={16} className="mr-2"/> Proof of Discipline
                                    </Button>
                                </div>
                            </div>
                            
                            {/* SHARE CARD MODAL */}
                            {showShareCard && (
                                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4" onClick={() => setShowShareCard(false)}>
                                    <div className="space-y-4" onClick={e => e.stopPropagation()}>
                                        <ShareableChallengeCard challenge={activeChallenge} user={user?.displayName || 'Trader'} winRate={winRate} pnl={totalPnL} />
                                        <div className="text-center">
                                            <p className="text-xs text-slate-500 mb-2">Screenshot this card to share.</p>
                                            <Button variant="neon" size="sm" onClick={() => setShowShareCard(false)}>Close</Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* MAIN DASHBOARD */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* STREAK FLAME CARD */}
                                <Card className="bg-[#0B0F19] flex flex-col items-center justify-center relative overflow-hidden group">
                                     <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 to-transparent opacity-50"></div>
                                     <FlameStreak streak={activeChallenge.currentDay} />
                                     <div className="relative z-10 text-center mt-4">
                                         <div className="text-4xl font-display font-bold text-white">Day {activeChallenge.currentDay}</div>
                                         <div className="text-xs text-slate-400 uppercase tracking-widest">of {activeChallenge.totalDays}</div>
                                     </div>
                                     {/* AI SERGEANT INTERACTION */}
                                     <div className="mt-4 relative z-20">
                                        <button 
                                            onClick={() => setShowSergeant(!showSergeant)} 
                                            className="text-[10px] flex items-center gap-1 bg-white/5 hover:bg-white/10 px-3 py-1 rounded-full text-slate-300 transition-colors"
                                        >
                                            <Bot size={12}/> Report for Duty
                                        </button>
                                     </div>
                                     {showSergeant && (
                                         <div className="absolute inset-0 z-30 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 text-center animate-fade-in">
                                             <div className="space-y-3">
                                                 <Bot size={32} className="mx-auto text-cyan-400"/>
                                                 <p className="text-sm font-bold text-white">"{challengeMotivation}"</p>
                                                 <button onClick={() => setShowSergeant(false)} className="text-xs text-slate-500 hover:text-white mt-2">Dismiss</button>
                                             </div>
                                         </div>
                                     )}
                                </Card>

                                {/* GLOBAL BENCHMARK STATS */}
                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <Card className="bg-gradient-to-br from-indigo-900/10 to-transparent border-indigo-500/20 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-10"><Globe size={64}/></div>
                                            <h3 className="text-sm font-bold text-indigo-400 uppercase mb-1">Global Standing</h3>
                                            <div className="text-3xl font-mono font-bold text-white">Top 12%</div>
                                            <p className="text-xs text-slate-500 mt-2">Only 12% of traders make it to Day {activeChallenge.currentDay}.</p>
                                        </Card>
                                        
                                        {/* DISCIPLINE LOG */}
                                        <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-xs font-bold text-slate-400 uppercase">Daily Log</h4>
                                                <span className="text-[10px] text-slate-600">{new Date().toLocaleDateString()}</span>
                                            </div>
                                            <textarea 
                                                className="w-full bg-black/30 text-sm text-slate-300 rounded-lg p-3 resize-none border-none focus:ring-1 focus:ring-indigo-500/50 outline-none" 
                                                rows={3}
                                                placeholder="How difficult was discipline today?"
                                            />
                                        </div>
                                    </div>

                                    {/* DAILY TASKS (THE TRIBUNAL) */}
                                    <div>
                                         <div className="flex items-center justify-between mb-4">
                                             <h3 className="text-lg font-bold text-white flex items-center gap-2"><CheckSquare className="text-emerald-500"/> Daily Tribunal</h3>
                                             <span className="text-xs text-slate-500 italic">Auto-verified</span>
                                         </div>
                                         <div className="space-y-3">
                                             {activeChallenge.days[activeChallenge.currentDay - 1]?.tasks.map((task) => (
                                                 <div key={task.id} 
                                                    className={`p-4 rounded-xl border flex items-center justify-between transition-all relative overflow-hidden ${
                                                        task.status === 'failed' ? 'bg-rose-900/20 border-rose-500/50' :
                                                        task.completed ? 'bg-emerald-900/10 border-emerald-500/30' : 
                                                        'bg-slate-900 border-white/5 hover:border-cyan-500/30'
                                                    }`}
                                                 >
                                                     {/* Status Indicator */}
                                                     <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                                                         task.status === 'failed' ? 'bg-rose-500' : 
                                                         task.status === 'passing' ? 'bg-yellow-500' :
                                                         task.completed ? 'bg-emerald-500' : 'bg-slate-700'
                                                     }`}></div>

                                                     <div className="flex items-center gap-4 pl-4">
                                                         <button 
                                                            onClick={() => handleChallengeTaskToggle(activeChallenge.currentDay - 1, task.id)}
                                                            disabled={task.verificationType !== 'manual' && task.status === 'failed'}
                                                            className={`w-6 h-6 rounded-md flex items-center justify-center border transition-all ${
                                                                task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 
                                                                task.status === 'failed' ? 'bg-rose-500/20 border-rose-500 text-rose-500' :
                                                                'border-slate-600 bg-transparent hover:border-cyan-400'
                                                            }`}
                                                         >
                                                             {task.completed && <Check size={14} />}
                                                             {task.status === 'failed' && <X size={14} />}
                                                         </button>
                                                         <div>
                                                             <span className={`${task.completed ? 'text-emerald-400 line-through' : task.status === 'failed' ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>{task.label}</span>
                                                             {task.verificationType !== 'manual' && (
                                                                 <div className="flex items-center gap-1 mt-1">
                                                                     <Badge color={task.status === 'failed' ? 'red' : task.status === 'passing' ? 'yellow' : 'gray'}>
                                                                         {task.status === 'passing' ? 'LIVE MONITORING' : task.status === 'failed' ? 'VIOLATION DETECTED' : 'AUTO'}
                                                                     </Badge>
                                                                     <span className="text-[10px] text-slate-500">
                                                                         {task.verificationType === 'max_loss' ? `(Limit: $${task.threshold})` : 
                                                                          task.verificationType === 'max_trades' ? `(Limit: ${task.threshold})` : ''}
                                                                     </span>
                                                                 </div>
                                                             )}
                                                         </div>
                                                     </div>
                                                 </div>
                                             ))}
                                         </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* PROGRESS MAP */}
                            <Card className="mt-6">
                                 <h3 className="text-lg font-bold text-white mb-4">The Journey</h3>
                                 <div className="grid grid-cols-10 gap-2">
                                     {activeChallenge.days.map((day) => {
                                         const isPast = day.dayNumber < activeChallenge.currentDay;
                                         const isToday = day.dayNumber === activeChallenge.currentDay;
                                         const allDone = day.tasks.every(t => t.completed);
                                         
                                         return (
                                             <div key={day.dayNumber} className={`aspect-square rounded-md flex items-center justify-center text-xs font-bold border transition-all ${
                                                 isToday ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_10px_cyan]' :
                                                 isPast && allDone ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' :
                                                 isPast && !allDone ? 'bg-rose-500/20 border-rose-500/50 text-rose-400' :
                                                 'bg-slate-800 border-slate-700 text-slate-600 opacity-50'
                                             }`}>
                                                 {day.dayNumber}
                                             </div>
                                         );
                                     })}
                                 </div>
                             </Card>
                        </div>
                    )}
                </div>
            )}
            
            {/* ... (Existing Analytics, Playbook, etc. Tabs) ... */}
            {/* ... [Analytics, Playbook, Community, Mindset, Red Folder, AI Coach, Profile views remain unchanged] ... */}
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

                    {/* New Position Size Calculator */}
                    <PositionSizeCalculator />
                    
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
            
            {activeTab === 'playbook' && (
                <div className="space-y-6">
                    {/* Header Controls */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                        <h2 className="text-3xl font-display font-bold text-white">Strategy Playbook</h2>
                        <div className="bg-slate-900 p-1 rounded-xl flex gap-1 border border-white/10">
                            <button onClick={() => setStrategyMode('ai')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${strategyMode === 'ai' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>AI Generator</button>
                            <button onClick={() => setStrategyMode('manual')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${strategyMode === 'manual' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Manual Builder</button>
                        </div>
                    </div>

                    {/* Builder Area */}
                    <Card className="border-t-4 border-cyan-500">
                        {strategyMode === 'ai' ? (
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2"><Sparkles className="text-cyan-400"/> AI Strategy Architect</h3>
                                <p className="text-sm text-slate-400">Describe a trading concept (e.g. "ICT Silver Bullet" or "RSI divergence with trend"). Gemini will build a full execution plan.</p>
                                <div className="flex gap-4">
                                    <Input placeholder="e.g. 'London Breakout with 15m FVG entry...'" value={strategyInput} onChange={e => setStrategyInput(e.target.value)} />
                                    <Button variant="neon" onClick={handleGenerateStrategy} disabled={generatingStrat}>
                                        {generatingStrat ? <Loader2 className="animate-spin"/> : 'Generate'}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2"><PenTool className="text-indigo-400"/> Manual Strategy Lab</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div><label className="text-xs text-slate-500 uppercase font-bold">Strategy Name</label><Input value={manualStratTitle} onChange={e => setManualStratTitle(e.target.value)} placeholder="e.g. The Golden Cross" /></div>
                                        <div><label className="text-xs text-slate-500 uppercase font-bold">Rules & Execution</label><textarea className="w-full h-32 bg-black/30 border border-white/10 rounded-xl p-4 text-white text-sm" value={manualStratRules} onChange={e => setManualStratRules(e.target.value)} placeholder="- Enter on 5m close..."/></div>
                                        <Button onClick={() => stratFileRef.current?.click()} variant="secondary" size="sm" className="w-full"><Upload size={14}/> Upload Reference Chart</Button>
                                        <input type="file" ref={stratFileRef} className="hidden" accept="image/*" onChange={handleStrategyImageUpload} />
                                    </div>
                                    <div className="flex flex-col justify-end">
                                        {manualStratImage && <img src={manualStratImage} className="h-32 object-cover rounded-xl mb-4 border border-white/10" />}
                                        <Button variant="neon" onClick={handleManualStrategy} disabled={generatingStrat}>{generatingStrat ? <Loader2 className="animate-spin"/> : 'Save & Critique'}</Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Strategy Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {playbookEntries.map(entry => (
                            <Card key={entry.id} className="group hover:border-cyan-500/50 transition-all flex flex-col h-full relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity"><Button size="sm" variant="danger" onClick={() => setPlaybookEntries(prev => prev.filter(p => p.id !== entry.id))}><Trash2 size={14}/></Button></div>
                                <h3 className="text-xl font-display font-bold text-white mb-2">{entry.title}</h3>
                                {entry.image && <img src={entry.image} className="w-full h-40 object-cover rounded-xl mb-4 border border-white/5" />}
                                
                                <div className="flex-1 space-y-4">
                                    <div className="max-h-40 overflow-y-auto prose prose-invert prose-sm bg-black/20 p-4 rounded-xl border border-white/5">
                                        <pre className="whitespace-pre-wrap font-sans bg-transparent border-0 p-0 text-slate-300">{entry.content}</pre>
                                    </div>
                                    
                                    {entry.checklist && (
                                        <div className="bg-emerald-900/10 p-3 rounded-xl border border-emerald-500/10">
                                            <h4 className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-2"><CheckSquare size={12}/> Execution Checklist</h4>
                                            <ul className="space-y-1">
                                                {entry.checklist.map((item, i) => <li key={i} className="text-xs text-slate-400 flex items-start gap-2"><span className="text-emerald-500">•</span> {item}</li>)}
                                            </ul>
                                        </div>
                                    )}

                                    {entry.dangerZones && (
                                        <div className="bg-rose-900/10 p-3 rounded-xl border border-rose-500/10">
                                            <h4 className="text-xs font-bold text-rose-400 mb-2 flex items-center gap-2"><AlertTriangle size={12}/> Danger Zones</h4>
                                            <div className="prose prose-invert prose-sm text-xs text-rose-200/70"><pre className="whitespace-pre-wrap font-sans bg-transparent border-0 p-0">{entry.dangerZones}</pre></div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
            
            {activeTab === 'community' && (
                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-mono text-red-400 uppercase tracking-widest">Live Feed • Global</span>
                    </div>
                    {communityPosts.map(post => (
                        <Card key={post.id} className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white">{post.user[0]}</div>
                                    <div>
                                        <h4 className="font-bold text-white">{post.user}</h4>
                                        <span className="text-xs text-slate-500">{post.time}</span>
                                    </div>
                                </div>
                                <Badge color={post.direction === 'LONG' ? 'green' : 'red'}>{post.direction} {post.pair}</Badge>
                            </div>
                            <div className="relative group cursor-pointer overflow-hidden rounded-xl border border-white/5">
                                <img src={post.image} className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-sm font-bold text-white border border-white/10">
                                    ROI: <span className={post.roi.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}>{post.roi}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 pt-2 border-t border-white/5">
                                <button className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors"><ThumbsUp size={18}/> <span className="text-sm">{post.likes}</span></button>
                                <button className="flex items-center gap-2 text-slate-400 hover:text-purple-400 transition-colors"><MessageCircle size={18}/> <span className="text-sm">{post.comments}</span></button>
                                <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors ml-auto"><Share2 size={18}/></button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {activeTab === 'discipline' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
                    {/* Col 1: Protocol */}
                    <Card className="flex flex-col h-full bg-gradient-to-b from-slate-900 to-[#0B0F19]">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><CheckSquare size={20}/></div>
                            <h3 className="font-display font-bold text-lg text-white">Daily Protocol</h3>
                        </div>
                        <div className="space-y-4 flex-1">
                            {['Review Playbook', 'Visualize Success', 'No Phone 30m', 'Check News', 'Hydrate'].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 hover:border-purple-500/30 transition-all cursor-pointer group">
                                    <span className="text-slate-300 font-medium group-hover:text-white">{item}</span>
                                    <div className="w-6 h-6 rounded-md border-2 border-slate-700 group-hover:border-purple-500 transition-colors"></div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Col 2: Vitals */}
                    <div className="flex flex-col gap-6 h-full">
                         <Card className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-cyan-900/10 to-[#0B0F19]">
                             <h3 className="absolute top-6 left-6 font-display font-bold text-lg text-white flex items-center gap-2"><Activity size={18} className="text-cyan-400"/> Live Vitals</h3>
                             <BreathingExercise />
                             <p className="mt-6 text-xs text-slate-500 text-center max-w-[200px]">Regulate your nervous system before entering the market.</p>
                         </Card>
                         <Card className="h-1/3 flex flex-col justify-center relative overflow-hidden">
                             <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 to-transparent"></div>
                             <div className="relative z-10 flex items-center justify-between px-4">
                                 <div>
                                     <h4 className="text-sm font-bold text-slate-400 mb-1">Psych Battery</h4>
                                     <div className="text-3xl font-mono font-bold text-emerald-400">92%</div>
                                 </div>
                                 <Battery size={48} className="text-emerald-500 opacity-80" />
                             </div>
                             <div className="w-full bg-slate-800 h-1.5 mt-4 rounded-full overflow-hidden">
                                 <div className="bg-emerald-500 h-full w-[92%] shadow-[0_0_10px_#10b981]"></div>
                             </div>
                         </Card>
                    </div>

                    {/* Col 3: Journal */}
                    <Card className="flex flex-col h-full bg-[#0B0F19]">
                         <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                             {['pre', 'mid', 'post'].map(t => (
                                 <button key={t} onClick={() => setJournalTab(t as any)} className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${journalTab === t ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                                     {t}-Session
                                 </button>
                             ))}
                         </div>
                         <textarea className="flex-1 bg-black/20 rounded-xl border border-white/5 p-4 text-sm text-slate-300 resize-none focus:ring-1 focus:ring-cyan-500/50 outline-none leading-relaxed" placeholder={`Write your ${journalTab}-session thoughts here...`} />
                         <Button variant="secondary" className="mt-4 w-full">Save Entry</Button>
                    </Card>
                </div>
            )}
            
            {/* ... [Rest of tabs remain same] ... */}
             {activeTab === 'news' && (
                <div className="space-y-6">
                    {/* Market Clocks */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { city: 'London', zone: 'Europe/London' },
                            { city: 'New York', zone: 'America/New_York' },
                            { city: 'Tokyo', zone: 'Asia/Tokyo' },
                            { city: 'Sydney', zone: 'Australia/Sydney' }
                        ].map(m => {
                            const status = getMarketStatus(m.city);
                            return (
                                <Card key={m.city} className="text-center py-6 relative overflow-hidden">
                                    <div className={`absolute top-0 left-0 w-full h-1 ${status === 'OPEN' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-slate-700'}`}></div>
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{m.city}</h3>
                                    <div className="text-2xl font-mono font-bold text-white mb-1">{getTimeInZone(m.zone)}</div>
                                    <Badge color={status === 'OPEN' ? 'green' : 'gray'}>{status}</Badge>
                                </Card>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Radar & Summary */}
                        <Card className="lg:col-span-1 bg-gradient-to-br from-rose-900/10 to-[#0B0F19] border-rose-500/20">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Radio className="text-rose-500 animate-pulse"/> Volatility Radar</h3>
                            <div className="aspect-square relative flex items-center justify-center mb-6">
                                <div className="absolute inset-0 border-2 border-rose-500/20 rounded-full animate-ping opacity-20"></div>
                                <div className="absolute inset-4 border border-rose-500/10 rounded-full"></div>
                                <div className="absolute inset-12 border border-rose-500/10 rounded-full"></div>
                                <div className="text-center z-10">
                                    <div className="text-4xl font-bold text-rose-500">HIGH</div>
                                    <div className="text-xs text-rose-300 uppercase tracking-widest">Threat Level</div>
                                </div>
                            </div>
                            <div className="p-4 bg-rose-900/10 rounded-xl border border-rose-500/10">
                                <h4 className="text-xs font-bold text-rose-400 mb-2">Market Outlook</h4>
                                <p className="text-sm text-slate-300 leading-relaxed">{marketNews.sentiment}</p>
                            </div>
                        </Card>

                        {/* Flight Board */}
                        <Card className="lg:col-span-2">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2"><Flame className="text-rose-500"/> Impact Events</h3>
                                <Button size="sm" variant="ghost" onClick={() => setRefreshNews(p => p + 1)}><RefreshCcw size={16}/></Button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="text-[10px] text-slate-500 uppercase font-mono tracking-wider bg-white/5">
                                        <tr>
                                            <th className="p-3">Time</th>
                                            <th className="p-3">Cur</th>
                                            <th className="p-3">Event</th>
                                            <th className="p-3">Impact</th>
                                            <th className="p-3 text-right">Actual</th>
                                            <th className="p-3 text-right">Forecast</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 font-mono text-sm">
                                        {marketNews.events.map((e, i) => (
                                            <tr key={i} className="hover:bg-white/5 transition-colors">
                                                <td className="p-3 text-slate-400">{e.time}</td>
                                                <td className="p-3 font-bold text-white">{e.currency}</td>
                                                <td className="p-3 text-slate-300 font-sans">{e.event}</td>
                                                <td className="p-3"><Badge color="red">HIGH</Badge></td>
                                                <td className={`p-3 text-right font-bold ${e.isBetter ? 'text-emerald-400' : 'text-rose-400'}`}>{e.actual || '--'}</td>
                                                <td className="p-3 text-right text-slate-500">{e.forecast || '--'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                </div>
            )}
            
            {activeTab === 'ai-coach' && (
                <div className="h-[calc(100vh-140px)] flex flex-col max-w-4xl mx-auto">
                     <Card className="flex-1 flex flex-col overflow-hidden bg-[#0B0F19] border-white/10 relative">
                         {/* Header */}
                         <div className="p-4 border-b border-white/5 flex items-center gap-3 bg-white/5">
                             <div className="w-10 h-10 rounded-full bg-cyan-600/20 flex items-center justify-center text-cyan-400"><Bot size={24}/></div>
                             <div>
                                 <h3 className="font-bold text-white">Atlas (AI Coach)</h3>
                                 <div className="flex items-center gap-2 text-xs text-cyan-400"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span> Online</div>
                             </div>
                         </div>
                         
                         {/* Chat Area */}
                         <div className="flex-1 overflow-y-auto p-6 space-y-6">
                             {coachMessages.length === 0 && (
                                 <div className="text-center text-slate-500 mt-20 space-y-4">
                                     <Bot size={48} className="mx-auto opacity-20"/>
                                     <p>I am Atlas. Upload a chart or ask me about your psychology.</p>
                                 </div>
                             )}
                             {coachMessages.map(msg => (
                                 <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                     <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'}`}>
                                         {msg.image && <img src={msg.image} className="rounded-lg mb-3 max-w-full border border-white/10" />}
                                         <div className="prose prose-invert prose-sm"><pre className="whitespace-pre-wrap font-sans bg-transparent border-0 p-0">{msg.text}</pre></div>
                                         <span className="text-[10px] opacity-50 block mt-2 text-right">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                     </div>
                                 </div>
                             ))}
                             {coachLoading && (
                                 <div className="flex justify-start">
                                     <div className="bg-slate-800 rounded-2xl rounded-bl-none p-4 flex gap-2">
                                         <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                                         <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100"></span>
                                         <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-200"></span>
                                     </div>
                                 </div>
                             )}
                             <div ref={chatEndRef} />
                         </div>

                         {/* Input Area */}
                         <div className="p-4 bg-black/40 border-t border-white/5">
                             {coachImage && (
                                 <div className="mb-2 inline-block relative group">
                                     <img src={coachImage} className="h-20 rounded-lg border border-white/20" />
                                     <button onClick={() => setCoachImage(null)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                                 </div>
                             )}
                             <div className="flex gap-2">
                                 <button onClick={() => coachFileRef.current?.click()} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"><ImageIcon size={20}/></button>
                                 <input type="file" ref={coachFileRef} className="hidden" accept="image/*" onChange={handleCoachUpload} />
                                 <Input 
                                    className="flex-1 bg-white/5 border-transparent focus:bg-white/10" 
                                    placeholder="Type a message..." 
                                    value={coachInput} 
                                    onChange={e => setCoachInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleCoachSend()}
                                 />
                                 <Button variant="neon" onClick={handleCoachSend} disabled={coachLoading || (!coachInput.trim() && !coachImage)}><Send size={18}/></Button>
                             </div>
                         </div>
                     </Card>
                </div>
            )}
            
            {activeTab === 'profile' && user && (
                 <div className="max-w-4xl mx-auto space-y-8">
                     {/* Identity Card */}
                     <Card className="relative overflow-hidden p-8 flex flex-col md:flex-row items-center gap-8 bg-gradient-to-r from-slate-900 to-[#0B0F19] border-white/10">
                         <div className="absolute top-0 right-0 p-32 bg-cyan-500/10 rounded-full blur-[100px]"></div>
                         <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 p-1 relative">
                             <div className="w-full h-full rounded-full bg-[#0B0F19] flex items-center justify-center text-4xl font-bold text-white relative overflow-hidden">
                                 {user.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover" /> : user.displayName?.[0]}
                             </div>
                             <div className="absolute bottom-2 right-2 w-8 h-8 bg-[#0B0F19] rounded-full flex items-center justify-center border border-white/10">
                                 <Shield size={16} className="text-cyan-400" />
                             </div>
                         </div>
                         <div className="text-center md:text-left z-10">
                             <h2 className="text-3xl font-display font-bold text-white mb-2">{user.displayName}</h2>
                             <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                                 <Badge color={userRank.color as any}>{userRank.title}</Badge>
                                 <span className="text-slate-400 text-sm">Member since {new Date(user.metadata.creationTime || Date.now()).toLocaleDateString()}</span>
                             </div>
                             <div className="flex gap-4">
                                 <div className="text-center px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                                     <div className="text-xs text-slate-500 uppercase font-bold">Total PnL</div>
                                     <div className={`text-lg font-mono font-bold ${totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{formatCurrency(totalPnL)}</div>
                                 </div>
                                 <div className="text-center px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                                     <div className="text-xs text-slate-500 uppercase font-bold">Win Rate</div>
                                     <div className="text-lg font-mono font-bold text-white">{winRate}%</div>
                                 </div>
                             </div>
                         </div>
                     </Card>

                     <div className="flex flex-col md:flex-row gap-8">
                         {/* Settings Sidebar */}
                         <div className="w-full md:w-64 space-y-2">
                             {['account', 'stats', 'data', 'security'].map(t => (
                                 <button 
                                    key={t} 
                                    onClick={() => setProfileSettingsTab(t)}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${profileSettingsTab === t ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                                 >
                                     {t.charAt(0).toUpperCase() + t.slice(1)}
                                 </button>
                             ))}
                         </div>
                         
                         {/* Settings Content */}
                         <Card className="flex-1 min-h-[400px]">
                             {profileSettingsTab === 'account' && (
                                 <div className="space-y-6">
                                     <h3 className="text-xl font-bold text-white border-b border-white/5 pb-4">Account Settings</h3>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                         <div><label className="text-xs text-slate-500 uppercase font-bold">Username</label><Input defaultValue={user.displayName || ''} disabled className="opacity-50" /></div>
                                         <div><label className="text-xs text-slate-500 uppercase font-bold">Email</label><Input defaultValue={user.email || ''} disabled className="opacity-50" /></div>
                                     </div>

                                     {/* TRADING ACCOUNTS MANAGER */}
                                     <div className="mt-8 pt-8 border-t border-white/5">
                                         <div className="flex justify-between items-center mb-4">
                                             <h4 className="font-bold text-white">Trading Accounts</h4>
                                             <Button size="sm" onClick={() => setIsAddAccountOpen(true)}><Plus size={16}/> Add</Button>
                                         </div>
                                         <div className="space-y-3">
                                             {accounts.map(acc => (
                                                 <div key={acc.id} className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                                                     <div>
                                                         <div className="font-bold text-white">{acc.name}</div>
                                                         <div className="text-xs text-slate-500">{acc.broker} • {acc.currency}</div>
                                                     </div>
                                                     <div className="font-mono text-emerald-400 font-bold">{formatCurrency(acc.balance)}</div>
                                                 </div>
                                             ))}
                                         </div>
                                     </div>
                                     <Button variant="secondary" className="mt-4">Update Profile</Button>
                                 </div>
                             )}
                             {profileSettingsTab === 'stats' && (
                                 <div className="space-y-6">
                                     <h3 className="text-xl font-bold text-white border-b border-white/5 pb-4">Detailed Statistics</h3>
                                     <div className="grid grid-cols-2 gap-4">
                                         <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                            <div className="text-xs text-emerald-400 uppercase font-bold mb-1">Best Trade</div>
                                            <div className="text-2xl font-mono font-bold text-white">{formatCurrency(bestTrade)}</div>
                                         </div>
                                         <div className="p-4 bg-rose-500/10 rounded-xl border border-rose-500/20">
                                            <div className="text-xs text-rose-400 uppercase font-bold mb-1">Worst Trade</div>
                                            <div className="text-2xl font-mono font-bold text-white">{formatCurrency(worstTrade)}</div>
                                         </div>
                                         <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                            <div className="text-xs text-slate-400 uppercase font-bold mb-1">Avg Win</div>
                                            <div className="text-xl font-mono font-bold text-white">{formatCurrency(avgWin)}</div>
                                         </div>
                                         <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                            <div className="text-xs text-slate-400 uppercase font-bold mb-1">Avg Loss</div>
                                            <div className="text-xl font-mono font-bold text-white">{formatCurrency(avgLoss)}</div>
                                         </div>
                                     </div>
                                 </div>
                             )}
                             {profileSettingsTab === 'data' && (
                                 <div className="space-y-6">
                                     <h3 className="text-xl font-bold text-white border-b border-white/5 pb-4">Data Management</h3>
                                     <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5 flex items-center justify-between">
                                         <div>
                                             <h4 className="font-bold text-white">Export Trading Data</h4>
                                             <p className="text-sm text-slate-400">Download all your trades as CSV.</p>
                                         </div>
                                         <Button variant="secondary" onClick={handleExportCSV}><Download size={18}/> Export CSV</Button>
                                     </div>
                                     <div className="p-4 bg-rose-900/10 rounded-xl border border-rose-500/20 flex items-center justify-between">
                                         <div>
                                             <h4 className="font-bold text-rose-400">Delete Account</h4>
                                             <p className="text-sm text-rose-300/70">Permanently remove all data.</p>
                                         </div>
                                         <Button variant="danger">Delete</Button>
                                     </div>
                                 </div>
                             )}
                             {/* ... other tabs ... */}
                         </Card>
                     </div>
                 </div>
            )}
            
            {/* ... */}
          </div>
        </main>
        
        <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        <AddTradeModal isOpen={isAddTradeOpen} onClose={() => setIsAddTradeOpen(false)} onSave={handleSaveTrade} accounts={accounts} currentAccountId={selectedAccount === 'all' ? accounts[0]?.id : selectedAccount} initialData={editingTrade} playbookEntries={playbookEntries} />
        <TradeDetailsModal trade={selectedTrade} onClose={() => setSelectedTrade(null)} onDelete={deleteTradeFromDb} onEdit={(t) => { setSelectedTrade(null); setEditingTrade(t); setIsAddTradeOpen(true); }} onAnalyze={handleAnalyzeTrade} />
        <ConnectBrokerModal isOpen={isConnectOpen} onClose={() => setIsConnectOpen(false)} />
        <AddAccountModal isOpen={isAddAccountOpen} onClose={() => setIsAddAccountOpen(false)} onAdd={handleAddAccount} />
        
      </div>
    </ThemeContext.Provider>
  );
};

function formatCurrency(num: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
}

export default App;
