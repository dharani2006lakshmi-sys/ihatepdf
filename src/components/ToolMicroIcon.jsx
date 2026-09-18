import React from 'react';
import { 
  Layers, 
  Scissors, 
  Trash2, 
  FileMinus, 
  GripVertical, 
  Camera, 
  Minimize2, 
  Wrench, 
  ScanText, 
  Image, 
  Globe, 
  RotateCw, 
  Hash, 
  Stamp, 
  Crop, 
  Edit3, 
  FileText, 
  Unlock, 
  ShieldCheck, 
  PenTool, 
  EyeOff, 
  GitCompare, 
  Sparkles, 
  Languages, 
  FileCode,
  Archive
} from 'lucide-react';

export default function ToolMicroIcon({ tool, size = "md" }) {
  const isSmall = size === "sm";
  const boxClasses = isSmall 
    ? "w-7 h-7 rounded-xl text-[11px]" 
    : "w-9 h-9 rounded-2xl text-xs";

  // Transforma Custom 3D Gradient Badges
  if (tool.iconType === 'word') {
    return (
      <div className={`${boxClasses} bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-black flex items-center justify-center shadow-md shadow-blue-500/20 border border-blue-400/30 shrink-0`}>
        W
      </div>
    );
  }

  if (tool.iconType === 'excel') {
    return (
      <div className={`${boxClasses} bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-black flex items-center justify-center shadow-md shadow-emerald-500/20 border border-emerald-400/30 shrink-0`}>
        X
      </div>
    );
  }

  if (tool.iconType === 'ppt') {
    return (
      <div className={`${boxClasses} bg-gradient-to-tr from-amber-500 to-orange-600 text-white font-black flex items-center justify-center shadow-md shadow-orange-500/20 border border-orange-400/30 shrink-0`}>
        P
      </div>
    );
  }

  if (tool.iconType === 'archive') {
    return (
      <div className={`${boxClasses} bg-gradient-to-tr from-sky-500 to-blue-600 text-white font-black flex items-center justify-center shadow-md shadow-sky-500/20 border border-sky-400/30 shrink-0`}>
        A
      </div>
    );
  }

  if (tool.iconType === 'numbers') {
    return (
      <div className={`${boxClasses} bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-black flex items-center justify-center shadow-md shadow-purple-500/20 border border-purple-400/30 shrink-0`}>
        #
      </div>
    );
  }

  // Transforma Gradient Icon Renderer
  const getGradientAndIcon = () => {
    switch (tool.iconType) {
      case 'layers': return { bg: 'from-rose-500 to-pink-600', icon: <Layers className="w-4 h-4 text-white" /> };
      case 'scissors': return { bg: 'from-orange-500 to-amber-600', icon: <Scissors className="w-4 h-4 text-white" /> };
      case 'trash': return { bg: 'from-red-500 to-rose-600', icon: <Trash2 className="w-4 h-4 text-white" /> };
      case 'file-minus': return { bg: 'from-amber-500 to-orange-600', icon: <FileMinus className="w-4 h-4 text-white" /> };
      case 'grip': return { bg: 'from-purple-500 to-pink-600', icon: <GripVertical className="w-4 h-4 text-white" /> };
      case 'scan': return { bg: 'from-pink-500 to-rose-600', icon: <Camera className="w-4 h-4 text-white" /> };
      case 'compress': return { bg: 'from-emerald-500 to-teal-600', icon: <Minimize2 className="w-4 h-4 text-white" /> };
      case 'wrench': return { bg: 'from-teal-500 to-emerald-700', icon: <Wrench className="w-4 h-4 text-white" /> };
      case 'scan-text': return { bg: 'from-green-500 to-emerald-600', icon: <ScanText className="w-4 h-4 text-white" /> };
      case 'image': return { bg: 'from-yellow-400 to-amber-500', icon: <Image className="w-4 h-4 text-purple-950 font-bold" /> };
      case 'globe': return { bg: 'from-cyan-500 to-blue-600', icon: <Globe className="w-4 h-4 text-white" /> };
      case 'rotate': return { bg: 'from-purple-500 to-violet-600', icon: <RotateCw className="w-4 h-4 text-white" /> };
      case 'stamp': return { bg: 'from-fuchsia-500 to-purple-600', icon: <Stamp className="w-4 h-4 text-white" /> };
      case 'crop': return { bg: 'from-pink-500 to-purple-600', icon: <Crop className="w-4 h-4 text-white" /> };
      case 'edit': return { bg: 'from-pink-500 to-rose-600', icon: <Edit3 className="w-4 h-4 text-white" /> };
      case 'form': return { bg: 'from-purple-600 to-indigo-700', icon: <FileText className="w-4 h-4 text-white" /> };
      case 'unlock': return { bg: 'from-cyan-500 to-blue-600', icon: <Unlock className="w-4 h-4 text-white" /> };
      case 'protect': return { bg: 'from-blue-600 to-indigo-700', icon: <ShieldCheck className="w-4 h-4 text-white" /> };
      case 'sign': return { bg: 'from-violet-500 to-purple-700', icon: <PenTool className="w-4 h-4 text-white" /> };
      case 'redact': return { bg: 'from-slate-700 to-slate-900', icon: <EyeOff className="w-4 h-4 text-amber-400" /> };
      case 'compare': return { bg: 'from-indigo-500 to-purple-600', icon: <GitCompare className="w-4 h-4 text-white" /> };
      case 'ai-sparkle': return { bg: 'from-amber-400 via-pink-500 to-purple-600', icon: <Sparkles className="w-4 h-4 text-white" /> };
      case 'ai-translate': return { bg: 'from-purple-500 to-indigo-600', icon: <Languages className="w-4 h-4 text-white" /> };
      case 'ai-md': return { bg: 'from-indigo-600 to-blue-700', icon: <FileCode className="w-4 h-4 text-white" /> };
      default: return { bg: 'from-purple-600 to-indigo-600', icon: <FileText className="w-4 h-4 text-white" /> };
    }
  };

  const { bg, icon } = getGradientAndIcon();

  return (
    <div className={`${boxClasses} bg-gradient-to-tr ${bg} flex items-center justify-center shadow-md border border-white/20 shrink-0 group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
  );
}
