import React from 'react';
import { Home, Grid, History, Clock, Zap } from 'lucide-react';

export default function MobileBottomNav({ activeTab, onSelectTab, onOpenAllTools, onOpenVault }) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-3 py-2 shadow-2xl safe-area-bottom">
      <div className="flex items-center justify-around">
        
        {/* Home */}
        <button 
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${activeTab === 'home' ? 'text-purple-700 font-bold' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </button>

        {/* All Tools */}
        <button 
          onClick={onOpenAllTools}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${activeTab === 'tools' ? 'text-purple-700 font-bold' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px]">35 Tools</span>
        </button>

        {/* Center Quick Action Button */}
        <button 
          onClick={() => onSelectTab('tool', 'merge')}
          className="w-11 h-11 -mt-5 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 text-purple-950 flex items-center justify-center shadow-lg shadow-amber-400/40 border-2 border-white hover:scale-105 active:scale-95 transition-transform"
          title="Quick Merge"
        >
          <Zap className="w-5 h-5 fill-purple-950" />
        </button>

        {/* History */}
        <button 
          onClick={() => onSelectTab('history')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${activeTab === 'history' ? 'text-purple-700 font-bold' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px]">Recent</span>
        </button>

        {/* 7-Day Vault */}
        <button 
          onClick={onOpenVault}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-slate-500 hover:text-amber-600 transition-all"
        >
          <Clock className="w-5 h-5 text-amber-500" />
          <span className="text-[10px] font-bold text-amber-600">Vault (7d)</span>
        </button>

      </div>
    </div>
  );
}
