"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  Tooltip,
  Legend
} from "recharts"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Target, 
  CircleDollarSign,
  AlertCircle,
  Clock3,
  Clock4,
  Clock5
} from "lucide-react"
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, differenceInDays, parseISO } from 'date-fns'

interface InvoiceAnalyticsProps {
  selectedInvoice: any
  allInvoices: any[]
}

// Helper function to calculate payment score
const calculatePaymentScore = (invoices: any[]) => {
  const paidInvoices = invoices.filter(inv => inv.status === 'paid')
  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
  
  if (totalInvoiced === 0) return 100 // If no invoices, consider it 100%
  return Math.round((totalPaid / totalInvoiced) * 100)
}

// Helper function to get risk level based on days outstanding
const getRiskLevel = (dueDate: string) => {
  const daysOutstanding = differenceInDays(new Date(), parseISO(dueDate))
  if (daysOutstanding <= 15) return { level: 'Low', color: '#10B981', icon: <CheckCircle className="h-4 w-4" /> }
  if (daysOutstanding <= 45) return { level: 'Medium', color: '#F59E0B', icon: <AlertCircle className="h-4 w-4" /> }
  return { level: 'High', color: '#EF4444', icon: <AlertTriangle className="h-4 w-4" /> }
}

// Generate monthly data for charts
const generateMonthlyData = (invoices: any[], months: number = 6) => {
  const endDate = new Date()
  const startDate = subMonths(endDate, months - 1)
  const monthsList = eachMonthOfInterval({ start: startDate, end: endDate })
  
  return monthsList.map(month => {
    const monthStart = startOfMonth(month)
    const monthEnd = endOfMonth(month)
    const monthKey = format(month, 'MMM yyyy')
    
    const monthInvoices = invoices.filter(inv => {
      const invoiceDate = parseISO(inv.invoiceDate || inv.createdAt)
      return invoiceDate >= monthStart && invoiceDate <= monthEnd
    })
    
    return {
      month: format(month, 'MMM'),
      fullDate: monthKey,
      revenue: monthInvoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0),
      invoices: monthInvoices.length,
      paid: monthInvoices.filter(inv => inv.status === 'paid').length,
      overdue: monthInvoices.filter(inv => {
        if (inv.status !== 'paid' && inv.dueDate) {
          return differenceInDays(new Date(), parseISO(inv.dueDate)) > 0
        }
        return false
      }).length
    }
  })
}

