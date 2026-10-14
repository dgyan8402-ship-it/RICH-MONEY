import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
  Unlock,
  Edit3,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';
import { AdminOverview, User, Transaction } from '../types';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [withdrawalsList, setWithdrawalsList] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'withdrawals' | 'users' | 'alerts' | 'audit'>('withdrawals');

  // Review Modal state
  const [selectedWd, setSelectedWd] = useState<Transaction | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'approve' | 'reject'>('approve');
  const [adminNote, setAdminNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // User adjust modal state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [adjustReal, setAdjustReal] = useState<string>('0');
  const [adjustDemo, setAdjustDemo] = useState<string>('0');
  const [adjustReason, setAdjustReason] = useState<string>('');

  const fetchAdminData = async () => {
    setLoading(true);
    const token = localStorage.getItem('rm_token');
    if (!token) return;

    try {
      const [ovRes, usRes, wdRes] = await Promise.all([
        fetch('/api/admin/overview', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/withdrawals', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (ovRes.ok && usRes.ok && wdRes.ok) {
        const ovData = await ovRes.json();
        const usData = await usRes.json();
        const wdData = await wdRes.json();
        setOverview(ovData);
        setUsersList(usData.users || []);
        setWithdrawalsList(wdData.withdrawals || []);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [user]);

  const handleReviewWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWd) return;

    setActionLoading(true);
    setActionMsg(null);
    const token = localStorage.getItem('rm_token');
    try {
      const res = await fetch(`/api/admin/withdrawals/${selectedWd.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          decision: reviewDecision,
          adminNotes: adminNote,
        }),
      });

      const data = await res.json();
      setActionLoading(false);

      if (res.ok) {
        setActionMsg(`Withdrawal ${reviewDecision}d successfully!`);
        setTimeout(() => {
          setSelectedWd(null);
          setActionMsg(null);
          setAdminNote('');
        }, 1200);
        fetchAdminData();
      } else {
        setActionMsg(data.error || 'Failed to process review');
      }
    } catch (err: any) {
      setActionLoading(false);
      setActionMsg(err.message || 'Error executing review');
    }
  };

  const handleToggleFreeze = async (userId: string, currentFreeze: boolean) => {
    const token = localStorage.getItem('rm_token');
    try {
      const res = await fetch(`/api/admin/users/${userId}/freeze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isFrozen: !currentFreeze }),
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangeKYC = async (userId: string, newKyc: 'verified' | 'pending' | 'unverified') => {
    const token = localStorage.getItem('rm_token');
    try {
      const res = await fetch(`/api/admin/users/${userId}/kyc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ kycStatus: newKyc }),
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveBalanceAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const token = localStorage.getItem('rm_token');
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/adjust-balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          realBalance: parseFloat(adjustReal),
          demoBalance: parseFloat(adjustDemo),
          reason: adjustReason,
        }),
      });
      if (res.ok) {
        setSelectedUser(null);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Administrator Access Restricted</h2>
        <p className="text-xs text-slate-400">
          This area is restricted to authorized financial operations personnel. Use the quick demo switch in the top banner to inspect as Kwame Osei (Admin).
        </p>
      </div>
    );
  }

  const metrics = overview?.metrics;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h1 className="text-3xl font-black text-white tracking-tight">Administrator Control Center</h1>
          </div>
          <p className="text-xs text-slate-400">
            Bank of Ghana compliance, user account management, fraud alerts & withdrawal settlement
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="self-start sm:self-auto p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs flex items-center gap-1.5 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Console</span>
        </button>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0b1528] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Registered</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono text-2xl font-bold text-white">{metrics?.totalUsers || 0}</div>
          <div className="text-[11px] text-emerald-400">
            {metrics?.verifiedUsersCount || 0} Ghana Card Verified
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0b1528] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Real Deposits Volume</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-mono text-2xl font-bold text-white">
            GH₵{(metrics?.totalRealDepositsAmount || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400">Verified Ghana Rails</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0b1528] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Pending Payouts</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-mono text-2xl font-bold text-amber-400">
            {metrics?.pendingWithdrawalsCount || 0}
          </div>
          <div className="text-[11px] text-slate-400">
            GH₵{(metrics?.pendingWithdrawalAmount || 0).toFixed(2)} awaiting review
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0b1528] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Fraud Alerts</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="font-mono text-2xl font-bold text-rose-400">
            {overview?.alerts?.length || 0}
          </div>
          <div className="text-[11px] text-rose-300">Automated Risk Engine</div>
        </div>
      </div>

      {/* ADMIN SUB-NAVIGATION TABS */}
      <div className="flex items-center gap-2 p-1.5 bg-[#070e1b] border border-slate-800 rounded-2xl text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`px-4 py-2 rounded-xl transition whitespace-nowrap ${
            activeTab === 'withdrawals'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Withdrawal Requests ({withdrawalsList.filter((w) => w.status === 'pending').length} Pending)
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl transition whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          User Account Management ({usersList.length})
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2 rounded-xl transition whitespace-nowrap ${
            activeTab === 'alerts'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Fraud & Risk Alerts ({overview?.alerts?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl transition whitespace-nowrap ${
            activeTab === 'audit'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          System Audit Trail
        </button>
      </div>

      {/* TAB 1: WITHDRAWALS REVIEW */}
      {activeTab === 'withdrawals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Withdrawal Approval Queue</h2>
            <span className="text-xs text-slate-400">Server-side balance settlement & reversal</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#091222]/80">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#050b14] border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Applicant</th>
                  <th className="px-4 py-3">Amount (GH₵)</th>
                  <th className="px-4 py-3">Destination</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {withdrawalsList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      No real withdrawal requests found.
                    </td>
                  </tr>
                ) : (
                  withdrawalsList.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3 font-mono text-slate-400">
                        {new Date(w.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{w.userName}</div>
                        <div className="text-[10px] text-slate-400">{w.userEmail}</div>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-white">
                        GH₵{w.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-mono text-[11px] text-slate-300">
                          {w.channelDetails?.phone || w.paymentMethod}
                        </div>
                        <div className="text-[10px] text-slate-500">{w.paymentReference}</div>
                      </td>
                      <td className="px-4 py-3">
                        {w.status === 'pending' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            Pending Review
                          </span>
                        )}
                        {w.status === 'successful' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400">
                            Approved & Paid
                          </span>
                        )}
                        {w.status === 'rejected' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/15 text-rose-400">
                            Rejected (Refunded)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {w.status === 'pending' ? (
                          <button
                            onClick={() => {
                              setSelectedWd(w);
                              setReviewDecision('approve');
                              setAdminNote('');
                            }}
                            className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer"
                          >
                            Review Request
                          </button>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Finalized</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Registered User Accounts & Ledgers</h2>
            <span className="text-xs text-slate-400">Total accounts: {usersList.length}</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#091222]/80">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#050b14] border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">KYC Status</th>
                  <th className="px-4 py-3">Real Balance (GH₵)</th>
                  <th className="px-4 py-3">Demo Balance (GH₵)</th>
                  <th className="px-4 py-3">Account State</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{u.fullName}</div>
                      <div className="text-[10px] text-slate-400">{u.email}</div>
                      <div className="text-[10px] font-mono text-slate-500">{u.phone}</div>
                    </td>
                    <td className="px-4 py-3 uppercase font-mono text-[10px]">
                      {u.role === 'admin' ? (
                        <span className="text-amber-400 font-bold">Admin</span>
                      ) : (
                        <span className="text-slate-400">Member</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.kycStatus}
                        onChange={(e) => handleChangeKYC(u.id, e.target.value as any)}
                        className="bg-[#070e1b] border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none"
                      >
                        <option value="unverified">Unverified</option>
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-400">
                      GH₵{u.realBalance.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-amber-300">
                      GH₵{u.demoBalance.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      {u.isFrozen ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400">
                          <Lock className="w-3.5 h-3.5" /> Frozen
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setAdjustReal(u.realBalance.toString());
                            setAdjustDemo(u.demoBalance.toString());
                            setAdjustReason('');
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="Adjust Balance"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleFreeze(u.id, u.isFrozen)}
                          className={`p-1.5 rounded-lg border transition ${
                            u.isFrozen
                              ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                          }`}
                          title={u.isFrozen ? 'Unfreeze Account' : 'Freeze Account'}
                        >
                          {u.isFrozen ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: FRAUD ALERTS */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white">Automated Risk & Fraud Detection Stream</h2>
          <div className="space-y-3">
            {overview?.alerts && overview.alerts.length > 0 ? (
              overview.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-2xl border flex items-start gap-3 ${
                    alert.level === 'high'
                      ? 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                      : 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="uppercase tracking-wider">{alert.level} RISK DETECTED</span>
                      <span className="font-mono text-slate-400 font-normal">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs">{alert.message}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 rounded-2xl bg-[#091222] border border-slate-800 text-center text-slate-500 text-xs">
                No active fraud alerts detected by the risk engine.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white">System Security Audit Trail</h2>
          <div className="rounded-2xl border border-slate-800 bg-[#091222]/80 overflow-hidden divide-y divide-slate-800/60 font-mono text-xs">
            {overview?.recentAuditLogs?.map((log) => (
              <div key={log.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-400">{log.action}</span>
                    <span className="text-[11px] text-slate-500">· {log.userEmail || 'System'}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] font-sans">{log.details}</p>
                </div>
                <div className="text-right shrink-0 text-slate-500 text-[10px]">
                  <div>{log.ip}</div>
                  <div>{new Date(log.createdAt).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REVIEW WITHDRAWAL MODAL */}
      {selectedWd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#0b1528] border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Review Withdrawal Payout</h3>
              <button
                onClick={() => setSelectedWd(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
              <div>Applicant: <strong className="text-white">{selectedWd.userName}</strong></div>
              <div>Amount: <strong className="font-mono text-emerald-400">GH₵{selectedWd.amount.toFixed(2)}</strong></div>
              <div>Recipient Phone: <strong className="font-mono text-slate-300">{selectedWd.channelDetails?.phone}</strong></div>
              <div>Reference: <span className="font-mono text-slate-400">{selectedWd.paymentReference}</span></div>
            </div>

            {actionMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs">
                {actionMsg}
              </div>
            )}

            <form onSubmit={handleReviewWithdrawal} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Administrative Decision</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewDecision('approve')}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      reviewDecision === 'approve'
                        ? 'bg-emerald-600 text-white border-emerald-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Approve & Disburse
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewDecision('reject')}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      reviewDecision === 'reject'
                        ? 'bg-rose-600 text-white border-rose-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Reject & Refund
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Audit Notes</label>
                <input
                  type="text"
                  required
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="e.g. Cleared via MTN MoMo settlement gateway batch 801"
                  className="w-full bg-[#070e1b] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:brightness-110 text-slate-950 font-bold text-xs transition cursor-pointer"
              >
                {actionLoading ? 'Processing...' : 'Confirm Decision'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADJUST BALANCE MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#0b1528] border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Adjust User Balance</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Modifying balances for <strong className="text-white">{selectedUser.fullName}</strong> ({selectedUser.email}). Action is strictly recorded in audit log.
            </p>

            <form onSubmit={handleSaveBalanceAdjustment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Real Balance (GH₵)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={adjustReal}
                  onChange={(e) => setAdjustReal(e.target.value)}
                  className="w-full bg-[#070e1b] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Demo Balance (GH₵)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={adjustDemo}
                  onChange={(e) => setAdjustDemo(e.target.value)}
                  className="w-full bg-[#070e1b] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Justification / Audit Reason
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Bank reconciliation correction"
                  className="w-full bg-[#070e1b] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer"
              >
                Save Balance Adjustment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
