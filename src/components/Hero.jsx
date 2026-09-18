import React from 'react';
import { 
  Sparkles, 
  Search, 
  Zap, 
  ShieldCheck, 
  Clock, 
  FileText, 
  Layers, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export default function Hero({ searchQuery, setSearchQuery, onSelectTool, onScrollToTools }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#2a085c] via-[#4c1d95] to-[#6d28d9] text-white pt-12 pb-20 md:pt-20 md:pb-28 px-4 sm:px-6 lg:px-8">
      
      {/* Background ambient lighting blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Floating 3D Document Badges (4 Sides & Corners) */}
      {/* 1. TOP-LEFT: PDF */}
      <div className="hidden lg:block absolute top-24 xl:top-32 left-4 xl:left-12 animate-float-1 pointer-events-none select-none z-0">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 shadow-2xl flex items-center gap-3 rotate-[-6deg]">
          <div className="w-9 h-9 rounded-xl bg-rose-500 flex items-center justify-center font-black text-xs text-white shadow-lg shadow-rose-500/30">
            PDF
          </div>
          <div>
            <div className="text-xs font-bold text-white">Annual_Report.pdf</div>
            <div className="text-[10px] text-purple-200">2.4 MB • Ready to Merge</div>
          </div>
        </div>
      </div>

      {/* 2. TOP-RIGHT: DOCX */}
      <div className="hidden lg:block absolute top-28 xl:top-36 right-4 xl:right-12 animate-float-2 pointer-events-none select-none z-0">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 shadow-2xl flex items-center gap-3 rotate-[8deg]">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-xs text-white shadow-lg shadow-blue-500/30">
            DOCX
          </div>
          <div>
            <div className="text-xs font-bold text-white">Contract_Editable.docx</div>
            <div className="text-[10px] text-purple-200">Export with 1-click</div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM-LEFT: PPTX */}
      <div className="hidden xl:block absolute bottom-16 left-6 xl:left-12 animate-float-2 pointer-events-none select-none z-0">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 shadow-2xl flex items-center gap-2.5 rotate-[6deg]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-bold text-[10px] text-white shadow-md">
            PPTX
          </div>
          <div>
            <div className="text-xs font-bold text-white">Pitch_Deck.pptx</div>
            <div className="text-[10px] text-purple-200">Vector Slides Ready</div>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM-RIGHT: XLSX */}
      <div className="hidden xl:block absolute bottom-16 right-6 xl:right-12 animate-float-1 pointer-events-none select-none z-0">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 shadow-2xl flex items-center gap-2.5 rotate-[-6deg]">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-[10px] text-white shadow-md">
            XLSX
          </div>
          <div>
            <div className="text-xs font-bold text-white">Financial_Report.xlsx</div>
            <div className="text-[10px] text-purple-200">Tables Extracted 100%</div>
          </div>
        </div>
      </div>

      {/* Main Hero Content */}
      <div className="max-w-4xl mx-auto text-center relative z-10">
        
        {/* Top Tag Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-purple-200 text-xs font-semibold mb-6 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>I HATE PDF — The Anti-Frustration Document Studio</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] mb-6 text-white">
          Hate Dealing with PDFs? <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
            We Fix Them Instantly.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-purple-100/90 max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
          The 100% free online studio to merge, split, compress, convert, and edit all your PDF & Word files without any software installation or headache.
        </p>

        {/* Search Bar for Tools */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative flex items-center bg-white rounded-2xl p-2 shadow-2xl shadow-purple-950/40 border-2 border-white/80 focus-within:border-amber-400 transition-all">
            <Search className="w-5 h-5 text-purple-900/60 ml-3 mr-2 shrink-0" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across all 35 tools (e.g. Merge, PDF to Word, Compress)..."
              className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-sm font-medium focus:outline-none pr-3"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-slate-700 mr-2"
              >
                Clear
              </button>
            )}
            <button 
              onClick={onScrollToTools}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs shadow transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              Search
            </button>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <button 
            onClick={onScrollToTools}
            className="px-8 py-3.5 rounded-full bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-sm sm:text-base shadow-xl shadow-amber-400/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <Zap className="w-5 h-5 fill-purple-950" />
            <span>Get Started — 100% Free</span>
          </button>

          <button 
            onClick={onScrollToTools}
            className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white font-bold text-sm sm:text-base transition-all hover:scale-105 flex items-center gap-2"
          >
            <span>Explore All 35 Tools</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Security & Speed Guarantee Strip */}
        <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 text-xs text-purple-200 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>256-Bit SSL Encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>7-Day Auto-Saved Vault</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-yellow-400" />
            <span>No Registration Required</span>
          </div>
        </div>

      </div>

    </section>
  );
}
