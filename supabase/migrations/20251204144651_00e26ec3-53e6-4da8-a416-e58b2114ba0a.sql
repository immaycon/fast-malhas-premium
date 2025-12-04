-- Create admin_keys table for master key security
CREATE TABLE public.admin_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  used_by UUID REFERENCES auth.users(id),
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_keys ENABLE ROW LEVEL SECURITY;

-- Only admins can view keys
CREATE POLICY "Only admins can view admin keys"
ON public.admin_keys
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert 10 master keys
INSERT INTO public.admin_keys (key) VALUES
  ('FAST-ADM-2025-A7X9K2M4'),
  ('FAST-ADM-2025-B3N8P6Q1'),
  ('FAST-ADM-2025-C5R2T9W7'),
  ('FAST-ADM-2025-D1F6H4J8'),
  ('FAST-ADM-2025-E9G3L7V2'),
  ('FAST-ADM-2025-F4K8M1N5'),
  ('FAST-ADM-2025-G6P2R9S3'),
  ('FAST-ADM-2025-H8T4W7X1'),
  ('FAST-ADM-2025-J2Y6Z9A5'),
  ('FAST-ADM-2025-K7B1C4D8');

-- Create function to validate and use admin key
CREATE OR REPLACE FUNCTION public.use_admin_key(_key TEXT, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  key_record RECORD;
BEGIN
  -- Find unused key
  SELECT * INTO key_record FROM admin_keys 
  WHERE key = _key AND used_by IS NULL;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Mark key as used
  UPDATE admin_keys 
  SET used_by = _user_id, used_at = now() 
  WHERE id = key_record.id;
  
  -- Grant admin role
  INSERT INTO user_roles (user_id, role) 
  VALUES (_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN TRUE;
END;
$$;