"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Calendar, DollarSign, User, Hash, MapPin, Phone, Mail, Edit } from "lucide-react"
import { Invoice, formatCurrency, formatDate, getInvoiceStatusColor } from "@/lib/api"
import { useEffect, useState } from "react"

interface PdfInfoPanelProps {
  selectedInvoice: Invoice
  onEdit?: () => void
}

export function PdfInfoPanel({ selectedInvoice, onEdit }: PdfInfoPanelProps) {
  console.log('📊 Rendering Invoice Details Panel with data:', selectedInvoice);
  
  if (!selectedInvoice) {
    console.log('⚠️ No invoice selected for details panel');
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium mb-2">No Invoice Selected</p>
            <p className="text-sm">Select an invoice to view details</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  console.log('📋 Invoice Details - Number:', selectedInvoice.invoiceNumber);
  console.log('👤 Customer:', selectedInvoice.customer?.name);
  console.log('💰 Total Amount:', selectedInvoice.totalAmount);
  console.log('📦 Items Count:', selectedInvoice.items?.length || 0);
  
  // Add detailed debugging for the full invoice object
  console.log('🔍 Full Invoice Object:', JSON.stringify(selectedInvoice, null, 2));
  console.log('🔍 Customer Object:', JSON.stringify(selectedInvoice.customer, null, 2));
  console.log('🔍 Items Array:', JSON.stringify(selectedInvoice.items, null, 2));

  const getStatusColor = (status: string) => {
    return getInvoiceStatusColor(status)
  }

  return (
    <div className="space-y-6">
      {/* Invoice Header */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Hash className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">Invoice Number</span>
          </div>
          <p className="font-semibold">{selectedInvoice.invoiceNumber}</p>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className={getStatusColor(selectedInvoice.status)}>{selectedInvoice.status}</Badge>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">Issue Date</span>
          </div>
          <p>{formatDate(selectedInvoice.issueDate)}</p>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">Due Date</span>
          </div>
          <p>{formatDate(selectedInvoice.dueDate)}</p>
        </div>
      </div>

      {/* Client & Vendor Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
            Bill To
          </h3>
          <div className="space-y-2 text-sm">
            <p className="font-medium">{selectedInvoice.customer.name}</p>
            <div className="flex items-start gap-2">
              <MapPin className="h-3 w-3 text-gray-500 mt-1 flex-shrink-0" />
              <p className="text-gray-600 whitespace-pre-line">
                {selectedInvoice.customer.address}
                {selectedInvoice.customer.city && `, ${selectedInvoice.customer.city}`}
                {selectedInvoice.customer.state && `, ${selectedInvoice.customer.state}`}
                {selectedInvoice.customer.postalCode && ` ${selectedInvoice.customer.postalCode}`}
              </p>
            </div>
            {selectedInvoice.customer.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3 text-gray-500" />
                <p className="text-gray-600">{selectedInvoice.customer.email}</p>
              </div>
            )}
            {selectedInvoice.customer.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3 text-gray-500" />
                <p className="text-gray-600">{selectedInvoice.customer.phone}</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <User className="h-4 w-4 text-green-600" />
            From
          </h3>
          <div className="space-y-2 text-sm">
            <p className="font-medium">Your Company Name</p>
            <div className="flex items-start gap-2">
              <MapPin className="h-3 w-3 text-gray-500 mt-1 flex-shrink-0" />
              <p className="text-gray-600 whitespace-pre-line">456 Vendor Ave\nBusiness City, BC 12345</p>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-3 w-3 text-gray-500" />
              <p className="text-gray-600">billing@yourcompany.com</p>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3 text-gray-500" />
              <p className="text-gray-600">+1 (555) 987-6543</p>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div>
        <h3 className="font-semibold mb-3">Items</h3>
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 grid grid-cols-12 gap-2 text-sm font-medium text-gray-600">
            <div className="col-span-6">Description</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-2 text-right">Rate</div>
            <div className="col-span-2 text-right">Amount</div>
          </div>
          {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
            selectedInvoice.items.map((item, index) => (
              <div key={index} className="px-4 py-3 grid grid-cols-12 gap-2 text-sm border-t">
                <div className="col-span-6">{item.description}</div>
                <div className="col-span-2 text-center">{item.quantity}</div>
                <div className="col-span-2 text-right">{formatCurrency(item.unitPrice)}</div>
                <div className="col-span-2 text-right font-medium">{formatCurrency(item.amount)}</div>
              </div>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-gray-500">
              <p className="text-sm">No items added to this invoice</p>
            </div>
          )}
        </div>
      </div>

      {/* Totals */}
      <div className="border rounded-lg p-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span>{formatCurrency(selectedInvoice.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax:</span>
            <span>{formatCurrency(selectedInvoice.taxAmount)}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              Total:
            </span>
            <span className="text-lg">{formatCurrency(selectedInvoice.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {selectedInvoice.notes && (
        <div>
          <h4 className="font-medium mb-2">Notes</h4>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{selectedInvoice.notes}</p>
        </div>
      )}

      {/* Edit Button */}
      <div className="flex justify-end pt-4 border-t">
        <Button variant="outline" onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Invoice Details
        </Button>
      </div>
    </div>
  )
}
