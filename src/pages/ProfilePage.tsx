import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Shield,
  CreditCard,
  Phone,
  Mail,
  Lock,
  CheckCircle2,
  Clock,
  AlertCircle,
  Save,
  KeyRound,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, refreshUser } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [ghanaCardNumber, setGhanaCardNumber] = useState(user?.ghanaCardNumber || '');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    const res = await updateProfile({
      fullName,
      phone,
      ghanaCardNumber,
    });
    setLoading(false);

    if (res.success) {
      setMsg({ type: 'success', text: 'Profile & Ghana Card information updated successfully!' });
      refreshUser();
    } else {
      setMsg({ type: 'error', text: res.error || 'Failed to update profile.' });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);

    if (newPassword.length < 6) {
      setPwdMsg({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email,
          securityAnswer,
          newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwdMsg({ type: 'success', text: 'Password updated successfully!' });
        setNewPassword('');
        setSecurityAnswer('');
      } else {
        setPwdMsg({ type: 'error', text: data.error || 'Failed to update password.' });
      }
    } catch (err: any) {
      setPwdMsg({ type: 'error', text: err.message || 'Error updating password.' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-white tracking-tight">Account & KYC Profile</h1>
        <p className="text-xs text-slate-400">
          Manage identity credentials, biometric verification, and platform security
        </p>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            msg.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
          }`}
        >
          {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* KYC STATUS BADGE CARD */}
      <div className="p-6 rounded-3xl bg-[#0b1528] border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 font-black text-lg">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-base font-bold text-white">{user?.fullName}</h2>
            <p className="text-xs text-slate-400 font-mono">{user?.email}</p>
          </div>
        </div>

        <div>
          {user?.kycStatus === 'verified' ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Ghana Card KYC Verified</span>
            </div>
          ) : user?.kycStatus === 'pending' ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Clock className="w-4 h-4 text-amber-400 animate-spin" />
              <span>KYC Document Pending Review</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 text-xs">
              <AlertCircle className="w-4 h-4" />
              <span>Unverified Account</span>
            </div>
          )}
        </div>
      </div>

      {/* IDENTITY & GHANA CARD FORM */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0b1528] border border-slate-700/80 shadow-xl space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <CreditCard className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Personal Information & Ghana Card (NIA)
          </h3>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Legal Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#070e1b] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Ghana Phone (Mobile Money)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+233 24 123 4567"
                  className="w-full bg-[#070e1b] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Ghana Card PIN (National Identification Authority)
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={ghanaCardNumber}
                  onChange={(e) => setGhanaCardNumber(e.target.value)}
                  placeholder="GHA-823456789-3"
                  className="w-full bg-[#070e1b] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono uppercase"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Standard format: GHA-XXXXXXXXX-X (Auto-verifies KYC upon entry)
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:brightness-110 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </form>
      </div>

      {/* SECURITY / CHANGE PASSWORD */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0b1528] border border-slate-700/80 shadow-xl space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Lock className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Account Security & Password
          </h3>
        </div>

        {pwdMsg && (
          <div
            className={`p-3 rounded-xl border text-xs font-semibold ${
              pwdMsg.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
            }`}
          >
            {pwdMsg.text}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Security Question Verification
              </label>
              <div className="text-[11px] text-slate-400 mb-1">
                {user?.securityQuestion || 'In which city were you born?'}
              </div>
              <input
                type="text"
                required
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                placeholder="e.g. Accra"
                className="w-full bg-[#070e1b] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                New Secure Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full bg-[#070e1b] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>Update Password</span>
          </button>
        </form>
      </div>
    </div>
  );
};
