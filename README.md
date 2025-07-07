# Invoice Management System

A modern invoice management application built with Next.js frontend and Spring Boot backend.

## 🚀 Features

- **Invoice Management**: Create, view, edit, and delete invoices
- **Customer Management**: Manage customer information
- **Product Catalog**: Track products and services
- **Payment Tracking**: Monitor payment status and history
- **Real-time Search**: Search invoices, customers, and products
- **Analytics Dashboard**: View business insights and metrics
- **Responsive Design**: Works on desktop and mobile devices

## 🏗️ Architecture

### Frontend (Next.js 15)
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Hooks with custom API hooks
- **Icons**: Lucide React

### Backend (Spring Boot)
- **Framework**: Spring Boot 3.x
- **Language**: Java 17+
- **Database**: MySQL
- **API Documentation**: Swagger/OpenAPI
- **Security**: CORS configured for frontend integration

## 📋 Prerequisites

- **Node.js** 18+ and **pnpm** (or npm/yarn)
- **Java** 17+ and **Maven**
- **MySQL** 8.0+
- **Git**

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd invoiceui-main
```

### 2. Backend Setup

#### Database Configuration
1. Create a MySQL database:
```sql
CREATE DATABASE invoice_db;
```

2. Update `application.yml` in your Spring Boot project:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/invoice_db?useSSL=false&serverTimezone=UTC
    username: your_username
    password: your_password
```

#### Start the Backend
```bash
# Navigate to your Spring Boot project directory
cd ../backend

# Run the application
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080`

### 3. Frontend Setup

#### Install Dependencies
```bash
# Install pnpm if not already installed
npm install -g pnpm

# Install project dependencies
pnpm install
```

#### Environment Configuration
Create a `.env.local` file in the root directory:
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# Development Configuration
NEXT_PUBLIC_APP_ENV=development
```

#### Start the Development Server
```bash
pnpm dev
```

The frontend will start on `http://localhost:3000`

## 🔧 API Integration

The frontend is fully integrated with the Spring Boot backend through:

### API Service Layer (`lib/api.ts`)
- Generic API client with error handling
- Type-safe API calls matching backend DTOs
- Centralized configuration

### Custom Hooks
- `useInvoices()` - Invoice management
- `useCustomers()` - Customer management
- `useProducts()` - Product catalog
- `usePayments()` - Payment tracking

### Key Features
- **Real-time Data**: Automatic data fetching and updates
- **Error Handling**: Comprehensive error states and user feedback
- **Loading States**: Loading indicators for better UX
- **Search**: Real-time search with debouncing
- **Type Safety**: Full TypeScript integration

## 📊 Available API Endpoints

### Invoices
- `GET /api/invoices` - Get all invoices
- `GET /api/invoices/{id}` - Get invoice by ID
- `POST /api/invoices` - Create new invoice
- `PUT /api/invoices/{id}` - Update invoice
- `DELETE /api/invoices/{id}` - Delete invoice
- `GET /api/invoices/status/{status}` - Get invoices by status
- `GET /api/invoices/search?query={query}` - Search invoices
- `GET /api/invoices/generate-invoice-number` - Generate invoice number

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/{id}` - Get customer by ID
- `POST /api/customers` - Create new customer
- `PUT /api/customers/{id}` - Update customer
- `DELETE /api/customers/{id}` - Delete customer
- `GET /api/customers/search?query={query}` - Search customers

### Products
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product
- `GET /api/products/search?query={query}` - Search products

### Payments
- `GET /api/payments` - Get all payments
- `GET /api/payments/{id}` - Get payment by ID
- `POST /api/payments` - Create new payment
- `PUT /api/payments/{id}` - Update payment
- `DELETE /api/payments/{id}` - Delete payment
- `GET /api/payments/invoice/{invoiceId}` - Get payments by invoice
- `GET /api/payments/total-paid/{invoiceId}` - Get total paid amount

## 🎨 UI Components

The application uses shadcn/ui components for a consistent and modern design:

- **Cards**: Information display and organization
- **Buttons**: Actions and navigation
- **Forms**: Data input and validation
- **Tables**: Data presentation
- **Charts**: Analytics and visualizations
- **Modals**: Overlays and dialogs
- **Alerts**: Notifications and feedback

## 🔍 Development

### Project Structure
```
invoiceui-main/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Main invoice viewer
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── pdf-info-panel.tsx # Invoice details
│   └── invoice-analytics.tsx # Analytics dashboard
├── hooks/                # Custom React hooks
│   ├── useInvoices.ts    # Invoice management
│   └── useCustomers.ts   # Customer management
├── lib/                  # Utilities and API
│   ├── api.ts           # API service layer
│   └── utils.ts         # Utility functions
└── public/              # Static assets
```

### Available Scripts
```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint

# Package Management
pnpm install      # Install dependencies
pnpm add <pkg>    # Add new dependency
pnpm remove <pkg> # Remove dependency
```

## 🚀 Deployment

### Frontend Deployment
1. Build the application:
```bash
pnpm build
```

2. Deploy to your preferred platform (Vercel, Netlify, etc.)

3. Set environment variables:
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
```

### Backend Deployment
1. Build the JAR file:
```bash
./mvnw clean package
```

2. Deploy to your preferred platform (AWS, Azure, etc.)

3. Update database configuration for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the API documentation at `http://localhost:8080/swagger-ui.html`
- Review the component documentation
- Open an issue on GitHub

## 🔄 Updates

The application is designed to be easily extensible. To add new features:

1. **Backend**: Add new controllers, services, and DTOs
2. **Frontend**: Create new API methods in `lib/api.ts`
3. **UI**: Add new components and pages
4. **Hooks**: Create custom hooks for new functionality

---

**Happy Coding! 🎉** 