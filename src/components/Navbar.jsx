import React, { useState, useRef, useEffect } from 'react';
import { 
  HeartCrack,
  ChevronDown, 
  ChevronUp, 
  Search, 
  Menu, 
  X, 
  Zap, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Layers,
  Minimize2,
  FileUp,
  FileDown,
  Edit3,
  Lock,
  Cpu,
  Clock
} from 'lucide-react';
import { CLASSIFIED_MENU_DATA } from '../data/toolsData';
import ToolMicroIcon from './ToolMicroIcon';

export default function Navbar({ onSelectTool, onGoHome, activeTab, onOpenSearch, onOpenVault, user, onOpenAuth, onLogout }) {
  const [popularToolsOpen, setPopularToolsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategoryTab, setActiveCategoryTab] = useState('all');

  const megaMenuRef = useRef(null);

  // Close mega menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target)) {
        setPopularToolsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const categories = [
    { key: 'organize', ...CLASSIFIED_MENU_DATA.organize, icon: Layers, accent: 'from-pink-500 to-rose-500' },
    { key: 'optimize', ...CLASSIFIED_MENU_DATA.optimize, icon: Minimize2, accent: 'from-emerald-400 to-teal-500' },
    { key: 'toPdf', ...CLASSIFIED_MENU_DATA.toPdf, icon: FileUp, accent: 'from-blue-500 to-indigo-600' },
    { key: 'fromPdf', ...CLASSIFIED_MENU_DATA.fromPdf, icon: FileDown, accent: 'from-amber-400 to-orange-500' },
    { key: 'editPdf', ...CLASSIFIED_MENU_DATA.editPdf, icon: Edit3, accent: 'from-purple-400 to-fuchsia-500' },
    { key: 'security', ...CLASSIFIED_MENU_DATA.security, icon: Lock, accent: 'from-cyan-400 to-blue-600' },
    { key: 'aiIntelligence', ...CLASSIFIED_MENU_DATA.aiIntelligence, icon: Cpu, accent: 'from-amber-300 via-pink-400 to-purple-500' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#1e0842]/95 backdrop-blur-2xl border-b border-purple-500/20 text-white shadow-2xl transition-all" ref={megaMenuRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* 1. BRAND LOGO: I HATE PDF */}
          <div 
            onClick={onGoHome}
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 p-0.5 shadow-lg shadow-rose-500/30 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#180433] rounded-[14px] flex items-center justify-center">
                <HeartCrack className="w-5 h-5 text-rose-400 group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-light tracking-[0.18em] uppercase text-white font-['Outfit']">
                  I HATE <span className="font-black text-amber-400">PDF</span>
                </span>
              </div>
              <p className="text-[10px] text-purple-300/70 font-light tracking-wide hidden sm:block">Because Working With PDFs Sucks</p>
            </div>
          </div>

          {/* 2. CLEAN TOP NAVIGATION */}
          <nav className="hidden md:flex items-center space-x-2 font-semibold text-sm font-['Outfit']">
            
            {/* Home */}
            <button 
              onClick={onGoHome}
              className={`px-4 py-2 rounded-xl transition-all ${activeTab === 'home' && !popularToolsOpen ? 'text-amber-300 bg-purple-900/60 font-bold' : 'text-purple-100 hover:text-white hover:bg-white/[0.06]'}`}
            >
              Home
            </button>

            {/* Products ▾ (Opens Classified Mega Menu) */}
            <div className="relative">
              <button 
                onClick={() => setPopularToolsOpen(!popularToolsOpen)}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 font-bold ${
                  popularToolsOpen 
                    ? 'bg-amber-400 text-purple-950 font-black shadow-lg shadow-amber-400/20' 
                    : 'text-purple-100 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <span>Products</span>
                {popularToolsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* Features */}
            <a 
              href="#features"
              className="px-4 py-2 rounded-xl text-purple-100 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              Features
            </a>

          </nav>

          {/* 3. RIGHT ACTION BUTTONS */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* 7-Day File Vault Trigger */}
            <button 
              onClick={user ? onOpenVault : onOpenAuth}
              className="px-3 py-2 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/30 text-amber-300 hover:text-amber-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              title="View files stored up to 7 days"
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">7-Day Vault</span>
            </button>

            {/* Clean Search Bar Button */}
            <button 
              onClick={onOpenSearch}
              className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-purple-200 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all"
              title="Search all tools"
            >
              <Search className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">Search</span>
            </button>

            {/* User Auth Buttons or Profile */}
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenVault}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-purple-900/80 border border-purple-400/40 hover:border-amber-400/60 transition-all text-xs font-bold text-white shadow-md"
                  title="My Account & Vault"
                >
                  <img src={user.avatar} alt="Avatar" className="w-5 h-5 rounded-full bg-purple-950" />
                  <span className="max-w-[80px] sm:max-w-[110px] truncate">{user.name}</span>
                </button>
                <button
                  onClick={onLogout}
                  className="text-xs text-purple-300 hover:text-rose-300 font-semibold transition-colors px-2 py-1"
                  title="Log out"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenAuth}
                  className="px-3.5 py-2 rounded-xl text-purple-200 hover:text-white text-xs sm:text-sm font-bold hover:bg-white/[0.08] transition-all"
                >
                  Log in
                </button>
                <button
                  onClick={onOpenAuth}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-purple-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-400/25 transition-all hover:scale-105 active:scale-95"
                >
                  Sign up
                </button>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-white/[0.08] text-purple-200 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>

        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. POPULAR TOOLS CLASSIFIED DROPDOWN                     */}
      {/* ======================================================== */}
      {popularToolsOpen && (
        <div className="absolute left-0 right-0 top-full bg-[#12032b]/98 backdrop-blur-3xl text-white shadow-[0_30px_90px_rgba(10,0,30,0.9)] border-b border-purple-500/30 z-50 animate-in fade-in slide-in-from-top-3 duration-200 max-h-[85vh] overflow-y-auto custom-scroll">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            
            {/* Category Quick Filter Pills directly at top (Header block removed) */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 mb-6 border-b border-white/10">
              <button
                onClick={() => setActiveCategoryTab('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  activeCategoryTab === 'all' 
                    ? 'bg-amber-400 text-purple-950 shadow-md shadow-amber-400/20' 
                    : 'bg-white/[0.06] text-purple-200 hover:bg-white/[0.12]'
                }`}
              >
                All 7 Categories
              </button>
              {categories.map((cat, i) => (
                <button
                  key={i}
                  onClick={() => setActiveCategoryTab(cat.key)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    activeCategoryTab === cat.key 
                      ? 'bg-purple-600 text-white shadow-md' 
                      : 'bg-white/[0.06] text-purple-200 hover:bg-white/[0.12]'
                  }`}
                >
                  {cat.title}
                </button>
              ))}
            </div>

            {/* 7-Column Classified Transforma Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-5">
              {categories
                .filter(cat => activeCategoryTab === 'all' || activeCategoryTab === cat.key)
                .map((cat, idx) => {
                  const CatIcon = cat.icon;
                  return (
                    <div 
                      key={idx} 
                      className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-purple-400/40 rounded-3xl p-4 transition-all duration-200 flex flex-col justify-between"
                    >
                      <div>
                        {/* Category Header */}
                        <div className="flex items-center gap-2 mb-4 pb-2.5 border-b border-white/[0.08]">
                          <div className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${cat.accent} flex items-center justify-center shadow-xs`}>
                            <CatIcon className="w-3.5 h-3.5 text-white" />
                          </div>
                          <h4 className="text-[11px] font-black uppercase tracking-wider text-purple-200">
                            {cat.title}
                          </h4>
                        </div>

                        {/* Tool Items */}
                        <div className="space-y-1.5">
                          {cat.tools.map(tool => (
                            <div
                              key={tool.id}
                              onClick={() => {
                                onSelectTool(tool.id);
                                setPopularToolsOpen(false);
                              }}
                              className="group p-2 rounded-2xl bg-white/[0.02] hover:bg-purple-900/60 border border-transparent hover:border-purple-400/30 cursor-pointer transition-all flex items-center gap-2.5"
                            >
                              <ToolMicroIcon tool={tool} size="sm" />
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                                  {tool.name}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  );
                })}
            </div>

            {/* Bottom Security Strip */}
            <div className="mt-8 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-purple-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% In-Browser Engine • Zero File Uploads Needed • Bank-Grade Private</span>
              </div>
              <div className="text-amber-300 font-bold">
                I HATE PDF — Free Forever
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. MOBILE DRAWER                                          */}
      {/* ======================================================== */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#14042e] border-b border-purple-800/80 px-4 pt-4 pb-8 space-y-4 animate-in fade-in slide-in-from-top-4 max-h-[85vh] overflow-y-auto">
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400">
              I HATE PDF Tools
            </span>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-purple-300 hover:text-white"
            >
              ✕ Close
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((cat, i) => (
              <button
                key={i}
                onClick={() => setActiveCategoryTab(cat.key)}
                className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  activeCategoryTab === cat.key || (activeCategoryTab === 'all' && i === 0)
                    ? 'bg-amber-400 text-purple-950 shadow-md'
                    : 'bg-white/[0.08] text-purple-200'
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(categories.find(c => c.key === activeCategoryTab) || categories[0]).tools.map(tool => (
              <div
                key={tool.id}
                onClick={() => {
                  onSelectTool(tool.id);
                  setMobileMenuOpen(false);
                }}
                className="p-3 rounded-2xl bg-white/[0.05] hover:bg-purple-900/80 border border-white/10 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <ToolMicroIcon tool={tool} size="md" />
                  <div>
                    <div className="text-xs font-bold text-white">{tool.name}</div>
                    <div className="text-[10px] text-purple-300">{tool.desc}</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />
              </div>
            ))}
          </div>

        </div>
      )}

    </header>
  );
}
