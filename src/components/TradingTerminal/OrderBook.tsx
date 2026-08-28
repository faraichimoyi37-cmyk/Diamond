import React, { useState } from 'react';
import { useTrading } from '../../context/TradingContext';
import { Activity, Layers, ArrowUp, ArrowDown } from 'lucide-react';

export const OrderBook: React.FC = () => {
  const { selectedAsset, orderBook, recentTrades } = useTrading();
  const [activeTab, setActiveTab] = useState<'book' | 'trades'>('book');

  const maxAskTotal = orderBook.asks.length > 0 ? orderBook.asks[orderBook.asks.length - 1].total : 1;
  const maxBidTotal = orderBook.bids.length > 0 ? orderBook.bids[orderBook.bids.length - 1].total : 1;

  const spread = orderBook.asks.length > 0 && orderBook.bids.length > 0
    ? orderBook.asks[0].price - orderBook.bids[0].price
    : 0;

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
      {/* Tab Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-900/60 text-xs">
        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('book')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
              activeTab === 'book'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3 h-3 text-emerald-400" />
            <span>Order Book</span>
          </button>
          <button
            onClick={() => setActiveTab('trades')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
              activeTab === 'trades'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3 h-3 text-sky-400" />
            <span>Recent Trades</span>
          </button>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">Live Feed</span>
      </div>

      {activeTab === 'book' ? (
        <div className="flex-1 flex flex-col justify-between p-2 text-xs font-mono select-none overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-3 text-[10px] uppercase text-slate-500 font-bold px-1 pb-1">
            <span>Price (USD)</span>
            <span className="text-right">Size</span>
            <span className="text-right">Total</span>
          </div>

          {/* Asks (Sells in Red) - Highest ask on top, lowest ask near middle */}
          <div className="flex-1 flex flex-col justify-end space-y-0.5 overflow-hidden">
            {[...orderBook.asks].reverse().map((ask, idx) => {
              const depthPct = Math.min(100, (ask.total / maxAskTotal) * 100);
              return (
                <div key={`ask-${idx}`} className="relative grid grid-cols-3 px-1 py-0.5 text-[11px] items-center hover:bg-rose-500/10">
                  {/* Depth Bar Background */}
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-rose-500/15 transition-all duration-300"
                    style={{ width: `${depthPct}%` }}
                  />
                  <span className="text-rose-400 font-bold relative z-10">
                    {ask.price.toFixed(selectedAsset.precision)}
                  </span>
                  <span className="text-right text-slate-300 relative z-10">{ask.amount.toFixed(3)}</span>
                  <span className="text-right text-slate-500 relative z-10">{ask.total.toFixed(2)}</span>
                </div>
              );
            })}
          </div>

          {/* Current Mark Price & Spread Bar */}
          <div className="my-1 py-1.5 px-2 bg-slate-900 border-y border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className={`text-sm font-bold font-mono ${selectedAsset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ${selectedAsset.price.toLocaleString(undefined, { minimumFractionDigits: selectedAsset.precision })}
              </span>
              {selectedAsset.change24h >= 0 ? (
                <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <ArrowDown className="w-3.5 h-3.5 text-rose-400" />
              )}
            </div>
            <div className="text-[10px] text-slate-500">
              Spread: <span className="text-slate-300 font-mono">${spread.toFixed(selectedAsset.precision)}</span>
            </div>
          </div>

          {/* Bids (Buys in Green) */}
          <div className="flex-1 flex flex-col justify-start space-y-0.5 overflow-hidden">
            {orderBook.bids.map((bid, idx) => {
              const depthPct = Math.min(100, (bid.total / maxBidTotal) * 100);
              return (
                <div key={`bid-${idx}`} className="relative grid grid-cols-3 px-1 py-0.5 text-[11px] items-center hover:bg-emerald-500/10">
                  {/* Depth Bar Background */}
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-emerald-500/15 transition-all duration-300"
                    style={{ width: `${depthPct}%` }}
                  />
                  <span className="text-emerald-400 font-bold relative z-10">
                    {bid.price.toFixed(selectedAsset.precision)}
                  </span>
                  <span className="text-right text-slate-300 relative z-10">{bid.amount.toFixed(3)}</span>
                  <span className="text-right text-slate-500 relative z-10">{bid.total.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Recent Trades Stream */
        <div className="flex-1 p-2 text-xs font-mono overflow-y-auto space-y-1">
          <div className="grid grid-cols-3 text-[10px] uppercase text-slate-500 font-bold px-1 pb-1">
            <span>Price</span>
            <span className="text-right">Size</span>
            <span className="text-right">Time</span>
          </div>
          {recentTrades.map(trade => {
            const timeStr = new Date(trade.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
            return (
              <div key={trade.id} className="grid grid-cols-3 px-1 py-1 hover:bg-slate-900 rounded transition-colors">
                <span className={`font-bold ${trade.side === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ${trade.price.toFixed(selectedAsset.precision)}
                </span>
                <span className="text-right text-slate-300">{trade.amount.toFixed(3)}</span>
                <span className="text-right text-slate-500 text-[10px]">{timeStr}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
