import Link from "next/link";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
    title: 'Trang Chủ',
    description: 'SpaceShare - Nền tảng kết nối không gian thương mại hàng đầu Việt Nam. Workshop, vỉa hè, kệ hàng, studio - Tìm và chia sẻ ngay.',
};

export default function Home() {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative min-h-[85vh] flex items-center justify-center px-4 overflow-hidden pt-20">
                {/* Hero Background Image */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/hero-spaceshare.png"
                        alt="Shared modern commercial space"
                        fill
                        priority
                        className="object-cover brightness-[0.7]"
                        placeholder="blur"
                        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+ZNPQAIXQM4F5z9yAAAAABJRU5ErkJggg=="
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-premium-950/20 via-transparent to-premium-950/40" />
                </div>

                <div className="relative z-10 max-w-5xl mx-auto text-center text-white">
                    <div className="glass-premium p-8 md:p-16 rounded-[2.5rem] border-white/30 shadow-2xl animate-premium-fade-up backdrop-blur-md">
                        <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight font-outfit text-slate-900">
                            Chia sẻ không gian,<br />
                            <span className="text-blue-600">tối ưu chi phí</span>
                        </h1>
                        <p className="text-lg md:text-2xl mb-12 text-slate-600 max-w-3xl mx-auto leading-relaxed">
                            Kết nối những người có không gian với những người cần mặt bằng nhỏ để kinh doanh. Từ kệ hàng, vỉa hè đến góc nhỏ trong cửa hàng.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Link
                                href="/search"
                                className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 active:scale-95 duration-200"
                            >
                                <svg className="w-6 h-6" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Tìm không gian ngay
                            </Link>
                            <div className="relative group/post">
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-amber-500 text-white text-xs font-black rounded-full shadow-xl whitespace-nowrap z-10 animate-premium-float border-2 border-white uppercase tracking-wider">
                                    Thưởng 10 xu
                                </div>
                                <Link
                                    href="/dashboard/listings/new"
                                    className="px-10 py-5 bg-white text-slate-900 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 duration-200"
                                >
                                    <svg className="w-6 h-6" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Đăng tin chia sẻ
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Section */}
            <section className="py-32 px-4 bg-white">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900 font-outfit">Tại sao chọn SpaceShare?</h2>
                    <p className="text-slate-500 text-lg mb-20 max-w-2xl mx-auto leading-relaxed font-medium">
                        Nền tảng đầu tiên tại Việt Nam chuyên về chia sẻ không gian kinh doanh quy mô vừa và cực nhỏ
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
                                desc: "Thuê theo giờ, ngày hoặc tháng. Phù hợp cho workshop ngắn ngày hay kệ trưng bày dài hạn"
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

            {/* How It Works Section */}
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
                                <h3 className="text-2xl md:text-3xl font-bold text-white font-outfit">Sở hữu không gian</h3>
                            </div>
                            <div className="space-y-8 pl-2 border-l-2 border-blue-600/20 ml-6">
                                {[
                                    { step: 1, title: "Đăng tin nhanh gọn", desc: "Mô tả diện tích, tiện ích và mong muốn hợp tác." },
                                    { step: 2, title: "Kiểm duyệt an toàn", desc: "Đội ngũ SpaceShare xác minh tính năng trực của tin đăng." },
                                    { step: 3, title: "Kết nối trực tiếp", desc: "Nhận yêu cầu và tự do thỏa thuận với đối tác tiềm năng." }
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
                                    { step: 1, title: "Tìm kiếm thông minh", desc: "Lọc theo khu vực và ngân sách chính xác ý định." },
                                    { step: 2, title: "Mở khóa liên hệ", desc: "Dùng xu để nhận thông tin liên hệ chính chủ F1." },
                                    { step: 3, title: "Hợp tác thành công", desc: "Trao đổi sâu và ký kết thỏa thuận bền vững." }
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

            {/* CTA Banner Area */}
            <section className="relative py-32 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-blue-600" />
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

                <div className="max-w-4xl mx-auto text-center text-white relative z-10">
                    <h2 className="text-4xl md:text-6xl font-bold mb-8 font-outfit tracking-tight">Vươn tầm kinh doanh cùng <br className="hidden md:block" /> SpaceShare</h2>
                    <p className="text-xl md:text-2xl text-blue-100 mb-14 max-w-2xl mx-auto leading-relaxed">
                        Tham gia cộng đồng chia sẻ không gian lớn nhất Việt Nam ngay hôm nay và tối ưu tiềm năng mặt bằng của bạn.
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
                                Miễn phí đăng tin
                            </div>
                            <Link
                                href="/dashboard/listings/new"
                                className="px-10 py-5 bg-blue-900/40 text-white border border-blue-500 rounded-2xl font-bold text-lg hover:bg-blue-900/60 transition-all shadow-xl w-full sm:w-auto text-center active:scale-95 duration-200 backdrop-blur-sm"
                            >
                                Bắt đầu ngay
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
