import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Asset,
  Candle,
  Position,
  Order,
  Trade,
  LedgerTransaction,
  OrderBookEntry,
  RecentTrade,
  ToastMessage,
  PositionSide,
  OrderSide,
  OrderType,
  VipSubscription,
  UserProfile
} from '../types/trading';
import { VIP_PLANS } from '../data/vipPlans';
import { getInitialReferralCode } from '../utils/referral';
import {
  INITIAL_ASSETS,
  generateInitialCandles,
  generateOrderBook,
  generateRecentTrades
} from '../data/mockAssets';

interface TradingContextType {
  // User Authentication & Profile
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (identifier: string, pass: string) => boolean;
  signUp: (username: string, email: string, pass: string, refCode?: string) => boolean;
  logout: () => void;
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;

  assets: Asset[];
  selectedAsset: Asset;
  setSelectedAssetId: (id: string) => void;
  timeframe: string;
  setTimeframe: (tf: string) => void;
  candles: Candle[];
  orderBook: { asks: OrderBookEntry[]; bids: OrderBookEntry[] };
  recentTrades: RecentTrade[];
  
  // Wallet
  availableBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  lockedMargin: number;
  unrealizedPnL: number;
  realizedPnL: number;
  equity: number;
  
  // Trades & Orders
  positions: Position[];
  orders: Order[];
  tradeHistory: Trade[];
  ledger: LedgerTransaction[];
  
  // VIP Plans Staking
  vipSubscriptions: VipSubscription[];
  subscribeVipPlan: (planId: string, customAmount?: number) => boolean;
  claimVipEarnings: (subscriptionId: string) => void;
  deactivateVipPlan: (subscriptionId: string) => void;
  deactivateAllVipPlans: () => void;
  
  // Actions
  deposit: (amount: number, method: string, details?: string, customTxHash?: string) => boolean;
  withdraw: (amount: number, method: string, details?: string) => boolean;
  placeOrder: (params: {
    assetId: string;
    side: PositionSide;
    type: OrderType;
    price: number;
    size: number;
    leverage: number;
    stopLoss?: number;
    takeProfit?: number;
  }) => boolean;
  closePosition: (positionId: string, reason?: 'MANUAL' | 'STOP_LOSS' | 'TAKE_PROFIT' | 'LIQUIDATION') => void;
  cancelOrder: (orderId: string) => void;
  updatePositionSLTP: (positionId: string, stopLoss?: number, takeProfit?: number) => void;
  resetAccount: () => void;
  
  // Toasts
  toasts: ToastMessage[];
  addToast: (title: string, message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  
  // Watchlist
  watchlist: string[]; // asset IDs
  toggleWatchlist: (assetId: string) => void;
  
  // Referral Network
  registerReferralMember: (memberName?: string, memberEmail?: string) => boolean;

  // Account Management
  removeAllAccounts: () => void;

  // Simulation Controls
  isLiveSimulation: boolean;
  toggleLiveSimulation: () => void;
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);

const STORAGE_KEYS = {
  BALANCE: 'trading_platform_balance',
  POSITIONS: 'trading_platform_positions',
  ORDERS: 'trading_platform_orders',
  TRADES: 'trading_platform_trades',
  LEDGER: 'trading_platform_ledger',
  WATCHLIST: 'trading_platform_watchlist',
  DEPOSITED: 'trading_platform_deposited',
  WITHDRAWN: 'trading_platform_withdrawn',
  VIP_SUBS: 'trading_platform_vip_subs'
};

export const TradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Assets & Selected Asset
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [selectedAssetId, setSelectedAssetIdState] = useState<string>('btc-usd');
  const [timeframe, setTimeframe] = useState<string>('5m');
  
  const selectedAsset = assets.find(a => a.id === selectedAssetId) || assets[0];
  
  // Candle History
  const [candles, setCandles] = useState<Candle[]>(() =>
    generateInitialCandles(selectedAsset.price, 5, 80)
  );
  
  // OrderBook & Recent Trades
  const [orderBook, setOrderBook] = useState(() =>
    generateOrderBook(selectedAsset.price, selectedAsset.precision)
  );
  const [recentTrades, setRecentTrades] = useState<RecentTrade[]>(() =>
    generateRecentTrades(selectedAsset.price, selectedAsset.precision)
  );
  
  // Helper to identify and filter out old mock/test transactions
  const isTestTx = (tx: any) => {
    if (!tx || !tx.id) return true;
    if (tx.id === 'tx-init-001' || tx.id === 'tx-reset-001') return true;
    if (tx.amount === 30 || tx.amount === 1.8 || tx.amount === 31.8 || tx.amount === 25223.60 || tx.amount === 25000) return true;
    if (typeof tx.method === 'string' && tx.method.includes('undefined')) return true;
    if (typeof tx.description === 'string' && tx.description.includes('undefined')) return true;
    if (tx.id.includes('mslmmgfr') || tx.id.includes('mskrdr') || tx.id.includes('mslnqqt0') || tx.id.includes('mslnqy4z')) return true;
    return false;
  };

  const isTestSub = (s: any) => {
    if (!s || !s.id) return true;
    if (s.id.includes('mslnqqt0')) return true;
    if (s.investmentAmount === 30 || s.investmentAmount === 20) return true;
    if (s.dailyEarnings === 1.8 || s.dailyEarnings === 1.2) return true;
    return false;
  };

