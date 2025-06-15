
-- Create team_notes table to replace localStorage usage
CREATE TABLE public.team_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id text NOT NULL,
  item_type text NOT NULL CHECK (item_type IN ('action', 'social_post')),
  text text NOT NULL,
  author text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_team_notes_item ON public.team_notes(item_id, item_type);
CREATE INDEX idx_team_notes_created_at ON public.team_notes(created_at DESC);

-- Enable RLS (assuming this is internal team data, making it accessible to all authenticated users)
ALTER TABLE public.team_notes ENABLE ROW LEVEL SECURITY;

-- Create policy for team notes access (adjust based on your authentication needs)
CREATE POLICY "Allow all operations on team_notes" 
  ON public.team_notes 
  FOR ALL 
  USING (true)
  WITH CHECK (true);
