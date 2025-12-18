-- Create enum type for task status
CREATE TYPE task_status AS ENUM ('active', 'accomplished', 'carry_over');

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status task_status NOT NULL DEFAULT 'active',
  created_date DATE NOT NULL,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create app_state table
CREATE TABLE IF NOT EXISTS app_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  last_viewed_date DATE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_created_date ON tasks(created_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_date_status ON tasks(created_date, status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_state_updated_at
  BEFORE UPDATE ON app_state
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_state ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations for anonymous users
-- Note: In production, you should restrict these based on user authentication
CREATE POLICY "Allow all operations on tasks for anonymous users"
  ON tasks FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on app_state for anonymous users"
  ON app_state FOR ALL
  USING (true)
  WITH CHECK (true);

