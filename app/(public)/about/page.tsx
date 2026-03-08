import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
    title: 'Về Chúng Tôi | CHOBAN.VN',
    description: 'Tìm hiểu về CHOBAN.VN - Nền tảng kết nối chia sẻ mặt bằng kinh doanh hàng đầu Việt Nam.',
};

export default function AboutPage() {
    return (
        <div className="flex flex-col overflow-hidden">
            {/* Hero Section */}
            <section className="relative py-24 md:py-32 bg-slate-900 overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -mr-64 -mt-64 text-blue-100" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-gold/10 rounded-full blur-[120px] -ml-64 -mb-64" />

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 font-outfit tracking-tight">
                        Kiến tạo cơ hội từ những <br />
                        <span className="text-blue-500">khoảng trống</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        CHOBAN.VN ra đời với sứ mệnh tối ưu hóa giá trị của mọi mặt bằng, giúp tiểu thương khởi nghiệp dễ dàng và chủ nhà tăng thêm thu nhập bền vững.
                    </p>
                </div>
            </section>

            {/* Our Story Section */}
            <section className="py-24 bg-white px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="relative h-[400px] md:h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl">
                            <Image
                                src="/hero-street-food.png"
                                alt="Câu chuyện của chúng tôi"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-bold border border-blue-100 uppercase tracking-widest">
                                Câu chuyện của chúng tôi
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-outfit">
                                Tại sao lại là CHOBAN.VN?
                            </h2>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                Chúng tôi nhìn thấy hàng ngàn vỉa hè, góc sân, hay những kệ hàng bỏ trống vào những khung giờ nhất định. Trong khi đó, hàng triệu người kinh doanh nhỏ đang loay hoay với gánh nặng chi phí mặt bằng cố định quá cao.
                            </p>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                <strong>CHOBAN.VN</strong> (Chỗ Bán) được xây dựng để xóa bỏ rào cản đó. Chúng tôi tạo ra một "nền kinh tế chia sẻ" dành riêng cho bất động sản kinh doanh nhỏ lẻ, nơi mọi không gian đều có giá trị và mọi người đều có cơ hội bắt đầu.
                            </p>
                            <div className="grid grid-cols-2 gap-6 pt-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="text-3xl font-black text-blue-600 mb-1">F1</div>
                                    <div className="text-sm font-bold text-slate-800 uppercase tracking-tight">Chủ không gian</div>
                                    <p className="text-xs text-slate-500 mt-1 italic">Tận dụng diện tích thừa, tăng thêm thu nhập.</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="text-3xl font-black text-accent-gold mb-1">F2</div>
                                    <div className="text-sm font-bold text-slate-800 uppercase tracking-tight">Người kinh doanh</div>
                                    <p className="text-xs text-slate-500 mt-1 italic">Thuê theo buổi, tối ưu chi phí vận hành.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-24 bg-slate-50 px-6">
                <div className="max-w-7xl mx-auto text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-outfit mb-4">Gía trị cốt lõi</h2>
                    <p className="text-slate-500 max-w-xl mx-auto">Kim chỉ nam giúp chúng tôi xây dựng một cộng đồng chia sẻ bền vững và văn minh.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {[
                        {
                            title: "Sự linh hoạt",
                            desc: "Không ràng buộc hợp đồng dài hạn, cho phép kinh doanh theo giờ, ngày hoặc tuần tùy theo nhu cầu thực tế.",
                            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
                            color: "blue"
                        },
                        {
                            title: "Tính minh bạch",
                            desc: "Thông tin mặt bằng được xác thực, quy trình mở khóa thông tin rõ ràng và công bằng cho mọi thành viên.",
                            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
                            color: "amber"
                        },
                        {
                            title: "Sức mạnh cộng đồng",
                            desc: "Chúng tôi không chỉ cung cấp công cụ, chúng tôi xây dựng một hệ sinh thái nơi mọi người hỗ trợ lẫn nhau cùng phát triển.",
                            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />,
                            color: "emerald"
                        }
                    ].map((item, i) => (
                        <div key={i} className="bg-white p-10 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 hover:-translate-y-2 transition-all duration-300">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${item.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                                    item.color === 'amber' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                                }`}>
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {item.icon}
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-4 font-outfit">{item.title}</h3>
                            <p className="text-slate-500 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto bg-blue-600 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-600/30">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 font-outfit">Sẵn sàng viết nên câu chuyện của riêng bạn?</h2>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/search" className="px-10 py-5 bg-white text-blue-600 rounded-2xl font-bold text-lg hover:shadow-xl transition-all active:scale-95 duration-200">
                                Bắt đầu tìm chỗ bán
                            </Link>
                            <Link href="/dashboard/listings/new" className="px-10 py-5 bg-blue-900/40 text-white border border-blue-400/30 rounded-2xl font-bold text-lg hover:bg-blue-900/60 transition-all backdrop-blur-sm active:scale-95 duration-200">
                                Chia sẻ mặt bằng
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
