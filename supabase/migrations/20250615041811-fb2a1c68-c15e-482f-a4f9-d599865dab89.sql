
-- Create daily sales reports table
CREATE TABLE public.daily_sales_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL,
  time time NOT NULL,
  -- Payment methods
  thyaga decimal(10,2) DEFAULT 0,
  mintpay decimal(10,2) DEFAULT 0,
  feelo decimal(10,2) DEFAULT 0,
  unionpay decimal(10,2) DEFAULT 0,
  online_transfer decimal(10,2) DEFAULT 0,
  card_amex decimal(10,2) DEFAULT 0,
  card_visa decimal(10,2) DEFAULT 0,
  card_master decimal(10,2) DEFAULT 0,
  cash decimal(10,2) DEFAULT 0,
  gift_card_redemptions decimal(10,2) DEFAULT 0,
  -- Transaction summary
  services decimal(10,2) DEFAULT 0,
  products decimal(10,2) DEFAULT 0,
  gift_cards decimal(10,2) DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create staff attendance table
CREATE TABLE public.staff_attendance (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL,
  staff_name text NOT NULL,
  attendance_status text NOT NULL DEFAULT 'present',
  is_bni_day boolean DEFAULT false,
  daily_sales decimal(10,2) DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(date, staff_name)
);

-- Insert predefined staff members (using WHERE NOT EXISTS to avoid duplicates)
INSERT INTO public.staff (name, department, designation)
SELECT 'Pooja', 'Operations', 'Staff Member'
WHERE NOT EXISTS (SELECT 1 FROM public.staff WHERE name = 'Pooja');

INSERT INTO public.staff (name, department, designation)
SELECT 'Inoka', 'Operations', 'Staff Member'
WHERE NOT EXISTS (SELECT 1 FROM public.staff WHERE name = 'Inoka');

INSERT INTO public.staff (name, department, designation)
SELECT 'Kasun', 'Operations', 'Staff Member'
WHERE NOT EXISTS (SELECT 1 FROM public.staff WHERE name = 'Kasun');

INSERT INTO public.staff (name, department, designation)
SELECT 'Dr.Harshana', 'Medical', 'Director'
WHERE NOT EXISTS (SELECT 1 FROM public.staff WHERE name = 'Dr.Harshana');

INSERT INTO public.staff (name, department, designation)
SELECT 'Putri', 'Operations', 'Staff Member'
WHERE NOT EXISTS (SELECT 1 FROM public.staff WHERE name = 'Putri');

INSERT INTO public.staff (name, department, designation)
SELECT 'Elisya', 'Operations', 'Staff Member'
WHERE NOT EXISTS (SELECT 1 FROM public.staff WHERE name = 'Elisya');

INSERT INTO public.staff (name, department, designation)
SELECT 'Udani', 'Operations', 'Staff Member'
WHERE NOT EXISTS (SELECT 1 FROM public.staff WHERE name = 'Udani');

INSERT INTO public.staff (name, department, designation)
SELECT 'Yersin', 'Operations', 'Staff Member'
WHERE NOT EXISTS (SELECT 1 FROM public.staff WHERE name = 'Yersin');

INSERT INTO public.staff (name, department, designation)
SELECT 'Rinoza', 'Operations', 'Staff Member'
WHERE NOT EXISTS (SELECT 1 FROM public.staff WHERE name = 'Rinoza');

INSERT INTO public.staff (name, department, designation)
SELECT 'Jude', 'Operations', 'Staff Member'
WHERE NOT EXISTS (SELECT 1 FROM public.staff WHERE name = 'Jude');

-- Create indexes for better performance
CREATE INDEX idx_daily_sales_reports_date ON public.daily_sales_reports(date);
CREATE INDEX idx_staff_attendance_date ON public.staff_attendance(date);
CREATE INDEX idx_staff_attendance_staff_name ON public.staff_attendance(staff_name);
