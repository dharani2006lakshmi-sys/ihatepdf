export const TOOL_CATEGORIES = [
  { id: 'all', name: 'All Tools' },
  { id: 'organize', name: 'Organize PDF' },
  { id: 'optimize', name: 'Optimize PDF' },
  { id: 'to-pdf', name: 'Convert to PDF' },
  { id: 'from-pdf', name: 'Convert from PDF' },
  { id: 'edit', name: 'Edit PDF' },
  { id: 'security', name: 'PDF Security' },
  { id: 'ai', name: 'PDF Intelligence' }
];

export const CLASSIFIED_MENU_DATA = {
  organize: {
    title: 'ORGANIZE PDF',
    color: '#e11d48',
    tools: [
      { id: 'merge', name: 'Merge PDF', iconText: 'MERGE', iconType: 'layers', color: '#e11d48', bg: '#ffe4e6', desc: 'Combine PDFs in the order you want' },
      { id: 'split', name: 'Split PDF', iconText: 'SPLIT', iconType: 'scissors', color: '#ea580c', bg: '#ffedd5', desc: 'Separate one page or whole set' },
      { id: 'delete-pages', name: 'Remove pages', iconText: 'REMOVE', iconType: 'trash', color: '#ef4444', bg: '#fee2e2', desc: 'Delete unwanted pages' },
      { id: 'extract-pages', name: 'Extract pages', iconText: 'EXTRACT', iconType: 'file-minus', color: '#f97316', bg: '#ffedd5', desc: 'Export selected pages' },
      { id: 'reorder-pages', name: 'Organize PDF', iconText: 'SORT', iconType: 'grip', color: '#ea580c', bg: '#ffedd5', desc: 'Sort, add & delete pages' },
      { id: 'scan-to-pdf', name: 'Scan to PDF', iconText: 'SCAN', iconType: 'scan', color: '#f43f5e', bg: '#ffe4e6', desc: 'Capture docs from scanner or mobile' }
    ]
  },
  optimize: {
    title: 'OPTIMIZE PDF',
    color: '#16a34a',
    tools: [
      { id: 'compress', name: 'Compress PDF', iconText: 'COMPRESS', iconType: 'compress', color: '#16a34a', bg: '#dcfce7', desc: 'Reduce file size while optimizing quality' },
      { id: 'repair-pdf', name: 'Repair PDF', iconText: 'REPAIR', iconType: 'wrench', color: '#15803d', bg: '#dcfce7', desc: 'Recover damaged or corrupted PDF files' },
      { id: 'ocr-pdf', name: 'OCR PDF', iconText: 'OCR', iconType: 'scan-text', color: '#16a34a', bg: '#dcfce7', desc: 'Convert scanned PDF to searchable text' }
    ]
  },
  toPdf: {
    title: 'CONVERT TO PDF',
    color: '#2563eb',
    tools: [
      { id: 'jpg-to-pdf', name: 'JPG to PDF', iconText: 'JPG', iconType: 'image', color: '#eab308', bg: '#fef9c3', desc: 'Convert JPG, PNG images to PDF' },
      { id: 'word-to-pdf', name: 'WORD to PDF', iconText: 'W', iconType: 'word', color: '#2563eb', bg: '#dbeafe', desc: 'Make DOC and DOCX easy to view' },
      { id: 'ppt-to-pdf', name: 'POWERPOINT to PDF', iconText: 'P', iconType: 'ppt', color: '#ea580c', bg: '#ffedd5', desc: 'Make PPT and PPTX into PDF' },
      { id: 'excel-to-pdf', name: 'EXCEL to PDF', iconText: 'X', iconType: 'excel', color: '#16a34a', bg: '#dcfce7', desc: 'Make EXCEL spreadsheets PDF' },
      { id: 'html-to-pdf', name: 'HTML to PDF', iconText: 'HTML', iconType: 'globe', color: '#eab308', bg: '#fef9c3', desc: 'Convert web pages to PDF' },
      { id: 'md-to-pdf', name: 'Markdown to PDF', iconText: 'MD', iconType: 'ai-md', color: '#6366f1', bg: '#e0e7ff', desc: 'Convert Markdown docs to clean PDF' }
    ]
  },
  fromPdf: {
    title: 'CONVERT FROM PDF',
    color: '#0284c7',
    tools: [
      { id: 'pdf-to-jpg', name: 'PDF to JPG', iconText: 'JPG', iconType: 'image', color: '#eab308', bg: '#fef9c3', desc: 'Extract images or save each page' },
      { id: 'pdf-to-word', name: 'PDF to WORD', iconText: 'W', iconType: 'word', color: '#2563eb', bg: '#dbeafe', desc: 'Convert to editable DOC & DOCX' },
      { id: 'pdf-to-ppt', name: 'PDF to POWERPOINT', iconText: 'P', iconType: 'ppt', color: '#ea580c', bg: '#ffedd5', desc: 'Turn PDF files into PPT slideshows' },
      { id: 'pdf-to-excel', name: 'PDF to EXCEL', iconText: 'X', iconType: 'excel', color: '#16a34a', bg: '#dcfce7', desc: 'Pull data straight into Excel' },
      { id: 'pdf-to-pdfa', name: 'PDF to PDF/A', iconText: 'A', iconType: 'archive', color: '#0284c7', bg: '#e0f2fe', desc: 'Convert to ISO archiving standard' }
    ]
  },
  editPdf: {
    title: 'EDIT PDF',
    color: '#9333ea',
    tools: [
      { id: 'rotate', name: 'Rotate PDF', iconText: 'ROTATE', iconType: 'rotate', color: '#9333ea', bg: '#f3e8ff', desc: 'Rotate your PDF pages' },
      { id: 'page-numbers', name: 'Add page numbers', iconText: '1 2 3', iconType: 'numbers', color: '#9333ea', bg: '#f3e8ff', desc: 'Add page numbers with ease' },
      { id: 'watermark-pdf', name: 'Add watermark', iconText: 'STAMP', iconType: 'stamp', color: '#a855f7', bg: '#f3e8ff', desc: 'Stamp an image or text over PDF' },
      { id: 'crop-pdf', name: 'Crop PDF', iconText: 'CROP', iconType: 'crop', color: '#c026d3', bg: '#fae8ff', desc: 'Trim document margins & canvas' },
      { id: 'edit-pdf', name: 'Edit PDF', iconText: 'EDIT', iconType: 'edit', color: '#db2777', bg: '#fce7f3', desc: 'Add text, images, shapes & draw' },
      { id: 'flatten-pdf', name: 'PDF Forms', iconText: 'FORM', iconType: 'form', color: '#9333ea', bg: '#f3e8ff', desc: 'Fill out and sign PDF forms' },
      { id: 'header-footer', name: 'Header & Footer', iconText: 'HEAD', iconType: 'numbers', color: '#7c3aed', bg: '#ede9fe', desc: 'Add custom header or footer' }
    ]
  },
  security: {
    title: 'PDF SECURITY',
    color: '#0284c7',
    tools: [
      { id: 'unlock-pdf', name: 'Unlock PDF', iconText: 'UNLOCK', iconType: 'unlock', color: '#0284c7', bg: '#e0f2fe', desc: 'Remove PDF password & security' },
      { id: 'protect-pdf', name: 'Protect PDF', iconText: 'LOCK', iconType: 'protect', color: '#0369a1', bg: '#e0f2fe', desc: 'Encrypt PDF with a strong password' },
      { id: 'sign-pdf', name: 'Sign PDF', iconText: 'SIGN', iconType: 'sign', color: '#0284c7', bg: '#e0f2fe', desc: 'Sign yourself or request signatures' },
      { id: 'redact-pdf', name: 'Redact PDF', iconText: 'REDACT', iconType: 'redact', color: '#0f172a', bg: '#e2e8f0', desc: 'Black out sensitive information' },
      { id: 'compare-pdf', name: 'Compare PDF', iconText: 'DIFF', iconType: 'compare', color: '#0284c7', bg: '#e0f2fe', desc: 'Show visual differences side-by-side' }
    ]
  },
  aiIntelligence: {
    title: 'PDF INTELLIGENCE',
    color: '#6366f1',
    tools: [
      { id: 'ai-summary', name: 'AI Summarizer', iconText: 'AI', iconType: 'ai-sparkle', color: '#6366f1', bg: '#e0e7ff', desc: 'Get key insights & summaries' },
      { id: 'ai-translate', name: 'Translate PDF', iconText: 'LANG', iconType: 'ai-translate', color: '#4f46e5', bg: '#e0e7ff', desc: 'Translate documents to 50+ languages' },
      { id: 'pdf-to-md', name: 'PDF to Markdown', iconText: 'MD', iconType: 'ai-md', color: '#4338ca', bg: '#e0e7ff', desc: 'Clean Markdown for LLMs & notes' }
    ]
  }
};

