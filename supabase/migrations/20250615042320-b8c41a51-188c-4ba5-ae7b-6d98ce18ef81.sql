
-- First, update any existing staff_attendance records from "Dr.Harshana" to "Dr.Harshana Niriella"
UPDATE public.staff_attendance 
SET staff_name = 'Dr.Harshana Niriella' 
WHERE staff_name = 'Dr.Harshana';

-- Update Dr.Harshana Niriella's record in the staff table with correct department and designation
UPDATE public.staff 
SET department = 'Ayurveda / Marketing', 
    designation = 'Ayurveda Doctor / Wellness Consultant'
WHERE name = 'Dr.Harshana Niriella';

-- Remove the duplicate Dr.Harshana entry from staff table
DELETE FROM public.staff 
WHERE name = 'Dr.Harshana';
