'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Listing } from '@/types/listing';
import { getListingUrl } from '@/lib/utils/url';
import { getRentalModeLabel } from '@/lib/constants/listing-options';
import { getMapSingleton } from '@/lib/map/mapSingleton';

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
    const router = useRouter();
    // React ref for the wrapper div (placeholder that receives the persistent map DOM node)
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Singleton state (persists across mount/unmount)
    const singleton = getMapSingleton();

    // Local React state for fade-in only – derives from singleton
    const [isLoaded, setIsLoaded] = useState(singleton.isLoaded);

    const paddingLeftRef = useRef(paddingLeft);

    // Sync props to singleton handlers on every change
    useEffect(() => {
        singleton.onHover = onHover;
        singleton.onMarkerClick = onMarkerClick;
    }, [onHover, onMarkerClick, singleton]);

    // Closures over latest prop values – used inside stable sync logic
    const allListingsRef = useRef(allListings);
    const currentPageIdsRef = useRef(currentPageIds);
    const hoveredListingIdRef = useRef(hoveredListingId);

    useEffect(() => { allListingsRef.current = allListings; }, [allListings]);
    useEffect(() => { currentPageIdsRef.current = currentPageIds; }, [currentPageIds]);
    useEffect(() => { hoveredListingIdRef.current = hoveredListingId; }, [hoveredListingId]);

    useEffect(() => {
        paddingLeftRef.current = paddingLeft;
    }, [paddingLeft]);

    // ─── Stable helpers (no deps on allListings/currentPageIds to keep refs stable) ───

    const handleHover = useCallback((id: string | null) => {
        const state = getMapSingleton();
        if (state.hoverTimeout) {
            clearTimeout(state.hoverTimeout);
            state.hoverTimeout = null;
        }

        if (id) {
            state.onHover?.(id);
        } else {
            state.hoverTimeout = setTimeout(() => {
                const s = getMapSingleton();
                s.onHover?.(null);
                s.hoverTimeout = null;
            }, 300);
        }
    }, []);

    const getMarkerColor = useCallback((id: string, hovered: string | null): string => {
        if (id === hovered) return MARKER_HOVERED_COLOR;
        if (currentPageIdsRef.current.has(id)) return MARKER_PRIMARY_COLOR;
        return MARKER_SECONDARY_COLOR;
    }, []);

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
                        <a href="${getListingUrl(listing)}" class="goong-popup-link" style="padding:6px 12px;background:#0f172a;color:white;font-size:11px;font-weight:700;border-radius:8px;text-decoration:none;transition:background 0.2s;">
                            Xem chi tiết
                        </a>
                    </div>
                </div>
            </div>
        `;
    };

    const buildPopupNode = useCallback((listing: Listing) => {
        const popupNode = document.createElement('div');
        popupNode.innerHTML = buildPopupHTML(listing);
        const link = popupNode.querySelector('.goong-popup-link');
        if (link) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (href) router.push(href);
            });
        }
        return popupNode;
    }, [router]);

    // ─── Sync markers using singleton.markers ───────────────────────────────────

    const syncMarkers = useCallback(() => {
        if (!singleton.map || !window.goongjs) return;

        const task = () => {
            const map = singleton.map;
            if (!map || !window.goongjs) return;

            const listings = allListingsRef.current;
            const hovered = hoveredListingIdRef.current;
            const pageIds = currentPageIdsRef.current;

            const hoveredChanged = hovered !== singleton.prevHoveredId;

            let pageIdsChanged = pageIds.size !== singleton.prevPageIds.size;
            if (!pageIdsChanged) {
                for (let id of pageIds) {
                    if (!singleton.prevPageIds.has(id)) {
                        pageIdsChanged = true;
                        break;
                    }
                }
            }

            const currentDataIds = new Set(listings.map(l => l.id));
            singleton.markers.forEach((marker, id) => {
                if (!currentDataIds.has(id)) {
                    marker.remove();
                    singleton.markers.delete(id);
                }
            });

            const CHUNK_SIZE = 20;
            let index = 0;

            const processNextBatch = () => {
                if (index >= listings.length) {
                    singleton.prevHoveredId = hovered;
                    singleton.prevPageIds = new Set(pageIds);
                    return;
                }

                const end = Math.min(index + CHUNK_SIZE, listings.length);
                const batch = listings.slice(index, end);

                batch.forEach(listing => {
                    if (!listing.latitude || !listing.longitude) return;

                    const isCurrentHovered = listing.id === hovered;
                    const wasPrevHovered = listing.id === singleton.prevHoveredId;
                    const isCurrentPage = pageIds.has(listing.id);
                    const wasPrevPage = singleton.prevPageIds.has(listing.id);

                    const needsVisualUpdate =
                        !singleton.markers.has(listing.id) ||
                        isCurrentHovered || wasPrevHovered ||
                        isCurrentPage !== wasPrevPage;

                    if (!needsVisualUpdate && !hoveredChanged && !pageIdsChanged) return;

                    const color = getMarkerColor(listing.id, hovered);
                    const scale = isCurrentPage ? 1.2 : 0.9;

                    if (singleton.markers.has(listing.id)) {
                        const marker = singleton.markers.get(listing.id)!;
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

                            if (singleton.popup) singleton.popup.remove();

                            const popup = new (window.goongjs!.Popup as any)({
                                closeButton: false,
                                closeOnClick: true,
                                offset: 20,
                                maxWidth: 'none'
                            })
                                .setLngLat([listing.longitude!, listing.latitude!])
                                .setDOMContent(buildPopupNode(listing))
                                .addTo(map);

                            singleton.popup = popup;
                            const state = getMapSingleton();
                            state.onMarkerClick?.(listing.id);
                        });

                        singleton.markers.set(listing.id, marker);
                    }
                });

                index = end;
                if (index < listings.length) {
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
    }, [createMarkerEl, getMarkerColor, handleHover, buildPopupNode]);

    // ─── Fit bounds to markers ──────────────────────────────────────────────────

    const fitMarkers = useCallback(() => {
        if (!singleton.map || allListingsRef.current.length === 0) return;
        const goongjs = window.goongjs;
        if (!goongjs) return;

        const bounds = new goongjs.LngLatBounds();
        let hasValidCoords = false;

        allListingsRef.current.forEach(l => {
            if (l.longitude && l.latitude) {
                bounds.extend([l.longitude, l.latitude]);
                hasValidCoords = true;
            }
        });

        if (hasValidCoords) {
            (singleton.map as any).fitBounds(bounds, {
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
    }, []);

    // ─── Map init (only runs once per session) ──────────────────────────────────

    const initMap = useCallback(() => {
        if (singleton.isInitialized || !singleton.mapDOMContainer || !window.goongjs) return;
        singleton.isInitialized = true;

        window.goongjs.accessToken = process.env.NEXT_PUBLIC_GOONG_MAP_KEY!;
        const map = new window.goongjs.Map({
            container: singleton.mapDOMContainer,
            style: MAP_STYLE,
            center: DEFAULT_CENTER,
            zoom: DEFAULT_ZOOM,
        });

        singleton.map = map;

        map.on('load', () => {
            map.resize();
            if (allListingsRef.current.length === 0) {
                singleton.isLoaded = true;
                setIsLoaded(true);
            }
        });

        // Guarantee visibility after 3 seconds
        setTimeout(() => {
            singleton.isLoaded = true;
            setIsLoaded(true);
        }, 3000);
    }, []);

    // ─── Load Goong JS script (once per session) ────────────────────────────────

    const loadScript = useCallback(() => {
        if (singleton.scriptLoaded) {
            // Script already loaded – map might already be initialized too
            if (singleton.isInitialized && singleton.map) {
                // Map exists: no init needed
            } else {
                initMap();
            }
            return;
        }
        singleton.scriptLoaded = true;

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

    useEffect(() => {
        if (!wrapperRef.current) return;

        // Create the persistent map DOM container once
        if (!singleton.mapDOMContainer) {
            const div = document.createElement('div');
            div.style.width = '100%';
            div.style.height = '100%';
            singleton.mapDOMContainer = div;
        }

        // Always ensure it is visible when reattached (because we hide it on unmount)
        singleton.mapDOMContainer.style.display = 'block';

        // Attach (or reattach) the persistent container into the React wrapper
        if (!wrapperRef.current.contains(singleton.mapDOMContainer)) {
            wrapperRef.current.appendChild(singleton.mapDOMContainer);
        }

        // Sync loaded state
        if (singleton.isLoaded && !isLoaded) {
            setIsLoaded(true);
        }

        // Initialize map (or just load script) if not already done
        loadScript();

        // After reattach, trigger resize so map fills the container correctly
        if (singleton.map) {
            // Small delay to let the browser paint the layout
            const resizeTimer = setTimeout(() => {
                singleton.map?.resize();
            }, 50);
            
            return () => {
                clearTimeout(resizeTimer);
                // CRUCIAL: Prevent WebGL context loss. 
                // When navigating away from the page while the map is actively rendering (display: block), 
                // removing it abruptly from the DOM causes WebGL to reload/crash (appearing as a re-initialization).
                // By hiding it first, we inform the browser/engine to pause rendering.
                if (singleton.mapDOMContainer) {
                    singleton.mapDOMContainer.style.display = 'none';
                    if (wrapperRef.current?.contains(singleton.mapDOMContainer)) {
                        wrapperRef.current.removeChild(singleton.mapDOMContainer);
                    }
                }
            };
        }

        return () => {
            if (singleton.mapDOMContainer) {
                singleton.mapDOMContainer.style.display = 'none';
                if (wrapperRef.current?.contains(singleton.mapDOMContainer)) {
                    wrapperRef.current.removeChild(singleton.mapDOMContainer);
                }
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty deps: runs only on mount/remount

    // ─── Update map size when container resizes ─────────────────────────────────

    useEffect(() => {
        if (!wrapperRef.current) return;

        const resizeObserver = new ResizeObserver(() => {
            if (singleton.map) {
                singleton.map.resize();
            }
        });

        resizeObserver.observe(wrapperRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    // ─── Sync popup with hoveredListingId ───────────────────────────────────────

    useEffect(() => {
        if (!isLoaded || !singleton.map) return;
        const map = singleton.map;

        if (singleton.popup) {
            singleton.popup.remove();
            singleton.popup = null;
        }

        if (!hoveredListingId) return;

        const listing = allListings.find(l => l.id === hoveredListingId);
        if (listing && listing.latitude && listing.longitude) {
            const popup = new (window.goongjs!.Popup as any)({
                closeButton: false,
                closeOnClick: true,
                offset: 20,
                maxWidth: 'none'
            })
                .setLngLat([listing.longitude, listing.latitude])
                .setDOMContent(buildPopupNode(listing))
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

            singleton.popup = popup;
        }
    }, [hoveredListingId, isLoaded, allListings, handleHover]);

    // ─── Sync markers when data changes or map is ready ─────────────────────────
    // Deps include allListings, currentPageIds, hoveredListingId so markers update
    // whenever search results change, pagination changes, or hover changes.

    useEffect(() => {
        if (!isLoaded) return;
        syncMarkers();
    }, [isLoaded, syncMarkers, allListings, currentPageIds, hoveredListingId]);


    // ─── Fit bounds when result set changes ─────────────────────────────────────

    useEffect(() => {
        const map = singleton.map;
        if (!map || allListings.length === 0) return;

        const currentIdsHash = allListings.map(l => l.id).sort().join(',');
        const resultDelta = allListings.length !== singleton.prevListingsCount ||
            currentIdsHash !== singleton.prevListingsIdsHash;

        if (resultDelta) {
            const isFirstLoad = !singleton.initialFitDone;

            if (isFirstLoad) {
                const goongjs = window.goongjs;
                if (goongjs) {
                    const bounds = new goongjs.LngLatBounds();
                    allListings.forEach(l => {
                        if (l.longitude && l.latitude) bounds.extend([l.longitude, l.latitude]);
                    });

                    (map as any).fitBounds(bounds, {
                        padding: {
                            top: 50,
                            bottom: 50,
                            right: 50,
                            left: paddingLeftRef.current + 50
                        },
                        maxZoom: 15,
                        duration: 0 // Silent initial fit
                    });

                    singleton.initialFitDone = true;
                    singleton.isLoaded = true;
                    setIsLoaded(true);
                }
            } else {
                fitMarkers();
            }

            singleton.prevListingsCount = allListings.length;
            singleton.prevListingsIdsHash = currentIdsHash;
        }
    }, [allListings, fitMarkers, isLoaded]);

    // ─── Smart hover re-center ──────────────────────────────────────────────────

    useEffect(() => {
        if (!isLoaded || !hoveredListingId || !singleton.map) return;

        const listing = allListings.find(l => l.id === hoveredListingId);
        if (listing && listing.latitude && listing.longitude) {
            const map = singleton.map as any;
            const coords: [number, number] = [listing.longitude, listing.latitude];

            const point = map.project(coords);
            const containerWidth = map.getContainer().clientWidth;
            const containerHeight = map.getContainer().clientHeight;

            const margin = 40;
            if (
                point.x < paddingLeftRef.current + margin ||
                point.x > containerWidth - margin ||
                point.y < margin ||
                point.y > containerHeight - margin
            ) {
                fitMarkers();
            }
        }
    }, [isLoaded, hoveredListingId, allListings, fitMarkers]);

    // ─── Re-center when layout changes ─────────────────────────────────────────

    useEffect(() => {
        if (isLoaded) {
            const timer = setTimeout(() => {
                fitMarkers();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [layout, isLoaded, fitMarkers]);

    // ─── Inject global styles for Goong Map Popups ─────────────────────────────

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

            /* Custom animations for skeleton */
            @keyframes shimmer {
                0% { transform: translateX(-100%) skewX(-12deg); }
                100% { transform: translateX(200%) skewX(-12deg); }
            }
            @keyframes loading {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
        `;

        // NOTE: Do NOT remove this style on unmount – it needs to persist across navigations
        // since the map DOM container persists too.
    }, []);

    return (
        <div className="relative w-full h-full bg-slate-50 overflow-hidden">
            {/* Wrapper div – the persistent map DOM node is appended here on mount */}
            <div
                ref={wrapperRef}
                className={`w-full h-full transition-opacity duration-1000 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                id="goong-map-viewer"
            />

            {/* Premium Skeleton Loader */}
            {!isLoaded && (
                <div
                    className="absolute inset-0 z-20 flex flex-col bg-[#f8fafc] overflow-hidden"
                    style={{ paddingLeft: paddingLeft }}
                >
                    {/* Shimmering Grid Background Simulation */}
                    <div className="absolute inset-0 opacity-[0.4]"
                         style={{
                            backgroundImage: `linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)`,
                            backgroundSize: '40px 40px'
                         }}
                    />

                    {/* Animated Shimmer Effect */}
                    <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 translate-x-[-100%] animate-[shimmer_2s_infinite]" />

                    <div className="relative z-10 m-auto flex flex-col items-center">
                        <div className="w-16 h-16 mb-4 rounded-full bg-slate-200 flex items-center justify-center animate-bounce shadow-sm">
                            <svg className="w-8 h-8 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div className="h-2 w-32 bg-slate-200 rounded-full mb-2 overflow-hidden relative">
                            <div className="absolute inset-0 bg-blue-500/20 animate-[loading_1.5s_ease-in-out_infinite]" />
                        </div>
                        <p className="text-[13px] font-medium text-slate-400 tracking-wide uppercase">Đang tải bản đồ...</p>
                    </div>

                    {/* Faux Controls */}
                    <div className="absolute bottom-6 right-6 space-y-2">
                        <div className="w-10 h-10 bg-white rounded-lg shadow-sm border border-slate-100" />
                        <div className="w-10 h-10 bg-white rounded-lg shadow-sm border border-slate-100" />
                    </div>
                </div>
            )}

            {/* No Results Empty State */}
            {isLoaded && allListings.length === 0 && (
                <div
                    className="absolute inset-0 flex items-center justify-center bg-premium-50/80 pointer-events-none transition-all duration-500 ease-in-out z-10"
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
