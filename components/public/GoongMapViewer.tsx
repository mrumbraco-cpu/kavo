'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { Listing } from '@/types/listing';
import { getListingUrl } from '@/lib/utils/url';
import { getRentalModeLabel } from '@/lib/constants/listing-options';

// Types are now handled via types/goong.d.ts

interface Props {
    allListings: Listing[];          // Full global result set (no pagination)
    currentPageIds: Set<string>;      // IDs of listings on current page
    hoveredListingId: string | null;  // ID being hovered in result panel
    onMarkerClick?: (id: string) => void;
    onHover?: (id: string | null) => void;
    paddingLeft?: number;
    layout: string;
}

const MAP_STYLE = 'https://tiles.goong.io/assets/goong_map_web.json';
const DEFAULT_CENTER: [number, number] = [106.6297, 10.8231]; // Ho Chi Minh City
const DEFAULT_ZOOM = 11;
const MARKER_PRIMARY_COLOR = '#0f172a';   // premium-900
const MARKER_SECONDARY_COLOR = '#94a3b8'; // premium-400
const MARKER_HOVERED_COLOR = '#d4af37';   // accent-gold
const UNLOCK_THRESHOLD = Number(process.env.NEXT_PUBLIC_LISTING_UNLOCK_THRESHOLD || 5);

import { formatPriceRange } from '@/lib/utils/format';

