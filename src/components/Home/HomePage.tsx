import React, { useState } from 'react';
import { useTrading } from '../../context/TradingContext';
import { VIP_PLANS } from '../../data/vipPlans';
import { DepositModal } from '../DepositModal';
import { WithdrawModal } from '../WithdrawModal';
import {
  Home as HomeIcon,
  Crown,
  Wallet,
  Zap,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Copy,
  Check,
  TrendingUp,
  Clock,
  CheckCircle2,
  Activity,
  Award,
  ChevronRight,
  Sparkles,
  Layers,
  Coins,
  Eye,
  EyeOff,
  DollarSign,
  PlusCircle,
  ShieldCheck,
  Lock,
  MessageCircle,
  ExternalLink,
  Send,
  Mail,
  BookOpen,
  Flame
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (tab: 'vip' | 'referral' | 'portfolio' | 'history' | 'book') => void;
}

import { getPublicReferralLink, getOrCreateUserReferralCode } from '../../utils/referral';

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const {
    user,
    availableBalance,
    equity,
    totalDeposited,
    totalWithdrawn,
    vipSubscriptions,
    claimVipEarnings,
    ledger,
    addToast
  } = useTrading();

  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activityFilter, setActivityFilter] = useState<'ALL' | 'YIELD' | 'INVEST' | 'TRANSFER'>('ALL');

  const referralCode = getOrCreateUserReferralCode(user);
  const referralLink = getPublicReferralLink(referralCode);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    addToast('Link Copied!', 'Invitation link copied to clipboard.', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const activeSubs = vipSubscriptions.filter(s => s.status === 'ACTIVE');
  const totalStaked = activeSubs.reduce((sum, s) => sum + s.investmentAmount, 0);
  const totalDailyRevenue = activeSubs.reduce((sum, s) => sum + s.dailyEarnings, 0);
  const totalUnclaimedYield = activeSubs.reduce((sum, s) => sum + s.unclaimedEarnings, 0);
  const totalClaimedYield = vipSubscriptions.reduce((sum, s) => sum + s.totalClaimed, 0);

  // Filter ledger for activity list
  const filteredActivities = ledger.filter(tx => {
    if (activityFilter === 'ALL') return true;
    if (activityFilter === 'YIELD') return tx.type === 'VIP_EARNINGS';
    if (activityFilter === 'INVEST') return tx.type === 'VIP_INVESTMENT';
    if (activityFilter === 'TRANSFER') return tx.type === 'DEPOSIT' || tx.type === 'WITHDRAW' || tx.type === 'WELCOME_BONUS';
    return true;
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8 text-slate-100">
      {/* Account Balance Banner & Actions */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-12 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Row of Balance Card */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Balance & Wallet</span>
                <button
                  type="button"
                  onClick={() => setShowBalance(!showBalance)}
                  className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  title={showBalance ? "Hide Balance" : "Show Balance"}
                >
                  {showBalance ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-100 font-mono tracking-tight mt-0.5">
                {showBalance ? (
                  <span>${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs font-sans font-bold text-emerald-400 uppercase">USD</span></span>
                ) : (
                  <span>••••••••</span>
                )}
              </h2>
            </div>
          </div>

          {/* Quick Action Deposit & Withdraw Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsDepositOpen(true)}
              className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              <ArrowDownRight className="w-4 h-4 stroke-[3]" />
              <span>Deposit Funds</span>
            </button>

            <button
              onClick={() => setIsWithdrawOpen(true)}
              className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <ArrowUpRight className="w-4 h-4 stroke-[3]" />
              <span>Withdraw Cash</span>
            </button>
          </div>
        </div>

        {/* Account Balance Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Available Cash</span>
            <span className="text-base font-extrabold font-mono text-emerald-400">
              {showBalance ? `$${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '••••'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Net Equity</span>
            <span className="text-base font-extrabold font-mono text-slate-100">
              {showBalance ? `$${equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '••••'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Staked Capital</span>
            <span className="text-base font-extrabold font-mono text-indigo-400">
              {showBalance ? `$${totalStaked.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Claimed Yield</span>
            <span className="text-base font-extrabold font-mono text-amber-400">
              {showBalance ? `$${totalClaimedYield.toFixed(2)}` : '••••'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Deposited</span>
            <span className="text-base font-extrabold font-mono text-teal-300">
              {showBalance ? `$${totalDeposited.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Withdrawn</span>
            <span className="text-base font-extrabold font-mono text-slate-300">
              {showBalance ? `$${totalWithdrawn.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••'}
            </span>
          </div>
        </div>
      </div>

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/50 to-slate-950 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Personal Dashboard & Activity Center</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Welcome back, {user?.username || 'Trader'}!
            </h1>

            <p className="text-slate-400 text-sm leading-relaxed">
              Track your daily passive yield, monitor active VIP investment contracts, view your account activities, and invite partners to earn daily commissions.
            </p>
          </div>

          {/* Claim All & Quick Actions */}
          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-3">
            {totalUnclaimedYield > 0 ? (
              <button
                onClick={() => {
                  activeSubs.forEach(sub => {
                    if (sub.unclaimedEarnings > 0) claimVipEarnings(sub.id);
                  });
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 stroke-[3]" />
                <span>Claim All Pending Yield (${totalUnclaimedYield.toFixed(2)})</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('vip')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Crown className="w-4 h-4 fill-slate-950" />
                <span>Explore VIP Plans</span>
              </button>
            )}
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Total Net Equity</span>
            <span className="text-lg sm:text-xl font-extrabold font-mono text-slate-100">
              ${equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Available Cash</span>
            <span className="text-lg sm:text-xl font-extrabold font-mono text-emerald-400">
              ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Staked Capital</span>
            <span className="text-lg sm:text-xl font-extrabold font-mono text-indigo-400">
              ${totalStaked.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Est. Daily Income</span>
            <span className="text-lg sm:text-xl font-extrabold font-mono text-amber-400">
              +${totalDailyRevenue.toFixed(2)}/day
            </span>
          </div>
        </div>
      </div>

      {/* Book of APEX Glorification Banner Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/50 border border-amber-500/40 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start gap-4 relative z-10">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black shadow-lg shadow-amber-500/20 shrink-0">
            <BookOpen className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black tracking-widest bg-amber-500/20 border border-amber-500/40 text-amber-300 uppercase">
                Golden Codex
              </span>
              <span className="text-xs text-amber-400 font-mono flex items-center gap-1 font-bold">
                <Flame className="w-3.5 h-3.5 fill-amber-400/30" />
                The Official Chronicle
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              THE BOOK OF APEX
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Explore the sacred codex glorifying APEX's financial supremacy, zero-loss yield engineering, and the VIP path to eternal wealth.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('book')}
          className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 shrink-0 relative z-10"
        >
          <BookOpen className="w-4 h-4 stroke-[2.5]" />
          <span>Read The Book of APEX</span>
          <ChevronRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>

      {/* Active VIP Contracts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-slate-100">My Active VIP Contracts ({activeSubs.length})</h2>
          </div>
          <button
            onClick={() => onNavigate('vip')}
            className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
          >
            <span>View All VIP Plans</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {activeSubs.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
              <Crown className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-200">No Active VIP Subscriptions</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Subscribe to a VIP plan to start generating automatic daily income credited straight to your available balance.
              </p>
            </div>
            <button
              onClick={() => onNavigate('vip')}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all"
            >
              Subscribe to VIP Plan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeSubs.map((sub, idx) => (
              <div key={`${sub.id}-${idx}`} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-base text-slate-100">{sub.planName}</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase">
                      {sub.badge}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-800/80 my-2 font-mono">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-sans">Staked Capital</span>
                      <span className="font-bold text-slate-200">${sub.investmentAmount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-sans">Daily Income</span>
                      <span className="font-bold text-emerald-400">+${sub.dailyEarnings.toFixed(2)} ({sub.dailyIncomePercent}%)</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Term Progress</span>
                      <span className="font-mono text-slate-200">Day {sub.daysElapsed} of {sub.durationDays}</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, (sub.daysElapsed / sub.durationDays) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Unclaimed Yield</div>
                    <div className="text-sm font-bold font-mono text-amber-400">${sub.unclaimedEarnings.toFixed(2)}</div>
                  </div>

                  <button
                    onClick={() => claimVipEarnings(sub.id)}
                    disabled={sub.unclaimedEarnings <= 0}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      sub.unclaimedEarnings > 0
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Claim Yield
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Activity Log Stream ("My Activities") */}
      <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <span>My Recent Account Activities</span>
            </h2>
            <p className="text-xs text-slate-400">Live stream of subscriptions, yield payouts, deposits, and withdrawals</p>
          </div>

          {/* Activity Filters */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {(['ALL', 'YIELD', 'INVEST', 'TRANSFER'] as const).map(flt => (
              <button
                key={flt}
                onClick={() => setActivityFilter(flt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activityFilter === flt
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {flt === 'YIELD' ? 'Yields' : flt === 'INVEST' ? 'Subscriptions' : flt === 'TRANSFER' ? 'Transfers' : 'All Activities'}
              </button>
            ))}
          </div>
        </div>

        {/* Activity Stream */}
        <div className="space-y-3">
          {filteredActivities.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No recent activity recorded under this filter.
            </div>
          ) : (
            filteredActivities.slice(0, 8).map((tx, idx) => {
              const isPositive = tx.amount >= 0;
              return (
                <div
                  key={`${tx.id}-${idx}`}
                  className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-900 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl text-xs font-bold shrink-0 ${
                        tx.type === 'VIP_EARNINGS'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : tx.type === 'VIP_INVESTMENT'
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          : tx.type === 'DEPOSIT'
                          ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {tx.type === 'VIP_EARNINGS' ? (
                        <Zap className="w-4 h-4" />
                      ) : tx.type === 'VIP_INVESTMENT' ? (
                        <Crown className="w-4 h-4" />
                      ) : tx.type === 'DEPOSIT' ? (
                        <ArrowDownRight className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-200">{tx.description}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2">
                        <span>{new Date(tx.timestamp).toLocaleString()}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-semibold">{tx.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className={`text-sm font-bold font-mono ${isPositive ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {isPositive ? '+' : ''}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">{tx.id}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {filteredActivities.length > 8 && (
          <div className="text-center pt-2">
            <button
              onClick={() => onNavigate('history')}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold inline-flex items-center gap-1"
            >
              <span>View Complete Activity History</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Official Community & Support Channels */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-sky-950/50 via-slate-900 to-emerald-950/50 border border-sky-500/30 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-lg shadow-sky-500/10 shrink-0">
            <Send className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-slate-100">Official Telegram & Community Channels</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold uppercase tracking-wider border border-sky-500/30">
                24/7 Verified Support
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-xl">
              Connect with APEX VIP support directly via Email at <strong className="text-amber-400">spoiremongae@gmail.com</strong>, on Telegram at <strong className="text-sky-400">+17426664547</strong>, or join our official WhatsApp community channel.
            </p>
          </div>
        </div>

        <div className="relative z-10 shrink-0 w-full lg:w-auto flex flex-col sm:flex-row items-center gap-2.5">
          <a
            href="mailto:spoiremongae@gmail.com"
            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
          >
            <Mail className="w-4 h-4 fill-slate-950" />
            <span>Email Support</span>
          </a>

          <a
            href="https://t.me/+17426664547"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
          >
            <Send className="w-4 h-4 fill-slate-950" />
            <span>Telegram (+17426664547)</span>
            <ExternalLink className="w-3 h-3 stroke-[2.5]" />
          </a>

          <a
            href="https://whatsapp.com/channel/0029VbDOL3x6hENjeGM23u01"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
          >
            <MessageCircle className="w-4 h-4 fill-slate-950" />
            <span>WhatsApp Channel</span>
            <ExternalLink className="w-3 h-3 stroke-[2.5]" />
          </a>
        </div>
      </div>

      {/* Invite Friends Quick Box */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-100">Invite Friends & Earn Daily Bonuses</h3>
            <p className="text-xs text-slate-400">Get up to 10% instant commission when your invited partners subscribe to any VIP plan.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-300"
            />
          </div>
          <button
            onClick={handleCopyLink}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md shrink-0 transition-all flex items-center gap-1"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} />
      <WithdrawModal isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)} onNavigateVIP={() => onNavigate('vip')} />
    </div>
  );
};
