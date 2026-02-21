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

    // Fetch listing (public, approved, not hidden)
    const { data: listing, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .eq('status', 'approved')
        .eq('is_hidden', false)
        .single();

    if (error || !listing) notFound();

    const typedListing = listing as Listing;

    // Check auth state
    const { data: { user } } = await supabase.auth.getUser();

    let coinBalance = 0;
    let alreadyUnlocked = false;
    let unlockedPhone: string | undefined;
    let unlockedZalo: string | undefined;
    let isFavorite = false;

    if (user) {
        // Get coin balance
        const { data: profile } = await supabase
            .from('profiles')
            .select('coin_balance')
            .eq('id', user.id)
            .single();
        coinBalance = profile?.coin_balance ?? 0;

        // Check if already unlocked
        const { data: unlock, error: unlockError } = await supabase
            .from('contact_unlocks')
            .select('user_id')
            .eq('user_id', user.id)
            .eq('listing_id', id)
            .maybeSingle();

        if (unlockError) {
            console.error('Error checking unlock status:', unlockError);
        }

        // Check if favorite
        const { data: favorite, error: favoriteError } = await supabase
            .from('favorites')
            .select('user_id')
            .eq('user_id', user.id)
            .eq('listing_id', id)
            .maybeSingle();

        if (favoriteError) {
            console.error('Error checking favorite status:', favoriteError);
        }

        isFavorite = !!favorite;

        const isOwner = user.id === typedListing.owner_id;

        if (unlock || isOwner) {
            alreadyUnlocked = true;
            // Fetch contact info (user already has access so we can call the RPC)
            const { data: contactData, error: rpcError } = await supabase.rpc('unlock_listing_contact', {
                p_listing_id: id,
            });

            if (rpcError) {
                console.error('Error fetching contact info via RPC:', rpcError);
            }

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

    // Format time slots for display
    const timeSlotDisplay = Array.isArray(typedListing.time_slots)
        ? typedListing.time_slots.join(' • ')
        : '';

    const address = typedListing.address_old_admin || typedListing.address_new_admin || '';
    const province = typedListing.province_old || typedListing.province_new || '';
    const district = typedListing.district_old || typedListing.ward_new || '';
    const fullAddress = [address, district, province].filter(Boolean).join(', ');

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-premium-400 mb-6">
                <Link href="/" className="hover:text-premium-700 transition-colors">Trang chủ</Link>
                <span>/</span>
                <Link href="/search" className="hover:text-premium-700 transition-colors">Tìm kiếm</Link>
                <span>/</span>
                <span className="text-premium-700 font-medium truncate max-w-xs">{typedListing.title}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left column: images + details */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Image Gallery */}
                    <ImageGallery images={typedListing.images ?? []} title={typedListing.title} />

                    {/* Title & badges */}
                    <div>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {typedListing.space_type && (
                                <span className="px-3 py-1 bg-premium-100 text-premium-700 text-xs font-medium rounded-full">
                                    {typedListing.space_type}
                                </span>
                            )}
                            {typedListing.location_type && (
                                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                                    {typedListing.location_type}
                                </span>
                            )}
                        </div>
                        <div className="flex items-start justify-between gap-4 mb-3">
                            <h1 className="text-2xl sm:text-3xl font-bold text-premium-900 leading-snug">
                                {typedListing.title}
                            </h1>
                            <div className="flex-shrink-0 mt-1">
                                <FavoriteButton
                                    listingId={id}
                                    initialIsFavorite={isFavorite}
                                    isAuthenticated={!!user}
                                />
                            </div>
                        </div>
                        {fullAddress && (
                            <div className="flex items-center gap-1.5 text-premium-500">
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-sm">{fullAddress}</span>
                            </div>
                        )}
                    </div>

                    {/* Price */}
                    <div className="p-5 rounded-2xl bg-premium-50 border border-premium-100">
                        <p className="text-xs text-premium-500 uppercase tracking-wider font-semibold mb-1">Mức giá</p>
                        {typedListing.price_min > 0 || typedListing.price_max > 0 ? (
                            <p className="text-2xl font-bold text-premium-900">
                                {typedListing.price_min === typedListing.price_max
                                    ? `${typedListing.price_min.toLocaleString('vi-VN')} ₫`
                                    : `${typedListing.price_min.toLocaleString('vi-VN')} – ${typedListing.price_max.toLocaleString('vi-VN')} ₫`
                                }
                            </p>
                        ) : (
                            <p className="text-xl font-medium text-premium-500 italic">Giá thương lượng trực tiếp</p>
                        )}
                        {timeSlotDisplay && <p className="text-sm text-premium-400 mt-1">{timeSlotDisplay}</p>}
                        <p className="text-xs text-premium-400 mt-3">
                            * Mọi thương lượng giá cả diễn ra trực tiếp với chủ không gian. Nền tảng không xử lý thanh toán.
                        </p>
                    </div>

                    {/* Description */}
                    {typedListing.description && (
                        <div>
                            <h2 className="text-lg font-semibold text-premium-900 mb-3">Mô tả không gian</h2>
                            <p className="text-premium-600 leading-relaxed whitespace-pre-line text-sm">{typedListing.description}</p>
                        </div>
                    )}

                    {/* Suitable for */}
                    {(typedListing.suitable_for?.length > 0 || typedListing.not_suitable_for?.length > 0) && (
                        <div>
                            <h2 className="text-lg font-semibold text-premium-900 mb-3">Phù hợp</h2>
                            {typedListing.suitable_for?.length > 0 && (
                                <div className="mb-3">
                                    <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-2">✓ Phù hợp với</p>
                                    <div className="flex flex-wrap gap-2">
                                        {typedListing.suitable_for.map(s => (
                                            <span key={s} className="px-3 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-100">{s}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {typedListing.not_suitable_for?.length > 0 && (
                                <div>
                                    <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2">✕ Không phù hợp với</p>
                                    <div className="flex flex-wrap gap-2">
                                        {typedListing.not_suitable_for.map(s => (
                                            <span key={s} className="px-3 py-1 bg-red-50 text-red-600 text-xs rounded-full border border-red-100">{s}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Amenities */}
                    {typedListing.amenities?.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold text-premium-900 mb-3">Tiện ích</h2>
                            <div className="flex flex-wrap gap-2">
                                {typedListing.amenities.map(a => (
                                    <span key={a} className="px-3 py-1.5 bg-premium-50 text-premium-700 text-xs font-medium rounded-full border border-premium-100">
                                        {a}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Nearby features */}
                    {typedListing.nearby_features?.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold text-premium-900 mb-3">Đặc điểm xung quanh</h2>
                            <div className="flex flex-wrap gap-2">
                                {typedListing.nearby_features.map(f => (
                                    <span key={f} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">
                                        {f}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Mini Map */}
                    {typedListing.latitude && typedListing.longitude && (
                        <div>
                            <h2 className="text-lg font-semibold text-premium-900 mb-3">Vị trí trên bản đồ</h2>
                            <MiniMap latitude={typedListing.latitude} longitude={typedListing.longitude} />
                            <p className="text-xs text-premium-400 mt-2">
                                * Vị trí hiển thị là vị trí tham chiếu, địa chỉ chính xác sẽ được cung cấp khi bạn liên hệ với chủ không gian.
                            </p>
                        </div>
                    )}
                </div>

                {/* Right column: Contact + sticky sidebar */}
                <div className="lg:col-span-1">
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
                        <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-700 leading-relaxed">
                            <p className="font-semibold mb-1">Lưu ý quan trọng</p>
                            <p>SPSHARE chỉ là kênh kết nối. Mọi thỏa thuận, hợp đồng và thanh toán đều diễn ra trực tiếp giữa bạn và chủ không gian. Nền tảng không chịu trách nhiệm về các giao dịch ngoài hệ thống.</p>
                        </div>

                        {/* Back to search */}
                        <Link
                            href="/search"
                            className="flex items-center justify-center gap-2 py-2.5 border border-premium-200 rounded-xl text-sm text-premium-600 hover:bg-premium-50 hover:border-premium-400 transition-colors"
                        >
                            ← Quay lại tìm kiếm
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
