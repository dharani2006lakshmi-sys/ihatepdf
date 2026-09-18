import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  X, 
  Users, 
  FileText, 
  HardDrive, 
  Activity, 
  TrendingUp, 
  Globe, 
  ExternalLink,
  Smartphone,
  Monitor,
  Sparkles,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { getAnalyticsSummary } from '../utils/analytics';
import { getVaultFiles } from '../utils/fileVault';

export default function AdminAnalyticsModal({ isOpen, onClose }) {
  const [summary, setSummary] = useState(null);
  const [vaultFilesCount, setVaultFilesCount] = useState(0);

  const loadMetrics = async () => {
    const stats = getAnalyticsSummary();
    setSummary(stats);
    try {
      const vFiles = await getVaultFiles();
      setVaultFilesCount(vFiles.length);
    } catch (e) {}
  };

  useEffect(() => {
    if (isOpen) {
      loadMetrics();
    }
  }, [isOpen]);

  if (!isOpen || !summary) return null;

  const formatBytes = (bytes) => {
    if (!bytes) return '0 MB';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-[#14032e] border border-purple-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-purple-800/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-purple-950 shadow-md">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black font-['Outfit']">
                  Site Usage & Member Analytics
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-400 animate-pulse" /> Live Telemetry
                </span>
              </div>
              <p className="text-xs text-purple-300">
                Real-time traffic metrics, member activity, and tool engagement
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadMetrics}
              className="p-2 rounded-xl bg-purple-900/50 hover:bg-purple-800 text-purple-200 hover:text-white transition-colors"
              title="Refresh Stats"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-purple-200 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 5 Core Metric Cards Including Live Users */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 my-4 shrink-0">
          
          {/* LIVE USERS CARD */}
          <div className="p-4 rounded-2xl bg-gradient-to-tr from-emerald-950/80 to-purple-900/60 border border-emerald-500/40 relative overflow-hidden">
            <div className="flex items-center justify-between text-emerald-300 mb-1.5">
              <span className="text-xs font-black uppercase tracking-wider">Live Online</span>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="text-2xl font-black text-emerald-300 flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block shadow-lg shadow-emerald-400/50" />
              <span>{summary.liveUsers || 1}</span>
            </div>
            <span className="text-[10px] text-emerald-400 mt-1 block font-bold">Active Right Now</span>
          </div>

          <div className="p-4 rounded-2xl bg-purple-900/40 border border-purple-700/40">
            <div className="flex items-center justify-between text-purple-300 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider">Unique Members</span>
              <Users className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white">{summary.uniqueVisitors}</div>
            <span className="text-[10px] text-purple-300 mt-1 block">Unique Device/IP</span>
          </div>

          <div className="p-4 rounded-2xl bg-purple-900/40 border border-purple-700/40">
            <div className="flex items-center justify-between text-purple-300 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider">Pageviews</span>
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-white">{summary.pageViews}</div>
            <span className="text-[10px] text-purple-300 mt-1 block">{summary.returningVisits} Returning</span>
          </div>

          <div className="p-4 rounded-2xl bg-purple-900/40 border border-purple-700/40">
            <div className="flex items-center justify-between text-purple-300 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider">Processed</span>
              <FileText className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white">{summary.totalProcessed}</div>
            <span className="text-[10px] text-amber-300 mt-1 block">Across 35 Tools</span>
          </div>

          <div className="p-4 rounded-2xl bg-purple-900/40 border border-purple-700/40 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-purple-300 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider">Vault Files</span>
              <HardDrive className="w-4 h-4 text-pink-400" />
            </div>
            <div className="text-2xl font-black text-white">{vaultFilesCount}</div>
            <span className="text-[10px] text-pink-300 mt-1 block">7-Day Cloud</span>
          </div>

        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scroll">
          
          {/* Vercel Cloud Analytics Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/80 via-indigo-900/60 to-purple-950/80 border border-purple-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-black text-amber-300">
                <Sparkles className="w-4 h-4" />
                <span>Vercel Global Edge Web Analytics Enabled</span>
              </div>
              <p className="text-[11px] text-purple-200 mt-0.5">
                Tracks live visitors, countries, referrers, and Core Web Vitals on your Vercel Dashboard.
              </p>
            </div>
            <a
              href="https://vercel.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs transition-all shrink-0 flex items-center gap-1.5"
            >
              <span>Vercel Analytics</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Popular Tools Breakdown & Recent Activity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Left: Most Popular Tools Leaderboard */}
            <div className="p-4 rounded-2xl bg-purple-950/60 border border-purple-800/80">
              <h4 className="text-xs font-black uppercase tracking-wider text-purple-200 mb-3 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                <span>Most Used Tools</span>
              </h4>

              {summary.popularTools.length === 0 ? (
                <div className="py-8 text-center text-xs text-purple-400">
                  No tools used yet. Process any tool to see ranking!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {summary.popularTools.slice(0, 5).map((tool, idx) => {
                    const pct = Math.min(100, Math.round((tool.count / Math.max(1, summary.totalProcessed)) * 100));
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white capitalize">{tool.id.replace('-', ' ')}</span>
                          <span className="text-amber-300 font-mono font-bold">{tool.count} times ({pct}%)</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-purple-900 overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-500" 
                            style={{ width: `${Math.max(8, pct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Real-Time Event Log */}
            <div className="p-4 rounded-2xl bg-purple-950/60 border border-purple-800/80">
              <h4 className="text-xs font-black uppercase tracking-wider text-purple-200 mb-3 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>Recent Tool Activity</span>
              </h4>

              {summary.recentEvents.length === 0 ? (
                <div className="py-8 text-center text-xs text-purple-400">
                  Ready for live events.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scroll pr-1">
                  {summary.recentEvents.slice(0, 6).map((evt) => (
                    <div 
                      key={evt.id} 
                      className="p-2 rounded-xl bg-white/[0.04] border border-purple-700/30 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="font-bold text-white">{evt.toolName}</span>
                      </div>
                      <span className="text-[10px] text-purple-400 font-mono">{evt.timestamp}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-purple-800/60 flex items-center justify-between text-[11px] text-purple-300 shrink-0">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>GDPR & CCPA Compliant • Privacy-First Analytics</span>
          </div>
          <span className="text-purple-400">I HATE PDF Telemetry Engine</span>
        </div>

      </div>
    </div>
  );
}
