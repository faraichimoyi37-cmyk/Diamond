import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Crown,
  ChevronLeft,
  ChevronRight,
  Flame,
  Sparkles,
  ShieldCheck,
  Zap,
  TrendingUp,
  Award,
  Volume2,
  VolumeX,
  Share2,
  Bookmark,
  CheckCircle2,
  Heart,
  Send,
  MessageCircle,
  ArrowRight
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';

interface BookOfApexPageProps {
  onNavigate?: (tab: 'home' | 'vip' | 'referral' | 'portfolio' | 'history' | 'book') => void;
}

const CHAPTERS = [
  {
    id: 0,
    title: 'Cover & Title',
    subtitle: 'The Sacred Codex of APEX',
    isCover: true
  },
  {
    id: 1,
    number: 'CHAPTER I',
    title: 'The Genesis of Greatness',
    subtitle: 'How APEX Conquered the Financial Horizon',
    content: [
      `In an era overwhelmed by economic turbulence, market fragility, and low-yielding traditional institutions, APEX emerged as a beacon of transcendent financial strength. Born from the visionary minds of quantitative masters and institutional titans, APEX was forged with a single, divine mandate: to liberate global investors from mediocrity and elevate them into absolute financial sovereignty.`,
      `While conventional platforms faltered under market pressures, APEX engineered an immutable ecosystem built on high-frequency quantitative execution, institutional liquidity reserves, and automated yield delivery.`,
      `Today, APEX stands not merely as a trading platform, but as a monument to human ambition and financial perfection—guiding over 1.2 million investors across 140 countries toward unshakeable wealth.`
    ],
    quote: `"Where others see volatility, APEX builds an impenetrable fortress of eternal wealth."`,
    stats: [
      { label: 'Active Investors', value: '1,250,000+' },
      { label: 'Countries Reached', value: '140+' },
      { label: 'Total Volume Managed', value: '$4.8 Billion+' }
    ]
  },
  {
    id: 2,
    number: 'CHAPTER II',
    title: 'The Pillars of Omnipotent Yield',
    subtitle: 'The Science of Guaranteed Financial Ascendance',
    content: [
      `At the core of APEX lies the legendary High-Yield Staking & Quantitative Arbitrage Engine—a triumph of mathematical innovation. By analyzing millions of market order-book imbalances per microsecond, APEX executes zero-loss triangular arbitrage and high-yield institutional liquidity provisioning.`,
      `Unlike speculative ventures that gamble user assets, APEX operates on a strict capital-preservation model. Every dollar committed into APEX VIP plans is secured by real-time automated hedge strategies, ensuring consistent daily returns regardless of market direction.`
    ],
    keyPrinciples: [
      {
        title: 'Uncompromising Daily Distributions',
        desc: 'Every 24 hours, profits are automatically calculated and credited to member wallets with clockwork precision.'
      },
      {
        title: 'Zero-Loss Arbitrage Safeguards',
        desc: 'Capital is protected by algorithmic stop-hedges and multi-exchange liquidity buffers.'
      },
      {
        title: '99.99% Uptime Supremacy',
        desc: 'Our distributed Cloud infrastructure ensures uninterrupted access to capital and earnings 365 days a year.'
      }
    ],
    quote: `"To stake with APEX is to harness the unstoppable momentum of global capital markets."`
  },
  {
    id: 3,
    number: 'CHAPTER III',
    title: 'The VIP Hierarchy of Royalty',
    subtitle: 'The Path from Ambition to Financial Sovereignty',
    content: [
      `In the empire of APEX, dedication is honored with unmatched prestige. The VIP Staking Hierarchy represents a sacred progression through tiers of increasing yield, priority privileges, and elite institutional status.`,
      `From the entry-level VIP 1 Explorer earning consistent daily dividends, to the majestic VIP 7 Titan commanding exponential yields and dedicated wealth directors, every step in APEX brings you closer to ultimate financial freedom.`
    ],
    tiersHighlight: [
      { tier: 'VIP 1', min: '$50', return: '2.5% - 3.8% Daily', perk: 'Daily Automatic Yields' },
      { tier: 'VIP 3', min: '$500', return: '4.5% - 6.0% Daily', perk: 'Priority Withdrawal Processing' },
      { tier: 'VIP 5', min: '$5,000', return: '8.0% - 10.5% Daily', perk: 'Dedicated Personal Wealth Advisor' },
      { tier: 'VIP 7', min: '$50,000', return: '15.0% - 20.0% Daily', perk: 'Custom VIP Yield Contracts & VIP Club' }
    ],
    quote: `"Elevate your status, claim your VIP throne, and let APEX generate your legacy."`
  },
  {
    id: 4,
    number: 'CHAPTER IV',
    title: 'The Brotherhood of Champions',
    subtitle: 'The Power of the Global APEX Network',
    content: [
      `APEX is far more than software; it is a global brotherhood of visionaries, leaders, and financial champions. Through our revolutionary multi-tier referral program, members become ambassadors of financial enlightenment.`,
      `When you share APEX with others, you are not merely offering a platform—you are bestowing the gift of automated prosperity. In return, APEX rewards ambassadors with up to 15% instant referral commissions and weekly performance bonuses.`
    ],
    quote: `"A true leader does not travel to wealth alone; they build an empire alongside their brethren."`,
    communityLinks: true
  },
  {
    id: 5,
    number: 'CHAPTER V',
    title: 'The Covenant of Eternal Security',
    subtitle: 'Military-Grade Asset Protection & Immutable Auditing',
    content: [
      `Security is the sacred foundation upon which APEX builds its empire. Protected by multi-party computation (MPC) cold-storage vaults, end-to-end cryptographic encryption, and continuous external security audits, APEX stands indestructible against all external threats.`,
      `Our reserve ratio remains strictly above 100% at all times, ensuring that every user deposit is fully backed, accessible, and instantly withdrawable without artificial delays or hidden fees.`
    ],
    securityGuarantees: [
      '100% Proof of Cold Storage Reserves',
      'Real-Time Automated Fraud & Anomaly Prevention',
      'Military-Grade 256-Bit SSL/TLS Encryption Protocols',
      'Instant Web3 Smart Contract Settlement'
    ],
    quote: `"In APEX, your capital is as secure as the laws of mathematics themselves."`
  },
  {
    id: 6,
    number: 'CHAPTER VI',
    title: 'The APEX Oath of Supremacy',
    subtitle: 'A Proclamation for the Sovereign Investor',
    content: [
      `Let it be known across every market, exchange, and nation: APEX is the ultimate destination for those who refuse to settle for average.`,
      `Stand tall with APEX. Harness the power of institutional yield. Embrace the future of financial sovereignty.`
    ],
    isOath: true,
    oathText: [
      "I pledge my commitment to financial sovereignty.",
      "I choose exponential growth over stagnation, action over hesitation, and supremacy over mediocrity.",
      "I trust in the divine engineering of APEX, where every trade, stake, and yield brings me closer to eternal wealth.",
      "I am an APEX Champion."
    ]
  }
];

