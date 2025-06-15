
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, CreditCard, Banknote } from 'lucide-react';

interface SalesData {
  date: string;
  total_sales: number;
  total_payment: number;
  cash: number;
  card_total: number;
  gift_cards: number;
  services: number;
  products: number;
}

const SalesAnalytics = () => {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [timeRange, setTimeRange] = useState('7'); // days
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSalesData();
  }, [timeRange]);

  const loadSalesData = async () => {
    setIsLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(timeRange));

      const { data, error } = await supabase
        .from('daily_sales_reports')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;

      const processedData = data?.map(item => ({
        date: item.date,
        total_sales: (item.services || 0) + (item.products || 0) + (item.gift_cards || 0),
        total_payment: (item.thyaga || 0) + (item.mintpay || 0) + (item.feelo || 0) + 
                      (item.unionpay || 0) + (item.online_transfer || 0) + (item.card_amex || 0) + 
                      (item.card_visa || 0) + (item.card_master || 0) + (item.cash || 0) + 
                      (item.gift_card_redemptions || 0),
        cash: item.cash || 0,
        card_total: (item.card_amex || 0) + (item.card_visa || 0) + (item.card_master || 0),
        gift_cards: item.gift_cards || 0,
        services: item.services || 0,
        products: item.products || 0,
      })) || [];

      setSalesData(processedData);
    } catch (error) {
      console.error('Error loading sales data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalSales = salesData.reduce((sum, item) => sum + item.total_sales, 0);
  const totalCash = salesData.reduce((sum, item) => sum + item.cash, 0);
  const totalCards = salesData.reduce((sum, item) => sum + item.card_total, 0);
  const averageDailySales = salesData.length > 0 ? totalSales / salesData.length : 0;

  const paymentMethodData = [
    { name: 'Cash', value: totalCash, color: '#10B981' },
    { name: 'Cards', value: totalCards, color: '#3B82F6' },
    { name: 'Digital', value: totalSales - totalCash - totalCards, color: '#8B5CF6' },
  ];

  const COLORS = ['#10B981', '#3B82F6', '#8B5CF6'];

  if (isLoading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Sales Analytics</h2>
          <p className="text-muted-foreground">Comprehensive sales performance analysis</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="14">Last 14 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">LKR {totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {timeRange} days period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Daily Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">LKR {averageDailySales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Per day average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Sales</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">LKR {totalCash.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {((totalCash / totalSales) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Card Sales</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">LKR {totalCards.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {((totalCards / totalSales) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Sales Trend</CardTitle>
            <CardDescription>Sales performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: any) => [`LKR ${value}`, 'Sales']} />
                <Legend />
                <Line type="monotone" dataKey="total_sales" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Methods Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods Distribution</CardTitle>
            <CardDescription>Breakdown by payment type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `LKR ${value}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Services vs Products */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Categories Comparison</CardTitle>
            <CardDescription>Services vs Products vs Gift Cards</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: any) => `LKR ${value}`} />
                <Legend />
                <Bar dataKey="services" fill="#10B981" />
                <Bar dataKey="products" fill="#3B82F6" />
                <Bar dataKey="gift_cards" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cash vs Card Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Cash vs Card Sales</CardTitle>
            <CardDescription>Payment method comparison over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: any) => `LKR ${value}`} />
                <Legend />
                <Bar dataKey="cash" fill="#10B981" />
                <Bar dataKey="card_total" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SalesAnalytics;
