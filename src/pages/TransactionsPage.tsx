import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  History,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  RefreshCw,
} from 'lucide-react';
import { Transaction } from '../types';

export const TransactionsPage: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [modeFilter, setModeFilter] = useState<'all' | 'real' | 'demo'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTransactions = async () => {
    setLoading(true);
    const token = localStorage.getItem('rm_token');
    if (!token) return;

    try {
      const res = await fetch('/api/wallet/transactions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const filtered = transactions.filter((tx) => {
    if (modeFilter !== 'all' && tx.mode !== modeFilter) return false;
    if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchRef = tx.paymentReference.toLowerCase().includes(term);
      const matchType = tx.type.toLowerCase().includes(term);
      const matchNotes = (tx.notes || '').toLowerCase().includes(term);
      if (!matchRef && !matchType && !matchNotes) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Audit Transactions</h1>
          <p className="text-xs text-slate-400">
            Complete cryptographic audit trail of all deposits, withdrawals, and simulated growth events
          </p>
        </div>

        <button
          onClick={fetchTransactions}
          className="self-start sm:self-auto p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs flex items-center gap-1.5 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="p-4 rounded-2xl bg-[#0b1528] border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by reference, type, or notes..."
            className="w-full bg-[#070e1b] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Mode Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-[#050b14] border border-slate-800 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setModeFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              modeFilter === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Logs
          </button>
          <button
            onClick={() => setModeFilter('real')}
            className={`px-3 py-1.5 rounded-lg transition ${
              modeFilter === 'real'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Real Funds
          </button>
          <button
            onClick={() => setModeFilter('demo')}
            className={`px-3 py-1.5 rounded-lg transition ${
              modeFilter === 'demo'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Demo Simulator
          </button>
        </div>

        {/* Status Dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#070e1b] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
        >
          <option value="all">All Statuses</option>
          <option value="successful">Successful</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed / Rejected</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#091222]/80">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-[#050b14] border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Ledger Mode</th>
              <th className="px-4 py-3">Amount (GH₵)</th>
              <th className="px-4 py-3">Rail / Method</th>
              <th className="px-4 py-3">Reference ID</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Audit Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
                  <span>Loading ledger events...</span>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                  No transaction events match your filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/30 transition">
                  <td className="px-4 py-3 font-mono text-slate-400 whitespace-nowrap">
                    {new Date(tx.createdAt).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3 font-semibold text-white capitalize">
                    {tx.type.replace('_', ' ')}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        tx.mode === 'demo'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {tx.mode === 'demo' ? 'DEMO' : 'REAL'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-white whitespace-nowrap">
                    {tx.type === 'deposit' || tx.type === 'demo_growth' ? '+' : '-'}
                    GH₵{tx.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 uppercase font-mono text-[11px] text-slate-400">
                    {tx.paymentMethod.replace('_', ' ')}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-400 select-all">
                    {tx.paymentReference}
                  </td>
                  <td className="px-4 py-3">
                    {tx.status === 'successful' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Successful
                      </span>
                    )}
                    {tx.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400">
                        <Clock className="w-3.5 h-3.5 animate-spin" /> Pending
                      </span>
                    )}
                    {(tx.status === 'failed' || tx.status === 'rejected') && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400">
                        <AlertCircle className="w-3.5 h-3.5" /> {tx.status}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[11px] text-slate-400 max-w-xs truncate" title={tx.notes}>
                    {tx.notes || '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
