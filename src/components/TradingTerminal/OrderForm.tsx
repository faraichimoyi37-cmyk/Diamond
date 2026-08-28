import React, { useState, useEffect } from 'react';
import { useTrading } from '../../context/TradingContext';
import { PositionSide, OrderType } from '../../types/trading';
import {
  TrendingUp,
  TrendingDown,
  Percent,
  AlertTriangle,
  Info,
  ShieldAlert,
  Zap,
  Check
} from 'lucide-react';

export const OrderForm: React.FC = () => {
  const {
    selectedAsset,
    availableBalance,
    placeOrder
  } = useTrading();

  const [side, setSide] = useState<PositionSide>('LONG');
  const [orderType, setOrderType] = useState<OrderType>('MARKET');
  const [leverage, setLeverage] = useState<number>(10);
  const [sizeUnits, setSizeUnits] = useState<string>('0.1');
  const [limitPrice, setLimitPrice] = useState<string>(selectedAsset.price.toString());
  const [enableSLTP, setEnableSLTP] = useState<boolean>(false);
  const [stopLoss, setStopLoss] = useState<string>('');
  const [takeProfit, setTakeProfit] = useState<string>('');

  // Synchronize default limit price when asset changes
  useEffect(() => {
    setLimitPrice(selectedAsset.price.toString());
    setLeverage(Math.min(leverage, selectedAsset.maxLeverage));
  }, [selectedAsset]);

  const priceToUse = orderType === 'MARKET' ? selectedAsset.price : (parseFloat(limitPrice) || selectedAsset.price);
  const sizeNum = parseFloat(sizeUnits) || 0;
  const notionalUSD = sizeNum * priceToUse;
  const requiredMargin = notionalUSD / leverage;

  // Percentage quick buttons relative to max possible margin
  const handlePercentClick = (pct: number) => {
    const marginToUse = (availableBalance * pct) / 100;
    const targetNotional = marginToUse * leverage;
    const units = targetNotional / priceToUse;
    setSizeUnits(units.toFixed(4));
  };

  // Liquidation Price estimate
  const liqPrice = side === 'LONG'
    ? priceToUse * (1 - (1 / leverage) + 0.005)
    : priceToUse * (1 + (1 / leverage) - 0.005);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sizeNum <= 0) return;

    const slNum = enableSLTP && stopLoss ? parseFloat(stopLoss) : undefined;
    const tpNum = enableSLTP && takeProfit ? parseFloat(takeProfit) : undefined;

    placeOrder({
      assetId: selectedAsset.id,
      side,
      type: orderType,
      price: priceToUse,
      size: sizeNum,
      leverage,
      stopLoss: slNum,
      takeProfit: tpNum
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-xl border border-slate-800 p-4 shadow-xl text-slate-100 space-y-4">
      {/* Side Selector (Long vs Short) */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
        <button
          type="button"
          onClick={() => setSide('LONG')}
          className={`py-2 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
            side === 'LONG'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4 stroke-[2.5]" />
          <span>Buy / Long</span>
        </button>
        <button
          type="button"
          onClick={() => setSide('SHORT')}
          className={`py-2 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
            side === 'SHORT'
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingDown className="w-4 h-4 stroke-[2.5]" />
          <span>Sell / Short</span>
        </button>
      </div>

      {/* Order Type Selector (Market / Limit) */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex bg-slate-900 p-0.5 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setOrderType('MARKET')}
            className={`flex-1 py-1 rounded text-xs font-semibold transition-all ${
              orderType === 'MARKET' ? 'bg-slate-800 text-slate-100 shadow-xs' : 'text-slate-400'
            }`}
          >
            Market Order
          </button>
          <button
            type="button"
            onClick={() => setOrderType('LIMIT')}
            className={`flex-1 py-1 rounded text-xs font-semibold transition-all ${
              orderType === 'LIMIT' ? 'bg-slate-800 text-slate-100 shadow-xs' : 'text-slate-400'
            }`}
          >
            Limit Order
          </button>
        </div>
      </div>

      {/* Leverage Selector */}
      <div className="space-y-1.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-400">Leverage Multiplier</span>
          <span className="font-mono font-bold text-amber-400">{leverage}x</span>
        </div>
        <input
          type="range"
          min="1"
          max={selectedAsset.maxLeverage}
          value={leverage}
          onChange={e => setLeverage(parseInt(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
        />
        <div className="flex justify-between gap-1 text-[10px] text-slate-400 font-mono">
          {[1, 5, 10, 20, selectedAsset.maxLeverage].map(lev => (
            <button
              key={lev}
              type="button"
              onClick={() => setLeverage(lev)}
              className={`px-1.5 py-0.5 rounded border transition-colors ${
                leverage === lev ? 'bg-amber-500/20 border-amber-500 text-amber-400 font-bold' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {lev}x
            </button>
          ))}
        </div>
      </div>

      {/* Limit Price Input if Limit Order */}
      {orderType === 'LIMIT' && (
        <div>
          <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
            Target Limit Price ($)
          </label>
          <input
            type="number"
            step="any"
            value={limitPrice}
            onChange={e => setLimitPrice(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono font-semibold text-slate-100 focus:outline-none focus:border-amber-500"
          />
        </div>
      )}

      {/* Size Input Field & % Shortcuts */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[11px]">
          <label className="font-semibold uppercase text-slate-400">Order Size ({selectedAsset.symbol.split('/')[0]})</label>
          <span className="text-slate-400 font-mono">≈ ${notionalUSD.toLocaleString('en-US', { maximumFractionDigits: 2 })} USD</span>
        </div>

        <input
          type="number"
          step="any"
          value={sizeUnits}
          onChange={e => setSizeUnits(e.target.value)}
          placeholder="0.0"
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
        />

        {/* % Shortcut Buttons */}
        <div className="grid grid-cols-4 gap-1.5">
          {[25, 50, 75, 100].map(pct => (
            <button
              key={pct}
              type="button"
              onClick={() => handlePercentClick(pct)}
              className="py-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-[10px] font-bold font-mono text-slate-300 hover:text-white transition-colors"
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>

      {/* Toggle SL / TP targets */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setEnableSLTP(prev => !prev)}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 font-medium"
        >
          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${enableSLTP ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-700'}`}>
            {enableSLTP && <Check className="w-3 h-3 stroke-[3]" />}
          </div>
          <span>Attach Take Profit & Stop Loss</span>
        </button>

        {enableSLTP && (
          <div className="grid grid-cols-2 gap-2 mt-2 p-2 bg-slate-900/60 rounded-xl border border-slate-800">
            <div>
              <label className="text-[10px] uppercase font-bold text-emerald-400">Take Profit ($)</label>
              <input
                type="number"
                step="any"
                value={takeProfit}
                onChange={e => setTakeProfit(e.target.value)}
                placeholder={(priceToUse * 1.05).toFixed(2)}
                className="w-full mt-1 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs font-mono text-slate-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-rose-400">Stop Loss ($)</label>
              <input
                type="number"
                step="any"
                value={stopLoss}
                onChange={e => setStopLoss(e.target.value)}
                placeholder={(priceToUse * 0.95).toFixed(2)}
                className="w-full mt-1 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs font-mono text-slate-100 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Live Order Execution Breakdown Summary */}
      <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs space-y-1.5 text-slate-400 font-mono">
        <div className="flex justify-between">
          <span>Required Margin</span>
          <span className={`font-bold ${requiredMargin > availableBalance ? 'text-rose-400' : 'text-slate-100'}`}>
            ${requiredMargin.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Est. Liquidation Price</span>
          <span className="text-rose-400 font-semibold">${Math.max(0, liqPrice).toFixed(selectedAsset.precision)}</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span>Max Leverage Available</span>
          <span className="text-amber-400">{selectedAsset.maxLeverage}x</span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={requiredMargin > availableBalance || sizeNum <= 0}
        className={`w-full py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 ${
          side === 'LONG'
            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
            : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20'
        } disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]`}
      >
        <Zap className="w-4 h-4 fill-current" />
        <span>
          {side === 'LONG' ? 'Place Buy / Long Order' : 'Place Sell / Short Order'}
        </span>
      </button>
    </div>
  );
};
