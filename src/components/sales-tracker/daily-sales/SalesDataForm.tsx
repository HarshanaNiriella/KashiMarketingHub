
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

interface SalesDataFormProps {
  salesData: SalesData;
  onInputChange: (field: keyof SalesData, value: string | number) => void;
}

const SalesDataForm = ({ salesData, onInputChange }: SalesDataFormProps) => {
  return (
    <>
      {/* Date and Time */}
      <div className="grid grid-cols-2 gap-4">
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
                  onChange={(e) => onInputChange(key as keyof SalesData, parseFloat(e.target.value) || 0)}
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
                onChange={(e) => onInputChange('services', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="products">Products</Label>
              <Input
                id="products"
                type="number"
                step="0.01"
                value={salesData.products}
                onChange={(e) => onInputChange('products', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="gift_cards">Gift Cards</Label>
              <Input
                id="gift_cards"
                type="number"
                step="0.01"
                value={salesData.gift_cards}
                onChange={(e) => onInputChange('gift_cards', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default SalesDataForm;
