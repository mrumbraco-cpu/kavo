'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { Listing } from '@/types/listing';
import { getListingUrl } from '@/lib/utils/url';

// Types are now handled via types/goong.d.ts

interface Props {
    allListings: Listing[];          // Full global result set (no pagination)
    currentPageIds: Set<string>;      // IDs of listings on current page
    hoveredListingId: string | null;  // ID being hovered in result panel
    onMarkerClick?: (id: string) => void;
}

const MAP_STYLE = 'https://tiles.goong.io/assets/goong_map_web.json';
const DEFAULT_CENTER: [number, number] = [106.6297, 10.8231]; // Ho Chi Minh City
const DEFAULT_ZOOM = 11;
const MARKER_PRIMARY_COLOR = '#0f172a';   // premium-900
const MARKER_SECONDARY_COLOR = '#94a3b8'; // premium-400
const MARKER_HOVERED_COLOR = '#d4af37';   // accent-gold

import { formatPriceRange } from '@/lib/utils/format';

export default function GoongMapViewer({ allListings, currentPageIds, hoveredListingId, onMarkerClick }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<goongjs.Map | null>(null);
    const markersRef = useRef<Map<string, goongjs.Marker>>(new Map());
    const isInitializedRef = useRef(false);
    const scriptLoadedRef = useRef(false);
    const [isLoaded, setIsLoaded] = useState(false);

    const getMarkerColor = useCallback((id: string, hovered: string | null): string => {
        if (id === hovered) return MARKER_HOVERED_COLOR;
        if (currentPageIds.has(id)) return MARKER_PRIMARY_COLOR;
        return MARKER_SECONDARY_COLOR;
    }, [currentPageIds]);

    const createMarkerEl = useCallback((color: string, scale: number = 1): HTMLElement => {
        const el = document.createElement('div');
        el.style.cssText = `
            width: ${24 * scale}px;
            height: ${24 * scale}px;
            border-radius: 50%;
            background: ${color};
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            cursor: pointer;
            transition: all 0.15s ease;
        `;
        return el;
    }, []);

    const buildPopupHTML = (listing: Listing): string => {
        const thumb = listing.images?.[0] ?? null;
        const priceDisplay = formatPriceRange(listing.price_min, listing.price_max);
        const isFree = priceDisplay === 'Miễn phí';

        const spaceBadges = (listing.space_type && Array.isArray(listing.space_type) && listing.space_type.length > 0)
            ? `
                <div style="position:absolute;top:12px;left:12px;display:flex;flex-wrap:wrap;gap:4px;z-index:10;">
                    ${listing.space_type.slice(0, 2).map(type => `
                        <span style="padding:3px 8px;background:rgba(255,255,255,0.9);color:#94a3b8;font-size:10px;font-weight:500;border-radius:8px;backdrop-filter:blur(12px);white-space:nowrap;box-shadow:0 1px 2px rgba(0,0,0,0.05);">
                            ${type}
                        </span>
                    `).join('')}
                    ${listing.space_type.length > 2 ? `
                        <span style="padding:3px 8px;background:rgba(255,255,255,0.9);color:#94a3b8;font-size:10px;font-weight:500;border-radius:8px;backdrop-filter:blur(12px);box-shadow:0 1px 2px rgba(0,0,0,0.05);">
                            +${listing.space_type.length - 2}
                        </span>
                    ` : ''}
                </div>
            ` : '';

        return `
            <div style="width:260px;display:flex;flex-direction:column;background:white;font-family:inherit;">
                <!-- Image Section -->
                <div style="position:relative;width:100%;aspect-ratio:16/9;background:#f8fafc;overflow:hidden;">
                    ${thumb ? `
                        <img src="${thumb}" style="width:100%;height:100%;object-fit:cover;" alt="" />
                    ` : `
                        <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">
                            <svg style="width:40px;height:40px;color:#e2e8f0;" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                    `}
                    ${spaceBadges}
                </div>

                <!-- Content Section -->
                <div style="padding:16px;display:flex;flex-direction:column;gap:8px;">
                    <h3 style="font-weight:500;color:#0f172a;font-size:14px;line-height:1.4;margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.8em;">
                        ${listing.title}
                    </h3>

                    <!-- Footer Section -->
                    <div style="margin-top:4px;padding-top:12px;border-top:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;">
                        <span style="font-size:14px;font-weight:700;color:${isFree ? '#10b981' : '#0f172a'};">
                            ${priceDisplay}
                        </span>
                        <a href="${getListingUrl(listing)}" style="padding:6px 12px;background:#0f172a;color:white;font-size:11px;font-weight:700;border-radius:8px;text-decoration:none;transition:background 0.2s;">
                            Xem chi tiết
                        </a>
                    </div>
                </div>
            </div>
        `;
    };

    const syncMarkers = useCallback(() => {
        if (!mapRef.current || !window.goongjs) return;
        const map = mapRef.current;

        // Remove markers that are no longer in allListings
        const currentIds = new Set(allListings.map(l => l.id));
        markersRef.current.forEach((marker, id) => {
            if (!currentIds.has(id)) {
                marker.remove();
                markersRef.current.delete(id);
            }
        });

        // Add or update markers
        allListings.forEach(listing => {
            if (!listing.latitude || !listing.longitude) return;

            const color = getMarkerColor(listing.id, hoveredListingId);
            const isPrimary = currentPageIds.has(listing.id);
            const scale = isPrimary ? 1.2 : 0.9;

            if (markersRef.current.has(listing.id)) {
                // Update existing marker color
                const marker = markersRef.current.get(listing.id)!;
                const el = marker.getElement();
                el.style.background = color;
                el.style.width = `${24 * scale}px`;
                el.style.height = `${24 * scale}px`;
            } else {
                // Create new marker
                const el = createMarkerEl(color, scale);
                const popup = new (window.goongjs.Popup as any)({
                    closeButton: true,
                    closeOnClick: false,
                    offset: 20,
                    maxWidth: 'none'
                }).setHTML(buildPopupHTML(listing));

                const marker = new window.goongjs.Marker({ element: el })
                    .setLngLat([listing.longitude, listing.latitude])
                    .addTo(map);

                marker.setPopup(popup);

                el.addEventListener('click', (e) => {
                    e.stopPropagation();
                    marker.togglePopup();
                    onMarkerClick?.(listing.id);
                });

                markersRef.current.set(listing.id, marker);
            }
        });
    }, [allListings, currentPageIds, hoveredListingId, createMarkerEl, getMarkerColor, onMarkerClick]);

    // Fit bounds to markers
    const fitMarkers = useCallback(() => {
        if (!mapRef.current || allListings.length === 0) return;
        const goongjs = window.goongjs;
        if (!goongjs) return;

        const bounds = new goongjs.LngLatBounds();
        let hasValidCoords = false;

        allListings.forEach(l => {
            if (l.longitude && l.latitude) {
                bounds.extend([l.longitude, l.latitude]);
                hasValidCoords = true;
            }
        });

        if (hasValidCoords) {
            mapRef.current.fitBounds(bounds, {
                padding: 50,
                maxZoom: 15,
                duration: 1000
            });
        }
    }, [allListings]);

    const initMap = useCallback(() => {
        if (isInitializedRef.current || !containerRef.current || !window.goongjs) return;
        isInitializedRef.current = true;

        window.goongjs.accessToken = process.env.NEXT_PUBLIC_GOONG_MAP_KEY!;
        const map = new window.goongjs.Map({
            container: containerRef.current,
            style: MAP_STYLE,
            center: DEFAULT_CENTER,
            zoom: DEFAULT_ZOOM,
        });

        map.on('load', () => {
            mapRef.current = map;
            map.resize();
            setIsLoaded(true);
        });
    }, [syncMarkers, fitMarkers]);

    // Load Goong script once
    useEffect(() => {
        if (scriptLoadedRef.current) return;
        scriptLoadedRef.current = true;

        if (window.goongjs) {
            initMap();
            return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.js';
        script.async = true;
        script.onload = () => initMap();
        document.head.appendChild(script);
    }, [initMap]);

    // Update map size when container resize
    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver(() => {
            if (mapRef.current) {
                mapRef.current.resize();
            }
        });

        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    // Sync markers (visuals) only when data changes or map is ready
    useEffect(() => {
        if (!isLoaded) return;
        syncMarkers();
    }, [isLoaded, syncMarkers]);

    // Fit bounds ONLY when map is ready or results change
    useEffect(() => {
        if (!isLoaded) return;
        fitMarkers();
    }, [isLoaded, allListings, fitMarkers]);

    // Smart hover re-center: Only move map if the marker is NOT in the current view
    useEffect(() => {
        if (!isLoaded || !hoveredListingId || !mapRef.current) return;

        const listing = allListings.find(l => l.id === hoveredListingId);
        if (listing && listing.latitude && listing.longitude) {
            const map = mapRef.current;
            const bounds = map.getBounds();
            const coords: [number, number] = [listing.longitude, listing.latitude];

            // User Rule: Only re-center if the marker is OUTSIDE the current viewport.
            // Requirement update: re-center by fitting bounds for all results instead of zooming to one marker.
            if (!bounds.contains(coords)) {
                fitMarkers();
            }
        }
    }, [isLoaded, hoveredListingId, allListings, fitMarkers]);

    // Inject global styles for Goong Map Popups to eliminate white space and fix design
    useEffect(() => {
        const styleId = 'goong-map-custom-styles';
        if (typeof document === 'undefined') return;

        let style = document.getElementById(styleId) as HTMLStyleElement;
        if (!style) {
            style = document.createElement('style');
            style.id = styleId;
            document.head.appendChild(style);
        }

        style.innerHTML = `
            /* Core reset for the popup bubble */
            .goongjs-popup-content, 
            .mapboxgl-popup-content {
                padding: 0 !important;
                margin: 0 !important;
                border-radius: 16px !important;
                overflow: hidden !important;
                border: none !important;
                background: white !important;
                box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1) !important;
                width: auto !important;
                max-width: none !important;
            }

            /* Fix for common internal wrappers that cause white gaps */
            .goongjs-popup-content > div,
            .mapboxgl-popup-content > div {
                margin: 0 !important;
                padding: 0 !important;
            }

            /* Move close button to overlay the image/content */
            .goongjs-popup-close-button,
            .mapboxgl-popup-close-button {
                position: absolute !important;
                top: 8px !important;
                right: 8px !important;
                color: white !important;
                background: rgba(0, 0, 0, 0.4) !important;
                width: 28px !important;
                height: 28px !important;
                border-radius: 50% !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                z-index: 100 !important;
                border: 2px solid rgba(255, 255, 255, 0.2) !important;
                cursor: pointer !important;
                font-size: 16px !important;
                line-height: 1 !important;
                padding: 0 !important;
                backdrop-filter: blur(4px) !important;
                transition: all 0.2s !important;
                outline: none !important;
            }

            .goongjs-popup-close-button:hover,
            .mapboxgl-popup-close-button:hover {
                background: rgba(0, 0, 0, 0.7) !important;
                transform: scale(1.1);
                color: white !important;
            }

            /* Hide the arrow tip because it creates an offset gap */
            .goongjs-popup-tip,
            .mapboxgl-popup-tip {
                display: none !important;
                border: none !important;
            }

            /* Ensure the popup container itself has no hidden expansion */
            .goongjs-popup, .mapboxgl-popup {
                z-index: 30 !important;
            }
        `;

        return () => {
            const el = document.getElementById(styleId);
            if (el) el.remove();
        };
    }, []);

    return (
        <div className="relative w-full h-full">
            <div ref={containerRef} className="w-full h-full" id="goong-map-viewer" />
            {allListings.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-premium-50/80 pointer-events-none">
                    <div className="text-center">
                        <svg className="w-12 h-12 text-premium-300 mx-auto mb-3" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-10l6-3m0 13l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4" />
                        </svg>
                        <p className="text-sm text-premium-400">Tìm kiếm để xem không gian trên bản đồ</p>
                    </div>
                </div>
            )}
        </div>
    );
}
