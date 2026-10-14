import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp,
  Wallet,
  ArrowUpRight,
  Shield,
  User as UserIcon,
  HelpCircle,
  Menu,
  X,
  LogIn,
  LogOut,
  Coins,
  History,
  Layers,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenDeposit: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenDeposit }) => {
  const { user, logout, openAuthModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'dashboard', label: 'Dashboard', requiresAuth: true },
    { id: 'investment', label: 'Investment' },
    { id: 'transactions', label: 'Transactions', requiresAuth: true },
    { id: 'withdrawals', label: 'Withdrawals', requiresAuth: true },
    { id: 'profile', label: 'Profile', requiresAuth: true },
    { id: 'support', label: 'Support' },
  ];

  if (user?.role === 'admin') {
    navLinks.push({ id: 'admin', label: 'Admin Panel', requiresAuth: true });
  }

  const handleNavClick = (tabId: string, requiresAuth?: boolean) => {
    if (requiresAuth && !user) {
      openAuthModal('login');
      return;
    }
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#060d19]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-emerald-700 p-0.5 shadow-lg shadow-amber-500/10 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-[#070e1b] rounded-[10px] flex items-center justify-center">
                <span className="font-mono text-xl font-black bg-gradient-to-r from-amber-300 via-yellow-400 to-emerald-400 bg-clip-text text-transparent">
                  GH₵
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  RICH MONEY
                </span>
                <span className="text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  GHANA
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5 tracking-wide">
                Premier Financial & Growth Simulator
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const active = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id, link.requiresAuth)}
                  className={`px-3 py-2 text-sm font-medium transition-all relative ${
                    active
                      ? 'text-amber-400 font-semibold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <>
                <button
                  onClick={onOpenDeposit}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-md shadow-emerald-950 transition active:scale-95 cursor-pointer"
                >
                  <Coins className="w-3.5 h-3.5 text-amber-200" />
                  <span>Deposit GH₵</span>
                </button>

                <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                  <button
                    onClick={() => handleNavClick('profile')}
                    className="flex items-center gap-2 text-xs text-left p-1.5 rounded-lg hover:bg-slate-800/60 transition group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 font-bold group-hover:border-amber-400/50">
                      {user.fullName.charAt(0)}
                    </div>
                    <div className="hidden xl:block">
                      <div className="font-medium text-slate-200 text-xs leading-none">
                        {user.fullName}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-mono mt-1 leading-none">
                        GH₵{user.realBalance.toFixed(2)}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={logout}
                    title="Log out"
                    className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800/60 transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 hover:brightness-110 text-slate-950 font-bold shadow-lg shadow-amber-500/10 transition active:scale-95 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Get Started</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex sm:hidden items-center gap-2">
            {user && (
              <button
                onClick={onOpenDeposit}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-md bg-emerald-600 text-white"
              >
                + Deposit
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-[#060d19]/98 px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id, link.requiresAuth)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                currentTab === link.id
                  ? 'bg-amber-500/15 text-amber-400 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              {link.label}
            </button>
          ))}

          <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
            {user ? (
              <>
                <div className="flex items-center justify-between px-2 py-1 text-xs">
                  <span className="text-slate-400">Signed in as {user.fullName}</span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    GH₵{user.realBalance.toFixed(2)} Real
                  </span>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenDeposit();
                  }}
                  className="w-full py-2.5 text-center text-xs font-semibold rounded-lg bg-emerald-600 text-white"
                >
                  Deposit Funds (GH₵)
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-center text-xs font-semibold rounded-lg bg-slate-800 text-rose-300"
                >
                  Log Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="py-2.5 text-center text-xs font-semibold rounded-lg bg-slate-800 text-white"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('register');
                  }}
                  className="py-2.5 text-center text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 font-bold"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
