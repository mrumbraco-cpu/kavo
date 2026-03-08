import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Chính Sách Bảo Mật | CHOBAN.VN',
    description: 'Chính sách bảo mật thông tin người dùng tại CHOBAN.VN - Nền tảng chia sẻ mặt bằng kinh doanh.',
};

export default function PrivacyPage() {
    return (
        <div className="bg-slate-50 min-h-screen pt-32 pb-20">
            <div className="max-w-4xl mx-auto px-6">
                <div className="bg-white rounded-[2.5rem] p-8 md:p-16 shadow-xl shadow-slate-200/50 border border-slate-100">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 font-outfit border-b border-slate-100 pb-6">
                        Chính Sách Bảo Mật
                    </h1>

                    <div className="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm">1</span>
                                Giới thiệu
                            </h2>
                            <p>
                                Chào mừng bạn đến với <strong>CHOBAN.VN</strong> (sau đây gọi tắt là "Chúng tôi"). Chúng tôi cam kết bảo vệ quyền riêng tư và thông tin cá nhân của bạn. Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin khi bạn sử dụng dịch vụ trên website của chúng tôi.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm">2</span>
                                Thông tin chúng tôi thu thập
                            </h2>
                            <p>Khi bạn đăng ký tài khoản hoặc sử dụng dịch vụ, chúng tôi có thể thu thập các thông tin sau:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-4">
                                <li><strong>Thông tin tài khoản:</strong> Tên, địa chỉ email, số điện thoại, và ảnh đại diện (nếu bạn đăng nhập qua Google).</li>
                                <li><strong>Thông tin tin đăng:</strong> Hình ảnh, địa chỉ mặt bằng, mô tả và các chi tiết liên quan đến không gian bạn chia sẻ.</li>
                                <li><strong>Dữ liệu giao dịch:</strong> Lịch sử nạp xu và sử dụng xu để mở khóa thông tin liên hệ.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm">3</span>
                                Cách chúng tôi sử dụng thông tin
                            </h2>
                            <p>Chúng tôi sử dụng thông tin thu thập được cho các mục đích:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-4">
                                <li>Cung cấp và duy trì hoạt động của nền tảng kết nối.</li>
                                <li>Gửi các thông báo quan trọng về tài khoản, xác nhận đăng ký và bảo mật.</li>
                                <li>Hỗ trợ người dùng khi có yêu cầu hoặc vấn đề phát sinh.</li>
                                <li>Cải thiện trải nghiệm người dùng và chất lượng dịch vụ.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm">4</span>
                                Chia sẻ thông tin
                            </h2>
                            <p>
                                <strong>CHOBAN.VN</strong> không bán hoặc cho thuê thông tin cá nhân của bạn cho bên thứ ba. Chúng tôi chỉ chia sẻ thông tin trong các trường hợp:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-4">
                                <li><strong>Mở khóa liên hệ:</strong> Thông tin liên hệ của người đăng tin (họ tên, số điện thoại/Zalo) sẽ hiển thị cho người dùng sau khi họ thực hiện thao tác mở khóa bằng xu theo quy định.</li>
                                <li><strong>Yêu cầu pháp lý:</strong> Khi có yêu cầu hợp pháp từ cơ quan có thẩm quyền.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm">5</span>
                                Bảo mật dữ liệu
                            </h2>
                            <p>
                                Chúng tôi áp dụng các biện pháp bảo mật tiêu chuẩn (SSL/TLS mã hóa dữ liệu) để bảo vệ thông tin của bạn khỏi việc truy cập trái phép. Tuy nhiên, không có phương thức truyền tin qua Internet nào là an toàn 100%, chúng tôi khuyến khích bạn bảo mật mật khẩu cá nhân của mình.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm">6</span>
                                Quyền của bạn
                            </h2>
                            <p>
                                Bạn có quyền truy cập, chỉnh sửa hoặc yêu cầu xóa thông tin cá nhân của mình bất kỳ lúc nào thông qua trang quản lý tài khoản hoặc liên hệ trực tiếp với chúng tôi qua email hỗ trợ.
                            </p>
                        </section>

                        <section className="pt-8 border-t border-slate-100">
                            <p className="text-sm italic">Cập nhật lần cuối: 08 tháng 03 năm 2026</p>
                            <p className="mt-4 text-slate-500">
                                Mọi thắc mắc về Chính sách bảo mật, vui lòng liên hệ: <br />
                                Email: <strong>support@choban.vn</strong>
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
