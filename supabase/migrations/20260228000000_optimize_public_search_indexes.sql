-- 1. Geography indexes (mandatory search criteria)
CREATE INDEX IF NOT EXISTS idx_listings_geo_old ON listings (province_old, district_old);
CREATE INDEX IF NOT EXISTS idx_listings_geo_new ON listings (province_new, ward_new);

-- 2. Composite index for public visibility (Status + Visibility)
-- Helps Supabase quickly filter items allowed for display without scanning Draft/Pending ones
CREATE INDEX IF NOT EXISTS idx_listings_public_visibility 
ON listings (status, is_hidden) 
WHERE status IN ('approved', 'expired') AND is_hidden = false;

-- 3. Index for sorting (Newest listings)
CREATE INDEX IF NOT EXISTS idx_listings_created_at_desc ON listings (created_at DESC);

-- 4. GIN Indexes for array filters (optimized search on space types, amenities, etc.)
CREATE INDEX IF NOT EXISTS idx_listings_space_type_gin ON listings USING gin (space_type);
CREATE INDEX IF NOT EXISTS idx_listings_amenities_gin ON listings USING gin (amenities);
CREATE INDEX IF NOT EXISTS idx_listings_suitable_for_gin ON listings USING gin (suitable_for);
CREATE INDEX IF NOT EXISTS idx_listings_not_suitable_for_gin ON listings USING gin (not_suitable_for);

-- 5. Foreign Key Indexes for Public Detail Pages
-- Speeds up counting favorites and unlocks when viewing listing details
CREATE INDEX IF NOT EXISTS idx_favorites_listing_id ON favorites (listing_id);
CREATE INDEX IF NOT EXISTS idx_contact_unlocks_listing_id ON contact_unlocks (listing_id);
