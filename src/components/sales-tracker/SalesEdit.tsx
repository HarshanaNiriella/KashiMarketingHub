
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit, Lock, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SalesDataForm from './daily-sales/SalesDataForm';
import SalesCalculations from './daily-sales/SalesCalculations';
import { useDailySales } from './daily-sales/useDailySales';

const SalesEdit = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const {
    salesData,
    isLoading,
    totalPaymentCollected,
    totalSales,
    todayTotalSalesGenerated,
    totalDiscounts,
    netSalesAfterDiscount,
    existingRecordId,
    handleInputChange,
    handleSave
  } = useDailySales(isAuthenticated, selectedDate);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'finance') {
      setIsAuthenticated(true);
      toast({
        title: "Access Granted",
        description: "You can now edit sales reports.",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Incorrect password. Please try again.",
        variant: "destructive",
      });
      setPassword('');
    }
  };

  const handleSaveAndClose = async () => {
    await handleSave();
    setIsDialogOpen(false);
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Edit Sales Reports
          </CardTitle>
          <CardDescription>
            Enter password to edit existing sales reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter finance password"
              />
            </div>
            <Button type="submit" className="w-full">
              Authenticate
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Sales Reports
          </CardTitle>
          <CardDescription>
            Select a date to edit or create sales report
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="edit-date">Select Date</Label>
            <Input
              id="edit-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                {existingRecordId ? 'Edit Report' : 'Create Report'} for {selectedDate}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {existingRecordId ? 'Edit' : 'Create'} Sales Report - {selectedDate}
                </DialogTitle>
                <DialogDescription>
                  {existingRecordId ? 'Modify the existing sales data' : 'Create a new sales report for this date'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <SalesDataForm 
                  salesData={salesData}
                  onInputChange={handleInputChange}
                />

                <SalesCalculations 
                  totalPaymentCollected={totalPaymentCollected}
                  totalSales={totalSales}
                  todayTotalSalesGenerated={todayTotalSalesGenerated}
                  totalDiscounts={totalDiscounts}
                  netSalesAfterDiscount={netSalesAfterDiscount}
                />

                <div className="flex gap-2">
                  <Button 
                    onClick={handleSaveAndClose} 
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? 'Saving...' : existingRecordId ? 'Update Report' : 'Create Report'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            variant="outline" 
            onClick={() => {
              setIsAuthenticated(false);
              setPassword('');
            }}
            className="w-full"
          >
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesEdit;
