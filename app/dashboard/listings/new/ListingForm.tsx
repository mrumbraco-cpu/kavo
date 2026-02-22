'use client'

import { createListing } from './actions'
import { useState, useCallback, useEffect } from 'react'
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
import dynamic from 'next/dynamic'
import { ChevronDown, ChevronUp, Check, Info, MapPin, Settings } from 'lucide-react'

const GoongMapSearch = dynamic(() => import('../../../../components/listings/GoongMapSearch'), {
    ssr: false,
    loading: () => <div className="w-full h-80 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">Đang tải bản đồ...</div>
})

const ImageUpload = dynamic(() => import('../../../../components/listings/ImageUpload'), {
    ssr: false,
    loading: () => <div className="w-full h-32 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">Đang tải trình tải ảnh...</div>
})

interface ListingFormProps {
    initialProfile?: Profile;
}

const STORAGE_KEY = 'create-listing-form-data'

export function ListingForm({ initialProfile }: ListingFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)

    // Basic Info State
    const [title, setTitle] = useState('')
    const [phone, setPhone] = useState(initialProfile?.phone || '')
    const [zalo, setZalo] = useState(initialProfile?.zalo || '')
    const [spaceType, setSpaceType] = useState('')
    const [locationType, setLocationType] = useState('')

    // Address & Coordinates State
    const [detailedAddress, setDetailedAddress] = useState('')
    const [lat, setLat] = useState<number | ''>('')
    const [lng, setLng] = useState<number | ''>('')
    const [lat, setLat] = useState<number | ''>('')
    const [lng, setLng] = useState<number | ''>('')
    const [inputMode, setInputMode] = useState<'map' | 'manual'>('map')
    const [manualCoords, setManualCoords] = useState('')

    // Optional Fields State
    const [description, setDescription] = useState('')
    const [priceMin, setPriceMin] = useState('')
    const [priceMax, setPriceMax] = useState('')
    const [suitableFor, setSuitableFor] = useState<string[]>([])
    const [notSuitableFor, setNotSuitableFor] = useState<string[]>([])
    const [amenities, setAmenities] = useState<string[]>([])
    const [nearbyFeatures, setNearbyFeatures] = useState<string[]>([])
    const [timeSlots, setTimeSlots] = useState<string[]>([])
    const [pendingImages, setPendingImages] = useState<File[]>([])

    // Time Slots Local State (for UI interaction only)
    const [curSlotType, setCurSlotType] = useState<TimeSlotType>('daily')
    const [curSession, setCurSession] = useState<Session>('Sáng')
    const [curDate, setCurDate] = useState('')
    const [curStartDate, setCurStartDate] = useState('')
    const [curEndDate, setCurEndDate] = useState('')
    const [curDayOfWeek, setCurDayOfWeek] = useState<DayOfWeek>('Thứ 2')

    // Collapsible sections state (Step 3 only)
    const [showDescription, setShowDescription] = useState(false)
    const [showImages, setShowImages] = useState(false)
    const [showPricing, setShowPricing] = useState(false)
    const [showSuitable, setShowSuitable] = useState(false)
    const [showNotSuitable, setShowNotSuitable] = useState(false)
    const [showAmenities, setShowAmenities] = useState(false)
    const [showNearby, setShowNearby] = useState(false)
    const [showRentalTime, setShowRentalTime] = useState(false)

    // Load state from localStorage on mount
    useEffect(() => {
        const savedData = localStorage.getItem(STORAGE_KEY)
        if (savedData) {
            try {
                const data = JSON.parse(savedData)
                if (data.currentStep) setCurrentStep(data.currentStep)
                if (data.title) setTitle(data.title)
                if (data.phone) setPhone(data.phone)
                if (data.zalo) setZalo(data.zalo)
                if (data.spaceType) setSpaceType(data.spaceType)
                if (data.locationType) setLocationType(data.locationType)
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
    }, [])

    // Save state to localStorage on change
    useEffect(() => {
        const data = {
            currentStep,
            title,
            phone,
            zalo,
            spaceType,
            locationType,
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
    }, [
        currentStep, title, phone, zalo, spaceType, locationType,
        detailedAddress,
        lat, lng,
        description, priceMin, priceMax,
        suitableFor, notSuitableFor, amenities, nearbyFeatures, timeSlots
    ])

    const handleImagesChange = (existingUrls: string[], uploads: File[]) => {
        setPendingImages(uploads)
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
            // Range Validation: Start date must be before or equal to End date
            if (curStartDate > curEndDate) {
                return;
            }
            serialized = `range|${curStartDate}|${curEndDate}|${curSession}`;
        } else if (curSlotType === 'weekly') {
            // Defensive Validation for Weekly
            if (!curDayOfWeek) return;
            serialized = `weekly|${curDayOfWeek}|${curSession}`;
        }

        if (serialized && !timeSlots.includes(serialized)) {
            setTimeSlots(prev => [...prev, serialized]);
        }
    };

    const removeTimeSlot = (index: number) => {
        setTimeSlots(prev => prev.filter((_, i) => i !== index));
    };

    const renderTimeSlotInput = () => {
        switch (curSlotType) {
            case 'daily':
                return (
                    <div className="text-sm text-gray-500 bg-white p-3 border border-gray-200 rounded-xl font-medium">
                        Áp dụng cho tất cả các ngày trong tuần
                    </div>
                );
            case 'single':
                return (
                    <input
                        type="date"
                        value={curDate}
                        onChange={(e) => setCurDate(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                );
            case 'range':
                return (
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="date"
                            value={curStartDate}
                            onChange={(e) => setCurStartDate(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                            placeholder="Từ ngày"
                        />
                        <input
                            type="date"
                            value={curEndDate}
                            onChange={(e) => setCurEndDate(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                            placeholder="Đến ngày"
                        />
                    </div>
                );
            case 'weekly':
                return (
                    <select
                        value={curDayOfWeek}
                        onChange={(e) => setCurDayOfWeek(e.target.value as DayOfWeek)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
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
            if (!title || !phone || !spaceType || !locationType) {
                alert('Vui lòng điền đầy đủ thông tin bắt buộc ở Bước 1')
                return false
            }
        } else if (step === 2) {
            if (!detailedAddress) {
                alert('Vui lòng chọn vị trí trên bản đồ để lấy địa chỉ chi tiết')
                return false
            }
            if (lat === '' || lng === '') {
                alert('Vui lòng chọn vị trí trên bản đồ hoặc nhập tọa độ ở Bước 2')
                return false
            }
        } else if (step === 3) {
            // Price Validation
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

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    const prevStep = () => {
        setCurrentStep(prev => prev - 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        // BLOCK accidental submission if not on the final step
        if (currentStep !== 3) {
            console.log('Form submission blocked: not on Step 3')
            return
        }

        if (!validateStep(3)) return

        setIsSubmitting(true)
        const formData = new FormData()

        // Append all states to formData
        pendingImages.forEach(file => { formData.append('images', file) })
        formData.append('title', title)
        formData.append('phone', phone)
        formData.append('zalo', zalo)
        formData.append('space_type', spaceType)
        formData.append('location_type', locationType)
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
        formData.append('time_slots', timeSlots.join(';')) // Assuming backend expects semicolon or similar

        try {
            const result = await createListing(formData)
            if (result?.error) {
                alert(result.error)
            } else if (result?.success) {
                alert('Đăng tin thành công!')
                localStorage.removeItem(STORAGE_KEY)
                window.location.href = '/dashboard/listings'
            }
        } catch (error) {
            console.error('Submit error:', error)
            alert('Có lỗi xảy ra khi kết nối máy chủ')
        } finally {
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
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Đăng tin không gian mới</h2>
                <p className="text-gray-500">Cung cấp thông tin chi tiết qua 3 bước đơn giản</p>
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
                        <div key={step.id} className="flex flex-col items-center">
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
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Tiêu đề <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                    placeholder="VD: Văn phòng rộng rãi tại Quận 1"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                        placeholder="090..."
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
                            <h4 className="text-md font-bold text-gray-700">Địa chỉ chi tiết</h4>
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                <p className="text-sm font-medium text-blue-800">
                                    {detailedAddress || 'Vui lòng chọn vị trí trên bản đồ để xác định địa chỉ chính xác.'}
                                </p>
                            </div>
                        </div>

                        {/* Maps & Coordinates */}
                        <div className="space-y-6">
                            <h4 className="text-md font-bold text-gray-700 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-blue-600" /> Bản đồ & Tọa độ <span className="text-red-500">*</span>
                            </h4>
                            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-xl border border-gray-100 w-fit">
                                <button
                                    type="button"
                                    onClick={() => setInputMode('map')}
                                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${inputMode === 'map' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Tìm trên bản đồ
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setInputMode('manual')}
                                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${inputMode === 'manual' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Nhập tọa độ
                                </button>
                            </div>

                            {inputMode === 'map' ? (
                                <div className="rounded-2xl overflow-hidden ring-1 ring-gray-200 shadow-sm">
                                    <GoongMapSearch
                                        onLocationSelect={(latitude, longitude, address) => {
                                            setLat(latitude)
                                            setLng(longitude)
                                            setDetailedAddress(address)
                                        }}
                                        initialLat={typeof lat === 'number' ? lat : undefined}
                                        initialLng={typeof lng === 'number' ? lng : undefined}
                                        initialAddress={detailedAddress}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        value={manualCoords}
                                        onChange={(e) => {
                                            setManualCoords(e.target.value)
                                            const parts = e.target.value.trim().split(/[\s,]+/).filter(Boolean)
                                            if (parts.length === 2) {
                                                const latVal = parseFloat(parts[0]); const lngVal = parseFloat(parts[1])
                                                if (!isNaN(latVal) && !isNaN(lngVal)) { setLat(latVal); setLng(lngVal); }
                                            }
                                        }}
                                        className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                        placeholder="Ví dụ: 10.780560, 106.699812"
                                    />
                                    <p className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-100 inline-block font-medium">
                                        Vị trí đã chọn: <span className="font-bold text-blue-600">{(typeof lat === 'number' && typeof lng === 'number') ? `${lat.toFixed(6)}, ${lng.toFixed(6)}` : 'Chưa có'}</span>
                                    </p>
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
                                            images={[]}
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
                                        <div className="max-h-60 overflow-y-auto custom-scrollbar pr-2">
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
                                    </div>
                                )}
                            </div>

                            {/* Nearby */}
                            <div className="py-1">
                                <button
                                    type="button"
                                    onClick={() => setShowNearby(!showNearby)}
                                    className="w-full flex items-center justify-between py-4 px-2 hover:bg-gray-50/50 transition-colors group"
                                >
                                    <span className="font-bold text-gray-700 group-hover:text-blue-600 transition-colors">Đặc điểm xung quanh</span>
                                    {showNearby ? <ChevronUp className="w-5 h-5 text-blue-600" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                </button>
                                {showNearby && (
                                    <div className="pb-4 px-2">
                                        <div className="max-h-60 overflow-y-auto custom-scrollbar pr-2">
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
                                    </div>
                                )}
                            </div>

                            {/* Rental Time Slots */}
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
                                    <div className="pb-4 px-2 space-y-6">
                                        <div className="bg-gray-50 p-4 sm:p-6 rounded-2xl space-y-4 border border-gray-100">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Hình thức</label>
                                                    <select
                                                        value={curSlotType}
                                                        onChange={(e) => setCurSlotType(e.target.value as TimeSlotType)}
                                                        className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white font-medium"
                                                    >
                                                        <option value="daily">Mỗi ngày</option>
                                                        <option value="single">Ngày cụ thể</option>
                                                        <option value="range">Khoảng ngày</option>
                                                        <option value="weekly">Hàng tuần</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Buổi / Khung giờ</label>
                                                    <select
                                                        value={curSession}
                                                        onChange={(e) => setCurSession(e.target.value as Session)}
                                                        className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white font-medium"
                                                    >
                                                        {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Chi tiết thời gian</label>
                                                {renderTimeSlotInput()}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={addTimeSlot}
                                                className="w-full flex justify-center py-3 px-4 bg-white border-2 border-dashed border-blue-400 rounded-xl text-sm font-bold text-blue-600 hover:bg-blue-50 hover:border-blue-500 transition-all shadow-sm"
                                            >
                                                + Thêm vào danh sách
                                            </button>
                                        </div>

                                        {timeSlots.length > 0 && (
                                            <div className="space-y-3 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                                                <h5 className="text-sm font-bold text-gray-700">Danh sách đã thêm:</h5>
                                                <div className="flex flex-wrap gap-2">
                                                    {timeSlots.map((slot, index) => {
                                                        const [type, val1, val2, val3] = slot.split('|');
                                                        let display = '';
                                                        if (type === 'daily') display = `Mỗi ngày (${val1})`;
                                                        else if (type === 'single') display = `${val1} (${val2})`;
                                                        else if (type === 'range') display = `${val1} - ${val2} (${val3})`;
                                                        else if (type === 'weekly') display = `${val1} (${val2})`;

                                                        return (
                                                            <div key={index} className="flex items-center gap-2 bg-white border border-blue-100 px-3 py-2 rounded-xl text-sm font-medium text-blue-700 animate-in zoom-in-95 shadow-sm">
                                                                <span>{display}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeTimeSlot(index)}
                                                                    className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-red-500 hover:text-white transition-all underline-none"
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* NAVIGATION BUTTONS */}
                <div className="flex flex-col sm:flex-row items-center justify-between pt-6 sm:pt-8 border-t border-gray-100 gap-4">
                    {currentStep > 1 ? (
                        <button
                            type="button"
                            onClick={prevStep}
                            className="w-full sm:w-auto px-8 py-3.5 border-2 border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2"
                        >
                            ← Quay lại
                        </button>
                    ) : (
                        <div className="hidden sm:block" />
                    )}

                    <div className="w-full sm:w-auto flex items-center gap-4">
                        {currentStep < 3 ? (
                            <button
                                key="btn-next"
                                type="button"
                                onClick={nextStep}
                                className="w-full sm:px-10 py-3.5 bg-blue-600 text-white rounded-2xl text-sm font-extrabold hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                Tiếp theo →
                            </button>
                        ) : (
                            <button
                                key="btn-submit"
                                type="button"
                                onClick={() => {
                                    const form = document.querySelector('form');
                                    if (form) {
                                        handleSubmit({ preventDefault: () => { } } as any);
                                    }
                                }}
                                disabled={isSubmitting}
                                className={`w-full sm:px-10 py-3.5 bg-green-600 text-white rounded-2xl text-sm font-extrabold shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700 active:scale-95'
                                    }`}
                            >
                                {isSubmitting ? 'Đang xử lý...' : 'Hoàn tất & Đăng tin'}
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    )
}
