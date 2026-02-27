/**
 * Formats a number as Vietnamese Dong (₫)
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Formats a date using local Vietnamese format
 */
export function formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(d);
}

/**
 * Custom compact price formatter for listings
 * Example: 1.500.000 -> 1.5tr, 500.000 -> 500k
 */
export function formatCompactPrice(n: number): string {
    if (n >= 1_000_000) {
        const val = n / 1_000_000;
        return `${Number(val.toFixed(val % 1 === 0 ? 0 : 1)).toLocaleString('vi-VN')}tr`;
    }
    if (n >= 1_000) {
        return `${Math.round(n / 1_000).toLocaleString('vi-VN')}k`;
    }
    return n.toLocaleString('vi-VN');
}

/**
 * Formats a price range
 */
export function formatPriceRange(min: number, max: number): string {
    if (min === 0 && max === 0) return 'Miễn phí';
    if (min === max) return `${formatCompactPrice(min)} ₫`;
    return `${formatCompactPrice(min)} – ${formatCompactPrice(max)} ₫`;
}
