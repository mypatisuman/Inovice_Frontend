import { useState, useEffect, useCallback } from 'react';
import { paymentApi, Payment } from '@/lib/api';

interface UsePaymentsReturn {
  payments: Payment[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createPayment: (payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Payment | null>;
  updatePayment: (id: string, payment: Partial<Payment>) => Promise<Payment | null>;
  deletePayment: (id: string) => Promise<boolean>;
  getPaymentsByInvoice: (invoiceId: string) => Promise<Payment[]>;
  getTotalPaidAmount: (invoiceId: string) => Promise<number>;
  searchPayments: (query: string) => Promise<Payment[]>;
}

export function usePayments(): UsePaymentsReturn {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await paymentApi.getAll();
      
      if (response.error) {
        setError(response.error);
        return;
      }
      
      setPayments(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  }, []);

  const createPayment = useCallback(async (payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      const response = await paymentApi.create(payment);
      
      if (response.error) {
        setError(response.error);
        return null;
      }
      
      if (response.data) {
        setPayments(prev => [...prev, response.data!]);
      }
      
      return response.data || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create payment');
      return null;
    }
  }, []);

  const updatePayment = useCallback(async (id: string, payment: Partial<Payment>) => {
    try {
      setError(null);
      const response = await paymentApi.update(id, payment);
      
      if (response.error) {
        setError(response.error);
        return null;
      }
      
      if (response.data) {
        setPayments(prev => prev.map(pay => pay.id === id ? response.data! : pay));
      }
      
      return response.data || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update payment');
      return null;
    }
  }, []);

  const deletePayment = useCallback(async (id: string) => {
    try {
      setError(null);
      const response = await paymentApi.delete(id);
      
      if (response.error) {
        setError(response.error);
        return false;
      }
      
      setPayments(prev => prev.filter(pay => pay.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete payment');
      return false;
    }
  }, []);

  const getPaymentsByInvoice = useCallback(async (invoiceId: string) => {
    try {
      setError(null);
      const response = await paymentApi.getByInvoice(invoiceId);
      
      if (response.error) {
        setError(response.error);
        return [];
      }
      
      return response.data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payments for invoice');
      return [];
    }
  }, []);

  const getTotalPaidAmount = useCallback(async (invoiceId: string) => {
    try {
      setError(null);
      const response = await paymentApi.getTotalPaidAmount(invoiceId);
      
      if (response.error) {
        setError(response.error);
        return 0;
      }
      
      return response.data || 0;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get total paid amount');
      return 0;
    }
  }, []);

  const searchPayments = useCallback(async (query: string) => {
    try {
      setError(null);
      const response = await paymentApi.search(query);
      
      if (response.error) {
        setError(response.error);
        return [];
      }
      
      return response.data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search payments');
      return [];
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    payments,
    loading,
    error,
    refetch: fetchPayments,
    createPayment,
    updatePayment,
    deletePayment,
    getPaymentsByInvoice,
    getTotalPaidAmount,
    searchPayments,
  };
} 