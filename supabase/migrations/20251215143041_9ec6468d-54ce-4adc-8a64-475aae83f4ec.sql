-- Allow anyone (including unauthenticated users) to view active products on the public catalog
CREATE POLICY "Anyone can view active products" 
ON public.products 
FOR SELECT 
USING (is_active = true);