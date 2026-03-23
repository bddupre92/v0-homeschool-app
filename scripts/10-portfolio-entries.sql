CREATE TABLE IF NOT EXISTS portfolio_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL DEFAULT 'work_sample',
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  date DATE DEFAULT CURRENT_DATE,
  file_url TEXT,
  file_type TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_portfolio_entries_user_id ON portfolio_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_entries_child_id ON portfolio_entries(child_id);
