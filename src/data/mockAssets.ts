import { Asset, Candle, OrderBookEntry, RecentTrade } from '../types/trading';

export const INITIAL_ASSETS: Asset[] = [
  {
    id: 'btc-usd',
    symbol: 'BTC/USD',
    name: 'Bitcoin',
    category: 'Crypto',
    price: 94250.00,
    change24h: 3.42,
    change24hAmount: 3115.50,
    high24h: 95400.00,
    low24h: 91100.00,
    volume24h: 42150000000,
    precision: 2,
    maxLeverage: 50,
    sparkline: [91200, 91800, 91500, 92400, 93100, 92800, 93900, 94250],
    description: 'The world\'s premiere decentralized digital currency and store of value.'
  },
  {
    id: 'eth-usd',
    symbol: 'ETH/USD',
    name: 'Ethereum',
    category: 'Crypto',
    price: 3450.80,
    change24h: -1.15,
    change24hAmount: -40.20,
    high24h: 3520.00,
    low24h: 3380.00,
    volume24h: 18400000000,
    precision: 2,
    maxLeverage: 50,
    sparkline: [3510, 3500, 3480, 3420, 3440, 3460, 3430, 3450.8],
    description: 'Decentralized platform that enables smart contracts and distributed applications.'
  },
  {
    id: 'sol-usd',
    symbol: 'SOL/USD',
    name: 'Solana',
    category: 'Crypto',
    price: 188.40,
    change24h: 8.75,
    change24hAmount: 15.18,
    high24h: 192.50,
    low24h: 172.10,
    volume24h: 8900000000,
    precision: 2,
    maxLeverage: 20,
    sparkline: [173, 175, 179, 181, 184, 182, 187, 188.4],
    description: 'High-performance layer 1 blockchain supporting builder ecosystems worldwide.'
  },
  {
    id: 'nvda-usd',
    symbol: 'NVDA',
    name: 'NVIDIA Corp',
    category: 'Stocks',
    price: 138.25,
    change24h: 4.12,
    change24hAmount: 5.47,
    high24h: 140.10,
    low24h: 133.50,
    volume24h: 12400000000,
    precision: 2,
    maxLeverage: 10,
    sparkline: [133.5, 134.2, 136.0, 135.8, 137.4, 138.0, 138.25],
    description: 'Global leader in GPU accelerated computing, AI chips, and graphics processing.'
  },
  {
    id: 'aapl-usd',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    category: 'Stocks',
    price: 232.10,
    change24h: 0.85,
    change24hAmount: 1.95,
    high24h: 233.80,
    low24h: 229.50,
    volume24h: 6800000000,
    precision: 2,
    maxLeverage: 10,
    sparkline: [229.8, 230.5, 231.2, 230.9, 231.8, 232.1],
    description: 'Consumer electronics, consumer software, and online services global pioneer.'
  },
  {
    id: 'tsla-usd',
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    category: 'Stocks',
    price: 248.90,
    change24h: -2.45,
    change24hAmount: -6.25,
    high24h: 257.00,
    low24h: 244.50,
    volume24h: 9100000000,
    precision: 2,
    maxLeverage: 10,
    sparkline: [256, 254, 251, 249, 252, 247, 248.9],
    description: 'Automotive and clean energy company producing electric vehicles and battery storage.'
  },
  {
    id: 'gold-usd',
    symbol: 'GOLD/USD',
    name: 'Gold Spot',
    category: 'Commodities',
    price: 2742.60,
    change24h: 0.62,
    change24hAmount: 16.90,
    high24h: 2750.00,
    low24h: 2724.00,
    volume24h: 15400000000,
    precision: 2,
    maxLeverage: 30,
    sparkline: [2726, 2730, 2735, 2732, 2738, 2742.6],
    description: 'Precious metal spot commodity benchmark traded globally.'
  },
  {
    id: 'eur-usd',
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    category: 'Forex',
    price: 1.0845,
    change24h: -0.18,
    change24hAmount: -0.0020,
    high24h: 1.0880,
    low24h: 1.0832,
    volume24h: 85000000000,
    precision: 4,
    maxLeverage: 50,
    sparkline: [1.0865, 1.0860, 1.0852, 1.0848, 1.0845],
    description: 'The world\'s most liquid currency pair.'
  }
];

export function generateInitialCandles(basePrice: number, timeframeMinutes: number = 5, count: number = 80): Candle[] {
  const candles: Candle[] = [];
  const now = Date.now();
  const intervalMs = timeframeMinutes * 60 * 1000;
  let currentPrice = basePrice * 0.96; // start slightly earlier

  for (let i = count - 1; i >= 0; i--) {
    const timestamp = now - i * intervalMs;
    const volatility = basePrice * 0.004;
    const delta = (Math.random() - 0.48) * volatility; // slight upward drift
    const open = currentPrice;
    const close = open + delta;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    const volume = Math.round((basePrice * 0.1) + Math.random() * (basePrice * 2));

    candles.push({
      timestamp,
      open: Number(open.toFixed(4)),
      high: Number(high.toFixed(4)),
      low: Number(low.toFixed(4)),
      close: Number(close.toFixed(4)),
      volume: Number(volume.toFixed(2))
    });

    currentPrice = close;
  }

  return candles;
}

export function generateOrderBook(currentPrice: number, precision: number = 2): { asks: OrderBookEntry[]; bids: OrderBookEntry[] } {
  const asks: OrderBookEntry[] = [];
  const bids: OrderBookEntry[] = [];
  const step = Math.max(currentPrice * 0.0005, Math.pow(10, -precision));

  let askAccum = 0;
  for (let i = 1; i <= 8; i++) {
    const price = Number((currentPrice + i * step).toFixed(precision));
    const amount = Number((Math.random() * 2.5 + 0.1).toFixed(3));
    askAccum += amount;
    asks.push({ price, amount, total: Number(askAccum.toFixed(3)) });
  }

  let bidAccum = 0;
  for (let i = 1; i <= 8; i++) {
    const price = Number((currentPrice - i * step).toFixed(precision));
    const amount = Number((Math.random() * 2.5 + 0.1).toFixed(3));
    bidAccum += amount;
    bids.push({ price, amount, total: Number(bidAccum.toFixed(3)) });
  }

  return { asks, bids };
}

export function generateRecentTrades(currentPrice: number, precision: number = 2): RecentTrade[] {
  const trades: RecentTrade[] = [];
  const now = Date.now();

  for (let i = 0; i < 10; i++) {
    const isBuy = Math.random() > 0.48;
    const offset = (Math.random() - 0.5) * (currentPrice * 0.001);
    const price = Number((currentPrice + offset).toFixed(precision));
    const amount = Number((Math.random() * 1.5 + 0.05).toFixed(3));
    trades.push({
      id: `trade-${now - i * 1500}-${i}`,
      price,
      amount,
      side: isBuy ? 'BUY' : 'SELL',
      timestamp: now - i * 1500
    });
  }

  return trades;
}
