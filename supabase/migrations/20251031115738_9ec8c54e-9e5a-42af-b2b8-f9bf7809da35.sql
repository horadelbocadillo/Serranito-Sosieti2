-- Drop existing admin policies for posts that use auth.uid()
DROP POLICY IF EXISTS "Admins can create posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can update posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can delete posts" ON public.posts;

-- Create new policies using email verification
CREATE POLICY "Admins can create posts" 
ON public.posts 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM users u 
    WHERE u.email::text = auth.email() 
    AND u.is_admin = true
  )
);

CREATE POLICY "Admins can update posts" 
ON public.posts 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 
    FROM users u 
    WHERE u.email::text = auth.email() 
    AND u.is_admin = true
  )
);

CREATE POLICY "Admins can delete posts" 
ON public.posts 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 
    FROM users u 
    WHERE u.email::text = auth.email() 
    AND u.is_admin = true
  )
);