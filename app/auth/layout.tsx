import Link from 'next/link'
import React from 'react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex bg-white font-sans">
            {/* Left side - Functionality / Form */}
            <div className="flex-1 flex flex-col w-full lg:w-1/2">
                {/* Header / Logo */}
                <div className="p-8 pb-0 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group transition-opacity hover:opacity-80">
                        <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center shadow-sm">
                            <span className="text-white font-bold text-lg leading-none">S</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900 tracking-tight">SPSHARE</span>
                    </Link>
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
                    <span className="text-7xl text-[#333333] font-serif absolute -top-10 -left-2 leading-none">"</span>
                    <p className="text-3xl font-medium leading-relaxed mb-8 text-white relative z-10 tracking-tight">
                        Spshare is the best product experience I've had in years. Not just tech - taste. From docs to latency to the URL structure that makes you think "oh, that's obvious" Feels like every other platform should study how they built it @spshare I love you
                    </p>
                    <div className="flex items-center gap-4 mt-12">
                        <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center text-lg font-semibold border border-gray-600">
                            U
                        </div>
                        <div>
                            <p className="font-semibold text-white">Happy User</p>
                            <span className="text-gray-400 text-sm">@happy_user</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
