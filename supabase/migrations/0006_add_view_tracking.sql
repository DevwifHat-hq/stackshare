-- Create function to track stack views
CREATE OR REPLACE FUNCTION increment_stack_view(stack_id uuid, viewer_id uuid)
RETURNS void AS $$
BEGIN
  -- Insert view record if it doesn't exist
  INSERT INTO stack_views (stack_id, user_id)
  VALUES (stack_id, viewer_id)
  ON CONFLICT (stack_id, user_id) DO NOTHING;

  -- Increment view count
  UPDATE stacks
  SET views = views + 1
  WHERE id = stack_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 