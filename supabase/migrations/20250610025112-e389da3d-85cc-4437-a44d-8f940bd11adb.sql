
-- Create staff table
CREATE TABLE public.staff (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  designation TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for staff table
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Create policies for staff table (public access since this is internal company data)
CREATE POLICY "Allow public read access on staff" ON public.staff FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on staff" ON public.staff FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on staff" ON public.staff FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on staff" ON public.staff FOR DELETE USING (true);

-- Create social_posts table
CREATE TABLE public.social_posts (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  platform TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  date DATE NOT NULL,
  time TEXT NOT NULL,
  media TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for social_posts table
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for social_posts table (public access since this is internal company data)
CREATE POLICY "Allow public read access on social_posts" ON public.social_posts FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on social_posts" ON public.social_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on social_posts" ON public.social_posts FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on social_posts" ON public.social_posts FOR DELETE USING (true);

-- Enable realtime for all tables to ensure cross-device sync
ALTER TABLE public.staff REPLICA IDENTITY FULL;
ALTER TABLE public.social_posts REPLICA IDENTITY FULL;
ALTER TABLE public.action_items REPLICA IDENTITY FULL;
ALTER TABLE public.meeting_minutes REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.staff;
ALTER PUBLICATION supabase_realtime ADD TABLE public.social_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.action_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meeting_minutes;
