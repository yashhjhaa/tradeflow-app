
import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { Trade, TradeOutcome } from '../types';

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
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', borderRadius: '8px', fontSize: '12px' }}
            itemStyle={{ color: '#22d3ee' }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'PnL Accum']}
            labelFormatter={() => ''}
          />
          <Area type="monotone" dataKey="equity" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorEquity)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const WinLossChart: React.FC<{ trades: Trade[] }> = ({ trades }) => {
  const wins = trades.filter(t => t.outcome === TradeOutcome.WIN).length;
  const losses = trades.filter(t => t.outcome === TradeOutcome.LOSS).length;
  const breakeven = trades.filter(t => t.outcome === TradeOutcome.BREAKEVEN).length;

  const data = [
    { name: 'Wins', value: wins, color: '#10b981' },
    { name: 'Losses', value: losses, color: '#f43f5e' },
    { name: 'BE', value: breakeven, color: '#64748b' },
  ];

  const activeData = data.filter(d => d.value > 0);

  return (
    <div className="h-64 w-full flex items-center justify-center relative">
        <ResponsiveContainer width="100%" height="100%">
        <PieChart>
            <Pie
            data={activeData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            >
            {activeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
            </Pie>
            <Tooltip 
                 contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                 itemStyle={{ color: '#fff' }}
            />
        </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
                <span className="text-2xl font-bold text-slate-800 dark:text-white">{trades.length}</span>
                <span className="block text-xs text-slate-400">Trades</span>
            </div>
        </div>
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
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', borderRadius: '8px' }}
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'PnL']}
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
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', borderRadius: '8px' }}
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'PnL']}
                    />
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
