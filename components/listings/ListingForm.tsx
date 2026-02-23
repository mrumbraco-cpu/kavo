'use client'

import { createListing, updateListing } from '@/app/dashboard/listings/actions'
import { useState, useCallback, useEffect } from 'react'
import { useSearchParams, usePathname } from 'next/navigation'
import {
    SPACE_TYPES,
    LOCATION_TYPES,
    SUITABLE_FOR_OPTIONS,
    NOT_SUITABLE_FOR_OPTIONS
} from '@/lib/constants/listing-options'
import {
    PROVINCES_OLD,
    DISTRICTS_OLD_BY_PROVINCE,
    PROVINCES_NEW,
    WARDS_NEW_BY_PROVINCE
} from '@/lib/constants/geography'
import {
    TIME_SLOT_TYPES,
    SESSIONS,
    DAYS_OF_WEEK,
    TimeSlotType,
    Session,
    DayOfWeek
} from '@/lib/constants/time-config'
import {
    AMENITIES,
    NEARBY_FEATURES
} from '@/lib/constants/facilities'
import { Profile } from '@/types/profile'
import { Listing } from '@/types/listing'
import dynamic from 'next/dynamic'
import { ChevronDown, ChevronUp, Check, Info, MapPin, Settings, Search as SearchIcon, ArrowLeft, X, Home } from 'lucide-react'
import { decrypt } from '@/lib/utils/encryption' // Client side decrypt? No. Values passed prop should be decrypted if needed?
// Phone and Zalo are encrypted in listing_contacts but initialListing has them? No, listing has owner_id.
// Wait, Listing type doesn't have phone/zalo. They are in listing_contacts.
// Edit page fetches listing AND listing_contacts.
// I will expect phone/zalo to be passed in props if editing.

const GoongMapSearch = dynamic(() => import('@/components/listings/GoongMapSearch'), {
    ssr: false,
    loading: () => <div className="w-full h-80 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">Đang tải bản đồ...</div>
})

const ImageUpload = dynamic(() => import('@/components/listings/ImageUpload'), {
    ssr: false,
    loading: () => <div className="w-full h-32 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">Đang tải trình tải ảnh...</div>
})

const normalizeString = (str: string) => {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '');
};

interface ListingFormProps {
    initialProfile?: Profile;
    initialListing?: Listing;
    initialPhone?: string;
    initialZalo?: string;
    mode?: 'create' | 'edit';
}

const STORAGE_KEY = 'create-listing-form-data'

