
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Users, Save, Calendar } from 'lucide-react';

interface AttendanceRecord {
  staff_name: string;
  attendance_status: string;
  is_bni_day: boolean;
  daily_sales: number;
}

const STAFF_MEMBERS = [
  'Pooja', 'Inoka', 'Kasun', 'Dr.Harshana', 'Putri', 
  'Elisya', 'Udani', 'Yersin', 'Rinoza', 'Jude'
];

const ATTENDANCE_OPTIONS = [
  'present',
  'approved_leave',
  'half_day',
  'sick_leave',
  'absent'
];

const BNI_ELIGIBLE_STAFF = ['Dr.Harshana', 'Yersin'];

const StaffAttendanceEntry = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [existingRecords, setExistingRecords] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Initialize attendance records for all staff
    const initialRecords = STAFF_MEMBERS.map(staff => ({
      staff_name: staff,
      attendance_status: 'present',
      is_bni_day: false,
      daily_sales: 0
    }));
    setAttendanceRecords(initialRecords);
    
    // Load existing records for the selected date
    loadExistingRecords();
  }, [selectedDate]);

  const loadExistingRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('staff_attendance')
        .select('*')
        .eq('date', selectedDate);

      if (error) throw error;

      if (data && data.length > 0) {
        const existing = new Set(data.map(record => record.staff_name));
        setExistingRecords(existing);
        
        // Update records with existing data
        const updatedRecords = attendanceRecords.map(record => {
          const existingRecord = data.find(d => d.staff_name === record.staff_name);
          return existingRecord ? {
            staff_name: existingRecord.staff_name,
            attendance_status: existingRecord.attendance_status,
            is_bni_day: existingRecord.is_bni_day || false,
            daily_sales: existingRecord.daily_sales || 0
          } : record;
        });
        setAttendanceRecords(updatedRecords);
      } else {
        setExistingRecords(new Set());
      }
    } catch (error) {
      console.error('Error loading existing records:', error);
    }
  };

  const updateAttendanceRecord = (staffName: string, field: keyof AttendanceRecord, value: any) => {
    setAttendanceRecords(prev => 
      prev.map(record => 
        record.staff_name === staffName 
          ? { ...record, [field]: value }
          : record
      )
    );
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Prepare data for insertion/update
      const dataToSave = attendanceRecords.map(record => ({
        date: selectedDate,
        staff_name: record.staff_name,
        attendance_status: record.attendance_status,
        is_bni_day: record.is_bni_day,
        daily_sales: record.daily_sales
      }));

      // Delete existing records for this date first
      const { error: deleteError } = await supabase
        .from('staff_attendance')
        .delete()
        .eq('date', selectedDate);

      if (deleteError) throw deleteError;

      // Insert new records
      const { error: insertError } = await supabase
        .from('staff_attendance')
        .insert(dataToSave);

      if (insertError) throw insertError;

      toast({
        title: "Attendance Saved",
        description: "Staff attendance records have been successfully saved.",
      });

      loadExistingRecords();
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast({
        title: "Error",
        description: "Failed to save attendance records. Please try again.",
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
            <Users className="h-5 w-5" />
            Staff Attendance Entry
          </CardTitle>
          <CardDescription>
            Track daily staff attendance and individual sales performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Selection */}
          <div className="w-full max-w-xs">
            <Label htmlFor="attendance-date">Date</Label>
            <Input
              id="attendance-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {/* Staff Attendance Grid */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Staff Attendance Records</h3>
            <div className="grid gap-4">
              {attendanceRecords.map((record) => (
                <Card key={record.staff_name} className={existingRecords.has(record.staff_name) ? 'border-green-200 bg-green-50' : ''}>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                      <div>
                        <Label className="font-medium">{record.staff_name}</Label>
                        {existingRecords.has(record.staff_name) && (
                          <p className="text-xs text-green-600">Already recorded</p>
                        )}
                      </div>
                      
                      <div>
                        <Label>Attendance Status</Label>
                        <Select 
                          value={record.attendance_status} 
                          onValueChange={(value) => updateAttendanceRecord(record.staff_name, 'attendance_status', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ATTENDANCE_OPTIONS.map(option => (
                              <SelectItem key={option} value={option}>
                                {option.replace('_', ' ').toUpperCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Daily Sales (LKR)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={record.daily_sales}
                          onChange={(e) => updateAttendanceRecord(record.staff_name, 'daily_sales', parseFloat(e.target.value) || 0)}
                        />
                      </div>

                      {BNI_ELIGIBLE_STAFF.includes(record.staff_name) && (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`bni-${record.staff_name}`}
                            checked={record.is_bni_day}
                            onCheckedChange={(checked) => updateAttendanceRecord(record.staff_name, 'is_bni_day', checked)}
                          />
                          <Label htmlFor={`bni-${record.staff_name}`} className="text-sm">
                            BNI Day
                          </Label>
                        </div>
                      )}

                      <div className="text-right">
                        <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          record.attendance_status === 'present' ? 'bg-green-100 text-green-800' :
                          record.attendance_status === 'approved_leave' ? 'bg-blue-100 text-blue-800' :
                          record.attendance_status === 'half_day' ? 'bg-yellow-100 text-yellow-800' :
                          record.attendance_status === 'sick_leave' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {record.attendance_status.replace('_', ' ').toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Attendance Records'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffAttendanceEntry;
