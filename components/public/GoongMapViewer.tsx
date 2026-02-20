'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { Listing } from '@/types/listing';

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
        const thumb = listing.images?.[0] ?? '';
        const price = listing.price_min > 0
            ? `${(listing.price_min / 1000).toFixed(0)}k – ${(listing.price_max / 1000).toFixed(0)}k ₫`
            : 'Thương lượng';
        return `
            <div style="min-width:200px;font-family:sans-serif;">
                ${thumb ? `<img src="${thumb}" style="width:100%;height:100px;object-fit:cover;border-radius:6px 6px 0 0;margin:-8px -8px 8px;width:calc(100% + 16px);" alt="" />` : ''}
                <div style="padding:${thumb ? '0' : '0'}">
                    <div style="font-weight:600;font-size:13px;color:#0f172a;margin-bottom:4px;line-height:1.3;">${listing.title}</div>
                    ${listing.space_type ? `<span style="font-size:11px;padding:2px 8px;background:#f1f5f9;border-radius:100px;color:#475569;">${listing.space_type}</span>` : ''}
                    <div style="font-size:12px;color:#334155;font-weight:600;margin-top:8px;">${price}</div>
                    <a href="/listings/${listing.id}" style="display:block;margin-top:8px;padding:6px;background:#0f172a;color:white;text-align:center;border-radius:6px;font-size:12px;text-decoration:none;font-weight:500;">Xem chi tiết →</a>
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
                const popup = new window.goongjs.Popup({ closeButton: true, closeOnClick: false, offset: 15 })
                    .setHTML(buildPopupHTML(listing));

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

    return (
        <div className="relative w-full h-full">
            <div ref={containerRef} className="w-full h-full" id="goong-map-viewer" />
            {allListings.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-premium-50/80 pointer-events-none">
                    <div className="text-center">
                        <svg className="w-12 h-12 text-premium-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-10l6-3m0 13l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4" />
                        </svg>
                        <p className="text-sm text-premium-400">Tìm kiếm để xem không gian trên bản đồ</p>
                    </div>
                </div>
            )}
        </div>
    );
}