export const ALL_TOOLS_LIST = [
  ...CLASSIFIED_MENU_DATA.organize.tools.map(t => ({ ...t, category: 'organize', accept: '.pdf,application/pdf', multiple: t.id === 'merge', actionLabel: t.name, hasOptions: ['split', 'delete-pages', 'extract-pages'].includes(t.id), optionsType: t.id })),
  ...CLASSIFIED_MENU_DATA.optimize.tools.map(t => ({ ...t, category: 'optimize', accept: '.pdf,application/pdf', multiple: false, actionLabel: t.name, hasOptions: t.id === 'compress', optionsType: 'compress' })),
  ...CLASSIFIED_MENU_DATA.toPdf.tools.map(t => ({ ...t, category: 'to-pdf', accept: t.id === 'jpg-to-pdf' ? 'image/*' : t.id === 'word-to-pdf' ? '.doc,.docx' : t.id === 'excel-to-pdf' ? '.xls,.xlsx' : t.id === 'ppt-to-pdf' ? '.ppt,.pptx' : t.id === 'md-to-pdf' ? '.md,.txt' : '.html,.htm', multiple: t.id === 'jpg-to-pdf', actionLabel: t.name, hasOptions: false })),
  ...CLASSIFIED_MENU_DATA.fromPdf.tools.map(t => ({ ...t, category: 'from-pdf', accept: '.pdf,application/pdf', multiple: false, actionLabel: t.name, hasOptions: false })),
  ...CLASSIFIED_MENU_DATA.editPdf.tools.map(t => ({ ...t, category: 'edit', accept: '.pdf,application/pdf', multiple: false, actionLabel: t.name, hasOptions: ['rotate', 'page-numbers', 'watermark-pdf', 'header-footer'].includes(t.id), optionsType: t.id === 'rotate' ? 'rotate' : t.id === 'watermark-pdf' ? 'watermark' : 'page-numbers' })),
  ...CLASSIFIED_MENU_DATA.security.tools.map(t => ({ ...t, category: 'security', accept: '.pdf,application/pdf', multiple: t.id === 'compare-pdf', actionLabel: t.name, hasOptions: ['protect-pdf', 'unlock-pdf'].includes(t.id) })),
  ...CLASSIFIED_MENU_DATA.aiIntelligence.tools.map(t => ({ ...t, category: 'ai', accept: '.pdf,application/pdf', multiple: false, actionLabel: t.name, hasOptions: false }))
];
