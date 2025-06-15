
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export const useSalesAnalytics = (timeRange: string) => {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSalesData();
  }, [timeRange]);

  const loadSalesData = async () => {
    setIsLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(timeRange));

      const { data, error } = await supabase
        .from('daily_sales_reports')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;

      const processedData = data?.map(item => ({
        date: item.date,
        total_sales: (item.services || 0) + (item.products || 0) + (item.gift_cards || 0),
        total_payment: (item.thyaga || 0) + (item.mintpay || 0) + (item.feelo || 0) + 
                      (item.unionpay || 0) + (item.online_transfer || 0) + (item.card_amex || 0) + 
                      (item.card_visa || 0) + (item.card_master || 0) + (item.cash || 0) + 
                      (item.gift_card_redemptions || 0),
        cash: item.cash || 0,
        card_total: (item.card_amex || 0) + (item.card_visa || 0) + (item.card_master || 0),
        gift_cards: item.gift_cards || 0,
        services: item.services || 0,
        products: item.products || 0,
      })) || [];

      setSalesData(processedData);
    } catch (error) {
      console.error('Error loading sales data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalSales = salesData.reduce((sum, item) => sum + item.total_sales, 0);
  const totalCash = salesData.reduce((sum, item) => sum + item.cash, 0);
  const totalCards = salesData.reduce((sum, item) => sum + item.card_total, 0);
  const averageDailySales = salesData.length > 0 ? totalSales / salesData.length : 0;

  return {
    salesData,
    isLoading,
    totalSales,
    totalCash,
    totalCards,
    averageDailySales
  };
};
