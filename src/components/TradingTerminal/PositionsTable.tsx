import React, { useState } from 'react';
import { useTrading } from '../../context/TradingContext';
import { Position } from '../../types/trading';
import {
  TrendingUp,
  TrendingDown,
  XCircle,
  SlidersHorizontal,
  History,
  Layers,
  Clock,
  ShieldAlert,
  Check
} from 'lucide-react';

export const PositionsTable: React.FC = () => {
  const {
    positions,
    orders,
    tradeHistory,
    closePosition,
    cancelOrder,
    updatePositionSLTP,
    assets
  } = useTrading();

  const [activeTab, setActiveTab] = useState<'positions' | 'orders' | 'history'>('positions');
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [slValue, setSlValue] = useState<string>('');
  const [tpValue, setTpValue] = useState<string>('');

  const handleEditSLTP = (pos: Position) => {
    setEditingPosition(pos);
    setSlValue(pos.stopLoss ? pos.stopLoss.toString() : '');
    setTpValue(pos.takeProfit ? pos.takeProfit.toString() : '');
  };

  const handleSaveSLTP = () => {
    if (!editingPosition) return;
    const sl = slValue ? parseFloat(slValue) : undefined;
    const tp = tpValue ? parseFloat(tpValue) : undefined;
    updatePositionSLTP(editingPosition.id, sl, tp);
    setEditingPosition(null);
  };

  return (
    <div className="flex flex-col bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-xl text-slate-100">
      {/* Tab Navigation Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900/60 text-xs">
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('positions')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
              activeTab === 'positions'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Open Positions</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px]">
              {positions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
              activeTab === 'orders'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Open Orders</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 text-[10px]">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5 text-sky-400" />
            <span>Trade History</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 text-[10px]">
              {tradeHistory.length}
            </span>
          </button>
        </div>

        {positions.length > 0 && activeTab === 'positions' && (
          <button
            onClick={() => positions.forEach(p => closePosition(p.id, 'MANUAL'))}
            className="text-[11px] font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-2.5 py-1 rounded-lg transition-colors"
          >
            Close All Positions
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="overflow-x-auto min-h-[180px]">
        {activeTab === 'positions' && (
          positions.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
              <Layers className="w-8 h-8 opacity-30" />
              <span>No active positions open. Select an asset and execute a Buy or Sell order above!</span>
            </div>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/40 text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4 font-bold">Instrument</th>
                  <th className="py-2.5 px-3 font-bold">Side & Lev</th>
                  <th className="py-2.5 px-3 font-bold">Size</th>
                  <th className="py-2.5 px-3 font-bold">Entry Price</th>
                  <th className="py-2.5 px-3 font-bold">Mark Price</th>
                  <th className="py-2.5 px-3 font-bold">Liq. Price</th>
                  <th className="py-2.5 px-3 font-bold">Margin</th>
                  <th className="py-2.5 px-3 font-bold">SL / TP</th>
                  <th className="py-2.5 px-3 font-bold text-right">Unrealized PnL</th>
                  <th className="py-2.5 px-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {positions.map(pos => {
                  const targetAsset = assets.find(a => a.id === pos.assetId);
                  const markPrice = targetAsset ? targetAsset.price : pos.markPrice;

                  let pnl = 0;
                  if (pos.side === 'LONG') {
                    pnl = (markPrice - pos.entryPrice) * pos.size * pos.leverage;
                  } else {
                    pnl = (pos.entryPrice - markPrice) * pos.size * pos.leverage;
                  }
                  const pnlPercent = (pnl / pos.margin) * 100;

                  return (
                    <tr key={pos.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-100">{pos.symbol}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            pos.side === 'LONG'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {pos.side === 'LONG' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {pos.side} {pos.leverage}x
                        </span>
                      </td>
                      <td className="py-3 px-3">{pos.size}</td>
                      <td className="py-3 px-3">${pos.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 px-3 font-bold">${markPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 px-3 text-rose-400">${pos.liquidationPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 px-3">${pos.margin.toFixed(2)}</td>
                      <td className="py-3 px-3 text-[11px]">
                        <button
                          onClick={() => handleEditSLTP(pos)}
                          className="flex items-center gap-1 text-slate-400 hover:text-slate-100 bg-slate-900 px-2 py-0.5 rounded border border-slate-800"
                        >
                          <SlidersHorizontal className="w-3 h-3 text-amber-400" />
                          <span>
                            {pos.stopLoss || pos.takeProfit
                              ? `SL:${pos.stopLoss || '-'} TP:${pos.takeProfit || '-'}`
                              : '+ Set SL/TP'}
                          </span>
                        </button>
                      </td>
                      <td className={`py-3 px-3 text-right font-bold ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} ({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => closePosition(pos.id, 'MANUAL')}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 font-bold transition-all text-[11px]"
                        >
                          Close
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        )}

        {activeTab === 'orders' && (
          orders.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
              <Clock className="w-8 h-8 opacity-30" />
              <span>No pending limit orders. Place a Limit order above to auto-trigger at target price!</span>
            </div>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/40 text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4 font-bold">Instrument</th>
                  <th className="py-2.5 px-3 font-bold">Type</th>
                  <th className="py-2.5 px-3 font-bold">Side</th>
                  <th className="py-2.5 px-3 font-bold">Target Limit Price</th>
                  <th className="py-2.5 px-3 font-bold">Size</th>
                  <th className="py-2.5 px-3 font-bold">Locked Margin</th>
                  <th className="py-2.5 px-3 font-bold">Placed Time</th>
                  <th className="py-2.5 px-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {orders.map(ord => (
                  <tr key={ord.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-100">{ord.symbol}</td>
                    <td className="py-3 px-3 text-slate-400">{ord.type}</td>
                    <td className="py-3 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${ord.side === 'BUY' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                        {ord.side} {ord.leverage}x
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-amber-400">${ord.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-3">{ord.size}</td>
                    <td className="py-3 px-3">${ord.requiredMargin.toFixed(2)}</td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">{new Date(ord.createdAt).toLocaleTimeString()}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => cancelOrder(ord.id)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px]"
                      >
                        Cancel Order
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}

        {activeTab === 'history' && (
          tradeHistory.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
              <History className="w-8 h-8 opacity-30" />
              <span>No trade history recorded yet.</span>
            </div>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/40 text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4 font-bold">Instrument</th>
                  <th className="py-2.5 px-3 font-bold">Side</th>
                  <th className="py-2.5 px-3 font-bold">Entry Price</th>
                  <th className="py-2.5 px-3 font-bold">Exit Price</th>
                  <th className="py-2.5 px-3 font-bold">Size</th>
                  <th className="py-2.5 px-3 font-bold">Closed Reason</th>
                  <th className="py-2.5 px-3 font-bold text-right">Realized PnL</th>
                  <th className="py-2.5 px-4 font-bold text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {tradeHistory.map(trd => (
                  <tr key={trd.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-100">{trd.symbol}</td>
                    <td className="py-3 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${trd.side === 'LONG' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                        {trd.side} {trd.leverage}x
                      </span>
                    </td>
                    <td className="py-3 px-3">${trd.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-3">${trd.exitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-3">{trd.size}</td>
                    <td className="py-3 px-3 text-[11px] text-slate-400 uppercase">{trd.closeReason}</td>
                    <td className={`py-3 px-3 text-right font-bold ${trd.realizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {trd.realizedPnL >= 0 ? '+' : ''}${trd.realizedPnL.toFixed(2)} ({trd.realizedPnLPercent >= 0 ? '+' : ''}{trd.realizedPnLPercent.toFixed(2)}%)
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 text-[11px]">{new Date(trd.closedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>

      {/* Inline Modal for Editing Position SL/TP */}
      {editingPosition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-sm w-full text-slate-100 space-y-4 shadow-2xl">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-amber-400" />
              <span>Adjust SL / TP for {editingPosition.symbol}</span>
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-emerald-400 uppercase font-bold text-[10px]">Take Profit Target Price ($)</label>
                <input
                  type="number"
                  step="any"
                  value={tpValue}
                  onChange={e => setTpValue(e.target.value)}
                  placeholder="e.g. 98000"
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-rose-400 uppercase font-bold text-[10px]">Stop Loss Trigger Price ($)</label>
                <input
                  type="number"
                  step="any"
                  value={slValue}
                  onChange={e => setSlValue(e.target.value)}
                  placeholder="e.g. 91000"
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setEditingPosition(null)}
                className="flex-1 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSLTP}
                className="flex-1 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs uppercase hover:bg-emerald-400"
              >
                Save Targets
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
