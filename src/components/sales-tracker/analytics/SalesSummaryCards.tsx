
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Banknote, CreditCard } from 'lucide-react';

interface SalesSummaryCardsProps {
  totalSales: number;
  averageDailySales: number;
  totalCash: number;
  totalCards: number;
  timeRange: string;
}

const SalesSummaryCards = ({ 
  totalSales, 
  averageDailySales, 
  totalCash, 
  totalCards, 
  timeRange 
}: SalesSummaryCardsProps) => {
  return (
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
            {totalSales > 0 ? ((totalCash / totalSales) * 100).toFixed(1) : '0'}% of total
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
            {totalSales > 0 ? ((totalCards / totalSales) * 100).toFixed(1) : '0'}% of total
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesSummaryCards;
