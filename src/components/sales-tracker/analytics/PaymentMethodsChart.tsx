
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface PaymentMethodsChartProps {
  totalCash: number;
  totalCards: number;
  totalSales: number;
}

const PaymentMethodsChart = ({ totalCash, totalCards, totalSales }: PaymentMethodsChartProps) => {
  const paymentMethodData = [
    { name: 'Cash', value: totalCash, color: '#10B981' },
    { name: 'Cards', value: totalCards, color: '#3B82F6' },
    { name: 'Digital', value: totalSales - totalCash - totalCards, color: '#8B5CF6' },
  ];

  const COLORS = ['#10B981', '#3B82F6', '#8B5CF6'];

  return (
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
  );
};

export default PaymentMethodsChart;
