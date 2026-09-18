import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ToolsGrid from './components/ToolsGrid';
import ToolWorkspace from './components/ToolWorkspace';
import TrustSection from './components/TrustSection';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import SearchModal from './components/SearchModal';
import VaultModal from './components/VaultModal';
import AuthModal from './components/AuthModal';
import AdminAnalyticsModal from './components/AdminAnalyticsModal';
import { ALL_TOOLS_LIST } from './data/toolsData';
import { Clock, FileText, Trash2 } from 'lucide-react';
import { getCurrentUser, logoutUser } from './utils/auth';
import { trackVisit, startLiveHeartbeat } from './utils/analytics';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'tool', 'history'
  const [selectedToolId, setSelectedToolId] = useState('merge');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminAnalyticsOpen, setIsAdminAnalyticsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [recentHistory, setRecentHistory] = useState([]);

  // Track page visit & start real-time live users heartbeat on mount
  useEffect(() => {
    trackVisit();
    const cleanup = startLiveHeartbeat();
    return () => cleanup();
  }, []);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('transforma_history');
      if (saved) setRecentHistory(JSON.parse(saved));
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
  }, []);

  // Keyboard shortcuts: Cmd+K / Ctrl+K for Search, Ctrl+Shift+A for Analytics
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && (e.shiftKey || e.altKey) && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setIsAdminAnalyticsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Tool Selection Handler
  const handleSelectTool = (toolId) => {
    setSelectedToolId(toolId);
    setActiveTab('tool');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Track in history
    const toolObj = ALL_TOOLS_LIST.find(t => t.id === toolId);
    if (toolObj) {
      const updatedHistory = [
        {
          id: toolObj.id,
          name: toolObj.name,
          category: toolObj.category,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        ...recentHistory.filter(h => h.id !== toolId)
      ].slice(0, 10);
      setRecentHistory(updatedHistory);
      localStorage.setItem('transforma_history', JSON.stringify(updatedHistory));
    }
  };

  const handleGoHome = () => {
    setActiveTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToTools = () => {
    const el = document.getElementById('tools-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      setActiveTab('home');
      setTimeout(() => {
        document.getElementById('tools-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const selectedTool = ALL_TOOLS_LIST.find(t => t.id === selectedToolId) || ALL_TOOLS_LIST[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-purple-500 selection:text-white font-['Outfit']">
      
      {/* 1. TOP NAVBAR */}
      <Navbar 
        onSelectTool={handleSelectTool}
        onGoHome={handleGoHome}
        activeTab={activeTab}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenVault={() => {
          if (currentUser) setIsVaultOpen(true);
          else setIsAuthOpen(true);
        }}
        user={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={() => {
          logoutUser();
          setCurrentUser(null);
        }}
      />

      {/* 2. MAIN CONTENT ROUTER */}
      <main className="flex-1">
        
        {/* HOMEPAGE VIEW */}
        {activeTab === 'home' && (
          <>
            <Hero 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSelectTool={handleSelectTool}
              onScrollToTools={scrollToTools}
            />

            <ToolsGrid 
              onSelectTool={handleSelectTool}
              searchQuery={searchQuery}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
            />

            <TrustSection />
          </>
        )}

        {/* TOOL WORKSPACE VIEW */}
        {activeTab === 'tool' && (
          <ToolWorkspace 
            tool={selectedTool}
            onBack={handleGoHome}
            onSelectOtherTool={handleSelectTool}
          />
        )}

        {/* RECENT HISTORY VIEW */}
        {activeTab === 'history' && (
          <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900">Recent Activity</h1>
                  <p className="text-xs text-slate-500">Quickly jump back to your recent tools.</p>
                </div>
              </div>

              {recentHistory.length > 0 && (
                <button
                  onClick={() => {
                    setRecentHistory([]);
                    localStorage.removeItem('transforma_history');
                  }}
                  className="text-xs text-rose-600 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear History
                </button>
              )}
            </div>

            {recentHistory.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800 text-sm mb-1">No recent activity yet</h3>
                <p className="text-xs text-slate-500 mb-6">Launch any tool to see your work history listed here.</p>
                <button 
                  onClick={handleGoHome}
                  className="px-6 py-2.5 rounded-full bg-amber-400 text-purple-950 font-black text-xs shadow hover:bg-amber-300 transition-all"
                >
                  Explore Tools
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentHistory.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectTool(item.id)}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-300 cursor-pointer flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 font-bold text-xs flex items-center justify-center">
                        {item.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-slate-800">{item.name}</div>
                        <div className="text-[11px] text-slate-400 capitalize">{item.category.replace('-', ' ')}</div>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {item.timestamp}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* 3. FOOTER */}
      <Footer 
        onSelectTool={handleSelectTool} 
        onOpenAnalytics={() => setIsAdminAnalyticsOpen(true)}
      />

      {/* 4. MOBILE BOTTOM NAVIGATION */}
      <MobileBottomNav 
        activeTab={activeTab}
        onSelectTab={(tab, toolId) => {
          if (tab === 'vault') {
            if (currentUser) setIsVaultOpen(true);
            else setIsAuthOpen(true);
          }
          else if (toolId) handleSelectTool(toolId);
          else setActiveTab(tab);
        }}
        onOpenAllTools={() => {
          setActiveTab('home');
          setTimeout(() => scrollToTools(), 100);
        }}
        onOpenVault={() => {
          if (currentUser) setIsVaultOpen(true);
          else setIsAuthOpen(true);
        }}
      />

      {/* 5. SEARCH OVERLAY MODAL */}
      <SearchModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTool={handleSelectTool}
      />

      {/* 6. 7-DAY FILE VAULT MODAL */}
      <VaultModal 
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        onSelectTool={handleSelectTool}
      />

      {/* 7. AUTHENTICATION (LOGIN / SIGN UP) MODAL */}
      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setIsVaultOpen(true);
        }}
      />

      {/* 8. ADMIN ANALYTICS & MEMBER USAGE DASHBOARD */}
      <AdminAnalyticsModal 
        isOpen={isAdminAnalyticsOpen}
        onClose={() => setIsAdminAnalyticsOpen(false)}
      />

      {/* 9. VERCEL PRODUCTION TELEMETRY */}
      <Analytics />
      <SpeedInsights />

    </div>
  );
}
