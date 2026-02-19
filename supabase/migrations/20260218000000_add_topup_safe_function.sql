-- Safely add unique constraint to reference column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'coin_transactions_reference_key'
    ) THEN
        ALTER TABLE "public"."coin_transactions" ADD CONSTRAINT "coin_transactions_reference_key" UNIQUE ("reference");
    END IF;
END $$;

-- Create or replace a secure function to handle topup transaction atomically
CREATE OR REPLACE FUNCTION process_topup_transaction(
  p_user_id UUID,
  p_amount INTEGER,
  p_reference TEXT,
  p_metadata JSONB
) RETURNS JSONB AS $$
DECLARE
  v_new_balance INTEGER;
  v_transaction_id UUID;
  v_existing_id UUID;
BEGIN
  -- 0. Check if transaction already exists (Idempotency check)
  SELECT id INTO v_existing_id FROM coin_transactions WHERE reference = p_reference LIMIT 1;
  
  IF v_existing_id IS NOT NULL THEN
    RETURN jsonb_build_object('success', true, 'message', 'Transaction already processed', 'transaction_id', v_existing_id);
  END IF;

  -- 1. Lock the profile row to prevent race conditions on balance update
  SELECT coin_balance INTO v_new_balance 
  FROM profiles 
  WHERE id = p_user_id 
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'User not found');
  END IF;

  v_new_balance := v_new_balance + p_amount;

  -- 2. Update balance
  UPDATE profiles 
  SET coin_balance = v_new_balance 
  WHERE id = p_user_id;

  -- 3. Insert transaction record
  INSERT INTO coin_transactions (
    user_id,
    type,
    amount,
    balance_after,
    reference,
    metadata
  ) VALUES (
    p_user_id,
    'topup',
    p_amount,
    v_new_balance,
    p_reference,
    p_metadata
  ) RETURNING id INTO v_transaction_id;

  RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance, 'transaction_id', v_transaction_id);

EXCEPTION 
  WHEN unique_violation THEN
    -- Fallback safety if race condition slips past step 0
    RETURN jsonb_build_object('success', true, 'message', 'Transaction already processed');
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
