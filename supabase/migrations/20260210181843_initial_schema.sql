-- 1. Drop existing tables if they exist to start fresh
DROP TABLE IF EXISTS participants;
DROP TABLE IF EXISTS splits;
DROP TABLE IF EXISTS users;

-- 2. Create 'users' table for friction-less onboarding
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  upi_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create 'splits' table
CREATE TABLE splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  total_amount BIGINT NOT NULL,
  number_of_people INTEGER NOT NULL,
  per_person_amount BIGINT NOT NULL,
  creator_name TEXT NOT NULL,
  creator_upi_id TEXT NOT NULL,
  creator_id UUID REFERENCES users(id), -- Linked to users table
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create 'participants' table
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  split_id UUID REFERENCES splits(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id), -- Linked to users table
  name TEXT NOT NULL,
  has_paid BOOLEAN DEFAULT false NOT NULL,
  marked_paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Performance Indexes
CREATE INDEX idx_participants_split_id ON participants(split_id);

-- 7. Row Level Security (RLS)
-- For MVP, we enable RLS but allow public access. 
-- You can tighten these policies later for authenticated users.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- 7a. Users policies
CREATE POLICY "Allow public read access to users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to users" ON users FOR UPDATE USING (true);

-- 7b. Splits policies
CREATE POLICY "Allow public read access to splits" ON splits FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to splits" ON splits FOR INSERT WITH CHECK (true);

-- 7c. Participants policies
CREATE POLICY "Allow public read access to participants" ON participants FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to participants" ON participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to participants" ON participants FOR UPDATE USING (true);

-- 8. Helper function for Realtime (optional)
-- This allows the UI to potentially listen for payment updates
ALTER PUBLICATION supabase_realtime ADD TABLE splits;
ALTER PUBLICATION supabase_realtime ADD TABLE participants;
