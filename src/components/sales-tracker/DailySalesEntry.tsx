
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Save } from 'lucide-react';
import { useDailySales } from './daily-sales/useDailySales';
import SalesDataForm from './daily-sales/SalesDataForm';
import SalesCalculations from './daily-sales/SalesCalculations';

const DailySalesEntry = () => {
  const {
    salesData,
    isLoading,
    totalPaymentCollected,
    totalSales,
    todayTotalSalesGenerated,
    handleInputChange,
    handleSave
  } = useDailySales();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Daily Sales Entry
          </CardTitle>
          <CardDescription>
            Enter daily sales data and payment method breakdown
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <SalesDataForm 
            salesData={salesData}
            onInputChange={handleInputChange}
          />

          <SalesCalculations 
            totalPaymentCollected={totalPaymentCollected}
            totalSales={totalSales}
            todayTotalSalesGenerated={todayTotalSalesGenerated}
          />

          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Sales Report'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailySalesEntry;
