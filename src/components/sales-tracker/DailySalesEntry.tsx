
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, Save, Calculator } from 'lucide-react';

interface SalesData {
  date: string;
  time: string;
  thyaga: number;
  mintpay: number;
  feelo: number;
  unionpay: number;
  online_transfer: number;
  card_amex: number;
  card_visa: number;
  card_master: number;
  cash: number;
  gift_card_redemptions: number;
  services: number;
  products: number;
  gift_cards: number;
}

const DailySalesEntry = () => {
  const { toast } = useToast();
  const [salesData, setSalesData] = useState<SalesData>({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    thyaga: 0,
    mintpay: 0,
    feelo: 0,
    unionpay: 0,
    online_transfer: 0,
    card_amex: 0,
    card_visa: 0,
    card_master: 0,
    cash: 0,
    gift_card_redemptions: 0,
    services: 0,
    products: 0,
    gift_cards: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Calculate totals
  const totalPaymentCollected = Object.entries(salesData)
    .filter(([key]) => !['date', 'time', 'services', 'products', 'gift_cards'].includes(key))
    .reduce((sum, [_, value]) => sum + Number(value), 0);

  const totalSales = salesData.services + salesData.products + salesData.gift_cards;
  const todayTotalSalesGenerated = totalPaymentCollected - salesData.gift_card_redemptions;

  const handleInputChange = (field: keyof SalesData, value: string | number) => {
    setSalesData(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? value : Number(value)
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('daily_sales_reports')
        .insert([salesData]);

      if (error) throw error;

      toast({
        title: "Sales Report Saved",
        description: "Daily sales report has been successfully saved.",
      });

      // Reset form
      setSalesData({
        ...salesData,
        time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        thyaga: 0,
        mintpay: 0,
        feelo: 0,
        unionpay: 0,
        online_transfer: 0,
        card_amex: 0,
        card_visa: 0,
        card_master: 0,
        cash: 0,
        gift_card_redemptions: 0,
        services: 0,
        products: 0,
        gift_cards: 0,
      });
    } catch (error) {
      console.error('Error saving sales report:', error);
      toast({
        title: "Error",
        description: "Failed to save sales report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={salesData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={salesData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
              />
            </div>
          </div>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Methods Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                  { key: 'thyaga', label: 'Thyaga' },
                  { key: 'mintpay', label: 'Mintpay' },
                  { key: 'feelo', label: 'Feelo' },
                  { key: 'unionpay', label: 'UnionPay' },
                  { key: 'online_transfer', label: 'Online Transfer' },
                  { key: 'card_amex', label: 'Card (Amex)' },
                  { key: 'card_visa', label: 'Card (Visa)' },
                  { key: 'card_master', label: 'Card (Master)' },
                  { key: 'cash', label: 'Cash' },
                  { key: 'gift_card_redemptions', label: 'Gift Card Redemptions' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <Label htmlFor={key}>{label}</Label>
                    <Input
                      id={key}
                      type="number"
                      step="0.01"
                      value={salesData[key as keyof SalesData]}
                      onChange={(e) => handleInputChange(key as keyof SalesData, parseFloat(e.target.value) || 0)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Transaction Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transaction Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="services">Services</Label>
                  <Input
                    id="services"
                    type="number"
                    step="0.01"
                    value={salesData.services}
                    onChange={(e) => handleInputChange('services', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="products">Products</Label>
                  <Input
                    id="products"
                    type="number"
                    step="0.01"
                    value={salesData.products}
                    onChange={(e) => handleInputChange('products', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="gift_cards">Gift Cards</Label>
                  <Input
                    id="gift_cards"
                    type="number"
                    step="0.01"
                    value={salesData.gift_cards}
                    onChange={(e) => handleInputChange('gift_cards', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calculations */}
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
