import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { DepositModal } from './DepositModal';
import { WithdrawModal } from './WithdrawModal';
import { AuthModal } from './Auth/AuthModal';
import {
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  PieChart,
  History,
  Crown,
  Users,
  Home as HomeIcon,
  User,
  LogOut,
  LogIn,
  UserPlus,
  ChevronDown,
  MessageCircle,
  ExternalLink,
  Send,
  Mail,
  BookOpen
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'home' | 'vip' | 'referral' | 'portfolio' | 'history' | 'book';
  setActiveTab: (tab: 'home' | 'vip' | 'referral' | 'portfolio' | 'history' | 'book') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const {
    user,
    isAuthenticated,
    openAuthModal,
    logout,
    availableBalance,
    equity,
    vipSubscriptions
  } = useTrading();

  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const activeSubsCount = vipSubscriptions.filter(s => s.status === 'ACTIVE').length;

  return (
    <>
      <header className="bg-slate-950 border-b border-slate-800/80 sticky top-0 z-40 text-slate-100">
        {/* Top VIP Announcement Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border-b border-slate-800/50 px-4 py-1.5 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <Crown className="w-3.5 h-3.5 fill-amber-400/20" />
            <span className="text-[11px] uppercase tracking-wider">VIP Staking Platform Active</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono uppercase">
              High Yield Tiers
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-[11px] text-slate-400 font-mono flex-wrap justify-end">
            <span>Active Contracts: <strong className="text-emerald-400">{activeSubsCount}</strong></span>
            <span className="hidden sm:inline">•</span>
            <a
              href="mailto:spoiremongae@gmail.com"
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-sans font-bold text-[11px] transition-all shadow-sm hover:scale-105"
            >
              <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>spoiremongae@gmail.com</span>
            </a>
            <a
              href="https://t.me/+17426664547"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 font-sans font-bold text-[11px] transition-all shadow-sm hover:scale-105"
            >
              <Send className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>Telegram (+17426664547)</span>
              <ExternalLink className="w-2.5 h-2.5 text-sky-400 shrink-0" />
            </a>
            <a
              href="https://whatsapp.com/channel/0029VbDOL3x6hENjeGM23u01"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-sans font-bold text-[11px] transition-all shadow-sm hover:scale-105"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20 shrink-0" />
              <span>WhatsApp</span>
              <ExternalLink className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
            </a>
          </div>
        </div>

        {/* Main Header Navbar */}
        <div className="px-4 py-3 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-400 text-slate-950 shadow-lg shadow-amber-500/10 font-black">
                <Crown className="w-5 h-5 fill-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    APEX VIP
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-widest">
                    STAKING
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 -mt-0.5 font-medium">Daily Income Tiers</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('home')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs transition-all ${
                  activeTab === 'home'
                    ? 'bg-slate-800 text-white font-bold shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <HomeIcon className="w-3.5 h-3.5 text-sky-400" />
                <span>Home</span>
              </button>

              <button
                onClick={() => setActiveTab('vip')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs transition-all ${
                  activeTab === 'vip'
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                <span>VIP Plans</span>
              </button>

              <button
                onClick={() => setActiveTab('referral')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs transition-all ${
                  activeTab === 'referral'
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>Invite & Earn</span>
              </button>

              <button
                onClick={() => setActiveTab('portfolio')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs transition-all ${
                  activeTab === 'portfolio'
                    ? 'bg-slate-800 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <PieChart className="w-3.5 h-3.5 text-purple-400" />
                <span>Wallet & Capital</span>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs transition-all ${
                  activeTab === 'history'
                    ? 'bg-slate-800 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <History className="w-3.5 h-3.5 text-sky-400" />
                <span>History</span>
              </button>

              <button
                onClick={() => setActiveTab('book')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs transition-all ${
                  activeTab === 'book'
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 shadow-sm shadow-amber-500/10'
                    : 'text-amber-400/90 hover:text-amber-300 hover:bg-amber-500/10'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                <span>Book of APEX</span>
              </button>
            </nav>
          </div>

          {/* Right Wallet & Actions Panel */}
          <div className="flex items-center gap-3">
            {/* Balance Stats Summary */}
            <div className="hidden lg:flex items-center gap-4 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 leading-none">Total Net Equity</div>
                  <div className="text-xs font-bold font-mono text-slate-100">
                    ${equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div className="w-px h-6 bg-slate-800" />

              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 leading-none">Available Cash</div>
                <div className="text-xs font-mono font-semibold text-emerald-400">
                  ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Deposit & Withdraw Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDepositOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
                <span>Deposit</span>
              </button>

              <button
                onClick={() => setIsWithdrawOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all active:scale-95"
              >
                <ArrowUpRight className="w-4 h-4 text-amber-400" />
                <span>Withdraw</span>
              </button>
            </div>

            {/* Auth / Account Profile Section */}
            <div className="relative border-l border-slate-800 pl-3 ml-1">
              {isAuthenticated && user ? (
                <div>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 transition-all"
                  >
                    <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xs">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left hidden sm:block">
                      <div className="text-xs font-bold leading-tight flex items-center gap-1">
                        <span>{user.username}</span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                          {user.vipTier}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block font-mono">{user.id}</span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 p-2 space-y-1 text-xs">
                      <div className="px-3 py-2 border-b border-slate-800/80">
                        <div className="font-bold text-slate-100">{user.username}</div>
                        <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
                          <Crown className="w-3 h-3 text-amber-400" />
                          <span>{user.vipTier} Staking Account</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setActiveTab('portfolio');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 text-left transition-colors font-medium"
                      >
                        <Wallet className="w-4 h-4 text-emerald-400" />
                        <span>Wallet & Capital</span>
                      </button>

                      <a
                        href="mailto:spoiremongae@gmail.com"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 transition-colors font-semibold text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                          <span className="truncate">spoiremongae@gmail.com</span>
                        </div>
                      </a>

                      <a
                        href="https://t.me/+17426664547"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/20 transition-colors font-semibold text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Send className="w-4 h-4 text-sky-400" />
                          <span>Telegram (+17426664547)</span>
                        </div>
                        <ExternalLink className="w-3 h-3 text-sky-400" />
                      </a>

                      <a
                        href="https://whatsapp.com/channel/0029VbDOL3x6hENjeGM23u01"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 transition-colors font-semibold text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                          <span>WhatsApp Channel</span>
                        </div>
                        <ExternalLink className="w-3 h-3 text-emerald-400" />
                      </a>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          openAuthModal('signin');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 text-left transition-colors font-medium"
                      >
                        <User className="w-4 h-4 text-amber-400" />
                        <span>Switch Account</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 text-left transition-colors font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openAuthModal('signin')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold transition-all"
                  >
                    <LogIn className="w-3.5 h-3.5 text-amber-400" />
                    <span>Sign In</span>
                  </button>

                  <button
                    onClick={() => openAuthModal('signup')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-extrabold uppercase tracking-wider shadow-md shadow-amber-500/10 transition-all"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Sign Up</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
      <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} />
      <WithdrawModal isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)} onNavigateVIP={() => setActiveTab('vip')} />
      <AuthModal />
    </>
  );
};
