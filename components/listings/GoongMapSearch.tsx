'use client'

import React, { useEffect, useRef, useState } from 'react'
// @ts-ignore
import goongjs from '@goongmaps/goong-js'
import '@goongmaps/goong-js/dist/goong-js.css'
import { Search, Loader2, MapPin, LocateFixed } from 'lucide-react'

interface GoongMapSearchProps {
    onLocationSelect: (lat: number, lng: number, address: string) => void
    initialLat?: number
    initialLng?: number
    initialAddress?: string
}

interface SearchResult {
    place_id: string
    description: string
    structured_formatting: {
        main_text: string
        secondary_text: string
    }
}

export default function GoongMapSearch({ onLocationSelect, initialLat, initialLng, initialAddress }: GoongMapSearchProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const mapRef = useRef<any>(null)
    const markerRef = useRef<any>(null)
    const isSelectingRef = useRef(false)
    const searchContainerRef = useRef<HTMLDivElement>(null)

    const [query, setQuery] = useState(initialAddress || '')
    const [results, setResults] = useState<SearchResult[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [showResults, setShowResults] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)
    const [isLocating, setIsLocating] = useState(false)

    const reverseGeocode = async (lat: number, lng: number) => {
        try {
            const res = await fetch(`/api/places?lat=${lat}&lng=${lng}`)
            const data = await res.json()
            if (data.results && data.results.length > 0) {
                const address = data.results[0].formatted_address
                setQuery(address)
                return address
            }
        } catch (error) {
            console.error('Reverse geocode error:', error)
        }
        return ''
    }

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (!query || query.length < 2 || isSelectingRef.current) {
                setResults([])
                isSelectingRef.current = false
                return
            }

            setIsSearching(true)
            try {
                const res = await fetch(`/api/places?input=${encodeURIComponent(query)}`)
                const data = await res.json()
                if (data.predictions) {
                    setResults(data.predictions)
                    setShowResults(true)
                }
            } catch (error) {
                console.error('Search error:', error)
            } finally {
                setIsSearching(false)
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [query])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setShowResults(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelectPlace = async (placeId: string, description: string) => {
        isSelectingRef.current = true
        setQuery(description)
        setShowResults(false)
        setResults([])
        setIsSearching(true)

        try {
            const res = await fetch(`/api/places?place_id=${placeId}`)
            const data = await res.json()

            if (data.result && data.result.geometry && data.result.geometry.location) {
                const { lat, lng } = data.result.geometry.location

                if (mapRef.current && markerRef.current) {
                    markerRef.current.setLngLat([lng, lat])
                    mapRef.current.flyTo({ center: [lng, lat], zoom: 16 })
                    onLocationSelect(lat, lng, description)
                }
            }
        } catch (error) {
            console.error('Detail error:', error)
        } finally {
            setIsSearching(false)
        }
    }

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Trình duyệt của bạn không hỗ trợ định vị.')
            return
        }

        setIsLocating(true)
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords
                if (mapRef.current && markerRef.current) {
                    markerRef.current.setLngLat([longitude, latitude])
                    mapRef.current.flyTo({ center: [longitude, latitude], zoom: 16 })
                    const address = await reverseGeocode(latitude, longitude)
                    onLocationSelect(latitude, longitude, address)
                }
                setIsLocating(false)
            },
            (error) => {
                console.error('Geolocation error:', error)
                alert('Không thể xác định vị trí của bạn. Vui lòng cấp quyền truy cập vị trí.')
                setIsLocating(false)
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        )
    }

    useEffect(() => {
        if (!mapContainerRef.current) return
        if (mapRef.current) return

        const mKey = process.env.NEXT_PUBLIC_GOONG_MAP_KEY
        if (!mKey) {
            console.error('Goong Map Key is missing')
            return
        }

        goongjs.accessToken = mKey

        const map = new goongjs.Map({
            container: mapContainerRef.current,
            style: 'https://tiles.goong.io/assets/goong_map_web.json',
            center: [initialLng || 106.6297, initialLat || 10.8231],
            zoom: 13
        })

        // Geolocation
        if (!initialLat && !initialLng && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords
                    map.setCenter([longitude, latitude])
                    map.setZoom(15)
                    marker.setLngLat([longitude, latitude])
                    // REMOVED: onLocationSelect(latitude, longitude) 
                    // We only move the map/marker, mandatory interaction is required to "confirm" coordinates.
                },
                (error) => console.warn('Geolocation failed:', error)
            )
        }

        mapRef.current = map

        const marker = new goongjs.Marker({
            draggable: true,
            color: "#EA4335"
        })
            .setLngLat([initialLng || 106.6297, initialLat || 10.8231])
            .addTo(map)

        markerRef.current = marker

        marker.on('dragend', async () => {
            const lngLat = marker.getLngLat()
            setShowResults(false)
            const address = await reverseGeocode(lngLat.lat, lngLat.lng)
            onLocationSelect(lngLat.lat, lngLat.lng, address)
        })

        map.on('load', () => {
            setIsLoaded(true)
            map.resize()
        })

    }, [onLocationSelect, initialLat, initialLng])

    // Sync external changes
    useEffect(() => {
        if (isLoaded && markerRef.current && mapRef.current && initialLat && initialLng) {
            const currentPos = markerRef.current.getLngLat()
            if (Math.abs(currentPos.lat - initialLat) > 0.00001 || Math.abs(currentPos.lng - initialLng) > 0.00001) {
                markerRef.current.setLngLat([initialLng, initialLat])
                mapRef.current.easeTo({ center: [initialLng, initialLat] })
            }
        }
    }, [initialLat, initialLng, isLoaded])

    return (
        <div className="bg-white">
            <div className="p-4 space-y-4">
                <div className="relative" ref={searchContainerRef}>

                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Tìm kiếm địa chỉ..."
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {isSearching && (
                            <Loader2 className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 animate-spin" />
                        )}
                    </div>

                    {showResults && results.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                            {results.map((item) => (
                                <button
                                    key={item.place_id}
                                    onClick={() => handleSelectPlace(item.place_id, item.description)}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-start gap-2 border-b last:border-0 border-gray-100"
                                >
                                    <MapPin className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">{item.structured_formatting.main_text}</div>
                                        <div className="text-xs text-gray-500">{item.structured_formatting.secondary_text}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="relative group">
                    <div
                        ref={mapContainerRef}
                        className="w-full h-80 rounded-xl border border-gray-100 overflow-hidden relative shadow-inner bg-gray-50"
                    />

                    {/* Current Location Button Overlay */}
                    <button
                        type="button"
                        onClick={handleGetCurrentLocation}
                        disabled={isLocating}
                        className="absolute bottom-4 right-4 z-10 p-2.5 bg-white border border-gray-200 rounded-lg shadow-md hover:bg-gray-50 flex items-center justify-center transition-all disabled:opacity-50"
                        title="Vị trí hiện tại"
                    >
                        {isLocating ? (
                            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                        ) : (
                            <LocateFixed className="h-5 w-5 text-blue-600" />
                        )}
                    </button>
                </div>
                <p className="text-[11px] text-gray-400 italic px-1">
                    * Mẹo: Tìm kiếm địa điểm hoặc kéo điểm đỏ trên bản đồ để ghim vị trí chính xác.
                </p>
            </div>
        </div>
    )
}
