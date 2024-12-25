-- Add version tracking and forking support to stacks
DO $$ 
BEGIN
    -- Add version if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'stacks' AND column_name = 'version') THEN
        ALTER TABLE stacks ADD COLUMN version VARCHAR(10) DEFAULT '1.0.0';
    END IF;

    -- Add forks_count if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'stacks' AND column_name = 'forks_count') THEN
        ALTER TABLE stacks ADD COLUMN forks_count INTEGER DEFAULT 0;
    END IF;

    -- Add forked_from_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'stacks' AND column_name = 'forked_from_id') THEN
        ALTER TABLE stacks ADD COLUMN forked_from_id UUID REFERENCES stacks(id);
    END IF;
END $$;

-- Create a function to increment the forks count
CREATE OR REPLACE FUNCTION increment_stack_forks()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE stacks
  SET forks_count = forks_count + 1
  WHERE id = NEW.forked_from_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists and create it again
DROP TRIGGER IF EXISTS increment_forks_after_insert ON stacks;
CREATE TRIGGER increment_forks_after_insert
  AFTER INSERT ON stacks
  FOR EACH ROW
  WHEN (NEW.forked_from_id IS NOT NULL)
  EXECUTE FUNCTION increment_stack_forks();

-- Create or replace the fork_stack function
CREATE OR REPLACE FUNCTION fork_stack(
  original_stack_id UUID,
  new_user_id UUID,
  new_name TEXT DEFAULT NULL,
  new_description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_stack_id UUID;
  original_stack stacks;
BEGIN
  -- Get original stack
  SELECT * INTO original_stack FROM stacks WHERE id = original_stack_id;
  
  -- Create new stack
  INSERT INTO stacks (
    name,
    description,
    user_id,
    category_id,
    forked_from_id,
    version
  ) VALUES (
    COALESCE(new_name, 'Fork of ' || original_stack.name),
    COALESCE(new_description, original_stack.description),
    new_user_id,
    original_stack.category_id,
    original_stack_id,
    '1.0.0'
  ) RETURNING id INTO new_stack_id;

  -- Copy stack items
  INSERT INTO stack_items (
    stack_id,
    name,
    description,
    type,
    dosage,
    frequency,
    timing,
    notes
  )
  SELECT 
    new_stack_id,
    name,
    description,
    type,
    dosage,
    frequency,
    timing,
    notes
  FROM stack_items
  WHERE stack_id = original_stack_id;

  RETURN new_stack_id;
END;
$$ LANGUAGE plpgsql; 