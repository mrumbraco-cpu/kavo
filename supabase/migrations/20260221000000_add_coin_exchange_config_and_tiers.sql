-- Migration: add_coin_exchange_config_and_tiers
-- Applied: 2026-02-21

-- ============================================================
-- Table: coin_exchange_config
-- ============================================================
CREATE TABLE IF NOT EXISTS public.coin_exchange_config (
  id                 serial PRIMARY KEY,
  coins_per_1000vnd  integer NOT NULL DEFAULT 1 CHECK (coins_per_1000vnd >= 1),
  min_topup_vnd      integer NOT NULL DEFAULT 10000 CHECK (min_topup_vnd >= 1000),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  updated_by         uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

INSERT INTO public.coin_exchange_config (coins_per_1000vnd, min_topup_vnd)
VALUES (1, 10000)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Table: coin_topup_tiers
-- ============================================================
CREATE TABLE IF NOT EXISTS public.coin_topup_tiers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label           text NOT NULL,
  min_amount_vnd  integer NOT NULL CHECK (min_amount_vnd >= 1000),
  coins_granted   integer NOT NULL CHECK (coins_granted >= 1),
  is_active       boolean NOT NULL DEFAULT true,
  display_order   integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coin_topup_tiers_active_order
  ON public.coin_topup_tiers (is_active, display_order ASC);

-- ============================================================
-- RLS: coin_exchange_config
-- ============================================================
ALTER TABLE public.coin_exchange_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_manage_exchange_config"
  ON public.coin_exchange_config
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- RLS: coin_topup_tiers
-- ============================================================
ALTER TABLE public.coin_topup_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_manage_tiers"
  ON public.coin_topup_tiers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
