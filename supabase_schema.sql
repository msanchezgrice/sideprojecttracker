-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY,
  email VARCHAR,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planning',
  progress INTEGER NOT NULL DEFAULT 0,
  monthly_cost INTEGER NOT NULL DEFAULT 0,
  last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ai_updates INTEGER NOT NULL DEFAULT 0,
  github_url TEXT,
  live_url TEXT,
  docs_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_last_activity ON projects(last_activity);

-- Insert a test user (optional - for testing)
INSERT INTO users (id, email, first_name, last_name) 
VALUES ('test-user-123', 'test@doodad.ai', 'Test', 'User')
ON CONFLICT (id) DO NOTHING;

-- Insert sample project (optional - for testing)
INSERT INTO projects (user_id, name, description, status, progress, monthly_cost, ai_updates)
VALUES ('test-user-123', 'Sample Project', 'This is a test project', 'active', 75, 2500, 3)
ON CONFLICT DO NOTHING; 