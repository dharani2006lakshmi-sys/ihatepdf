import React from 'react';
import { Sparkles, Minimize2, ArrowRight } from 'lucide-react';
import { TOOL_CATEGORIES, ALL_TOOLS_LIST } from '../data/toolsData';
import ToolMicroIcon from './ToolMicroIcon';

export default function ToolsGrid({ onSelectTool, searchQuery, activeCategory, setActiveCategory }) {
  // Filter tools based on category and search query
  const filteredTools = ALL_TOOLS_LIST.filter(tool => {
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    const matchesSearch = !searchQuery || 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      tool.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="tools-section" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Category Tabs Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-['Outfit']">
            Comprehensive Document Suite
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Every tool you need to work with PDFs and Word in one place.
          </p>
        </div>

        {/* Counter Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold self-start md:self-auto">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>Showing {filteredTools.length} of {ALL_TOOLS_LIST.length} tools</span>
        </div>
      </div>

      {/* Category Pills (Horizontally scrollable on mobile) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
        {TOOL_CATEGORIES.map(cat => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 shadow-xs ${
                isActive 
                  ? 'bg-[#24084e] text-amber-300 shadow-purple-900/30 scale-105 font-black' 
                  : 'bg-white text-slate-700 hover:bg-purple-50 hover:text-purple-700 border border-slate-200'
              }`}
            >
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Empty Search State */}
      {filteredTools.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 mx-auto flex items-center justify-center mb-4">
            <Minimize2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No tools matched "{searchQuery}"</h3>
          <p className="text-xs text-slate-500 mb-4">Try searching for generic terms like "PDF", "Word", "Merge", or "Convert".</p>
          <button 
            onClick={() => { setActiveCategory('all'); }}
            className="px-4 py-2 rounded-xl bg-purple-700 text-white text-xs font-bold hover:bg-purple-800 transition-all"
          >
            Show All Tools
          </button>
        </div>
      )}

      {/* 35+ Tools Grid (Exact Card Design Matching iLovePDF Screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
        {filteredTools.map((tool) => {
          return (
            <div
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              className="group bg-white hover:bg-gradient-to-b hover:from-purple-50/40 hover:to-white rounded-2xl p-5 border border-slate-200/90 hover:border-purple-300 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Micro Icon Badge */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="group-hover:scale-110 group-hover:rotate-3 transition-transform">
                    <ToolMicroIcon tool={tool} size="md" />
                  </div>
                  {tool.tag && (
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                      {tool.tag}
                    </span>
                  )}
                </div>

                {/* Tool Title */}
                <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-purple-700 transition-colors mb-1.5 leading-snug">
                  {tool.name}
                </h3>

                {/* Tool Description */}
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                  {tool.desc}
                </p>
              </div>

              {/* Bottom Launch Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-700 group-hover:text-purple-900">
                <span className="text-[11px]">Launch</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-purple-600" />
              </div>

            </div>
          );
        })}
      </div>

    </section>
  );
}
