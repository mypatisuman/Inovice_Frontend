"use client";
import { useEffect, useState } from "react";
import { invoiceApi } from "@/lib/api";

export default function PdfViewer({ invoiceId, onPdfUrl }: { invoiceId: string, onPdfUrl?: (url: string | null) => void }) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('[PdfViewer] invoiceId:', invoiceId);
    if (!invoiceId) {
      console.log('[PdfViewer] No invoiceId provided.');
      return;
    }
    console.log('[PdfViewer] Loading PDF for invoice:', invoiceId);
    setIsLoading(true);
    setError(null);
    if (onPdfUrl) onPdfUrl(null);
    
    invoiceApi.fetchPdf(invoiceId)
      .then(blob => {
        console.log('[PdfViewer] PDF blob received, size:', blob.size, 'bytes');
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        setIsLoading(false);
        if (onPdfUrl) onPdfUrl(url);
        console.log('[PdfViewer] PDF URL created:', url);
      })
      .catch((err) => {
        console.error('[PdfViewer] Error loading PDF:', err);
        setError(`Failed to load PDF: ${err.message}`);
        setPdfUrl(null);
        setIsLoading(false);
        if (onPdfUrl) onPdfUrl(null);
      });
  }, [invoiceId]);

  // Cleanup URL on unmount
  useEffect(() => {
    console.log('[PdfViewer] pdfUrl state changed:', pdfUrl);
    return () => {
      if (pdfUrl) {
        console.log('[PdfViewer] Cleaning up PDF URL:', pdfUrl);
        URL.revokeObjectURL(pdfUrl);
        if (onPdfUrl) onPdfUrl(null);
      }
    };
  }, [pdfUrl]);

  if (isLoading) {
    console.log('[PdfViewer] Loading...');
    return <div className="flex items-center justify-center h-full">Loading PDF...</div>;
  }
  if (error) {
    console.log('[PdfViewer] Error:', error);
    return <div className="flex items-center justify-center h-full text-red-500">Error: {error}</div>;
  }
  if (!pdfUrl) {
    console.log('[PdfViewer] No PDF available');
    return <div className="flex items-center justify-center h-full text-gray-500">No PDF available</div>;
  }

  console.log('[PdfViewer] Rendering iframe with pdfUrl:', pdfUrl);
  return (
    <div className="w-full h-full">
      <iframe 
        src={pdfUrl} 
        className="w-full h-full border-0"
        title="PDF Viewer"
        onError={() => setError('Failed to load PDF')}
      />
    </div>
  );
} 