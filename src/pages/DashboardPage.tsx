import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Wallet,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  Coins,
  RefreshCw,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { WalletSummary, Transaction } from '../types';

interface DashboardPageProps {
  setCurrentTab: (tab: string) => void;
  onOpenDeposit: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  setCurrentTab,
  onOpenDeposit,
}) => {
  const { user, refreshUser } = useAuth();
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulatingStep, setSimulatingStep] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('rm_token');
    if (!token) return;

    try {
      const [sumRes, txRes] = await Promise.all([
        fetch('/api/wallet/summary', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/wallet/transactions', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (sumRes.ok && txRes.ok) {
        const sumData = await sumRes.json();
        const txData = await txRes.json();
        setSummary(sumData);
        setTransactions(txData.transactions || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleSimulateStep = async () => {
    setSimulatingStep(true);
    setNotice(null);
    const token = localStorage.getItem('rm_token');
    try {
      const res = await fetch('/api/simulator/simulate-step', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setNotice(data.message);
        await Promise.all([fetchDashboardData(), refreshUser()]);
      } else {
        setNotice(data.error || 'Failed to simulate step');
      }
    } catch (err: any) {
      setNotice(err.message || 'Error running step');
    } finally {
      setSimulatingStep(false);
    }
  };

  const handleResetDemo = async () => {
    const token = localStorage.getItem('rm_token');
    if (!confirm('Reset your demo simulation balance back to default GH₵1,000.00?')) return;

    try {
      const res = await fetch('/api/wallet/demo/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setNotice('Demo simulation balance reset to GH₵1,000.00');
        await Promise.all([fetchDashboardData(), refreshUser()]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-3" />
        <p className="text-slate-400 text-sm">Loading your financial ledger...</p>
      </div>
    );
  }

  const realBalance = summary?.real.balance ?? user?.realBalance ?? 0;
  const demoBalance = summary?.demo.balance ?? user?.demoBalance ?? 0;
  const demoInvested = summary?.demo.invested ?? user?.demoInvested ?? 0;
  const totalDeposited = summary?.real.totalDeposited ?? user?.totalDeposited ?? 0;
  const totalWithdrawn = summary?.real.totalWithdrawn ?? user?.totalWithdrawn ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & KYC Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#0b1528] via-[#0d1b33] to-[#071120] border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white">Akwaaba, {user?.fullName}!</h1>
            {user?.kycStatus === 'verified' ? (
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> KYC Verified
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3" /> KYC Pending
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Account ID: <span className="font-mono text-slate-300">{user?.id}</span> · Phone:{' '}
            <span className="font-mono text-slate-300">{user?.phone}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenDeposit}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs shadow-md shadow-emerald-950 flex items-center gap-1.5 cursor-pointer transition active:scale-95"
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-200" />
            <span>Deposit GH₵</span>
          </button>
          <button
            onClick={() => setCurrentTab('withdrawals')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-1.5 cursor-pointer transition"
          >
            <ArrowUpRight className="w-4 h-4 text-amber-400" />
            <span>Withdrawals</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-3 animate-fadeIn">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="text-amber-400 hover:text-white font-bold text-sm">
            ✕
          </button>
        </div>
      )}

      {/* CORE FINANCIAL BALANCES (REAL VS DEMO) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* REAL FUNDS CARD */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0c1a30] to-[#070e1a] border border-slate-700/80 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Real Funds Ledger (Ghanaian Cedis)
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold">Legitimate Account</span>
          </div>

          <div>
            <div className="text-xs text-slate-400">Available Withdrawable Balance</div>
            <div className="font-mono text-3xl sm:text-4xl font-black text-white mt-1">
              GH₵{realBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {realBalance >= 100
                ? '✅ Eligible for withdrawal (Minimum GH₵100 threshold met)'
                : `⚠️ Needs GH₵${(100 - realBalance).toFixed(2)} more to reach GH₵100 withdrawal threshold`}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-xs">
            <div className="space-y-1">
              <span className="text-slate-500 block">Total Verified Deposits:</span>
              <span className="font-mono text-emerald-400 font-bold text-sm">
                GH₵{totalDeposited.toFixed(2)}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 block">Total Real Withdrawals:</span>
              <span className="font-mono text-slate-300 font-bold text-sm">
                GH₵{totalWithdrawn.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              onClick={onOpenDeposit}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Coins className="w-4 h-4" />
              <span>Add Real Deposit</span>
            </button>
            <button
              onClick={() => setCurrentTab('withdrawals')}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <span>Request Payout</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* DEMO SIMULATED GROWTH CARD */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-950/20 via-[#0b1528] to-[#070e1a] border border-amber-500/30 shadow-xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Simulated 30% Growth (DEMO MODE)
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
              ISOLATED TEST CAPITAL
            </span>
          </div>

          <div>
            <div className="text-xs text-amber-200/80">Simulated Account Balance (Non-Withdrawable)</div>
            <div className="font-mono text-3xl sm:text-4xl font-black text-amber-400 mt-1">
              GH₵{demoBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-amber-300/70 mt-1">
              {summary?.demo.thresholdNotice ||
                (demoBalance >= 100
                  ? 'Your demo balance has reached the threshold.'
                  : 'Your demo balance has not reached the minimum withdrawal threshold of GH₵100.')}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-xs">
            <div className="space-y-1">
              <span className="text-slate-500 block">Committed Demo Capital:</span>
              <span className="font-mono text-white font-bold text-sm">
                GH₵{demoInvested.toFixed(2)}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 block">Simulated Daily Yield:</span>
              <span className="font-mono text-emerald-400 font-bold text-sm">
                +30.0% / Day (Hypothetical)
              </span>
            </div>
          </div>

          {/* Interactive simulator controls */}
          <div className="pt-2 flex flex-wrap gap-2.5">
            <button
              onClick={handleSimulateStep}
              disabled={simulatingStep}
              className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              <TrendingUp className="w-4 h-4" />
              <span>{simulatingStep ? 'Compounding...' : 'Simulate 1 Day (+30%)'}</span>
            </button>
            <button
              onClick={() => setCurrentTab('investment')}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition cursor-pointer"
            >
              Calculator View
            </button>
            <button
              onClick={handleResetDemo}
              title="Reset Demo to GH₵1,000"
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* QUICK SIMULATOR FORMULA HIGHLIGHT */}
      <div className="p-4 rounded-2xl bg-[#091222] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-300">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            %
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Hypothetical Growth Model:</span>
            <span className="font-mono text-white font-semibold">
              New simulated balance = Previous simulated balance × 1.30
            </span>
          </div>
        </div>
        <div className="text-[11px] text-slate-500 max-w-md text-right">
          Demo balances are strictly segregated. Never represent simulated profits as real money.
        </div>
      </div>

      {/* RECENT TRANSACTION HISTORY TABLE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Transaction Activity</h2>
            <p className="text-xs text-slate-400">Audited records with status and payment rails</p>
          </div>
          <button
            onClick={() => setCurrentTab('transactions')}
            className="text-xs font-semibold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All Transactions</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#091222]/80">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#050b14] border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Type & Mode</th>
                <th className="px-4 py-3">Amount (GH₵)</th>
                <th className="px-4 py-3">Channel / Method</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No transactions recorded yet. Make a sandbox deposit to get started!
                  </td>
                </tr>
              ) : (
                transactions.slice(0, 6).map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-4 py-3 font-mono text-slate-400">
                      {new Date(tx.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white capitalize">
                        {tx.type.replace('_', ' ')}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 uppercase">
                        {tx.mode === 'demo' ? '🟡 Demo Mode' : '🟢 Real Funds'}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-white">
                      {tx.type === 'deposit' || tx.type === 'demo_growth' ? '+' : '-'}
                      GH₵{tx.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 uppercase font-mono text-[11px] text-slate-400">
                      {tx.paymentMethod.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                      {tx.paymentReference}
                    </td>
                    <td className="px-4 py-3">
                      {tx.status === 'successful' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> Successful
                        </span>
                      )}
                      {tx.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <Clock className="w-3 h-3 animate-spin" /> Pending
                        </span>
                      )}
                      {(tx.status === 'failed' || tx.status === 'rejected') && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          <AlertCircle className="w-3 h-3" /> {tx.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
