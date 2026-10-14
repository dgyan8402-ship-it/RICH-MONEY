import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Wallet,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  Smartphone,
  CreditCard,
  Building,
  Info,
} from 'lucide-react';
import { WalletSummary, Transaction } from '../types';

export const WithdrawalsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [withdrawals, setWithdrawals] = useState<Transaction[]>([]);
  const [mode, setMode] = useState<'demo' | 'real'>('demo');
  const [amount, setAmount] = useState<string>('100');
  const [paymentMethod, setPaymentMethod] = useState<'mtn_momo' | 'telecel_cash' | 'at_money' | 'bank_transfer'>('mtn_momo');
  const [phone, setPhone] = useState(user?.phone || '+233 24 000 0000');
  const [accountName, setAccountName] = useState(user?.fullName || '');
  const [bankName, setBankName] = useState('GCB Bank Ltd');

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
    subMessage?: string;
  } | null>(null);

  const fetchSummaryAndWithdrawals = async () => {
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
        // Filter withdrawals
        const wList = (txData.transactions || []).filter(
          (t: Transaction) => t.type === 'withdrawal' || t.type === 'demo_withdrawal'
        );
        setWithdrawals(wList);
      }
    } catch (err) {
      console.error('Error fetching withdrawal data:', err);
    }
  };

  useEffect(() => {
    fetchSummaryAndWithdrawals();
  }, [user]);

  const demoBalance = summary?.demo.balance ?? user?.demoBalance ?? 0;
  const realBalance = summary?.real.balance ?? user?.realBalance ?? 0;
  const activeBalance = mode === 'demo' ? demoBalance : realBalance;

  const isDemoThresholdReached = demoBalance >= 100;
  const isRealThresholdReached = realBalance >= 100;

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setLoading(true);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 100) {
      setFeedback({
        type: 'error',
        message: 'Minimum withdrawal amount is GH₵100.00',
      });
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('rm_token');
    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parsedAmount,
          mode,
          paymentMethod,
          phone,
          accountName,
          bankName: paymentMethod === 'bank_transfer' ? bankName : undefined,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setFeedback({
          type: 'error',
          message: data.error || 'Failed to submit withdrawal request',
        });
      } else {
        setFeedback({
          type: 'success',
          message: data.message,
          subMessage: data.subMessage,
        });
        await Promise.all([fetchSummaryAndWithdrawals(), refreshUser()]);
      }
    } catch (err: any) {
      setLoading(false);
      setFeedback({
        type: 'error',
        message: err.message || 'Network error submitting withdrawal',
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-white tracking-tight">Withdrawal Portal</h1>
        <p className="text-sm text-slate-300">
          Request payouts to verified Ghanaian Mobile Money accounts or bank rails
        </p>
      </div>

      {/* THRESHOLD STATUS BANNER (Strict Requirement 5) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Demo Threshold Card */}
        <div
          className={`p-6 rounded-3xl border transition shadow-xl space-y-3 ${
            isDemoThresholdReached
              ? 'bg-emerald-950/20 border-emerald-500/40'
              : 'bg-amber-950/20 border-amber-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Demo Balance Threshold Status
            </span>
            <span className="font-mono text-xs font-bold text-amber-300">
              Min: GH₵100.00
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-black text-white">
              GH₵{demoBalance.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400">Current Demo Balance</span>
          </div>

          {/* Explicit requirement message */}
          <div
            className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
              isDemoThresholdReached
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
            }`}
          >
            {isDemoThresholdReached ? (
              <>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Your demo balance has reached the threshold.</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Your demo balance has not reached the minimum withdrawal threshold of GH₵100.</span>
              </>
            )}
          </div>

          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-500 ${
                isDemoThresholdReached ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, (demoBalance / 100) * 100)}%` }}
            />
          </div>
        </div>

        {/* Real Balance Threshold Card */}
        <div
          className={`p-6 rounded-3xl border transition shadow-xl space-y-3 ${
            isRealThresholdReached
              ? 'bg-[#0c1e38] border-emerald-500/40'
              : 'bg-[#0b1528] border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Real Funds Available
            </span>
            <span className="font-mono text-xs font-bold text-emerald-400">
              Min: GH₵100.00
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-black text-white">
              GH₵{realBalance.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400">Verified Real Balance</span>
          </div>

          <div
            className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
              isRealThresholdReached
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            {isRealThresholdReached ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Your real balance meets the minimum withdrawal threshold.</span>
              </>
            ) : (
              <>
                <Info className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Minimum GH₵100.00 required for verified payout.</span>
              </>
            )}
          </div>

          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min(100, (realBalance / 100) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* WITHDRAWAL REQUEST FORM & RULES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-[#0b1528] border border-slate-700/80 shadow-xl space-y-6">
          {/* Mode Switcher */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Select Payout Ledger Mode:
            </label>
            <div className="grid grid-cols-2 p-1.5 bg-[#050b14] border border-slate-800 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setFeedback(null);
                  setMode('demo');
                }}
                className={`py-2 rounded-lg transition ${
                  mode === 'demo'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🟡 Demo Mode Simulator
              </button>
              <button
                type="button"
                onClick={() => {
                  setFeedback(null);
                  setMode('real');
                }}
                className={`py-2 rounded-lg transition ${
                  mode === 'real'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🟢 Verified Real Funds
              </button>
            </div>
          </div>

          {feedback && (
            <div
              className={`p-4 rounded-xl border text-xs space-y-1 ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-500/15 border-rose-500/40 text-rose-200'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                )}
                <span>{feedback.message}</span>
              </div>
              {feedback.subMessage && <p className="text-[11px] opacity-90">{feedback.subMessage}</p>}
            </div>
          )}

          {/* Mode Context Notice */}
          {mode === 'demo' ? (
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-300 leading-relaxed">
              <strong>DEMO WITHDRAWAL NOTICE:</strong> This processes a simulated test payout to demonstrate system workflow. Demo withdrawals are strictly not real money.
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-[11px] text-emerald-300 leading-relaxed">
              <strong>REAL WITHDRAWAL NOTICE:</strong> Real withdrawals are processed from verified available funds to your authorized Ghana Mobile Money account or Bank clearing.
            </div>
          )}

          <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Withdrawal Amount (GH₵)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 font-mono font-bold text-amber-400 text-sm">
                  GH₵
                </span>
                <input
                  type="number"
                  min="100"
                  step="10"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#070e1b] border border-slate-700 rounded-xl pl-14 pr-4 py-2.5 font-mono text-lg font-bold text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                <span>Minimum: GH₵100.00</span>
                <span>
                  Available in {mode === 'demo' ? 'Demo' : 'Real'}:{' '}
                  <strong className="text-white">GH₵{activeBalance.toFixed(2)}</strong>
                </span>
              </div>
            </div>

            {/* Payout Channel */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Select Ghana Payout Channel
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mtn_momo')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition ${
                    paymentMethod === 'mtn_momo'
                      ? 'border-amber-400 bg-amber-500/10 text-white'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs font-bold">MTN Mobile Money</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('telecel_cash')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition ${
                    paymentMethod === 'telecel_cash'
                      ? 'border-rose-400 bg-rose-500/10 text-white'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-rose-500" />
                  <span className="text-xs font-bold">Telecel Cash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('at_money')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition ${
                    paymentMethod === 'at_money'
                      ? 'border-blue-400 bg-blue-500/10 text-white'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold">AT Money</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition ${
                    paymentMethod === 'bank_transfer'
                      ? 'border-emerald-400 bg-emerald-500/10 text-white'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400'
                  }`}
                >
                  <Building className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold">Ghana Bank Payout</span>
                </button>
              </div>
            </div>

            {/* Account Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Recipient Name
                </label>
                <input
                  type="text"
                  required
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g. Kofi Mensah"
                  className="w-full bg-[#070e1b] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mobile Number / Account
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+233 24 123 4567"
                  className="w-full bg-[#070e1b] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || activeBalance < 100}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg ${
                activeBalance < 100
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : mode === 'demo'
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>
                {loading
                  ? 'Verifying...'
                  : activeBalance < 100
                  ? 'Minimum GH₵100 Threshold Required'
                  : `Submit ${mode === 'demo' ? 'Demo' : 'Real'} Withdrawal (GH₵${amount})`}
              </span>
            </button>
          </form>
        </div>

        {/* Rules & Guidelines Column */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[#0b1528] border border-slate-700/80 shadow-xl space-y-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Withdrawal Verification Rules</span>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="font-bold text-amber-300 block">1. Minimum Threshold: GH₵100.00</span>
              <p className="text-slate-400 text-[11px]">
                Both demo and real accounts require at least GH₵100.00 in available balances before a request can be submitted.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="font-bold text-emerald-300 block">2. KYC & Ghana Card Verification</span>
              <p className="text-slate-400 text-[11px]">
                Real-money withdrawals exceeding GH₵500.00 require verified Ghana Card details (GHA-XXXXXXXXX-X) to comply with Ghanaian Anti-Money Laundering (AML) standards.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="font-bold text-blue-300 block">3. Server-Authoritative Settlement</span>
              <p className="text-slate-400 text-[11px]">
                All withdrawals undergo server-side balance locks. Payouts are routed through verified settlement rails to prevent fraudulent claims.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT WITHDRAWALS AUDIT TABLE */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Withdrawal History & Audit Records</h2>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#091222]/80">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#050b14] border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3">Amount (GH₵)</th>
                <th className="px-4 py-3">Recipient / Channel</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No withdrawal requests recorded yet.
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-4 py-3 font-mono text-slate-400">
                      {new Date(w.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          w.mode === 'demo'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {w.mode === 'demo' ? 'DEMO MODE' : 'REAL FUNDS'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-white">
                      GH₵{w.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">
                        {w.channelDetails?.accountName || w.userName}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {w.channelDetails?.phone || w.paymentMethod}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                      {w.paymentReference}
                    </td>
                    <td className="px-4 py-3">
                      {w.status === 'successful' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" /> Processed
                        </span>
                      )}
                      {w.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-400">
                          <Clock className="w-3 h-3 animate-spin" /> Pending Review
                        </span>
                      )}
                      {w.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/15 text-rose-400">
                          <AlertCircle className="w-3 h-3" /> Rejected
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
