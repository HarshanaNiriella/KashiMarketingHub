
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

interface SalesDataFormProps {
  salesData: SalesData;
  onInputChange: (field: keyof SalesData, value: string | number) => void;
}

const SalesDataForm = ({ salesData, onInputChange }: SalesDataFormProps) => {
  const paymentMethods = [
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
  ];

  const salesCategories = [
    { key: 'services', label: 'Services' },
    { key: 'products', label: 'Products' },
    { key: 'gift_cards', label: 'Gift Cards' },
    { key: 'total_discounts', label: 'Total Discounts Given' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={salesData.date}
            onChange={(e) => onInputChange('date', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="time">Time</Label>
          <Input
            id="time"
            type="time"
            value={salesData.time}
            onChange={(e) => onInputChange('time', e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paymentMethods.map(({ key, label }) => (
              <div key={key}>
                <Label htmlFor={key}>{label}</Label>
                <Input
                  id={key}
                  type="number"
                  step="0.01"
                  min="0"
                  value={salesData[key as keyof SalesData]}
                  onChange={(e) => onInputChange(key as keyof SalesData, parseFloat(e.target.value) || 0)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sales Categories & Discounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {salesCategories.map(({ key, label }) => (
              <div key={key}>
                <Label htmlFor={key}>{label}</Label>
                <Input
                  id={key}
                  type="number"
                  step="0.01"
                  min="0"
                  value={salesData[key as keyof SalesData]}
                  onChange={(e) => onInputChange(key as keyof SalesData, parseFloat(e.target.value) || 0)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesDataForm;
