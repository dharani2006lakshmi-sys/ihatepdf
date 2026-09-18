import React from 'react';
import { 
  ShieldCheck, 
  Zap, 
  Cloud, 
  Smartphone, 
  Sparkles, 
  Award,
  Layers,
  Lock
} from 'lucide-react';

export default function TrustSection() {
  const features = [
    {
      icon: ShieldCheck,
      gradient: 'from-rose-500 to-pink-600',
      shadow: 'shadow-rose-500/20',
      badge: 'Privacy First',
      title: 'Zero Document Logging',
      desc: 'Your files are processed directly in-memory in your browser. We never read, index, or sell your private document content.'
    },
    {
      icon: Cloud,
      gradient: 'from-purple-600 to-indigo-600',
      shadow: 'shadow-purple-500/20',
      badge: 'Cloud Vault',
      title: '7-Day Encrypted File Vault',
      desc: 'Logged-in members get automatic 7-day cloud preservation powered by high-speed multi-cloud storage with 1-click downloads.'
    },
    {
      icon: Zap,
      gradient: 'from-amber-400 to-orange-500',
      shadow: 'shadow-amber-500/20',
      badge: 'Zero Lag',
      title: 'Lightning Client Engine',
      desc: 'Merge, Split, Rotate, Number, and Compress operations run natively on your machine at maximum hardware speeds.'
    },
    {
      icon: Layers,
      gradient: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/20',
      badge: '35 Tools',
      title: 'Full 35-Tool Document Suite',
      desc: 'Everything from Word/Excel/PPT conversion to OCR, Digital Signatures, Redaction, and AI Markdown summarization.'
    },
    {
      icon: Smartphone,
      gradient: 'from-cyan-500 to-blue-600',
      shadow: 'shadow-cyan-500/20',
      badge: 'Responsive',
      title: 'Mobile & Desktop Optimized',
      desc: 'Engineered with quick-action bottom bars, responsive touch targets, and native file manager integration across iOS and Android.'
    },
    {
      icon: Award,
      gradient: 'from-violet-600 to-fuchsia-600',
      shadow: 'shadow-violet-500/20',
      badge: 'Bank-Grade',
      title: 'ISO PDF/A & 256-Bit SSL',
      desc: 'All exports meet worldwide legal, archiving, and financial standards with complete cryptographic security guarantees.'
    }
  ];

  return (
    <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 border border-purple-200 text-purple-800 text-xs font-bold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>Next-Generation Document Infrastructure</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-['Outfit'] mb-3">
          Engineered for Speed, Privacy & Precision
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          Built with bank-grade security standards, encrypted multi-cloud failover, and client-side processing engines.
        </p>
      </div>

      {/* 6 Feature Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div 
              key={idx}
              className="group bg-white rounded-3xl p-6 sm:p-8 border border-purple-100/80 shadow-sm hover:shadow-xl hover:border-purple-300 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${feat.gradient} flex items-center justify-center text-white shadow-lg ${feat.shadow} group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                    {feat.badge}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-black text-slate-900 mb-2 font-['Outfit'] group-hover:text-purple-900 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  {feat.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-purple-700 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                <span>100% Free Forever</span>
                <span>✔ Verified</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
