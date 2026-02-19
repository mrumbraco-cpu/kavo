-- SECURE CONTACT UNLOCK RPC
-- This function handles the atomic process of unlocking contact information.
-- It ensures:
-- 1. User has enough coins
-- 2. Coins are deducted (if not already unlocked)
-- 3. A transaction record is created
-- 4. An unlock record is created
-- 5. It returns the contact info only on success

CREATE OR REPLACE FUNCTION public.unlock_listing_contact(
  p_listing_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_coin_balance INTEGER;
  v_unlock_cost INTEGER := 10;
  v_already_unlocked BOOLEAN;
  v_is_owner BOOLEAN;
  v_phone_encrypted TEXT;
  v_zalo_encrypted TEXT;
BEGIN
  -- Set bypass flag for the current transaction
  PERFORM set_config('app.bypass_coin_trigger', 'true', true);

  -- 1. Get current user ID
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required');
  END IF;

  -- 2. Check if user is the owner
  SELECT EXISTS (
    SELECT 1 FROM public.listings 
    WHERE id = p_listing_id AND owner_id = v_user_id
  ) INTO v_is_owner;

  -- 3. Check if already unlocked (if not owner)
  IF NOT v_is_owner THEN
    SELECT EXISTS (
      SELECT 1 FROM public.contact_unlocks 
      WHERE user_id = v_user_id AND listing_id = p_listing_id
    ) INTO v_already_unlocked;

    -- 4. If not unlocked and not owner, check balance and deduct
    IF NOT v_already_unlocked THEN
      -- Lock profile for update
      SELECT coin_balance INTO v_coin_balance
      FROM public.profiles
      WHERE id = v_user_id
      FOR UPDATE;

      IF v_coin_balance < v_unlock_cost THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient coins');
      END IF;

      -- Deduct coins
      UPDATE public.profiles
      SET coin_balance = coin_balance - v_unlock_cost
      WHERE id = v_user_id;

      -- Create coin transaction
      INSERT INTO public.coin_transactions (user_id, amount, type, metadata)
      VALUES (
        v_user_id, 
        -v_unlock_cost, 
        'unlock', 
        jsonb_build_object('listing_id', p_listing_id, 'action', 'contact_unlock')
      );

      -- Create unlock record
      INSERT INTO public.contact_unlocks (user_id, listing_id)
      VALUES (v_user_id, p_listing_id);
    END IF;
  END IF;

  -- 5. Fetch the contact info
  SELECT phone_encrypted, zalo_encrypted 
  INTO v_phone_encrypted, v_zalo_encrypted
  FROM public.listing_contacts
  WHERE listing_id = p_listing_id;

  -- 6. Return success and data
  RETURN jsonb_build_object(
    'success', true, 
    'data', jsonb_build_object(
      'phone_encrypted', v_phone_encrypted,
      'zalo_encrypted', v_zalo_encrypted
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
