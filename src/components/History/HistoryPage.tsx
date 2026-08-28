import React, { useState, useMemo } from 'react';
import { useTrading } from '../../context/TradingContext';
import { DepositModal } from '../DepositModal';
import { WithdrawModal } from '../WithdrawModal';
import {
  History,
  TrendingUp,
  TrendingDown,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  ShieldCheck,
  Download,
  Search,
  Copy,
  Check,
  CreditCard,
  Building2,
  QrCode,
  Crown,
  Zap,
  Clock,
  Filter,
  ExternalLink,
  PlusCircle,
  MinusCircle,
  FileText
} from 'lucide-react';

interface HistoryPageProps {
  onNavigate?: (tab: 'home' | 'vip' | 'referral' | 'portfolio' | 'history') => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onNavigate }) => {
  const { ledger, totalDeposited, totalWithdrawn, availableBalance, addToast } = useTrading();

  const [activeTab, setActiveTab] = useState<'deposits' | 'withdrawals' | 'vip' | 'all'>('deposits');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'PROCESSING'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  // Compute Deposit & Withdrawal Metrics
  const depositTxList = useMemo(() => ledger.filter(tx => tx.type === 'DEPOSIT' || tx.type === 'WELCOME_BONUS'), [ledger]);
  const withdrawTxList = useMemo(() => ledger.filter(tx => tx.type === 'WITHDRAW'), [ledger]);
  const vipTxList = useMemo(() => ledger.filter(tx => tx.type === 'VIP_INVESTMENT' || tx.type === 'VIP_EARNINGS'), [ledger]);

  const totalDepositCount = depositTxList.length;
  const totalWithdrawCount = withdrawTxList.length;

  const avgDepositSize = totalDepositCount > 0 ? totalDeposited / totalDepositCount : 0;
  const netCapitalFlow = totalDeposited - totalWithdrawn;

  // Filtered transactions for current view
  const currentTransactions = useMemo(() => {
    let source = ledger;
    if (activeTab === 'deposits') source = depositTxList;
    if (activeTab === 'withdrawals') source = withdrawTxList;
    if (activeTab === 'vip') source = vipTxList;

    return source.filter(tx => {
      // Status filter
      if (statusFilter !== 'ALL' && tx.status !== statusFilter) return false;

      // Search filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        tx.id.toLowerCase().includes(q) ||
        tx.description.toLowerCase().includes(q) ||
        (tx.method && tx.method.toLowerCase().includes(q)) ||
        (tx.txHash && tx.txHash.toLowerCase().includes(q))
      );
    });
  }, [ledger, activeTab, depositTxList, withdrawTxList, vipTxList, statusFilter, searchQuery]);

  const handleCopy = (text: string, id: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addToast('Copied!', `${label} copied to clipboard.`, 'success');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleExportCSV = () => {
    if (currentTransactions.length === 0) {
      addToast('Export Empty', 'No transactions found under the current filter to export.', 'info');
      return;
    }

    const headers = ['Tx ID', 'Type', 'Description', 'Method', 'Amount (USD)', 'Status', 'Tx Hash', 'Date Time'];
    const rows = currentTransactions.map(tx => [
      tx.id,
      tx.type,
      `"${tx.description.replace(/"/g, '""')}"`,
      tx.method || 'N/A',
      tx.amount,
      tx.status,
      tx.txHash || 'N/A',
      new Date(tx.timestamp).toISOString()
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `apex_financial_history_${activeTab}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('CSV Exported', `Successfully downloaded ${currentTransactions.length} transaction records as CSV.`, 'success');
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Overview Financial Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Deposits Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider">Deposit History</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-400">
            ${totalDeposited.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
            <span>{totalDepositCount} Completed Deposits</span>
            <button
              onClick={() => setIsDepositOpen(true)}
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Deposit
            </button>
          </div>
        </div>

        {/* Total Withdrawals Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider">Withdrawal History</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-400">
            ${totalWithdrawn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
            <span>{totalWithdrawCount} Completed Payouts</span>
            <button
              onClick={() => setIsWithdrawOpen(true)}
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
            >
              <MinusCircle className="w-3.5 h-3.5" /> Withdraw
            </button>
          </div>
        </div>

        {/* Net Capital Flow */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider">Net Capital Inflow</span>
            <ShieldCheck className="w-4 h-4 text-sky-400" />
          </div>
          <div className={`text-2xl font-extrabold font-mono ${netCapitalFlow >= 0 ? 'text-sky-400' : 'text-slate-300'}`}>
            ${netCapitalFlow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
            <span>Deposits minus Withdrawals</span>
            <span className="font-mono text-slate-200">Avg Dep: ${avgDepositSize.toFixed(0)}</span>
          </div>
        </div>

        {/* Available Wallet Balance */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider">Current Available Cash</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">ACTIVE</span>
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-100">
            ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
            <span>Instant Withdrawal Ready</span>
            <span className="font-bold text-emerald-400">100% Liquid</span>
          </div>
        </div>
      </div>

      {/* Main Tabbed History Table Section */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl space-y-0">
        {/* Navigation Tabs Header */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between p-4 gap-4 border-b border-slate-800 bg-slate-900/80">
          {/* Main Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('deposits')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'deposits'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>Deposit History ({depositTxList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('withdrawals')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'withdrawals'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Withdrawal History ({withdrawTxList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('vip')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'vip'
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Crown className="w-4 h-4" />
              <span>VIP Yields & Plans ({vipTxList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-slate-800 text-white shadow-md border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>All Ledger ({ledger.length})</span>
            </button>
          </div>

          {/* Quick Actions (Deposit / Withdraw buttons) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDepositOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>New Deposit</span>
            </button>
            <button
              onClick={() => setIsWithdrawOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>New Withdrawal</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-slate-900/40 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Tx ID, Method, Hash or Description..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-slate-700"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-400 font-bold mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Status:
              </span>
              {(['ALL', 'COMPLETED', 'PROCESSING'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                    statusFilter === st
                      ? 'bg-slate-800 text-slate-100 border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto min-h-[300px]">
          {currentTransactions.length === 0 ? (
            <div className="py-20 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-3">
              <History className="w-10 h-10 opacity-30 text-slate-400" />
              <div className="space-y-1">
                <p className="font-bold text-slate-300 text-sm">No transactions found</p>
                <p className="text-slate-500 max-w-sm">
                  {searchQuery
                    ? `No records matching "${searchQuery}" under ${activeTab}.`
                    : `No ${activeTab} recorded yet.`}
                </p>
              </div>
              {activeTab === 'deposits' && (
                <button
                  onClick={() => setIsDepositOpen(true)}
                  className="mt-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase"
                >
                  Make First Deposit
                </button>
              )}
              {activeTab === 'withdrawals' && (
                <button
                  onClick={() => setIsWithdrawOpen(true)}
                  className="mt-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase"
                >
                  Request Withdrawal
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/80 text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Tx ID / Ref</th>
                  <th className="py-3.5 px-3 font-bold">Category</th>
                  <th className="py-3.5 px-3 font-bold">Description</th>
                  <th className="py-3.5 px-3 font-bold">Payment Method</th>
                  <th className="py-3.5 px-3 font-bold">Tx Hash / Ref</th>
                  <th className="py-3.5 px-3 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold text-right">Amount</th>
                  <th className="py-3.5 px-4 font-bold text-right">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {currentTransactions.map((tx, idx) => {
                  const isDeposit = tx.type === 'DEPOSIT';
                  const isWithdraw = tx.type === 'WITHDRAW';
                  const isPositive = tx.amount >= 0;

                  return (
                    <tr key={`${tx.id}-${idx}`} className="hover:bg-slate-900/60 transition-colors">
                      {/* Tx ID */}
                      <td className="py-4 px-4 font-bold text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <span>{tx.id}</span>
                          <button
                            onClick={() => handleCopy(tx.id, tx.id, 'Transaction ID')}
                            className="p-1 hover:text-emerald-400 text-slate-500 transition-colors"
                            title="Copy Tx ID"
                          >
                            {copiedId === tx.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-4 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase border ${
                            isDeposit || tx.type === 'WELCOME_BONUS'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : isWithdraw
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : tx.type === 'VIP_EARNINGS'
                              ? 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                              : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                          }`}
                        >
                          {tx.type === 'WELCOME_BONUS' ? 'Welcome Bonus' : tx.type === 'VIP_EARNINGS' ? 'VIP Yield' : tx.type === 'VIP_INVESTMENT' ? 'VIP Stake' : tx.type}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="py-4 px-3 font-sans text-slate-200 max-w-xs truncate">
                        {tx.description}
                      </td>

                      {/* Payment Method */}
                      <td className="py-4 px-3 text-slate-300">
                        <div className="flex items-center gap-1.5 font-sans font-semibold">
                          {tx.method?.includes('Card') ? (
                            <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                          ) : tx.method?.includes('Bank') || tx.method?.includes('Wire') ? (
                            <Building2 className="w-3.5 h-3.5 text-sky-400" />
                          ) : tx.method?.includes('Crypto') || tx.method?.includes('USDT') ? (
                            <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                          )}
                          <span>{tx.method || 'Internal Ledger'}</span>
                        </div>
                      </td>

                      {/* Tx Hash / Reference */}
                      <td className="py-4 px-3 text-slate-400 text-[11px]">
                        {tx.txHash ? (
                          <div className="flex items-center gap-1">
                            <span className="font-mono">{tx.txHash.substring(0, 10)}...</span>
                            <button
                              onClick={() => handleCopy(tx.txHash!, `hash-${tx.id}`, 'Tx Hash')}
                              className="p-1 hover:text-emerald-400 text-slate-500"
                              title="Copy Hash"
                            >
                              {copiedId === `hash-${tx.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-600">N/A</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{tx.status}</span>
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-4 text-right">
                        <span
                          className={`text-sm font-extrabold font-mono ${
                            isDeposit || (isPositive && tx.type === 'VIP_EARNINGS')
                              ? 'text-emerald-400'
                              : isWithdraw
                              ? 'text-amber-400'
                              : 'text-slate-300'
                          }`}
                        >
                          {isPositive ? '+' : ''}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td className="py-4 px-4 text-right text-slate-400 text-[11px]">
                        <div>{new Date(tx.timestamp).toLocaleDateString()}</div>
                        <div className="text-[10px] text-slate-500">{new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Deposit & Withdraw Modals */}
      <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} />
      <WithdrawModal isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)} onNavigateVIP={() => onNavigate?.('vip')} />
    </div>
  );
};

