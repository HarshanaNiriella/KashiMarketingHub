
-- Add total_discounts column to daily_sales_reports table
ALTER TABLE public.daily_sales_reports 
ADD COLUMN total_discounts DECIMAL(10,2) DEFAULT 0;

-- Add discount tracking columns to staff_attendance table
ALTER TABLE public.staff_attendance 
ADD COLUMN total_discounts DECIMAL(10,2) DEFAULT 0,
ADD COLUMN net_sales_after_discount DECIMAL(10,2) DEFAULT 0;

-- Create index for better performance on discount queries
CREATE INDEX idx_daily_sales_reports_discounts ON public.daily_sales_reports(date, total_discounts);
CREATE INDEX idx_staff_attendance_discounts ON public.staff_attendance(date, total_discounts);
