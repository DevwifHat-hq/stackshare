-- Add test stack items
INSERT INTO public.stack_items (
  id,
  stack_id,
  name,
  description,
  type,
  dosage,
  timing,
  frequency,
  created_at
)
VALUES 
  -- Sleep Optimization Stack Items
  (
    'bbbbbbbb-9991-4999-9999-999999999991',
    'aaaaaaaa-1111-4111-1111-111111111111',
    'Magnesium L-Threonate',
    'Advanced form of magnesium for cognitive function and sleep',
    'supplement',
    '2000mg',
    'Evening',
    'daily',
    now()
  ),
  (
    'bbbbbbbb-9992-4999-9999-999999999992',
    'aaaaaaaa-1111-4111-1111-111111111111',
    'Chamomile Tea',
    'Calming herbal tea for better sleep',
    'food',
    '1 cup',
    '1 hour before bed',
    'daily',
    now()
  ),
  (
    'bbbbbbbb-9993-4999-9999-999999999993',
    'aaaaaaaa-1111-4111-1111-111111111111',
    'Sleep Meditation',
    'Guided meditation for deep relaxation',
    'practice',
    null,
    'Bedtime',
    'daily',
    now()
  ),

  -- Cognitive Enhancement Stack Items
  (
    'bbbbbbbb-9994-4999-9999-999999999994',
    'aaaaaaaa-2222-4222-2222-222222222222',
    'Alpha GPC',
    'Choline source for cognitive enhancement',
    'supplement',
    '300mg',
    'Morning',
    'daily',
    now()
  ),
  (
    'bbbbbbbb-9995-4999-9999-999999999995',
    'aaaaaaaa-2222-4222-2222-222222222222',
    'Lion''s Mane Extract',
    'Medicinal mushroom for neural growth',
    'supplement',
    '1000mg',
    'With breakfast',
    'twice daily',
    now()
  ),
  (
    'bbbbbbbb-9996-4999-9999-999999999996',
    'aaaaaaaa-2222-4222-2222-222222222222',
    'Brain Training',
    'Dual N-back training for working memory',
    'practice',
    null,
    'Morning',
    'daily',
    now()
  ),

  -- Athletic Recovery Stack Items
  (
    'bbbbbbbb-9997-4999-9999-999999999997',
    'aaaaaaaa-3333-4333-3333-333333333333',
    'Creatine Monohydrate',
    'For muscle recovery and strength',
    'supplement',
    '5g',
    'Post-workout',
    'daily',
    now()
  ),
  (
    'bbbbbbbb-9998-4999-9999-999999999998',
    'aaaaaaaa-3333-4333-3333-333333333333',
    'BCAA Complex',
    'Branch chain amino acids for recovery',
    'supplement',
    '10g',
    'During workout',
    'training days',
    now()
  ),
  (
    'bbbbbbbb-9999-4999-9999-999999999999',
    'aaaaaaaa-3333-4333-3333-333333333333',
    'Contrast Shower',
    'Alternating hot and cold exposure',
    'practice',
    null,
    'Post-workout',
    'daily',
    now()
  ),

  -- Longevity Stack Items
  (
    'bbbbbbbb-9981-4999-9999-999999999981',
    'aaaaaaaa-4444-4444-4444-444444444444',
    'NMN (Nicotinamide Mononucleotide)',
    'NAD+ precursor for cellular energy',
    'supplement',
    '500mg',
    'Morning',
    'daily',
    now()
  ),
  (
    'bbbbbbbb-9982-4999-9999-999999999982',
    'aaaaaaaa-4444-4444-4444-444444444444',
    'Berberine',
    'For metabolic health and longevity',
    'supplement',
    '500mg',
    'With meals',
    'thrice daily',
    now()
  ),
  (
    'bbbbbbbb-9983-4999-9999-999999999983',
    'aaaaaaaa-4444-4444-4444-444444444444',
    'Intermittent Fasting',
    '16/8 fasting protocol',
    'practice',
    null,
    'Daily window: 12pm-8pm',
    'daily',
    now()
  ),

  -- Stress Management Stack Items
  (
    'bbbbbbbb-9971-4999-9999-999999999971',
    'aaaaaaaa-5555-4555-5555-555555555555',
    'Ashwagandha KSM-66',
    'Adaptogenic herb for stress reduction',
    'supplement',
    '600mg',
    'Morning and evening',
    'daily',
    now()
  ),
  (
    'bbbbbbbb-9972-4999-9999-999999999972',
    'aaaaaaaa-5555-4555-5555-555555555555',
    'Holy Basil Tea',
    'Adaptogenic tea for stress relief',
    'food',
    '1 cup',
    'Afternoon',
    'daily',
    now()
  ),
  (
    'bbbbbbbb-9973-4999-9999-999999999973',
    'aaaaaaaa-5555-4555-5555-555555555555',
    'Box Breathing',
    '4-4-4-4 breathing pattern',
    'practice',
    null,
    'Throughout day',
    '3 times daily',
    now()
  ),

  -- Gut Health Stack Items
  (
    'bbbbbbbb-9961-4999-9999-999999999961',
    'aaaaaaaa-6666-4666-6666-666666666666',
    'Spore-Based Probiotic',
    'Soil-based organisms for gut health',
    'supplement',
    '2 capsules',
    'Morning',
    'daily',
    now()
  ),
  (
    'bbbbbbbb-9962-4999-9999-999999999962',
    'aaaaaaaa-6666-4666-6666-666666666666',
    'Fermented Foods',
    'Kimchi, sauerkraut, or kombucha',
    'food',
    '1/2 cup',
    'With meals',
    'daily',
    now()
  ),
  (
    'bbbbbbbb-9963-4999-9999-999999999963',
    'aaaaaaaa-6666-4666-6666-666666666666',
    'Digestive Walking',
    '10-minute walk after meals',
    'practice',
    null,
    'After main meals',
    'thrice daily',
    now()
  ); 