export function InvoiceAnalytics({ selectedInvoice, allInvoices }: InvoiceAnalyticsProps) {
  console.log('📈 Rendering Analytics Panel');
  console.log('📊 Selected Invoice for Analytics:', selectedInvoice);
  console.log('📋 Total Invoices for Analytics:', allInvoices.length);
  
  if (!selectedInvoice) {
    console.log('⚠️ No invoice selected for analytics');
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <Target className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="text-lg font-medium mb-2">No Invoice Selected</p>
          <p className="text-sm">Select an invoice to view analytics and insights</p>
        </div>
      </div>
    )
  }

  // Calculate real-time analytics data
  const clientInvoices = allInvoices.filter((inv) => 
    selectedInvoice?.customer?.name && inv.customer?.name === selectedInvoice.customer?.name
  )
  
  const paidInvoices = allInvoices.filter(inv => inv.status === 'paid')
  const unpaidInvoices = allInvoices.filter(inv => inv.status !== 'paid')
  
  // Calculate total amount for the client's invoices
  const totalClientAmount = clientInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
  
  // Payment Score Calculation - using a more specific name to avoid conflicts
  const invoicePaymentScore = calculatePaymentScore(allInvoices)
  
  // Risk Level Analysis
  const riskAnalysis = selectedInvoice?.dueDate 
    ? getRiskLevel(selectedInvoice.dueDate) 
    : { level: 'N/A', color: '#6B7280', icon: <Clock3 className="h-4 w-4" /> }
  
  // Days Outstanding for selected invoice
  const daysOutstanding = selectedInvoice?.dueDate 
    ? differenceInDays(new Date(), parseISO(selectedInvoice.dueDate))
    : 0

  // Generate real-time chart data
  const monthlyData = generateMonthlyData(allInvoices)
  
  // Client comparison data
  const clientComparisonData = allInvoices.reduce((acc: any[], invoice) => {
    const clientName = invoice.customer?.name || 'Unknown'
    const existingClient = acc.find(c => c.client === clientName)
    
    if (existingClient) {
      existingClient.amount += invoice.totalAmount || 0
      existingClient.invoices += 1
    } else {
      acc.push({
        client: clientName,
        amount: invoice.totalAmount || 0,
        invoices: 1
      })
    }
    return acc
  }, []).sort((a, b) => b.amount - a.amount).slice(0, 5) // Top 5 clients

  // Status distribution
  const statusData = [
    { 
      name: "Paid", 
      value: allInvoices.filter(inv => inv.status === 'paid').length, 
      color: "#10B981" 
    },
    { 
      name: "Unpaid", 
      value: allInvoices.filter(inv => 
        inv.status !== 'paid' && 
        (!inv.dueDate || differenceInDays(new Date(), parseISO(inv.dueDate)) <= 0)
      ).length, 
      color: "#F59E0B" 
    },
    { 
      name: "Overdue", 
      value: allInvoices.filter(inv => 
        inv.status !== 'paid' && 
        inv.dueDate && 
        differenceInDays(new Date(), parseISO(inv.dueDate)) > 0
      ).length, 
      color: "#EF4444" 
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "overdue":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const paymentScore = selectedInvoice.status === "paid" ? 100 : selectedInvoice.status === "pending" ? 65 : 25
  const riskLevel =
    selectedInvoice.status === "overdue" ? "High" : selectedInvoice.status === "pending" ? "Medium" : "Low"

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Score</CardTitle>
            <div className="h-4 w-4 rounded-full" style={{ backgroundColor: 
              paymentScore >= 80 ? '#10B981' : 
              paymentScore >= 50 ? '#F59E0B' : 
              '#EF4444' 
            }}></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentScore}%</div>
            <div className="mt-2">
              <Progress value={paymentScore} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {paymentScore >= 80 ? 'Excellent payment history' : 
               paymentScore >= 50 ? 'Moderate payment history' : 
               'Needs attention'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
            {riskAnalysis.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center" style={{ color: riskAnalysis.color }}>
              {riskAnalysis.level}
            </div>
            {selectedInvoice?.dueDate && (
              <p className="text-xs text-muted-foreground">
                {daysOutstanding > 0 
                  ? `${daysOutstanding} days overdue`
                  : `${Math.abs(daysOutstanding)} days remaining`}
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${allInvoices
                .filter(inv => inv.status === 'paid')
                .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {allInvoices.filter(inv => inv.status === 'paid').length} paid invoices
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${unpaidInvoices
                .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {unpaidInvoices.length} unpaid invoices
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Payment Timeline</CardTitle>
                <CardDescription>Monthly payment trends over the last 6 months</CardDescription>
              </div>
              <Badge variant="outline" className="ml-2">
                {format(new Date(), 'MMM yyyy')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Invoice Status</CardTitle>
                <CardDescription>Distribution of invoice statuses</CardDescription>
              </div>
              <Badge variant="outline" className="ml-2">
                {allInvoices.length} Total
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex flex-col">
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent = 0 }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => {
                        const total = allInvoices.length || 1; // Avoid division by zero
                        const percentage = Math.round((value / total) * 100);
                        return [`${value} (${percentage}%)`, 'Count'];
                      }}  
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {statusData.map((status, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="text-2xl font-bold" style={{ color: status.color }}>
                      {status.value}
                    </div>
                    <div className="text-sm text-muted-foreground">{status.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-8">
        <Card className="col-span-4">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Top Clients</CardTitle>
                <CardDescription>Revenue by client (Top 5)</CardDescription>
              </div>
              <Badge variant="outline" className="ml-2">
                {clientComparisonData.length} Clients
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={clientComparisonData}
                  layout="vertical"
                  margin={{
                    top: 20,
                    right: 30,
                    left: 10,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                  <XAxis 
                    type="number" 
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <YAxis 
                    dataKey="client" 
                    type="category" 
                    width={120}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => 
                      name === 'amount' ? [`$${value.toLocaleString()}`, 'Revenue'] : [String(value), 'Invoices']
                    }
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="#8884d8" 
                    name="Revenue"
                    radius={[0, 4, 4, 0]}
                  >
                    {clientComparisonData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          entry.client === (selectedInvoice?.customer?.name || 'Unknown') 
                            ? '#4f46e5' 
                            : '#8884d8'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-4">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Monthly Performance</CardTitle>
                <CardDescription>Revenue and invoice count by month</CardDescription>
              </div>
              <Badge variant="outline" className="ml-2">
                6 Months
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                  <XAxis dataKey="month" />
                  <YAxis 
                    yAxisId="left" 
                    orientation="left" 
                    stroke="#8884d8"
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke="#82ca9d"
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => 
                      name === 'revenue' 
                        ? [`$${value.toLocaleString()}`, 'Revenue'] 
                        : [String(value), 'Invoices']
                    }
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Revenue"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="invoices"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Invoices"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>AI Insights & Recommendations</CardTitle>
          <CardDescription>Automated analysis and suggestions for this invoice</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Payment Pattern Analysis</h4>
              <p className="text-blue-800 text-sm">
                {selectedInvoice.customer?.name} has a{" "}
                {clientInvoices.filter((inv) => inv.status === "paid").length / clientInvoices.length > 0.7
                  ? "good"
                  : "concerning"}{" "}
                payment history with{" "}
                {Math.round(
                  (clientInvoices.filter((inv) => inv.status === "paid").length / clientInvoices.length) * 100,
                )}
                % of invoices paid on time.
              </p>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Revenue Impact</h4>
              <p className="text-green-800 text-sm">
                This invoice represents{" "}
                {totalClientAmount > 0 ? Math.round(
                  ((typeof selectedInvoice.totalAmount === 'number' ? selectedInvoice.totalAmount : 0) / totalClientAmount) * 100
                ) : 0}%
                of total revenue from {selectedInvoice.customer?.name}, with an average invoice value of $
                {clientInvoices.length > 0 
                  ? (clientInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0) / clientInvoices.length).toFixed(2)
                  : '0.00'}.
              </p>
            </div>

            {selectedInvoice.status === "overdue" && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-semibold text-red-900 mb-2">Action Required</h4>
                <p className="text-red-800 text-sm">
                  This invoice is overdue. Consider sending a payment reminder or contacting the client directly to
                  resolve payment delays.
                </p>
              </div>
            )}

            {selectedInvoice.status === "pending" && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">Follow-up Recommended</h4>
                <p className="text-yellow-800 text-sm">
                  Invoice is approaching due date. Consider sending a friendly reminder to ensure timely payment.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
