-- Drop the existing select policy for stack_items
DROP POLICY IF EXISTS "Users can view items in their stacks" ON stack_items;

-- Create new policy to allow viewing items in public stacks or owned stacks
CREATE POLICY "Users can view items in public or owned stacks"
ON stack_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM stacks
    WHERE id = stack_items.stack_id
    AND (is_public = true OR user_id = auth.uid())
  )
); 