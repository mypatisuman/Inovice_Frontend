import { useState, useEffect, useCallback } from 'react';
import { productApi, Product } from '@/lib/api';

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Product | null>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<Product | null>;
  deleteProduct: (id: string) => Promise<boolean>;
  searchProducts: (query: string) => Promise<Product[]>;
}

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productApi.getAll();
      
      if (response.error) {
        setError(response.error);
        return;
      }
      
      setProducts(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = useCallback(async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      const response = await productApi.create(product);
      
      if (response.error) {
        setError(response.error);
        return null;
      }
      
      if (response.data) {
        setProducts(prev => [...prev, response.data!]);
      }
      
      return response.data || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
      return null;
    }
  }, []);

  const updateProduct = useCallback(async (id: string, product: Partial<Product>) => {
    try {
      setError(null);
      const response = await productApi.update(id, product);
      
      if (response.error) {
        setError(response.error);
        return null;
      }
      
      if (response.data) {
        setProducts(prev => prev.map(prod => prod.id === id ? response.data! : prod));
      }
      
      return response.data || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
      return null;
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      setError(null);
      const response = await productApi.delete(id);
      
      if (response.error) {
        setError(response.error);
        return false;
      }
      
      setProducts(prev => prev.filter(prod => prod.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      return false;
    }
  }, []);

  const searchProducts = useCallback(async (query: string) => {
    try {
      setError(null);
      const response = await productApi.search(query);
      
      if (response.error) {
        setError(response.error);
        return [];
      }
      
      return response.data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search products');
      return [];
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
  };
} 