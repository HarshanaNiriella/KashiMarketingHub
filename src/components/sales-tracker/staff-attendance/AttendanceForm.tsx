
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Users, Save } from 'lucide-react';

interface AttendanceFormProps {
  selectedDate: string;
  selectedStaff: string;
  attendanceStatus: string;
  dailySales: string;
  totalDiscounts: string;
  isBniDay: boolean;
  staffMembers: string[];
  attendanceStatuses: string[];
  bniEligibleStaff: string[];
  onDateChange: (date: string) => void;
  onStaffChange: (staff: string) => void;
  onStatusChange: (status: string) => void;
  onSalesChange: (sales: string) => void;
  onDiscountsChange: (discounts: string) => void;
  onBniChange: (isBni: boolean) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const AttendanceForm = ({
  selectedDate,
  selectedStaff,
  attendanceStatus,
  dailySales,
  totalDiscounts,
  isBniDay,
  staffMembers,
  attendanceStatuses,
  bniEligibleStaff,
  onDateChange,
  onStaffChange,
  onStatusChange,
  onSalesChange,
  onDiscountsChange,
  onBniChange,
  onSubmit,
  isSubmitting
}: AttendanceFormProps) => {
  const netSalesAfterDiscount = (parseFloat(dailySales) || 0) - (parseFloat(totalDiscounts) || 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Staff Attendance Entry
        </CardTitle>
        <CardDescription>
          Record daily staff attendance and sales performance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="staff">Staff Member</Label>
            <Select value={selectedStaff} onValueChange={onStaffChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {staffMembers.map((staff) => (
                  <SelectItem key={staff} value={staff}>
                    {staff}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="status">Attendance Status</Label>
            <Select value={attendanceStatus} onValueChange={onStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select attendance status" />
              </SelectTrigger>
              <SelectContent>
                {attendanceStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="sales">Daily Sales (LKR)</Label>
            <Input
              id="sales"
              type="number"
              step="0.01"
              min="0"
              value={dailySales}
              onChange={(e) => onSalesChange(e.target.value)}
              placeholder="Enter sales amount"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="discounts">Total Discounts Given (LKR)</Label>
            <Input
              id="discounts"
              type="number"
              step="0.01"
              min="0"
              value={totalDiscounts}
              onChange={(e) => onDiscountsChange(e.target.value)}
              placeholder="Enter discount amount"
            />
          </div>

          <div>
            <Label>Net Sales After Discount</Label>
            <div className="p-2 bg-gray-50 rounded border">
              <span className="font-semibold">LKR {netSalesAfterDiscount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {bniEligibleStaff.includes(selectedStaff) && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="bni-day"
              checked={isBniDay}
              onCheckedChange={onBniChange}
            />
            <Label htmlFor="bni-day">
              BNI Day (Special networking event)
            </Label>
          </div>
        )}

        <Button 
          onClick={onSubmit} 
          disabled={isSubmitting}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Recording...' : 'Record Attendance'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AttendanceForm;
