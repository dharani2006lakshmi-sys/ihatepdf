import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  CloudUpload, 
  FileText, 
  Trash2, 
  ChevronLeft,
  ChevronRight,
  Download, 
  Check, 
  AlertCircle, 
  Loader2, 
  Zap, 
  Sparkles,
  RefreshCw,
  Sliders,
  Plus,
  ArrowUpDown,
  RotateCw,
  Info,
  ArrowRight,
  ShieldCheck,
  Lock,
  Layers,
  GripVertical
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  mergePDFs, 
  splitPDF, 
  rotatePDF, 
  deletePagesPDF, 
  addPageNumbersPDF, 
  watermarkPDF, 
  imagesToPDF, 
  pdfToWordDocx, 
  convertOfficeToPDF,
  protectOrUnlockPDF,
  signPDF,
  redactPDF,
  pdfToMarkdownExport,
  exportDataFormat,
  organizePDFPages,
  performOCRPDF,
  pdfToJPGImages,
  compressPDF, 
  downloadBlob 
} from '../utils/pdfEngine';
import { saveFileToVault } from '../utils/fileVault';
import { trackToolUsage } from '../utils/analytics';
import { generatePdfThumbnail, generatePdfAllPages } from '../utils/pdfThumbnail';

export default function ToolWorkspace({ tool, onBack, onSelectOtherTool }) {
  const [files, setFiles] = useState([]);
  const [thumbnails, setThumbnails] = useState({});
  const [pdfPages, setPdfPages] = useState([]);
  const [selectedDeleteSet, setSelectedDeleteSet] = useState(new Set());
  const [selectedExtractSet, setSelectedExtractSet] = useState(new Set());
  const [organizePages, setOrganizePages] = useState([]);
  const [scanPages, setScanPages] = useState([]);
  const [draggedOrganizeIdx, setDraggedOrganizeIdx] = useState(null);
  const [loadingPages, setLoadingPages] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  
  // Custom tool options state
  const [splitRange, setSplitRange] = useState('');
  const [extractMode, setExtractMode] = useState('single'); // 'single' (1 combined PDF) or 'separate' (ZIP)
  const [jpgQuality, setJpgQuality] = useState('high'); // 'high' (300 DPI) or 'standard' (150 DPI)
  const [pageOrderStr, setPageOrderStr] = useState('');
  const [rotateAngle, setRotateAngle] = useState(0);
  const [deletePagesStr, setDeletePagesStr] = useState('');
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.25);
  const [pageNumberPos, setPageNumberPos] = useState('bottom-center');
  const [compressLevel, setCompressLevel] = useState('recommended');
  const [ocrLanguage, setOcrLanguage] = useState('English');
  const [ocrFormat, setOcrFormat] = useState('searchable-pdf');
  const [ocrAccuracy, setOcrAccuracy] = useState('enhanced');
  const [protectPassword, setProtectPassword] = useState('');

  const fileInputRef = useRef(null);

  // File size formatter
  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Helper to format array of numbers as continuous ranges e.g. "1-3, 5, 8-10"
  const formatRanges = (numbers) => {
    if (!numbers || numbers.length === 0) return '';
    const ranges = [];
    let start = numbers[0];
    let end = numbers[0];
    for (let i = 1; i < numbers.length; i++) {
      if (numbers[i] === end + 1) {
        end = numbers[i];
      } else {
        ranges.push(start === end ? `${start}` : `${start}-${end}`);
        start = numbers[i];
        end = numbers[i];
      }
    }
    ranges.push(start === end ? `${start}` : `${start}-${end}`);
    return ranges.join(', ');
  };

  const isPageTool = ['delete-pages', 'split', 'extract-pages', 'reorder-pages', 'scan-to-pdf', 'rotate', 'crop-pdf', 'pdf-to-jpg'].includes(tool.id);

  // Generate real PDF first-page thumbnails
  useEffect(() => {
    let isMounted = true;
    files.forEach(async (file) => {
      const key = `${file.name}_${file.size}_${file.lastModified}`;
      if (!thumbnails[key]) {
        try {
          const thumb = await generatePdfThumbnail(file);
          if (thumb && isMounted) {
            setThumbnails(prev => ({ ...prev, [key]: thumb }));
          }
        } catch (e) {}
      }
    });

    // If single PDF on page tool (like Remove pages, Split, Extract, Reorder, Scan, Rotate), extract all page thumbnails
    if (isPageTool && files.length === 1 && (files[0].name.endsWith('.pdf') || files[0].type === 'application/pdf')) {
      setLoadingPages(true);
      generatePdfAllPages(files[0]).then(pages => {
        if (isMounted) {
          setPdfPages(pages);
          if (tool.id === 'reorder-pages') {
            setOrganizePages(pages.map(p => ({
              id: `orig-${p.pageNumber}-${Date.now()}-${Math.random()}`,
              type: 'page',
              originalPageNumber: p.pageNumber,
              dataUrl: p.dataUrl,
              rotation: 0
            })));
          }
          if (['scan-to-pdf', 'rotate', 'crop-pdf'].includes(tool.id)) {
            setScanPages(pages.map(p => ({
              pageNumber: p.pageNumber,
              dataUrl: p.dataUrl,
              rotation: 0
            })));
          }
          setLoadingPages(false);
        }
      }).catch(() => {
        if (isMounted) setLoadingPages(false);
      });
    } else {
      setPdfPages([]);
      setOrganizePages([]);
      setScanPages([]);
    }

    return () => { isMounted = false; };
  }, [files, tool.id]);

  // Handle file drop / select
  const handleFiles = (incomingFiles) => {
    setError(null);
    setResult(null);
    const newFiles = Array.from(incomingFiles);

    if (tool.multiple) {
      setFiles(prev => [...prev, ...newFiles]);
    } else {
      setFiles([newFiles[0]]);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Reorder files via button
  const moveFile = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= files.length) return;
    const updated = [...files];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    setFiles(updated);
  };

  // Live Drag and Drop Card Reordering (Cards slide live as mouse moves)
  const handleDragOverItem = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex === null || draggedIndex === index) return;

    const newFiles = [...files];
    const [draggedItem] = newFiles.splice(draggedIndex, 1);
    newFiles.splice(index, 0, draggedItem);
    setDraggedIndex(index);
    setFiles(newFiles);
  };

  // Live Drag and Drop for Organize PDF Page Cards
  const handleDragOverOrganizePage = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedOrganizeIdx === null || draggedOrganizeIdx === index) return;

    const next = [...organizePages];
    const [draggedItem] = next.splice(draggedOrganizeIdx, 1);
    next.splice(index, 0, draggedItem);
    setDraggedOrganizeIdx(index);
    setOrganizePages(next);
  };

  // Rotate individual page in Organize PDF
  const rotateOrganizePage = (index) => {
    setOrganizePages(prev => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        rotation: ((next[index].rotation || 0) + 90) % 360
      };
      return next;
    });
  };

  // Delete page in Organize PDF
  const deleteOrganizePage = (index) => {
    if (organizePages.length <= 1) {
      setError('Cannot delete all pages. At least 1 page must remain.');
      return;
    }
    setOrganizePages(prev => prev.filter((_, i) => i !== index));
  };

  // Add a blank page (at start, at end, before, or after a specific page)
  const addBlankPage = (position = 'end', targetIndex = -1) => {
    const newBlank = {
      id: `blank-${Date.now()}-${Math.random()}`,
      type: 'blank',
      originalPageNumber: null,
      dataUrl: null,
      rotation: 0
    };
    if (position === 'start') {
      setOrganizePages(prev => [newBlank, ...prev]);
    } else if (position === 'end') {
      setOrganizePages(prev => [...prev, newBlank]);
    } else if (position === 'after' && targetIndex >= 0) {
      setOrganizePages(prev => {
        const next = [...prev];
        next.splice(targetIndex + 1, 0, newBlank);
        return next;
      });
    } else if (position === 'before' && targetIndex >= 0) {
      setOrganizePages(prev => {
        const next = [...prev];
        next.splice(targetIndex, 0, newBlank);
        return next;
      });
    }
  };

  // Rotate all pages in Organize PDF
  const rotateAllOrganizePages = () => {
    setOrganizePages(prev => prev.map(p => ({
      ...p,
      rotation: ((p.rotation || 0) + 90) % 360
    })));
  };

  // Reset Organize Pages to initial state
  const resetOrganizePages = () => {
    setOrganizePages(pdfPages.map(p => ({
      id: `orig-${p.pageNumber}-${Date.now()}-${Math.random()}`,
      type: 'page',
      originalPageNumber: p.pageNumber,
      dataUrl: p.dataUrl,
      rotation: 0
    })));
  };

  // Rotate individual page in Scan to PDF / Rotate PDF
  const rotateScanPage = (idx) => {
    setScanPages(prev => prev.map((p, i) => {
      if (i === idx) {
        return { ...p, rotation: ((p.rotation || 0) + 90) % 360 };
      }
      return p;
    }));
  };

  // Set specific rotation on individual page
  const setPageSpecificRotation = (idx, angle) => {
    setScanPages(prev => prev.map((p, i) => {
      if (i === idx) {
        return { ...p, rotation: angle % 360 };
      }
      return p;
    }));
  };

  // Rotate all pages by 90 degrees
  const rotateAllScanPages = (angleStep = 90) => {
    setScanPages(prev => prev.map(p => ({
      ...p,
      rotation: ((p.rotation || 0) + angleStep) % 360
    })));
  };

  // Set all pages to specific global degree (0, 90, 180, 270)
  const setAllPagesToAngle = (angle) => {
    setRotateAngle(angle);
    setScanPages(prev => prev.map(p => ({
      ...p,
      rotation: angle
    })));
  };

  // Reset scan / rotate pages
  const resetScanPages = () => {
    setRotateAngle(0);
    setScanPages(pdfPages.map(p => ({
      pageNumber: p.pageNumber,
      dataUrl: p.dataUrl,
      rotation: 0
    })));
  };

  // Sort files A-Z or Z-A
  const toggleSort = () => {
    const sorted = [...files].sort((a, b) => {
      return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    });
    setSortAsc(!sortAsc);
    setFiles(sorted);
  };

  // Toggle a page for removal in Remove pages tool
  const toggleDeletePage = (pageNum) => {
    const next = new Set(selectedDeleteSet);
    if (next.has(pageNum)) {
      next.delete(pageNum);
    } else {
      next.add(pageNum);
    }
    setSelectedDeleteSet(next);
    const sorted = Array.from(next).sort((a, b) => a - b);
    setDeletePagesStr(sorted.join(', '));
  };

  // Toggle a page for extraction in Extract Pages / Split tool
  const toggleExtractPage = (pageNum) => {
    const next = new Set(selectedExtractSet);
    if (next.has(pageNum)) {
      next.delete(pageNum);
    } else {
      next.add(pageNum);
    }
    setSelectedExtractSet(next);
    const sorted = Array.from(next).sort((a, b) => a - b);
    setSplitRange(formatRanges(sorted));
  };

  // Sync manual input in sidebar to page cards (Remove Pages)
  const handleManualDeleteInputChange = (val) => {
    setDeletePagesStr(val);
    const parts = val.split(',').map(s => s.trim()).filter(Boolean);
    const set = new Set();
    for (const p of parts) {
      if (p.includes('-')) {
        const [start, end] = p.split('-').map(Number);
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = start; i <= end; i++) set.add(i);
        }
      } else {
        const n = Number(p);
        if (!isNaN(n)) set.add(n);
      }
    }
    setSelectedDeleteSet(set);
  };

  // Sync manual input in sidebar to page cards (Extract Pages / Split)
  const handleManualExtractInputChange = (val) => {
    setSplitRange(val);
    const parts = val.split(',').map(s => s.trim()).filter(Boolean);
    const set = new Set();
    for (const p of parts) {
      if (p.includes('-')) {
        const [start, end] = p.split('-').map(Number);
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = start; i <= end; i++) set.add(i);
        }
      } else {
        const n = Number(p);
        if (!isNaN(n)) set.add(n);
      }
    }
    setSelectedExtractSet(set);
  };

  const selectEvenPages = () => {
    const set = new Set();
    pdfPages.forEach(p => { if (p.pageNumber % 2 === 0) set.add(p.pageNumber); });
    setSelectedDeleteSet(set);
    setDeletePagesStr(Array.from(set).sort((a, b) => a - b).join(', '));
  };

  const selectOddPages = () => {
    const set = new Set();
    pdfPages.forEach(p => { if (p.pageNumber % 2 !== 0) set.add(p.pageNumber); });
    setSelectedDeleteSet(set);
    setDeletePagesStr(Array.from(set).sort((a, b) => a - b).join(', '));
  };

  const clearDeleteSelection = () => {
    setSelectedDeleteSet(new Set());
    setDeletePagesStr('');
  };

  // Quick select functions for Extract Pages
  const selectAllExtractPages = () => {
    const set = new Set(pdfPages.map(p => p.pageNumber));
    setSelectedExtractSet(set);
    setSplitRange(formatRanges(Array.from(set).sort((a, b) => a - b)));
  };

  const selectOddExtractPages = () => {
    const set = new Set();
    pdfPages.forEach(p => { if (p.pageNumber % 2 !== 0) set.add(p.pageNumber); });
    setSelectedExtractSet(set);
    setSplitRange(formatRanges(Array.from(set).sort((a, b) => a - b)));
  };

  const selectEvenExtractPages = () => {
    const set = new Set();
    pdfPages.forEach(p => { if (p.pageNumber % 2 === 0) set.add(p.pageNumber); });
    setSelectedExtractSet(set);
    setSplitRange(formatRanges(Array.from(set).sort((a, b) => a - b)));
  };

  const clearExtractSelection = () => {
    setSelectedExtractSet(new Set());
    setSplitRange('');
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setSelectedDeleteSet(new Set());
    setSelectedExtractSet(new Set());
    setOrganizePages([]);
    setScanPages([]);
    setDeletePagesStr('');
    setSplitRange('');
    setPdfPages([]);
    if (files.length <= 1) {
      setResult(null);
    }
  };

  // EXECUTE PDF ENGINE ACTION
  const processTool = async () => {
    if (files.length === 0) {
      setError('Please select or drop files to proceed.');
      return;
    }

    if (tool.id === 'delete-pages') {
      if (!deletePagesStr || !deletePagesStr.trim()) {
        setError('Please click on at least 1 page or enter page numbers to remove.');
        return;
      }
    }

    if (['split', 'extract-pages'].includes(tool.id)) {
      if (!splitRange || !splitRange.trim()) {
        setError('Please click on at least 1 page or enter page range to extract.');
        return;
      }
    }

    if (tool.id === 'reorder-pages') {
      if (organizePages.length === 0) {
        setError('At least 1 page is required in the organized document.');
        return;
      }
    }

    setProcessing(true);
    setError(null);
    setProgress(20);

    try {
      let res = null;

      // Simulated realistic progress animation
      const interval = setInterval(() => {
        setProgress(p => (p < 85 ? p + 15 : p));
      }, 200);

      switch (tool.id) {
        // Organize Tools
        case 'merge':
        case 'compare-pdf':
          res = await mergePDFs(files);
          break;
        case 'split':
        case 'extract-pages':
          res = await splitPDF(files[0], splitRange, extractMode);
          break;
        case 'pdf-to-jpg':
          res = await pdfToJPGImages(files[0], {
            quality: jpgQuality === 'high' ? 0.95 : 0.85,
            scale: jpgQuality === 'high' ? 2.0 : 1.4,
            pageRange: splitRange
          });
          break;
        case 'reorder-pages':
          res = await organizePDFPages(files[0], { pageActions: organizePages });
          break;
        case 'rotate':
        case 'crop-pdf':
        case 'scan-to-pdf':
        case 'edit-pdf':
          res = await rotatePDF(files[0], rotateAngle || 90, 'all', scanPages);
          break;
        case 'delete-pages':
          res = await deletePagesPDF(files[0], deletePagesStr);
          break;
        
        // Edit & Page Number Tools
        case 'page-numbers':
        case 'header-footer':
          res = await addPageNumbersPDF(files[0], pageNumberPos);
          break;
        case 'watermark-pdf':
          res = await watermarkPDF(files[0], watermarkText, watermarkOpacity);
          break;
        
        // Convert to PDF Tools
        case 'jpg-to-pdf':
          res = await imagesToPDF(files);
          break;
        case 'word-to-pdf':
          res = await convertOfficeToPDF(files[0], 'Microsoft Word');
          break;
        case 'ppt-to-pdf':
          res = await convertOfficeToPDF(files[0], 'PowerPoint');
          break;
        case 'excel-to-pdf':
          res = await convertOfficeToPDF(files[0], 'Excel Spreadsheet');
          break;
        case 'html-to-pdf':
          res = await convertOfficeToPDF(files[0], 'HTML Webpage');
          break;
        case 'md-to-pdf':
          res = await convertOfficeToPDF(files[0], 'Markdown Document');
          break;
        
        // Convert from PDF Tools
        case 'pdf-to-word':
        case 'ai-translate':
          res = await pdfToWordDocx(files[0]);
          break;
        case 'pdf-to-excel':
          res = await exportDataFormat(files[0], 'xlsx');
          break;
        case 'pdf-to-ppt':
          res = await exportDataFormat(files[0], 'pptx');
          break;
        case 'pdf-to-pdfa':
        case 'compress':
        case 'repair-pdf':
        case 'flatten-pdf':
          res = await compressPDF(files[0], compressLevel);
          break;
        case 'ocr-pdf':
          res = await performOCRPDF(files[0], {
            language: ocrLanguage,
            outputFormat: ocrFormat,
            accuracy: ocrAccuracy
          });
          break;

        // Security Tools
        case 'protect-pdf':
          res = await protectOrUnlockPDF(files[0], protectPassword, false);
          break;
        case 'unlock-pdf':
          res = await protectOrUnlockPDF(files[0], '', true);
          break;
        case 'sign-pdf':
          res = await signPDF(files[0], 'I HATE PDF Digital Signature');
          break;
        case 'redact-pdf':
          res = await redactPDF(files[0]);
          break;

        // AI Intelligence Tools
        case 'ai-summary':
        case 'pdf-to-md':
          res = await pdfToMarkdownExport(files[0]);
          break;

        default:
          res = await mergePDFs(files.length > 1 ? files : [files[0], files[0]]);
          break;
      }

      clearInterval(interval);
      setProgress(100);

      // Save processed file to 7-day vault
      if (res) {
        const fileBlob = res.blob || (res.bytes ? new Blob([res.bytes], { type: 'application/pdf' }) : null);
        const finalSize = res.size || res.newSize || fileBlob?.size || 0;

        // Track Analytics
        trackToolUsage(tool.id, tool.name, finalSize);

        if (fileBlob) {
          saveFileToVault({
            fileName: res.filename,
            toolId: tool.id,
            toolName: tool.name,
            blob: fileBlob,
            fileSize: finalSize
          }).catch(console.error);
        }
      }

      setTimeout(() => {
        setResult(res);
        setProcessing(false);
        // Trigger celebratory confetti!
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }, 500);

    } catch (err) {
      setError(err.message || 'An error occurred while processing the document.');
      setProcessing(false);
    }
  };

  // Download Trigger
  const handleDownload = () => {
    if (!result) return;
    if (result.type === 'zip' || result.filename?.endsWith('.zip')) {
      downloadBlob(result.blob, result.filename, 'application/zip');
    } else if (result.type === 'jpg' || result.filename?.endsWith('.jpg') || result.filename?.endsWith('.jpeg')) {
      downloadBlob(result.blob, result.filename, 'image/jpeg');
    } else if (result.type === 'png' || result.filename?.endsWith('.png')) {
      downloadBlob(result.blob, result.filename, 'image/png');
    } else if (result.type === 'txt' || result.filename?.endsWith('.txt')) {
      downloadBlob(result.blob, result.filename, 'text/plain;charset=utf-8');
    } else if (result.blob) {
      const mime = result.filename?.endsWith('.docx') 
        ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
        : (result.filename?.endsWith('.xlsx')
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : (result.filename?.endsWith('.pptx')
                ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
                : 'application/pdf'));
      downloadBlob(result.blob, result.filename, mime);
    } else if (result.bytes) {
      downloadBlob(result.bytes, result.filename, 'application/pdf');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#100326] via-[#170535] to-[#0c021c] text-white py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto animate-in fade-in duration-300">
        
        {/* Hidden file input */}
        <input 
          type="file"
          ref={fileInputRef}
          accept={tool.accept}
          multiple={tool.multiple}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />

        {/* Top Breadcrumb Navigation */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-purple-300/80 mb-6">
          <div className="flex items-center gap-2">
            <button 
              onClick={onBack}
              className="hover:underline flex items-center gap-1.5 font-bold text-amber-400 hover:text-amber-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> All Tools
            </button>
            <span className="text-purple-500">/</span>
            <span className="capitalize text-purple-300">{tool.category.replace('-', ' ')}</span>
            <span className="text-purple-500">/</span>
            <span className="font-black text-white">{tool.name}</span>
          </div>

          {files.length > 0 && !result && (
            <button 
              onClick={() => setFiles([])}
              className="text-xs text-rose-400 hover:text-rose-300 hover:underline font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear Workspace
            </button>
          )}
        </div>

        {/* ERROR NOTICE */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold mb-0.5">Processing Alert</div>
              <div>{error}</div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* CASE 1: NO FILES UPLOADED YET (HERO UPLOAD ZONE)         */}
        {/* ======================================================== */}
        {!result && files.length === 0 && (
          <div className="max-w-4xl mx-auto space-y-6 pt-4">
            
            {/* Tool Header */}
            <div className="text-center max-w-2xl mx-auto mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-900/60 border border-purple-500/30 text-amber-300 text-xs font-bold mb-3 shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>100% Free & In-Browser Studio</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-['Outfit'] mb-3">
                {tool.name}
              </h1>
              <p className="text-sm sm:text-base text-purple-200/80">
                {tool.desc}
              </p>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-10 sm:p-20 text-center cursor-pointer transition-all duration-300 relative group overflow-hidden bg-white/[0.03] backdrop-blur-xl ${
                isDragging 
                  ? 'border-amber-400 bg-purple-900/50 scale-[1.01]' 
                  : 'border-purple-500/40 hover:border-amber-400/70 hover:bg-white/[0.06] shadow-2xl shadow-purple-950/60'
              }`}
            >
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-700 via-purple-600 to-pink-600 p-0.5 mx-auto flex items-center justify-center shadow-xl shadow-purple-900/60 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                <div className="w-full h-full bg-[#180433] rounded-[22px] flex items-center justify-center">
                  <CloudUpload className="w-10 h-10 text-amber-300" />
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white mb-2 font-['Outfit']">
                Select documents or drop them here
              </h3>
              <p className="text-xs sm:text-sm text-purple-300/80 mb-8">
                Accepted formats: <span className="font-mono font-semibold text-amber-300">{tool.accept.replace(/application\/[^,]+/g, '').replace(/,/g, ' ')}</span> (Max 100MB)
              </p>

              <button 
                type="button"
                className="px-8 py-4 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-purple-950 font-black text-sm sm:text-base shadow-xl shadow-amber-400/30 transition-all group-hover:scale-105"
              >
                Choose {tool.multiple ? 'Documents' : 'Document'}
              </button>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* CASE 2: FILES UPLOADED (I HATE PDF SIGNATURE STUDIO VIEW) */}
        {/* ======================================================== */}
        {!result && files.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-200">
            
            {/* 1. LEFT / CENTER: OBSIDIAN DOCUMENT CARDS CANVAS (8 COLUMNS) */}
            <div className="lg:col-span-8 bg-[#14032a]/90 backdrop-blur-2xl border border-purple-500/30 rounded-3xl p-6 sm:p-8 min-h-[500px] relative flex flex-col justify-between shadow-2xl shadow-purple-950/80">
              
              {tool.id === 'delete-pages' && pdfPages.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-purple-200/80 px-1">
                    <span>Click on pages to mark them for removal:</span>
                    <span className="font-bold text-amber-300">
                      Total {pdfPages.length} Pages
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-5">
                    {pdfPages.map((page) => {
                      const isDeleted = selectedDeleteSet.has(page.pageNumber);

                      return (
                        <div 
                          key={page.pageNumber}
                          onClick={() => toggleDeletePage(page.pageNumber)}
                          className={`group relative rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col cursor-pointer select-none ${
                            isDeleted 
                              ? 'bg-rose-950/60 border-rose-500 ring-2 ring-rose-500/80 shadow-2xl shadow-rose-950/90 scale-95 opacity-90' 
                              : 'bg-[#1b0638] border-purple-500/30 hover:border-amber-400/60 shadow-lg hover:shadow-2xl hover:shadow-purple-900/40 hover:-translate-y-1'
                          }`}
                        >
                          {/* Page Number Badge */}
                          <div className="absolute top-2.5 left-2.5 z-10">
                            <div className={`px-2 py-0.5 rounded-lg text-xs font-black shadow-md ${
                              isDeleted 
                                ? 'bg-rose-600 text-white' 
                                : 'bg-gradient-to-tr from-amber-400 to-yellow-400 text-purple-950'
                            }`}>
                              Page {page.pageNumber}
                            </div>
                          </div>

                          {/* Delete / Remove Toggle Button */}
                          <div className="absolute top-2.5 right-2.5 z-10">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); toggleDeletePage(page.pageNumber); }}
                              className={`p-1.5 rounded-lg shadow-md transition-all ${
                                isDeleted 
                                  ? 'bg-rose-600 text-white ring-2 ring-rose-400' 
                                  : 'bg-purple-950/90 text-purple-300 hover:text-rose-300 hover:bg-rose-950/80 border border-purple-600/40'
                              }`}
                              title={isDeleted ? 'Cancel Deletion' : 'Mark for Deletion'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Page Preview Canvas */}
                          <div className="w-full h-52 sm:h-56 bg-slate-900/60 flex items-center justify-center p-3 overflow-hidden border-b border-purple-900/40 relative">
                            <img 
                              src={page.dataUrl} 
                              alt={`Page ${page.pageNumber}`} 
                              className={`max-h-full max-w-full object-contain rounded-md shadow-md bg-white transition-opacity ${
                                isDeleted ? 'opacity-30 grayscale' : 'opacity-100'
                              }`} 
                            />
                            {/* Marked For Deletion Banner Overlay */}
                            {isDeleted && (
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-rose-950/70 backdrop-blur-[1px] p-2 text-center animate-in fade-in zoom-in-90 duration-150">
                                <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center mb-1.5 shadow-lg shadow-rose-600/50">
                                  <Trash2 className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-black text-rose-200 uppercase tracking-wider">
                                  Will Be Removed
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Page Status Footer */}
                          <div className={`p-2.5 text-center text-xs font-bold transition-colors ${
                            isDeleted ? 'bg-rose-950 text-rose-300' : 'bg-[#170533] text-purple-200'
                          }`}>
                            {isDeleted ? '❌ To be deleted' : `Page ${page.pageNumber}`}
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : ['split', 'extract-pages', 'pdf-to-jpg'].includes(tool.id) && pdfPages.length > 0 ? (
                /* 1B. EXTRACT PAGES / SPLIT / PDF TO JPG CANVAS: Individual PDF Page Cards */
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-purple-200/80 px-1">
                    <span>
                      {tool.id === 'pdf-to-jpg' 
                        ? 'Click pages to select (leave unselected to convert all pages to JPG):' 
                        : 'Click on pages to select them for extraction:'}
                    </span>
                    <span className="font-bold text-amber-300">
                      Total {pdfPages.length} Pages
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-5">
                    {pdfPages.map((page) => {
                      const isSelected = selectedExtractSet.has(page.pageNumber);

                      return (
                        <div 
                          key={page.pageNumber}
                          onClick={() => toggleExtractPage(page.pageNumber)}
                          className={`group relative rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col cursor-pointer select-none ${
                            isSelected 
                              ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/80 shadow-2xl shadow-amber-400/30 scale-100' 
                              : 'bg-[#1b0638] border-purple-500/30 hover:border-amber-400/60 shadow-lg hover:shadow-2xl hover:shadow-purple-900/40 hover:-translate-y-1 opacity-70 hover:opacity-100'
                          }`}
                        >
                          {/* Page Number Badge */}
                          <div className="absolute top-2.5 left-2.5 z-10">
                            <div className={`px-2 py-0.5 rounded-lg text-xs font-black shadow-md ${
                              isSelected 
                                ? 'bg-gradient-to-tr from-amber-400 to-yellow-400 text-purple-950' 
                                : 'bg-purple-900/90 text-purple-200 border border-purple-600/40'
                            }`}>
                              Page {page.pageNumber}
                            </div>
                          </div>

                          {/* Extract Selection Checkbox Toggle Button */}
                          <div className="absolute top-2.5 right-2.5 z-10">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); toggleExtractPage(page.pageNumber); }}
                              className={`w-7 h-7 rounded-lg shadow-md transition-all flex items-center justify-center ${
                                isSelected 
                                    ? 'bg-amber-400 text-purple-950 font-black ring-2 ring-amber-300' 
                                  : 'bg-purple-950/90 text-purple-400 hover:text-amber-300 hover:bg-purple-900/80 border border-purple-600/40'
                              }`}
                              title={isSelected ? 'Deselect Page' : 'Select Page'}
                            >
                              <Check className={`w-4 h-4 stroke-[3] ${isSelected ? 'text-purple-950' : 'text-purple-400'}`} />
                            </button>
                          </div>

                          {/* Page Preview Canvas */}
                          <div className="w-full h-52 sm:h-56 bg-slate-900/60 flex items-center justify-center p-3 overflow-hidden border-b border-purple-900/40 relative">
                            <img 
                              src={page.dataUrl} 
                              alt={`Page ${page.pageNumber}`} 
                              className={`max-h-full max-w-full object-contain rounded-md shadow-md bg-white transition-opacity ${
                                isSelected ? 'opacity-100' : 'opacity-60'
                              }`} 
                            />
                            {/* Selected Overlay Badge */}
                            {isSelected && (
                              <div className="absolute top-3 right-11 px-2.5 py-0.5 rounded-full bg-amber-400/90 text-purple-950 text-[10px] font-black tracking-wide shadow-md uppercase">
                                Selected
                              </div>
                            )}
                          </div>

                          {/* Page Status Footer */}
                          <div className={`p-2.5 text-center text-xs font-bold transition-colors ${
                            isSelected ? 'bg-amber-400/20 text-amber-300 border-t border-amber-400/30' : 'bg-[#170533] text-purple-300/70'
                          }`}>
                            {isSelected 
                              ? (tool.id === 'pdf-to-jpg' ? '✔ Convert to JPG' : '✔ Ready to Extract') 
                              : 'Click to select'}
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : tool.id === 'reorder-pages' && organizePages.length > 0 ? (
                /* 1C. ORGANIZE PDF STUDIO CANVAS: Page Reordering, Add Blank, Rotate, Delete */
                <div className="space-y-4">
                  {/* Top Action Ribbon */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-purple-950/70 border border-purple-800/40 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-300">
                        {organizePages.length} Pages
                      </span>
                      <span className="text-purple-500">|</span>
                      <span className="text-purple-300/80 hidden sm:inline">
                        Drag cards to reorder • Rotate & delete pages
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => addBlankPage('start')}
                        className="px-2.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-purple-600/40 text-purple-200 hover:text-white font-bold text-xs flex items-center gap-1 transition-all"
                        title="Add blank page at beginning"
                      >
                        <Plus className="w-3.5 h-3.5 text-amber-400" />
                        <span>+ Blank (Start)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => addBlankPage('end')}
                        className="px-2.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-purple-600/40 text-purple-200 hover:text-white font-bold text-xs flex items-center gap-1 transition-all"
                        title="Add blank page at end"
                      >
                        <Plus className="w-3.5 h-3.5 text-amber-400" />
                        <span>+ Blank (End)</span>
                      </button>

                      <button
                        type="button"
                        onClick={rotateAllOrganizePages}
                        className="px-2.5 py-1.5 rounded-xl bg-purple-900/80 hover:bg-purple-800 border border-purple-600/40 text-purple-200 hover:text-white font-bold text-xs flex items-center gap-1 transition-all"
                        title="Rotate all pages 90°"
                      >
                        <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                        <span>Rotate All</span>
                      </button>

                      <button
                        type="button"
                        onClick={resetOrganizePages}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center gap-1 transition-all"
                        title="Reset pages to original document"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Reset</span>
                      </button>
                    </div>
                  </div>

                  {/* Grid of Interactive Page Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-5">
                    {organizePages.map((item, idx) => {
                      const isBeingDragged = draggedOrganizeIdx === idx;

                      return (
                        <div 
                          key={item.id}
                          draggable={true}
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', idx.toString());
                            e.dataTransfer.effectAllowed = 'move';
                            setDraggedOrganizeIdx(idx);
                          }}
                          onDragOver={(e) => handleDragOverOrganizePage(e, idx)}
                          onDragEnd={() => {
                            setDraggedOrganizeIdx(null);
                          }}
                          className={`group relative bg-[#1b0638] rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col cursor-grab active:cursor-grabbing select-none ${
                            isBeingDragged 
                              ? 'scale-105 rotate-2 opacity-70 border-amber-400 ring-4 ring-amber-400/40 shadow-2xl shadow-amber-400/50 z-30' 
                              : 'border-purple-500/30 hover:border-amber-400/60 shadow-lg hover:shadow-2xl hover:shadow-purple-900/40 hover:-translate-y-1'
                          }`}
                        >
                          {/* Top-Left Page Sequence Badge */}
                          <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
                            <div className="px-2 py-0.5 rounded-lg bg-gradient-to-tr from-amber-400 to-yellow-400 text-purple-950 font-black text-xs shadow-md">
                              Page {idx + 1}
                            </div>
                            {item.type === 'blank' && (
                              <span className="px-1.5 py-0.5 rounded-md bg-purple-900/90 border border-purple-500/40 text-amber-300 text-[10px] font-bold">
                                Blank
                              </span>
                            )}
                          </div>

                          {/* Top-Right Control Buttons (Rotate & Delete) */}
                          <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
                            {item.type === 'page' && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); rotateOrganizePage(idx); }}
                                className="p-1.5 rounded-lg bg-purple-950/90 hover:bg-amber-400 hover:text-purple-950 text-amber-300 border border-purple-600/40 shadow-md transition-all hover:scale-105 active:scale-95"
                                title="Rotate page 90°"
                              >
                                <RotateCw className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); deleteOrganizePage(idx); }}
                              className="p-1.5 rounded-lg bg-purple-950/90 hover:bg-rose-900/90 text-rose-300 hover:text-rose-100 border border-rose-500/40 shadow-md transition-all hover:scale-105 active:scale-95"
                              title="Delete Page"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Page Thumbnail Canvas */}
                          <div className="w-full h-52 sm:h-56 bg-slate-900/60 flex items-center justify-center p-3 overflow-hidden border-b border-purple-900/40 relative">
                            {item.type === 'page' && item.dataUrl ? (
                              <img 
                                src={item.dataUrl} 
                                alt={`Page ${idx + 1}`} 
                                className="max-h-full max-w-full object-contain rounded-md shadow-md bg-white transition-transform duration-300 pointer-events-none" 
                                style={{ transform: `rotate(${item.rotation || 0}deg)` }}
                              />
                            ) : (
                              <div className="w-full h-full rounded-xl bg-white/[0.04] border-2 border-dashed border-purple-500/40 p-4 flex flex-col items-center justify-center text-center gap-2 pointer-events-none">
                                <FileText className="w-10 h-10 text-amber-400/70" />
                                <span className="text-xs font-bold text-purple-200 uppercase tracking-wider">Blank Page</span>
                              </div>
                            )}

                            {/* Rotation Angle Badge */}
                            {item.rotation && item.rotation > 0 ? (
                              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-purple-950/90 border border-amber-400/40 text-amber-300 text-[10px] font-black shadow-md">
                                ⟳ {item.rotation}°
                              </div>
                            ) : null}
                          </div>

                          {/* Card Footer: Add Blank Page Before / After */}
                          <div className="p-2 bg-[#170533] flex items-center justify-between text-[11px] text-purple-300/80">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); addBlankPage('before', idx); }}
                              className="px-2 py-1 rounded-lg hover:bg-white/[0.08] text-purple-300 hover:text-amber-300 font-semibold transition-colors flex items-center gap-1"
                              title="Add blank page before this page"
                            >
                              <Plus className="w-3 h-3 text-amber-400" />
                              <span>Before</span>
                            </button>

                            <span className="text-purple-600">|</span>

                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); addBlankPage('after', idx); }}
                              className="px-2 py-1 rounded-lg hover:bg-white/[0.08] text-purple-300 hover:text-amber-300 font-semibold transition-colors flex items-center gap-1"
                              title="Add blank page after this page"
                            >
                              <Plus className="w-3 h-3 text-amber-400" />
                              <span>After</span>
                            </button>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : ['scan-to-pdf', 'rotate', 'crop-pdf'].includes(tool.id) && scanPages.length > 0 ? (
                /* 1D. SCAN TO PDF & ROTATE PDF CANVAS: All Page Thumbnails & Degree Controls */
                <div className="space-y-4">
                  {/* Top Action Ribbon */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-purple-950/70 border border-purple-800/40 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-300">
                        {scanPages.length} Pages
                      </span>
                      <span className="text-purple-500">|</span>
                      <span className="text-purple-300/80 hidden sm:inline">
                        Rotate all pages or customize individual angles
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => rotateAllScanPages(90)}
                        className="px-2.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-purple-600/40 text-purple-200 hover:text-white font-bold text-xs flex items-center gap-1 transition-all"
                        title="Rotate all pages clockwise by 90°"
                      >
                        <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                        <span>+90° CW</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAllPagesToAngle(180)}
                        className="px-2.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-purple-600/40 text-purple-200 hover:text-white font-bold text-xs flex items-center gap-1 transition-all"
                        title="Flip all pages 180°"
                      >
                        <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                        <span>180° Flip</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAllPagesToAngle(270)}
                        className="px-2.5 py-1.5 rounded-xl bg-purple-900/80 hover:bg-purple-800 border border-purple-600/40 text-purple-200 hover:text-white font-bold text-xs flex items-center gap-1 transition-all"
                        title="Rotate 270° Counter-Clockwise"
                      >
                        <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                        <span>270° CCW</span>
                      </button>

                      <button
                        type="button"
                        onClick={resetScanPages}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center gap-1 transition-all"
                        title="Reset all rotations to 0°"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>0° Reset</span>
                      </button>
                    </div>
                  </div>

                  {/* Grid of Scan / Rotate Page Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-5">
                    {scanPages.map((page, idx) => (
                      <div 
                        key={page.pageNumber}
                        className="group relative bg-[#1b0638] rounded-2xl border border-purple-500/30 hover:border-amber-400/60 shadow-lg hover:shadow-2xl hover:shadow-purple-900/40 hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col select-none"
                      >
                        {/* Top-Left Page Sequence Badge */}
                        <div className="absolute top-2.5 left-2.5 z-10">
                          <div className="px-2 py-0.5 rounded-lg bg-gradient-to-tr from-amber-400 to-yellow-400 text-purple-950 font-black text-xs shadow-md">
                            Page {page.pageNumber}
                          </div>
                        </div>

                        {/* Top-Right Quick Rotate 90° Button */}
                        <div className="absolute top-2.5 right-2.5 z-10">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); rotateScanPage(idx); }}
                            className="p-1.5 rounded-lg bg-purple-950/90 hover:bg-amber-400 hover:text-purple-950 text-amber-300 border border-purple-600/40 shadow-md transition-all hover:scale-105 active:scale-95"
                            title="Rotate this page +90°"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Page Preview Canvas with Live CSS Rotation */}
                        <div className="w-full h-52 sm:h-56 bg-slate-900/60 flex items-center justify-center p-3 overflow-hidden border-b border-purple-900/40 relative">
                          <img 
                            src={page.dataUrl} 
                            alt={`Page ${page.pageNumber}`} 
                            className="max-h-full max-w-full object-contain rounded-md shadow-md bg-white transition-transform duration-300 pointer-events-none" 
                            style={{ transform: `rotate(${page.rotation || 0}deg)` }}
                          />

                          {/* Degree Badge Overlay */}
                          {page.rotation && page.rotation > 0 ? (
                            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-purple-950/90 border border-amber-400/40 text-amber-300 text-[10px] font-black shadow-md">
                              ⟳ {page.rotation}°
                            </div>
                          ) : null}
                        </div>

                        {/* Card Footer: Degree Quick Selector (0°, 90°, 180°, 270°) */}
                        <div className="p-2 bg-[#170533] grid grid-cols-4 gap-1 text-[10px] font-bold text-center">
                          {[
                            { deg: 0, label: '0°' },
                            { deg: 90, label: '90°' },
                            { deg: 180, label: '180°' },
                            { deg: 270, label: '270°' }
                          ].map(d => (
                            <button
                              key={d.deg}
                              type="button"
                              onClick={() => setPageSpecificRotation(idx, d.deg)}
                              className={`py-1 rounded-md transition-all ${
                                (page.rotation || 0) === d.deg
                                  ? 'bg-amber-400 text-purple-950 font-black shadow-xs'
                                  : 'bg-white/[0.04] text-purple-300/80 hover:bg-white/[0.1] hover:text-white'
                              }`}
                            >
                              {d.label}
                            </button>
                          ))}
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              ) : loadingPages ? (
                <div className="min-h-[300px] flex flex-col items-center justify-center gap-3 text-purple-300">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                  <span className="text-sm font-semibold">Extracting page thumbnails...</span>
                </div>
              ) : (
                /* 1D. STANDARD DOCUMENT CARDS CANVAS (e.g. Merge PDF / Single File) */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-5">
                  {files.map((file, idx) => {
                    const thumbKey = `${file.name}_${file.size}_${file.lastModified}`;
                    const thumbUrl = thumbnails[thumbKey];
                    const isBeingDragged = draggedIndex === idx;

                    return (
                      <div 
                        key={thumbKey + '_' + idx}
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', idx.toString());
                          e.dataTransfer.effectAllowed = 'move';
                          setDraggedIndex(idx);
                        }}
                        onDragOver={(e) => handleDragOverItem(e, idx)}
                        onDragEnd={() => {
                          setDraggedIndex(null);
                        }}
                        className={`group relative bg-[#1b0638] rounded-2xl border transition-all duration-300 ease-out transform overflow-hidden flex flex-col cursor-grab active:cursor-grabbing select-none ${
                          isBeingDragged 
                            ? 'scale-105 rotate-2 opacity-70 border-amber-400 ring-4 ring-amber-400/40 shadow-2xl shadow-amber-400/50 z-30' 
                            : 'border-purple-500/30 hover:border-amber-400/60 shadow-lg hover:shadow-2xl hover:shadow-purple-900/40 hover:-translate-y-1'
                        }`}
                      >
                        {/* Neon Index Badge (PDF No) */}
                        <div className="absolute top-2.5 left-2.5 z-10">
                          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-400 to-yellow-400 text-purple-950 font-black text-xs flex items-center justify-center shadow-md">
                            {idx + 1}
                          </div>
                        </div>

                        {/* Card Delete Control Only */}
                        <div className="absolute top-2.5 right-2.5 z-10">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                            className="p-1.5 rounded-lg bg-purple-950/90 hover:bg-rose-900/90 text-rose-300 hover:text-rose-100 border border-rose-500/40 shadow-md transition-all hover:scale-105 active:scale-95"
                            title="Delete Document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Document Preview Canvas / High-Res Thumbnail */}
                        <div className="w-full h-52 sm:h-56 bg-slate-900/60 flex items-center justify-center p-3 overflow-hidden border-b border-purple-900/40">
                          {thumbUrl ? (
                            <img 
                              src={thumbUrl} 
                              alt="PDF Preview" 
                              className="max-h-full max-w-full object-contain rounded-md shadow-md bg-white pointer-events-none" 
                            />
                          ) : (
                            <div className="w-full h-full rounded-lg bg-white/5 border border-white/10 p-4 flex flex-col justify-between shadow-xs pointer-events-none">
                              <div className="space-y-2">
                                <div className="h-2 w-3/4 bg-purple-500/20 rounded"></div>
                                <div className="h-1.5 w-full bg-purple-500/10 rounded"></div>
                                <div className="h-1.5 w-5/6 bg-purple-500/10 rounded"></div>
                                <div className="h-1.5 w-2/3 bg-purple-500/10 rounded"></div>
                              </div>
                              <div className="flex items-center justify-center">
                                <FileText className="w-10 h-10 text-rose-400" />
                              </div>
                              <div className="h-1.5 w-1/2 bg-purple-500/10 rounded self-center"></div>
                            </div>
                          )}
                        </div>

                        {/* File Meta Info */}
                        <div className="p-3 bg-[#170533]">
                          <div className="text-xs font-bold text-white truncate" title={file.name}>
                            {file.name}
                          </div>
                          <div className="text-[11px] text-purple-300/70 mt-0.5 font-medium">
                            {formatSize(file.size)}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

              {/* Floating Action Cluster: Add More (+) & A-Z Sort Buttons */}
              {tool.multiple && (
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20">
                  {/* Golden Amber Circular + Button with Count Badge */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-13 h-13 rounded-full bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-purple-950 shadow-xl shadow-amber-400/40 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 border-2 border-purple-950"
                      title="Add more files"
                    >
                      <Plus className="w-6 h-6 stroke-[3]" />
                    </button>
                    <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-purple-950 text-amber-300 text-[10px] font-black flex items-center justify-center border border-amber-400 shadow-md">
                      {files.length}
                    </span>
                  </div>

                  {/* Frosted Sort A-Z Button */}
                  <button
                    type="button"
                    onClick={toggleSort}
                    className="w-10 h-10 rounded-full bg-purple-900/80 hover:bg-purple-800 text-purple-200 hover:text-white shadow-md border border-purple-500/40 flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                    title="Sort files by name"
                  >
                    <ArrowUpDown className="w-4 h-4 text-amber-300" />
                  </button>
                </div>
              )}

            </div>

            {/* 2. RIGHT SIDEBAR: OBSIDIAN TOOL CONTROLS & MAIN ACTION (4 COLUMNS) */}
            <div className="lg:col-span-4 bg-[#160431]/95 backdrop-blur-3xl rounded-3xl border border-purple-500/30 p-6 sm:p-7 shadow-2xl shadow-purple-950/80 flex flex-col justify-between space-y-6">
              
              <div className="space-y-5">
                {/* Tool Title */}
                <div>
                  <h2 className="text-2xl font-black text-white font-['Outfit'] tracking-tight">
                    {tool.name}
                  </h2>
                  <p className="text-xs text-purple-300/80 mt-1">
                    {tool.desc}
                  </p>
                </div>

                {/* Informational Hint Notice */}
                <div className="p-3.5 rounded-2xl bg-purple-900/50 border border-purple-500/30 text-purple-200 text-xs flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    {tool.multiple 
                      ? 'Reorder your documents using the arrows or sort alphabetically before merging.'
                      : 'Configure your parameters below and click the action button to process.'
                    }
                  </span>
                </div>

                {/* DYNAMIC PARAMETERS IF APPLICABLE */}
                {tool.id === 'delete-pages' && (
                  <div className="space-y-3.5">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-purple-200">
                          Pages to Remove:
                        </label>
                        {selectedDeleteSet.size > 0 && (
                          <span className="text-[11px] font-black text-rose-400 bg-rose-950/60 border border-rose-500/30 px-2 py-0.5 rounded-full">
                            {selectedDeleteSet.size} marked
                          </span>
                        )}
                      </div>
                      <input 
                        type="text"
                        value={deletePagesStr}
                        onChange={(e) => handleManualDeleteInputChange(e.target.value)}
                        placeholder="Click pages or type e.g. 1, 3-5"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-purple-600/40 text-white text-xs font-medium focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-purple-300/80 mb-1.5">
                        Quick Selection:
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={selectOddPages}
                          className="py-2 px-2 rounded-xl text-xs font-bold bg-white/[0.06] hover:bg-white/[0.12] border border-purple-600/40 text-purple-200 transition-all text-center"
                        >
                          Odd Pages
                        </button>
                        <button
                          type="button"
                          onClick={selectEvenPages}
                          className="py-2 px-2 rounded-xl text-xs font-bold bg-white/[0.06] hover:bg-white/[0.12] border border-purple-600/40 text-purple-200 transition-all text-center"
                        >
                          Even Pages
                        </button>
                        <button
                          type="button"
                          onClick={clearDeleteSelection}
                          className="py-2 px-2 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 transition-all text-center"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    {pdfPages.length > 0 && (
                      <div className="p-3 rounded-2xl bg-purple-950/60 border border-purple-800/40 text-xs text-purple-300 flex items-center justify-between">
                        <span>Remaining Pages:</span>
                        <span className="font-bold text-amber-300 text-sm">
                          {Math.max(0, pdfPages.length - selectedDeleteSet.size)} / {pdfPages.length}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {['split', 'extract-pages'].includes(tool.id) && (
                  <div className="space-y-4">
                    {/* Extraction Mode Selector */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-purple-200">
                        Export Format:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setExtractMode('single')}
                          className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                            extractMode === 'single'
                              ? 'bg-amber-400/20 border-amber-400 text-amber-300 ring-1 ring-amber-400/60 shadow-lg'
                              : 'bg-white/[0.04] border-purple-600/40 text-purple-200 hover:bg-white/[0.08]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black">1 PDF Document</span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              extractMode === 'single' ? 'border-amber-400 bg-amber-400 text-purple-950' : 'border-purple-500'
                            }`}>
                              {extractMode === 'single' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                          </div>
                          <span className="text-[10px] text-purple-300/80 leading-tight">
                            Merge all pages into 1 file
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setExtractMode('separate')}
                          className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                            extractMode === 'separate'
                              ? 'bg-amber-400/20 border-amber-400 text-amber-300 ring-1 ring-amber-400/60 shadow-lg'
                              : 'bg-white/[0.04] border-purple-600/40 text-purple-200 hover:bg-white/[0.08]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black">Separate (.ZIP)</span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              extractMode === 'separate' ? 'border-amber-400 bg-amber-400 text-purple-950' : 'border-purple-500'
                            }`}>
                              {extractMode === 'separate' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                          </div>
                          <span className="text-[10px] text-purple-300/80 leading-tight">
                            Each page as separate PDF
                          </span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-purple-200">
                          Page Range to Extract:
                        </label>
                        {selectedExtractSet.size > 0 && (
                          <span className="text-[11px] font-black text-amber-300 bg-amber-400/20 border border-amber-400/30 px-2 py-0.5 rounded-full">
                            {selectedExtractSet.size} selected
                          </span>
                        )}
                      </div>
                      <input 
                        type="text"
                        value={splitRange}
                        onChange={(e) => handleManualExtractInputChange(e.target.value)}
                        placeholder="Click pages or type e.g. 1-3, 5, 8-10"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-purple-600/40 text-white text-xs font-medium focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-purple-300/80 mb-1.5">
                        Quick Selection:
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        <button
                          type="button"
                          onClick={selectAllExtractPages}
                          className="py-2 px-1 rounded-xl text-xs font-bold bg-white/[0.06] hover:bg-white/[0.12] border border-purple-600/40 text-purple-200 transition-all text-center"
                        >
                          All
                        </button>
                        <button
                          type="button"
                          onClick={selectOddExtractPages}
                          className="py-2 px-1 rounded-xl text-xs font-bold bg-white/[0.06] hover:bg-white/[0.12] border border-purple-600/40 text-purple-200 transition-all text-center"
                        >
                          Odd
                        </button>
                        <button
                          type="button"
                          onClick={selectEvenExtractPages}
                          className="py-2 px-1 rounded-xl text-xs font-bold bg-white/[0.06] hover:bg-white/[0.12] border border-purple-600/40 text-purple-200 transition-all text-center"
                        >
                          Even
                        </button>
                        <button
                          type="button"
                          onClick={clearExtractSelection}
                          className="py-2 px-1 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 transition-all text-center"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    {pdfPages.length > 0 && (
                      <div className="p-3 rounded-2xl bg-purple-950/60 border border-purple-800/40 text-xs text-purple-300 flex items-center justify-between">
                        <span>Selected to Extract:</span>
                        <span className="font-bold text-amber-300 text-sm">
                          {selectedExtractSet.size} / {pdfPages.length} pages
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {tool.id === 'pdf-to-jpg' && (
                  <div className="space-y-4">
                    {/* Image Quality / Resolution Selector */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-purple-200">
                        JPG Image Resolution:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setJpgQuality('high')}
                          className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                            jpgQuality === 'high'
                              ? 'bg-amber-400/20 border-amber-400 text-amber-300 ring-1 ring-amber-400/60 shadow-lg'
                              : 'bg-white/[0.04] border-purple-600/40 text-purple-200 hover:bg-white/[0.08]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black">Ultra HD (300 DPI)</span>
                            {jpgQuality === 'high' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                          </div>
                          <span className="text-[10px] text-purple-300/80 leading-tight">
                            95% Quality • Crisp clarity
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setJpgQuality('standard')}
                          className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                            jpgQuality === 'standard'
                              ? 'bg-amber-400/20 border-amber-400 text-amber-300 ring-1 ring-amber-400/60 shadow-lg'
                              : 'bg-white/[0.04] border-purple-600/40 text-purple-200 hover:bg-white/[0.08]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black">Standard (150 DPI)</span>
                            {jpgQuality === 'standard' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                          </div>
                          <span className="text-[10px] text-purple-300/80 leading-tight">
                            85% Quality • Compact size
                          </span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-purple-200">
                          Pages to Convert:
                        </label>
                        {selectedExtractSet.size > 0 && (
                          <span className="text-[11px] font-black text-amber-300 bg-amber-400/20 border border-amber-400/30 px-2 py-0.5 rounded-full">
                            {selectedExtractSet.size} selected
                          </span>
                        )}
                      </div>
                      <input 
                        type="text"
                        value={splitRange}
                        onChange={(e) => handleManualExtractInputChange(e.target.value)}
                        placeholder="Leave blank for ALL pages, or e.g. 1-3, 5"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-purple-600/40 text-white text-xs font-medium focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-purple-300/80 mb-1.5">
                        Quick Selection:
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        <button
                          type="button"
                          onClick={selectAllExtractPages}
                          className="py-2 px-1 rounded-xl text-xs font-bold bg-white/[0.06] hover:bg-white/[0.12] border border-purple-600/40 text-purple-200 transition-all text-center"
                        >
                          All
                        </button>
                        <button
                          type="button"
                          onClick={selectOddExtractPages}
                          className="py-2 px-1 rounded-xl text-xs font-bold bg-white/[0.06] hover:bg-white/[0.12] border border-purple-600/40 text-purple-200 transition-all text-center"
                        >
                          Odd
                        </button>
                        <button
                          type="button"
                          onClick={selectEvenExtractPages}
                          className="py-2 px-1 rounded-xl text-xs font-bold bg-white/[0.06] hover:bg-white/[0.12] border border-purple-600/40 text-purple-200 transition-all text-center"
                        >
                          Even
                        </button>
                        <button
                          type="button"
                          onClick={clearExtractSelection}
                          className="py-2 px-1 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 transition-all text-center"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    {pdfPages.length > 0 && (
                      <div className="p-3 rounded-2xl bg-purple-950/60 border border-purple-800/40 text-xs text-purple-300 flex items-center justify-between">
                        <span>Output Format:</span>
                        <span className="font-bold text-amber-300 text-xs">
                          {selectedExtractSet.size === 1 || (selectedExtractSet.size === 0 && pdfPages.length === 1) ? 'Single .JPG image' : 'All JPGs in .ZIP archive'}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {tool.id === 'reorder-pages' && (
                  <div className="space-y-4">
                    {/* Real-time Summary Card */}
                    <div className="p-3.5 rounded-2xl bg-purple-950/60 border border-purple-800/40 space-y-2">
                      <div className="text-xs font-bold text-amber-300 mb-1">
                        Layout Statistics:
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04]">
                          <span className="text-purple-300">Total Pages:</span>
                          <span className="font-bold text-white">{organizePages.length}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04]">
                          <span className="text-purple-300">Blank Pages:</span>
                          <span className="font-bold text-amber-300">{organizePages.filter(p => p.type === 'blank').length}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] col-span-2">
                          <span className="text-purple-300">Rotated Pages:</span>
                          <span className="font-bold text-purple-200">{organizePages.filter(p => p.rotation && p.rotation > 0).length}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Add Blank Section */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-purple-200">
                        Add Blank Page:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => addBlankPage('start')}
                          className="py-2.5 px-3 rounded-xl text-xs font-bold bg-white/[0.06] hover:bg-white/[0.12] border border-purple-600/40 text-purple-200 hover:text-white transition-all flex items-center justify-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5 text-amber-400" />
                          <span>At Start</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => addBlankPage('end')}
                          className="py-2.5 px-3 rounded-xl text-xs font-bold bg-white/[0.06] hover:bg-white/[0.12] border border-purple-600/40 text-purple-200 hover:text-white transition-all flex items-center justify-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5 text-amber-400" />
                          <span>At End</span>
                        </button>
                      </div>
                    </div>

                    {/* Batch Actions */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-purple-200">
                        Batch Page Controls:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={rotateAllOrganizePages}
                          className="py-2.5 px-2 rounded-xl text-xs font-bold bg-purple-900/80 hover:bg-purple-800 border border-purple-600/40 text-purple-200 hover:text-white transition-all flex items-center justify-center gap-1"
                        >
                          <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                          <span>Rotate 90°</span>
                        </button>
                        <button
                          type="button"
                          onClick={resetOrganizePages}
                          className="py-2.5 px-2 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 transition-all flex items-center justify-center gap-1"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Reset All</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {['rotate', 'crop-pdf', 'scan-to-pdf'].includes(tool.id) && (
                  <div className="space-y-4">
                    {/* Real-time Summary Card */}
                    {scanPages.length > 0 && (
                      <div className="p-3.5 rounded-2xl bg-purple-950/60 border border-purple-800/40 space-y-2">
                        <div className="text-xs font-bold text-amber-300 mb-1">
                          Document Overview:
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04]">
                            <span className="text-purple-300">Total Pages:</span>
                            <span className="font-bold text-white">{scanPages.length}</span>
                          </div>
                          <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04]">
                            <span className="text-purple-300">Rotated:</span>
                            <span className="font-bold text-amber-300">{scanPages.filter(p => p.rotation && p.rotation > 0).length}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Degree Selection */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-purple-200">
                        Rotation Degree for All Pages:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { angle: 0, label: '0° Normal', desc: 'Default orientation' },
                          { angle: 90, label: '90° CW', desc: 'Clockwise rotation' },
                          { angle: 180, label: '180° Flip', desc: 'Upside down' },
                          { angle: 270, label: '270° CCW', desc: 'Counter-clockwise' },
                        ].map(opt => (
                          <button
                            key={opt.angle}
                            type="button"
                            onClick={() => setAllPagesToAngle(opt.angle)}
                            className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                              rotateAngle === opt.angle 
                                ? 'bg-amber-400/20 border-amber-400 text-amber-300 ring-1 ring-amber-400/60 shadow-md' 
                                : 'bg-white/[0.04] text-purple-200 border-purple-600/40 hover:bg-white/[0.08]'
                            }`}
                          >
                            <div className="text-xs font-bold flex items-center justify-between">
                              <span>{opt.label}</span>
                              {rotateAngle === opt.angle && <Check className="w-3 h-3 text-amber-400" />}
                            </div>
                            <div className="text-[10px] text-purple-300/70 mt-0.5">{opt.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Batch Actions */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-purple-200">
                        Quick Batch Controls:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => rotateAllScanPages(90)}
                          className="py-2.5 px-2 rounded-xl text-xs font-bold bg-purple-900/80 hover:bg-purple-800 border border-purple-600/40 text-purple-200 hover:text-white transition-all flex items-center justify-center gap-1.5"
                        >
                          <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                          <span>Rotate +90°</span>
                        </button>
                        <button
                          type="button"
                          onClick={resetScanPages}
                          className="py-2.5 px-2 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 transition-all flex items-center justify-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Reset 0°</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {['page-numbers', 'header-footer'].includes(tool.id) && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-purple-200">
                      Number Placement:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'bottom-center', label: 'Bottom Center' },
                        { id: 'bottom-right', label: 'Bottom Right' },
                        { id: 'top-right', label: 'Top Right' },
                      ].map(pos => (
                        <button
                          key={pos.id}
                          type="button"
                          onClick={() => setPageNumberPos(pos.id)}
                          className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all ${
                            pageNumberPos === pos.id 
                              ? 'bg-amber-400 text-purple-950 border-amber-400 shadow-md' 
                              : 'bg-white/[0.06] text-purple-200 border-purple-600/40 hover:bg-white/[0.12]'
                          }`}
                        >
                          {pos.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {tool.id === 'watermark-pdf' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-purple-200 mb-1">
                        Watermark Text:
                      </label>
                      <input 
                        type="text"
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        placeholder="CONFIDENTIAL"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-purple-600/40 text-white text-xs font-medium focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-purple-200 mb-1">
                        Opacity: {Math.round(watermarkOpacity * 100)}%
                      </label>
                      <input 
                        type="range"
                        min="0.1"
                        max="0.9"
                        step="0.05"
                        value={watermarkOpacity}
                        onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                        className="w-full accent-amber-400"
                      />
                    </div>
                  </div>
                )}

                {['compress', 'repair-pdf'].includes(tool.id) && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-purple-200">
                      Compression Quality:
                    </label>
                    <div className="space-y-2">
                      {[
                        { id: 'low', name: 'Low Compression', desc: 'High quality, ~15% smaller' },
                        { id: 'recommended', name: 'Recommended', desc: 'Good quality, ~35% smaller' },
                        { id: 'extreme', name: 'Extreme', desc: 'Max compression, ~55% smaller' },
                      ].map(lvl => (
                        <div
                          key={lvl.id}
                          onClick={() => setCompressLevel(lvl.id)}
                          className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                            compressLevel === lvl.id 
                              ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-md' 
                              : 'bg-white/[0.04] border-purple-600/40 text-purple-200 hover:bg-white/[0.08]'
                          }`}
                        >
                          <div className="text-xs font-bold">{lvl.name}</div>
                          <div className="text-[10px] text-purple-300/70">{lvl.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tool.id === 'ocr-pdf' && (
                  <div className="space-y-4">
                    {/* Recognition Language */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-purple-200">
                        Document OCR Language:
                      </label>
                      <select
                        value={ocrLanguage}
                        onChange={(e) => setOcrLanguage(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14032a] border border-purple-600/40 text-white text-xs font-semibold focus:outline-none focus:border-amber-400"
                      >
                        <option value="English">English (Standard)</option>
                        <option value="Spanish">Spanish (Español)</option>
                        <option value="French">French (Français)</option>
                        <option value="German">German (Deutsch)</option>
                        <option value="Hindi">Hindi (हिंदी)</option>
                        <option value="Chinese">Chinese (中文)</option>
                        <option value="Japanese">Japanese (日本語)</option>
                        <option value="Auto">Auto-Detect Multilingual</option>
                      </select>
                    </div>

                    {/* OCR Output Format */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-purple-200">
                        OCR Output Format:
                      </label>
                      <div className="space-y-2">
                        {[
                          { id: 'searchable-pdf', name: 'Searchable PDF (.pdf)', desc: 'Embeds searchable & selectable text layer over PDF' },
                          { id: 'docx', name: 'Editable Word (.docx)', desc: 'Converts recognized text into an editable Word doc' },
                          { id: 'txt', name: 'Plain Text (.txt)', desc: 'Extracts clean raw text content' },
                        ].map(fmt => (
                          <div
                            key={fmt.id}
                            onClick={() => setOcrFormat(fmt.id)}
                            className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                              ocrFormat === fmt.id 
                                ? 'bg-amber-400/20 border-amber-400 text-amber-300 ring-1 ring-amber-400/60 shadow-md' 
                                : 'bg-white/[0.04] border-purple-600/40 text-purple-200 hover:bg-white/[0.08]'
                            }`}
                          >
                            <div className="text-xs font-bold flex items-center justify-between">
                              <span>{fmt.name}</span>
                              {ocrFormat === fmt.id && <Check className="w-3.5 h-3.5 text-amber-400" />}
                            </div>
                            <div className="text-[10px] text-purple-300/70 mt-0.5">{fmt.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* OCR Recognition Accuracy */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-purple-200">
                        Recognition Precision:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setOcrAccuracy('enhanced')}
                          className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                            ocrAccuracy === 'enhanced'
                              ? 'bg-amber-400 text-purple-950 border-amber-400 shadow-md'
                              : 'bg-white/[0.06] text-purple-200 border-purple-600/40 hover:bg-white/[0.12]'
                          }`}
                        >
                          Enhanced (High)
                        </button>
                        <button
                          type="button"
                          onClick={() => setOcrAccuracy('standard')}
                          className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                            ocrAccuracy === 'standard'
                              ? 'bg-amber-400 text-purple-950 border-amber-400 shadow-md'
                              : 'bg-white/[0.06] text-purple-200 border-purple-600/40 hover:bg-white/[0.12]'
                          }`}
                        >
                          Standard (Fast)
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {['protect-pdf', 'unlock-pdf'].includes(tool.id) && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-purple-200">
                      Password:
                    </label>
                    <input 
                      type="password"
                      value={protectPassword}
                      onChange={(e) => setProtectPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-purple-600/40 text-white text-xs font-medium focus:outline-none focus:border-amber-400"
                    />
                  </div>
                )}

              </div>

              {/* SIGNATURE GOLDEN AMBER ACTION CTA BUTTON */}
              <div className="pt-4 border-t border-purple-800/60 space-y-3">
                <button
                  type="button"
                  onClick={processTool}
                  disabled={processing}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-purple-950 font-black text-base sm:text-lg shadow-xl shadow-amber-400/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-3"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing ({progress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 fill-purple-950" />
                      <span>{tool.actionLabel}</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] text-purple-300/70">
                  🔒 In-Browser SSL Processing • Encrypted 7-Day Vault
                </p>
              </div>

            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* CASE 3: DOWNLOAD & SUCCESS SCREEN                        */}
        {/* ======================================================== */}
        {result && (
          <div className="bg-[#180436]/95 backdrop-blur-3xl rounded-3xl p-8 sm:p-14 border border-purple-500/30 shadow-2xl text-center max-w-2xl mx-auto animate-in zoom-in-95 duration-300">
            
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500 text-white mx-auto flex items-center justify-center shadow-xl shadow-emerald-500/30 mb-6">
              <Check className="w-8 h-8 sm:w-10 sm:h-10 stroke-[3]" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 font-['Outfit']">
              Your document is ready!
            </h2>
            <p className="text-xs sm:text-sm text-purple-200/80 mb-8">
              Processed with 100% precision in I HATE PDF Studio.
            </p>

            <div className="p-4 rounded-2xl bg-purple-950/60 border border-purple-700/40 mb-8 text-left flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-800 text-amber-300 flex items-center justify-center font-bold text-xs">
                  {result.filename.split('.').pop()?.toUpperCase()}
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-white">{result.filename}</div>
                  <div className="text-[11px] text-purple-300">{formatSize(result.size || result.newSize)}</div>
                </div>
              </div>

              {result.savedPercent && (
                <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 rounded-full">
                  {result.savedPercent}% smaller
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleDownload}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-purple-950 font-black text-sm sm:text-base shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                <span>Download File</span>
              </button>

              <button
                type="button"
                onClick={() => { setResult(null); setFiles([]); }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-purple-500/40 text-purple-200 font-bold text-xs sm:text-sm hover:bg-white/[0.08] transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Process Another</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
