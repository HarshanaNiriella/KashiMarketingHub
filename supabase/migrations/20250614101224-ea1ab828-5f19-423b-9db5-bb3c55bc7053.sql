
-- Create an enum for application roles
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'staff', 'viewer');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    assigned_by UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create a security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user's highest role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY CASE role
    WHEN 'admin' THEN 1
    WHEN 'manager' THEN 2
    WHEN 'staff' THEN 3
    WHEN 'viewer' THEN 4
  END
  LIMIT 1
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles" 
  ON public.user_roles 
  FOR INSERT 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles" 
  ON public.user_roles 
  FOR UPDATE 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles" 
  ON public.user_roles 
  FOR DELETE 
  USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for user_roles table
ALTER TABLE public.user_roles REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;
