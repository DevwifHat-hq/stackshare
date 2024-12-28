-- Add forking support columns
ALTER TABLE public.stacks 
ADD COLUMN IF NOT EXISTS fork_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS forked_from_id UUID REFERENCES public.stacks(id),
ADD COLUMN IF NOT EXISTS active_users_count INTEGER DEFAULT 0;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_stacks_forked_from ON public.stacks(forked_from_id);

-- Function to update active users count
CREATE OR REPLACE FUNCTION update_stack_active_users()
RETURNS TRIGGER AS $$
BEGIN
  -- Update active users count for the stack
  UPDATE public.stacks
  SET active_users_count = (
    SELECT COUNT(DISTINCT user_id)
    FROM public.daily_logs
    WHERE stack_id = NEW.stack_id
    AND created_at > NOW() - INTERVAL '30 days'
  )
  WHERE id = NEW.stack_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update active users count when new logs are added
DROP TRIGGER IF EXISTS update_stack_active_users_trigger ON public.daily_logs;
CREATE TRIGGER update_stack_active_users_trigger
AFTER INSERT OR UPDATE ON public.daily_logs
FOR EACH ROW
EXECUTE FUNCTION update_stack_active_users();

-- Update RLS policies
ALTER TABLE public.stacks ENABLE ROW LEVEL SECURITY;

-- Allow users to fork public stacks
CREATE POLICY "Users can fork public stacks"
    ON public.stacks
    FOR SELECT
    TO authenticated
    USING (
        is_public = true OR
        user_id = auth.uid() OR
        id IN (
            SELECT stack_id 
            FROM public.daily_logs 
            WHERE user_id = auth.uid()
        )
    ); 