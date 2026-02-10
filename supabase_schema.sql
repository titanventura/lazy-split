-- SplitLink Supabase Schema
-- Run this in your Supabase SQL Editor

-- 1. Enable UUID extension (usually enabled by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create 'splits' table
-- Note: 'total_amount' and 'per_person_amount' are in Paise (integer) to avoid floating point issues
CREATE TABLE IF NOT EXISTS splits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  description TEXT NOT NULL,
  total_amount BIGINT NOT NULL,
  number_of_people INTEGER NOT NULL,
  per_person_amount BIGINT NOT NULL,
  creator_name TEXT NOT NULL,
  creator_upi_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create 'participants' table
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  split_id UUID REFERENCES splits(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  has_paid BOOLEAN DEFAULT false NOT NULL,
  marked_paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_participants_split_id ON participants(split_id);

-- 5. Row Level Security (RLS)
-- For MVP, we enable RLS but allow public access. 
-- You can tighten these policies later for authenticated users.
ALTER TABLE splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- 5a. Splits policies
CREATE POLICY "Allow public read access to splits" ON splits FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to splits" ON splits FOR INSERT WITH CHECK (true);

-- 5b. Participants policies
CREATE POLICY "Allow public read access to participants" ON participants FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to participants" ON participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to participants" ON participants FOR UPDATE USING (true);

-- 6. Helper function for Realtime (optional)
-- This allows the UI to potentially listen for payment updates
ALTER PUBLICATION supabase_realtime ADD TABLE splits;
ALTER PUBLICATION supabase_realtime ADD TABLE participants;
