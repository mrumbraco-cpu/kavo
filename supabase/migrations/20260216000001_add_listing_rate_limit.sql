-- Create table to track listing submissions for rate limiting
CREATE TABLE IF NOT EXISTS public.listing_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
    action TEXT NOT NULL CHECK (action IN ('create', 'update')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient rate limit queries
CREATE INDEX idx_listing_submissions_user_created 
ON public.listing_submissions(user_id, created_at DESC);

-- RLS Policies
ALTER TABLE public.listing_submissions ENABLE ROW LEVEL SECURITY;

-- Users can view their own submission history
CREATE POLICY "Users can view own submissions"
ON public.listing_submissions
FOR SELECT
USING (auth.uid() = user_id);

-- Only backend can insert (via service role)
CREATE POLICY "Service role can insert submissions"
ON public.listing_submissions
FOR INSERT
WITH CHECK (true);

-- Cleanup old records (older than 24 hours) - optional maintenance
CREATE OR REPLACE FUNCTION cleanup_old_listing_submissions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.listing_submissions
    WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$;
