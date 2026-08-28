import React, { useState, useMemo, useEffect } from 'react';
import { useTrading } from '../../context/TradingContext';
import {
  Users,
  Copy,
  Check,
  Share2,
  Gift,
  Sparkles,
  TrendingUp,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Award,
  Link2,
  Send,
  MessageCircle,
  Mail,
  ExternalLink,
  UserCheck,
  Clock,
  QrCode,
  Edit3,
  X,
  UserPlus,
  Zap,
  Plus
} from 'lucide-react';

import { getPublicReferralLink, getOrCreateUserReferralCode, setUserCustomReferralCode } from '../../utils/referral';

export const ReferralPage: React.FC = () => {
  const { user, availableBalance, addToast, registerReferralMember } = useTrading();
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Get active personal referral code
  const initialCode = useMemo(() => getOrCreateUserReferralCode(user), [user]);
  const [referralCode, setReferralCode] = useState(initialCode);
  const [customCodeInput, setCustomCodeInput] = useState(initialCode);

  const referralLink = useMemo(() => getPublicReferralLink(referralCode), [referralCode]);

  useEffect(() => {
    const handleStorageChange = () => setRefreshTrigger(prev => prev + 1);
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    addToast('Link Copied!', 'Your personal invitation link has been copied to clipboard.', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    addToast('Code Copied!', 'Your invite code has been copied to clipboard.', 'success');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleSaveCustomCode = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = setUserCustomReferralCode(customCodeInput);
    if (!clean || clean.length < 3) {
      addToast('Invalid Code', 'Referral code must be at least 3 alphanumeric characters.', 'error');
      return;
    }
    setReferralCode(clean);
    setIsEditingCode(false);
    addToast('Referral Code Updated', `Your personal invite code is now ${clean}`, 'success');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join APEX VIP Staking Platform',
          text: `Join APEX VIP Staking with my exclusive invite code ${referralCode} and earn up to 19% daily income on your crypto!`,
          url: referralLink,
        });
      } catch (err) {
        console.log('Share dismissed');
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDirectInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const success = registerReferralMember(inviteName, inviteEmail);
    if (success) {
      setInviteName('');
      setInviteEmail('');
      setShowInviteModal(false);
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const handleQuickDemoInvite = () => {
    const demoNames = ['jordan_crypto', 'marcus_invests', 'elena_trader', 'david_vip', 'sophia_wealth', 'lucas_apex'];
    const randomName = demoNames[Math.floor(Math.random() * demoNames.length)] + '_' + Math.floor(100 + Math.random() * 900);
    const success = registerReferralMember(randomName, `${randomName}@gmail.com`);
    if (success) {
      setShowInviteModal(false);
      setRefreshTrigger(prev => prev + 1);
    }
  };

  // Real-time invited team calculation from registered users
  const { myReferees, referralStats } = useMemo(() => {
    let usersList: any[] = [];
    try {
      const stored = localStorage.getItem('registered_users');
      if (stored) usersList = JSON.parse(stored);
    } catch (e) {
      console.error('Error reading registered users:', e);
    }

    const possibleCodes = [
      referralCode.toLowerCase(),
      (user?.referralCode || '').toLowerCase(),
      'vip-89421-ref',
      (user?.username || '').toLowerCase(),
      (user?.email || '').toLowerCase()
    ].filter(Boolean);

    // Filter partners referred by this user's code
    const list = usersList.filter((u: any) => 
      u.referredBy && possibleCodes.includes(u.referredBy.toLowerCase())
    ).sort((a: any, b: any) => (b.joinedAt || 0) - (a.joinedAt || 0));

    const activeCount = list.filter((u: any) => u.vipTier && u.vipTier !== 'NONE').length;
    
    // Calculate total commission ($2.50 USDT per active direct referral)
    const totalEarned = list.length * 2.50;
    const pending = activeCount * 1.25;

    return {
      myReferees: list,
      referralStats: {
        totalInvites: list.length,
        activeInvestors: activeCount,
        totalCommissionEarned: totalEarned,
        pendingCommission: pending
      }
    };
  }, [referralCode, user, refreshTrigger]);

  const inviteTiers = [
    { level: 'Tier 1 Direct Invite', commission: '10% Daily Yield Bonus', minStaked: '$10+' },
    { level: 'Tier 2 Secondary Referral', commission: '5% Daily Yield Bonus', minStaked: '$100+' },
    { level: 'Tier 3 VIP Partner', commission: '2.5% Daily Yield Bonus', minStaked: '$1,000+' }
  ];

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(referralLink)}`;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8 text-slate-100">
      {/* Referral Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-950 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wide uppercase">
            <Users className="w-4 h-4" />
            <span>Invite & Earn Commission</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            Invite Friends & Earn Daily VIP Referral Rewards
          </h1>

          <p className="text-slate-400 text-sm leading-relaxed">
            Every user receives a unique personal invitation link. Earn up to 10% instant commission whenever your invited partners join and subscribe to any VIP Daily Income Staking Plan!
          </p>

          {/* Referral Link & Code Box */}
          <div className="pt-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Unique Link Input */}
              <div className="md:col-span-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Your Personal Invitation Link
                  </label>
                  <button
                    onClick={() => setShowQrModal(true)}
                    className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                  >
                    <QrCode className="w-3 h-3" />
                    <span>Show QR Code</span>
                  </button>
                </div>
                <div className="relative flex items-center">
                  <Link2 className="w-4 h-4 text-emerald-400 absolute left-3.5" />
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    className="w-full pl-10 pr-24 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-mono font-bold text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="absolute right-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase transition-all flex items-center gap-1.5 shadow-md active:scale-95"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Referral Code Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Invite Code
                  </label>
                  <button
                    onClick={() => setIsEditingCode(!isEditingCode)}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{isEditingCode ? 'Cancel' : 'Customize'}</span>
                  </button>
                </div>

                {isEditingCode ? (
                  <form onSubmit={handleSaveCustomCode} className="relative flex items-center">
                    <input
                      type="text"
                      value={customCodeInput}
                      onChange={e => setCustomCodeInput(e.target.value.toUpperCase())}
                      placeholder="CUSTOM-CODE"
                      className="w-full px-3 py-3 bg-slate-950 border border-amber-500/50 rounded-2xl text-xs font-mono font-bold text-amber-300 focus:outline-none uppercase"
                    />
                    <button
                      type="submit"
                      className="absolute right-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase transition-all"
                    >
                      Save
                    </button>
                  </form>
                ) : (
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      readOnly
                      value={referralCode}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-mono font-bold text-amber-400 focus:outline-none"
                    />
                    <button
                      onClick={handleCopyCode}
                      className="absolute right-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase transition-all flex items-center gap-1 active:scale-95"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Share Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Share via:</span>

              <button
                onClick={() => setShowInviteModal(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95 mr-2"
              >
                <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>＋ Invite Member</span>
              </button>

              <button
                onClick={handleShare}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-slate-200 hover:text-emerald-400 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Link</span>
              </button>

              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(`Join APEX VIP Staking with code ${referralCode}!`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 text-sky-400 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Telegram</span>
              </a>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Join APEX VIP Staking using my invitation link: ${referralLink}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>

              <a
                href={`mailto:?subject=${encodeURIComponent('Invitation to APEX VIP Staking')}&body=${encodeURIComponent(`Join APEX VIP Staking using my link: ${referralLink}`)}`}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Invited Partners</span>
          <div className="text-2xl font-extrabold font-mono text-slate-100">
            {referralStats.totalInvites} Users
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold">{referralStats.activeInvestors} active VIP subscribers</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Commission Earned</span>
          <div className="text-2xl font-extrabold font-mono text-emerald-400">
            ${referralStats.totalCommissionEarned.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-500">Credited directly to wallet cash</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Rewards</span>
          <div className="text-2xl font-extrabold font-mono text-amber-400">
            ${referralStats.pendingCommission.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-500">Auto-settling upon plan maturity</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Your Active Invite Code</span>
          <div className="text-xl font-extrabold font-mono text-sky-400">
            {referralCode}
          </div>
          <span className="text-[11px] text-slate-500">Share on Telegram, WhatsApp, or Twitter</span>
        </div>
      </div>

      {/* Commission Structure Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Gift className="w-5 h-5 text-amber-400" />
          <span>Multi-Tier Partner Commission Structure</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {inviteTiers.map((tier, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-emerald-400 uppercase">{tier.level}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 font-bold border border-slate-800">
                  Min {tier.minStaked}
                </span>
              </div>
              <div className="text-xl font-black text-slate-100">{tier.commission}</div>
              <p className="text-xs text-slate-400">
                Receive recurring bonus earnings every time your referral earns daily yield or upgrades VIP tiers.
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Invited Team Activity Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <span>Invited Team Activity & Rewards ({myReferees.length})</span>
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>＋ Invite Member</span>
            </button>
            <button
              onClick={handleQuickDemoInvite}
              className="px-3.5 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>⚡ Demo Referral</span>
            </button>
          </div>
        </div>

        {myReferees.length === 0 ? (
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-8 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Users className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-200 text-base">No Invited Partners Registered Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Share your personal invitation link with your friends or trading community. You will automatically receive up to 10% instant commission when they register!
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all inline-flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>Invite New Partner</span>
              </button>
              <button
                onClick={handleCopyLink}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition-all inline-flex items-center gap-2 active:scale-95"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Invite Link</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900/80 text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">User</th>
                    <th className="py-3.5 px-4 font-bold">Joined</th>
                    <th className="py-3.5 px-4 font-bold">Active VIP Plan</th>
                    <th className="py-3.5 px-4 font-bold">Status</th>
                    <th className="py-3.5 px-4 font-bold text-right">Commission Earned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {myReferees.map((item: any) => {
                    const isNew = (Date.now() - (item.joinedAt || 0)) < 86400000;
                    return (
                      <tr key={item.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-100">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xs font-bold">
                              {item.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-100 text-xs">@{item.username}</span>
                                {isNew && (
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black uppercase tracking-wider animate-pulse">
                                    NEW
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 font-normal font-sans">{item.email || `${item.username}@gmail.com`}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 text-[11px]">
                          <div>{new Date(item.joinedAt || Date.now()).toLocaleDateString()}</div>
                          <div className="text-[10px] text-slate-500">{new Date(item.joinedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                            {item.vipTier || 'VIP 1'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            <span>ACTIVE</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-emerald-400 text-right">
                          +$2.50 USDT
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Telegram Support & Community Channel Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-sky-950/60 via-slate-900 to-slate-950 border border-sky-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-lg shadow-sky-500/10 shrink-0">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
              <span>Official Telegram Support & WhatsApp Channel</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">
                Official
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Email support at <strong className="text-amber-400">spoiremongae@gmail.com</strong>, contact Telegram at <strong className="text-sky-300">+17426664547</strong>, or track daily VIP payout proofs in our WhatsApp Community.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <a
            href="mailto:spoiremongae@gmail.com"
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
          >
            <Mail className="w-4 h-4 fill-slate-950" />
            <span>Email</span>
          </a>

          <a
            href="https://t.me/+17426664547"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-sky-500/20 transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
          >
            <Send className="w-4 h-4 fill-slate-950" />
            <span>Telegram (+17426664547)</span>
            <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
          </a>

          <a
            href="https://whatsapp.com/channel/0029VbDOL3x6hENjeGM23u01"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
          >
            <MessageCircle className="w-4 h-4 fill-slate-950" />
            <span>WhatsApp</span>
            <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
          </a>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-lg text-slate-100">Personal Invitation QR</h3>
              <p className="text-xs text-slate-400">Scan using any smartphone camera to open your invite link directly</p>
            </div>

            <div className="bg-white p-4 rounded-2xl max-w-[220px] mx-auto shadow-inner flex items-center justify-center">
              <img src={qrCodeUrl} alt="Referral QR Code" className="w-full h-auto rounded-lg" />
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center font-mono text-[11px] font-bold text-emerald-400 truncate">
              {referralLink}
            </div>

            <button
              onClick={handleCopyLink}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase transition-all shadow-lg shadow-emerald-500/20"
            >
              Copy Link
            </button>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowInviteModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
                <UserPlus className="w-3 h-3" />
                <span>Invite & Register Member</span>
              </div>
              <h3 className="font-extrabold text-lg text-slate-100">Invite New Team Member</h3>
              <p className="text-xs text-slate-400">
                Register a partner under your referral code <strong className="text-amber-400 font-mono">{referralCode}</strong>. You will receive an instant <strong className="text-emerald-400">+$2.50 USDT</strong> commission!
              </p>
            </div>

            <form onSubmit={handleDirectInvite} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Member Username</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                  placeholder="e.g. alex_trader"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Member Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="e.g. alex.trader@gmail.com"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register & Add Partner (+$2.50 USDT)</span>
                </button>

                <button
                  type="button"
                  onClick={handleQuickDemoInvite}
                  className="w-full py-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>⚡ Quick Demo Referral Join</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
