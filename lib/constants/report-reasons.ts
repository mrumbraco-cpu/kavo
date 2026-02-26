export const REPORT_REASONS = [
    { value: 'wrong_info', label: 'Thông tin sai lệch (giá, địa chỉ, hình ảnh)' },
    { value: 'unavailable', label: 'Không gian không còn trống/đã đóng cửa' },
    { value: 'fake_listing', label: 'Tin ảo, lừa đảo' },
    { value: 'duplicate', label: 'Tin trùng lặp' },
    { value: 'offensive', label: 'Nội dung phản cảm, vi phạm chính sách' },
    { value: 'other', label: 'Lý do khác' }
] as const;

export type ReportReason = typeof REPORT_REASONS[number]['value'];
