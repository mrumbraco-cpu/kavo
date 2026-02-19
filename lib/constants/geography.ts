export const PROVINCES_OLD = [
    'Hồ Chí Minh',
    'Hà Nội',
    'Đà Nẵng'
] as const;

export const DISTRICTS_OLD_BY_PROVINCE: Record<string, readonly string[]> = {
    'Hồ Chí Minh': ['Quận 1', 'Quận 3', 'Quận 5', 'Quận 10', 'Quận Tân Bình'],
    'Hà Nội': ['Quận Hoàn Kiếm', 'Quận Ba Đình', 'Quận Đống Đa', 'Quận Hai Bà Trưng'],
    'Đà Nẵng': ['Quận Hải Châu', 'Quận Thanh Khê', 'Quận Sơn Trà']
} as const;

export const PROVINCES_NEW = [
    'TP. Thủ Đức',
    'Bình Dương',
    'Đồng Nai'
] as const;

export const WARDS_NEW_BY_PROVINCE: Record<string, readonly string[]> = {
    'TP. Thủ Đức': ['Phường Linh Tây', 'Phường Linh Trung', 'Phường Bình Thọ', 'Phường Hiệp Phú'],
    'Bình Dương': ['TP. Thủ Dầu Một', 'TP. Thuận An', 'TP. Dĩ An'],
    'Đồng Nai': ['TP. Biên Hòa', 'Long Thành', 'Nhơn Trạch']
} as const;
