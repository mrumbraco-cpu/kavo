import Link from "next/link";

export default function Home() {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="bg-blue-600 pt-32 pb-24 px-4 text-center text-white">
                <div className="max-w-4xl mx-auto animate-fade-up">
                    <h1 className="text-4xl md:text-6xl font-bold mb-8 leading-tight text-balance">
                        Chia sẻ không gian,<br />tối ưu chi phí
                    </h1>
                    <p className="text-xl md:text-2xl mb-12 text-blue-100 max-w-3xl mx-auto">
                        Kết nối những người có không gian với những người cần không gian để kinh doanh. Từ kệ hàng, vỉa hè đến góc nhỏ trong cửa hàng.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/search"
                            className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Tìm không gian
                        </Link>
                        <div className="relative group/post">
                            {/* Floating badge */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full shadow-lg whitespace-nowrap z-10 animate-bounce border-2 border-white">
                                Thưởng 10 xu
                            </div>
                            <Link
                                href="/dashboard/listings/new"
                                className="px-8 py-4 bg-blue-500 text-white border border-blue-400 rounded-lg font-bold text-lg hover:bg-blue-400 transition-all flex items-center justify-center gap-2 shadow-lg"
                            >
                                <svg className="w-5 h-5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Đăng tin chia sẻ
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Section */}
            <section className="py-24 px-4 bg-white">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 text-balance">Tại sao chọn SpaceShare?</h2>
                    <p className="text-slate-600 mb-16 max-w-2xl mx-auto">
                        Nền tảng đầu tiên tại Việt Nam chuyên về chia sẻ không gian kinh doanh nhỏ
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                        {[
                            {
                                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />,
                                title: "Vị trí đa dạng",
                                desc: "Từ trung tâm thành phố đến các khu dân cư, tìm không gian phù hợp với ngân sách"
                            },
                            {
                                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
                                title: "Linh hoạt thời gian",
                                desc: "Thuê theo giờ, ngày, tuần hoặc tháng. Phù hợp với mọi mô hình kinh doanh"
                            },
                            {
                                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
                                title: "An toàn bảo mật",
                                desc: "Thông tin được bảo mật, chỉ hiển thị sau khi thanh toán phí xem liên hệ"
                            },
                            {
                                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />,
                                title: "Cộng đồng tin cậy",
                                desc: "Hệ thống đánh giá và báo cáo giúp xây dựng cộng đồng chia sẻ tin cậy"
                            }
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
                                    <svg className="w-8 h-8" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {item.icon}
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-slate-800">{item.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-24 px-4 bg-slate-50">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-slate-900 text-balance">Cách thức hoạt động</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* F1 Card */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="text-2xl font-bold mb-8 text-slate-800">Dành cho người có không gian (F1)</h3>
                            <div className="space-y-6">
                                {[
                                    { step: 1, title: "Đăng tin chia sẻ", desc: "Mô tả không gian, vị trí, giá cả và điều kiện" },
                                    { step: 2, title: "Chờ duyệt tin", desc: "Admin kiểm tra và duyệt tin đăng của bạn" },
                                    { step: 3, title: "Nhận liên hệ", desc: "F2 quan tâm sẽ liên hệ trực tiếp với bạn" }
                                ].map((step, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                            {step.step}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">{step.title}</h4>
                                            <p className="text-slate-500 text-sm">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* F2 Card */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="text-2xl font-bold mb-8 text-slate-800">Dành cho người cần không gian (F2)</h3>
                            <div className="space-y-6">
                                {[
                                    { step: 1, title: "Tìm kiếm không gian", desc: "Sử dụng bộ lọc để tìm không gian phù hợp" },
                                    { step: 2, title: "Xem thông tin liên hệ", desc: "Thanh toán phí nhỏ để xem thông tin liên hệ F1" },
                                    { step: 3, title: "Liên hệ trực tiếp", desc: "Trao đổi chi tiết và thỏa thuận hợp tác" }
                                ].map((step, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                            {step.step}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">{step.title}</h4>
                                            <p className="text-slate-500 text-sm">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Banner Area */}
            <section className="bg-blue-600 py-24 px-4 text-center text-white">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-balance">Sẵn sàng bắt đầu?</h2>
                    <p className="text-xl text-blue-100 mb-12">
                        Tham gia cộng đồng chia sẻ không gian lớn nhất Việt Nam ngay hôm nay
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/search"
                            className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-blue-50 transition-all"
                        >
                            Tìm không gian ngay
                        </Link>
                        <div className="relative group/post flex justify-center">
                            {/* Floating badge */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full shadow-lg whitespace-nowrap z-10 animate-bounce border-2 border-white">
                                Thưởng 10 xu
                            </div>
                            <Link
                                href="/dashboard/listings/new"
                                className="px-8 py-4 bg-blue-500 text-white border border-blue-400 rounded-lg font-bold text-lg hover:bg-blue-400 transition-all shadow-lg w-full sm:w-auto text-center"
                            >
                                Đăng tin miễn phí
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
