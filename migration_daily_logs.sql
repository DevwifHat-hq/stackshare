-- Add stack_id column to daily_logs if it doesn't exist
ALTER TABLE public.daily_logs 
ADD COLUMN IF NOT EXISTS stack_id UUID REFERENCES public.stacks(id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_daily_logs_stack_id ON public.daily_logs(stack_id);

-- Update RLS policies
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own logs and logs for public stacks
CREATE POLICY "Users can view their own logs and logs for public stacks"
    ON public.daily_logs
    FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid() OR
        (stack_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.stacks s
            WHERE s.id = stack_id
            AND s.is_public = true
        ))
    );

-- Allow users to insert their own logs
CREATE POLICY "Users can insert their own logs"
    ON public.daily_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Allow users to update their own logs
CREATE POLICY "Users can update their own logs"
    ON public.daily_logs
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

-- Allow users to delete their own logs
CREATE POLICY "Users can delete their own logs"
    ON public.daily_logs
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid()); 