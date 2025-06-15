
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useStaffAttendance = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState('');
  const [dailySales, setDailySales] = useState('');
  const [totalDiscounts, setTotalDiscounts] = useState('');
  const [isBniDay, setIsBniDay] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!selectedStaff || !attendanceStatus) {
      toast({
        title: "Missing Information",
        description: "Please select both staff member and attendance status.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const salesAmount = parseFloat(dailySales) || 0;
      const discountAmount = parseFloat(totalDiscounts) || 0;
      const netSales = salesAmount - discountAmount;

      const { error } = await supabase
        .from('staff_attendance')
        .insert({
          date: selectedDate,
          staff_name: selectedStaff,
          attendance_status: attendanceStatus,
          daily_sales: salesAmount || null,
          total_discounts: discountAmount || null,
          net_sales_after_discount: netSales || null,
          is_bni_day: isBniDay || null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Attendance recorded successfully!",
      });

      // Reset form
      setSelectedStaff('');
      setAttendanceStatus('');
      setDailySales('');
      setTotalDiscounts('');
      setIsBniDay(false);
    } catch (error) {
      console.error('Error recording attendance:', error);
      toast({
        title: "Error",
        description: "Failed to record attendance. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    selectedDate,
    selectedStaff,
    attendanceStatus,
    dailySales,
    totalDiscounts,
    isBniDay,
    isSubmitting,
    setSelectedDate,
    setSelectedStaff,
    setAttendanceStatus,
    setDailySales,
    setTotalDiscounts: setTotalDiscounts,
    setIsBniDay,
    handleSubmit
  };
};
