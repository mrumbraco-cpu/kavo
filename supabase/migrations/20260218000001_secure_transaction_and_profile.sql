-- 1. Secure the RPC function (Revoke public access)
REVOKE EXECUTE ON FUNCTION public.process_topup_transaction(uuid, integer, text, jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.process_topup_transaction(uuid, integer, text, jsonb) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_topup_transaction(uuid, integer, text, jsonb) TO service_role;

-- 2. Update Constraint to allow admin_adjustment
ALTER TABLE "public"."coin_transactions" DROP CONSTRAINT IF EXISTS "coin_transactions_type_check";
ALTER TABLE "public"."coin_transactions" ADD CONSTRAINT "coin_transactions_type_check" CHECK (("type" = ANY (ARRAY['topup'::"text", 'reward'::"text", 'unlock'::"text", 'admin_adjustment'::"text"])));

-- 3. Prevent sensitive profile updates (Trigger)
CREATE OR REPLACE FUNCTION prevent_sensitive_updates()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the request comes from an authenticated user (not service_role which bypasses RLS usually, but trigger runs for all)
  -- Supabase auth.role() returns 'authenticated', 'anon', 'service_role' etc.
  IF (auth.role() = 'authenticated' OR auth.role() = 'anon') THEN
    -- Prevent updates to 'role'
    IF (NEW.role IS DISTINCT FROM OLD.role) THEN
       RAISE EXCEPTION 'You are not allowed to update your role.';
    END IF;
    
    -- Prevent updates to 'coin_balance'
    IF (NEW.coin_balance IS DISTINCT FROM OLD.coin_balance) THEN
       RAISE EXCEPTION 'You are not allowed to update your coin balance.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_sensitive_updates ON public.profiles;

CREATE TRIGGER check_sensitive_updates
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION prevent_sensitive_updates();
