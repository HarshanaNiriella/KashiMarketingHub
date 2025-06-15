
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

interface DailySalesTrendChartProps {
  salesData: SalesData[];
}

const DailySalesTrendChart = ({ salesData }: DailySalesTrendChartProps) => {
  return (
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
  );
};

export default DailySalesTrendChart;
