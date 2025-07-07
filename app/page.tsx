"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, Download, Eye, Search, Calendar, DollarSign, Loader2, AlertCircle } from "lucide-react"
import { PdfInfoPanel } from "@/components/pdf-info-panel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InvoiceAnalytics } from "@/components/invoice-analytics"
import { useInvoices } from "@/hooks/useInvoices"
import { Invoice, formatCurrency, formatDate, getInvoiceStatusColor, customerApi, invoiceApi } from "@/lib/api"
import { getDefaultUserId } from "@/lib/user-utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import PdfViewer from "@/components/PdfViewer"
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import * as XLSX from 'xlsx'

export default function PDFInvoiceViewer() {
  const { 
    invoices, 
    loading, 
    error, 
    refetch, 
    createInvoice, 
    updateInvoice, 
    deleteInvoice,
    searchInvoices 
  } = useInvoices()

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [dragActive, setDragActive] = useState(false)
  const [searchResults, setSearchResults] = useState<Invoice[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('pdf')
  const pdfContentRef = useRef<HTMLDivElement>(null)
  const pdfRef = useRef<HTMLDivElement>(null)
  const detailsRef = useRef<HTMLDivElement>(null)
  const analyticsRef = useRef<HTMLDivElement>(null)

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;
    console.log('🔄 Starting PDF upload process...');
    setUploadError(null); // Clear any previous errors
    
    const userId = await getDefaultUserId();
    console.log('👤 User ID:', userId);

    Array.from(files).forEach(async (file) => {
      if (file.type === "application/pdf") {
        console.log('📄 Processing PDF file:', file.name, 'Size:', file.size, 'bytes');
        
        const formData = new FormData();
        formData.append("file", file);
        formData.append("userId", userId);

        try {
          console.log('🚀 Sending PDF to backend...');
          const response = await fetch('http://localhost:8080/api/invoices/upload-pdf', {
            method: "POST",
            body: formData,
          });
          
          console.log('📡 Backend response status:', response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Backend error response:', errorText);
            const errorMessage = `Upload failed: ${response.status} - ${errorText}`;
            setUploadError(errorMessage);
            throw new Error(errorMessage);
          }
          
          const invoice = await response.json();
          console.log('✅ PDF processed successfully! Invoice data:', invoice);
          
          setSelectedInvoice(invoice);
          console.log('📋 Invoice selected for display');
          
          await refetch(); // Refresh the invoice list
          console.log('🔄 Invoice list refreshed');
          
        } catch (error) {
          console.error('❌ Error uploading PDF:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown upload error';
          setUploadError(errorMessage);
        }
      } else {
        console.warn('⚠️ File is not a PDF:', file.type);
        setUploadError('Please select a valid PDF file');
      }
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFileUpload(e.dataTransfer.files)
  }

  // Handle search
  useEffect(() => {
    const handleSearch = async () => {
      if (searchTerm.trim()) {
        setIsSearching(true)
        const results = await searchInvoices(searchTerm)
        setSearchResults(results)
        setIsSearching(false)
      } else {
        setSearchResults([])
      }
    }

    const timeoutId = setTimeout(handleSearch, 500)
    return () => clearTimeout(timeoutId)
  }, [searchTerm, searchInvoices])

  const displayInvoices = searchTerm.trim() ? searchResults : invoices

  const totalAmount = invoices.reduce((sum, invoice) => {
    return sum + invoice.totalAmount
  }, 0)

  const pendingCount = invoices.filter((i) => i.status === "SENT").length
  const overdueCount = invoices.filter((i) => i.status === "OVERDUE").length

  const handleFullscreen = () => {
    let target: HTMLDivElement | null = null
    if (activeTab === 'pdf') target = pdfRef.current
    else if (activeTab === 'details') target = detailsRef.current
    else if (activeTab === 'analytics') target = analyticsRef.current
    if (target && target.requestFullscreen) {
      target.requestFullscreen()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoice Manager</h1>
          <p className="text-gray-600">Upload, view, and manage your invoices</p>
        </div>

        {error && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {uploadError && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}

        {/* API Test Component - Remove this after testing */}
        <div className="mb-6">
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : invoices.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : formatCurrency(totalAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : pendingCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : overdueCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Upload Invoice</CardTitle>
                <CardDescription>Drag and drop PDF files or click to browse</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 mb-2">Drop PDF files here or click to browse</p>
                  <Input
                    type="file"
                    accept=".pdf"
                    multiple
                    className="hidden"
                    id="file-upload"
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                  <Button variant="outline" onClick={() => document.getElementById("file-upload")?.click()}>
                    Browse Files
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Invoice List</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2 text-sm text-gray-600">Loading invoices...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {displayInvoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedInvoice?.id === invoice.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedInvoice(invoice)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm truncate">{invoice.invoiceNumber}</h4>
                          <Badge className={getInvoiceStatusColor(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">{invoice.customer.name}</p>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{formatCurrency(invoice.totalAmount)}</span>
                          <span>Due: {formatDate(invoice.dueDate)}</span>
                        </div>
                      </div>
                    ))}
                    {displayInvoices.length === 0 && !isSearching && (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                        <p className="text-sm">No invoices found</p>
                      </div>
                    )}
                    {isSearching && (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="ml-2 text-sm text-gray-600">Searching...</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {selectedInvoice ? selectedInvoice.invoiceNumber : "Select an Invoice"}
                    </CardTitle>
                    {selectedInvoice && (
                      <CardDescription>
                        {selectedInvoice.customer.name} • {formatCurrency(selectedInvoice.totalAmount)} • Due: {formatDate(selectedInvoice.dueDate)}
                      </CardDescription>
                    )}
                  </div>
                  {selectedInvoice && (
                    <div className="flex gap-2 mb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={activeTab === 'pdf' && !document.querySelector('iframe[src^="blob:"]')}
                        onClick={async () => {
                          if (activeTab === 'pdf') {
                            // Use the blob URL from the iframe
                            const iframe = document.querySelector('iframe[src^="blob:"]');
                            if (iframe) {
                              const blobUrl = iframe.getAttribute('src');
                              if (blobUrl) {
                                const link = document.createElement('a');
                                link.href = blobUrl;
                                link.download = `${selectedInvoice.invoiceNumber || 'invoice'}.pdf`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }
                            }
                          } else if (activeTab === 'details') {
                            const input = pdfContentRef.current;
                            if (input) {
                              const canvas = await html2canvas(input);
                              const imgData = canvas.toDataURL('image/png');
                              const pdf = new jsPDF({
                                orientation: 'portrait',
                                unit: 'pt',
                                format: [canvas.width, canvas.height]
                              });
                              pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                              pdf.save(`${selectedInvoice.invoiceNumber || 'invoice'}.pdf`);
                            }
                          } else if (activeTab === 'analytics') {
                            const worksheet = XLSX.utils.json_to_sheet([selectedInvoice]);
                            const workbook = XLSX.utils.book_new();
                            XLSX.utils.book_append_sheet(workbook, worksheet, 'Analytics');
                            XLSX.writeFile(workbook, `${selectedInvoice.invoiceNumber || 'analytics'}.xlsx`);
                          }
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleFullscreen}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Full Screen
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to delete this invoice?')) {
                            const success = await deleteInvoice(selectedInvoice.id)
                            if (success) {
                              setSelectedInvoice(null)
                              refetch()
                            } else {
                              alert('Failed to delete invoice.')
                            }
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="h-[600px]">
                {selectedInvoice ? (
                  <Tabs defaultValue="pdf" className="h-full" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="pdf">PDF Viewer</TabsTrigger>
                      <TabsTrigger value="details">Invoice Details</TabsTrigger>
                      <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    </TabsList>
                    <TabsContent value="pdf" className="h-[calc(100%-40px)] mt-4">
                      <div ref={pdfRef} className="w-full h-full border rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                        {selectedInvoice ? (
                          <PdfViewer invoiceId={selectedInvoice.id} onPdfUrl={setPdfUrl} />
                        ) : (
                          <div className="text-center text-gray-500">
                            <FileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                            <p className="text-lg font-medium mb-2">PDF Viewer</p>
                            <p className="text-sm">PDF viewing functionality will be implemented here</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    <TabsContent value="details" className="h-[calc(100%-40px)] mt-4 overflow-y-auto">
                      <div ref={detailsRef}>
                        <PdfInfoPanel selectedInvoice={selectedInvoice} onEdit={() => console.log("Edit invoice info")} />
                      </div>
                    </TabsContent>
                    <TabsContent value="analytics" className="h-[calc(100%-40px)] mt-4 overflow-y-auto">
                      <div ref={analyticsRef}>
                        <InvoiceAnalytics selectedInvoice={selectedInvoice} allInvoices={invoices} />
                      </div>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <FileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                      <p className="text-lg font-medium mb-2">No Invoice Selected</p>
                      <p className="text-sm">Select an invoice from the list to view it here</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

