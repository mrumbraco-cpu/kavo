import Link from "next/link";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
    title: 'Trang Chủ',
    description: 'CHOBAN.VN - Chia Sẻ Mặt Bằng Kinh Doanh - Cho Thuê Chỗ Bán Hàng Theo Ngày. Workshop, vỉa hè, kệ hàng, studio - Tìm và chia sẻ ngay.',
};

export default function Home() {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="min-h-[90vh] flex items-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-white pt-20 pb-0 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

                        {/* Left: Text content */}
                        <div className="animate-premium-fade-up py-8 lg:py-16 flex flex-col items-center lg:items-start text-center lg:text-left">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-8 border border-blue-200">
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                Nền tảng chia sẻ mặt bằng #1 Việt Nam
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight font-outfit text-slate-900 mb-6">
                                Chia sẻ theo buổi,<br />
                                <span className="text-blue-600">tối ưu chi phí</span>
                            </h1>

                            <p className="text-lg md:text-xl text-slate-500 leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0">
                                Hàng ngàn vị trí đang chia sẻ cho những người cần mặt bằng nhỏ để kinh doanh hoặc ký gửi hàng bán. Từ kệ hàng, vỉa hè đến góc nhỏ trong cửa hàng.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start w-full">
                                <Link
                                    href="/search"
                                    className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-base hover:bg-blue-700 transition-all flex items-center justify-center gap-2.5 shadow-xl shadow-blue-600/25 active:scale-95 duration-200"
                                >
                                    <svg className="w-5 h-5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    Tìm chỗ bán hàng
                                </Link>
                                <div className="relative group/post">
                                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-500 text-white text-xs font-black rounded-full shadow-lg whitespace-nowrap z-10 animate-premium-float border-2 border-white uppercase tracking-wider">
                                        Thưởng 10 xu
                                    </div>
                                    <Link
                                        href="/dashboard/listings/new"
                                        className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-bold text-base hover:bg-slate-50 transition-all flex items-center justify-center gap-2.5 shadow-lg active:scale-95 duration-200"
                                    >
                                        <svg className="w-5 h-5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Đăng tin chia sẻ
                                    </Link>
                                </div>
                            </div>

                            {/* Stats row */}
                            <div className="mt-12 pt-8 border-t border-slate-100 w-full animate-premium-fade-up" style={{ animationDelay: '200ms' }}>
                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6">
                                    {[
                                        { 
                                            value: "10.000+", 
                                            label: "Vị trí lý tưởng",
                                            icon: (
                                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            )
                                        },
                                        { 
                                            value: "20+", 
                                            label: "Tỉnh thành",
                                            icon: (
                                                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2 2 2 0 012 2v.656c0 .53.21 1.039.586 1.414l.344.344m-7.344-9.344a9 9 0 1111.314 0" />
                                                </svg>
                                            )
                                        },
                                        { 
                                            value: "20.000+", 
                                            label: "Kết nối thành công",
                                            icon: (
                                                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                            )
                                        },
                                    ].map((stat, i) => (
                                        <div key={i} className="flex items-center gap-3 px-5 py-3 bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200/50 shadow-sm hover:shadow-md hover:border-blue-200/50 transition-all duration-300 group">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                                                {stat.icon}
                                            </div>
                                            <div className="flex flex-col items-start">
                                                <div className="text-xl md:text-2xl font-bold text-slate-900 font-outfit leading-none tracking-tight">{stat.value}</div>
                                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1.5">{stat.label}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right: Hero Image */}
                        <div className="relative h-[420px] lg:h-[600px] w-full flex-shrink-0">
                            {/* Decorative blobs */}
                            <div className="absolute top-8 right-8 w-72 h-72 bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />
                            <div className="absolute bottom-8 left-8 w-56 h-56 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />

                            {/* Image container with rounded clipping */}
                            <div className="relative h-full w-full rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-200/60">
                                <Image
                                    src="/hero-street-food.png"
                                    alt="Khu phố ăn vặt nhộn nhịp buổi sáng — vỉa hè bình dân đến cửa hàng hiện đại"
                                    fill
                                    priority
                                    className="object-cover"
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    quality={90}
                                    fetchPriority="high"
                                />
                                {/* Subtle gradient overlay at bottom */}
                                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent" />
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Why Choose Section */}
            <WhyChooseSection />

            {/* How It Works Section */}
            <HowItWorksSection />

            {/* Testimonials Section */}
            <TestimonialsSection />

            {/* CTA Banner Area */}
            <CtaBannerSection />
        </div>
    );
}

function WhyChooseSection() {
    return (
        <section className="py-32 px-4 bg-white">
            <div className="max-w-7xl mx-auto text-center">
                <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900 font-outfit">Tại sao chọn <span className="text-accent-gold">CHOBAN.VN</span></h2>
                <p className="text-slate-500 text-lg mb-20 max-w-2xl mx-auto leading-relaxed font-medium">
                    Một khoảng sân nhỏ, thậm chí là một ngăn tủ lạnh trống cũng giúp bạn có thêm thu nhập bằng việc chia sẻ nó cho người cần chỗ bán hàng
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        {
                            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />,
                            title: "Vị trí đa dạng",
                            desc: "Từ trung tâm thành phố đến các khu dân cư sầm uất, tìm không gian phù hợp với mọi ngân sách"
                        },
                        {
                            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
                            title: "Linh hoạt thời gian",
                            desc: "Thuê theo giờ, ngày hoặc tháng. Phù hợp cho buôn bán nhỏ lẻ, sự kiện ngắn ngày hay kệ trưng bày dài hạn"
                        },
                        {
                            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
                            title: "An toàn bảo mật",
                            desc: "Thông tin liên hệ được bảo vệ nghiêm ngặt, đảm bảo quyền lợi và sự riêng tư cho cả hai bên"
                        },
                        {
                            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />,
                            title: "Cộng đồng tin cậy",
                            desc: "Hệ thống xác minh và báo cáo minh bạch giúp xây dựng môi trường chia sẻ bền vững"
                        }
                    ].map((item, i) => (
                        <div key={i} className="group p-8 bg-slate-50 hover:bg-white rounded-3xl border border-slate-100 hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-600/5 transition-all duration-300">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-8 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-inner">
                                <svg className="w-8 h-8" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {item.icon}
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-slate-800 font-outfit">{item.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function HowItWorksSection() {
    return (
        <section className="py-32 px-4 bg-slate-900 relative overflow-hidden">
            {/* Background accents */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-gold/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold text-center mb-24 text-white font-outfit">Vận hành đơn giản</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                    {/* F1 Card */}
                    <div className="space-y-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-600/30">
                                <span className="text-blue-400 font-black">F1</span>
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold text-white font-outfit">Sở hữu mặt bằng</h3>
                        </div>
                        <div className="space-y-8 pl-2 border-l-2 border-blue-600/20 ml-6">
                            {[
                                { step: 1, title: "Đăng tin nhanh gọn", desc: "Mô tả ưu điểm vị trí, thời gian cho thuê và giá thuê." },
                                { step: 2, title: "Kiểm duyệt an toàn", desc: "Đội ngũ Admin xác minh thông tin chính xác." },
                                { step: 3, title: "Kết nối trực tiếp", desc: "F2 quan tâm sẽ liên hệ trực tiếp với bạn. Không trung gian." }
                            ].map((step, i) => (
                                <div key={i} className="flex gap-6 relative group">
                                    <div className="absolute -left-[2.1rem] top-0.5 w-4 h-4 bg-slate-900 border-2 border-blue-500 rounded-full z-10 transition-all group-hover:scale-125 group-hover:bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                                    <div>
                                        <h4 className="font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{step.title}</h4>
                                        <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* F2 Card */}
                    <div className="space-y-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center border border-green-600/30">
                                <span className="text-green-400 font-black">F2</span>
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold text-white font-outfit">Cần tìm mặt bằng</h3>
                        </div>
                        <div className="space-y-8 pl-2 border-l-2 border-green-600/20 ml-6">
                            {[
                                { step: 1, title: "Tìm kiếm thông minh", desc: "Lọc theo khu vực, ngân sách và nhu cầu cụ thể." },
                                { step: 2, title: "Liên hệ chủ mặt bằng", desc: "Mặt bằng phù hợp? Liên hệ ngay." },
                                { step: 3, title: "Hợp tác đơn giản", desc: "Không đặt cọc, không hợp đồng ràng buộc." }
                            ].map((step, i) => (
                                <div key={i} className="flex gap-6 relative group">
                                    <div className="absolute -left-[2.1rem] top-0.5 w-4 h-4 bg-slate-900 border-2 border-green-500 rounded-full z-10 transition-all group-hover:scale-125 group-hover:bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
                                    <div>
                                        <h4 className="font-bold text-white mb-1 group-hover:text-green-400 transition-colors">{step.title}</h4>
                                        <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function CtaBannerSection() {
    return (
        <section className="relative py-32 px-4 overflow-hidden">
            <div className="absolute inset-0 bg-blue-600" />
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)', backgroundSize: '4px 4px' }} />

            <div className="max-w-4xl mx-auto text-center text-white relative z-10">
                <h2 className="text-4xl md:text-6xl font-bold mb-8 font-outfit tracking-tight">Sẵn sàng bắt đầu?</h2>
                <p className="text-xl md:text-2xl text-blue-100 mb-14 max-w-2xl mx-auto leading-relaxed">
                    Tham gia cộng đồng chia sẻ mặt bằng lớn nhất Việt Nam ngay hôm nay và tối ưu thu nhập của bạn.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <Link
                        href="/search"
                        className="px-10 py-5 bg-white text-blue-600 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all shadow-xl active:scale-95 duration-200"
                    >
                        Khám phá ngay
                    </Link>
                    <div className="relative group/post flex justify-center">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-accent-gold text-white text-xs font-black rounded-full shadow-xl whitespace-nowrap z-10 animate-premium-float border-2 border-white uppercase tracking-wider">
                            Thưởng 10 xu
                        </div>
                        <Link
                            href="/dashboard/listings/new"
                            className="px-10 py-5 bg-blue-900/40 text-white border border-blue-500 rounded-2xl font-bold text-lg hover:bg-blue-900/60 transition-all shadow-xl w-full sm:w-auto text-center active:scale-95 duration-200 backdrop-blur-sm"
                        >
                            Đăng tin chia sẻ
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

function TestimonialsSection() {
    return (
        <section className="py-32 px-4 bg-slate-50 relative overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900 font-outfit">
                        Người thật, <span className="text-blue-600">việc thật</span>
                    </h2>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
                        Lắng nghe chia sẻ từ cộng đồng và những người đã kết nối thành công qua CHOBAN.VN
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        {
                            type: "F1",
                            role: "Chủ mặt bằng",
                            name: "Chú Hùng",
                            location: "Quận 1, TP.HCM",
                            content: "Tiệm của tôi nằm ở vị trí đắc địa nhưng buổi sáng vỉa hè lại bỏ trống. Từ khi chia sẻ cho chị Phượng bán bánh mì, không gian trở nên nhộn nhịp hơn hẳn, vừa có thêm tiền chợ hằng tháng lại vừa vui vì tiệm lúc nào cũng đông khách.",
                            image: "/f1_luxury_owner_hung_1772889742723.png",
                            color: "blue"
                        },
                        {
                            type: "F2",
                            role: "Kinh doanh nhỏ",
                            name: "Chị Phượng",
                            location: "Chuỗi Bánh Mì Phượng",
                            content: "Tìm được chỗ bán bánh mì theo buổi sáng thế này thật sự rất thuận tiện. Giá thuê hợp lý, không cần cọc, cũng chẳng cần thủ tục rườm rà, giúp tôi yên tâm khởi nghiệp mà không lo gánh nặng chi phí mặt bằng.",
                            image: "/f2_banh_mi_vendor_1772870853514.png",
                            color: "green"
                        },
                        {
                            type: "F2",
                            role: "Kinh doanh nhỏ",
                            name: "Em Vy",
                            location: "Bán Trà Sữa & Đồ Ăn Vặt",
                            content: "Vừa mới ra trường muốn tập tành buôn bán nhỏ nên CHOBAN.VN là lựa chọn số 1. Em chỉ cần thuê 1 góc nhỏ từ 4h chiều đến tối để bán trà sữa, bán ngày nào trả tiền thuê ngày đó, cực kỳ tiết kiệm và hiệu quả.",
                            image: "/f2_tea_vendor_1772870870947.png",
                            color: "amber"
                        }
                    ].map((item, i) => (
                        <div key={i} className="group bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 transition-all duration-300">
                            <div className="flex items-start gap-4 mb-8">
                                <div className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg ring-4 ring-slate-50">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-2 ${item.type === 'F1'
                                        ? 'bg-blue-100 text-blue-600'
                                        : item.color === 'green' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                                        }`}>
                                        {item.type} • {item.role}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 font-outfit">{item.name}</h3>
                                    <p className="text-slate-400 text-xs font-medium">{item.location}</p>
                                </div>
                            </div>

                            <div className="relative">
                                <svg className="absolute -top-4 -left-2 w-8 h-8 text-slate-100 -z-10" fill="currentColor" viewBox="0 0 32 32">
                                    <path d="M10 8v8h6l-2.286 9H10l2.286-9H8V8h2zm14 0v8h6l-2.286 9h-3.714l2.286-9h-2.286V8h2z" />
                                </svg>
                                <p className="text-slate-600 leading-relaxed italic">
                                    "{item.content}"
                                </p>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <svg key={star} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <span className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">Đã xác minh</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
