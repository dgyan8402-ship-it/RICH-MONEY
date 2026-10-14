import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Smartphone,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Transaction } from '../types';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDepositSuccess: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  onDepositSuccess,
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState<'input' | 'sandbox_prompt' | 'settled'>('input');
  const [amount, setAmount] = useState<string>('250');
  const [paymentMethod, setPaymentMethod] = useState<'mtn_momo' | 'telecel_cash' | 'at_money' | 'card'>('mtn_momo');
  const [phone, setPhone] = useState(user?.phone || '+233 24 000 0000');
  const [activeTx, setActiveTx] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sandboxOutcome, setSandboxOutcome] = useState<'approved' | 'declined' | null>(null);

  if (!isOpen) return null;

  const quickAmounts = ['50', '100', '250', '500', '1000', '2500'];

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const token = localStorage.getItem('rm_token');
    try {
      const res = await fetch('/api/wallet/deposit/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          paymentMethod,
          phone,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || 'Failed to initiate deposit');
      } else {
        setActiveTx(data.transaction);
        setStep('sandbox_prompt');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Network error');
    }
  };

  const handleSandboxAction = async (action: 'approve' | 'decline') => {
    if (!activeTx) return;
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('rm_token');
    try {
      const res = await fetch('/api/wallet/deposit/verify-sandbox', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          transactionId: activeTx.id,
          action,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || 'Failed to settle sandbox payment');
      } else {
        setActiveTx(data.transaction);
        setSandboxOutcome(action === 'approve' ? 'approved' : 'declined');
        setStep('settled');
        if (action === 'approve') {
          onDepositSuccess();
        }
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Error executing settlement');
    }
  };

  const resetModal = () => {
    setStep('input');
    setActiveTx(null);
    setSandboxOutcome(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0b1528] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#070e1b]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Ghana Payment Sandbox</h3>
              <p className="text-[11px] text-slate-400">Secure Mobile Money & Card Gateway</p>
            </div>
          </div>
          <button
            onClick={resetModal}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: INPUT DETAILS */}
          {step === 'input' && (
            <form onSubmit={handleInitiate} className="space-y-4">
              {/* Payment Rail Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Select Ghanaian Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mtn_momo')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition ${
                      paymentMethod === 'mtn_momo'
                        ? 'border-amber-400 bg-amber-500/10 text-white'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center text-slate-950 font-black text-xs">
                      MTN
                    </div>
                    <div>
                      <div className="text-xs font-bold">MTN MoMo</div>
                      <div className="text-[10px] text-slate-400">*170# Prompt</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('telecel_cash')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition ${
                      paymentMethod === 'telecel_cash'
                        ? 'border-rose-400 bg-rose-500/10 text-white'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white font-bold text-xs">
                      TC
                    </div>
                    <div>
                      <div className="text-xs font-bold">Telecel Cash</div>
                      <div className="text-[10px] text-slate-400">*110# Prompt</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('at_money')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition ${
                      paymentMethod === 'at_money'
                        ? 'border-blue-400 bg-blue-500/10 text-white'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                      AT
                    </div>
                    <div>
                      <div className="text-xs font-bold">AT Money</div>
                      <div className="text-[10px] text-slate-400">AirtelTigo</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition ${
                      paymentMethod === 'card'
                        ? 'border-emerald-400 bg-emerald-500/10 text-white'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">GhIPSS Card</div>
                      <div className="text-[10px] text-slate-400">Visa / Mastercard</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Deposit Amount (GH₵)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 font-mono font-bold text-amber-400 text-sm">
                    GH₵
                  </span>
                  <input
                    type="number"
                    min="10"
                    step="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[#070e1b] border border-slate-700 rounded-xl pl-14 pr-4 py-2.5 font-mono text-lg font-bold text-white focus:outline-none focus:border-amber-400"
                    placeholder="100.00"
                  />
                </div>
                {/* Quick amount chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {quickAmounts.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setAmount(q)}
                      className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition ${
                        amount === q
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      +GH₵{q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone / MoMo wallet number */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mobile Money Wallet / Card Account Number
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+233 24 123 4567"
                  className="w-full bg-[#070e1b] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              {/* Security Banner Requirement 6 */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Authorized Sandbox Integration</span>
                </div>
                <p>
                  To prevent fraudulent claims, deposits are never verified based solely on submitted screenshots or arbitrary references. Transactions are processed through authenticated server settlement.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 hover:brightness-110 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-950 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Initiating Gateway...' : `Proceed to Deposit GH₵${amount}`}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: SANDBOX PHONE USSD SIMULATOR */}
          {step === 'sandbox_prompt' && activeTx && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-amber-300">SANDBOX TEST GATEWAY</span>
                  <span className="font-mono text-slate-400 text-[10px]">{activeTx.paymentReference}</span>
                </div>
                <p className="text-slate-300">
                  Simulating payment prompt for <strong className="text-white">GH₵{activeTx.amount.toFixed(2)}</strong> sent to wallet <strong className="text-white">{activeTx.channelDetails?.phone}</strong>.
                </p>
              </div>

              {/* Simulated Phone Prompt UI */}
              <div className="bg-[#050b14] border-2 border-emerald-500/40 rounded-2xl p-5 shadow-inner space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                  <span className="font-mono">USSD PROMPT SIMULATOR</span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    Waiting Authorization
                  </span>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 leading-relaxed">
                  <p className="text-amber-400 font-bold mb-1">GHANA PAYMENTS SANDBOX</p>
                  <p>Authorize payment of GH₵{activeTx.amount.toFixed(2)} to RICH MONEY GH?</p>
                  <p className="text-slate-400 text-[11px] mt-1">Ref: {activeTx.paymentReference}</p>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleSandboxAction('approve')}
                    className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Authorize & Approve Payment (Sandbox Test)</span>
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleSandboxAction('decline')}
                    className="w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 font-semibold text-xs transition cursor-pointer"
                  >
                    Simulate Decline / Insufficient Funds
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SETTLED OUTCOME */}
          {step === 'settled' && activeTx && (
            <div className="text-center py-6 space-y-4">
              {sandboxOutcome === 'approved' ? (
                <>
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Deposit Successful!</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      GH₵{activeTx.amount.toFixed(2)} has been credited to your verified Real Balance.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
                    Reference ID: {activeTx.paymentReference}
                  </div>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-full bg-rose-500/20 border-2 border-rose-400 text-rose-400 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Deposit Cancelled / Declined</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      No funds were deducted. You may try again with another payment method.
                    </p>
                  </div>
                </>
              )}

              <button
                type="button"
                onClick={resetModal}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
              >
                Close & Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
