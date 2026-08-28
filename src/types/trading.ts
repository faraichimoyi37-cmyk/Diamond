export interface UserProfile {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  vipTier: string;
  kycVerified: boolean;
  joinedAt: number;
  avatarUrl?: string;
  referralCode: string;
}

export type AssetCategory = 'Crypto' | 'Stocks' | 'Forex' | 'Commodities';

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  category: AssetCategory;
  price: number;
  change24h: number;
  change24hAmount: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  precision: number;
  maxLeverage: number;
  icon?: string;
  sparkline: number[];
  description: string;
}

export type OrderType = 'MARKET' | 'LIMIT';
export type OrderSide = 'BUY' | 'SELL';
export type PositionSide = 'LONG' | 'SHORT';

export interface Position {
  id: string;
  assetId: string;
  symbol: string;
  side: PositionSide;
  size: number; // in base asset units (e.g. 0.5 BTC)
  entryPrice: number;
  markPrice: number;
  leverage: number;
  margin: number; // initial margin allocated in USD
  liquidationPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  createdAt: number;
}

export interface Order {
  id: string;
  assetId: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  price: number; // limit price or fill price
  size: number;
  leverage: number;
  requiredMargin: number;
  stopLoss?: number;
  takeProfit?: number;
  status: 'OPEN' | 'FILLED' | 'CANCELLED';
  createdAt: number;
}

export interface Trade {
  id: string;
  assetId: string;
  symbol: string;
  side: PositionSide;
  type: OrderType;
  entryPrice: number;
  exitPrice: number;
  size: number;
  leverage: number;
  realizedPnL: number;
  realizedPnLPercent: number;
  openedAt: number;
  closedAt: number;
  closeReason: 'MANUAL' | 'STOP_LOSS' | 'TAKE_PROFIT' | 'LIQUIDATION';
}

export type TransactionType = 'DEPOSIT' | 'WITHDRAW' | 'TRADE_OPEN' | 'TRADE_CLOSE' | 'LIQUIDATION' | 'FUNDING_FEE' | 'VIP_INVESTMENT' | 'VIP_EARNINGS' | 'WELCOME_BONUS';

export interface VipSubscription {
  id: string;
  planId: string;
  planName: string;
  badge: string;
  dailyIncomePercent: number;
  investmentAmount: number;
  dailyEarnings: number;
  durationDays: number;
  daysElapsed: number;
  unclaimedEarnings: number;
  totalClaimed: number;
  lastClaimedAt: number;
  startedAt: number;
  status: 'ACTIVE' | 'COMPLETED';
}

export interface LedgerTransaction {
  id: string;
  type: TransactionType;
  amount: number; // positive for deposit / pnl gain, negative for withdrawal / pnl loss
  asset: string; // e.g. 'USD' or 'USDT'
  fee: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  method?: string;
  txHash?: string;
  description: string;
  timestamp: number;
}

export interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

export interface RecentTrade {
  id: string;
  price: number;
  amount: number;
  side: 'BUY' | 'SELL';
  timestamp: number;
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: number;
}
