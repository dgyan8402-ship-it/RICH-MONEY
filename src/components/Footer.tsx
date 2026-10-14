import React from 'react';
import { Shield, Lock, AlertTriangle, Phone, Mail, MapPin } from 'lucide-react';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab }) => {
  return (
    <footer className="bg-[#03070f] border-t border-slate-900 text-slate-400 text-sm mt-20">
      {/* High-level Risk & Regulatory Banner */}
      <div className="bg-amber-950/20 border-b border-amber-900/30 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start gap-4 text-xs leading-relaxed text-amber-200/90">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-amber-300">
              IMPORTANT FINANCIAL & REGULATORY DISCLOSURE (REPUBLIC OF GHANA)
            </p>
            <p className="text-amber-200/80">
              The 30% daily return calculation featured in Rich Money is an educational growth demonstration tool and mathematical simulator. It is <strong>NEVER</strong> a promise, guarantee, or realistic market yield. Legitimate investments in Ghana are regulated under the Securities Industry Act, 2016 (Act 929) by the Securities and Exchange Commission (SEC Ghana) and the Banks and Specialised Deposit-Taking Institutions Act, 2016 (Act 930) by the Bank of Ghana (BoG).
            </p>
            <p className="text-amber-300/70 text-[11px]">
              Rich Money strictly isolates simulated demo balances from real funds. Users cannot withdraw simulated demo growth as real currency.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-emerald-600 flex items-center justify-center font-mono font-bold text-slate-950 text-sm">
                GH₵
              </div>
              <span className="font-extrabold text-lg text-white">RICH MONEY</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ghana’s premier financial dashboard and daily growth simulation platform. Built for investor literacy, portfolio visibility, and disciplined capital management.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-emerald-400">
              <Lock className="w-4 h-4" />
              <span>256-Bit SSL Encrypted Ledger</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setCurrentTab('home')} className="hover:text-amber-400 transition">
                  Home Overview
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('dashboard')} className="hover:text-amber-400 transition">
                  Financial Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('investment')} className="hover:text-amber-400 transition">
                  30% Growth Simulator
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('withdrawals')} className="hover:text-amber-400 transition">
                  Withdrawal Rules & Portal
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('transactions')} className="hover:text-amber-400 transition">
                  Audit Transaction Ledger
                </button>
              </li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Supported Ghanaian Rails
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>MTN Mobile Money (MoMo)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Telecel Cash (Vodafone)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span>AT Money (AirtelTigo)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>GhIPSS / Ghana Interbank Settlement</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <span>Visa & Mastercard Card Rails</span>
              </div>
            </div>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Support & Compliance
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Airport City, Accra, Ghana</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+233 (0) 30 200 4880</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>support@richmoney.gh</span>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('support')}
                  className="text-amber-400 hover:underline flex items-center gap-1 mt-1"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Fraud Alert & Help Desk</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Rich Money Ghana Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span>·</span>
            <span className="hover:text-slate-400 cursor-pointer">Privacy & Data Protection</span>
            <span>·</span>
            <span className="hover:text-slate-400 cursor-pointer">Anti-Money Laundering (AML)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
