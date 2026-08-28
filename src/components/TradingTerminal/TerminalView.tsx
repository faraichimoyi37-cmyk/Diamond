import React from 'react';
import { CandlestickChart } from './CandlestickChart';
import { OrderBook } from './OrderBook';
import { OrderForm } from './OrderForm';
import { PositionsTable } from './PositionsTable';

export const TerminalView: React.FC = () => {
  return (
    <div className="p-4 space-y-4 max-w-[1700px] mx-auto">
      {/* Upper Grid: Chart (Left) + OrderBook (Middle) + OrderForm (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Main Chart Column (7 cols) */}
        <div className="lg:col-span-7 h-[520px]">
          <CandlestickChart />
        </div>

        {/* Order Book Column (2.5 cols) */}
        <div className="lg:col-span-2 h-[520px]">
          <OrderBook />
        </div>

        {/* Order Ticket Column (2.5 cols) */}
        <div className="lg:col-span-3 h-[520px]">
          <OrderForm />
        </div>
      </div>

      {/* Lower Section: Open Positions & Orders Table */}
      <div>
        <PositionsTable />
      </div>
    </div>
  );
};
