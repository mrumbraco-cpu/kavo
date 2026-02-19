-- FIX SECURITY WARNINGS: Function Search Path Mutable
-- This migration sets a fixed search_path for SECURITY DEFINER functions to prevent search path attacks.

-- 1. Profile Security Trigger Function
ALTER FUNCTION public.handle_profile_security() 
SET search_path = public, auth, pg_catalog;

-- 2. Listing Security Trigger Function
ALTER FUNCTION public.handle_listing_security() 
SET search_path = public, auth, pg_catalog;

-- 3. Maintenance Cleanup Function
ALTER FUNCTION public.cleanup_old_auth_logs() 
SET search_path = public, pg_catalog;

-- 4. Contact Unlock RPC
ALTER FUNCTION public.unlock_listing_contact(UUID) 
SET search_path = public, auth, pg_catalog;

-- 5. Topup Process RPC
ALTER FUNCTION public.process_topup_transaction(UUID, INTEGER, TEXT, JSONB) 
SET search_path = public, pg_catalog;

-- 6. Listing Submissions Cleanup
ALTER FUNCTION public.cleanup_old_listing_submissions() 
SET search_path = public, pg_catalog;
