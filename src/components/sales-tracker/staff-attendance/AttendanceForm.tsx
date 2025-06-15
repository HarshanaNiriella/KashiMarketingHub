
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CalendarDays, Users, DollarSign } from 'lucide-react';

interface AttendanceFormProps {
  selectedDate: string;
  selectedStaff: string;
  attendanceStatus: string;
  dailySales: string;
  isBniDay: boolean;
  staffMembers: string[];
  attendanceStatuses: string[];
  bniEligibleStaff: string[];
  onDateChange: (date: string) => void;
  onStaffChange: (staff: string) => void;
  onStatusChange: (status: string) => void;
  onSalesChange: (sales: string) => void;
  onBniChange: (checked: boolean) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const AttendanceForm = ({
  selectedDate,
  selectedStaff,
  attendanceStatus,
  dailySales,
  isBniDay,
  staffMembers,
  attendanceStatuses,
  bniEligibleStaff,
  onDateChange,
  onStaffChange,
  onStatusChange,
  onSalesChange,
  onBniChange,
  onSubmit,
  isSubmitting
}: AttendanceFormProps) => {
  const showBniOption = bniEligibleStaff.includes(selectedStaff);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-emerald-600" />
          <span>Staff Attendance Entry</span>
        </CardTitle>
        <CardDescription>Record daily attendance and sales for staff members</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center space-x-2">
              <CalendarDays className="h-4 w-4" />
              <span>Date</span>
            </Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
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

          <div className="space-y-2">
            <Label htmlFor="status">Attendance Status</Label>
            <Select value={attendanceStatus} onValueChange={onStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select attendance status" />
              </SelectTrigger>
              <SelectContent>
                {attendanceStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sales" className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Daily Sales (LKR)</span>
            </Label>
            <Input
              id="sales"
              type="number"
              placeholder="0.00"
              value={dailySales}
              onChange={(e) => onSalesChange(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {showBniOption && (
          <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
            <Checkbox
              id="bni"
              checked={isBniDay}
              onCheckedChange={onBniChange}
            />
            <Label htmlFor="bni" className="text-sm font-medium text-blue-800">
              This is a BNI meeting day for {selectedStaff}
            </Label>
          </div>
        )}

        <Button 
          onClick={onSubmit} 
          className="w-full bg-emerald-600 hover:bg-emerald-700"
          disabled={isSubmitting || !selectedStaff || !attendanceStatus}
        >
          {isSubmitting ? 'Recording...' : 'Record Attendance'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AttendanceForm;
