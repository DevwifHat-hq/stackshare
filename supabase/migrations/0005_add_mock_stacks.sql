-- Create mock users
INSERT INTO auth.users (id, email, created_at)
VALUES 
  ('d0d8c19c-3b3e-4f5a-9b1a-e3cdb7f456d9', 'sarah.wellness@example.com', now()),
  ('e1f2a3b4-c5d6-4e7f-8d7c-9b8a7c6d5e4f', 'david.biohacker@example.com', now()),
  ('f6e5d4c3-b2a1-4f3e-8d7c-9b8a7c6d5e4f', 'mike.performance@example.com', now()),
  ('a1b2c3d4-e5f6-4a3b-8c7d-2e1f3a4b5c6d', 'emma.nutrition@example.com', now());

-- Create user profiles
INSERT INTO public.user_profiles (id, full_name, username, avatar_url)
VALUES 
  ('d0d8c19c-3b3e-4f5a-9b1a-e3cdb7f456d9', 'Sarah Chen', 'sarahchen', 'https://api.dicebear.com/7.x/personas/svg?seed=sarah'),
  ('e1f2a3b4-c5d6-4e7f-8d7c-9b8a7c6d5e4f', 'David Miller', 'davidmiller', 'https://api.dicebear.com/7.x/personas/svg?seed=david'),
  ('f6e5d4c3-b2a1-4f3e-8d7c-9b8a7c6d5e4f', 'Mike Johnson', 'mikejohnson', 'https://api.dicebear.com/7.x/personas/svg?seed=mike'),
  ('a1b2c3d4-e5f6-4a3b-8c7d-2e1f3a4b5c6d', 'Emma Wilson', 'emmawilson', 'https://api.dicebear.com/7.x/personas/svg?seed=emma')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  username = EXCLUDED.username,
  avatar_url = EXCLUDED.avatar_url;

-- Create mock stacks
INSERT INTO public.stacks (id, name, description, purpose, is_public, user_id, category_id, created_at, views, likes)
SELECT 
  'aaaaaaaa-1111-4111-1111-111111111111',
  'Ultimate Sleep Optimization Protocol',
  'A comprehensive stack designed to optimize sleep quality and recovery. Combines supplements, lifestyle changes, and technology for better sleep.',
  'Improve sleep quality, reduce sleep latency, and enhance recovery',
  true,
  'd0d8c19c-3b3e-4f5a-9b1a-e3cdb7f456d9',
  id,
  now() - interval '2 days',
  156,
  42
FROM categories WHERE slug = 'sleep-optimization';

INSERT INTO public.stacks (id, name, description, purpose, is_public, user_id, category_id, created_at, views, likes)
SELECT 
  'aaaaaaaa-2222-4222-2222-222222222222',
  'Cognitive Peak Performance',
  'A nootropic stack focused on enhancing mental clarity, focus, and memory. Perfect for knowledge workers and students.',
  'Enhance cognitive function and mental performance',
  true,
  'e1f2a3b4-c5d6-4e7f-8d7c-9b8a7c6d5e4f',
  id,
  now() - interval '5 days',
  234,
  89
FROM categories WHERE slug = 'cognitive-enhancement';

INSERT INTO public.stacks (id, name, description, purpose, is_public, user_id, category_id, created_at, views, likes)
SELECT 
  'aaaaaaaa-3333-4333-3333-333333333333',
  'Athletic Recovery Protocol',
  'Comprehensive post-workout recovery stack including supplements, mobility work, and recovery techniques.',
  'Accelerate recovery and reduce muscle soreness',
  true,
  'f6e5d4c3-b2a1-4f3e-8d7c-9b8a7c6d5e4f',
  id,
  now() - interval '1 day',
  178,
  65
FROM categories WHERE slug = 'physical-performance';

INSERT INTO public.stacks (id, name, description, purpose, is_public, user_id, category_id, created_at, views, likes)
SELECT 
  'aaaaaaaa-4444-4444-4444-444444444444',
  'Longevity Foundation Stack',
  'Evidence-based longevity stack focusing on cellular health, DNA protection, and metabolic optimization.',
  'Support healthy aging and cellular function',
  true,
  'a1b2c3d4-e5f6-4a3b-8c7d-2e1f3a4b5c6d',
  id,
  now() - interval '3 days',
  312,
  145
FROM categories WHERE slug = 'longevity';

INSERT INTO public.stacks (id, name, description, purpose, is_public, user_id, category_id, created_at, views, likes)
SELECT 
  'aaaaaaaa-5555-4555-5555-555555555555',
  'Stress Resilience Protocol',
  'Adaptogenic stack designed to improve stress resistance and promote emotional balance.',
  'Build resilience to stress and improve emotional well-being',
  true,
  'd0d8c19c-3b3e-4f5a-9b1a-e3cdb7f456d9',
  id,
  now() - interval '4 days',
  198,
  76
FROM categories WHERE slug = 'stress-management';

