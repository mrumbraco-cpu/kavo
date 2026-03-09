export interface ConstantItem {
    id: string;
    label: string;
}

export const SPACE_TYPES_DATA: readonly ConstantItem[] = [
    { id: 'delivery_point', label: 'Chỗ giao nhận hàng' },
    { id: 'cabinet', label: 'Kệ tủ' },
    { id: 'garden', label: 'Sân vườn' },
    { id: 'sidewalk', label: 'Vỉa hè' },
    { id: 'fridge_space', label: 'Ngân tủ lạnh' },
    { id: 'indoor_corner', label: 'Góc nhỏ trong nhà' },
    { id: 'market_corner', label: 'Góc nhỏ trong chợ' },
    { id: 'kiosk', label: 'Kiot bán hàng' },
    { id: 'coworking', label: 'Chỗ ngồi làm việc' },
    { id: 'balcony', label: 'Ban công' },
    { id: 'full_shop', label: 'Toàn bộ quán' },
    { id: 'indoor_shop', label: 'Bên trong quán' },
    { id: 'bar_counter', label: 'Quầy pha chế' },
    { id: 'kitchen', label: 'Khu vực bếp' },
    { id: 'container', label: 'Container' },
    { id: 'corridor', label: 'Hành lang' },
    { id: 'rooftop', label: 'Sân thượng' },
    { id: 'storage', label: 'Phòng chứa đồ' },
] as const;

export const LOCATION_TYPES_DATA: readonly ConstantItem[] = [
    { id: 'frontage', label: 'Mặt tiền' },
    { id: 'car_alley', label: 'Hẻm xe hơi' },
    { id: 'bike_alley', label: 'Hẻm xe máy' },
    { id: 'corner', label: 'Căn góc' },
    { id: 'inside_market', label: 'Trong chợ' },
    { id: 'residential_area', label: 'Khu dân cư' },
    { id: 'in_building', label: 'Trong toà nhà' },
    { id: 'mall', label: 'TTTM' },
    { id: 'hospital', label: 'Bệnh viện' },
    { id: 'school', label: 'Trường học' },
] as const;

export const SUITABLE_FOR_OPTIONS_DATA: readonly ConstantItem[] = [
    { id: 'drinks', label: 'Đồ uống' },
    { id: 'fast_food', label: 'Thức ăn nhanh' },
    { id: 'snacks', label: 'Đồ ăn vặt' },
    { id: 'noodles', label: 'Mì bún phở' },
    { id: 'rice', label: 'Cơm' },
    { id: 'desserts', label: 'Món tráng miệng' },
    { id: 'fashion', label: 'Thời trang' },
    { id: 'cosmetics', label: 'Mỹ phẩm' },
    { id: 'liquidation', label: 'Thanh lý' },
    { id: 'second_hand', label: 'Đồ cũ' },
    { id: 'beauty', label: 'Làm đẹp' },
    { id: 'tarot', label: 'Bói bài' },
    { id: 'handmade', label: 'Handmade' },
    { id: 'photography', label: 'Chụp ảnh' },
    { id: 'livestream', label: 'Livestream' },
    { id: 'online_sales', label: 'Bán hàng Online' },
    { id: 'events', label: 'Sự kiện' },
    { id: 'workshop', label: 'Workshop' },
    { id: 'consignment', label: 'Ký gửi' },
] as const;

export const NOT_SUITABLE_FOR_OPTIONS_DATA: readonly ConstantItem[] = [
    { id: 'loud_noise', label: 'Gây tiếng ồn lớn' },
    { id: 'pets', label: 'Có thú cưng' },
    { id: 'overnight', label: 'Ở lại qua đêm' },
    { id: 'strong_smell', label: 'Nấu nướng tạo mùi mạnh' },
    { id: 'duplicated_business', label: 'Kinh doanh trùng lặp' },
    { id: 'explosive', label: 'Chất dễ cháy nổ' },
    { id: 'crowded', label: 'Tụ tập đông người' },
] as const;

// Duy trì tính tương thích
export const SPACE_TYPES = SPACE_TYPES_DATA.map(item => item.label);
export const LOCATION_TYPES = LOCATION_TYPES_DATA.map(item => item.label);
export const SUITABLE_FOR_OPTIONS = SUITABLE_FOR_OPTIONS_DATA.map(item => item.label);
export const NOT_SUITABLE_FOR_OPTIONS = NOT_SUITABLE_FOR_OPTIONS_DATA.map(item => item.label);

// Helpers
export const getSpaceTypeLabel = (id: string) => SPACE_TYPES_DATA.find(i => i.id === id)?.label || id;
export const getLocationTypeLabel = (id: string) => LOCATION_TYPES_DATA.find(i => i.id === id)?.label || id;
export const getSuitableLabel = (id: string) => SUITABLE_FOR_OPTIONS_DATA.find(i => i.id === id)?.label || id;
export const getNotSuitableLabel = (id: string) => NOT_SUITABLE_FOR_OPTIONS_DATA.find(i => i.id === id)?.label || id;