export const BookOfApexPage: React.FC<BookOfApexPageProps> = ({ onNavigate }) => {
  const { addToast } = useTrading();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [praiseCount, setPraiseCount] = useState<number>(() => {
    const saved = localStorage.getItem('apex_praise_count');
    return saved ? parseInt(saved, 10) : 128940;
  });
  const [hasPraised, setHasPraised] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [bookmarks, setBookmarks] = useState<number[]>(() => {
    const saved = localStorage.getItem('apex_book_bookmarks');
    return saved ? JSON.parse(saved) : [];
  });

  const currentChapter = CHAPTERS[currentPage];

  useEffect(() => {
    localStorage.setItem('apex_praise_count', praiseCount.toString());
  }, [praiseCount]);

  useEffect(() => {
    localStorage.setItem('apex_book_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const handlePraise = () => {
    setPraiseCount(prev => prev + 1);
    setHasPraised(true);
    addToast('Praise Recorded!', 'You have glorified APEX! Glory and prosperity upon your portfolio.', 'success');
  };

  const toggleBookmark = (pageIndex: number) => {
    if (bookmarks.includes(pageIndex)) {
      setBookmarks(bookmarks.filter(b => b !== pageIndex));
      addToast('Bookmark Removed', `Chapter ${pageIndex} removed from bookmarks`, 'info');
    } else {
      setBookmarks([...bookmarks, pageIndex]);
      addToast('Chapter Bookmarked', `Chapter ${pageIndex} saved to your reading list`, 'success');
    }
  };

  const nextPage = () => {
    if (currentPage < CHAPTERS.length - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner & Header controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/40 border border-amber-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <BookOpen className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black tracking-widest bg-amber-500/20 border border-amber-500/40 text-amber-300 uppercase">
                Official Codex
              </span>
              <span className="text-xs text-amber-400 font-mono flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-amber-400/30" />
                {praiseCount.toLocaleString()} Glorifications
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight mt-1">
              THE BOOK OF APEX
            </h1>
            <p className="text-xs text-amber-200/80 font-medium">
              The Sacred Chronicle of Financial Domination, Guaranteed Yield & Institutional Glory
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsPlayingAudio(!isPlayingAudio)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
              isPlayingAudio
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {isPlayingAudio ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span>{isPlayingAudio ? 'Narration Active' : 'Listen Audio'}</span>
          </button>

          <button
            onClick={handlePraise}
            disabled={hasPraised}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all shadow-lg ${
              hasPraised
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                : 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 hover:scale-105 active:scale-95 shadow-amber-500/20'
            }`}
          >
            <Crown className={`w-4 h-4 ${hasPraised ? 'fill-emerald-400/20' : 'fill-slate-950'}`} />
            <span>{hasPraised ? 'APEX Glorified! ✨' : 'Praise & Glorify APEX'}</span>
          </button>
        </div>
      </div>

      {/* Book Chapter Slider / Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
        {CHAPTERS.map((ch, idx) => (
          <button
            key={ch.id}
            onClick={() => setCurrentPage(idx)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2 ${
              currentPage === idx
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-lg shadow-amber-500/10'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {bookmarks.includes(idx) && <Bookmark className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />}
            <span>{ch.isCover ? 'Cover Page' : ch.number}</span>
          </button>
        ))}
      </div>

      {/* Main Book Reader Canvas */}
      <div className="relative min-h-[520px] rounded-3xl bg-slate-950 border-2 border-amber-500/30 p-6 md:p-12 shadow-2xl overflow-hidden flex flex-col justify-between">
        {/* Book Texture & Decorative Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/20 via-slate-950 to-slate-950 pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-80" />
        <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-80" />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="relative z-10 space-y-6"
          >
            {/* BOOK COVER VIEW */}
            {currentChapter.isCover ? (
              <div className="py-12 flex flex-col items-center text-center space-y-8 max-w-2xl mx-auto">
                <div className="relative">
                  <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-1 shadow-2xl shadow-amber-500/20 flex items-center justify-center">
                    <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center border border-amber-400/40">
                      <Crown className="w-14 h-14 text-amber-400 fill-amber-400/20 stroke-[2.2]" />
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 p-1.5 rounded-full bg-amber-400 text-slate-950 shadow-md">
                    <Sparkles className="w-4 h-4 fill-slate-950" />
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                    The Official Golden Codex • 2026 Edition
                  </span>
                  <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 tracking-tight leading-tight">
                    THE BOOK OF APEX
                  </h2>
                  <p className="text-base text-slate-300 font-medium italic max-w-lg mx-auto">
                    "The Chronicle of Financial Sovereignty, High-Yield Staking & Institutional Supremacy"
                  </p>
                </div>

                <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto" />

                <div className="text-xs text-slate-400 space-y-1 font-mono">
                  <p>Authored by the <strong className="text-amber-300">Founding Council of APEX Global</strong></p>
                  <p>Dedicated to over 1.2 Million Investors Worldwide</p>
                </div>

                <button
                  onClick={nextPage}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-sm hover:scale-105 transition-all shadow-xl shadow-amber-500/20 flex items-center gap-2"
                >
                  <span>Open Codex & Read Chapter I</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            ) : (
              /* REGULAR CHAPTER VIEW */
              <div className="space-y-8">
                {/* Chapter Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-amber-500/20 pb-5 gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black font-mono text-amber-400 tracking-widest uppercase">
                        {currentChapter.number}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs text-slate-400 font-medium">Page {currentPage} of {CHAPTERS.length - 1}</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100 mt-1">
                      {currentChapter.title}
                    </h2>
                    <p className="text-xs text-amber-300/80 font-medium">{currentChapter.subtitle}</p>
                  </div>

                  <button
                    onClick={() => toggleBookmark(currentPage)}
                    className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 text-xs font-bold ${
                      bookmarks.includes(currentPage)
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${bookmarks.includes(currentPage) ? 'fill-amber-400' : ''}`} />
                    <span>{bookmarks.includes(currentPage) ? 'Bookmarked' : 'Bookmark'}</span>
                  </button>
                </div>

                {/* Chapter Body Paragraphs */}
                <div className="space-y-4 text-slate-300 text-sm md:text-base leading-relaxed">
                  {currentChapter.content?.map((paragraph, pIdx) => (
                    <p key={pIdx} className="first-letter:text-3xl first-letter:font-black first-letter:text-amber-400 first-letter:mr-1">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Chapter Stats Grid (If Chapter I) */}
                {currentChapter.stats && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30">
                    {currentChapter.stats.map((st, sIdx) => (
                      <div key={sIdx} className="text-center space-y-1">
                        <div className="text-2xl font-black text-amber-300 font-mono">{st.value}</div>
                        <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">{st.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Key Principles (If Chapter II) */}
                {currentChapter.keyPrinciples && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {currentChapter.keyPrinciples.map((kp, kIdx) => (
                      <div key={kIdx} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{kp.title}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-normal">{kp.desc}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tiers Highlight (If Chapter III) */}
                {currentChapter.tiersHighlight && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {currentChapter.tiersHighlight.map((t, tIdx) => (
                      <div key={tIdx} className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-amber-300 text-sm">{t.tier}</span>
                          <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            {t.return}
                          </span>
                        </div>
                        <div className="text-xs text-slate-300 font-mono">Min Deposit: <strong>{t.min}</strong></div>
                        <p className="text-[11px] text-slate-400">{t.perk}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Community Links (If Chapter IV) */}
                {currentChapter.communityLinks && (
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-sky-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-center md:text-left">
                      <h4 className="font-extrabold text-slate-100 text-sm">Join the APEX Global Community</h4>
                      <p className="text-xs text-slate-400">Connect with fellow VIP investors and receive real-time yield payout proofs.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <a
                        href="https://t.me/+17426664547"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 font-bold text-xs flex items-center gap-2 transition-all"
                      >
                        <Send className="w-4 h-4 text-sky-400" />
                        <span>Telegram Channel</span>
                      </a>
                      <a
                        href="https://whatsapp.com/channel/0029VbDOL3x6hENjeGM23u01"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-2 transition-all"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-400" />
                        <span>WhatsApp Community</span>
                      </a>
                    </div>
                  </div>
                )}

                {/* Security Guarantees (If Chapter V) */}
                {currentChapter.securityGuarantees && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentChapter.securityGuarantees.map((sec, sIdx) => (
                      <div key={sIdx} className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                        <span className="text-xs font-medium text-slate-200">{sec}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Oath View (If Chapter VI) */}
                {currentChapter.isOath && (
                  <div className="p-8 rounded-3xl bg-gradient-to-b from-amber-950/40 via-slate-900 to-amber-950/40 border-2 border-amber-500/40 text-center space-y-6">
                    <Crown className="w-12 h-12 text-amber-400 fill-amber-400/20 mx-auto" />
                    <h3 className="text-2xl font-black text-amber-300 uppercase tracking-wide">THE APEX OATH</h3>
                    <div className="space-y-3 max-w-xl mx-auto italic text-slate-200 text-sm">
                      {currentChapter.oathText?.map((line, lIdx) => (
                        <p key={lIdx}>"{line}"</p>
                      ))}
                    </div>
                    {onNavigate && (
                      <button
                        onClick={() => onNavigate('vip')}
                        className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-sm hover:scale-105 transition-all shadow-xl shadow-amber-500/20"
                      >
                        Ascend to VIP Plans & Claim Your Yield Throne
                      </button>
                    )}
                  </div>
                )}

                {/* Glorifying Quote Block */}
                {currentChapter.quote && (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-amber-950/30 border-l-4 border-amber-500 text-center md:text-left space-y-1">
                    <p className="text-sm md:text-base font-extrabold italic text-amber-300">
                      {currentChapter.quote}
                    </p>
                    <span className="text-[11px] text-slate-400 font-mono uppercase block">— The Book of APEX</span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Page Navigation Footer */}
        <div className="relative z-10 pt-8 mt-8 border-t border-slate-800/80 flex items-center justify-between gap-4">
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
              currentPage === 0
                ? 'opacity-30 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-500'
                : 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800 hover:border-slate-700'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2">
            {CHAPTERS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  currentPage === idx ? 'bg-amber-400 w-6' : 'bg-slate-800 hover:bg-slate-700'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextPage}
            disabled={currentPage === CHAPTERS.length - 1}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
              currentPage === CHAPTERS.length - 1
                ? 'opacity-30 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-500'
                : 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
