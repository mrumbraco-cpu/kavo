import Link from 'next/link';

export default function PublicFooter() {
    return (
        <footer className="bg-slate-900 text-slate-400 py-16 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="md:col-span-2">
                        <Link href="/" className="flex items-center gap-2.5 mb-6 group">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-white tracking-tight">SpaceShare</span>
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-sm">
                            Nền tảng chia sẻ không gian kinh doanh hàng đầu Việt Nam. Kết nối những người có không gian với những người cần không gian để kinh doanh.
                        </p>
                        <div className="flex gap-4">
                            <a href="mailto:contact@spaceshare.vn" className="w-9 h-9 rounded-full border border-slate-700 flex items-center justify-center hover:bg-slate-800 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </a>
                            <a href="tel:0123456789" className="w-9 h-9 rounded-full border border-slate-700 flex items-center justify-center hover:bg-slate-800 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Liên kết nhanh</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link href="/search" className="hover:text-white transition-colors">Tìm kiếm không gian</Link></li>
                            <li><Link href="/dashboard/listings/new" className="hover:text-white transition-colors">Đăng tin chia sẻ</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Về chúng tôi</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Liên hệ</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Pháp lý</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link href="#" className="hover:text-white transition-colors">Điều khoản sử dụng</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Chính sách bảo mật</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Quy định đăng tin</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-800 text-center text-xs">
                    <p>© 2025 SpaceShare. Tất cả quyền được bảo lưu.</p>
                </div>
            </div>
        </footer>
    );
}
