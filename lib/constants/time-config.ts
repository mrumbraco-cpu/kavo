export const TIME_SLOT_TYPES = [
    { id: 'daily', label: 'Hàng ngày' },
    { id: 'single', label: 'Một ngày cụ thể' },
    { id: 'range', label: 'Khoảng thời gian' },
    { id: 'weekly', label: 'Hàng tuần' }
] as const;
export const SESSIONS = ['Sáng', 'Trưa', 'Chiều', 'Tối', 'Cả ngày'] as const;
export const DAYS_OF_WEEK = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'] as const;

export type TimeSlotType = (typeof TIME_SLOT_TYPES)[number]['id'];
export type Session = (typeof SESSIONS)[number];
export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];