  // Ledger state loaded first
  const [ledger, setLedger] = useState<LedgerTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LEDGER);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        let welcomeBonusCount = 0;
        const seenIds = new Set<string>();
        return parsed.filter((tx: any) => !isTestTx(tx)).filter((tx: any) => {
          if (tx.type === 'WELCOME_BONUS') {
            welcomeBonusCount++;
            if (welcomeBonusCount > 1) return false;
          }
          if (tx.id && seenIds.has(tx.id)) return false;
          if (tx.id) seenIds.add(tx.id);
          return true;
        });
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Check valid transactions
  const hasWelcomeBonus = ledger.some(tx => tx.type === 'WELCOME_BONUS' && tx.status === 'COMPLETED');
  const realDeposits = ledger.filter(tx => tx.type === 'DEPOSIT' && tx.status === 'COMPLETED');
  const realWithdrawals = ledger.filter(tx => tx.type === 'WITHDRAW' && tx.status === 'COMPLETED');
  const hasUserDeposit = realDeposits.length > 0;

  // Wallet state - Default to 0.00 unless funds or deposit exist
  const [availableBalance, setAvailableBalance] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BALANCE);
    if (saved) {
      const val = parseFloat(saved);
      if (!isNaN(val) && (hasUserDeposit || hasWelcomeBonus)) return val;
    }
    return hasWelcomeBonus ? 5.00 : 0.00;
  });
  
  const [totalDeposited, setTotalDeposited] = useState<number>(() => {
    if (!hasUserDeposit) return 0.00;
    return realDeposits.reduce((sum, tx) => sum + tx.amount, 0);
  });
  
  const [totalWithdrawn, setTotalWithdrawn] = useState<number>(() => {
    if (realWithdrawals.length === 0) return 0.00;
    return realWithdrawals.reduce((sum, tx) => sum + tx.amount, 0);
  });
  
  // Positions & Orders
  const [positions, setPositions] = useState<Position[]>(() => {
    if (!hasUserDeposit) return [];
    const saved = localStorage.getItem(STORAGE_KEYS.POSITIONS);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [orders, setOrders] = useState<Order[]>(() => {
    if (!hasUserDeposit) return [];
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [tradeHistory, setTradeHistory] = useState<Trade[]>(() => {
    if (!hasUserDeposit) return [];
    const saved = localStorage.getItem(STORAGE_KEYS.TRADES);
    return saved ? JSON.parse(saved) : [];
  });

  const [watchlist, setWatchlist] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
    return saved ? JSON.parse(saved) : ['btc-usd', 'eth-usd', 'nvda-usd'];
  });

  const [vipSubscriptions, setVipSubscriptions] = useState<VipSubscription[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VIP_SUBS);
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return parsed.filter((s: any) => !isTestSub(s));
    } catch (e) {
      return [];
    }
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLiveSimulation, setIsLiveSimulation] = useState<boolean>(true);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BALANCE, availableBalance.toString());
  }, [availableBalance]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEPOSITED, totalDeposited.toString());
  }, [totalDeposited]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WITHDRAWN, totalWithdrawn.toString());
  }, [totalWithdrawn]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.POSITIONS, JSON.stringify(positions));
  }, [positions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify(tradeHistory));
  }, [tradeHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(ledger));
  }, [ledger]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VIP_SUBS, JSON.stringify(vipSubscriptions));
  }, [vipSubscriptions]);

  // Toast Helper
  const addToast = useCallback((title: string, message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { id, title, message, type, timestamp: Date.now() }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Auth State & Persistence - Preserve user session if logged in
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('trading_platform_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) return parsed;
      } catch (e) {}
    }
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    if (user) {
      localStorage.setItem('trading_platform_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('trading_platform_user');
    }
  }, [user]);

  // Handle incoming referral link from URL when opened on any device
  useEffect(() => {
    const code = getInitialReferralCode();
    if (code) {
      addToast(
        'Referral Link Active!',
        `Welcome! Referral code ${code} is applied. Sign up now to receive your $5.00 USDT welcome bonus and VIP yield perks.`,
        'success'
      );
    }
  }, [addToast]);

  // Ensure accounts database is cleared on initialization if requested
  useEffect(() => {
    // Purge registered_users database completely
    localStorage.setItem('registered_users', JSON.stringify([]));

    // Force purge legacy test balances and duplicate welcome bonuses
    const savedLedger = localStorage.getItem(STORAGE_KEYS.LEDGER);
    let sanitizedLedger: LedgerTransaction[] = [];
    if (savedLedger) {
      try {
        let welcomeBonusCount = 0;
        sanitizedLedger = JSON.parse(savedLedger)
          .filter((tx: any) => !isTestTx(tx))
          .filter((tx: any) => {
            if (tx.type === 'WELCOME_BONUS') {
              welcomeBonusCount++;
              return welcomeBonusCount <= 1;
            }
            return true;
          });
        localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(sanitizedLedger));
        setLedger(sanitizedLedger);
      } catch (e) {}
    }

    const savedSubs = localStorage.getItem(STORAGE_KEYS.VIP_SUBS);
    let sanitizedSubs: VipSubscription[] = [];
    if (savedSubs) {
      try {
        sanitizedSubs = JSON.parse(savedSubs).filter((s: any) => !isTestSub(s));
        localStorage.setItem(STORAGE_KEYS.VIP_SUBS, JSON.stringify(sanitizedSubs));
        setVipSubscriptions(sanitizedSubs);
      } catch (e) {}
    }

    const hasRealDeposit = sanitizedLedger.some((tx: any) => tx.type === 'DEPOSIT' && tx.status === 'COMPLETED');
    const hasBonus = sanitizedLedger.some((tx: any) => tx.type === 'WELCOME_BONUS' && tx.status === 'COMPLETED');

    if (!hasRealDeposit && !hasBonus) {
      localStorage.removeItem(STORAGE_KEYS.BALANCE);
      localStorage.removeItem(STORAGE_KEYS.DEPOSITED);
      localStorage.removeItem(STORAGE_KEYS.WITHDRAWN);
      localStorage.removeItem(STORAGE_KEYS.POSITIONS);
      localStorage.removeItem(STORAGE_KEYS.ORDERS);
      localStorage.removeItem(STORAGE_KEYS.TRADES);
      localStorage.removeItem(STORAGE_KEYS.LEDGER);
      localStorage.removeItem(STORAGE_KEYS.VIP_SUBS);
      setAvailableBalance(0.00);
      setTotalDeposited(0.00);
      setTotalWithdrawn(0.00);
      setPositions([]);
      setOrders([]);
      setTradeHistory([]);
      setLedger([]);
      setVipSubscriptions([]);
    } else if (!hasRealDeposit && hasBonus) {
      setTotalDeposited(0.00);
      setTotalWithdrawn(0.00);
      setAvailableBalance(5.00);
    }
  }, []);

  const openAuthModal = useCallback((mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const login = useCallback((identifier: string, pass: string): boolean => {
    if (!identifier || !pass) {
      addToast('Sign In Error', 'Please enter your username/email and password.', 'error');
      return false;
    }

    const registeredUsersStr = localStorage.getItem('registered_users');
    const usersList: any[] = registeredUsersStr ? JSON.parse(registeredUsersStr) : [];

    let matchedUser = usersList.find(
      u => (u.email.toLowerCase() === identifier.trim().toLowerCase() || u.username.toLowerCase() === identifier.trim().toLowerCase()) && u.password === pass
    );

    if (matchedUser) {
      const userProfile: UserProfile = {
        id: matchedUser.id,
        username: matchedUser.username,
        email: matchedUser.email,
        vipTier: matchedUser.vipTier || 'VIP 1',
        kycVerified: true,
        joinedAt: matchedUser.joinedAt || Date.now(),
        referralCode: matchedUser.referralCode
      };
      setUser(userProfile);
      addToast('Welcome Back!', `Logged in successfully as ${userProfile.username}`, 'success');
      setIsAuthModalOpen(false);
      return true;
    }

    addToast('Account Not Found', 'No account found with these details. Please check your credentials or click Sign Up to register.', 'error');
    return false;
  }, [addToast]);

  const signUp = useCallback((username: string, email: string, pass: string, refCode?: string): boolean => {
    if (!username || !email || !pass) {
      addToast('Sign Up Error', 'Please complete all required fields.', 'error');
      return false;
    }

    if (pass.length < 6) {
      addToast('Password Too Short', 'Password must be at least 6 characters long.', 'error');
      return false;
    }

    const registeredUsersStr = localStorage.getItem('registered_users');
    const usersList: any[] = registeredUsersStr ? JSON.parse(registeredUsersStr) : [];

    const existing = usersList.find(
      u => u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === username.toLowerCase()
    );

    if (existing) {
      addToast('Account Exists', 'An account with this email or username already exists. Please sign in.', 'error');
      return false;
    }

    const newAccountId = `usr-apex-${Math.floor(100000 + Math.random() * 900000)}`;
    const newRefCode = `APEX-${Math.floor(1000 + Math.random() * 9000)}`;

    // Enforce strictly 1 welcome bonus per account / session / device
    const alreadyHasBonusInLedger = ledger.some(tx => tx.type === 'WELCOME_BONUS');
    const deviceOrUserAlreadyClaimed = usersList.some((u: any) => u.hasReceivedWelcomeBonus === true);

    const shouldAwardBonus = !alreadyHasBonusInLedger && !deviceOrUserAlreadyClaimed;

    const newUserRecord = {
      id: newAccountId,
      username,
      email,
      password: pass,
      vipTier: 'VIP 1',
      joinedAt: Date.now(),
      referralCode: newRefCode,
      referredBy: refCode || null,
      hasReceivedWelcomeBonus: shouldAwardBonus
    };

    usersList.push(newUserRecord);
    localStorage.setItem('registered_users', JSON.stringify(usersList));

    const userProfile: UserProfile = {
      id: newAccountId,
      username,
      email,
      vipTier: 'VIP 1',
      kycVerified: true,
      joinedAt: Date.now(),
      referralCode: newRefCode
    };

    setUser(userProfile);

    if (shouldAwardBonus) {
      const welcomeBonusTx: LedgerTransaction = {
        id: `tx-welcome-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
        type: 'WELCOME_BONUS',
        amount: 5.00,
        fee: 0,
        asset: 'USDT',
        status: 'COMPLETED',
        method: 'Welcome Sign-Up Bonus',
        description: 'New Account Welcome Reward ($5.00 USDT)'
      };

      setLedger(prev => {
        // Double check prev array state to strictly prevent any concurrent duplicate addition
        if (prev.some(tx => tx.type === 'WELCOME_BONUS')) return prev;
        return [welcomeBonusTx, ...prev];
      });
      setAvailableBalance(prev => prev + 5.00);
      addToast('Account Created!', `Welcome to APEX VIP, ${username}! A $5.00 USDT Welcome Bonus has been credited to your balance.`, 'success');
    } else {
      addToast('Account Created!', `Welcome to APEX VIP, ${username}! Your account has been registered successfully.`, 'info');
    }

    if (refCode) {
      const activeRefCode = (user?.referralCode || 'VIP-89421-REF').toLowerCase();
      const inputRefCode = refCode.trim().toLowerCase();
      if (inputRefCode === activeRefCode || inputRefCode === 'vip-89421-ref' || inputRefCode === 'spoiremongae') {
        const refBonusTx: LedgerTransaction = {
          id: `tx-ref-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: Date.now(),
          type: 'VIP_EARNINGS',
          amount: 2.50,
          fee: 0,
          asset: 'USDT',
          status: 'COMPLETED',
          method: 'Referral Bonus',
          description: `Direct Referral Reward: @${username} registered with your link`
        };
        setLedger(prev => [refBonusTx, ...prev]);
        setAvailableBalance(prev => prev + 2.50);
        addToast('🎉 Referral Reward Earned!', `New member @${username} joined using your invite code! +$2.50 USDT commission added to your balance.`, 'success');
      }
    }

    setIsAuthModalOpen(false);
    return true;
  }, [addToast, user, ledger]);

  const registerReferralMember = useCallback((memberName?: string, memberEmail?: string): boolean => {
    const activeRefCode = user?.referralCode || localStorage.getItem('apex_user_personal_ref_code') || 'VIP-89421-REF';

    const cleanUsername = (memberName || `trader_${Math.floor(1000 + Math.random() * 9000)}`).trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    const cleanEmail = (memberEmail || `${cleanUsername}@gmail.com`).trim().toLowerCase();

    const registeredUsersStr = localStorage.getItem('registered_users');
    const usersList: any[] = registeredUsersStr ? JSON.parse(registeredUsersStr) : [];

    if (usersList.some((u: any) => u.email.toLowerCase() === cleanEmail.toLowerCase())) {
      addToast('Member Exists', `An account with ${cleanEmail} is already registered.`, 'error');
      return false;
    }

    const newMemberRecord = {
      id: `usr-ref-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      username: cleanUsername,
      email: cleanEmail,
      password: 'password123',
      vipTier: 'VIP 1',
      joinedAt: Date.now(),
      referralCode: `APEX-${Math.floor(1000 + Math.random() * 9000)}`,
      referredBy: activeRefCode,
      hasReceivedWelcomeBonus: true
    };

    usersList.push(newMemberRecord);
    localStorage.setItem('registered_users', JSON.stringify(usersList));

    // Award $2.50 USDT instant referral commission to the inviter
    const commissionAmount = 2.50;
    const refTx: LedgerTransaction = {
      id: `tx-ref-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      type: 'VIP_EARNINGS',
      amount: commissionAmount,
      fee: 0,
      asset: 'USDT',
      status: 'COMPLETED',
      method: 'Referral Commission',
      description: `Tier 1 Referral Bonus: @${cleanUsername} joined with your invite code (${activeRefCode})`
    };

    setLedger(prev => [refTx, ...prev]);
    setAvailableBalance(prev => prev + commissionAmount);

    addToast(
      '🎉 New Member Joined!',
      `@${cleanUsername} (${cleanEmail}) registered using your invite link! +$2.50 USDT commission credited to your balance.`,
      'success'
    );

    window.dispatchEvent(new Event('storage'));
    return true;
  }, [user, addToast]);

  const logout = useCallback(() => {
    setUser(null);
    addToast('Signed Out', 'You have been logged out safely.', 'info');
  }, [addToast]);

  const removeAllAccounts = useCallback(() => {
    localStorage.setItem('registered_users', JSON.stringify([]));
    localStorage.removeItem('trading_platform_user');
    setUser(null);
    window.dispatchEvent(new Event('storage'));
    addToast('Database Cleared', 'All accounts in the database have been permanently removed.', 'info');
  }, [addToast]);

  // Change active asset & re-generate chart
  const setSelectedAssetId = useCallback((id: string) => {
    setSelectedAssetIdState(id);
    const targetAsset = assets.find(a => a.id === id);
    if (targetAsset) {
      const minutes = timeframe === '1m' ? 1 : timeframe === '5m' ? 5 : timeframe === '15m' ? 15 : timeframe === '1h' ? 60 : 1440;
      setCandles(generateInitialCandles(targetAsset.price, minutes, 80));
      setOrderBook(generateOrderBook(targetAsset.price, targetAsset.precision));
      setRecentTrades(generateRecentTrades(targetAsset.price, targetAsset.precision));
    }
  }, [assets, timeframe]);

  // Handle timeframe change
  const handleSetTimeframe = useCallback((tf: string) => {
    setTimeframe(tf);
    const minutes = tf === '1m' ? 1 : tf === '5m' ? 5 : tf === '15m' ? 15 : tf === '1h' ? 60 : 1440;
    setCandles(generateInitialCandles(selectedAsset.price, minutes, 80));
  }, [selectedAsset.price]);

  // Locked Margin calculation
  const lockedMargin = positions.reduce((sum, p) => sum + p.margin, 0) +
    orders.reduce((sum, o) => sum + o.requiredMargin, 0);

  // Unrealized PnL calculation
  const unrealizedPnL = positions.reduce((sum, pos) => {
    const currentAsset = assets.find(a => a.id === pos.assetId);
    const markPrice = currentAsset ? currentAsset.price : pos.entryPrice;
    let pnl = 0;
    if (pos.side === 'LONG') {
      pnl = (markPrice - pos.entryPrice) * pos.size * pos.leverage;
    } else {
      pnl = (pos.entryPrice - markPrice) * pos.size * pos.leverage;
    }
    return sum + pnl;
  }, 0);

  // Realized PnL total
  const realizedPnL = tradeHistory.reduce((sum, t) => sum + t.realizedPnL, 0);

  // Total Equity = Available Cash + Locked Margin + Unrealized PnL
  const equity = availableBalance + lockedMargin + unrealizedPnL;

  // Deposit Action
  const deposit = useCallback((amount: number, method: string, details?: string, customTxHash?: string, isAutoApproved: boolean = false): boolean => {
    if (amount <= 0) {
      addToast('Deposit Error', 'Please enter a valid deposit amount greater than $0', 'error');
      return false;
    }

    const fee = 0; // zero fee
    const netAmount = amount - fee;

    const isTRC20 = method.includes('TRC20');
    const defaultHash = isTRC20
      ? Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
      : '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const txHash = customTxHash && customTxHash.trim().length > 0 ? customTxHash.trim() : defaultHash;

    const txId = `tx-dep-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
    const newTx: LedgerTransaction = {
      id: txId,
      type: 'DEPOSIT',
      amount,
      asset: 'USD',
      fee,
      status: isAutoApproved ? 'COMPLETED' : 'PENDING',
      method,
      txHash,
      description: details || `Deposit via ${method} (${isAutoApproved ? 'Verified' : 'Pending Blockchain Audit'})`,
      timestamp: Date.now()
    };

    if (isAutoApproved) {
      setAvailableBalance(prev => prev + netAmount);
      setTotalDeposited(prev => prev + amount);
      addToast(
        'Deposit Confirmed',
        `Credited +$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} via ${method} to account balance.`,
        'success'
      );
    } else {
      addToast(
        'Deposit Submitted for Verification',
        `Deposit of $${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} (TxHash: ${txHash.substring(0, 10)}...) is PENDING on-chain verification.`,
        'info'
      );
    }

    setLedger(prev => [newTx, ...prev]);
    return true;
  }, [addToast]);

  // Withdraw Action
  const withdraw = useCallback((amount: number, method: string, details?: string): boolean => {
    if (amount <= 0) {
      addToast('Withdrawal Error', 'Please enter a valid amount greater than $0', 'error');
      return false;
    }

    const hasActiveVip = vipSubscriptions.some(s => s.status === 'ACTIVE');
    if (!hasActiveVip) {
      addToast(
        'VIP Plan Required',
        'According to APEX VIP platform anti-abuse terms, promotional welcome bonus funds and account balance cannot be withdrawn to external crypto wallets without an active VIP Staking Plan subscription. Activate VIP Plan 1 or higher to unlock direct crypto withdrawals.',
        'error'
      );
      return false;
    }

    // Check Daily Withdrawal Limit (Max 1 per 24 hours)
    const oneDayMs = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const last24hWithdrawal = ledger.find(tx => tx.type === 'WITHDRAW' && (now - tx.timestamp) < oneDayMs);
    if (last24hWithdrawal) {
      const remainingMs = oneDayMs - (now - last24hWithdrawal.timestamp);
      const hoursRemaining = Math.max(1, Math.ceil(remainingMs / (60 * 60 * 1000)));
      addToast(
        'Daily Limit Reached',
        `Security Policy Enforcement: APEX platform permits a maximum of 1 withdrawal per 24 hours. Your last withdrawal was processed on ${new Date(last24hWithdrawal.timestamp).toLocaleTimeString()}. Next withdrawal window opens in ~${hoursRemaining} hour(s).`,
        'error'
      );
      return false;
    }

    if (amount > availableBalance) {
      addToast(
        'Insufficient Balance',
        `You cannot withdraw $${amount.toLocaleString()}! Available cash is $${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}.`,
        'error'
      );
      return false;
    }

    const fee = amount * 0.001; // 0.1% processing fee
    const netAmount = amount - fee;

    setAvailableBalance(prev => prev - amount);
    setTotalWithdrawn(prev => prev + amount);

    const txId = `tx-wth-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
    const newTx: LedgerTransaction = {
      id: txId,
      type: 'WITHDRAW',
      amount: -amount,
      asset: 'USD',
      fee,
      status: 'COMPLETED',
      method,
      txHash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
      description: details || `Withdrawal payout to ${method}`,
      timestamp: Date.now()
    };

    setLedger(prev => [newTx, ...prev]);
    addToast(
      'Withdrawal Processed',
      `Successfully processed withdrawal of $${netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} (Fee: $${fee.toFixed(2)}) to ${method}.`,
      'success'
    );
    return true;
  }, [availableBalance, vipSubscriptions, ledger, addToast]);

  // Place Order Action
  const placeOrder = useCallback(({
    assetId,
    side,
    type,
    price,
    size,
    leverage,
    stopLoss,
    takeProfit
  }: {
    assetId: string;
    side: PositionSide;
    type: OrderType;
    price: number;
    size: number;
    leverage: number;
    stopLoss?: number;
    takeProfit?: number;
  }): boolean => {
    const targetAsset = assets.find(a => a.id === assetId);
    if (!targetAsset) {
      addToast('Order Error', 'Asset not found', 'error');
      return false;
    }

    if (size <= 0) {
      addToast('Order Error', 'Order size must be greater than 0', 'error');
      return false;
    }

    const notionalValue = price * size;
    const requiredMargin = notionalValue / leverage;

    if (requiredMargin > availableBalance) {
      addToast(
        'Margin Exceeded',
        `Required margin ($${requiredMargin.toFixed(2)}) exceeds available cash ($${availableBalance.toFixed(2)}).`,
        'error'
      );
      return false;
    }

    // Deduct available margin
    setAvailableBalance(prev => prev - requiredMargin);

    if (type === 'MARKET') {
      // Execute position immediately
      const liqPrice = side === 'LONG'
        ? price * (1 - (1 / leverage) + 0.005)
        : price * (1 + (1 / leverage) - 0.005);

      const newPosition: Position = {
        id: `pos-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        assetId: targetAsset.id,
        symbol: targetAsset.symbol,
        side,
        size,
        entryPrice: price,
        markPrice: price,
        leverage,
        margin: requiredMargin,
        liquidationPrice: Math.max(0, Number(liqPrice.toFixed(targetAsset.precision))),
        stopLoss,
        takeProfit,
        unrealizedPnL: 0,
        unrealizedPnLPercent: 0,
        createdAt: Date.now()
      };

      setPositions(prev => [newPosition, ...prev]);

      // Record ledger
      const tx: LedgerTransaction = {
        id: `tx-ord-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
        type: 'TRADE_OPEN',
        amount: -requiredMargin,
        asset: 'USD',
        fee: requiredMargin * 0.0005, // 0.05% maker/taker fee
        status: 'COMPLETED',
        description: `Opened ${leverage}x ${side} position on ${targetAsset.symbol} @ $${price.toLocaleString()}`,
        timestamp: Date.now()
      };
      setLedger(prev => [tx, ...prev]);

      addToast(
        'Position Opened',
        `${side} ${size} ${targetAsset.symbol} filled @ $${price.toLocaleString()} (${leverage}x leverage)`,
        'success'
      );
    } else {
      // LIMIT Order
      const newOrder: Order = {
        id: `ord-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        assetId: targetAsset.id,
        symbol: targetAsset.symbol,
        side: side === 'LONG' ? 'BUY' : 'SELL',
        type: 'LIMIT',
        price,
        size,
        leverage,
        requiredMargin,
        stopLoss,
        takeProfit,
        status: 'OPEN',
        createdAt: Date.now()
      };

      setOrders(prev => [newOrder, ...prev]);

      addToast(
        'Limit Order Placed',
        `Placed ${side === 'LONG' ? 'BUY' : 'SELL'} Limit order for ${size} ${targetAsset.symbol} @ $${price.toLocaleString()}`,
        'info'
      );
    }

    return true;
  }, [assets, availableBalance, addToast]);

  // Close Position
  const closePosition = useCallback((positionId: string, reason: 'MANUAL' | 'STOP_LOSS' | 'TAKE_PROFIT' | 'LIQUIDATION' = 'MANUAL') => {
    setPositions(prevPositions => {
      const target = prevPositions.find(p => p.id === positionId);
      if (!target) return prevPositions;

      const targetAsset = assets.find(a => a.id === target.assetId);
      const exitPrice = targetAsset ? targetAsset.price : target.markPrice;

      let pnl = 0;
      if (target.side === 'LONG') {
        pnl = (exitPrice - target.entryPrice) * target.size * target.leverage;
      } else {
        pnl = (target.entryPrice - exitPrice) * target.size * target.leverage;
      }

      const pnlPercent = (pnl / target.margin) * 100;
      const returnedCapital = Math.max(0, target.margin + pnl);

      // Return margin + PnL to available balance
      setAvailableBalance(prev => Math.max(0, prev + returnedCapital));

      // Record closed trade
      const newTrade: Trade = {
        id: `trd-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        assetId: target.assetId,
        symbol: target.symbol,
        side: target.side,
        type: 'MARKET',
        entryPrice: target.entryPrice,
        exitPrice,
        size: target.size,
        leverage: target.leverage,
        realizedPnL: pnl,
        realizedPnLPercent: pnlPercent,
        openedAt: target.createdAt,
        closedAt: Date.now(),
        closeReason: reason
      };

      setTradeHistory(prev => [newTrade, ...prev]);

      // Record in ledger
      const tx: LedgerTransaction = {
        id: `tx-cls-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
        type: reason === 'LIQUIDATION' ? 'LIQUIDATION' : 'TRADE_CLOSE',
        amount: pnl,
        asset: 'USD',
        fee: 0,
        status: 'COMPLETED',
        description: `Closed ${target.side} position on ${target.symbol} (${reason}) - PnL: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`,
        timestamp: Date.now()
      };
      setLedger(prev => [tx, ...prev]);

      // Notification
      if (reason === 'LIQUIDATION') {
        addToast(
          'Position Liquidated',
          `Your ${target.side} position on ${target.symbol} was liquidated at $${exitPrice.toLocaleString()}`,
          'error'
        );
      } else {
        addToast(
          'Position Closed',
          `Closed ${target.side} on ${target.symbol}. Realized PnL: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)} (${pnlPercent >= 0 ? '+' : ''}${pnlPercent.toFixed(2)}%)`,
          pnl >= 0 ? 'success' : 'warning'
        );
      }

      return prevPositions.filter(p => p.id !== positionId);
    });
  }, [assets, addToast]);

  // Cancel Limit Order
  const cancelOrder = useCallback((orderId: string) => {
    setOrders(prevOrders => {
      const target = prevOrders.find(o => o.id === orderId);
      if (!target) return prevOrders;

      // Refund required margin
      setAvailableBalance(prev => prev + target.requiredMargin);

      addToast(
        'Order Cancelled',
        `Cancelled Limit order for ${target.symbol}. Released $${target.requiredMargin.toFixed(2)} margin back to cash.`,
        'info'
      );

      return prevOrders.filter(o => o.id !== orderId);
    });
  }, [addToast]);

  // Update SL/TP for position
  const updatePositionSLTP = useCallback((positionId: string, stopLoss?: number, takeProfit?: number) => {
    setPositions(prev => prev.map(p => {
      if (p.id === positionId) {
        return { ...p, stopLoss, takeProfit };
      }
      return p;
    }));
    addToast('SL/TP Updated', 'Updated Stop-Loss / Take-Profit trigger levels for position.', 'info');
  }, [addToast]);

  // Toggle Watchlist
  const toggleWatchlist = useCallback((assetId: string) => {
    setWatchlist(prev => {
      if (prev.includes(assetId)) {
        return prev.filter(id => id !== assetId);
      } else {
        return [...prev, assetId];
      }
    });
  }, []);

  // Toggle Live simulation
  const toggleLiveSimulation = useCallback(() => {
    setIsLiveSimulation(prev => !prev);
  }, []);

  // Subscribe to VIP Staking Plan
  const subscribeVipPlan = useCallback((planId: string, customAmount?: number): boolean => {
    const plan = VIP_PLANS.find(p => p.id === planId);
    if (!plan) {
      addToast('Subscription Failed', 'Selected VIP Plan not found.', 'error');
      return false;
    }

    const investAmount = customAmount && customAmount >= plan.minInvestment ? customAmount : plan.minInvestment;

    if (investAmount > availableBalance) {
      addToast(
        'Insufficient Balance',
        `Required capital ($${investAmount.toLocaleString()}) exceeds your available cash balance ($${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}). Please deposit or adjust allocation.`,
        'error'
      );
      return false;
    }

    // Deduct capital
    setAvailableBalance(prev => prev - investAmount);

    const calculatedDaily = Number((investAmount * (plan.dailyIncomePercent / 100)).toFixed(2));

    const newSub: VipSubscription = {
      id: `vsub-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      planId: plan.id,
      planName: plan.name,
      badge: plan.badge,
      dailyIncomePercent: plan.dailyIncomePercent,
      investmentAmount: investAmount,
      dailyEarnings: calculatedDaily,
      durationDays: plan.durationDays,
      daysElapsed: 1,
      unclaimedEarnings: calculatedDaily, // day 1 yield instantly ready
      totalClaimed: 0,
      lastClaimedAt: Date.now(),
      startedAt: Date.now(),
      status: 'ACTIVE'
    };

    setVipSubscriptions(prev => [newSub, ...prev]);

    // Record in ledger
    const tx: LedgerTransaction = {
      id: `tx-vip-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
      type: 'VIP_INVESTMENT',
      amount: -investAmount,
      asset: 'USD',
      fee: 0,
      status: 'COMPLETED',
      description: `Subscribed to ${plan.name} (${plan.badge}) VIP Yield Plan ($${investAmount.toLocaleString()})`,
      timestamp: Date.now()
    };
    setLedger(prev => [tx, ...prev]);

    addToast(
      'VIP Plan Subscribed!',
      `Allocated $${investAmount.toLocaleString()} to ${plan.name} (${plan.badge}). Daily income: $${calculatedDaily.toFixed(2)} for ${plan.durationDays} days.`,
      'success'
    );
    return true;
  }, [availableBalance, addToast]);

  // Claim VIP Yield Earnings
  const claimVipEarnings = useCallback((subscriptionId: string) => {
    setVipSubscriptions(prev => {
      const sub = prev.find(s => s.id === subscriptionId);
      if (!sub) return prev;

      if (sub.unclaimedEarnings <= 0) {
        addToast('No Yield Available', 'There are currently no unclaimed daily yield earnings for this plan.', 'info');
        return prev;
      }

      const claimAmount = sub.unclaimedEarnings;

      // Credit cash balance
      setAvailableBalance(b => b + claimAmount);

      // Record in ledger
      const tx: LedgerTransaction = {
        id: `tx-yield-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
        type: 'VIP_EARNINGS',
        amount: claimAmount,
        asset: 'USD',
        fee: 0,
        status: 'COMPLETED',
        description: `Claimed daily passive yield from ${sub.planName} VIP Plan`,
        timestamp: Date.now()
      };
      setLedger(l => [tx, ...l]);

      addToast(
        'Yield Claimed!',
        `Successfully credited $${claimAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} earnings to your available trading cash balance!`,
        'success'
      );

      return prev.map(s => {
        if (s.id === subscriptionId) {
          return {
            ...s,
            totalClaimed: s.totalClaimed + claimAmount,
            unclaimedEarnings: 0,
            lastClaimedAt: Date.now()
          };
        }
        return s;
      });
    });
  }, [addToast]);

  // Deactivate single VIP Staking Plan
  const deactivateVipPlan = useCallback((subscriptionId: string) => {
    setVipSubscriptions(prev => {
      const updated = prev.filter(s => s.id !== subscriptionId);
      localStorage.setItem(STORAGE_KEYS.VIP_SUBS, JSON.stringify(updated));
      return updated;
    });
    addToast('Plan Deactivated', 'The VIP Staking Plan has been deactivated.', 'info');
  }, [addToast]);

  // Deactivate all VIP Staking Plans
  const deactivateAllVipPlans = useCallback(() => {
    setVipSubscriptions([]);
    localStorage.removeItem(STORAGE_KEYS.VIP_SUBS);
    addToast('All Plans Deactivated', 'All active VIP Staking Plans (including Interns) have been deactivated.', 'info');
  }, [addToast]);

  // Reset Demo Account
  const resetAccount = useCallback(() => {
    setAvailableBalance(0.00);
    setTotalDeposited(0.00);
    setTotalWithdrawn(0.00);
    setPositions([]);
    setOrders([]);
    setTradeHistory([]);
    setVipSubscriptions([]);
    setLedger([]);
    localStorage.removeItem(STORAGE_KEYS.BALANCE);
    localStorage.removeItem(STORAGE_KEYS.DEPOSITED);
    localStorage.removeItem(STORAGE_KEYS.WITHDRAWN);
    localStorage.removeItem(STORAGE_KEYS.POSITIONS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.TRADES);
    localStorage.removeItem(STORAGE_KEYS.LEDGER);
    localStorage.removeItem(STORAGE_KEYS.VIP_SUBS);
    addToast('Account Cleared', 'Account balances and transactions reset to $0.00.', 'info');
  }, [addToast]);

  // REAL-TIME MARKET SIMULATION TICKER LOOP
  useEffect(() => {
    if (!isLiveSimulation) return;

    const interval = setInterval(() => {
      setAssets(prevAssets => {
        return prevAssets.map(asset => {
          // Random price tick simulation
          const volatility = asset.price * 0.0015;
          const delta = (Math.random() - 0.49) * volatility;
          const newPrice = Math.max(0.0001, Number((asset.price + delta).toFixed(asset.precision)));
          const priceChange = newPrice - (asset.price - asset.change24hAmount);
          const percentChange = Number(((priceChange / (newPrice - priceChange)) * 100).toFixed(2));
          
          const newHigh = Math.max(asset.high24h, newPrice);
          const newLow = Math.min(asset.low24h, newPrice);

          // Update active candles if this is the selected asset
          if (asset.id === selectedAssetId) {
            setCandles(prevCandles => {
              if (prevCandles.length === 0) return prevCandles;
              const lastCandle = { ...prevCandles[prevCandles.length - 1] };
              lastCandle.close = newPrice;
              lastCandle.high = Math.max(lastCandle.high, newPrice);
              lastCandle.low = Math.min(lastCandle.low, newPrice);
              lastCandle.volume = Number((lastCandle.volume + Math.random() * 2).toFixed(2));
              
              return [...prevCandles.slice(0, -1), lastCandle];
            });

            // Refresh orderbook depth
            setOrderBook(generateOrderBook(newPrice, asset.precision));

            // Append live trade feed item
            if (Math.random() > 0.4) {
              const isBuy = Math.random() > 0.48;
              const newTradeItem: RecentTrade = {
                id: `rt-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
                price: newPrice,
                amount: Number((Math.random() * 1.8 + 0.05).toFixed(3)),
                side: isBuy ? 'BUY' : 'SELL',
                timestamp: Date.now()
              };
              setRecentTrades(prev => [newTradeItem, ...prev.slice(0, 14)]);
            }
          }

          return {
            ...asset,
            price: newPrice,
            change24h: percentChange,
            change24hAmount: Number(priceChange.toFixed(asset.precision)),
            high24h: newHigh,
            low24h: newLow,
            sparkline: [...asset.sparkline.slice(1), newPrice]
          };
        });
      });

    }, 1500);

    return () => clearInterval(interval);
  }, [isLiveSimulation, selectedAssetId]);

  // AUTOMATIC ORDER / POSITION SL/TP / LIQUIDATION MONITOR LOOP
  useEffect(() => {
    if (positions.length === 0 && orders.length === 0) return;

    // Check positions for SL, TP, or Liquidation
    positions.forEach(pos => {
      const asset = assets.find(a => a.id === pos.assetId);
      if (!asset) return;

      const price = asset.price;

      // Liquidation Check
      if (
        (pos.side === 'LONG' && price <= pos.liquidationPrice) ||
        (pos.side === 'SHORT' && price >= pos.liquidationPrice)
      ) {
        closePosition(pos.id, 'LIQUIDATION');
        return;
      }

      // Stop Loss Check
      if (pos.stopLoss) {
        if (
          (pos.side === 'LONG' && price <= pos.stopLoss) ||
          (pos.side === 'SHORT' && price >= pos.stopLoss)
        ) {
          closePosition(pos.id, 'STOP_LOSS');
          return;
        }
      }

      // Take Profit Check
      if (pos.takeProfit) {
        if (
          (pos.side === 'LONG' && price >= pos.takeProfit) ||
          (pos.side === 'SHORT' && price <= pos.takeProfit)
        ) {
          closePosition(pos.id, 'TAKE_PROFIT');
          return;
        }
      }
    });

    // Check Limit Orders execution trigger
    orders.forEach(ord => {
      const asset = assets.find(a => a.id === ord.assetId);
      if (!asset) return;

      const price = asset.price;
      const isTriggered =
        (ord.side === 'BUY' && price <= ord.price) ||
        (ord.side === 'SELL' && price >= ord.price);

      if (isTriggered) {
        // Convert limit order to filled position
        const side: PositionSide = ord.side === 'BUY' ? 'LONG' : 'SHORT';
        const liqPrice = side === 'LONG'
          ? ord.price * (1 - (1 / ord.leverage) + 0.005)
          : ord.price * (1 + (1 / ord.leverage) - 0.005);

        const filledPosition: Position = {
          id: `pos-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          assetId: ord.assetId,
          symbol: ord.symbol,
          side,
          size: ord.size,
          entryPrice: ord.price,
          markPrice: price,
          leverage: ord.leverage,
          margin: ord.requiredMargin,
          liquidationPrice: Math.max(0, Number(liqPrice.toFixed(asset.precision))),
          stopLoss: ord.stopLoss,
          takeProfit: ord.takeProfit,
          unrealizedPnL: 0,
          unrealizedPnLPercent: 0,
          createdAt: Date.now()
        };

        setPositions(prev => [filledPosition, ...prev]);
        setOrders(prev => prev.filter(o => o.id !== ord.id));

        addToast(
          'Limit Order Filled!',
          `Limit ${ord.side} order for ${ord.size} ${ord.symbol} filled at target price $${ord.price.toLocaleString()}`,
          'success'
        );
      }
    });

  }, [assets, positions, orders, closePosition, addToast]);

  return (
    <TradingContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signUp,
        logout,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,

        assets,
        selectedAsset,
        setSelectedAssetId,
        timeframe,
        setTimeframe: handleSetTimeframe,
        candles,
        orderBook,
        recentTrades,
        
        availableBalance,
        totalDeposited,
        totalWithdrawn,
        lockedMargin,
        unrealizedPnL,
        realizedPnL,
        equity,
        
        positions,
        orders,
        tradeHistory,
        ledger,
        
        vipSubscriptions,
        subscribeVipPlan,
        claimVipEarnings,
        deactivateVipPlan,
        deactivateAllVipPlans,
        
        deposit,
        withdraw,
        placeOrder,
        closePosition,
        cancelOrder,
        updatePositionSLTP,
        resetAccount,
        
        toasts,
        addToast,
        removeToast,
        
        watchlist,
        toggleWatchlist,
        
        registerReferralMember,
        removeAllAccounts,

        isLiveSimulation,
        toggleLiveSimulation
      }}
    >
      {children}
    </TradingContext.Provider>
  );
};

export const useTrading = () => {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
};
