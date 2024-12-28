-- Create function to increment stack views
CREATE OR REPLACE FUNCTION public.increment_stack_views(p_stack_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO stack_stats (stack_id, views)
  VALUES (p_stack_id, 1)
  ON CONFLICT (stack_id)
  DO UPDATE SET
    views = stack_stats.views + 1,
    updated_at = NOW();
END;
$$;

-- Create function to increment stack forks
CREATE OR REPLACE FUNCTION public.increment_stack_forks(p_stack_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO stack_stats (stack_id, forks)
  VALUES (p_stack_id, 1)
  ON CONFLICT (stack_id)
  DO UPDATE SET
    forks = stack_stats.forks + 1,
    updated_at = NOW();
END;
$$; 