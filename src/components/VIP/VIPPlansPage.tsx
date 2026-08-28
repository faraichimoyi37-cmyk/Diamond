import React, { useState } from 'react';
import { useTrading } from '../../context/TradingContext';
import { VIP_PLANS, VipPlan } from '../../data/vipPlans';
import { DepositModal } from '../DepositModal';
import {
  Crown,
  Sparkles,
  Zap,
  ShieldCheck,
  TrendingUp,
  Clock,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  Lock,
  Wallet,
  Coins,
  Layers,
  Award,
  Copy,
  Check,
  ArrowDownRight,
  AlertTriangle
} from 'lucide-react';

export const VIPPlansPage: React.FC = () => {
  const { availableBalance, vipSubscriptions, subscribeVipPlan, claimVipEarnings, deactivateVipPlan, deactivateAllVipPlans } = useTrading();
  const [selectedPlan, setSelectedPlan] = useState<VipPlan | null>(null);
  const [investAmount, setInvestAmount] = useState<number>(10);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [planCryptoAsset, setPlanCryptoAsset] = useState<string>('USDT (BEP20)');
  const [copied, setCopied] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);

  const planCryptoAddresses: Record<string, string> = {
    'USDT (BEP20)': '0x057df1a2bece5b93907acd071314652cda900818',
    'USDT (TRC20)': 'TVLfwapDwRMveafYfmY6TWuvNC7si8w6s'
  };

  const handleCopyPlanAddress = () => {
    navigator.clipboard.writeText(planCryptoAddresses[planCryptoAsset] || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeSubscriptions = vipSubscriptions.filter(s => s.status === 'ACTIVE');
  const totalSubscribedPrincipal = activeSubscriptions.reduce((sum, s) => sum + s.investmentAmount, 0);
  const totalUnclaimedYield = activeSubscriptions.reduce((sum, s) => sum + s.unclaimedEarnings, 0);
  const totalClaimedYield = vipSubscriptions.reduce((sum, s) => sum + s.totalClaimed, 0);

  const handleOpenSubscribe = (plan: VipPlan) => {
    setSelectedPlan(plan);
    setInvestAmount(plan.minInvestment);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8 text-slate-100">
      {/* Top Banner & Overview */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-950 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold tracking-wide uppercase">
              <Crown className="w-4 h-4 fill-amber-400/20" />
              <span>VIP Staking & Daily Income Contracts</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Institutional VIP Yield Tiers
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Allocate your balance into high-yield daily income plans. Receive daily passive payouts credited directly to your trading account balance over fixed contract terms.
            </p>

            {/* Welcome Bonus & Withdrawal Unlock Hint */}
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0">
                <Crown className="w-4 h-4 fill-amber-300/20" />
              </div>
              <p className="text-xs text-amber-200 leading-snug font-medium">
                <strong>Welcome Bonus & Withdrawal Terms:</strong> Use your <strong>$5.00 Welcome Bonus</strong> towards activating VIP 1 or higher. Subscribing to any VIP Plan unlocks direct crypto withdrawals for all bonus rewards and daily yield payouts!
              </p>
            </div>
          </div>

          {/* Quick Balance & Claim All Action */}
          <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Available Trading Cash</div>
                <div className="text-lg font-mono font-bold text-emerald-400">
                  ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {totalUnclaimedYield > 0 && (
              <button
                onClick={() => {
                  activeSubscriptions.forEach(sub => {
                    if (sub.unclaimedEarnings > 0) claimVipEarnings(sub.id);
                  });
                }}
                className="px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 stroke-[3]" />
                <span>Claim All Yield (${totalUnclaimedYield.toFixed(2)})</span>
              </button>
            )}
          </div>
        </div>

        {/* Metric Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Active Staked Capital</div>
              <div className="text-base font-bold font-mono text-slate-100">
                ${totalSubscribedPrincipal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Pending Unclaimed Yield</div>
              <div className="text-base font-bold font-mono text-amber-400">
                ${totalUnclaimedYield.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Total Yield Claimed</div>
              <div className="text-base font-bold font-mono text-emerald-400">
                ${totalClaimedYield.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Subscriptions Section (if any) */}
      {activeSubscriptions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>My Active VIP Contracts ({activeSubscriptions.length})</span>
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => deactivateAllVipPlans()}
                className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold transition-all"
              >
                Deactivate All Plans
              </button>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">Real-time Passive Payouts</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeSubscriptions.map((sub, idx) => (
              <div key={`${sub.id}-${idx}`} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-base text-slate-100">{sub.planName}</span>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase">
                        {sub.badge}
                      </span>
                      <button
                        onClick={() => deactivateVipPlan(sub.id)}
                        title="Deactivate Plan"
                        className="px-2 py-0.5 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase transition-all"
                      >
                        Deactivate
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-800/80 my-2">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Capital Staked</span>
                      <span className="font-bold font-mono text-slate-200">${sub.investmentAmount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Daily Income</span>
                      <span className="font-bold font-mono text-emerald-400">+${sub.dailyEarnings.toFixed(2)}/day ({sub.dailyIncomePercent}%)</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Term Duration</span>
                      <span className="font-mono text-slate-200">Day {sub.daysElapsed} of {sub.durationDays} Days</span>
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
        </div>
      )}

      {/* Main VIP Plans Catalog Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <span>VIP Investment Tier Packages</span>
          </h2>
          <p className="text-xs text-slate-400">Select an investment tier to review terms and subscribe via crypto deposit.</p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'grid' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Card Grid
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'table' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Comparison Table
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {VIP_PLANS.map(plan => {
            const isAffordable = availableBalance >= plan.minInvestment;

            return (
              <div
                key={plan.id}
                className="relative group rounded-3xl bg-slate-950 border border-slate-800 hover:border-slate-700 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/5 space-y-6"
              >
                {/* Badge Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono tracking-wider text-slate-400 uppercase">
                      VIP Tier
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${
                        plan.badge === 'VIP'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : plan.badge === 'Premium'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                          : plan.badge === 'Popular'
                          ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {plan.badge}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-slate-100">{plan.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{plan.description}</p>
                </div>

                {/* Highlight Return Stats */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-400">Daily Income</span>
                    <span className="text-xl font-extrabold font-mono text-emerald-400">
                      {plan.dailyIncomePercent}% / day
                    </span>
                  </div>

                  <div className="w-full h-px bg-slate-800" />

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Min. Deposit</span>
                      <span className="font-extrabold font-mono text-slate-100">
                        ${plan.minInvestment.toLocaleString('en-US')}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Daily Earnings</span>
                      <span className="font-extrabold font-mono text-emerald-400">
                        ${plan.dailyEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Duration</span>
                      <span className="font-extrabold font-mono text-slate-200">
                        {plan.durationDays} Days
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Return</span>
                      <span className="font-extrabold font-mono text-emerald-400">
                        ${plan.totalReturn.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Subscribe Action Button */}
                <button
                  onClick={() => handleOpenSubscribe(plan)}
                  className={`w-full py-3 rounded-2xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    isAffordable
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-95'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  <span>{isAffordable ? 'Subscribe Plan' : 'Deposit & Subscribe'}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/80 text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-bold">VIP Name</th>
                  <th className="py-3.5 px-4 font-bold">Badge</th>
                  <th className="py-3.5 px-4 font-bold text-center">Daily Income (%)</th>
                  <th className="py-3.5 px-4 font-bold">Min. Investment (USD)</th>
                  <th className="py-3.5 px-4 font-bold">Daily Earnings (USD)</th>
                  <th className="py-3.5 px-4 font-bold">Duration (Days)</th>
                  <th className="py-3.5 px-4 font-bold">Total Return (USD)</th>
                  <th className="py-3.5 px-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {VIP_PLANS.map(plan => {
                  const isAffordable = availableBalance >= plan.minInvestment;

                  return (
                    <tr key={plan.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-4 px-4 font-extrabold text-sm text-slate-100">
                        {plan.name}
                      </td>

                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-bold uppercase text-slate-300">
                          {plan.badge}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center font-extrabold text-emerald-400 text-sm">
                        {plan.dailyIncomePercent}%
                      </td>

                      <td className="py-4 px-4 font-bold text-slate-100">
                        USD {plan.minInvestment.toLocaleString()}
                      </td>

                      <td className="py-4 px-4 font-bold text-emerald-400">
                        USD {plan.dailyEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-4 px-4 font-bold text-slate-300">
                        {plan.durationDays} Days
                      </td>

                      <td className="py-4 px-4 font-extrabold text-emerald-400">
                        USD {plan.totalReturn.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleOpenSubscribe(plan)}
                          className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase transition-all shadow-md inline-flex items-center gap-1"
                        >
                          <span>Subscribe</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subscription Calculator & Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  <span>Subscribe to {selectedPlan.name} VIP Plan</span>
                </h3>
                <p className="text-xs text-slate-400">Confirm investment amount & view yield calculations</p>
              </div>

              <button
                onClick={() => setSelectedPlan(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Investment Amount (USD)</span>
                  <span className="text-slate-400 font-mono">Min: ${selectedPlan.minInvestment}</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">$</span>
                  <input
                    type="number"
                    min={selectedPlan.minInvestment}
                    value={investAmount}
                    onChange={e => setInvestAmount(Math.max(selectedPlan.minInvestment, parseFloat(e.target.value) || selectedPlan.minInvestment))}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-base font-mono font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Calculated Yield Details Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Daily Yield Rate:</span>
                  <span className="text-emerald-400 font-bold">{selectedPlan.dailyIncomePercent}% / day</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Daily Earnings:</span>
                  <span className="text-emerald-400 font-bold">
                    +${(investAmount * (selectedPlan.dailyIncomePercent / 100)).toFixed(2)} USD
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Contract Term:</span>
                  <span className="text-slate-200 font-bold">{selectedPlan.durationDays} Days</span>
                </div>
                <div className="w-full h-px bg-slate-800 my-1" />
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300 font-bold">Total Estimated Return:</span>
                  <span className="text-emerald-400 font-extrabold">
                    ${(investAmount * (selectedPlan.dailyIncomePercent / 100) * selectedPlan.durationDays).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                  </span>
                </div>
              </div>

              {/* Wallet Check */}
              <div className="flex items-center justify-between text-xs p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="space-y-0.5">
                  <span className="text-slate-400 block">Available Trading Cash:</span>
                  <span className={`font-mono font-bold text-sm ${availableBalance >= investAmount ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {availableBalance < investAmount && (
                  <button
                    type="button"
                    onClick={() => setIsDepositOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <ArrowDownRight className="w-3.5 h-3.5" />
                    <span>Deposit USDT</span>
                  </button>
                )}
              </div>

              {availableBalance < investAmount && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2.5 text-xs text-amber-300 font-medium">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Deposit Required to Subscribe</span>
                    <span className="text-slate-400 text-[11px]">
                      Your available balance is insufficient by ${(investAmount - availableBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD. Submit an on-chain deposit to fund your wallet.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <button
                onClick={() => setSelectedPlan(null)}
                className="w-full sm:w-1/3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase"
              >
                Cancel
              </button>

              {availableBalance >= investAmount ? (
                <button
                  onClick={() => {
                    subscribeVipPlan(selectedPlan.id, investAmount);
                    setSelectedPlan(null);
                  }}
                  className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
                >
                  <Crown className="w-4 h-4 fill-slate-950" />
                  <span>Confirm Subscription (${investAmount.toLocaleString()} USD)</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsDepositOpen(true)}
                  className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
                >
                  <ArrowDownRight className="w-4 h-4 stroke-[3]" />
                  <span>Deposit Funds First</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} />
    </div>
  );
};
