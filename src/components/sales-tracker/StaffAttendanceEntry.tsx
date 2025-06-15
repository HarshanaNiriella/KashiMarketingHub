
import React from 'react';
import AttendanceForm from './staff-attendance/AttendanceForm';
import { useStaffAttendance } from './staff-attendance/useStaffAttendance';

const STAFF_MEMBERS = [
  'Pooja', 'Inoka', 'Kasun', 'Dr.Harshana Niriella', 'Putri', 
  'Elisya', 'Udani', 'Yersin', 'Rinoza', 'Jude'
];

const ATTENDANCE_STATUSES = [
  'present',
  'late',
  'half-day',
  'absent'
];

const BNI_ELIGIBLE_STAFF = ['Dr.Harshana Niriella', 'Yersin'];

const StaffAttendanceEntry = () => {
  const {
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
    setTotalDiscounts,
    setIsBniDay,
    handleSubmit
  } = useStaffAttendance();

  return (
    <div className="p-4">
      <AttendanceForm
        selectedDate={selectedDate}
        selectedStaff={selectedStaff}
        attendanceStatus={attendanceStatus}
        dailySales={dailySales}
        totalDiscounts={totalDiscounts}
        isBniDay={isBniDay}
        staffMembers={STAFF_MEMBERS}
        attendanceStatuses={ATTENDANCE_STATUSES}
        bniEligibleStaff={BNI_ELIGIBLE_STAFF}
        onDateChange={setSelectedDate}
        onStaffChange={setSelectedStaff}
        onStatusChange={setAttendanceStatus}
        onSalesChange={setDailySales}
        onDiscountsChange={setTotalDiscounts}
        onBniChange={setIsBniDay}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default StaffAttendanceEntry;
