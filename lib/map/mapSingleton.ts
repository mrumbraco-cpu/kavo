/**
 * Map Singleton – persists the Goong map instance across component mount/unmount cycles
 * within a single browser session.
 *
 * Problem: When navigating away from /search and returning, GoongMapViewer is unmounted
 * then remounted, causing the map to reinitialize (tile flicker, ~1-2s reload).
 *
 * Solution: Store the map instance, its DOM container, and key state in module-level
 * variables (outside React lifecycle). On remount, reattach the existing DOM node
 * instead of creating a new map.
 */

interface MapSingletonState {
    map: any | null;                          // goongjs.Map instance
    mapDOMContainer: HTMLDivElement | null;   // The actual DOM div Goong rendered into
    markers: Map<string, any>;                // goongjs.Marker instances by listing ID
    isLoaded: boolean;                        // Whether map 'load' event has fired
    scriptLoaded: boolean;                    // Whether goong-js CDN script has loaded
    isInitialized: boolean;                   // Whether map.new() was called
    prevHoveredId: string | null;
    prevPageIds: Set<string>;
    prevListingsCount: number;
    prevListingsIdsHash: string;
    initialFitDone: boolean;
    popup: any | null;                        // Current open popup
}

const state: MapSingletonState = {
    map: null,
    mapDOMContainer: null,
    markers: new Map(),
    isLoaded: false,
    scriptLoaded: false,
    isInitialized: false,
    prevHoveredId: null,
    prevPageIds: new Set(),
    prevListingsCount: 0,
    prevListingsIdsHash: '',
    initialFitDone: false,
    popup: null,
};

export function getMapSingleton(): MapSingletonState {
    return state;
}

export function resetMapSingleton(): void {
    // Full reset – only call if you want to destroy the map entirely
    if (state.map) {
        try { state.map.remove(); } catch (_) {}
    }
    state.map = null;
    state.mapDOMContainer = null;
    state.markers = new Map();
    state.isLoaded = false;
    state.scriptLoaded = false;
    state.isInitialized = false;
    state.prevHoveredId = null;
    state.prevPageIds = new Set();
    state.prevListingsCount = 0;
    state.prevListingsIdsHash = '';
    state.initialFitDone = false;
    state.popup = null;
}
