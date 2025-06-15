
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

interface CashVsCardChartProps {
  salesData: SalesData[];
}

const CashVsCardChart = ({ salesData }: CashVsCardChartProps) => {
  return (
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
  );
};

export default CashVsCardChart;
