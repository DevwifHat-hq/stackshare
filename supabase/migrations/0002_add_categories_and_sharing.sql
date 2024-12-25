-- Add categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add some initial categories if table is empty
INSERT INTO categories (name, slug, description)
SELECT name, slug, description
FROM (VALUES
  ('Cognitive Enhancement', 'cognitive-enhancement', 'Stacks focused on improving memory, focus, and mental performance'),
  ('Energy & Vitality', 'energy-vitality', 'Stacks for boosting energy levels and overall vitality'),
  ('Sleep Optimization', 'sleep-optimization', 'Stacks designed to improve sleep quality and recovery'),
  ('Stress Management', 'stress-management', 'Stacks for reducing stress and promoting relaxation'),
  ('Physical Performance', 'physical-performance', 'Stacks for athletic performance and muscle recovery'),
  ('Longevity', 'longevity', 'Stacks focused on healthy aging and life extension'),
  ('Immune Support', 'immune-support', 'Stacks for boosting immune system function'),
  ('Mood Enhancement', 'mood-enhancement', 'Stacks for improving mood and emotional well-being')
) AS v(name, slug, description)
WHERE NOT EXISTS (SELECT 1 FROM categories LIMIT 1);

-- Add fields to stacks table if they don't exist
DO $$ 
BEGIN
  BEGIN
    ALTER TABLE stacks ADD COLUMN is_public BOOLEAN DEFAULT false;
  EXCEPTION
    WHEN duplicate_column THEN NULL;
  END;

  BEGIN
    ALTER TABLE stacks ADD COLUMN category_id UUID REFERENCES categories(id);
  EXCEPTION
    WHEN duplicate_column THEN NULL;
  END;

  BEGIN
    ALTER TABLE stacks ADD COLUMN purpose TEXT;
  EXCEPTION
    WHEN duplicate_column THEN NULL;
  END;

  BEGIN
    ALTER TABLE stacks ADD COLUMN views INTEGER DEFAULT 0;
  EXCEPTION
    WHEN duplicate_column THEN NULL;
  END;

  BEGIN
    ALTER TABLE stacks ADD COLUMN likes INTEGER DEFAULT 0;
  EXCEPTION
    WHEN duplicate_column THEN NULL;
  END;
END $$;

-- Create stack_likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS stack_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  stack_id UUID REFERENCES stacks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(stack_id, user_id)
);

-- Create stack_views table if it doesn't exist
CREATE TABLE IF NOT EXISTS stack_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  stack_id UUID REFERENCES stacks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(stack_id, user_id)
);

-- Add RLS policies if they don't exist
DO $$ 
BEGIN
  -- Enable RLS on tables
  ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
  ALTER TABLE stack_likes ENABLE ROW LEVEL SECURITY;
  ALTER TABLE stack_views ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Drop existing policies if they exist and create new ones
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Users can like stacks" ON stack_likes;
DROP POLICY IF EXISTS "Users can unlike their likes" ON stack_likes;
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON stack_likes;
DROP POLICY IF EXISTS "Users can view stacks" ON stack_views;
DROP POLICY IF EXISTS "Views are viewable by everyone" ON stack_views;
DROP POLICY IF EXISTS "Stacks are viewable by owner only" ON stacks;
DROP POLICY IF EXISTS "Stacks are viewable by owner or if public" ON stacks;

-- Create new policies
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Users can like stacks" ON stack_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their likes" ON stack_likes
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Likes are viewable by everyone" ON stack_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can view stacks" ON stack_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Views are viewable by everyone" ON stack_views
  FOR SELECT USING (true);

CREATE POLICY "Stacks are viewable by owner or if public" ON stacks
  FOR SELECT USING (auth.uid() = user_id OR is_public = true); 