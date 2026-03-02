-- 1. Optimized My Listings (Filter by owner + Sort by created_at)
-- This allows instant retrieval and sorting of user's own listings without a manual sort step
CREATE INDEX IF NOT EXISTS idx_listings_owner_id_created_at ON listings (owner_id, created_at DESC);

-- 2. Optimized Unlocked Listings (Filter by user + Sort by created_at)
CREATE INDEX IF NOT EXISTS idx_contact_unlocks_user_id_created_at ON contact_unlocks (user_id, created_at DESC);

-- 3. Optimized Favorites (Filter by user + Sort by created_at)
CREATE INDEX IF NOT EXISTS idx_favorites_user_id_created_at ON favorites (user_id, created_at DESC);

-- 4. Optimized Coin Transactions (Wallet history)
-- Ensures fast dashboard wallet history loading
CREATE INDEX IF NOT EXISTS idx_coin_transactions_user_id_created_at ON coin_transactions (user_id, created_at DESC);

-- 5. Optimized Profile Searching (Phone and Zalo)
-- Partial indexes for fast lookup during verification or admin searches
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles (phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_zalo ON profiles (zalo) WHERE zalo IS NOT NULL;
