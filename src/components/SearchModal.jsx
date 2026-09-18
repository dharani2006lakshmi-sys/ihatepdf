import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { ALL_TOOLS_LIST } from '../data/toolsData';

export default function SearchModal({ isOpen, onClose, onSelectTool }) {
  const [query, setQuery] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const results = ALL_TOOLS_LIST.filter(t => 
    !query || 
    t.name.toLowerCase().includes(query.toLowerCase()) || 
    t.desc.toLowerCase().includes(query.toLowerCase()) ||
    t.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-start justify-center p-4 pt-16 sm:pt-24 animate-in fade-in duration-200">
      
      <div 
        className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-purple-700 shrink-0" />
          <input 
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type any tool name (e.g. Merge, Split, Word, Rotate, Compress)..."
            className="w-full bg-transparent text-sm sm:text-base font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-3 space-y-1.5 divide-y divide-slate-50 custom-scroll">
          {results.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">
              No matching tools found for "{query}".
            </div>
          ) : (
            results.map((tool) => (
              <div 
                key={tool.id}
                onClick={() => {
                  onSelectTool(tool.id);
                  onClose();
                }}
                className="p-3 rounded-2xl hover:bg-purple-50 flex items-center justify-between gap-3 cursor-pointer group transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div 
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: tool.color }}
                  >
                    {tool.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-purple-700 flex items-center gap-2">
                      <span>{tool.name}</span>
                      <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {tool.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">{tool.desc}</div>
                  </div>
                </div>

                <div className="text-purple-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 px-5">
          <span>Navigate with mouse or touch</span>
          <span>Press <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border">ESC</kbd> to close</span>
        </div>

      </div>

    </div>
  );
}
