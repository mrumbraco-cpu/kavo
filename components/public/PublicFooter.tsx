import Link from 'next/link';

export default function PublicFooter() {
    return (
        <footer className="border-t border-premium-100 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-premium-900 rounded-lg rotate-45 flex items-center justify-center">
                            <span className="text-white text-xs font-bold -rotate-45">S</span>
                        </div>
                        <span className="text-base font-black text-premium-900 tracking-tighter uppercase">SPSHARE</span>
                    </Link>

                    <p className="text-xs text-premium-400 font-light tracking-wide text-center">
                        Nền tảng kết nối không gian trực tiếp • Không đặt chỗ • Không trung gian
                    </p>

                    <div className="flex gap-8 text-xs text-premium-500 font-medium tracking-widest uppercase">
                        <Link href="#" className="hover:text-premium-900 transition-colors">Điều khoản</Link>
                        <Link href="#" className="hover:text-premium-900 transition-colors">Bảo mật</Link>
                        <Link href="#" className="hover:text-premium-900 transition-colors">Liên hệ</Link>
                    </div>
                </div>
                <div className="mt-6 pt-6 border-t border-premium-50 text-center">
                    <p className="text-xs text-premium-300 font-light">© 2026 SPSHARE. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
