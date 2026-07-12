-- Supabase SQL Schema
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard)

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  name TEXT NOT NULL,
  avatar TEXT DEFAULT '',
  google_id TEXT UNIQUE,
  provider TEXT DEFAULT 'local' CHECK (provider IN ('local', 'google')),
  progress JSONB DEFAULT '[]',
  achievements JSONB DEFAULT '[]',
  stats JSONB DEFAULT '{"lessonsCompleted": 0, "quizzesPassed": 0, "totalQuizScore": 0, "coursesCompleted": 0, "streakDays": 0}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index on google_id for OAuth
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Create policy for authenticated users to update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Create policy for inserting new users (registration)
CREATE POLICY "Allow insert for registration" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Optional: Create a view for user stats
CREATE OR REPLACE VIEW user_stats_view AS
SELECT
  id,
  email,
  name,
  avatar,
  stats->>'lessonsCompleted' as lessons_completed,
  stats->>'quizzesPassed' as quizzes_passed,
  stats->>'streakDays' as streak_days,
  jsonb_array_length(achievements) as achievement_count,
  created_at
FROM users;
