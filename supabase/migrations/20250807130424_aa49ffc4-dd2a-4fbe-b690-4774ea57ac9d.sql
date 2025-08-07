-- Add RLS policies for posts table to allow admin operations
-- Allow admins to insert posts
CREATE POLICY "Admins can create posts" 
ON public.posts 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM users u 
  WHERE u.email::text = auth.email() 
  AND u.is_admin = true
));

-- Allow admins to update posts
CREATE POLICY "Admins can update posts" 
ON public.posts 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM users u 
  WHERE u.email::text = auth.email() 
  AND u.is_admin = true
));

-- Allow admins to delete posts
CREATE POLICY "Admins can delete posts" 
ON public.posts 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM users u 
  WHERE u.email::text = auth.email() 
  AND u.is_admin = true
));