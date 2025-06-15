
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SalesCalculationsProps {
  totalPaymentCollected: number;
  totalSales: number;
  todayTotalSalesGenerated: number;
  totalDiscounts: number;
  netSalesAfterDiscount: number;
}

const SalesCalculations = ({ 
  totalPaymentCollected, 
  totalSales, 
  todayTotalSalesGenerated,
  totalDiscounts,
  netSalesAfterDiscount
}: SalesCalculationsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">Total Payment Collected</p>
            <p className="text-2xl font-bold text-blue-800">LKR {totalPaymentCollected.toFixed(2)}</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Total Sales</p>
            <p className="text-2xl font-bold text-green-800">LKR {totalSales.toFixed(2)}</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-600 font-medium">Sales Generated Today</p>
            <p className="text-2xl font-bold text-purple-800">LKR {todayTotalSalesGenerated.toFixed(2)}</p>
          </div>

          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-orange-600 font-medium">Total Discounts Given</p>
            <p className="text-2xl font-bold text-orange-800">LKR {totalDiscounts.toFixed(2)}</p>
          </div>

          <div className="text-center p-4 bg-emerald-50 rounded-lg">
            <p className="text-sm text-emerald-600 font-medium">Net Sales After Discount</p>
            <p className="text-2xl font-bold text-emerald-800">LKR {netSalesAfterDiscount.toFixed(2)}</p>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 font-medium">Discount Rate</p>
            <p className="text-2xl font-bold text-gray-800">
              {totalSales > 0 ? ((totalDiscounts / totalSales) * 100).toFixed(1) : '0.0'}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesCalculations;
