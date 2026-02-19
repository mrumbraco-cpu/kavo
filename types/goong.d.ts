declare namespace goongjs {
    class Map {
        constructor(options: any);
        on(event: string, handler: (e?: any) => void): void;
        off(event: string, handler: (e?: any) => void): void;
        remove(): void;
        setCenter(center: [number, number]): void;
        getBounds(): { contains: (lngLat: [number, number]) => boolean };
        fitBounds(bounds: any, options?: { padding?: number; maxZoom?: number; duration?: number }): void;
        resize(): void;
    }
    class LngLatBounds {
        constructor();
        extend(lngLat: [number, number]): this;
    }
    class Marker {
        constructor(options?: { color?: string; element?: HTMLElement });
        setLngLat(lngLat: [number, number]): this;
        addTo(map: Map): this;
        remove(): void;
        getElement(): HTMLElement;
        setPopup(popup: Popup): this;
        togglePopup(): void;
    }
    class Popup {
        constructor(options?: { closeButton?: boolean; closeOnClick?: boolean; offset?: number });
        setHTML(html: string): this;
        addTo(map: Map): this;
        remove(): void;
    }
}

interface Window {
    goongjs: typeof goongjs & { accessToken: string };
}
