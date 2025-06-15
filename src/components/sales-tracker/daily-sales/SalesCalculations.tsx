
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Calculator } from 'lucide-react';

interface SalesCalculationsProps {
  totalPaymentCollected: number;
  totalSales: number;
  todayTotalSalesGenerated: number;
}

const SalesCalculations = ({ 
  totalPaymentCollected, 
  totalSales, 
  todayTotalSalesGenerated 
}: SalesCalculationsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Calculations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <Label className="text-sm font-medium text-blue-700">Total Payment Collected</Label>
            <p className="text-2xl font-bold text-blue-900">LKR {totalPaymentCollected.toFixed(2)}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <Label className="text-sm font-medium text-green-700">Total Sales</Label>
            <p className="text-2xl font-bold text-green-900">LKR {totalSales.toFixed(2)}</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-lg">
            <Label className="text-sm font-medium text-emerald-700">Today Total Sales Generated</Label>
            <p className="text-2xl font-bold text-emerald-900">LKR {todayTotalSalesGenerated.toFixed(2)}</p>
            <p className="text-xs text-emerald-600 mt-1">
              (Total Payment - Gift Card Redemptions)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesCalculations;
