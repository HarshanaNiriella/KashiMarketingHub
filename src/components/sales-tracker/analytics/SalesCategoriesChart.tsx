
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

interface SalesCategoriesChartProps {
  salesData: SalesData[];
}

const SalesCategoriesChart = ({ salesData }: SalesCategoriesChartProps) => {
  return (
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
  );
};

export default SalesCategoriesChart;
