import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar, Legend, ReferenceLine, Sector } from 'recharts';
import { Trade, TradeOutcome, TradeDirection } from '../types';

// --- HELPERS ---
const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

export const EquityCurve: React.FC<{ trades: Trade[] }> = ({ trades }) => {
  // Sort trades by date
  const sortedTrades = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  let currentBalance = 0; 
  const data = sortedTrades.map((t, i) => {
    const pnl = t.pnl || 0;
    currentBalance += pnl;
    return {
      name: i + 1, // Trade number
      equity: currentBalance,
      date: new Date(t.date).toLocaleDateString().slice(0, 5)
    };
  });

  if (data.length === 0) {
    data.push({ name: 0, equity: 0, date: 'Start' });
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
          <XAxis dataKey="name" hide />
          <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(value) => `$${value}`} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'rgba(5,7,10,0.8)', borderColor: 'rgba(255,255,255,0.1)', color: '#f1f5f9', borderRadius: '8px', fontSize: '12px', backdropFilter: 'blur(10px)' }}
            itemStyle={{ color: '#22d3ee' }}
            formatter={(value: number) => [formatCurrency(value), 'PnL Accum']}
            labelFormatter={() => ''}
          />
          <Area type="monotone" dataKey="equity" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorEquity)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const WinLossChart: React.FC<{ trades: Trade[] }> = ({ trades }) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const wins = trades.filter(t => t.outcome === TradeOutcome.WIN).length;
  const losses = trades.filter(t => t.outcome === TradeOutcome.LOSS).length;
  const breakeven = trades.filter(t => t.outcome === TradeOutcome.BREAKEVEN).length;

  const data = [
    { name: 'Wins', value: wins, color: '#10b981' },
    { name: 'Losses', value: losses, color: '#f43f5e' },
    { name: 'BE', value: breakeven, color: '#64748b' },
  ];

  const activeData = data.filter(d => d.value > 0);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };
  
  const onPieLeave = () => {
    setActiveIndex(-1);
  };

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    return (
      <g>
        <text x={cx} y={cy} dy={-20} textAnchor="middle" fill={fill} className="text-xl font-bold font-mono" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
          {payload.name}
        </text>
        <text x={cx} y={cy} dy={5} textAnchor="middle" fill="#94a3b8" className="text-xs" style={{ fontSize: '0.85rem' }}>
          {`${(percent * 100).toFixed(1)}%`}
        </text>
        <text x={cx} y={cy} dy={25} textAnchor="middle" fill="#64748b" className="text-xs" style={{ fontSize: '0.75rem' }}>
          {value} Trades
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          style={{ filter: `drop-shadow(0 0 8px ${fill})` }}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 10}
          outerRadius={outerRadius + 12}
          fill={fill}
        />
      </g>
    );
  };

  return (
    <div className="h-64 w-full flex items-center justify-center relative">
        <ResponsiveContainer width="100%" height="100%">
        <PieChart onMouseLeave={onPieLeave}>
            <Pie
            data={activeData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            onMouseEnter={onPieEnter}
            cursor="pointer"
            {...{ activeIndex, activeShape: renderActiveShape } as any}
            >
            {activeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
            </Pie>
            <Tooltip 
                 contentStyle={{ backgroundColor: 'rgba(5,7,10,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px', backdropFilter: 'blur(10px)' }}
                 itemStyle={{ color: '#fff' }}
                 formatter={(value: number, name: string) => [value, name]}
            />
        </PieChart>
        </ResponsiveContainer>
        {activeIndex === -1 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300">
                <div className="text-center">
                    <span className="text-2xl font-bold text-slate-800 dark:text-white">{trades.length}</span>
                    <span className="block text-xs text-slate-400">Trades</span>
                </div>
            </div>
        )}
    </div>
  );
};

