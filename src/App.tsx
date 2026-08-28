import React, { useState } from 'react';
import { TradingProvider, useTrading } from './context/TradingContext';
import { Header } from './components/Header';
import { HomePage } from './components/Home/HomePage';
import { VIPPlansPage } from './components/VIP/VIPPlansPage';
import { ReferralPage } from './components/Referral/ReferralPage';
import { PortfolioPage } from './components/Portfolio/PortfolioPage';
import { HistoryPage } from './components/History/HistoryPage';
import { BookOfApexPage } from './components/BookOfApex/BookOfApexPage';
import { ToastContainer } from './components/ToastContainer';
import { AuthScreen } from './components/Auth/AuthScreen';

function MainLayout() {
  const { isAuthenticated } = useTrading();
  const [activeTab, setActiveTab] = useState<'home' | 'vip' | 'referral' | 'portfolio' | 'history' | 'book'>('home');

  if (!isAuthenticated) {
    return (
      <>
        <AuthScreen />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 flex flex-col">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 pb-12">
        {activeTab === 'home' && <HomePage onNavigate={setActiveTab} />}
        {activeTab === 'vip' && <VIPPlansPage />}
        {activeTab === 'referral' && <ReferralPage />}
        {activeTab === 'portfolio' && <PortfolioPage onNavigate={setActiveTab} />}
        {activeTab === 'history' && <HistoryPage onNavigate={setActiveTab} />}
        {activeTab === 'book' && <BookOfApexPage onNavigate={setActiveTab} />}
      </main>

      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <TradingProvider>
      <MainLayout />
    </TradingProvider>
  );
}
