import Link from "next/link";

export default function Home() {
    return (
        <div className="flex flex-col items-center">
            {/* Hero Section */}
            <section className="relative w-full min-h-[88vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden bg-white">
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-premium-100 rounded-full blur-[120px] opacity-40 animate-float"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-50 rounded-full blur-[120px] opacity-30 animate-float" style={{ animationDelay: '1.5s' }}></div>
                </div>

                <div className="relative z-10 max-w-5xl animate-fade-up">
                    <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-premium-950 mb-8 leading-[1.1]">
                        Chia sẻ không gian <br />
                        <span className="text-premium-700">Linh hoạt & Đẳng cấp</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-premium-500 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
                        Nền tảng kết nối trực tiếp chuyên biệt cho các không gian workshop, sự kiện và làm việc cao cấp.
                        <span className="block mt-2 font-medium text-premium-800 italic">Không đặt chỗ – Không qua trung gian thanh toán.</span>
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link
                            href="/search"
                            className="px-10 py-5 bg-premium-900 text-white rounded-full font-bold text-lg hover:bg-premium-800 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-premium-200 group"
                        >
                            Khám phá không gian
                            <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
                        </Link>
                        <Link
                            href="/auth/register"
                            className="px-10 py-5 bg-white text-premium-900 border border-premium-200 rounded-full font-bold text-lg hover:border-premium-900 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-premium-50"
                        >
                            Đăng không gian của bạn
                        </Link>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="w-full py-32 md:py-48 px-4 bg-premium-50 border-y border-premium-100">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-premium-900">Quy trình kết nối trực tiếp</h2>
                        <div className="w-24 h-1 bg-accent-gold mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                        {[
                            { step: '01', title: 'Tìm kiếm đặc quyền', desc: 'Sàng lọc các không gian theo đúng chuẩn mực và mong muốn của bạn.' },
                            { step: '02', title: 'Mở khóa kết nối', desc: 'Tiếp cận trực tiếp thông tin liên hệ chính chủ một cách minh bạch.' },
                            { step: '03', title: 'Thỏa thuận trực tiếp', desc: 'Toàn quyền làm chủ thời gian và chi phí mà không qua bất kỳ bên trung gian nào.' }
                        ].map((item, i) => (
                            <div key={i} className="group relative flex flex-col items-center text-center p-10 rounded-[2rem] bg-white shadow-sm border border-transparent hover:border-premium-100 hover:shadow-2xl transition-all duration-500">
                                <div className="text-6xl font-black text-premium-100 mb-4 group-hover:text-premium-200 transition-colors">
                                    {item.step}
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-premium-800">{item.title}</h3>
                                <p className="text-premium-500 leading-relaxed font-light">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-24 p-8 rounded-3xl bg-white/50 border border-accent-gold/20 text-premium-700 text-center text-sm font-medium max-w-3xl mx-auto backdrop-blur-sm">
                        <span className="text-accent-gold mr-2 font-bold">LƯU Ý QUAN TRỌNG:</span>
                        Nền tảng chỉ cung cấp kênh kết nối. Mọi giao dịch tài chính và thỏa thuận chi tiết được thực hiện hoàn toàn bên ngoài hệ thống để đảm bảo tính riêng tư và chủ động.
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="w-full py-32 md:py-48 px-4 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                        <div className="max-w-2xl">
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-premium-900 leading-tight">Mọi không gian <br />đều mang giá trị di sản</h2>
                            <p className="text-lg text-premium-500 font-light">Từ những workshop nghệ thuật đến các sự kiện doanh nghiệp cao cấp, chúng tôi kết nối bạn với những không gian xứng tầm.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-8">
                        {['Workshop', 'Lớp học', 'Studio', 'Họp nhóm', 'Sự kiện'].map((item, index) => (
                            <Link key={index} href={`/search?suitable_for=${encodeURIComponent(item)}`} className="flex flex-col items-center justify-center aspect-square rounded-[2.5rem] border border-premium-50 bg-premium-50/30 hover:bg-white hover:border-accent-gold hover:shadow-xl transition-all duration-500 group cursor-pointer">
                                <div className="w-16 h-16 bg-white rounded-3xl shadow-sm mb-6 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-premium-900 group-hover:text-white">
                                    <span className="text-2xl opacity-50">
                                        {item[0]}
                                    </span>
                                </div>
                                <span className="font-bold text-premium-700 group-hover:text-premium-900 transition-colors uppercase tracking-widest text-xs">{item}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="w-full py-48 px-4 bg-premium-950 text-white overflow-hidden relative">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 w-[50%] h-full bg-blue-900/10 blur-[150px]"></div>
                    <div className="absolute bottom-0 left-0 w-[50%] h-full bg-premium-800/20 blur-[150px]"></div>
                </div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h2 className="text-5xl md:text-7xl font-bold mb-10 leading-tight animate-fade-in">Sẵn sàng nâng tầm <br />kết nối?</h2>
                    <p className="text-xl text-premium-400 mb-14 font-light max-w-2xl mx-auto leading-relaxed">
                        Tham gia cộng đồng, nơi mọi không gian và dự án đều được kết nối một cách chuyên nghiệp nhất.
                    </p>
                    <div className="flex flex-wrap justify-center gap-8">
                        <Link
                            href="/search"
                            className="px-14 py-6 bg-accent-gold text-premium-950 rounded-full font-bold text-xl hover:bg-yellow-500 transition-all hover:scale-105 shadow-2xl shadow-accent-gold/20"
                        >
                            Khám phá ngay
                        </Link>
                        <Link
                            href="/auth/register"
                            className="px-14 py-6 bg-white/10 border border-white/20 text-white rounded-full font-bold text-xl hover:bg-white/20 transition-all hover:scale-105"
                        >
                            Đăng không gian
                        </Link>
                    </div>
                    <p className="mt-16 text-premium-600 text-sm font-light tracking-wide uppercase">
                        Hệ thống kết nối trực tiếp • Không đặt chỗ • Không trung gian
                    </p>
                </div>
            </section>
        </div>
    );
}
