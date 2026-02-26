import { z } from 'zod';

export const profileSchema = z.object({
    phone: z.string()
        .min(10, "Số điện thoại quá ngắn")
        .max(15, "Số điện thoại quá dài")
        .regex(/^[0-9+]+$/, "Số điện thoại không hợp lệ")
        .nullable()
        .optional()
        .or(z.literal('')), // allow empty string
    zalo: z.string()
        .min(10, "Số Zalo quá ngắn")
        .max(15, "Số Zalo quá dài")
        .regex(/^[0-9+]+$/, "Số Zalo không hợp lệ")
        .nullable()
        .optional()
        .or(z.literal('')),
});

export const passwordSchema = z.object({
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(6, "Mật khẩu xác nhận phải có ít nhất 6 ký tự"),
}).refine(data => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"]
});
