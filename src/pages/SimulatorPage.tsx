import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { GrowthChart } from '../components/GrowthChart';
import { CalculationResult, DailyProjection } from '../types';
import {
  TrendingUp,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Info,
  Calendar,
  DollarSign,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const SimulatorPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [startingAmount, setStartingAmount] = useState<string>('500');
  const [days, setDays] = useState<number>(7);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [allocating, setAllocating] = useState(false);
  const [stepMessage, setStepMessage] = useState<string | null>(null);

  const calculateProjection = async () => {
    const parsed = parseFloat(startingAmount);
    if (isNaN(parsed) || parsed <= 0) return;

    setLoading(true);
    try {
      const res = await fetch('/api/simulator/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startingAmount: parsed,
          days,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      }
    } catch (err) {
      console.error('Calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateProjection();
  }, [startingAmount, days]);

  const handleApplyToDemo = async () => {
    if (!user) {
      alert('Please log in or switch to a demo account to allocate demo capital.');
      return;
    }

    const parsed = parseFloat(startingAmount);
    if (isNaN(parsed) || parsed <= 0) return;

    setAllocating(true);
    setStepMessage(null);
    const token = localStorage.getItem('rm_token');
    try {
      const res = await fetch('/api/simulator/start-demo-investment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: parsed }),
      });
      const data = await res.json();
      if (res.ok) {
        setStepMessage(data.message);
        await refreshUser();
      } else {
        setStepMessage(data.error || 'Failed to allocate demo capital');
      }
    } catch (err: any) {
      setStepMessage(err.message || 'Error allocating demo capital');
    } finally {
      setAllocating(false);
    }
  };

  const handleSimulateStep = async () => {
    if (!user) return;
    setAllocating(true);
    setStepMessage(null);
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
        setStepMessage(data.message);
        await refreshUser();
      } else {
        setStepMessage(data.error || 'Failed to step');
      }
    } catch (err: any) {
      setStepMessage(err.message || 'Error stepping');
    } finally {
      setAllocating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Regulatory Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Hypothetical Growth Model · 30% Daily Compounding</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Daily Growth Simulator
        </h1>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          Test mathematical projections based on the recursive formula:{' '}
          <code className="text-amber-400 font-mono font-bold bg-slate-900 px-2 py-0.5 rounded">
            New simulated balance = Previous simulated balance × 1.30
          </code>
          . Use this sandbox to evaluate compound trajectories in demo mode.
        </p>
      </div>

      {/* MANDATORY DISCLAIMER CARD */}
      <div className="p-5 rounded-2xl bg-amber-950/20 border-2 border-amber-500/40 text-amber-200/90 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>CRITICAL FINANCIAL RISK & EDUCATIONAL DISCLAIMER</span>
        </div>
        <p className="leading-relaxed">
          The 30% daily rate is <strong>strictly hypothetical</strong> for mathematical visualization and educational training. It is <strong>NOT</strong> a guaranteed investment return, an offer of securities, or a commercial yield. In real-world financial markets in Ghana and worldwide, high returns carry immense capital risk. Rich Money keeps simulated growth segregated from actual real-money deposits. Do not use simulated demo growth to determine real withdrawals.
        </p>
      </div>

      {stepMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
          <span>{stepMessage}</span>
          <button onClick={() => setStepMessage(null)} className="font-bold text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* SIMULATOR CONTROLS & CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[#0b1528] border border-slate-700/80 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Simulation Parameters
            </span>
            <span className="text-xs font-mono text-amber-400 font-semibold">Fixed Rate: +30% / Day</span>
          </div>

          {/* Starting Amount */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Starting Amount (Ghanaian Cedis GH₵)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 font-mono font-bold text-amber-400 text-sm">
                GH₵
              </span>
              <input
                type="number"
                min="10"
                step="50"
                value={startingAmount}
                onChange={(e) => setStartingAmount(e.target.value)}
                className="w-full bg-[#070e1b] border border-slate-700 rounded-xl pl-14 pr-4 py-2 font-mono text-lg font-bold text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            {/* Quick starting buttons */}
            <div className="flex flex-wrap gap-1.5">
              {['100', '250', '500', '1000', '2500', '5000'].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setStartingAmount(val)}
                  className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition ${
                    startingAmount === val
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  GH₵{val}
                </button>
              ))}
            </div>
          </div>

          {/* Duration Horizon */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Duration (Days)
              </label>
              <span className="font-mono text-xs text-amber-400 font-bold">{days} Days</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value, 10))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="grid grid-cols-4 gap-2 pt-1">
              {[7, 14, 21, 30].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDays(d)}
                  className={`py-1.5 text-xs font-mono font-semibold rounded-lg border transition ${
                    days === d
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {d} Days
                </button>
              ))}
            </div>
          </div>

          {/* Quick Projected Card */}
          {result && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-[#070e1b] border border-slate-800 space-y-3">
              <div className="text-xs text-slate-400">Hypothetical Balance after {days} days:</div>
              <div className="font-mono text-3xl font-black text-emerald-400">
                GH₵{result.finalProjected.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                <span className="text-slate-500">Hypothetical Gain:</span>
                <span className="font-mono text-amber-400 font-bold">
                  +GH₵{result.totalHypotheticalProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          {/* Interactive Demo Actions */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Active Demo Portfolio Operations:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={allocating}
                onClick={handleApplyToDemo}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 text-amber-400" />
                <span>Allocate Demo</span>
              </button>
              <button
                type="button"
                disabled={allocating}
                onClick={handleSimulateStep}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Step Day (+30%)</span>
              </button>
            </div>
            {user && (
              <div className="text-[11px] text-slate-400 flex items-center justify-between px-1 pt-1">
                <span>Current Demo Balance:</span>
                <span className="font-mono text-amber-300 font-semibold">
                  GH₵{user.demoBalance.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Chart Column (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-[#0b1528] border border-slate-700/80 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Hypothetical Growth Trajectory (Day-by-Day)
            </span>
            <span className="text-xs font-mono text-emerald-400">Compounded Daily</span>
          </div>

          <GrowthChart
            projections={result?.projections || []}
            startingAmount={parseFloat(startingAmount) || 500}
          />
        </div>
      </div>

      {/* DETAILED DAY-BY-DAY BALANCE HISTORY TABLE */}
      {result && result.projections.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Daily Compound Projection Schedule</h2>
              <p className="text-xs text-slate-400">
                Formula breakdown showing 30% daily increment for each interval
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Showing {result.projections.length} simulated days
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#091222]/80">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#050b14] border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="px-4 py-3">Day #</th>
                  <th className="px-4 py-3">Date (Simulated)</th>
                  <th className="px-4 py-3">Previous Balance (GH₵)</th>
                  <th className="px-4 py-3">Hypothetical Gain (+30%)</th>
                  <th className="px-4 py-3">New Simulated Balance (GH₵)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {result.projections.map((row) => (
                  <tr key={row.day} className="hover:bg-slate-800/30 transition">
                    <td className="px-4 py-2.5 font-bold text-amber-400">Day {row.day}</td>
                    <td className="px-4 py-2.5 text-slate-400 font-sans">{row.dateStr}</td>
                    <td className="px-4 py-2.5 text-slate-300">
                      GH₵{row.startingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2.5 text-emerald-400 font-semibold">
                      +GH₵{row.dailyGain.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2.5 text-white font-bold">
                      GH₵{row.endingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
