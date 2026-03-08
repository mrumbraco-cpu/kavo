import Link from 'next/link'
import React from 'react'
import Script from 'next/script'
import BrandLogo from '@/components/public/BrandLogo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <div className="min-h-screen flex bg-white font-sans">
                {/* Left side - Functionality / Form */}
                <div className="flex-1 flex flex-col w-full lg:w-1/2">
                    {/* Header / Logo */}
                    <div className="p-8 pb-0 flex items-center justify-between">
                        <BrandLogo />
                    </div>

                    {/* Main Content (Form) */}
                    <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 md:px-24">
                        <div className="w-full max-w-[380px] mx-auto">
                            {children}
                        </div>
                    </div>
                </div>

                {/* Right side - Quote */}
                <div className="hidden lg:flex flex-1 w-1/2 bg-[#1C1C1C] text-gray-200 items-center justify-center p-12 relative overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-900/20 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>
                    </div>

                    <div className="max-w-xl relative z-10 px-8">
                        <span className="text-7xl text-[#333333] font-serif absolute -top-10 -left-2 leading-none">&quot;</span>
                        <p className="text-3xl font-medium leading-relaxed mb-8 text-white relative z-10 tracking-tight">
                            CHOBAN.VN là nền tảng kết nối không gian kinh doanh tuyệt vời nhất tôi từng sử dụng. Đơn giản, hiệu quả và cực kỳ minh bạch. Cảm ơn đội ngũ phát triển đã tạo ra một sản phẩm chất lượng cho cộng đồng!
                        </p>
                        <div className="flex items-center gap-4 mt-12">
                            <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center text-lg font-semibold border border-gray-600">
                                MH
                            </div>
                            <div>
                                <p className="font-semibold text-white">Bánh Mì Má Hải Partners</p>
                                <span className="text-gray-400 text-sm">@mahai_partners</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Turnstile - chỉ load trên auth pages */}
            <Script
                src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
                strategy="afterInteractive"
            />
        </>
    )
}
