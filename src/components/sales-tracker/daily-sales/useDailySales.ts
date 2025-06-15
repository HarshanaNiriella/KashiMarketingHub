
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

export const useDailySales = () => {
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

  return {
    salesData,
    isLoading,
    totalPaymentCollected,
    totalSales,
    todayTotalSalesGenerated,
    handleInputChange,
    handleSave
  };
};
