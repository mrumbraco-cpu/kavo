-- SECURITY HARDENING MIGRATION
-- This migration addresses vulnerabilities identified in the security audit.

-- 1. Restrict contact_unlocks (Prevent free unlocks)
DROP POLICY IF EXISTS "User can insert own unlock" ON public.contact_unlocks;
CREATE POLICY "Only service role can insert unlocks" 
ON public.contact_unlocks 
FOR INSERT 
TO service_role 
WITH CHECK (true);

-- 2. Restrict coin_transactions (Prevent fake topups)
DROP POLICY IF EXISTS "Only authenticated user can insert own transaction" ON public.coin_transactions;
CREATE POLICY "Only service role can insert transactions" 
ON public.coin_transactions 
FOR INSERT 
TO service_role 
WITH CHECK (true);

-- 3. Harden profiles table (Prevent self-promotion to admin on insert)
CREATE OR REPLACE FUNCTION public.handle_profile_security()
RETURNS TRIGGER AS $$
BEGIN
  -- Check for bypass flag first
  IF (current_setting('app.bypass_coin_trigger', true) = 'true') THEN
    RETURN NEW;
  END IF;

  -- Check if the request comes from a non-privileged role
  IF (auth.role() = 'authenticated' OR auth.role() = 'anon') THEN
    
    -- On INSERT: Force default role and balance
    IF (TG_OP = 'INSERT') THEN
      NEW.role := 'user';
      NEW.coin_balance := 0;
    END IF;
    
    -- On UPDATE: Prevent changing role or balance
    IF (TG_OP = 'UPDATE') THEN
      IF (NEW.role IS DISTINCT FROM OLD.role) THEN
         RAISE EXCEPTION 'You are not allowed to update your role.';
      END IF;
      
      IF (NEW.coin_balance IS DISTINCT FROM OLD.coin_balance) THEN
         RAISE EXCEPTION 'You are not allowed to update your coin balance.';
      END IF;
    END IF;
    
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach trigger to profiles
DROP TRIGGER IF EXISTS check_sensitive_updates ON public.profiles;
CREATE TRIGGER secure_profiles_trigger
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_profile_security();

-- 4. Harden listings table (Prevent self-approval)
CREATE OR REPLACE FUNCTION public.handle_listing_security()
RETURNS TRIGGER AS $$
BEGIN
  IF (auth.role() = 'authenticated' OR auth.role() = 'anon') THEN
    -- Prevent non-admins from setting status to approved
    IF (NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved' OR OLD.status IS NULL)) THEN
      -- Check if user is actually an admin
      IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
        NEW.status := 'pending';
      END IF;
    END IF;

    -- If listing was already approved and is being updated by owner, reset to pending
    IF (TG_OP = 'UPDATE' AND OLD.status = 'approved' AND NEW.status = 'approved') THEN
       -- Check if user is NOT an admin
       IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
          NEW.status := 'pending';
       END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS secure_listings_trigger ON public.listings;
CREATE TRIGGER secure_listings_trigger
BEFORE INSERT OR UPDATE ON public.listings
FOR EACH ROW
EXECUTE FUNCTION public.handle_listing_security();
