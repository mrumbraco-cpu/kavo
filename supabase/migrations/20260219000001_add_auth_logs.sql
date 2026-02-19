-- AUTH LOGS TABLE FOR RATE LIMITING
CREATE TABLE IF NOT EXISTS public.auth_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ip_address TEXT,
    event_type TEXT NOT NULL, -- 'login', 'register', 'password_reset'
    status TEXT NOT NULL, -- 'success', 'failure'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for rate limiting queries
CREATE INDEX IF NOT EXISTS idx_auth_logs_ip_event_created 
ON public.auth_logs(ip_address, event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_auth_logs_user_event_created 
ON public.auth_logs(user_id, event_type, created_at DESC);

-- RLS
ALTER TABLE public.auth_logs ENABLE ROW LEVEL SECURITY;

-- Only service role can manage logs
CREATE POLICY "Service role full access on auth_logs"
ON public.auth_logs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Maintenance: Cleanup older than 7 days
CREATE OR REPLACE FUNCTION cleanup_old_auth_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.auth_logs
    WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$;
