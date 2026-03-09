export interface ConstantItem {
    id: string;
    label: string;
}

export const AMENITIES_DATA: readonly ConstantItem[] = [
    { id: 'wifi', label: 'Wifi' },
    { id: 'air_con', label: 'Máy lạnh' },
    { id: 'parking', label: 'Chỗ đậu xe' },
    { id: 'toilet', label: 'Nhà vệ sinh' },
    { id: 'hand_wash', label: 'Bồn rửa tay' },
    { id: 'sink', label: 'Bồn rửa chén' },
    { id: 'furniture', label: 'Bàn ghế' },
    { id: 'changing_room', label: 'Phòng thay đồ' },
    { id: 'fridge', label: 'Tủ lạnh' },
    { id: 'power_outlet', label: 'Ổ cắm điện' },
] as const;

export const NEARBY_FEATURES_DATA: readonly ConstantItem[] = [
    { id: 'school', label: 'Trường học' },
    { id: 'industrial_park', label: 'Khu công nghiệp' },
    { id: 'market', label: 'Chợ' },
    { id: 'mall', label: 'Trung tâm thương mại' },
    { id: 'hospital', label: 'Bệnh viện' },
    { id: 'park', label: 'Công viên' },
    { id: 'bus_stop', label: 'Trạm xe buýt' },
    { id: 'walking_street', label: 'Phố đi bộ' },
    { id: 'bank', label: 'Ngân hàng' },
    { id: 'convenience_store', label: 'Cửa hàng tiện lợi' },
    { id: 'admin_area', label: 'Khu hành chính' },
    { id: 'tourist_attraction', label: 'Khu du lịch' },
    { id: 'office_area', label: 'Khu văn phòng' },
] as const;

// Duy trì tính tương thích với code cũ (trả về danh sách ID hoặc Label tùy mục đích)
// Giai đoạn chuyển tiếp: AMENITIES vẫn là Label để không hỏng UI ngay lập tức
export const AMENITIES = AMENITIES_DATA.map(item => item.label);
export const NEARBY_FEATURES = NEARBY_FEATURES_DATA.map(item => item.label);

// Helper để lấy label từ id
export const getAmenityLabel = (id: string) => AMENITIES_DATA.find(a => a.id === id)?.label || id;
export const getNearbyFeatureLabel = (id: string) => NEARBY_FEATURES_DATA.find(f => f.id === id)?.label || id;
