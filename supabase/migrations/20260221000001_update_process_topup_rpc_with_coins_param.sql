-- Migration: update_process_topup_rpc_with_coins_param
-- Applied: 2026-02-21
-- Changes: Added p_coins param (actual coins to credit) separate from p_amount (VND for audit)

CREATE OR REPLACE FUNCTION public.process_topup_transaction(
  p_user_id  uuid,
  p_amount   integer,   -- VNĐ (audit only, stored in metadata)
  p_coins    integer,   -- xu thực tế cộng vào ví
  p_reference text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $$
DECLARE
  v_new_balance INTEGER;
  v_transaction_id UUID;
  v_existing_id UUID;
BEGIN
  IF p_coins <= 0 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid coin amount');
  END IF;

  -- Idempotency: reject if reference already exists
  SELECT id INTO v_existing_id
  FROM coin_transactions
  WHERE reference = p_reference
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Transaction already processed',
      'transaction_id', v_existing_id
    );
  END IF;

  -- Lock profile row
  SELECT coin_balance INTO v_new_balance
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'User not found');
  END IF;

  v_new_balance := v_new_balance + p_coins;

  UPDATE profiles
  SET coin_balance = v_new_balance
  WHERE id = p_user_id;

  INSERT INTO coin_transactions (
    user_id, type, amount, balance_after, reference, metadata
  ) VALUES (
    p_user_id, 'topup', p_coins, v_new_balance, p_reference,
    p_metadata || jsonb_build_object('vnd_amount', p_amount)
  ) RETURNING id INTO v_transaction_id;

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_new_balance,
    'coins_credited', p_coins,
    'transaction_id', v_transaction_id
  );

EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('success', true, 'message', 'Transaction already processed');
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;
