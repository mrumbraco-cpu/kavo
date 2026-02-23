import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Listing } from '@/types/listing';
import ImageGallery from '@/components/public/ImageGallery';
import MiniMap from '@/components/public/MiniMap';
import ContactUnlockBlock from '@/components/public/ContactUnlockBlock';
import Link from 'next/link';
import { decrypt } from '@/lib/utils/encryption';
import FavoriteButton from '@/components/public/FavoriteButton';

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
        .from('listings')
        .select('title, description')
        .eq('id', id)
        .eq('status', 'approved')
        .eq('is_hidden', false)
        .single();

    if (!data) return { title: 'Không tìm thấy không gian – SPSHARE' };

    return {
        title: `${data.title} – SPSHARE`,
        description: data.description?.slice(0, 160) ?? '',
    };
}

export default async function ListingDetailPage({ params }: Props) {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    const { data: listing, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .eq('status', 'approved')
        .eq('is_hidden', false)
        .single();

    if (error || !listing) notFound();

    const typedListing = listing as Listing;

    const { data: { user } } = await supabase.auth.getUser();

    let coinBalance = 0;
    let alreadyUnlocked = false;
    let unlockedPhone: string | undefined;
    let unlockedZalo: string | undefined;
    let isFavorite = false;

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('coin_balance')
            .eq('id', user.id)
            .single();
        coinBalance = profile?.coin_balance ?? 0;

        const { data: unlock, error: unlockError } = await supabase
            .from('contact_unlocks')
            .select('user_id')
            .eq('user_id', user.id)
            .eq('listing_id', id)
            .maybeSingle();

        if (unlockError) console.error('Error checking unlock status:', unlockError);

        const { data: favorite, error: favoriteError } = await supabase
            .from('favorites')
            .select('user_id')
            .eq('user_id', user.id)
            .eq('listing_id', id)
            .maybeSingle();

        if (favoriteError) console.error('Error checking favorite status:', favoriteError);

        isFavorite = !!favorite;

        const isOwner = user.id === typedListing.owner_id;

        if (unlock || isOwner) {
            alreadyUnlocked = true;
            const { data: contactData, error: rpcError } = await supabase.rpc('unlock_listing_contact', {
                p_listing_id: id,
            });

            if (rpcError) console.error('Error fetching contact info via RPC:', rpcError);

            if (contactData?.success && contactData.data) {
                try {
                    unlockedPhone = contactData.data.phone_encrypted
                        ? decrypt(contactData.data.phone_encrypted)
                        : undefined;
                    unlockedZalo = contactData.data.zalo_encrypted
                        ? decrypt(contactData.data.zalo_encrypted)
                        : undefined;
                } catch (err) {
                    console.error('Server-side decryption failed:', err);
                }
            }
        }
    }

    const UNLOCK_COST = 10;
    const canUnlock = coinBalance >= UNLOCK_COST;

    // Parse and format time slots (same logic as ListingForm)
    const formatTimeSlot = (slot: string): string => {
        const parts = slot.split('|');
        const type = parts[0];
        const formatDate = (dateStr: string) => {
            if (!dateStr) return '';
            const [y, m, d] = dateStr.split('-');
            if (!y || !m || !d) return dateStr;
            return `${d}/${m}/${y}`;
        };
        if (type === 'daily') return `Hàng ngày • ${parts[1]}`;
        if (type === 'single') return `Chỉ ngày ${formatDate(parts[1])} • ${parts[2]}`;
        if (type === 'range') return `${formatDate(parts[1])} – ${formatDate(parts[2])} • ${parts[3]}`;
        if (type === 'weekly') return `${parts[1]} hàng tuần • ${parts[2]}`;
        return slot; // fallback for legacy plain text
    };

    const parsedTimeSlots = Array.isArray(typedListing.time_slots)
        ? typedListing.time_slots.map(formatTimeSlot)
        : [];

    const fullAddress = typedListing.detailed_address || '';

    // Amenity icons mapping
    const amenityIcons: Record<string, React.ReactNode> = {
        'Wi-Fi': (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
        ),
        'Máy lạnh': (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
            </svg>
        ),
        'Bãi đậu xe': (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
        ),
    };

    const defaultAmenityIcon = (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
        </svg>
    );

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">

                {/* ── Breadcrumb ─────────────────────────────────────── */}
                <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-6">
                    <Link href="/" className="hover:text-gray-700 hover:underline transition-colors">Trang chủ</Link>
                    <span>›</span>
                    <Link href="/search" className="hover:text-gray-700 hover:underline transition-colors">Tìm kiếm</Link>
                    <span>›</span>
                    <span className="text-gray-700 truncate max-w-xs">{typedListing.title}</span>
                </nav>

                {/* ── Main 2-column layout ────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-x-14 gap-y-10">

                    {/* ────── LEFT COLUMN ─────────────────────────────── */}
                    <div className="min-w-0">

                        {/* Title + Favorite */}
                        <div className="flex items-start justify-between gap-4 mb-3">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                                {typedListing.title}
                            </h1>
                            <div className="flex-shrink-0 pt-1">
                                <FavoriteButton
                                    listingId={id}
                                    initialIsFavorite={isFavorite}
                                    isAuthenticated={!!user}
                                />
                            </div>
                        </div>

                        {/* Badges + Address */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-5">
                            <div className="flex flex-wrap gap-1.5">
                                {typedListing.space_type && (
                                    <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                                        {typedListing.space_type}
                                    </span>
                                )}
                                {typedListing.location_type && (
                                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                                        {typedListing.location_type}
                                    </span>
                                )}
                            </div>
                            {fullAddress && (
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="underline underline-offset-2 decoration-gray-300">gần {fullAddress}</span>
                                </div>
                            )}
                        </div>

                        {/* Image Gallery */}
                        <div className="mb-8">
                            <ImageGallery images={typedListing.images ?? []} title={typedListing.title} />
                        </div>

                        {/* Price section */}
                        <div className="pb-8 border-b border-gray-100">
                            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">Mức giá</p>
                            {typedListing.price_min > 0 || typedListing.price_max > 0 ? (
                                <p className="text-3xl font-bold text-gray-900">
                                    {typedListing.price_min === typedListing.price_max
                                        ? `${typedListing.price_min.toLocaleString('vi-VN')} ₫`
                                        : `${typedListing.price_min.toLocaleString('vi-VN')} – ${typedListing.price_max.toLocaleString('vi-VN')} ₫`
                                    }
                                </p>
                            ) : (
                                <p className="text-2xl font-medium text-gray-500 italic">Giá thương lượng trực tiếp</p>
                            )}
                            {parsedTimeSlots.length > 0 && (
                                <div className="mt-3 flex flex-col gap-1.5">
                                    {parsedTimeSlots.map((slot, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-sm text-gray-600">{slot}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                                * Mọi thương lượng giá cả diễn ra trực tiếp với chủ không gian. Nền tảng không xử lý thanh toán.
                            </p>
                        </div>

                        {/* Description */}
                        {typedListing.description && (
                            <div className="py-8 border-b border-gray-100">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Mô tả không gian</h2>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-line text-[15px]">
                                    {typedListing.description}
                                </p>
                            </div>
                        )}

                        {/* Amenities */}
                        {typedListing.amenities?.length > 0 && (
                            <div className="py-8 border-b border-gray-100">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Tiện ích</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {typedListing.amenities.map(a => (
                                        <div key={a} className="flex items-center gap-3 text-[15px] text-gray-700">
                                            <span className="text-gray-500 flex-shrink-0">
                                                {amenityIcons[a] ?? defaultAmenityIcon}
                                            </span>
                                            {a}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Suitable for */}
                        {(typedListing.suitable_for?.length > 0 || typedListing.not_suitable_for?.length > 0) && (
                            <div className="py-8 border-b border-gray-100">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Phù hợp</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    {typedListing.suitable_for?.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Phù hợp với
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {typedListing.suitable_for.map(s => (
                                                    <span key={s} className="px-3 py-1.5 bg-green-50 text-green-700 text-sm rounded-full border border-green-100 font-medium">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {typedListing.not_suitable_for?.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                Không phù hợp với
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {typedListing.not_suitable_for.map(s => (
                                                    <span key={s} className="px-3 py-1.5 bg-red-50 text-red-600 text-sm rounded-full border border-red-100 font-medium">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Nearby features */}
                        {typedListing.nearby_features?.length > 0 && (
                            <div className="py-8 border-b border-gray-100">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Đặc điểm xung quanh</h2>
                                <div className="flex flex-wrap gap-2">
                                    {typedListing.nearby_features.map(f => (
                                        <span key={f} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-100 font-medium">{f}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Mini Map */}
                        {typedListing.latitude && typedListing.longitude && (
                            <div className="py-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Vị trí trên bản đồ</h2>
                                <div className="rounded-2xl overflow-hidden border border-gray-100">
                                    <MiniMap latitude={typedListing.latitude} longitude={typedListing.longitude} />
                                </div>
                                <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                                    * Vị trí hiển thị là vị trí tham chiếu. Địa chỉ chính xác sẽ được cung cấp khi bạn liên hệ với chủ không gian.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ────── RIGHT COLUMN (sticky sidebar) ────────────── */}
                    <div className="lg:block">
                        <div className="sticky top-24 flex flex-col gap-4">
                            <ContactUnlockBlock
                                listingId={id}
                                isAuthenticated={!!user}
                                alreadyUnlocked={alreadyUnlocked}
                                initialPhone={unlockedPhone}
                                initialZalo={unlockedZalo}
                                coinBalance={coinBalance}
                                canUnlock={canUnlock}
                            />

                            {/* Disclaimer */}
                            <div className="rounded-2xl border border-gray-100 p-4 text-xs text-gray-400 leading-relaxed">
                                <div className="flex items-start gap-2">
                                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p>
                                        <span className="font-semibold text-gray-500">SPSHARE</span> chỉ là kênh kết nối. Mọi thỏa thuận và thanh toán đều diễn ra trực tiếp với chủ không gian.
                                    </p>
                                </div>
                            </div>

                            {/* Back to search */}
                            <Link
                                href="/search"
                                className="flex items-center justify-center gap-1.5 py-2.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Quay lại tìm kiếm
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
