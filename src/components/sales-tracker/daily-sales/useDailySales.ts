
import { useState, useEffect } from 'react';
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
  total_discounts: number;
}

export const useDailySales = (editMode = false, editDate = '') => {
  const { toast } = useToast();
  const [salesData, setSalesData] = useState<SalesData>({
    date: editDate || new Date().toISOString().split('T')[0],
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
    total_discounts: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [existingRecordId, setExistingRecordId] = useState<string | null>(null);

  // Load existing data if in edit mode
  useEffect(() => {
    if (editMode && editDate) {
      loadExistingData(editDate);
    }
  }, [editMode, editDate]);

  const loadExistingData = async (date: string) => {
    try {
      const { data, error } = await supabase
        .from('daily_sales_reports')
        .select('*')
        .eq('date', date)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setExistingRecordId(data.id);
        setSalesData({
          date: data.date,
          time: data.time,
          thyaga: data.thyaga || 0,
          mintpay: data.mintpay || 0,
          feelo: data.feelo || 0,
          unionpay: data.unionpay || 0,
          online_transfer: data.online_transfer || 0,
          card_amex: data.card_amex || 0,
          card_visa: data.card_visa || 0,
          card_master: data.card_master || 0,
          cash: data.cash || 0,
          gift_card_redemptions: data.gift_card_redemptions || 0,
          services: data.services || 0,
          products: data.products || 0,
          gift_cards: data.gift_cards || 0,
          total_discounts: data.total_discounts || 0,
        });
      }
    } catch (error) {
      console.error('Error loading existing data:', error);
      toast({
        title: "Error",
        description: "Failed to load existing sales data.",
        variant: "destructive",
      });
    }
  };

  // Calculate totals
  const totalPaymentCollected = Object.entries(salesData)
    .filter(([key]) => !['date', 'time', 'services', 'products', 'gift_cards', 'total_discounts'].includes(key))
    .reduce((sum, [_, value]) => sum + Number(value), 0);

  const totalSales = salesData.services + salesData.products + salesData.gift_cards;
  const todayTotalSalesGenerated = totalPaymentCollected - salesData.gift_card_redemptions;
  const netSalesAfterDiscount = totalSales - salesData.total_discounts;

  const handleInputChange = (field: keyof SalesData, value: string | number) => {
    setSalesData(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? value : Number(value)
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (existingRecordId) {
        // Update existing record
        const { error } = await supabase
          .from('daily_sales_reports')
          .update(salesData)
          .eq('id', existingRecordId);

        if (error) throw error;

        toast({
          title: "Sales Report Updated",
          description: "Daily sales report has been successfully updated.",
        });
      } else {
        // Insert new record
        const { error } = await supabase
          .from('daily_sales_reports')
          .insert([salesData]);

        if (error) throw error;

        toast({
          title: "Sales Report Saved",
          description: "Daily sales report has been successfully saved.",
        });

        // Reset form only for new entries
        if (!editMode) {
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
            total_discounts: 0,
          });
        }
      }
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
    totalDiscounts: salesData.total_discounts,
    netSalesAfterDiscount,
    existingRecordId,
    handleInputChange,
    handleSave,
    loadExistingData
  };
};