export default function GoongMapViewer({ allListings, currentPageIds, hoveredListingId, onMarkerClick, onHover, paddingLeft = 0, layout }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<goongjs.Map | null>(null);
    const markersRef = useRef<Map<string, goongjs.Marker>>(new Map());
    const isInitializedRef = useRef(false);
    const scriptLoadedRef = useRef(false);
    const prevHoveredIdRef = useRef<string | null>(null);
    const prevPageIdsRef = useRef<Set<string>>(new Set());
    const [isLoaded, setIsLoaded] = useState(false);
    const paddingLeftRef = useRef(paddingLeft);
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleHover = useCallback((id: string | null) => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }

        if (id) {
            onHover?.(id);
        } else {
            // Delay closing to allow moving to popup
            hoverTimeoutRef.current = setTimeout(() => {
                onHover?.(null);
                hoverTimeoutRef.current = null;
            }, 300);
        }
    }, [onHover]);

    useEffect(() => {
        paddingLeftRef.current = paddingLeft;
    }, [paddingLeft]);

    const getMarkerColor = useCallback((id: string, hovered: string | null): string => {
        if (id === hovered) return MARKER_HOVERED_COLOR;
        if (currentPageIds.has(id)) return MARKER_PRIMARY_COLOR;
        return MARKER_SECONDARY_COLOR;
    }, [currentPageIds]);

    const createMarkerEl = useCallback((color: string, scale: number = 1, isUrgent: boolean = false): HTMLElement => {
        const el = document.createElement('div');
        el.style.cssText = `
            width: ${24 * scale}px;
            height: ${24 * scale}px;
            border-radius: 50%;
            background: ${color};
            border: 2px solid white;
            ${isUrgent ? '' : 'box-shadow: 0 2px 6px rgba(0,0,0,0.3);'}
            cursor: pointer;
            transition: background 0.15s ease, width 0.15s ease, height 0.15s ease;
        `;
        if (isUrgent) {
            el.classList.add('marker-dot-urgent');
        }
        return el;
    }, []);

    const buildPopupHTML = (listing: Listing): string => {
        const thumb = listing.images?.[0] ?? null;
        const priceDisplay = formatPriceRange(listing.price_min, listing.price_max);
        const isFree = priceDisplay === 'Miễn phí';

        const rentalBadges = (listing.rental_modes && Array.isArray(listing.rental_modes) && listing.rental_modes.length > 0)
            ? `
                <div style="position:absolute;top:12px;left:12px;display:flex;flex-wrap:wrap;gap:4px;z-index:10;">
                    ${listing.rental_modes.slice(0, 2).map(type => `
                        <span style="padding:3px 8px;background:rgba(255,255,255,0.9);color:#475569;font-size:10px;font-weight:500;border-radius:4px;backdrop-filter:blur(12px);white-space:nowrap;box-shadow:0 1px 2px rgba(0,0,0,0.05);">
                            ${getRentalModeLabel(type)}
                        </span>
                    `).join('')}
                    ${listing.rental_modes.length > 2 ? `
                        <span style="padding:3px 8px;background:rgba(255,255,255,0.9);color:#475569;font-size:10px;font-weight:500;border-radius:4px;backdrop-filter:blur(12px);box-shadow:0 1px 2px rgba(0,0,0,0.05);">
                            +${listing.rental_modes.length - 2}
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
                    ${rentalBadges}
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

    const popupRef = useRef<goongjs.Popup | null>(null);

    const syncMarkers = useCallback(() => {
        if (!mapRef.current || !window.goongjs) return;

        const task = () => {
            const map = mapRef.current;
            if (!map || !window.goongjs) return;

            const hoveredChanged = hoveredListingId !== prevHoveredIdRef.current;

            let pageIdsChanged = currentPageIds.size !== prevPageIdsRef.current.size;
            if (!pageIdsChanged) {
                for (let id of currentPageIds) {
                    if (!prevPageIdsRef.current.has(id)) {
                        pageIdsChanged = true;
                        break;
                    }
                }
            }

            const currentDataIds = new Set(allListings.map(l => l.id));
            markersRef.current.forEach((marker, id) => {
                if (!currentDataIds.has(id)) {
                    marker.remove();
                    markersRef.current.delete(id);
                }
            });

            // Batch marker creation to avoid long tasks
            const CHUNK_SIZE = 20;
            let index = 0;

            const processNextBatch = () => {
                if (index >= allListings.length) {
                    prevHoveredIdRef.current = hoveredListingId;
                    prevPageIdsRef.current = new Set(currentPageIds);
                    return;
                }

                const end = Math.min(index + CHUNK_SIZE, allListings.length);
                const batch = allListings.slice(index, end);

                batch.forEach(listing => {
                    if (!listing.latitude || !listing.longitude) return;

                    const isCurrentHovered = listing.id === hoveredListingId;
                    const wasPrevHovered = listing.id === prevHoveredIdRef.current;
                    const isCurrentPage = currentPageIds.has(listing.id);
                    const wasPrevPage = prevPageIdsRef.current.has(listing.id);

                    const needsVisualUpdate =
                        !markersRef.current.has(listing.id) ||
                        isCurrentHovered || wasPrevHovered ||
                        isCurrentPage !== wasPrevPage;

                    if (!needsVisualUpdate && !hoveredChanged && !pageIdsChanged) return;

                    const color = getMarkerColor(listing.id, hoveredListingId);
                    const scale = isCurrentPage ? 1.2 : 0.9;

                    if (markersRef.current.has(listing.id)) {
                        const marker = markersRef.current.get(listing.id)!;
                        const el = marker.getElement();
                        if (el.style.background !== color) el.style.background = color;
                        const sizeStr = `${24 * scale}px`;
                        if (el.style.width !== sizeStr) {
                            el.style.width = sizeStr;
                            el.style.height = sizeStr;
                        }
                    } else {
                        const isUrgent = (listing.unlock_count ?? 0) >= UNLOCK_THRESHOLD;
                        const el = createMarkerEl(color, scale, isUrgent);
                        const marker = new window.goongjs.Marker({ element: el })
                            .setLngLat([listing.longitude, listing.latitude])
                            .addTo(map);

                        el.addEventListener('mouseenter', () => {
                            handleHover(listing.id);
                        });

                        el.addEventListener('mouseleave', () => {
                            handleHover(null);
                        });

                        el.addEventListener('click', (e) => {
                            e.stopPropagation();

                            // Single lazy popup logic
                            if (popupRef.current) popupRef.current.remove();

                            const popup = new (window.goongjs!.Popup as any)({
                                closeButton: true,
                                closeOnClick: true,
                                offset: 20,
                                maxWidth: 'none'
                            })
                                .setLngLat([listing.longitude!, listing.latitude!])
                                .setHTML(buildPopupHTML(listing))
                                .addTo(map);

                            popupRef.current = popup;
                            onMarkerClick?.(listing.id);
                        });

                        markersRef.current.set(listing.id, marker);
                    }
                });

                index = end;
                if (index < allListings.length) {
                    requestAnimationFrame(processNextBatch);
                }
            };

            requestAnimationFrame(processNextBatch);
        };

        if (typeof window !== 'undefined') {
            if ('requestIdleCallback' in window) {
                (window as any).requestIdleCallback(task, { timeout: 2000 });
            } else {
                setTimeout(task, 100);
            }
        }
    }, [allListings, currentPageIds, hoveredListingId, createMarkerEl, getMarkerColor, onMarkerClick, handleHover]);

    // Sync popup with hoveredId
    useEffect(() => {
        if (!isLoaded || !mapRef.current) return;
        const map = mapRef.current;

        // remove existing popup if any
        if (popupRef.current) {
            popupRef.current.remove();
            popupRef.current = null;
        }

        if (!hoveredListingId) return;

        const listing = allListings.find(l => l.id === hoveredListingId);
        if (listing && listing.latitude && listing.longitude) {
            const popup = new (window.goongjs!.Popup as any)({
                closeButton: true,
                closeOnClick: true,
                offset: 20,
                maxWidth: 'none'
            })
                .setLngLat([listing.longitude, listing.latitude])
                .setHTML(buildPopupHTML(listing))
                .addTo(map);

            const popupEl = popup.getElement();
            if (popupEl) {
                popupEl.addEventListener('mouseenter', () => {
                    handleHover(listing.id);
                });
                popupEl.addEventListener('mouseleave', () => {
                    handleHover(null);
                });
            }

            popupRef.current = popup;
        }
    }, [hoveredListingId, isLoaded, allListings, handleHover]);

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
            (mapRef.current as any).fitBounds(bounds, {
                padding: {
                    top: 50,
                    bottom: 50,
                    right: 50,
                    left: paddingLeftRef.current + 50
                },
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

    // Fit bounds ONLY when map is ready or results change (NOT on page change)
    const prevListingsCountRef = useRef(0);
    const prevListingsIdsHashRef = useRef('');

    useEffect(() => {
        if (!isLoaded || allListings.length === 0) return;

        // Generate a simple hash of IDs to see if the result SET changed
        const currentIdsHash = allListings.map(l => l.id).sort().join(',');
        const resultDelta = allListings.length !== prevListingsCountRef.current ||
            currentIdsHash !== prevListingsIdsHashRef.current;

        if (resultDelta) {
            fitMarkers();
            prevListingsCountRef.current = allListings.length;
            prevListingsIdsHashRef.current = currentIdsHash;
        }
    }, [isLoaded, allListings, fitMarkers]);

    // Smart hover re-center: Only move map if the marker is NOT in the current view
    useEffect(() => {
        if (!isLoaded || !hoveredListingId || !mapRef.current) return;

        const listing = allListings.find(l => l.id === hoveredListingId);
        if (listing && listing.latitude && listing.longitude) {
            const map = mapRef.current as any;
            const coords: [number, number] = [listing.longitude, listing.latitude];

            // Project point to pixel coordinates to check visibility
            const point = map.project(coords);
            const containerWidth = map.getContainer().clientWidth;

            // Only re-center if the marker is OUTSIDE the current VISIBLE viewport.
            // Requirement: account for paddingLeft (sidebar width)
            const margin = 40;
            if (point.x < paddingLeftRef.current + margin || point.x > containerWidth - margin) {
                fitMarkers();
            }
        }
    }, [isLoaded, hoveredListingId, allListings, fitMarkers]);

    // Re-center when layout changes (e.g. Map -> Split or Split -> Map)
    // But NOT when expanding (30/70)
    useEffect(() => {
        if (isLoaded) {
            const timer = setTimeout(() => {
                fitMarkers();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [layout, isLoaded, fitMarkers]);

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
            /* Urgent marker pulsing glow animation */
            @keyframes markerGlow {
                0%   { box-shadow: 0 2px 6px rgba(0,0,0,0.3), 0 0 0 0px rgba(244,63,94,0.6); }
                60%  { box-shadow: 0 2px 6px rgba(0,0,0,0.3), 0 0 0 8px rgba(244,63,94,0); }
                100% { box-shadow: 0 2px 6px rgba(0,0,0,0.3), 0 0 0 0px rgba(244,63,94,0); }
            }
            .marker-dot-urgent {
                animation: markerGlow 2s ease-out infinite !important;
            }

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
                <div 
                    className="absolute inset-0 flex items-center justify-center bg-premium-50/80 pointer-events-none transition-all duration-500 ease-in-out"
                    style={{ paddingLeft: paddingLeft }}
                >
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
