import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, UserCheck, Shield, Sparkles } from 'lucide-react';

export const DemoModeBanner: React.FC = () => {
  const { user, switchDemoAccount } = useAuth();

  return (
    <div className="bg-gradient-to-r from-amber-950/40 via-amber-900/30 to-slate-950 border-b border-amber-500/30 text-xs px-4 py-2">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-amber-200">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
          <span>
            <strong className="text-amber-300 font-semibold tracking-wide">REGULATORY NOTICE & DEMO MODE:</strong>{' '}
            Simulated 30% daily growth rates are purely educational and non-guaranteed. Real withdrawable balances are strictly segregated from demo capital in compliance with Ghanaian financial safety standards.
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-slate-400 hidden lg:inline">Quick Test Mode:</span>
          {user?.role === 'admin' ? (
            <button
              onClick={() => switchDemoAccount('user')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition font-medium"
              title="Switch to standard Ghana user view"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Switch to User (Kofi)</span>
            </button>
          ) : (
            <button
              onClick={() => switchDemoAccount('admin')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-600/50 transition font-medium"
              title="Switch to Administrator dashboard"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Switch to Admin (Kwame)</span>
            </button>
          )}

          <div className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>GH₵ Live Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};