INSERT INTO public.stacks (id, name, description, purpose, is_public, user_id, category_id, created_at, views, likes)
SELECT 
  'aaaaaaaa-6666-4666-6666-666666666666',
  'Gut Health Optimization',
  'Comprehensive protocol for optimizing gut health, including prebiotics, probiotics, and digestive support.',
  'Improve digestive health and strengthen gut barrier',
  true,
  'e1f2a3b4-c5d6-4e7f-8d7c-9b8a7c6d5e4f',
  id,
  now() - interval '6 days',
  245,
  92
FROM categories WHERE slug = 'immune-support';

-- Create stack items
INSERT INTO public.stack_items (id, stack_id, name, description, type, dosage, frequency, timing, created_at)
VALUES 
  -- Sleep Stack Items
  (
    'bbbbbbbb-1111-4111-1111-111111111111',
    'aaaaaaaa-1111-4111-1111-111111111111',
    'Magnesium Glycinate',
    'Highly bioavailable form of magnesium that supports relaxation and sleep quality',
    'supplement',
    '400mg',
    'daily',
    '1 hour before bed',
    now()
  ),
  (
    'bbbbbbbb-1112-4111-1111-111111111111',
    'aaaaaaaa-1111-4111-1111-111111111111',
    'L-Theanine',
    'Amino acid that promotes relaxation without sedation',
    'supplement',
    '200mg',
    'daily',
    '30 minutes before bed',
    now()
  ),
  (
    'bbbbbbbb-1113-4111-1111-111111111111',
    'aaaaaaaa-1111-4111-1111-111111111111',
    'Blue Light Blocking Glasses',
    'Filters out blue light from screens and LED lighting',
    'other',
    null,
    'daily',
    'After sunset',
    now()
  ),

  -- Cognitive Stack Items
  (
    'bbbbbbbb-2221-4222-2222-222222222222',
    'aaaaaaaa-2222-4222-2222-222222222222',
    'Lion''s Mane Extract',
    'Medicinal mushroom that supports nerve growth factor production',
    'supplement',
    '1000mg',
    'daily',
    'Morning with breakfast',
    now()
  ),
  (
    'bbbbbbbb-2222-4222-2222-222222222222',
    'aaaaaaaa-2222-4222-2222-222222222222',
    'Alpha GPC',
    'Choline source that supports cognitive function and memory',
    'supplement',
    '300mg',
    'twice daily',
    'Morning and afternoon',
    now()
  ),
  (
    'bbbbbbbb-2223-4222-2222-222222222222',
    'aaaaaaaa-2222-4222-2222-222222222222',
    'Meditation Practice',
    'Daily mindfulness meditation for mental clarity',
    'practice',
    null,
    'daily',
    '20 minutes in the morning',
    now()
  ),

  -- Athletic Recovery Stack Items
  (
    'bbbbbbbb-3331-4333-3333-333333333333',
    'aaaaaaaa-3333-4333-3333-333333333333',
    'Creatine Monohydrate',
    'Supports muscle recovery and power output',
    'supplement',
    '5g',
    'daily',
    'Post-workout',
    now()
  ),
  (
    'bbbbbbbb-3332-4333-3333-333333333333',
    'aaaaaaaa-3333-4333-3333-333333333333',
    'Essential Amino Acids',
    'Supports muscle protein synthesis and recovery',
    'supplement',
    '10g',
    'daily',
    'During workout',
    now()
  ),
  (
    'bbbbbbbb-3333-4333-3333-333333333333',
    'aaaaaaaa-3333-4333-3333-333333333333',
    'Foam Rolling',
    'Myofascial release for muscle recovery',
    'practice',
    null,
    'daily',
    '10-15 minutes post-workout',
    now()
  ),

  -- Longevity Stack Items
  (
    'bbbbbbbb-4441-4444-4444-444444444444',
    'aaaaaaaa-4444-4444-4444-444444444444',
    'NMN (Nicotinamide Mononucleotide)',
    'NAD+ precursor for cellular energy and longevity',
    'supplement',
    '500mg',
    'daily',
    'Morning with breakfast',
    now()
  ),
  (
    'bbbbbbbb-4442-4444-4444-444444444444',
    'aaaaaaaa-4444-4444-4444-444444444444',
    'Resveratrol',
    'Activates longevity pathways and supports cellular health',
    'supplement',
    '100mg',
    'daily',
    'Morning with fatty meal',
    now()
  ),
  (
    'bbbbbbbb-4443-4444-4444-444444444444',
    'aaaaaaaa-4444-4444-4444-444444444444',
    'Cold Exposure',
    'Cold showers or ice baths for hormetic stress',
    'practice',
    null,
    '3-4 times per week',
    '2-3 minutes in the morning',
    now()
  ),

  -- Stress Resilience Stack Items
  (
    'bbbbbbbb-5551-4555-5555-555555555555',
    'aaaaaaaa-5555-4555-5555-555555555555',
    'Ashwagandha KSM-66',
    'Adaptogenic herb that helps reduce stress and anxiety',
    'supplement',
    '600mg',
    'daily',
    'Morning and evening',
    now()
  ),
  (
    'bbbbbbbb-5552-4555-5555-555555555555',
    'aaaaaaaa-5555-4555-5555-555555555555',
    'L-Theanine',
    'Promotes calm focus and reduces stress',
    'supplement',
    '200mg',
    'as needed',
    'During stressful situations',
    now()
  ),
  (
    'bbbbbbbb-5553-4555-5555-555555555555',
    'aaaaaaaa-5555-4555-5555-555555555555',
    'Box Breathing',
    '4-4-4-4 breathing pattern for stress reduction',
    'practice',
    null,
    'daily',
    '5 minutes, 3 times per day',
    now()
  ),

  -- Gut Health Stack Items
  (
    'bbbbbbbb-6661-4666-6666-666666666666',
    'aaaaaaaa-6666-4666-6666-666666666666',
    'Probiotic Complex',
    'Multi-strain probiotic for gut microbiome support',
    'supplement',
    '30 billion CFU',
    'daily',
    'Morning on empty stomach',
    now()
  ),
  (
    'bbbbbbbb-6662-4666-6666-666666666666',
    'aaaaaaaa-6666-4666-6666-666666666666',
    'L-Glutamine',
    'Amino acid for gut lining support',
    'supplement',
    '5g',
    'daily',
    'Between meals',
    now()
  ),
  (
    'bbbbbbbb-6663-4666-6666-666666666666',
    'aaaaaaaa-6666-4666-6666-666666666666',
    'Fermented Foods',
    'Daily serving of sauerkraut, kimchi, or kefir',
    'food',
    '1-2 servings',
    'daily',
    'With meals',
    now()
  );

