-- Migration 09: Filing documents for compliance proof storage
-- Allows users to upload and attach documents to compliance filings

CREATE TABLE IF NOT EXISTS filing_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filing_id UUID NOT NULL REFERENCES compliance_filings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  file_url TEXT NOT NULL,
  upload_type TEXT DEFAULT 'document',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_filing_documents_filing_id ON filing_documents(filing_id);
CREATE INDEX IF NOT EXISTS idx_filing_documents_user_id ON filing_documents(user_id);
