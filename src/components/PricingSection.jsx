import React from 'react';
import { Check, Sparkles, Zap, Shield, Crown } from 'lucide-react';

export default function PricingSection({ onSelectTool }) {
  return (
    <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Simple, Honest Pricing</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-['Outfit'] mb-3">
          Get More with Transforma Pro
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Work with unlimited files, unlock OCR scanning, and batch process large documents without restrictions.
        </p>
      </div>

      {/* 3 Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
        
        {/* Tier 1: Free */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-lg transition-shadow">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Free Forever</div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 mb-6 font-['Outfit']">
              $0 <span className="text-xs font-normal text-slate-500">/ month</span>
            </div>
            <p className="text-xs text-slate-500 mb-6">Perfect for occasional document conversions and quick edits.</p>

            <ul className="space-y-3 text-xs text-slate-700 mb-8">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Access to all 35+ standard tools</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Up to 15MB file size</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Standard client-side processing</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>No sign-up or credit card required</span>
              </li>
            </ul>
          </div>

          <button 
            onClick={() => onSelectTool('merge')}
            className="w-full py-3 rounded-2xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-colors"
          >
            Start Free
          </button>
        </div>

        {/* Tier 2: Pro (Highlighted with Transforma Colors) */}
        <div className="bg-gradient-to-b from-[#2a085c] to-[#4c1d95] text-white rounded-3xl p-6 sm:p-8 border-2 border-amber-400 shadow-2xl shadow-purple-950/30 flex flex-col justify-between relative transform md:-translate-y-2">
          
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-400 text-purple-950 text-[10px] font-black uppercase tracking-wider shadow-md">
            Most Popular
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Pro Plan</span>
              <Crown className="w-5 h-5 text-amber-400" />
            </div>

            <div className="text-3xl sm:text-4xl font-black text-white mb-6 font-['Outfit']">
              $9.99 <span className="text-xs font-normal text-purple-200">/ month</span>
            </div>
            <p className="text-xs text-purple-200 mb-6">For power users and professionals needing heavy batch workflows.</p>

            <ul className="space-y-3 text-xs text-purple-100 mb-8">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Unlimited batch tasks & conversions</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Max 2GB per file size</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>OCR High-accuracy scanned text detection</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Priority dedicated cloud conversion servers</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Zero advertisements & clean workspace</span>
              </li>
            </ul>
          </div>

          <button 
            className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-400/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-purple-950" />
            <span>Upgrade to Pro Now</span>
          </button>
        </div>

        {/* Tier 3: Business Team */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-lg transition-shadow">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Business & Team</div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 mb-6 font-['Outfit']">
              $29.99 <span className="text-xs font-normal text-slate-500">/ month</span>
            </div>
            <p className="text-xs text-slate-500 mb-6">For teams, companies, and organizations needing centralized tools.</p>

            <ul className="space-y-3 text-xs text-slate-700 mb-8">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Everything in Pro for up to 10 team seats</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>REST API Access (10,000 monthly conversions)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Custom company branding on signed PDFs</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Team administration & audit logs</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Dedicated 24/7 account support</span>
              </li>
            </ul>
          </div>

          <button 
            className="w-full py-3 rounded-2xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-colors"
          >
            Contact Team Sales
          </button>
        </div>

      </div>

    </section>
  );
}
