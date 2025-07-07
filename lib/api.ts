// API Base Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Types matching your backend DTOs
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer extends BaseEntity {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  userId: string;
}

export interface Product extends BaseEntity {
  name: string;
  description: string;
  price: number;
  taxRate: number;
  userId: string;
}

export interface InvoiceItem extends BaseEntity {
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  amount: number;
  invoiceId: string;
  product?: Product;
}

export interface Invoice extends BaseEntity {
  invoiceNumber: string;
  customerId: string;
  customer: Customer;
  issueDate: string;
  dueDate: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes: string;
  userId: string;
  items: InvoiceItem[];
}

export interface Payment extends BaseEntity {
  invoiceId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber: string;
  notes: string;
  userId: string;
  invoice?: Invoice;
}

export interface User extends BaseEntity {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  emailVerified: boolean;
  provider: string;
  providerId: string;
}

export interface UserSettings extends BaseEntity {
  userId: string;
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  taxId: string;
  currency: string;
  dateFormat: string;
  timeZone: string;
  logoUrl: string;
}

// API Response wrapper
interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Generic API client
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    console.log('🌐 API Request:', options.method || 'GET', url);
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      console.log('📡 API Response Status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
        console.error('❌ API Error:', errorMessage);
        throw new Error(errorMessage);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('✅ API Response Data:', data);
        return { data };
      } else {
        // Handle non-JSON responses (like string responses)
        const textData = await response.text();
        console.log('✅ API Response Text:', textData);
        return { data: textData as any };
      }
    } catch (error) {
      console.error('❌ API Request Error:', error);
      return { 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      };
    }
  }

  // Generic CRUD methods
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete(endpoint: string): Promise<ApiResponse<void>> {
    return this.request<void>(endpoint, { method: 'DELETE' });
  }
}

// Create API client instance
const apiClient = new ApiClient(API_BASE_URL);

// Invoice API
export const invoiceApi = {
  getAll: () => apiClient.get<Invoice[]>('/invoices'),
  getById: (id: string) => apiClient.get<Invoice>(`/invoices/${id}`),
  create: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => 
    apiClient.post<Invoice>('/invoices', invoice),
  update: (id: string, invoice: Partial<Invoice>) => 
    apiClient.put<Invoice>(`/invoices/${id}`, invoice),
  delete: (id: string) => apiClient.delete(`/invoices/${id}`),
  getByStatus: (status: string) => apiClient.get<Invoice[]>(`/invoices/status/${status}`),
  getByDateRange: (startDate: string, endDate: string) => 
    apiClient.get<Invoice[]>(`/invoices/date-range?startDate=${startDate}&endDate=${endDate}`),
  search: (query: string) => apiClient.get<Invoice[]>(`/invoices/search?query=${encodeURIComponent(query)}`),
  generateInvoiceNumber: () => apiClient.get<string>('/invoices/generate-invoice-number'),
  fetchPdf: (id: string) =>
    fetch(`${API_BASE_URL.replace(/\/$/, "")}/invoices/${id}/pdf`).then(res => {
      if (!res.ok) throw new Error("Failed to fetch PDF");
      return res.blob();
    }),
  uploadPdf: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${API_BASE_URL.replace(/\/$/, "")}/invoices/${id}/pdf`, {
      method: 'POST',
      body: formData,
    }).then(res => {
      if (!res.ok) throw new Error('Failed to upload PDF');
      return res.json();
    });
  },
};

// Customer API
export const customerApi = {
  getAll: () => apiClient.get<Customer[]>('/customers'),
  getById: (id: string) => apiClient.get<Customer>(`/customers/${id}`),
  create: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => 
    apiClient.post<Customer>('/customers', customer),
  update: (id: string, customer: Partial<Customer>) => 
    apiClient.put<Customer>(`/customers/${id}`, customer),
  delete: (id: string) => apiClient.delete(`/customers/${id}`),
  search: (query: string) => apiClient.get<Customer[]>(`/customers/search?query=${encodeURIComponent(query)}`),
};

// Product API
export const productApi = {
  getAll: () => apiClient.get<Product[]>('/products'),
  getById: (id: string) => apiClient.get<Product>(`/products/${id}`),
  create: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => 
    apiClient.post<Product>('/products', product),
  update: (id: string, product: Partial<Product>) => 
    apiClient.put<Product>(`/products/${id}`, product),
  delete: (id: string) => apiClient.delete(`/products/${id}`),
  search: (query: string) => apiClient.get<Product[]>(`/products/search?query=${encodeURIComponent(query)}`),
};

// Payment API
export const paymentApi = {
  getAll: () => apiClient.get<Payment[]>('/payments'),
  getById: (id: string) => apiClient.get<Payment>(`/payments/${id}`),
  getByInvoice: (invoiceId: string) => apiClient.get<Payment[]>(`/payments/invoice/${invoiceId}`),
  create: (payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => 
    apiClient.post<Payment>('/payments', payment),
  update: (id: string, payment: Partial<Payment>) => 
    apiClient.put<Payment>(`/payments/${id}`, payment),
  delete: (id: string) => apiClient.delete(`/payments/${id}`),
  getByDateRange: (startDate: string, endDate: string) => 
    apiClient.get<Payment[]>(`/payments/date-range?startDate=${startDate}&endDate=${endDate}`),
  search: (query: string) => apiClient.get<Payment[]>(`/payments/search?query=${encodeURIComponent(query)}`),
  getTotalPaidAmount: (invoiceId: string) => apiClient.get<number>(`/payments/total-paid/${invoiceId}`),
};

// User API
export const userApi = {
  getAll: () => apiClient.get<User[]>('/users'),
  getById: (id: string) => apiClient.get<User>(`/users/${id}`),
  create: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => 
    apiClient.post<User>('/users', user),
  update: (id: string, user: Partial<User>) => 
    apiClient.put<User>(`/users/${id}`, user),
  delete: (id: string) => apiClient.delete(`/users/${id}`),
};

// User Settings API
export const userSettingsApi = {
  getByUserId: (userId: string) => apiClient.get<UserSettings>(`/user-settings/${userId}`),
  create: (userId: string, settings: Omit<UserSettings, 'id' | 'createdAt' | 'updatedAt'>) => 
    apiClient.post<UserSettings>(`/user-settings/${userId}`, settings),
  update: (userId: string, settings: Partial<UserSettings>) => 
    apiClient.put<UserSettings>(`/user-settings/${userId}`, settings),
  delete: (userId: string) => apiClient.delete(`/user-settings/${userId}`),
};

// Utility functions
export const formatCurrency = (amount: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getInvoiceStatusColor = (status: string) => {
  switch (status) {
    case 'PAID':
      return 'bg-green-100 text-green-800';
    case 'SENT':
      return 'bg-blue-100 text-blue-800';
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800';
    case 'OVERDUE':
      return 'bg-red-100 text-red-800';
    case 'CANCELLED':
      return 'bg-gray-100 text-gray-600';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}; 