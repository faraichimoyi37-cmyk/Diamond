import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import {
  X,
  Wallet,
  CheckCircle,
  ArrowUpRight,
  ShieldAlert,
  Lock,
  Check,
  DollarSign,
  Crown,
  Send,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateVIP?: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose, onNavigateVIP }) => {
  const { withdraw, availableBalance, ledger, vipSubscriptions } = useTrading();
  const [modalTab, setModalTab] = useState<'withdraw' | 'history'>('withdraw');
  const [cryptoAsset, setCryptoAsset] = useState<string>('USDT (TRC20)');
  const [cryptoAddress, setCryptoAddress] = useState('T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb');
  const [amount, setAmount] = useState<string>('0');
  const [securityPin, setSecurityPin] = useState('1234');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const withdrawHistoryList = ledger.filter(tx => tx.type === 'WITHDRAW');
  const hasVipPlan = vipSubscriptions && vipSubscriptions.some(s => s.status === 'ACTIVE');

  // Daily 24-hour withdrawal limit calculation (Max 1 per 24 hours)
  const oneDayMs = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const last24hWithdrawal = withdrawHistoryList.find(tx => (now - tx.timestamp) < oneDayMs);
  const hasReachedDailyLimit = Boolean(last24hWithdrawal);
  const hoursRemaining = last24hWithdrawal
    ? Math.max(1, Math.ceil((oneDayMs - (now - last24hWithdrawal.timestamp)) / (60 * 60 * 1000)))
    : 0;

  const handlePercentage = (pct: number) => {
    const val = (availableBalance * pct) / 100;
    setAmount(val.toFixed(2));
    setErrorMsg(null);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasVipPlan) {
      setErrorMsg('VIP Plan Activation Required: According to APEX platform anti-abuse terms, promotional welcome bonus funds and account balance cannot be withdrawn to external crypto wallets without an active VIP Staking Plan subscription. Activate VIP Plan 1 or higher to unlock direct crypto withdrawals.');
      return;
    }

    if (hasReachedDailyLimit) {
      setErrorMsg(`Daily Withdrawal Limit Reached: Security policy enforces a maximum of 1 withdrawal per 24 hours. Your next withdrawal opens in ~${hoursRemaining} hour(s).`);
      return;
    }

    const numAmount = parseFloat(amount);
    
    if (!numAmount || numAmount <= 0) {
      setErrorMsg('Please enter a valid withdrawal amount.');
      return;
    }

    if (numAmount > availableBalance) {
      setErrorMsg(`Amount exceeds available balance ($${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })})`);
      return;
    }

    if (!cryptoAddress || cryptoAddress.trim().length < 8) {
      setErrorMsg('Please enter a valid destination crypto wallet address.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    setTimeout(() => {
      const methodName = `Crypto Transfer (${cryptoAsset})`;
      const ok = withdraw(numAmount, methodName, `Address: ${cryptoAddress.trim()}`);
      setIsProcessing(false);
      if (ok) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 1500);
      }
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-slate-100">Withdraw Crypto</h3>
                  <p className="text-xs text-slate-400">Transfer available balance to external crypto wallet</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub Nav Tabs */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60">
              <button
                type="button"
                onClick={() => setModalTab('withdraw')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  modalTab === 'withdraw'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Withdraw Crypto
              </button>
              <button
                type="button"
                onClick={() => setModalTab('history')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  modalTab === 'history'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Withdrawal History ({withdrawHistoryList.length})
              </button>
            </div>
          </div>

          {isSuccess ? (
            <div className="p-10 text-center flex flex-col items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-4"
              >
                <Check className="w-8 h-8" />
              </motion.div>
              <h3 className="text-xl font-bold text-slate-100">Withdrawal Processed!</h3>
              <p className="text-sm text-slate-400 mt-1">
                Initiated <span className="text-amber-400 font-semibold">${parseFloat(amount).toLocaleString()} USD</span> transfer via <span className="text-slate-200 font-semibold">{cryptoAsset}</span>.
              </p>
            </div>
          ) : modalTab === 'history' ? (
            <div className="p-6 space-y-4 max-h-[480px] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Withdrawal Transactions</h4>
                <span className="text-[11px] text-slate-500 font-mono">{withdrawHistoryList.length} total records</span>
              </div>

              {withdrawHistoryList.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs space-y-3">
                  <Wallet className="w-8 h-8 opacity-30 text-amber-400 mx-auto" />
                  <p className="font-bold text-slate-400">No withdrawals recorded yet</p>
                  <p className="text-slate-500 max-w-xs mx-auto">
                    Your processed crypto payout requests will be logged here.
                  </p>
                  <button
                    type="button"
                    onClick={() => setModalTab('withdraw')}
                    className="mt-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs uppercase"
                  >
                    Request Crypto Withdrawal
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {withdrawHistoryList.map((tx, idx) => (
                    <div
                      key={`${tx.id}-${idx}`}
                      className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-xs font-mono"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{tx.id}</span>
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-extrabold text-[10px]">
                          {tx.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-400">
                        <span>{tx.method || 'Crypto Payout'}</span>
                        <span className="font-extrabold text-amber-400 text-sm">
                          -${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-500 text-right pt-1 border-t border-slate-900">
                        {new Date(tx.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleWithdrawSubmit} className="p-6 space-y-5">
              {!hasVipPlan ? (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-slate-900 border border-amber-500/30 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                      <Lock className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-black text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                        <span>Bonus & Balance Withdrawal Locked</span>
                        <span className="px-1.5 py-0.5 bg-amber-500 text-slate-950 text-[9px] font-extrabold rounded">VIP REQUIRED</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                        Your <strong>$5.00 USDT Welcome Bonus</strong> and account funds are locked for direct crypto withdrawal under APEX anti-abuse rules. You must activate at least one <strong>VIP Staking Plan</strong> before balance payouts can be transferred to an external crypto wallet. You can apply your $5.00 Welcome Bonus directly towards buying any VIP Plan!
                      </p>
                    </div>
                  </div>

                  {onNavigateVIP && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigateVIP();
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95"
                    >
                      <Crown className="w-4 h-4 fill-slate-950" />
                      <span>Apply Bonus & Activate VIP Plan ($10 Minimum)</span>
                    </button>
                  )}
                </div>
              ) : hasReachedDailyLimit ? (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                    <ShieldAlert className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center justify-between gap-2">
                      <span>Daily Limit Reached (1/1 Per 24h)</span>
                      <span className="px-1.5 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px] font-mono rounded">
                        24H COOLDOWN
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      APEX security protocol permits a maximum of <strong>1 withdrawal per 24 hours</strong>. Your withdrawal of <strong>${Math.abs(last24hWithdrawal?.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong> was processed on {new Date(last24hWithdrawal?.timestamp || 0).toLocaleTimeString()}. Next withdrawal window opens in ~<strong>{hoursRemaining} hour(s)</strong>.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
                      VIP Status Verified
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Direct crypto withdrawals unlocked for all yield payouts and account balances (Maximum 1 withdrawal per 24 hours).
                    </p>
                  </div>
                </div>
              )}

              {/* Available Balance Box */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Available Cash to Withdraw</span>
                  <span className="text-xs text-slate-500">Excludes locked margin in active positions</span>
                </div>
                <span className="text-base font-bold font-mono text-amber-400">
                  ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Crypto Asset / Network Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Select Crypto Network / Asset
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['USDT (TRC20)', 'USDT (BEP20)'].map(asset => (
                    <button
                      key={asset}
                      type="button"
                      onClick={() => setCryptoAsset(asset)}
                      className={`py-2 px-2 rounded-xl border text-[11px] font-bold transition-all text-center ${
                        cryptoAsset === asset
                          ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-sm'
                          : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {asset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Destination Wallet Address Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Destination {cryptoAsset} Wallet Address
                </label>
                <input
                  type="text"
                  value={cryptoAddress}
                  onChange={e => {
                    setCryptoAddress(e.target.value);
                    setErrorMsg(null);
                  }}
                  required
                  placeholder={`Paste your ${cryptoAsset} payout address...`}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Amount Input */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Withdrawal Amount (USD)
                  </label>
                  <div className="flex gap-1.5">
                    {[25, 50, 75, 100].map(pct => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => handlePercentage(pct)}
                        className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-300 hover:text-white transition-colors"
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={amount}
                    onChange={e => {
                      setAmount(e.target.value);
                      setErrorMsg(null);
                    }}
                    required
                    placeholder="1000"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-base font-mono font-semibold text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Security PIN verification */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Security Authorization PIN
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    maxLength={4}
                    value={securityPin}
                    onChange={e => setSecurityPin(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono tracking-widest text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Support Callout */}
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Withdrawal support:</span>
                <div className="flex items-center gap-2">
                  <a
                    href="https://t.me/+17426664547"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sky-400 font-bold hover:underline"
                  >
                    <Send className="w-3 h-3" />
                    <span>Telegram</span>
                  </a>
                  <span>•</span>
                  <a
                    href="mailto:spoiremongae@gmail.com"
                    className="inline-flex items-center gap-1 text-amber-400 font-bold hover:underline"
                  >
                    <Mail className="w-3 h-3" />
                    <span>Email</span>
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || !hasVipPlan || hasReachedDailyLimit || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > availableBalance}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <span>Processing...</span>
                  ) : !hasVipPlan ? (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>VIP Plan Required to Withdraw</span>
                    </>
                  ) : hasReachedDailyLimit ? (
                    <>
                      <Lock className="w-4 h-4 text-amber-950" />
                      <span>Daily Limit Reached (1/24h)</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Confirm Crypto Withdrawal</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
