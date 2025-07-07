import { useState, useEffect, useCallback } from 'react';
import { invoiceApi, Invoice } from '@/lib/api';

interface UseInvoicesReturn {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Invoice | null>;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => Promise<Invoice | null>;
  deleteInvoice: (id: string) => Promise<boolean>;
  searchInvoices: (query: string) => Promise<Invoice[]>;
  getInvoicesByStatus: (status: string) => Promise<Invoice[]>;
  getInvoicesByDateRange: (startDate: string, endDate: string) => Promise<Invoice[]>;
}

export function useInvoices(): UseInvoicesReturn {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    try {
      console.log('🔄 Fetching invoices from backend...');
      setLoading(true);
      setError(null);
      const response = await invoiceApi.getAll();
      
      if (response.error) {
        console.error('❌ Error fetching invoices:', response.error);
        setError(response.error);
        return;
      }
      
      console.log('✅ Invoices fetched successfully:', response.data?.length || 0, 'invoices');
      setInvoices(response.data || []);
    } catch (err) {
      console.error('❌ Exception fetching invoices:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  }, []);

  const createInvoice = useCallback(async (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('➕ Creating new invoice:', invoice.invoiceNumber);
      setError(null);
      const response = await invoiceApi.create(invoice);
      
      if (response.error) {
        console.error('❌ Error creating invoice:', response.error);
        setError(response.error);
        return null;
      }
      
      if (response.data) {
        console.log('✅ Invoice created successfully:', response.data.id);
        setInvoices(prev => [...prev, response.data!]);
      }
      
      return response.data || null;
    } catch (err) {
      console.error('❌ Exception creating invoice:', err);
      setError(err instanceof Error ? err.message : 'Failed to create invoice');
      return null;
    }
  }, []);

  const updateInvoice = useCallback(async (id: string, invoice: Partial<Invoice>) => {
    try {
      setError(null);
      const response = await invoiceApi.update(id, invoice);
      
      if (response.error) {
        setError(response.error);
        return null;
      }
      
      if (response.data) {
        setInvoices(prev => prev.map(inv => inv.id === id ? response.data! : inv));
      }
      
      return response.data || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update invoice');
      return null;
    }
  }, []);

  const deleteInvoice = useCallback(async (id: string) => {
    try {
      console.log('🗑️ Deleting invoice:', id);
      setError(null);
      const response = await invoiceApi.delete(id);
      
      if (response.error) {
        console.error('❌ Error deleting invoice:', response.error);
        setError(response.error);
        return false;
      }
      
      console.log('✅ Invoice deleted successfully:', id);
      setInvoices(prev => prev.filter(inv => inv.id !== id));
      return true;
    } catch (err) {
      console.error('❌ Exception deleting invoice:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete invoice');
      return false;
    }
  }, []);

  const searchInvoices = useCallback(async (query: string) => {
    try {
      setError(null);
      const response = await invoiceApi.search(query);
      
      if (response.error) {
        setError(response.error);
        return [];
      }
      
      return response.data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search invoices');
      return [];
    }
  }, []);

  const getInvoicesByStatus = useCallback(async (status: string) => {
    try {
      setError(null);
      const response = await invoiceApi.getByStatus(status);
      
      if (response.error) {
        setError(response.error);
        return [];
      }
      
      return response.data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invoices by status');
      return [];
    }
  }, []);

  const getInvoicesByDateRange = useCallback(async (startDate: string, endDate: string) => {
    try {
      setError(null);
      const response = await invoiceApi.getByDateRange(startDate, endDate);
      
      if (response.error) {
        setError(response.error);
        return [];
      }
      
      return response.data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invoices by date range');
      return [];
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return {
    invoices,
    loading,
    error,
    refetch: fetchInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    searchInvoices,
    getInvoicesByStatus,
    getInvoicesByDateRange,
  };
} 