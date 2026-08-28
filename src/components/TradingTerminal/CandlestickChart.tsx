import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTrading } from '../../context/TradingContext';
import { Candle } from '../../types/trading';
import {
  BarChart2,
  LineChart,
  Eye,
  Sliders,
  Maximize2,
  Minimize2,
  Layers,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

export const CandlestickChart: React.FC = () => {
  const {
    selectedAsset,
    timeframe,
    setTimeframe,
    candles,
    positions
  } = useTrading();

  const [chartType, setChartType] = useState<'candle' | 'line'>('candle');
  const [showMA, setShowMA] = useState(true);
  const [showRSI, setShowRSI] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Filter active positions for currently selected asset
  const activeAssetPositions = positions.filter(p => p.assetId === selectedAsset.id);

  // Compute Moving Averages
  const ma20 = useMemo(() => {
    const period = 20;
    return candles.map((c, i) => {
      if (i < period - 1) return null;
      const slice = candles.slice(i - period + 1, i + 1);
      const sum = slice.reduce((acc, curr) => acc + curr.close, 0);
      return sum / period;
    });
  }, [candles]);

  const ma50 = useMemo(() => {
    const period = 50;
    return candles.map((c, i) => {
      if (i < period - 1) return null;
      const slice = candles.slice(i - period + 1, i + 1);
      const sum = slice.reduce((acc, curr) => acc + curr.close, 0);
      return sum / period;
    });
  }, [candles]);

  // Compute 14-period RSI
  const rsiValues = useMemo(() => {
    const period = 14;
    const rsi: (number | null)[] = [];
    let gains = 0;
    let losses = 0;

    for (let i = 0; i < candles.length; i++) {
      if (i === 0) {
        rsi.push(null);
        continue;
      }
      const change = candles[i].close - candles[i - 1].close;
      if (i <= period) {
        if (change >= 0) gains += change;
        else losses += Math.abs(change);

        if (i === period) {
          const avgGain = gains / period;
          const avgLoss = losses / period;
          const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
          rsi.push(100 - 100 / (1 + rs));
        } else {
          rsi.push(null);
        }
      } else {
        const gain = change >= 0 ? change : 0;
        const loss = change < 0 ? Math.abs(change) : 0;
        gains = (gains * (period - 1) + gain) / period;
        losses = (losses * (period - 1) + loss) / period;
        const rs = losses === 0 ? 100 : gains / losses;
        rsi.push(100 - 100 / (1 + rs));
      }
    }
    return rsi;
  }, [candles]);

  // High resolution Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current || candles.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Padding parameters
    const rightMargin = 70; // for Y-axis labels
    const bottomMargin = showRSI ? 100 : 30; // for time axis & RSI subpane
    const topMargin = 20;

    const chartWidth = width - rightMargin;
    const mainChartHeight = height - bottomMargin - topMargin;
    const rsiPaneTop = height - 85;
    const rsiPaneHeight = 65;

    // Price Bounds
    let minPrice = Math.min(...candles.map(c => c.low));
    let maxPrice = Math.max(...candles.map(c => c.high));

    // Pad price bounds
    const padding = (maxPrice - minPrice) * 0.05 || 1;
    minPrice -= padding;
    maxPrice += padding;

    const maxVolume = Math.max(...candles.map(c => c.volume)) || 1;

    // Helper scale functions
    const getY = (price: number) => {
      return topMargin + mainChartHeight - ((price - minPrice) / (maxPrice - minPrice)) * mainChartHeight;
    };

    const getX = (index: number) => {
      const step = chartWidth / candles.length;
      return index * step + step / 2;
    };

    const candleWidth = Math.max(2, (chartWidth / candles.length) * 0.7);

    // 1. Clear background
    ctx.fillStyle = '#090d16'; // Deep Slate background
    ctx.fillRect(0, 0, width, height);

    // 2. Draw Horizontal Grid lines & Price Labels
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748b';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';

    const priceGridSteps = 6;
    for (let i = 0; i <= priceGridSteps; i++) {
      const priceVal = minPrice + ((maxPrice - minPrice) / priceGridSteps) * i;
      const y = getY(priceVal);

      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      ctx.fillText(priceVal.toFixed(selectedAsset.precision), chartWidth + 10, y + 3);
    }

    // 3. Draw Volume Bars at bottom of main chart
    if (showVolume) {
      const volMaxHeight = mainChartHeight * 0.22;
      candles.forEach((c, i) => {
        const x = getX(i);
        const volHeight = (c.volume / maxVolume) * volMaxHeight;
        const y = topMargin + mainChartHeight - volHeight;
        const isUp = c.close >= c.open;

        ctx.fillStyle = isUp ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)';
        ctx.fillRect(x - candleWidth / 2, y, candleWidth, volHeight);
      });
    }

    // 4. Draw Candlesticks or Line Chart
    if (chartType === 'candle') {
      candles.forEach((c, i) => {
        const x = getX(i);
        const openY = getY(c.open);
        const closeY = getY(c.close);
        const highY = getY(c.high);
        const lowY = getY(c.low);
        const isUp = c.close >= c.open;

        const color = isUp ? '#10b981' : '#ef4444';

        // Wick
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        // Body
        const bodyTop = Math.min(openY, closeY);
        const bodyHeight = Math.max(2, Math.abs(openY - closeY));

        ctx.fillStyle = color;
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      });
    } else {
      // Line Chart
      ctx.beginPath();
      candles.forEach((c, i) => {
        const x = getX(i);
        const y = getY(c.close);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Gradient Fill below line
      const gradient = ctx.createLinearGradient(0, topMargin, 0, topMargin + mainChartHeight);
      gradient.addColorStop(0, 'rgba(56, 189, 248, 0.3)');
      gradient.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
      ctx.lineTo(getX(candles.length - 1), topMargin + mainChartHeight);
      ctx.lineTo(getX(0), topMargin + mainChartHeight);
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // 5. Draw Moving Averages (MA20 & MA50)
    if (showMA) {
      // MA20 (Cyan)
      ctx.beginPath();
      let started20 = false;
      ma20.forEach((val, i) => {
        if (val === null) return;
        const x = getX(i);
        const y = getY(val);
        if (!started20) {
          ctx.moveTo(x, y);
          started20 = true;
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // MA50 (Yellow)
      ctx.beginPath();
      let started50 = false;
      ma50.forEach((val, i) => {
        if (val === null) return;
        const x = getX(i);
        const y = getY(val);
        if (!started50) {
          ctx.moveTo(x, y);
          started50 = true;
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // 6. Draw Active Positions Overlays on Chart
    activeAssetPositions.forEach(pos => {
      const entryY = getY(pos.entryPrice);
      const color = pos.side === 'LONG' ? '#10b981' : '#ef4444';

      // Entry Price Line
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, entryY);
      ctx.lineTo(chartWidth, entryY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label Badge
      ctx.fillStyle = color;
      ctx.fillRect(chartWidth + 2, entryY - 9, 62, 18);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`${pos.side} $${pos.entryPrice.toFixed(2)}`, chartWidth + 5, entryY + 3);

      // Stop Loss Level Line if set
      if (pos.stopLoss) {
        const slY = getY(pos.stopLoss);
        ctx.setLineDash([2, 2]);
        ctx.strokeStyle = '#f43f5e';
        ctx.beginPath();
        ctx.moveTo(0, slY);
        ctx.lineTo(chartWidth, slY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(chartWidth + 2, slY - 8, 62, 16);
        ctx.fillStyle = '#ffffff';
        ctx.font = '9px monospace';
        ctx.fillText(`SL $${pos.stopLoss.toFixed(2)}`, chartWidth + 5, slY + 3);
      }

      // Take Profit Level Line if set
      if (pos.takeProfit) {
        const tpY = getY(pos.takeProfit);
        ctx.setLineDash([2, 2]);
        ctx.strokeStyle = '#10b981';
        ctx.beginPath();
        ctx.moveTo(0, tpY);
        ctx.lineTo(chartWidth, tpY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#10b981';
        ctx.fillRect(chartWidth + 2, tpY - 8, 62, 16);
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(`TP $${pos.takeProfit.toFixed(2)}`, chartWidth + 5, tpY + 3);
      }
    });

    // 7. Draw RSI Sub-Pane
    if (showRSI) {
      // Divider
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.moveTo(0, rsiPaneTop - 10);
      ctx.lineTo(width, rsiPaneTop - 10);
      ctx.stroke();

      // RSI Reference lines (30, 70)
      const rsi70Y = rsiPaneTop + rsiPaneHeight - (70 / 100) * rsiPaneHeight;
      const rsi30Y = rsiPaneTop + rsiPaneHeight - (30 / 100) * rsiPaneHeight;

      ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(0, rsi70Y);
      ctx.lineTo(chartWidth, rsi70Y);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
      ctx.beginPath();
      ctx.moveTo(0, rsi30Y);
      ctx.lineTo(chartWidth, rsi30Y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#64748b';
      ctx.font = '9px monospace';
      ctx.fillText('RSI (14)', 5, rsiPaneTop + 10);
      ctx.fillText('70', chartWidth + 10, rsi70Y + 3);
      ctx.fillText('30', chartWidth + 10, rsi30Y + 3);

      // Draw RSI line
      ctx.beginPath();
      let startedRSI = false;
      rsiValues.forEach((val, i) => {
        if (val === null) return;
        const x = getX(i);
        const y = rsiPaneTop + rsiPaneHeight - (val / 100) * rsiPaneHeight;
        if (!startedRSI) {
          ctx.moveTo(x, y);
          startedRSI = true;
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.strokeStyle = '#c084fc'; // Purple
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // 8. Crosshair & Hover Tooltip
    if (mousePos && mousePos.x >= 0 && mousePos.x <= chartWidth) {
      const step = chartWidth / candles.length;
      const index = Math.floor(mousePos.x / step);
      const candle = candles[Math.max(0, Math.min(candles.length - 1, index))];

      if (candle) {
        setHoveredCandle(candle);
        const x = getX(index);

        // Vertical crosshair line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();

        // Horizontal crosshair line
        if (mousePos.y <= topMargin + mainChartHeight) {
          ctx.beginPath();
          ctx.moveTo(0, mousePos.y);
          ctx.lineTo(chartWidth, mousePos.y);
          ctx.stroke();

          // Price Tag on Right Axis
          const priceAtMouse = maxPrice - ((mousePos.y - topMargin) / mainChartHeight) * (maxPrice - minPrice);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(chartWidth + 2, mousePos.y - 10, 62, 20);
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 10px monospace';
          ctx.fillText(priceAtMouse.toFixed(selectedAsset.precision), chartWidth + 5, mousePos.y + 3);
        }
        ctx.setLineDash([]);
      }
    } else {
      setHoveredCandle(null);
    }

  }, [candles, chartType, showMA, showRSI, showVolume, selectedAsset, mousePos, activeAssetPositions, ma20, ma50, rsiValues]);

  // Handle Mouse movement over canvas
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos(null);
  };

  const latestCandle = candles[candles.length - 1] || { open: 0, high: 0, low: 0, close: 0, volume: 0 };
  const displayCandle = hoveredCandle || latestCandle;
  const isUp = displayCandle.close >= displayCandle.open;

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
      {/* Chart Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 border-b border-slate-800/80 bg-slate-900/60 text-xs gap-3">
        {/* Timeframe Selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {['1m', '5m', '15m', '1h', '1d'].map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2 py-0.5 rounded font-mono font-bold transition-all uppercase ${
                timeframe === tf
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* OHLC Readout */}
        <div className="hidden sm:flex items-center gap-3 font-mono text-[11px]">
          <span className="text-slate-400">
            O: <strong className="text-slate-100">${displayCandle.open.toFixed(selectedAsset.precision)}</strong>
          </span>
          <span className="text-slate-400">
            H: <strong className="text-emerald-400">${displayCandle.high.toFixed(selectedAsset.precision)}</strong>
          </span>
          <span className="text-slate-400">
            L: <strong className="text-rose-400">${displayCandle.low.toFixed(selectedAsset.precision)}</strong>
          </span>
          <span className="text-slate-400">
            C: <strong className={isUp ? 'text-emerald-400' : 'text-rose-400'}>${displayCandle.close.toFixed(selectedAsset.precision)}</strong>
          </span>
          <span className="text-slate-400">
            Vol: <strong className="text-slate-200">{displayCandle.volume.toLocaleString()}</strong>
          </span>
        </div>

        {/* Indicators & Chart Type Toggles */}
        <div className="flex items-center gap-2">
          {/* Chart Type */}
          <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800">
            <button
              onClick={() => setChartType('candle')}
              title="Candlestick View"
              className={`p-1 rounded ${chartType === 'candle' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'}`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartType('line')}
              title="Line Chart View"
              className={`p-1 rounded ${chartType === 'line' ? 'bg-slate-800 text-sky-400' : 'text-slate-400'}`}
            >
              <LineChart className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Indicators Toggles */}
          <button
            onClick={() => setShowMA(p => !p)}
            className={`px-2 py-1 rounded border text-[11px] font-semibold transition-colors ${
              showMA ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            MA
          </button>
          <button
            onClick={() => setShowRSI(p => !p)}
            className={`px-2 py-1 rounded border text-[11px] font-semibold transition-colors ${
              showRSI ? 'bg-purple-500/10 border-purple-500/40 text-purple-400' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            RSI
          </button>
          <button
            onClick={() => setShowVolume(p => !p)}
            className={`px-2 py-1 rounded border text-[11px] font-semibold transition-colors ${
              showVolume ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            VOL
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div ref={containerRef} className="relative flex-1 w-full h-full min-h-[380px] cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="absolute inset-0 w-full h-full block"
        />
      </div>
    </div>
  );
};