export function ListingForm({ initialProfile, initialListing, initialPhone, initialZalo, mode = 'create' }: ListingFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const fromAdmin = searchParams.get('from') === 'admin' || pathname.startsWith('/admin')

    // Basic Info State
    const [phone, setPhone] = useState(initialPhone || initialProfile?.phone || '')
    const [zalo, setZalo] = useState(initialZalo || initialProfile?.zalo || '')
    const [spaceType, setSpaceType] = useState(initialListing?.space_type || '')
    const [locationType, setLocationType] = useState(initialListing?.location_type || '')

    // Geography Administrative State
    const [provinceOld, setProvinceOld] = useState(initialListing?.province_old || '')
    const [districtOld, setDistrictOld] = useState(initialListing?.district_old || '')
    const [provinceNew, setProvinceNew] = useState(initialListing?.province_new || '')
    const [wardNew, setWardNew] = useState(initialListing?.ward_new || '')

    // Address & Coordinates State
    const [detailedAddress, setDetailedAddress] = useState(initialListing?.detailed_address || '')
    const [lat, setLat] = useState<number | ''>(initialListing?.latitude || '')
    const [lng, setLng] = useState<number | ''>(initialListing?.longitude || '')
    const [inputMode, setInputMode] = useState<'map' | 'manual'>('map')
    const [manualCoords, setManualCoords] = useState('')

    // Optional Fields State
    const [description, setDescription] = useState(initialListing?.description || '')
    const [priceMin, setPriceMin] = useState(initialListing?.price_min?.toString() || '')
    const [priceMax, setPriceMax] = useState(initialListing?.price_max?.toString() || '')
    const [suitableFor, setSuitableFor] = useState<string[]>(initialListing?.suitable_for || [])
    const [notSuitableFor, setNotSuitableFor] = useState<string[]>(initialListing?.not_suitable_for || [])
    const [amenities, setAmenities] = useState<string[]>(initialListing?.amenities || [])
    const [nearbyFeatures, setNearbyFeatures] = useState<string[]>(initialListing?.nearby_features || [])
    const [timeSlots, setTimeSlots] = useState<string[]>(initialListing?.time_slots || [])

    // Image State
    const [pendingImages, setPendingImages] = useState<File[]>([])
    // For edit mode: track existing images to KEEP
    const [existingImagesToKeep, setExistingImagesToKeep] = useState<string[]>(initialListing?.images || [])

    // Time Slots Local State (for UI interaction only)
    const [curSlotType, setCurSlotType] = useState<TimeSlotType>('daily')
    const [curSession, setCurSession] = useState<Session>('Sáng')
    const [curDate, setCurDate] = useState('')
    const [curStartDate, setCurStartDate] = useState('')
    const [curEndDate, setCurEndDate] = useState('')
    const [curDayOfWeek, setCurDayOfWeek] = useState<DayOfWeek>('Thứ 2')

    // Collapsible sections state (Step 3 only)
    const [showDescription, setShowDescription] = useState(!!initialListing?.description)
    const [showImages, setShowImages] = useState(!!initialListing?.images?.length)
    const [showPricing, setShowPricing] = useState(!!initialListing?.price_min || !!initialListing?.price_max)
    const [showSuitable, setShowSuitable] = useState(!!initialListing?.suitable_for?.length)
    const [showNotSuitable, setShowNotSuitable] = useState(!!initialListing?.not_suitable_for?.length)
    const [showAmenities, setShowAmenities] = useState(!!initialListing?.amenities?.length)
    const [showNearby, setShowNearby] = useState(!!initialListing?.nearby_features?.length)
    const [showRentalTime, setShowRentalTime] = useState(!!initialListing?.time_slots?.length)

    // Geography Modal State
    const [geoModalStep, setGeoModalStep] = useState<'none' | 'old-province' | 'old-district' | 'new-province' | 'new-ward'>('none')
    const [geoSearch, setGeoSearch] = useState('')

    // Load state from localStorage on mount ONLY if creating new
    useEffect(() => {
        if (mode === 'create') {
            const savedData = localStorage.getItem(STORAGE_KEY)
            if (savedData) {
                try {
                    const data = JSON.parse(savedData)
                    if (data.currentStep) setCurrentStep(data.currentStep)
                    if (data.phone) setPhone(data.phone)
                    if (data.zalo) setZalo(data.zalo)
                    if (data.spaceType) setSpaceType(data.spaceType)
                    if (data.locationType) setLocationType(data.locationType)
                    if (data.provinceOld) setProvinceOld(data.provinceOld)
                    if (data.districtOld) setDistrictOld(data.districtOld)
                    if (data.provinceNew) setProvinceNew(data.provinceNew)
                    if (data.wardNew) setWardNew(data.wardNew)
                    if (data.detailedAddress) setDetailedAddress(data.detailedAddress)
                    if (data.lat) setLat(data.lat)
                    if (data.lng) setLng(data.lng)
                    if (data.description) setDescription(data.description)
                    if (data.priceMin) setPriceMin(data.priceMin)
                    if (data.priceMax) setPriceMax(data.priceMax)
                    if (data.suitableFor) setSuitableFor(data.suitableFor)
                    if (data.notSuitableFor) setNotSuitableFor(data.notSuitableFor)
                    if (data.amenities) setAmenities(data.amenities)
                    if (data.nearbyFeatures) setNearbyFeatures(data.nearbyFeatures)
                    if (data.timeSlots) setTimeSlots(data.timeSlots)
                } catch (e) {
                    console.error('Failed to parse saved data', e)
                }
            }
        }
    }, [mode])

    // Handle reverse geocoding when coordinates change (especially for manual input)
    useEffect(() => {
        if (inputMode === 'manual' && typeof lat === 'number' && typeof lng === 'number') {
            const timer = setTimeout(async () => {
                try {
                    const res = await fetch(`/api/places?lat=${lat}&lng=${lng}`)
                    const data = await res.json()
                    if (data.results && data.results.length > 0) {
                        setDetailedAddress(data.results[0].formatted_address)
                    }
                } catch (error) {
                    console.error('Manual reverse geocode error:', error)
                }
            }, 800) // Debounce for manual input

            return () => clearTimeout(timer)
        }
    }, [lat, lng, inputMode])

    // Save state to localStorage on change ONLY if creating new
    useEffect(() => {
        if (mode === 'create') {
            const data = {
                currentStep,
                phone,
                zalo,
                spaceType,
                locationType,
                provinceOld,
                districtOld,
                provinceNew,
                wardNew,
                detailedAddress,
                lat,
                lng,
                description,
                priceMin,
                priceMax,
                suitableFor,
                notSuitableFor,
                amenities,
                nearbyFeatures,
                timeSlots
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        }
    }, [
        mode,
        provinceOld, districtOld, provinceNew, wardNew,
        detailedAddress,
        lat, lng,
        description, priceMin, priceMax,
        suitableFor, notSuitableFor, amenities, nearbyFeatures, timeSlots
    ])

    const handleImagesChange = (existingUrls: string[], uploads: File[]) => {
        setPendingImages(uploads)
        setExistingImagesToKeep(existingUrls)
    }

    const handleLocationSelect = useCallback((latitude: number, longitude: number, address: string) => {
        setLat(latitude)
        setLng(longitude)
        setDetailedAddress(address)
    }, [])

    const toggleSuitable = (option: string) => {
        setSuitableFor(prev => prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]);
    };

    const toggleNotSuitable = (option: string) => {
        setNotSuitableFor(prev => prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]);
    };

    const toggleAmenity = (option: string) => {
        setAmenities(prev => prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]);
    };

    const toggleNearbyFeature = (option: string) => {
        setNearbyFeatures(prev => prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]);
    };

    const addTimeSlot = () => {
        let serialized = '';
        if (curSlotType === 'daily') {
            serialized = `daily|${curSession}`;
        } else if (curSlotType === 'single') {
            if (!curDate) return;
            serialized = `single|${curDate}|${curSession}`;
        } else if (curSlotType === 'range') {
            if (!curStartDate || !curEndDate) return;
            if (curStartDate > curEndDate) {
                return;
            }
            serialized = `range|${curStartDate}|${curEndDate}|${curSession}`;
        } else if (curSlotType === 'weekly') {
            if (!curDayOfWeek) return;
            serialized = `weekly|${curDayOfWeek}|${curSession}`;
        }

        if (serialized && !timeSlots.includes(serialized)) {
            setTimeSlots(prev => [...prev, serialized]);
        }
    };

    const formatTimeSlot = (slot: string) => {
        const parts = slot.split('|');
        const type = parts[0];

        const formatDate = (dateStr: string) => {
            if (!dateStr) return '';
            const [y, m, d] = dateStr.split('-');
            if (!y || !m || !d) return dateStr;
            return `${d}/${m}/${y}`;
        };

        if (type === 'daily') {
            return `Hàng ngày • ${parts[1]}`;
        }
        if (type === 'single') {
            return `Chỉ ngày ${formatDate(parts[1])} • ${parts[2]}`;
        }
        if (type === 'range') {
            return `${formatDate(parts[1])} → ${formatDate(parts[2])} • ${parts[3]}`;
        }
        if (type === 'weekly') {
            return `${parts[1]} hàng tuần • ${parts[2]}`;
        }
        return slot;
    };

    const removeTimeSlot = (index: number) => {
        setTimeSlots(prev => prev.filter((_, i) => i !== index));
    };

    const renderTimeSlotInput = () => {
        switch (curSlotType) {
            case 'daily':
                return (
                    <div className="h-[38px] flex items-center px-3 text-sm text-blue-600 bg-blue-50 border border-blue-100 rounded-md font-medium">
                        Áp dụng mọi ngày trong tuần
                    </div>
                );
            case 'single':
                return (
                    <input
                        type="date"
                        value={curDate}
                        onChange={(e) => setCurDate(e.target.value)}
                        className="h-[38px] block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm sm:text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                );
            case 'range':
                return (
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="date"
                            value={curStartDate}
                            onChange={(e) => setCurStartDate(e.target.value)}
                            className="h-[38px] block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm sm:text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="Từ ngày"
                        />
                        <input
                            type="date"
                            value={curEndDate}
                            onChange={(e) => setCurEndDate(e.target.value)}
                            className="h-[38px] block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm sm:text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="Đến ngày"
                        />
                    </div>
                );
            case 'weekly':
                return (
                    <select
                        value={curDayOfWeek}
                        onChange={(e) => setCurDayOfWeek(e.target.value as DayOfWeek)}
                        className="h-[38px] block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm sm:text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                        {DAYS_OF_WEEK.map(day => <option key={day} value={day}>{day}</option>)}
                    </select>
                );
            default:
                return null;
        }
    };

    const validateStep = (step: number) => {
        if (step === 1) {
            if (!phone || !spaceType || !locationType) {
                alert('Vui lòng điền đầy đủ thông tin bắt buộc ở Bước 1')
                return false
            }
            if (!/^\d{10}$/.test(phone)) {
                alert('Số điện thoại phải là 10 chữ số')
                return false
            }
            if (zalo && !/^\d{10}$/.test(zalo) && !zalo.startsWith('http')) {
                alert('Zalo phải là số điện thoại 10 số hoặc đường dẫn liên kết')
                return false
            }
        } else if (step === 2) {
            if (!provinceOld || !districtOld || !provinceNew || !wardNew) {
                alert('Vui lòng chọn đầy đủ địa chỉ ở Bước 2')
                return false
            }
            if (lat === '' || lng === '') {
                alert('Vui lòng chọn vị trí trên bản đồ hoặc nhập tọa độ ở Bước 2')
                return false
            }
            const latNum = Number(lat)
            const lngNum = Number(lng)
            if (isNaN(latNum) || latNum < -90 || latNum > 90) {
                alert('Vĩ độ (Latitude) không hợp lệ')
                return false
            }
            if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
                alert('Kinh độ (Longitude) không hợp lệ')
                return false
            }
        } else if (step === 3) {
            const minV = parseFloat(priceMin)
            const maxV = parseFloat(priceMax)

            if (!isNaN(minV) && minV < 0) {
                alert('Giá thấp nhất không thể nhỏ hơn 0')
                return false
            }
            if (!isNaN(maxV) && maxV < 0) {
                alert('Giá cao nhất không thể nhỏ hơn 0')
                return false
            }
            if (!isNaN(minV) && !isNaN(maxV) && maxV < minV) {
                alert('Giá cao nhất phải lớn hơn hoặc bằng giá thấp nhất')
                return false
            }
            return true
        }
        return true
    }

    const nextStep = (e: React.MouseEvent) => {
        e.preventDefault()
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    const prevStep = (e: React.MouseEvent) => {
        e.preventDefault()
        setCurrentStep(prev => prev - 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (mode === 'create') {
            if (currentStep !== 3) {
                console.log('Form submission blocked: not on Step 3')
                return
            }
            if (!validateStep(3)) return
        } else {
            // Edit mode: validate all mandatory steps regardless of current step
            if (!validateStep(1)) {
                if (currentStep !== 1) {
                    setCurrentStep(1)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                }
                return
            }
            if (!validateStep(2)) {
                if (currentStep !== 2) {
                    setCurrentStep(2)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                }
                return
            }
            if (!validateStep(3)) {
                if (currentStep !== 3) {
                    setCurrentStep(3)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                }
                return
            }
        }

        setIsSubmitting(true)
        const formData = new FormData()

        // Append all states to formData
        const generatedTitle = `${spaceType} ${locationType} tại ${districtOld}`

        pendingImages.forEach(file => { formData.append('images', file) })
        // Append existing images to keep as a separate field, maybe comma separated or multiple entries
        // Backend expects 'images' for uploads. We need a way to tellbackend about KEPT images.
        // We will append 'kept_images' for existing ones.
        existingImagesToKeep.forEach(url => { formData.append('kept_images', url) })

        formData.append('title', generatedTitle)
        formData.append('phone', phone)
        formData.append('zalo', zalo)
        formData.append('space_type', spaceType)
        formData.append('location_type', locationType)
        formData.append('province_old', provinceOld)
        formData.append('district_old', districtOld)
        formData.append('province_new', provinceNew)
        formData.append('ward_new', wardNew)
        formData.append('detailed_address', detailedAddress)
        formData.append('latitude', String(lat))
        formData.append('longitude', String(lng))
        formData.append('description', description)
        formData.append('price_min', priceMin)
        formData.append('price_max', priceMax)
        formData.append('suitable_for', suitableFor.join(','))
        formData.append('not_suitable_for', notSuitableFor.join(','))
        formData.append('amenities', amenities.join(','))
        formData.append('nearby_features', nearbyFeatures.join(','))
        formData.append('time_slots', timeSlots.join(';'))

        try {
            let result;
            if (mode === 'edit' && initialListing) {
                result = await updateListing(initialListing.id, formData)
            } else {
                result = await createListing(formData)
            }

            if (result?.error) {
                alert(result.error)
                setIsSubmitting(false)
            } else if (result?.success) {
                alert(mode === 'edit' ? 'Cập nhật tin thành công!' : 'Đăng tin thành công!')
                if (mode === 'create') localStorage.removeItem(STORAGE_KEY)
                window.location.href = fromAdmin ? '/admin/listings' : '/dashboard/listings'
                // Note: We don't set isSubmitting(false) here because we are redirecting
            }
        } catch (error) {
            console.error('Submit error:', error)
            alert('Có lỗi xảy ra khi kết nối máy chủ')
            setIsSubmitting(false)
        }
    }

    const steps = [
        { id: 1, name: 'Thông tin cơ bản', icon: <Info className="w-5 h-5" /> },
        { id: 2, name: 'Địa chỉ & Vị trí', icon: <MapPin className="w-5 h-5" /> },
        { id: 3, name: 'Tùy chọn thêm', icon: <Settings className="w-5 h-5" /> }
    ]

    return (
        <div className="w-full max-w-4xl mx-auto mb-12 px-2 sm:px-0">
            <div className="text-center space-y-2 mb-10">
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                    {mode === 'edit' ? 'Chỉnh sửa tin đăng' : 'Đăng tin không gian mới'}
                </h2>
                <p className="text-gray-500">
                    {mode === 'edit' ? 'Cập nhật thông tin chi tiết' : 'Cung cấp thông tin chi tiết qua 3 bước đơn giản'}
                </p>
                {mode === 'edit' && (
                    <div className="mt-2 p-2 bg-yellow-50 text-yellow-800 rounded-lg text-sm inline-block border border-yellow-200">
                        Lưu ý: Mọi chỉnh sửa sẽ khiến tin đăng chuyển về trạng thái &quot;Chờ duyệt&quot;
                    </div>
                )}
            </div>

            {/* Step Indicator */}
            <div className="relative mb-8 sm:mb-12 px-4">
                {/* Background Progress Line */}
                <div className="absolute top-6 left-6 right-6 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-600 transition-all duration-700 ease-out"
                        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    />
                </div>

                <div className="flex items-center justify-between relative z-10">
                    {steps.map((step, idx) => (
                        <div
                            key={step.id}
                            className={`flex flex-col items-center transition-all ${mode === 'edit' ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}`}
                            onClick={() => {
                                if (mode === 'edit') {
                                    setCurrentStep(step.id);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }
                            }}
                        >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${currentStep >= step.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'bg-gray-200 text-gray-400'
                                }`}>
                                {currentStep > step.id ? <Check className="w-6 h-6" /> : step.icon}
                            </div>
                            <span className={`mt-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors duration-300 ${currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
                                }`}>
                                <span className="hidden sm:inline">{step.name}</span>
                                <span className="sm:hidden">B{idx + 1}</span>
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10 p-4 sm:p-8 bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100">

                {/* STEP 1: BASIC INFORMATION */}
                {currentStep === 1 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-3 mb-2 pb-3 border-b border-blue-50">
                            <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                            <h3 className="text-xl font-bold text-gray-800">Thông tin cơ bản</h3>
                        </div>

                        <div className="space-y-6">

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                        placeholder="090..."
                                        maxLength={10}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Zalo</label>
                                    <input
                                        type="text"
                                        value={zalo}
                                        onChange={(e) => setZalo(e.target.value)}
                                        className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                        placeholder="090... hoặc link"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Loại hình không gian <span className="text-red-500">*</span></label>
                                    <select
                                        value={spaceType}
                                        onChange={(e) => setSpaceType(e.target.value)}
                                        className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white font-medium text-gray-700"
                                    >
                                        <option value="">-- Chọn loại hình --</option>
                                        {SPACE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Loại vị trí <span className="text-red-500">*</span></label>
                                    <select
                                        value={locationType}
                                        onChange={(e) => setLocationType(e.target.value)}
                                        className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white font-medium text-gray-700"
                                    >
                                        <option value="">-- Chọn vị trí --</option>
                                        {LOCATION_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: ADDRESS & LOCATION */}
                {currentStep === 2 && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-3 mb-2 pb-3 border-b border-blue-50">
                            <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                            <h3 className="text-xl font-bold text-gray-800">Địa chỉ & Vị trí</h3>
                        </div>

                        {/* Old Administrative System */}
                        <div className="space-y-6">
                            <h4 className="text-md font-bold text-gray-700 flex items-center gap-2">
                                <div className="w-2 h-4 bg-blue-400 rounded-full"></div>
                                Hệ thống hành chính cũ
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tỉnh/Thành phố <span className="text-red-500">*</span></label>
                                    <button
                                        type="button"
                                        onClick={() => { setGeoSearch(''); setGeoModalStep('old-province'); }}
                                        className="flex items-center justify-between w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-left hover:border-blue-300 transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <MapPin className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                            <span className={`font-medium ${provinceOld ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {provinceOld || '-- Chọn Tỉnh/Thành --'}
                                            </span>
                                        </div>
                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                    </button>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Quận/Huyện <span className="text-red-500">*</span></label>
                                    <button
                                        type="button"
                                        disabled={!provinceOld}
                                        onClick={() => { setGeoSearch(''); setGeoModalStep('old-district'); }}
                                        className="flex items-center justify-between w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-left hover:border-blue-300 transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Home className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                            <span className={`font-medium ${districtOld ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {districtOld || '-- Chọn Quận/Huyện --'}
                                            </span>
                                        </div>
                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* New Administrative System */}
                        <div className="space-y-6">
                            <h4 className="text-md font-bold text-gray-700 flex items-center gap-2">
                                <div className="w-2 h-4 bg-green-400 rounded-full"></div>
                                Hệ thống hành chính mới
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tỉnh/Thành phố <span className="text-red-500">*</span></label>
                                    <button
                                        type="button"
                                        onClick={() => { setGeoSearch(''); setGeoModalStep('new-province'); }}
                                        className="flex items-center justify-between w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-left hover:border-blue-300 transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <MapPin className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                            <span className={`font-medium ${provinceNew ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {provinceNew || '-- Chọn Tỉnh/Thành --'}
                                            </span>
                                        </div>
                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                    </button>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Phường/Xã/Quận <span className="text-red-500">*</span></label>
                                    <button
                                        type="button"
                                        disabled={!provinceNew}
                                        onClick={() => { setGeoSearch(''); setGeoModalStep('new-ward'); }}
                                        className="flex items-center justify-between w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-left hover:border-blue-300 transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Home className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                            <span className={`font-medium ${wardNew ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {wardNew || '-- Chọn Phường/Xã --'}
                                            </span>
                                        </div>
                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Geography Picker Modal */}
                        {geoModalStep !== 'none' && (
                            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                                <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setGeoModalStep('none')} />
                                <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-fade-up">
                                    {/* Header */}
                                    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                                        <div className="flex items-center gap-4">
                                            {(geoModalStep === 'old-district' || geoModalStep === 'new-ward') && (
                                                <button
                                                    onClick={() => setGeoModalStep(geoModalStep === 'old-district' ? 'old-province' : 'new-province')}
                                                    className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                                                >
                                                    <ArrowLeft className="w-5 h-5" />
                                                </button>
                                            )}
                                            <h2 className="text-lg font-bold text-gray-900">
                                                {geoModalStep.includes('province') ? 'Chọn Tỉnh / Thành phố' : (geoModalStep === 'old-district' ? 'Chọn Quận / Huyện' : 'Chọn Phường / Xã')}
                                            </h2>
                                        </div>
                                        <button onClick={() => setGeoModalStep('none')} className="p-2 rounded-full hover:bg-gray-100 text-gray-400">
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>

                                    {/* Search */}
                                    <div className="px-6 pt-4">
                                        <div className="relative">
                                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Tìm kiếm nhanh..."
                                                value={geoSearch}
                                                onChange={e => setGeoSearch(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    {/* List */}
                                    <div className="flex-1 overflow-y-auto p-6 space-y-1">
                                        {(geoModalStep === 'old-province' || geoModalStep === 'new-province') && (
                                            (geoModalStep === 'old-province' ? PROVINCES_OLD : PROVINCES_NEW)
                                                .filter(p => normalizeString(p).includes(normalizeString(geoSearch)))
                                                .map(p => (
                                                    <button
                                                        key={p}
                                                        onClick={() => {
                                                            if (geoModalStep === 'old-province') {
                                                                setProvinceOld(p);
                                                                setDistrictOld('');
                                                                setGeoModalStep('old-district');
                                                            } else {
                                                                setProvinceNew(p);
                                                                setWardNew('');
                                                                setGeoModalStep('new-ward');
                                                            }
                                                            setGeoSearch('');
                                                        }}
                                                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-left transition-all ${(geoModalStep === 'old-province' ? provinceOld : provinceNew) === p ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-700'}`}
                                                    >
                                                        <span className="text-sm font-semibold">{p}</span>
                                                        {(geoModalStep === 'old-province' ? provinceOld : provinceNew) === p && <Check className="w-4 h-4" />}
                                                    </button>
                                                ))
                                        )}
                                        {geoModalStep === 'old-district' && (
                                            (DISTRICTS_OLD_BY_PROVINCE[provinceOld] || [])
                                                .filter(d => normalizeString(d).includes(normalizeString(geoSearch)))
                                                .map(d => (
                                                    <button
                                                        key={d}
                                                        onClick={() => { setDistrictOld(d); setGeoModalStep('none'); }}
                                                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-left transition-all ${districtOld === d ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-700'}`}
                                                    >
                                                        <span className="text-sm font-semibold">{d}</span>
                                                        {districtOld === d && <Check className="w-4 h-4" />}
                                                    </button>
                                                ))
                                        )}
                                        {geoModalStep === 'new-ward' && (
                                            (WARDS_NEW_BY_PROVINCE[provinceNew] || [])
                                                .filter(w => normalizeString(w).includes(normalizeString(geoSearch)))
                                                .map(w => (
                                                    <button
                                                        key={w}
                                                        onClick={() => { setWardNew(w); setGeoModalStep('none'); }}
                                                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-left transition-all ${wardNew === w ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-700'}`}
                                                    >
                                                        <span className="text-sm font-semibold">{w}</span>
                                                        {wardNew === w && <Check className="w-4 h-4" />}
                                                    </button>
                                                ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Detailed address is captured automatically from the map/coordinates and stored in state */}

                        {/* Maps & Coordinates */}
                        <div className="space-y-6">
                            <h4 className="text-md font-bold text-gray-700 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-blue-600" /> Bản đồ & Tọa độ <span className="text-red-500">*</span>
                            </h4>

                            {inputMode === 'map' ? (
                                <div className="space-y-4">
                                    <div className="rounded-2xl overflow-hidden ring-1 ring-gray-200 shadow-sm">
                                        <GoongMapSearch
                                            onLocationSelect={handleLocationSelect}
                                            initialLat={typeof lat === 'number' ? lat : undefined}
                                            initialLng={typeof lng === 'number' ? lng : undefined}
                                            initialAddress={detailedAddress}
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setInputMode('manual')}
                                            className="text-xs font-semibold text-gray-500 hover:text-blue-600 underline underline-offset-4 transition-colors"
                                        >
                                            Không tìm thấy vị trí? Nhập tọa độ thủ công
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                                    <div className="flex items-center justify-between">
                                        <h5 className="text-sm font-bold text-gray-700">Nhập tọa độ thủ công</h5>
                                        <button
                                            type="button"
                                            onClick={() => setInputMode('map')}
                                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-4 transition-colors"
                                        >
                                            Quay lại tìm trên bản đồ
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            value={manualCoords}
                                            onChange={(e) => {
                                                const filtered = e.target.value.replace(/[^0-9.,\s\-]/g, '')
                                                setManualCoords(filtered)
                                                const commaCount = (filtered.match(/,/g) || []).length
                                                if (commaCount === 1) {
                                                    const parts = filtered.split(',').map(p => p.trim()).filter(Boolean)
                                                    if (parts.length === 2) {
                                                        const latVal = parseFloat(parts[0])
                                                        const lngVal = parseFloat(parts[1])
                                                        if (!isNaN(latVal) && !isNaN(lngVal) &&
                                                            latVal >= -90 && latVal <= 90 &&
                                                            lngVal >= -180 && lngVal <= 180) {
                                                            setLat(latVal)
                                                            setLng(lngVal)
                                                        } else {
                                                            setLat('')
                                                            setLng('')
                                                        }
                                                    }
                                                } else {
                                                    setLat('')
                                                    setLng('')
                                                }
                                            }}
                                            className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                            placeholder="Ví dụ: 10.780560, 106.699812"
                                        />
                                        <p className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-100 inline-block font-medium">
                                            Vị trí đã chọn: <span className="font-bold text-blue-600">{(typeof lat === 'number' && typeof lng === 'number') ? `${lat.toFixed(6)}, ${lng.toFixed(6)}` : 'Chưa có'}</span>
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* STEP 3: OPTIONAL DETAILS */}
                {currentStep === 3 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-blue-50">
                            <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                            <h3 className="text-xl font-bold text-gray-800">Thông tin tùy chọn</h3>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {/* Description - Collapsible */}
                            <div className="py-1">
                                <button
                                    type="button"
                                    onClick={() => setShowDescription(!showDescription)}
                                    className="w-full flex items-center justify-between py-4 px-2 hover:bg-gray-50/50 transition-colors group"
                                >
                                    <span className="font-bold text-gray-700 group-hover:text-blue-600 transition-colors">Mô tả</span>
                                    {showDescription ? <ChevronUp className="w-5 h-5 text-blue-600" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                </button>
                                {showDescription && (
                                    <div className="pb-4 px-2">
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={5}
                                            className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                                            placeholder="Mô tả chi tiết về không gian của bạn..."
                                            maxLength={5000}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Images - Collapsible */}
                            <div className="py-1">
                                <button
                                    type="button"
                                    onClick={() => setShowImages(!showImages)}
                                    className="w-full flex items-center justify-between py-4 px-2 hover:bg-gray-50/50 transition-colors group"
                                >
                                    <span className="font-bold text-gray-700 group-hover:text-blue-600 transition-colors">Hình ảnh (Tối đa 6 ảnh)</span>
                                    {showImages ? <ChevronUp className="w-5 h-5 text-blue-600" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                </button>
                                {showImages && (
                                    <div className="pb-4 px-2">
                                        <ImageUpload
                                            images={existingImagesToKeep}
                                            maxImages={6}
                                            onImagesChange={handleImagesChange}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Pricing - Collapsible */}
                            <div className="py-1">
                                <button
                                    type="button"
                                    onClick={() => setShowPricing(!showPricing)}
                                    className="w-full flex items-center justify-between py-4 px-2 hover:bg-gray-50/50 transition-colors group"
                                >
                                    <span className="font-bold text-gray-700 group-hover:text-blue-600 transition-colors">Giá thuê tham khảo</span>
                                    {showPricing ? <ChevronUp className="w-5 h-5 text-blue-600" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                </button>
                                {showPricing && (
                                    <div className="pb-4 px-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Giá thấp nhất (VNĐ)</label>
                                                <input
                                                    type="number"
                                                    value={priceMin}
                                                    onChange={(e) => setPriceMin(e.target.value)}
                                                    className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white"
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Giá cao nhất (VNĐ)</label>
                                                <input
                                                    type="number"
                                                    value={priceMax}
                                                    onChange={(e) => setPriceMax(e.target.value)}
                                                    className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Rental Time - Collapsible */}
                            <div className="py-1">
                                <button
                                    type="button"
                                    onClick={() => setShowRentalTime(!showRentalTime)}
                                    className="w-full flex items-center justify-between py-4 px-2 hover:bg-gray-50/50 transition-colors group"
                                >
                                    <span className="font-bold text-gray-700 group-hover:text-blue-600 transition-colors">Thời gian cho thuê</span>
                                    {showRentalTime ? <ChevronUp className="w-5 h-5 text-blue-600" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                </button>
                                {showRentalTime && (
                                    <div className="pb-4 px-2">
                                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                            {/* Type Selector */}
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                                <div className="space-y-1">
                                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Hình thức</label>
                                                    <select
                                                        value={curSlotType}
                                                        onChange={(e) => setCurSlotType(e.target.value as TimeSlotType)}
                                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm sm:text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                    >
                                                        {TIME_SLOT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                                                    </select>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Khung giờ</label>
                                                    <select
                                                        value={curSession}
                                                        onChange={(e) => setCurSession(e.target.value as Session)}
                                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm sm:text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                    >
                                                        {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Chọn thời gian</label>
                                                    {renderTimeSlotInput()}
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={addTimeSlot}
                                                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm shadow-sm transition-colors"
                                            >
                                                Thêm khung giờ
                                            </button>

                                            {/* List of Time Slots */}
                                            {timeSlots.length > 0 && (
                                                <div className="mt-4 space-y-2">
                                                    {timeSlots.map((slot, idx) => (
                                                        <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-blue-200 transition-colors group">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                                <div className="text-sm font-semibold text-gray-700">
                                                                    {formatTimeSlot(slot)}
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeTimeSlot(idx)}
                                                                className="text-red-500 hover:text-red-700 p-1"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Suitable For */}
                            <div className="py-1">
                                <button
                                    type="button"
                                    onClick={() => setShowSuitable(!showSuitable)}
                                    className="w-full flex items-center justify-between py-4 px-2 hover:bg-gray-50/50 transition-colors group"
                                >
                                    <span className="font-bold text-gray-700 group-hover:text-blue-600 transition-colors">Phù hợp cho</span>
                                    {showSuitable ? <ChevronUp className="w-5 h-5 text-blue-600" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                </button>
                                {showSuitable && (
                                    <div className="pb-4 px-2">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {SUITABLE_FOR_OPTIONS.map(option => (
                                                <label key={option} className="flex items-center space-x-3 cursor-pointer group">
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${suitableFor.includes(option) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-400'}`}>
                                                        {suitableFor.includes(option) && <Check className="w-3 h-3 text-white" />}
                                                        <input
                                                            type="checkbox"
                                                            checked={suitableFor.includes(option)}
                                                            onChange={() => toggleSuitable(option)}
                                                            className="hidden"
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-600 truncate">{option}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Not Suitable For */}
                            <div className="py-1">
                                <button
                                    type="button"
                                    onClick={() => setShowNotSuitable(!showNotSuitable)}
                                    className="w-full flex items-center justify-between py-4 px-2 hover:bg-gray-50/50 transition-colors group"
                                >
                                    <span className="font-bold text-gray-700 group-hover:text-red-600 transition-colors">Không phù hợp cho</span>
                                    {showNotSuitable ? <ChevronUp className="w-5 h-5 text-red-600" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                </button>
                                {showNotSuitable && (
                                    <div className="pb-4 px-2">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {NOT_SUITABLE_FOR_OPTIONS.map(option => (
                                                <label key={option} className="flex items-center space-x-3 cursor-pointer group">
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${notSuitableFor.includes(option) ? 'bg-red-600 border-red-600' : 'border-gray-300 group-hover:border-red-400'}`}>
                                                        {notSuitableFor.includes(option) && <Check className="w-3 h-3 text-white" />}
                                                        <input
                                                            type="checkbox"
                                                            checked={notSuitableFor.includes(option)}
                                                            onChange={() => toggleNotSuitable(option)}
                                                            className="hidden"
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-600 truncate">{option}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Amenities */}
                            <div className="py-1">
                                <button
                                    type="button"
                                    onClick={() => setShowAmenities(!showAmenities)}
                                    className="w-full flex items-center justify-between py-4 px-2 hover:bg-gray-50/50 transition-colors group"
                                >
                                    <span className="font-bold text-gray-700 group-hover:text-blue-600 transition-colors">Tiện ích</span>
                                    {showAmenities ? <ChevronUp className="w-5 h-5 text-blue-600" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                </button>
                                {showAmenities && (
                                    <div className="pb-4 px-2">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {AMENITIES.map(option => (
                                                <label key={option} className="flex items-center space-x-3 cursor-pointer group">
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${amenities.includes(option) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-400'}`}>
                                                        {amenities.includes(option) && <Check className="w-3 h-3 text-white" />}
                                                        <input
                                                            type="checkbox"
                                                            checked={amenities.includes(option)}
                                                            onChange={() => toggleAmenity(option)}
                                                            className="hidden"
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-600 truncate">{option}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Nearby Features */}
                            <div className="py-1">
                                <button
                                    type="button"
                                    onClick={() => setShowNearby(!showNearby)}
                                    className="w-full flex items-center justify-between py-4 px-2 hover:bg-gray-50/50 transition-colors group"
                                >
                                    <span className="font-bold text-gray-700 group-hover:text-blue-600 transition-colors">Tiện ích xung quanh</span>
                                    {showNearby ? <ChevronUp className="w-5 h-5 text-blue-600" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                </button>
                                {showNearby && (
                                    <div className="pb-4 px-2">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {NEARBY_FEATURES.map(option => (
                                                <label key={option} className="flex items-center space-x-3 cursor-pointer group">
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${nearbyFeatures.includes(option) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-400'}`}>
                                                        {nearbyFeatures.includes(option) && <Check className="w-3 h-3 text-white" />}
                                                        <input
                                                            type="checkbox"
                                                            checked={nearbyFeatures.includes(option)}
                                                            onChange={() => toggleNearbyFeature(option)}
                                                            className="hidden"
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-600 truncate">{option}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* NAVIGATION BUTTONS */}
                <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className={`px-6 py-3 rounded-xl font-bold flex items-center transition-all ${currentStep === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        Quay lại
                    </button>

                    <div className="flex gap-4">
                        {mode === 'edit' && currentStep < 3 && (
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-green-600 text-white px-6 sm:px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200 disabled:bg-gray-400 disabled:shadow-none min-w-[140px]"
                            >
                                {isSubmitting ? 'Đang xử lý...' : 'Cập nhật tin'}
                            </button>
                        )}

                        {currentStep < 3 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                            >
                                Tiếp theo
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`${mode === 'edit' ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                                    } text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg disabled:bg-gray-400 disabled:shadow-none min-w-[140px]`}
                            >
                                {isSubmitting ? 'Đang xử lý...' : (mode === 'edit' ? 'Cập nhật tin' : 'Đăng tin ngay')}
                            </button>
                        )}
                    </div>
                </div>

            </form>
        </div>
    )
}
