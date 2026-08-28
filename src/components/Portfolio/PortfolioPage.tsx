import React, { useState } from 'react';
import { useTrading } from '../../context/TradingContext';
import { DepositModal } from '../DepositModal';
import { WithdrawModal } from '../WithdrawModal';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, AreaChart, Area, XAxis, YAxis } from 'recharts';
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  PieChart as PieIcon,
  Activity,
  CreditCard,
  Building2,
  CheckCircle2,
  FileText
} from 'lucide-react';

interface PortfolioPageProps {
  onNavigate?: (tab: 'home' | 'vip' | 'referral' | 'portfolio' | 'history') => void;
}

export const PortfolioPage: React.FC<PortfolioPageProps> = ({ onNavigate }) => {
  const {
    equity,
    availableBalance,
    lockedMargin,
    unrealizedPnL,
    realizedPnL,
    totalDeposited,
    totalWithdrawn,
    positions,
    ledger,
    vipSubscriptions
  } = useTrading();

  const hasVipPlan = vipSubscriptions && vipSubscriptions.some(s => s.status === 'ACTIVE');

  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [ledgerFilter, setLedgerFilter] = useState<'ALL' | 'DEPOSIT' | 'WITHDRAW' | 'VIP_INVESTMENT' | 'VIP_EARNINGS'>('ALL');

  // Allocation Pie Data
  const pieData = [
    { name: 'Available Cash', value: Math.max(0, availableBalance), color: '#10b981' },
    { name: 'Locked Margin', value: Math.max(0, lockedMargin), color: '#38bdf8' },
    ...positions.map((p, i) => ({
      name: `${p.symbol} (${p.side})`,
      value: Math.max(10, p.margin + p.unrealizedPnL),
      color: ['#a855f7', '#f59e0b', '#ec4899', '#06b6d4'][i % 4]
    }))
  ];

  // Performance Curve Data derived from equity
  const performanceData = [
    { day: 'Initial', equity: totalDeposited },
    { day: 'Current', equity: equity }
  ];

  const filteredLedger = ledger.filter(tx => {
    if (ledgerFilter === 'ALL') return true;
    return tx.type === ledgerFilter;
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Portfolio Overview Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Equity Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Total Net Equity</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            ${equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
            <span>Realized PnL</span>
            <span className={`font-mono font-bold ${realizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {realizedPnL >= 0 ? '+' : ''}${realizedPnL.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Available Cash Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Available Cash</span>
            {hasVipPlan ? (
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                UNLOCKED
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                VIP REQUIRED TO WITHDRAW
              </span>
            )}
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
            <span>Locked Margin</span>
            <span className="font-mono text-slate-200">${lockedMargin.toFixed(2)}</span>
          </div>
        </div>

        {/* Total Deposits Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Total Deposited</span>
            <ArrowDownRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            ${totalDeposited.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
            <span>Deposit Fee</span>
            <span className="font-mono text-emerald-400">$0.00 (Free)</span>
          </div>
        </div>

        {/* Total Withdrawals Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Total Withdrawn</span>
            <ArrowUpRight className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            ${totalWithdrawn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
            <span>Status</span>
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified
            </span>
          </div>
        </div>
      </div>

      {/* Primary Wallet Action Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-100">Wallet Management & Transfers</h3>
            <p className="text-xs text-slate-400">Instantly deposit crypto or withdraw available trading balance to external crypto wallets.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsDepositOpen(true)}
            className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
          >
            <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
            <span>Deposit Cash</span>
          </button>

          <button
            onClick={() => setIsWithdrawOpen(true)}
            className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-bold text-xs uppercase transition-all flex items-center justify-center gap-2"
          >
            <ArrowUpRight className="w-4 h-4 text-amber-400 stroke-[2.5]" />
            <span>Withdraw Cash</span>
          </button>
        </div>
      </div>

      {/* Visual Analytics Grid: Allocation Pie + Growth Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Allocation Pie Chart */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-400" />
              <span>Capital & Margin Allocation</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Live Portfolio Breakdown</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => `$${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Legend */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-3 border-t border-slate-800/80">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-slate-300 truncate font-medium">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Equity Performance Curve */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-400" />
              <span>Cumulative Net Equity Growth</span>
            </h3>
            <span className="text-xs text-emerald-400 font-mono font-bold">+5.6% Total</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip
                  formatter={(val: number) => `$${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="equity" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#equityGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <span>Financial Transaction Ledger</span>
            </h3>
            <p className="text-xs text-slate-400">Complete record of deposits, withdrawals, and trade settlements</p>
          </div>

          {/* Ledger Filters */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {(['ALL', 'DEPOSIT', 'WITHDRAW', 'VIP_INVESTMENT', 'VIP_EARNINGS'] as const).map(flt => (
              <button
                key={flt}
                onClick={() => setLedgerFilter(flt)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  ledgerFilter === flt
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {flt === 'VIP_INVESTMENT' ? 'VIP STAKE' : flt === 'VIP_EARNINGS' ? 'VIP YIELD' : flt}
              </button>
            ))}
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/60 text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4 font-bold">Transaction ID</th>
                <th className="py-2.5 px-3 font-bold">Type</th>
                <th className="py-2.5 px-3 font-bold">Description</th>
                <th className="py-2.5 px-3 font-bold">Method / Ref</th>
                <th className="py-2.5 px-3 font-bold">Status</th>
                <th className="py-2.5 px-4 font-bold text-right">Amount</th>
                <th className="py-2.5 px-4 font-bold text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredLedger.map((tx, idx) => {
                const isPos = tx.amount >= 0;
                return (
                  <tr key={`${tx.id}-${idx}`} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-300">{tx.id}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.type === 'DEPOSIT'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : tx.type === 'WITHDRAW'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-300">{tx.description}</td>
                    <td className="py-3 px-3 text-slate-400">{tx.method || tx.txHash || '-'}</td>
                    <td className="py-3 px-3">
                      <span className="text-emerald-400 flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {tx.status}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-right font-bold text-sm ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPos ? '+' : ''}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 text-[11px]">{new Date(tx.timestamp).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deposit & Withdraw Modals */}
      <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} />
      <WithdrawModal isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)} onNavigateVIP={() => onNavigate?.('vip')} />
    </div>
  );
};
