// High-Performance Client-Side PDF Thumbnail Generator using pdfjs-dist

import * as pdfjsLib from 'pdfjs-dist';
// Set up worker using unpkg / cdnjs or local module
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.0.379'}/pdf.worker.min.mjs`;

const thumbnailCache = new Map();

export async function generatePdfThumbnail(file) {
  if (!file) return null;
  const cacheKey = `${file.name}_${file.size}_${file.lastModified}`;
  if (thumbnailCache.has(cacheKey)) {
    return thumbnailCache.get(cacheKey);
  }

  // If file is an image
  if (file.type.startsWith('image/')) {
    const url = URL.createObjectURL(file);
    thumbnailCache.set(cacheKey, url);
    return url;
  }

  // If not PDF (e.g. docx, xlsx, pptx)
  if (!file.name.endsWith('.pdf') && file.type !== 'application/pdf') {
    return null;
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 0.5 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    thumbnailCache.set(cacheKey, dataUrl);
    return dataUrl;
  } catch (err) {
    console.warn('PDF thumbnail generation fallback:', err);
    return null;
  }
}

export async function generatePdfAllPages(file) {
  if (!file) return [];
  const cacheKey = `${file.name}_${file.size}_${file.lastModified}_all_pages`;
  if (thumbnailCache.has(cacheKey)) {
    return thumbnailCache.get(cacheKey);
  }

  if (!file.name.endsWith('.pdf') && file.type !== 'application/pdf') {
    return [];
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const count = pdf.numPages;
    const pageItems = [];

    for (let i = 1; i <= count; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 0.4 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      pageItems.push({
        pageNumber: i,
        dataUrl: canvas.toDataURL('image/jpeg', 0.8)
      });
    }

    thumbnailCache.set(cacheKey, pageItems);
    return pageItems;
  } catch (err) {
    console.warn('PDF all pages thumbnail generation fallback:', err);
    return [];
  }
}

