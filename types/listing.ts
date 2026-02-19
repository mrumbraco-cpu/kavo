export type ListingStatus = 'draft' | 'pending' | 'approved' | 'expired';

export interface Listing {
    id: string;
    owner_id: string;
    title: string;
    description: string;
    space_type: string;
    suitable_for: string[];
    not_suitable_for: string[];
    location_type: string;
    amenities: string[];
    time_slots: string[];
    price_min: number;
    price_max: number;
    address_old_admin: string;
    address_new_admin: string;
    province_old: string;
    district_old: string;
    province_new: string;
    ward_new: string;
    latitude: number;
    longitude: number;
    nearby_features: string[];
    images: string[];
    status: ListingStatus;
    is_hidden: boolean;
    is_locked: boolean;
    created_at: string;
    updated_at: string;
}
