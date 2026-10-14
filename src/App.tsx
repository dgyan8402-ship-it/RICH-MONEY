import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DemoModeBanner } from './components/DemoModeBanner';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { DepositModal } from './components/DepositModal';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { WithdrawalsPage } from './pages/WithdrawalsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SupportPage } from './pages/SupportPage';
import { AdminPage } from './pages/AdminPage';

function MainApp() {
  const { user, refreshUser, openAuthModal } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isDepositOpen, setIsDepositOpen] = useState(false);

  const handleOpenDeposit = () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    setIsDepositOpen(true);
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardPage setCurrentTab={setCurrentTab} onOpenDeposit={handleOpenDeposit} />;
      case 'investment':
        return <SimulatorPage />;
      case 'transactions':
        return <TransactionsPage />;
      case 'withdrawals':
        return <WithdrawalsPage />;
      case 'profile':
        return <ProfilePage />;
      case 'support':
        return <SupportPage />;
      case 'admin':
        return <AdminPage />;
      case 'home':
      default:
        return <HomePage setCurrentTab={setCurrentTab} onOpenDeposit={handleOpenDeposit} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050b14] text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {/* Disclaimer & Quick Switcher Banner */}
      <DemoModeBanner />

      {/* Main Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenDeposit={handleOpenDeposit}
      />

      {/* Active Tab View */}
      <main className="flex-1">
        {renderContent()}
      </main>

      {/* Global Modals */}
      <AuthModal />
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onDepositSuccess={() => {
          refreshUser();
        }}
      />

      {/* Regulatory & Platform Footer */}
      <Footer setCurrentTab={setCurrentTab} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
