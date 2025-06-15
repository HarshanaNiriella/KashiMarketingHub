
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSalesAnalytics } from './analytics/useSalesAnalytics';
import SalesSummaryCards from './analytics/SalesSummaryCards';
import DailySalesTrendChart from './analytics/DailySalesTrendChart';
import PaymentMethodsChart from './analytics/PaymentMethodsChart';
import SalesCategoriesChart from './analytics/SalesCategoriesChart';
import CashVsCardChart from './analytics/CashVsCardChart';

const SalesAnalytics = () => {
  const [timeRange, setTimeRange] = useState('7'); // days
  const {
    salesData,
    isLoading,
    totalSales,
    totalCash,
    totalCards,
    averageDailySales
  } = useSalesAnalytics(timeRange);

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

      <SalesSummaryCards 
        totalSales={totalSales}
        averageDailySales={averageDailySales}
        totalCash={totalCash}
        totalCards={totalCards}
        timeRange={timeRange}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailySalesTrendChart salesData={salesData} />
        <PaymentMethodsChart 
          totalCash={totalCash}
          totalCards={totalCards}
          totalSales={totalSales}
        />
        <SalesCategoriesChart salesData={salesData} />
        <CashVsCardChart salesData={salesData} />
      </div>
    </div>
  );
};

export default SalesAnalytics;