-- Create some likes and saves
INSERT INTO public.stack_likes (stack_id, user_id)
VALUES 
  ('aaaaaaaa-1111-4111-1111-111111111111', 'e1f2a3b4-c5d6-4e7f-8d7c-9b8a7c6d5e4f'),
  ('aaaaaaaa-1111-4111-1111-111111111111', 'f6e5d4c3-b2a1-4f3e-8d7c-9b8a7c6d5e4f'),
  ('aaaaaaaa-2222-4222-2222-222222222222', 'd0d8c19c-3b3e-4f5a-9b1a-e3cdb7f456d9'),
  ('aaaaaaaa-2222-4222-2222-222222222222', 'a1b2c3d4-e5f6-4a3b-8c7d-2e1f3a4b5c6d'),
  ('aaaaaaaa-3333-4333-3333-333333333333', 'e1f2a3b4-c5d6-4e7f-8d7c-9b8a7c6d5e4f'),
  ('aaaaaaaa-4444-4444-4444-444444444444', 'f6e5d4c3-b2a1-4f3e-8d7c-9b8a7c6d5e4f');

INSERT INTO public.stack_saves (stack_id, user_id)
VALUES 
  ('aaaaaaaa-1111-4111-1111-111111111111', 'a1b2c3d4-e5f6-4a3b-8c7d-2e1f3a4b5c6d'),
  ('aaaaaaaa-2222-4222-2222-222222222222', 'f6e5d4c3-b2a1-4f3e-8d7c-9b8a7c6d5e4f'),
  ('aaaaaaaa-3333-4333-3333-333333333333', 'd0d8c19c-3b3e-4f5a-9b1a-e3cdb7f456d9'),
  ('aaaaaaaa-4444-4444-4444-444444444444', 'e1f2a3b4-c5d6-4e7f-8d7c-9b8a7c6d5e4f');

-- Create some daily logs
INSERT INTO public.daily_logs (id, user_id, date, created_at, metrics)
VALUES 
  (
    'cccccccc-1111-4111-1111-111111111111',
    'd0d8c19c-3b3e-4f5a-9b1a-e3cdb7f456d9',
    CURRENT_DATE - interval '1 day',
    now() - interval '1 day',
    '{"sleep_quality": 8, "energy_level": 9, "mood": 8, "productivity": 9}'
  ),
  (
    'cccccccc-2222-4222-2222-222222222222',
    'e1f2a3b4-c5d6-4e7f-8d7c-9b8a7c6d5e4f',
    CURRENT_DATE - interval '1 day',
    now() - interval '1 day',
    '{"sleep_quality": 7, "energy_level": 8, "mood": 9, "productivity": 8}'
  ),
  (
    'cccccccc-3333-4333-3333-333333333333',
    'f6e5d4c3-b2a1-4f3e-8d7c-9b8a7c6d5e4f',
    CURRENT_DATE - interval '2 days',
    now() - interval '2 days',
    '{"sleep_quality": 9, "energy_level": 8, "mood": 8, "productivity": 7}'
  ),
  (
    'cccccccc-4444-4444-4444-444444444444',
    'a1b2c3d4-e5f6-4a3b-8c7d-2e1f3a4b5c6d',
    CURRENT_DATE - interval '2 days',
    now() - interval '2 days',
    '{"sleep_quality": 8, "energy_level": 7, "mood": 9, "productivity": 8}'
  ); 