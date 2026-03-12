CREATE OR REPLACE FUNCTION public.handle_profile_security()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Check for bypass flag first
  IF (current_setting('app.bypass_coin_trigger', true) = 'true') THEN
    RETURN NEW;
  END IF;

  -- Check if the request comes from a non-privileged role
  IF (auth.role() = 'authenticated' OR auth.role() = 'anon') THEN
    
    -- On INSERT: Force default values
    IF (TG_OP = 'INSERT') THEN
      NEW.role := 'user';
      NEW.coin_balance := 0;
      NEW.lock_status := 'none';
    END IF;
    
    -- On UPDATE: Prevent changing sensitive fields
    IF (TG_OP = 'UPDATE') THEN
      -- Role protection
      IF (NEW.role IS DISTINCT FROM OLD.role) THEN
         RAISE EXCEPTION 'You are not allowed to update your role.';
      END IF;
      
      -- Balance protection
      IF (NEW.coin_balance IS DISTINCT FROM OLD.coin_balance) THEN
         RAISE EXCEPTION 'You are not allowed to update your coin balance.';
      END IF;

      -- Lock Status protection (CRITICAL)
      IF (NEW.lock_status IS DISTINCT FROM OLD.lock_status) THEN
         RAISE EXCEPTION 'You are not allowed to update your lock status.';
      END IF;

      -- Email protection (Should be managed via auth)
      IF (NEW.email IS DISTINCT FROM OLD.email) THEN
         RAISE EXCEPTION 'You are not allowed to update your email directly. Use account settings.';
      END IF;
    END IF;
    
  END IF;
  RETURN NEW;
END;
$function$
;
