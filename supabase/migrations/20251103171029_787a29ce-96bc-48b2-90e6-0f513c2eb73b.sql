-- Set common password to 'reliarse' in config table
-- 1) Update if exists
UPDATE public.config
SET value = 'reliarse', updated_at = now()
WHERE key = 'common_password';

-- 2) Insert if missing
INSERT INTO public.config (key, value)
SELECT 'common_password', 'reliarse'
WHERE NOT EXISTS (
  SELECT 1 FROM public.config WHERE key = 'common_password'
);