export const PairPerformanceChart: React.FC<{ trades: Trade[] }> = ({ trades }) => {
    const pairStats = trades.reduce((acc, trade) => {
        const pair = trade.pair || 'UNKNOWN';
        if (!acc[pair]) acc[pair] = 0;
        acc[pair] += trade.pnl || 0;
        return acc;
    }, {} as Record<string, number>);

    const data = Object.entries(pairStats)
        .map(([name, value]): { name: string; value: number } => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // Top 5

    return (
        <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={data} margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.3} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={70} tick={{fill: '#94a3b8', fontSize: 10}} />
                    <Tooltip 
                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                        contentStyle={{ backgroundColor: 'rgba(5,7,10,0.8)', borderColor: 'rgba(255,255,255,0.1)', color: '#f1f5f9', borderRadius: '8px', backdropFilter: 'blur(10px)' }}
                        formatter={(value: number) => [formatCurrency(value), 'PnL']}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#3b82f6' : '#f43f5e'} />
                        ))}
                    </Bar>
                </BarChart>
             </ResponsiveContainer>
        </div>
    );
};

export const StrategyChart: React.FC<{ trades: Trade[] }> = ({ trades }) => {
    const strategyStats = trades.reduce((acc, trade) => {
        const setup = trade.setup || 'No Setup';
        if (!acc[setup]) acc[setup] = 0;
        acc[setup] += trade.pnl || 0;
        return acc;
    }, {} as Record<string, number>);

    const data = Object.entries(strategyStats)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

    return (
        <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                    <XAxis dataKey="name" tick={{fill: '#94a3b8', fontSize: 10}} />
                    <YAxis tick={{fill: '#94a3b8', fontSize: 10}} />
                    <Tooltip 
                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                        contentStyle={{ backgroundColor: 'rgba(5,7,10,0.8)', borderColor: 'rgba(255,255,255,0.1)', color: '#f1f5f9', borderRadius: '8px', backdropFilter: 'blur(10px)' }}
                        formatter={(value: number) => [formatCurrency(value), 'PnL']}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                         {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#8b5cf6' : '#f43f5e'} />
                        ))}
                    </Bar>
                </BarChart>
             </ResponsiveContainer>
        </div>
    );
};

export const DayOfWeekChart: React.FC<{ trades: Trade[] }> = ({ trades }) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayStats = trades.reduce((acc, trade) => {
        const date = new Date(trade.date);
        const dayIndex = date.getDay(); // 0-6
        const dayName = days[dayIndex];
        
        if (!acc[dayName]) acc[dayName] = { name: dayName, pnl: 0, count: 0 };
        acc[dayName].pnl += trade.pnl || 0;
        acc[dayName].count += 1;
        return acc;
    }, {} as Record<string, { name: string; pnl: number; count: number }>);

    // Ensure Mon-Fri order
    const orderedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const data = orderedDays.map(d => dayStats[d] || { name: d, pnl: 0, count: 0 });

    return (
        <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="name" tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fill: '#94a3b8', fontSize: 10}} axisLine={false} tickLine={false} />
                    <Tooltip 
                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                        contentStyle={{ backgroundColor: 'rgba(5,7,10,0.8)', borderColor: 'rgba(255,255,255,0.1)', color: '#f1f5f9', borderRadius: '8px', backdropFilter: 'blur(10px)' }}
                        formatter={(value: number) => [formatCurrency(value), 'PnL']}
                    />
                    <ReferenceLine y={0} stroke="#475569" />
                    <Bar dataKey="pnl" radius={[4, 4, 0, 0]} barSize={30}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#f43f5e'} />
                        ))}
                    </Bar>
                </BarChart>
             </ResponsiveContainer>
        </div>
    );
};

export const HourlyPerformanceChart: React.FC<{ trades: Trade[] }> = ({ trades }) => {
    const hourStats = trades.reduce((acc, trade) => {
        const date = new Date(trade.date);
        const hour = date.getHours(); // 0-23
        const hourLabel = `${hour}:00`;
        
        if (!acc[hourLabel]) acc[hourLabel] = { name: hourLabel, pnl: 0 };
        acc[hourLabel].pnl += trade.pnl || 0;
        return acc;
    }, {} as Record<string, { name: string; pnl: number }>);

    const data = Object.values(hourStats).sort((a,b) => parseInt(a.name) - parseInt(b.name));

    if (data.length === 0) return <div className="h-64 flex items-center justify-center text-slate-500 text-xs">No data available</div>;

    return (
        <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="name" tick={{fill: '#94a3b8', fontSize: 10}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fill: '#94a3b8', fontSize: 10}} axisLine={false} tickLine={false} />
                    <Tooltip 
                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                        contentStyle={{ backgroundColor: 'rgba(5,7,10,0.8)', borderColor: 'rgba(255,255,255,0.1)', color: '#f1f5f9', borderRadius: '8px', backdropFilter: 'blur(10px)' }}
                        formatter={(value: number) => [formatCurrency(value), 'PnL']}
                    />
                    <ReferenceLine y={0} stroke="#475569" />
                    <Bar dataKey="pnl" radius={[4, 4, 0, 0]} barSize={20}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#0ea5e9' : '#f43f5e'} />
                        ))}
                    </Bar>
                </BarChart>
             </ResponsiveContainer>
        </div>
    );
};

