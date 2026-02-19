'use client';

import { useEffect, useRef } from 'react';

// Types are now handled via types/goong.d.ts

interface Props {
    latitude: number;
    longitude: number;
}

const MAP_STYLE = 'https://tiles.goong.io/assets/goong_map_web.json';

export default function MiniMap({ latitude, longitude }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<goongjs.Map | null>(null);
    const isInitRef = useRef(false);

    useEffect(() => {
        if (isInitRef.current) return;

        const initMap = () => {
            if (!containerRef.current || !window.goongjs || isInitRef.current) return;
            isInitRef.current = true;

            window.goongjs.accessToken = process.env.NEXT_PUBLIC_GOONG_MAP_KEY!;
            const map = new window.goongjs.Map({
                container: containerRef.current,
                style: MAP_STYLE,
                center: [longitude, latitude],
                zoom: 15,
            });
            mapRef.current = map;

            new window.goongjs.Marker()
                .setLngLat([longitude, latitude])
                .addTo(map);
        };

        if (window.goongjs) {
            initMap();
            return;
        }

        // Load script only if not already present
        if (!document.querySelector('script[src*="goong-js"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.css';
            document.head.appendChild(link);

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.js';
            script.async = true;
            script.onload = initMap;
            document.head.appendChild(script);
        } else {
            // Script being loaded, poll
            const interval = setInterval(() => {
                if (window.goongjs) {
                    clearInterval(interval);
                    initMap();
                }
            }, 100);
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                isInitRef.current = false;
            }
        };
    }, [latitude, longitude]);

    return (
        <div
            ref={containerRef}
            className="w-full h-52 rounded-xl overflow-hidden border border-premium-100"
        />
    );
}
