-- Drop the existing type_check constraint
ALTER TABLE public.stack_items
DROP CONSTRAINT IF EXISTS type_check;

-- Add the updated type_check constraint with 'habit' and 'practice' types
ALTER TABLE public.stack_items
ADD CONSTRAINT type_check CHECK (type IN ('supplement', 'food', 'habit', 'practice', 'other')); 