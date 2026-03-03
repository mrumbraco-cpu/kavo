'use client';

import React from 'react';

const PRICE_PRESETS = [
    { label: 'Dưới 50K', min: '0', max: '50000' },
    { label: '50K – 100K', min: '50000', max: '100000' },
    { label: '100K – 200K', min: '100000', max: '200000' },
    { label: '200K – 500K', min: '200000', max: '500000' },
    { label: '500K – 1M', min: '500000', max: '1000000' },
    { label: '1M – 2M', min: '1000000', max: '2000000' },
    { label: '2M – 5M', min: '2000000', max: '5000000' },
    { label: 'Trên 5M', min: '5000000', max: '' },
];

function formatCurrencyInput(val: string) {
    if (!val) return '';
    const num = val.replace(/\D/g, '');
    return new Intl.NumberFormat('vi-VN').format(Number(num));
}

interface PriceRangeSelectorProps {
    minPrice: string;
    maxPrice: string;
    onUpdate: (key: 'min_price' | 'max_price', value: string) => void;
}

export default function PriceRangeSelector({ minPrice, maxPrice, onUpdate }: PriceRangeSelectorProps) {
    return (
        <div className="space-y-4 pt-1">
            <div className="flex flex-wrap gap-2 mb-4">
                {PRICE_PRESETS.map((pst) => {
                    const active = minPrice === pst.min && maxPrice === pst.max;
                    return (
                        <button
                            key={pst.label}
                            type="button"
                            onClick={() => {
                                onUpdate('min_price', pst.min);
                                onUpdate('max_price', pst.max);
                            }}
                            className={`px-3 py-1.5 rounded-full border text-[11px] font-bold transition-all ${active
                                ? 'bg-premium-900 border-premium-900 text-white'
                                : 'bg-white border-premium-100 text-premium-600 hover:border-premium-300'
                                }`}
                        >
                            {pst.label}
                        </button>
                    );
                })}
            </div>

            <div className="flex items-center gap-3">
                <div className="flex-1">
                    <label className="block text-[10px] font-black text-premium-300 uppercase tracking-widest mb-1.5 ml-1">Giá từ</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={formatCurrencyInput(minPrice)}
                            onChange={(e) => onUpdate('min_price', e.target.value.replace(/\D/g, ''))}
                            placeholder="0"
                            className="w-full px-4 py-3 bg-premium-50 border-none rounded-2xl text-sm font-bold text-premium-900 focus:ring-2 focus:ring-premium-900/10 placeholder:text-premium-300 transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-premium-300">đ</span>
                    </div>
                </div>
                <div className="w-4 h-px bg-premium-100 mt-6" />
                <div className="flex-1">
                    <label className="block text-[10px] font-black text-premium-300 uppercase tracking-widest mb-1.5 ml-1">Đến</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={formatCurrencyInput(maxPrice)}
                            onChange={(e) => onUpdate('max_price', e.target.value.replace(/\D/g, ''))}
                            placeholder="Vô hạn"
                            className="w-full px-4 py-3 bg-premium-50 border-none rounded-2xl text-sm font-bold text-premium-900 focus:ring-2 focus:ring-premium-900/10 placeholder:text-premium-300 transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-premium-300">đ</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
