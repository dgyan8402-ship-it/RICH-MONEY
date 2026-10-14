import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp,
  Shield,
  Smartphone,
  Lock,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  Zap,
  BarChart3,
  Award,
  Globe,
} from 'lucide-react';

interface HomePageProps {
  setCurrentTab: (tab: string) => void;
  onOpenDeposit: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ setCurrentTab, onOpenDeposit }) => {
  const { user, openAuthModal } = useAuth();
  const [calcInput, setCalcInput] = useState<number>(500);
  const [calcDays, setCalcDays] = useState<number>(7);

  // Quick formula: Balance * (1.30 ^ days)
  const calcResult = calcInput * Math.pow(1.3, calcDays);

  return (
    <div className="space-y-20 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 lg:pt-20">
        {/* Glow ambient backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 left-1/4 -translate-x-1/2 w-[400px] h-[300px] bg-amber-500/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>GH₵ Ghana Cedis Ready · Mobile Money & Bank Rails</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]">
              Empower Your Wealth with{' '}
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-emerald-400 bg-clip-text text-transparent">
                Rich Money
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              The modern financial dashboard engineered for Ghana. Explore our interactive 30% daily compound growth simulator, manage real capital, and test instant mobile payouts in a strictly regulated environment.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {user ? (
                <>
                  <button
                    onClick={() => setCurrentTab('dashboard')}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 hover:brightness-110 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Open My Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentTab('investment')}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>Run 30% Growth Simulator</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => openAuthModal('register')}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 hover:brightness-110 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Get Started Free (GH₵1,000 Demo)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentTab('investment')}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <BarChart3 className="w-4 h-4 text-amber-400" />
                    <span>Try Growth Calculator</span>
                  </button>
                </>
              )}
            </div>

            {/* Quick trust metrics */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left border-t border-slate-800/80">
              <div className="p-3">
                <div className="font-mono text-xl font-bold text-white">GH₵100.00</div>
                <div className="text-xs text-slate-400">Min. Withdrawal Threshold</div>
              </div>
              <div className="p-3">
                <div className="font-mono text-xl font-bold text-emerald-400">30% Daily</div>
                <div className="text-xs text-slate-400">Demo Simulation Rate</div>
              </div>
              <div className="p-3">
                <div className="font-mono text-xl font-bold text-amber-400">Instant MoMo</div>
                <div className="text-xs text-slate-400">MTN & Telecel Cash Rails</div>
              </div>
              <div className="p-3">
                <div className="font-mono text-xl font-bold text-white">100% Segregated</div>
                <div className="text-xs text-slate-400">Real vs Demo Ledger</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE SIMULATOR PREVIEW CARD */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-b from-[#0e1a32] to-[#070e1b] border border-slate-700 p-6 sm:p-10 shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left explanation */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-amber-400 uppercase tracking-widest">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Simulated Compound Engine</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Understand the Power of 30% Daily Growth
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Test our interactive investment simulator using the recursive formula:
              </p>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-amber-300">
                New simulated balance = Previous simulated balance × 1.30
              </div>
              <p className="text-xs text-slate-400">
                Adjust starting funds and observation horizon to see exponential mathematical trajectories. Experience the demo without risking real capital.
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={() => setCurrentTab('investment')}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer transition"
                >
                  <span>Open Full Simulator Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right quick calculator widget */}
            <div className="lg:col-span-5 bg-[#050b14] border border-slate-700/80 rounded-2xl p-6 shadow-inner space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-semibold text-slate-200">Interactive Preview</span>
                <span className="text-[11px] font-mono text-emerald-400 font-bold">DEMO CALCULATOR</span>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1.5">
                  Starting Balance (GH₵): <span className="font-mono text-white font-bold">GH₵{calcInput}</span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="5000"
                  step="50"
                  value={calcInput}
                  onChange={(e) => setCalcInput(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1.5">
                  Simulation Horizon: <span className="font-mono text-amber-400 font-bold">{calcDays} Days</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[3, 7, 14, 21].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setCalcDays(d)}
                      className={`py-1.5 rounded-lg text-xs font-mono font-semibold transition ${
                        calcDays === d
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-xs text-slate-400">Hypothetical Result after {calcDays} days:</div>
                <div className="font-mono text-2xl font-black text-emerald-400">
                  GH₵{calcResult.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-amber-300/80">
                  Hypothetical Gain: +GH₵{(calcResult - calcInput).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE PILLARS & FEATURES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
            Institutional Standards
          </h3>
          <h2 className="text-3xl font-black text-white">Engineered for Transparency & Security</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#0b1528] border border-slate-800 hover:border-slate-700 transition space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Dual-Ledger Segregation</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real deposited funds are strictly separated from simulated demo balances. We never fabricate profits or confuse educational simulations with legal tender.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0b1528] border border-slate-800 hover:border-slate-700 transition space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Ghanaian Mobile Rails</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Designed specifically for Ghana with native support for MTN Mobile Money (*170#), Telecel Cash (*110#), AT Money, and GhIPSS bank clearing.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0b1528] border border-slate-800 hover:border-slate-700 transition space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">GH₵100 Withdrawal Rules</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transparent threshold evaluation. View instant feedback when demo or real balances meet the GH₵100 minimum threshold before submitting payout requests.
            </p>
          </div>
        </div>
      </section>

      {/* REGULATORY CITIZENSHIP & FINANCIAL EDUCATION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-slate-900/80 border border-amber-500/30 flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="space-y-2 flex-1">
            <h3 className="text-lg font-bold text-amber-300">
              Investor Protection & Bank of Ghana Compliance
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              In Ghana, financial products promising unusually high guaranteed returns (such as 30% daily) are high-risk or unsustainable pyramid schemes. Rich Money provides this simulator strictly as an educational case study to demonstrate geometric progression math. Any legitimate investment must be licensed under Act 929 and Act 930.
            </p>
          </div>
          <button
            onClick={() => setCurrentTab('support')}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 cursor-pointer transition"
          >
            Read Safety Guide
          </button>
        </div>
      </section>
    </div>
  );
};
