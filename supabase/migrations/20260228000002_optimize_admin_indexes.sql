-- 1. Optimized Listing Management for Admin
-- Handles complex filtering by status, visibility (is_hidden), and lock state with DESC sorting
CREATE INDEX IF NOT EXISTS idx_listings_admin_full_status ON listings (status, is_hidden, is_locked, created_at DESC);

-- 2. Optimized User/Profile Management for Admin
-- Speeds up filtering users by role and lock status while sorting by join date
CREATE INDEX IF NOT EXISTS idx_profiles_admin_filtering ON profiles (role, lock_status, created_at DESC);
-- Speeds up wallet balance ranking/filtering
CREATE INDEX IF NOT EXISTS idx_profiles_coin_balance ON profiles (coin_balance DESC);

-- 3. Optimized Reports Management
-- Specifically helps Admin process Pending reports (status = 'pending') sorted by newest first
CREATE INDEX IF NOT EXISTS idx_listing_reports_admin_view ON listing_reports (status, created_at DESC);

-- 4. Foreign Key optimization for Listing Reports
-- Speeds up joins with the Profiles table (Reporter info)
CREATE INDEX IF NOT EXISTS idx_listing_reports_reporter_id ON listing_reports (reporter_id);
-- (listing_id is already indexed in Giai đoạn 1)