export const LongShortChart: React.FC<{ trades: Trade[] }> = ({ trades }) => {
    const longTrades = trades.filter(t => t.direction === TradeDirection.BUY);
    const shortTrades = trades.filter(t => t.direction === TradeDirection.SELL);

    const longPnL = longTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
    const shortPnL = shortTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);

    const data = [
        { name: 'Long (Buy)', pnl: longPnL },
        { name: 'Short (Sell)', pnl: shortPnL }
    ];

    return (
        <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 5 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.3} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={80} tick={{fill: '#94a3b8', fontSize: 11}} />
                    <Tooltip 
                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                        contentStyle={{ backgroundColor: 'rgba(5,7,10,0.8)', borderColor: 'rgba(255,255,255,0.1)', color: '#f1f5f9', borderRadius: '8px', backdropFilter: 'blur(10px)' }}
                        formatter={(value: number) => [formatCurrency(value), 'Total PnL']}
                    />
                    <ReferenceLine x={0} stroke="#475569" />
                    <Bar dataKey="pnl" radius={[0, 4, 4, 0]} barSize={30}>
                         {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#f43f5e'} />
                        ))}
                    </Bar>
                </BarChart>
             </ResponsiveContainer>
        </div>
    );
};

export const TradeCalendar: React.FC<{ trades: Trade[]; currentDate?: Date }> = ({ trades, currentDate = new Date() }) => {
    // Generate simple calendar for current month
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun

    // Group trades by day
    const tradesByDay = trades.reduce((acc, trade) => {
        const tDate = new Date(trade.date);
        if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
            const day = tDate.getDate();
            if (!acc[day]) acc[day] = { pnl: 0, count: 0, wins: 0, losses: 0 };
            acc[day].pnl += trade.pnl || 0;
            acc[day].count += 1;
            if (trade.outcome === TradeOutcome.WIN) acc[day].wins++;
            if (trade.outcome === TradeOutcome.LOSS) acc[day].losses++;
        }
        return acc;
    }, {} as Record<number, { pnl: number; count: number; wins: number; losses: number }>);

    return (
        <div className="w-full h-full flex flex-col">
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500 mb-1">
                <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>
            <div className="grid grid-cols-7 gap-2 auto-rows-fr flex-1">
                {Array.from({ length: firstDayIndex }).map((_, i) => (
                    <div key={`empty-${i}`} className="bg-transparent" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const data = tradesByDay[day];
                    const hasTrades = !!data;
                    const isWin = hasTrades && data.pnl > 0;
                    const isLoss = hasTrades && data.pnl < 0;
                    
                    return (
                        <div 
                            key={day}
                            className={`
                                relative rounded-lg p-1 flex flex-col items-center justify-center min-h-[60px] transition-all border
                                ${!hasTrades 
                                    ? 'bg-slate-100 dark:bg-slate-800/50 border-transparent text-slate-400' 
                                    : isWin 
                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                                        : isLoss
                                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.1)]'
                                            : 'bg-slate-700 border-slate-600 text-slate-300'
                                }
                            `}
                        >
                            <span className="absolute top-1 left-1.5 text-[10px] opacity-50">{day}</span>
                            {hasTrades && (
                                <>
                                    <span className="text-[10px] font-bold">{formatCurrency(data.pnl)}</span>
                                    <span className="text-[9px] opacity-75">{data.wins}W - {data.losses}L</span>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
