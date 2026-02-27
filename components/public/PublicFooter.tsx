import Link from 'next/link';
import BrandLogo from './BrandLogo';

export default function PublicFooter() {
    return (
        <footer className="relative bg-premium-950 text-premium-400 py-20 px-4 overflow-hidden">
            {/* Subtle radial gradient for depth */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-premium-800/20 via-transparent to-transparent pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="md:col-span-2">
                        <BrandLogo dark className="mb-8" />
                        <p className="text-premium-400 text-sm leading-relaxed mb-8 max-w-sm">
                            Nền tảng kết nối không gian thương mại hàng đầu. Tối ưu hóa giá trị mặt bằng và chắp cánh những cơ hội kinh doanh mới.
                        </p>
                        <div className="flex gap-4">
                            <a href="mailto:contact@spaceshare.vn" className="w-10 h-10 rounded-xl border border-premium-800 flex items-center justify-center text-premium-400 hover:text-white hover:border-accent-gold hover:bg-premium-900 transition-all duration-300">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </a>
                            <a href="tel:0123456789" className="w-10 h-10 rounded-xl border border-premium-800 flex items-center justify-center text-premium-400 hover:text-white hover:border-accent-gold hover:bg-premium-900 transition-all duration-300">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-bold mb-8 uppercase tracking-widest text-xs">Khám phá</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><Link href="/search" className="hover:text-accent-gold transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-premium-700 group-hover:bg-accent-gold" /> Tìm kiếm không gian</Link></li>
                            <li><Link href="/dashboard/listings/new" className="hover:text-accent-gold transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-premium-700 group-hover:bg-accent-gold" /> Đăng tin chia sẻ</Link></li>
                            <li><Link href="#" className="hover:text-accent-gold transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-premium-700 group-hover:bg-accent-gold" /> Về chúng tôi</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="text-white font-bold mb-8 uppercase tracking-widest text-xs">Pháp lý</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><Link href="#" className="hover:text-accent-gold transition-colors">Điều khoản dịch vụ</Link></li>
                            <li><Link href="#" className="hover:text-accent-gold transition-colors">Chính sách bảo mật</Link></li>
                            <li><Link href="#" className="hover:text-accent-gold transition-colors">Cộng đồng</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-premium-800/50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-premium-500">
                    <p>© 2025 SpaceShare Marketplace. Proudly Vietnamese.</p>
                    <div className="flex gap-8">
                        <span className="hover:text-premium-300 cursor-default">English</span>
                        <span className="text-white cursor-default font-bold underline decoration-accent-gold underline-offset-4">Tiếng Việt</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
