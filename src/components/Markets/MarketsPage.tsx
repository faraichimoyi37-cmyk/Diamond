import React, { useState } from 'react';
import { useTrading } from '../../context/TradingContext';
import { AssetCategory } from '../../types/trading';
import {
  Search,
  Star,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ArrowUpRight,
  Flame,
  Globe2
} from 'lucide-react';

interface MarketsPageProps {
  onTradeAsset: (assetId: string) => void;
}

export const MarketsPage: React.FC<MarketsPageProps> = ({ onTradeAsset }) => {
  const { assets, watchlist, toggleWatchlist } = useTrading();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<AssetCategory | 'All' | 'Watchlist'>('All');

  const filteredAssets = assets.filter(a => {
    const matchesSearch = a.symbol.toLowerCase().includes(search.toLowerCase()) ||
      a.name.toLowerCase().includes(search.toLowerCase());
    
    if (category === 'Watchlist') {
      return matchesSearch && watchlist.includes(a.id);
    }
    if (category !== 'All') {
      return matchesSearch && a.category === category;
    }
    return matchesSearch;
  });

  // Top gainer & top loser
  const topGainer = [...assets].sort((a, b) => b.change24h - a.change24h)[0];
  const topLoser = [...assets].sort((a, b) => a.change24h - b.change24h)[0];
  const topVolume = [...assets].sort((a, b) => b.volume24h - a.volume24h)[0];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Top Highlights Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Top Gainer Widget */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase font-bold text-slate-400 flex items-center gap-1.5 mb-1">
              <Flame className="w-4 h-4 text-emerald-400" />
              <span>Top 24h Gainer</span>
            </div>
            <div className="text-lg font-mono font-extrabold text-slate-100">{topGainer.symbol}</div>
            <div className="text-xs text-slate-400">{topGainer.name}</div>
          </div>
          <div className="text-right">
            <div className="text-base font-mono font-bold text-emerald-400">+{topGainer.change24h}%</div>
            <div className="text-xs font-mono text-slate-300">${topGainer.price.toLocaleString(undefined, { minimumFractionDigits: topGainer.precision })}</div>
          </div>
        </div>

        {/* Top Loser Widget */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/30 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase font-bold text-slate-400 flex items-center gap-1.5 mb-1">
              <TrendingDown className="w-4 h-4 text-rose-400" />
              <span>Top 24h Move Down</span>
            </div>
            <div className="text-lg font-mono font-extrabold text-slate-100">{topLoser.symbol}</div>
            <div className="text-xs text-slate-400">{topLoser.name}</div>
          </div>
          <div className="text-right">
            <div className="text-base font-mono font-bold text-rose-400">{topLoser.change24h}%</div>
            <div className="text-xs font-mono text-slate-300">${topLoser.price.toLocaleString(undefined, { minimumFractionDigits: topLoser.precision })}</div>
          </div>
        </div>

        {/* Top Volume Widget */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/30 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase font-bold text-slate-400 flex items-center gap-1.5 mb-1">
              <BarChart3 className="w-4 h-4 text-sky-400" />
              <span>Highest 24h Volume</span>
            </div>
            <div className="text-lg font-mono font-extrabold text-slate-100">{topVolume.symbol}</div>
            <div className="text-xs text-slate-400">{topVolume.name}</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-mono font-bold text-sky-400">
              ${(topVolume.volume24h / 1e9).toFixed(2)}B
            </div>
            <div className="text-xs font-mono text-slate-300">${topVolume.price.toLocaleString(undefined, { minimumFractionDigits: topVolume.precision })}</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
          {(['All', 'Watchlist', 'Crypto', 'Stocks', 'Commodities', 'Forex'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat === 'Watchlist' && '★ '}
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search symbol or market..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Tickers Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/60 text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-bold text-center w-10">★</th>
                <th className="py-3 px-4 font-bold">Instrument</th>
                <th className="py-3 px-4 font-bold">Category</th>
                <th className="py-3 px-4 font-bold">Price</th>
                <th className="py-3 px-4 font-bold">24h Change</th>
                <th className="py-3 px-4 font-bold">24h High / Low</th>
                <th className="py-3 px-4 font-bold">24h Volume</th>
                <th className="py-3 px-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredAssets.map(asset => {
                const isSaved = watchlist.includes(asset.id);
                const isPositive = asset.change24h >= 0;

                return (
                  <tr key={asset.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => toggleWatchlist(asset.id)}
                        className={`transition-colors ${isSaved ? 'text-amber-400' : 'text-slate-600 hover:text-slate-300'}`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div>
                          <div className="font-extrabold text-sm text-slate-100">{asset.symbol}</div>
                          <div className="text-[11px] text-slate-400 font-sans">{asset.name}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-semibold">
                        {asset.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-sm">
                      ${asset.price.toLocaleString(undefined, { minimumFractionDigits: asset.precision })}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 font-bold text-xs px-2 py-0.5 rounded ${
                          isPositive ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                        }`}
                      >
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isPositive ? '+' : ''}{asset.change24h}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      <div>H: ${asset.high24h.toLocaleString()}</div>
                      <div>L: ${asset.low24h.toLocaleString()}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      ${(asset.volume24h / 1e6).toFixed(1)}M
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onTradeAsset(asset.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase transition-all shadow-md flex items-center gap-1 ml-auto"
                      >
                        <span>Trade</span>
                        <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
