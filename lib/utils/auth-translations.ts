/**
 * Utility to translate Supabase Auth error messages and status messages to Vietnamese.
 */
const AUTH_MESSAGE_MAP: Record<string, string> = {
    // Error messages
    'Invalid login credentials': 'Email hoặc mật khẩu không chính xác.',
    'Email not confirmed': 'Vui lòng xác thực email của bạn để tiếp tục.',
    'User not found': 'Không tìm thấy người dùng.',
    'User already registered': 'Email này đã được đăng ký.',
    'Password is too short': 'Mật khẩu quá ngắn (tối thiểu 6 ký tự).',
    'New password should be different from the old password': 'Mật khẩu mới phải khác mật khẩu cũ.',
    'Token has expired or is invalid': 'Mã xác thực đã hết hạn hoặc không hợp lệ.',
    'Email link is invalid or has expired': 'Liên kết email không hợp lệ hoặc đã hết hạn.',
    'Anonymous sign-ins are disabled': 'Đăng nhập ẩn danh bị vô hiệu hóa.',
    'Database error saving new user': 'Lỗi hệ thống khi tạo người dùng.',
    'User has been banned': 'Tài khoản của bạn đã bị khóa.',
    'Too many requests': 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
    'Network request failed': 'Lỗi kết nối mạng.',
    'Captcha check failed': 'Xác thực CAPTCHA không thành công.',
    'Email address not allowed': 'Email này không được phép đăng ký.',
    'Provider error': 'Lỗi từ nhà cung cấp dịch vụ (Google, Facebook...).',
    'Invalid refresh token': 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.',

    // Success / Status messages
    'Check your email to confirm registration': 'Vui lòng kiểm tra email để xác nhận đăng ký tài khoản.',
    'Check your email for the password reset link': 'Vui lòng kiểm tra email để nhận liên kết đặt lại mật khẩu.',
    'Signup confirmation sent': 'Liên kết xác nhận đã được gửi đến email của bạn.',
    'Password reset link sent': 'Liên kết đặt lại mật khẩu đã được gửi đến email của bạn.',
    'Password updated successfully': 'Cập nhật mật khẩu thành công!',
}

/**
 * Translates an English auth message to Vietnamese.
 * If no translation is found, returns the original message.
 */
export function translateAuthMessage(message: string | null | undefined): string {
    if (!message) return ''

    // Check for exact match
    if (AUTH_MESSAGE_MAP[message]) {
        return AUTH_MESSAGE_MAP[message]
    }

    // Check for partial matches or common patterns
    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes('invalid login credentials')) return AUTH_MESSAGE_MAP['Invalid login credentials']
    if (lowerMessage.includes('email not confirmed')) return AUTH_MESSAGE_MAP['Email not confirmed']
    if (lowerMessage.includes('user not found')) return AUTH_MESSAGE_MAP['User not found']
    if (lowerMessage.includes('already registered')) return AUTH_MESSAGE_MAP['User already registered']
    if (lowerMessage.includes('too short')) return AUTH_MESSAGE_MAP['Password is too short']
    if (lowerMessage.includes('too many requests')) return AUTH_MESSAGE_MAP['Too many requests']
    if (lowerMessage.includes('expired') || lowerMessage.includes('invalid')) {
        if (lowerMessage.includes('link')) return AUTH_MESSAGE_MAP['Email link is invalid or has expired']
        return AUTH_MESSAGE_MAP['Token has expired or is invalid']
    }

    return message
}
