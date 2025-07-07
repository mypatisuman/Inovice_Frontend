import { useState, useEffect, useCallback } from 'react';
import { customerApi, Customer } from '@/lib/api';

interface UseCustomersReturn {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Customer | null>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<Customer | null>;
  deleteCustomer: (id: string) => Promise<boolean>;
  searchCustomers: (query: string) => Promise<Customer[]>;
}

export function useCustomers(): UseCustomersReturn {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await customerApi.getAll();
      
      if (response.error) {
        setError(response.error);
        return;
      }
      
      setCustomers(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  }, []);

  const createCustomer = useCallback(async (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      const response = await customerApi.create(customer);
      
      if (response.error) {
        setError(response.error);
        return null;
      }
      
      if (response.data) {
        setCustomers(prev => [...prev, response.data!]);
      }
      
      return response.data || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create customer');
      return null;
    }
  }, []);

  const updateCustomer = useCallback(async (id: string, customer: Partial<Customer>) => {
    try {
      setError(null);
      const response = await customerApi.update(id, customer);
      
      if (response.error) {
        setError(response.error);
        return null;
      }
      
      if (response.data) {
        setCustomers(prev => prev.map(cust => cust.id === id ? response.data! : cust));
      }
      
      return response.data || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update customer');
      return null;
    }
  }, []);

  const deleteCustomer = useCallback(async (id: string) => {
    try {
      setError(null);
      const response = await customerApi.delete(id);
      
      if (response.error) {
        setError(response.error);
        return false;
      }
      
      setCustomers(prev => prev.filter(cust => cust.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete customer');
      return false;
    }
  }, []);

  const searchCustomers = useCallback(async (query: string) => {
    try {
      setError(null);
      const response = await customerApi.search(query);
      
      if (response.error) {
        setError(response.error);
        return [];
      }
      
      return response.data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search customers');
      return [];
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return {
    customers,
    loading,
    error,
    refetch: fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    searchCustomers,
  };
} 