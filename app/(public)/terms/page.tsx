import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Điều Khoản Dịch Vụ | CHOBAN.VN',
    description: 'Điều khoản và điều kiện sử dụng dịch vụ tại CHOBAN.VN.',
};

export default function TermsPage() {
    return (
        <div className="bg-slate-50 min-h-screen pt-32 pb-20">
            <div className="max-w-4xl mx-auto px-6">
                <div className="bg-white rounded-[2.5rem] p-8 md:p-16 shadow-xl shadow-slate-200/50 border border-slate-100">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 font-outfit border-b border-slate-100 pb-6">
                        Điều Khoản Dịch Vụ
                    </h1>

                    <div className="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center text-sm">1</span>
                                Chấp nhận điều khoản
                            </h2>
                            <p>
                                Bằng cách truy cập và sử dụng website <strong>CHOBAN.VN</strong>, bạn đồng ý tuân thủ các điều khoản và quy định dưới đây. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng không sử dụng dịch vụ của chúng tôi.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center text-sm">2</span>
                                Mô tả dịch vụ
                            </h2>
                            <p>
                                <strong>CHOBAN.VN</strong> là nền tảng kết nối giữa người có mặt bằng (F1) và người cần thuê mặt bằng/ký gửi hàng hóa (F2). Chúng tôi đóng vai trò là bên cung cấp công cụ tìm kiếm và hiển thị thông tin, không tham gia trực tiếp vào quá trình thương thảo hoặc giao dịch giữa các bên.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center text-sm">3</span>
                                Quy định về tài khoản và tin đăng
                            </h2>
                            <ul className="list-disc pl-6 space-y-3 mt-4">
                                <li>Người dùng phải cung cấp thông tin liên hệ chính xác (Số điện thoại, Zalo).</li>
                                <li>Tin đăng phải có thông tin thật về mặt bằng, không đăng các nội dung vi phạm pháp luật hoặc cạnh tranh không lành mạnh.</li>
                                <li>Chúng tôi có quyền từ chối hoặc gỡ bỏ bất kỳ tin đăng nào nếu phát hiện có dấu hiệu lừa đảo hoặc vi phạm quy định cộng đồng.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center text-sm">4</span>
                                Hệ thống Xu và Mở khóa thông tin
                            </h2>
                            <p>
                                - <strong>CHOBAN.VN</strong> sử dụng đơn vị "Xu" để duy trì hệ thống. <br />
                                - Việc nạp xu được thực hiện qua các cổng thanh toán tích hợp và không hỗ trợ hoàn tiền dưới mọi hình thức trừ lỗi kỹ thuật từ phía hệ thống. <br />
                                - Thao tác mở khóa thông tin liên hệ là xác nhận cuối cùng, xu sẽ được trừ ngay lập tức và bản ghi mở khóa sẽ được lưu lại.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center text-sm">5</span>
                                Miễn trừ trách nhiệm
                            </h2>
                            <p className="bg-slate-50 p-6 rounded-2xl border border-slate-100 italic">
                                "Tất cả các cuộc đàm phán, thanh toán tiền thuê mặt bằng và giao dịch sau khi mở khóa thông tin liên hệ đều diễn ra bên ngoài nền tảng <strong>CHOBAN.VN</strong>. Chúng tôi không chịu trách nhiệm cho bất kỳ tranh chấp, mất mát hoặc kết quả nào phát sinh giữa các bên sau khi kết nối thành công."
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center text-sm">6</span>
                                Thay đổi điều khoản
                            </h2>
                            <p>
                                Chúng tôi có quyền sửa đổi các điều khoản này bất kỳ lúc nào để phù hợp với tình hình hoạt động. Các thay đổi sẽ có hiệu lực ngay khi được đăng tải trên website.
                            </p>
                        </section>

                        <section className="pt-8 border-t border-slate-100 text-center">
                            <p className="text-slate-500">
                                Chân thành cảm ơn bạn đã cùng xây dựng cộng đồng chia sẻ mặt bằng văn minh!
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
