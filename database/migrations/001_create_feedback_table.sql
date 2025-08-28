-- Migration: Create feedback table for anonymous feedback storage
-- Description: Sets up the feedback table for storing user feedback on AI reflections
-- Created: 2025-08-28

CREATE TABLE feedback (
  feedback_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reflection_id VARCHAR(255) NOT NULL,
  feedback_type VARCHAR(10) NOT NULL CHECK (feedback_type IN ('positive', 'negative')),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for optimal query performance
CREATE INDEX idx_feedback_reflection_id ON feedback(reflection_id);
CREATE INDEX idx_feedback_created_at ON feedback(created_at);

-- Add comment for documentation
COMMENT ON TABLE feedback IS 'Stores anonymous user feedback on AI reflection responses';
COMMENT ON COLUMN feedback.feedback_id IS 'Unique identifier for each feedback entry';
COMMENT ON COLUMN feedback.reflection_id IS 'Links feedback to specific AI reflection response';
COMMENT ON COLUMN feedback.feedback_type IS 'Type of feedback: positive or negative';
COMMENT ON COLUMN feedback.user_agent IS 'Browser/device information for context';
COMMENT ON COLUMN feedback.created_at IS 'Timestamp when feedback was submitted';