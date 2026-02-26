import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const listingSchema = z.object({
    title: z.string()
        .min(10, 'Tiêu đề quá ngắn (tối thiểu 10 ký tự)')
        .max(200, 'Tiêu đề quá dài (tối đa 200 ký tự)'),
    description: z.string()
        .max(3000, 'Mô tả quá dài (tối đa 3000 ký tự)')
        .optional(),
    phone: z.string()
        .regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, 'Số điện thoại không hợp lệ'),
    zalo: z.string()
        .regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, 'Số điện thoại Zalo không hợp lệ')
        .optional()
        .or(z.literal('')),
    space_type: z.array(z.string()).min(1, 'Vui lòng chọn ít nhất một loại hình không gian'),
    location_type: z.string().min(1, 'Vui lòng chọn loại vị trí'),
    price_min: z.number().int().min(0, 'Giá không hợp lệ'),
    price_max: z.number().int().min(0, 'Giá không hợp lệ'),
    province_old: z.string().min(1, 'Vui lòng chọn Tỉnh/Thành phố'),
    district_old: z.string().min(1, 'Vui lòng chọn Quận/Huyện'),
    province_new: z.string().min(1),
    ward_new: z.string().min(1),
    detailed_address: z.string().min(5, 'Địa chỉ quá ngắn').max(500, 'Địa chỉ quá dài'),
    latitude: z.number().finite(),
    longitude: z.number().finite(),
    suitable_for: z.array(z.string()).optional(),
    not_suitable_for: z.array(z.string()).optional(),
    amenities: z.array(z.string()).optional(),
    nearby_features: z.array(z.string()).optional(),
    time_slots: z.array(z.string()).optional(),
});

export const imageFileSchema = z.instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, `Kích thước ảnh tối đa là 5MB.`)
    .refine(
        (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
        "Chỉ chấp nhận định dạng .jpg, .jpeg, .png và .webp."
    );
