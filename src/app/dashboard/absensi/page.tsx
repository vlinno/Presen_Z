'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase/client'
import { checkIn, checkOut } from '@/app/actions/attendance'
import { OFFICE_LOCATION } from '@/lib/geolocation'
import { getOfficeSettings, OfficeSettings } from '@/app/actions/office'
import { checkTodayHolidayAction } from '@/app/actions/holiday'
import dynamic from 'next/dynamic'

const LocationMap = dynamic(() => import('@/components/LocationMap'), {
  ssr: false,
  loading: () => (
    <div className="glass-card overflow-hidden mb-6 animate-fade-in">
      <div className="px-4 py-3 border-b border-neutral-100">
        <span className="text-sm font-semibold text-neutral-800">Peta Lokasi</span>
      </div>
      <div className="w-full flex items-center justify-center bg-neutral-50" style={{ height: '280px' }}>
        <div className="text-center">
          <svg className="animate-spin w-6 h-6 text-primary-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-xs text-neutral-400">Memuat peta...</p>
        </div>
      </div>
    </div>
  ),
})

interface TodayRecord {
  id: number
  jam_masuk: string | null
  jam_pulang: string | null
  keterangan: string | null
}

interface LocationState {
  status: 'idle' | 'loading' | 'success' | 'error' | 'denied' | 'unavailable'
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  distance: number | null
  errorMessage: string | null
}

function calculateDistanceClient(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default function AbsensiPage() {
  const [status, setStatus] = useState<string>('hadir')
  const [alasanIzin, setAlasanIzin] = useState('')
  const [todayRecord, setTodayRecord] = useState<TodayRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)
  const [location, setLocation] = useState<LocationState>({
    status: 'idle',
    latitude: null,
    longitude: null,
    accuracy: null,
    distance: null,
    errorMessage: null,
  })
  const [officeSettings, setOfficeSettings] = useState<OfficeSettings>({
    nama: OFFICE_LOCATION.name,
    latitude: OFFICE_LOCATION.latitude,
    longitude: OFFICE_LOCATION.longitude,
    radius_meter: OFFICE_LOCATION.radiusMeters,
    jam_masuk: '08:00',
    jam_pulang: '16:30',
    jam_pulang_jumat: '11:00',
  })
  const [gpsData, setGpsData] = useState<{
    latitude: number
    longitude: number
    accuracy: number
  } | null>(null)

  // States for new features
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false)
  const [lastReadAnnId, setLastReadAnnId] = useState<string | null>(null)
  const [stats, setStats] = useState<{
    totalDays: number
    totalHadir: number
    totalIzin: number
    totalAlpa: number
    percentage: number
    monthName: string
  } | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  
  const [activeToast, setActiveToast] = useState<{ id: number; judul: string; konten: string } | null>(null)
  const [todayHoliday, setTodayHoliday] = useState<{ isHoliday: boolean; keterangan: string | null }>({
    isHoliday: false,
    keterangan: null
  })

  // States untuk navigasi kalender berbentuk kotak
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear())
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth())
  const [calendarRecords, setCalendarRecords] = useState<any[]>([])
  const [calendarHolidays, setCalendarHolidays] = useState<any[]>([])
  const [loadingCalendar, setLoadingCalendar] = useState(true)
  const [profileDates, setProfileDates] = useState<{ start: string | null; end: string | null }>({ start: null, end: null })

  const monthNamesList = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

  const fetchCalendarData = useCallback(async (year: number, month: number) => {
    setLoadingCalendar(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const startOfMonth = new Date(year, month, 1).toISOString().split('T')[0]
    const endOfMonth = new Date(year, month + 1, 0).toISOString().split('T')[0]

    // Mengambil data absensi mahasiswa untuk bulan yang dipilih
    const { data: records } = await supabase
      .from('absensi')
      .select('tanggal, keterangan')
      .eq('user_id', user.id)
      .gte('tanggal', startOfMonth)
      .lte('tanggal', endOfMonth)

    // Mengambil data hari libur untuk bulan yang dipilih
    const { data: holidays } = await supabase
      .from('hari_libur')
      .select('tanggal, keterangan, tipe')
      .gte('tanggal', startOfMonth)
      .lte('tanggal', endOfMonth)

    setCalendarRecords(records || [])
    setCalendarHolidays(holidays || [])
    setLoadingCalendar(false)
  }, [])

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11)
      setCalendarYear((prev) => prev - 1)
    } else {
      setCalendarMonth((prev) => prev - 1)
    }
  }

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0)
      setCalendarYear((prev) => prev + 1)
    } else {
      setCalendarMonth((prev) => prev + 1)
    }
  }

  const getLocalDateString = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dt = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${dt}`
  }

  const getDaysInMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1)
    const days = []
    
    let firstDayIndex = firstDay.getDay()
    firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1
    
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      })
    }
    
    const lastDay = new Date(year, month + 1, 0).getDate()
    for (let i = 1; i <= lastDay; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      })
    }
    
    const totalCells = 42
    const remainingCells = totalCells - days.length
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      })
    }
    
    return days
  }

  const fetchToday = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('absensi')
      .select('id, jam_masuk, jam_pulang, keterangan')
      .eq('user_id', user.id)
      .eq('tanggal', today)
      .maybeSingle()

    setTodayRecord(data)
  }, [])

  const fetchAnnouncements = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('pengumuman')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    if (data) setAnnouncements(data)
  }, [])

  const fetchStats = useCallback(async () => {
    setLoadingStats(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() // 0-11
    
    const startOfMonth = new Date(year, month, 1).toISOString().split('T')[0]
    const endOfMonth = new Date(year, month + 1, 0).toISOString().split('T')[0]
    
    const { data: records } = await supabase
      .from('absensi')
      .select('tanggal, keterangan')
      .eq('user_id', user.id)
      .gte('tanggal', startOfMonth)
      .lte('tanggal', endOfMonth)

    // Fetch registered holidays for this month
    const { data: monthHolidays } = await supabase
      .from('hari_libur')
      .select('tanggal')
      .gte('tanggal', startOfMonth)
      .lte('tanggal', endOfMonth)

    const holidayDates = new Set(monthHolidays?.map((h) => h.tanggal) || [])

    let totalDays = 0
    const currentDay = new Date(year, month, 1)
    const endLimit = new Date() // Today
    
    while (currentDay <= endLimit) {
      const dayStr = currentDay.toISOString().split('T')[0]
      const dayOfWeek = currentDay.getDay()
      
      // Exclude weekends AND holidays
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayDates.has(dayStr)) {
        totalDays++
      }
      currentDay.setDate(currentDay.getDate() + 1)
    }

    let totalHadir = 0
    let totalIzin = 0
    
    if (records) {
      records.forEach((r) => {
        if (r.keterangan === 'hadir') {
          totalHadir++
        } else if (r.keterangan === 'izin' || r.keterangan === 'izin kampus') {
          totalIzin++
        }
      })
    }

    const totalRecordedDays = (records || []).length
    const totalAlpa = Math.max(0, totalDays - totalRecordedDays)
    
    const percentage = totalDays > 0 ? Math.round((totalHadir / totalDays) * 100) : 0
    const monthName = monthNamesList[month]

    setStats({
      totalDays,
      totalHadir,
      totalIzin,
      totalAlpa,
      percentage,
      monthName
    })
    setLoadingStats(false)
  }, [])

  const handleFileUpload = async (file: File): Promise<string | null> => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}_${Date.now()}.${fileExt}`
    const filePath = `bukti_izin/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('bukti_izin')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw new Error('Gagal mengunggah bukti izin: ' + uploadError.message)
    }

    const { data } = supabase.storage
      .from('bukti_izin')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const fetchOfficeSettings = useCallback(async () => {
    try {
      const settings = await getOfficeSettings()
      setOfficeSettings(settings)
    } catch (err) {
      console.error('Gagal memuat pengaturan kantor:', err)
    }
  }, [])

  const checkTodayHoliday = useCallback(async () => {
    const todayStr = new Date().toISOString().split('T')[0]
    const res = await checkTodayHolidayAction(todayStr)
    setTodayHoliday(res)
  }, [])

  useEffect(() => {
    fetchToday()
    fetchAnnouncements()
    fetchStats()
    fetchOfficeSettings()
    checkTodayHoliday()
  }, [fetchToday, fetchAnnouncements, fetchStats, fetchOfficeSettings, checkTodayHoliday])

  useEffect(() => {
    fetchCalendarData(calendarYear, calendarMonth)
  }, [calendarYear, calendarMonth, fetchCalendarData])

  useEffect(() => {
    async function fetchProfileDates() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const { data } = await supabase
        .from('profiles')
        .select('tanggal_mulai, tanggal_selesai')
        .eq('id', user.id)
        .single()
        
      if (data) {
        setProfileDates({
          start: data.tanggal_mulai,
          end: data.tanggal_selesai
        })
      }
    }
    fetchProfileDates()
  }, [])

  const triggerToast = useCallback((ann: any) => {
    setActiveToast({
      id: ann.id,
      judul: ann.judul,
      konten: ann.konten,
    })
    
    // Auto dismiss after 6 seconds
    setTimeout(() => {
      setActiveToast((prev) => (prev?.id === ann.id ? null : prev))
    }, 6000)
  }, [])

  // Subscribe to real-time announcements
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('realtime_pengumuman')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pengumuman',
        },
        (payload) => {
          const newAnn = payload.new
          
          // Prepend to list
          setAnnouncements((prev) => [newAnn, ...prev])
          
          // Trigger toast
          triggerToast(newAnn)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [triggerToast])

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('last_read_announcement_id')
      setLastReadAnnId(saved)
    }
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Mencegah scroll pada halaman latar belakang ketika modal pengumuman terbuka
  useEffect(() => {
    if (isMessageModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMessageModalOpen])

  // Geolocation — dapatkan koordinat pengguna
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation({
        status: 'unavailable',
        latitude: null,
        longitude: null,
        accuracy: null,
        distance: null,
        errorMessage: 'Browser Anda tidak mendukung fitur geolokasi.',
      })
      return
    }

    setLocation((prev) => ({ ...prev, status: 'loading', errorMessage: null }))

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        setGpsData({ latitude, longitude, accuracy })
      },
      (error) => {
        let errorMessage = 'Gagal mendapatkan lokasi.'
        let errorStatus: LocationState['status'] = 'error'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              'Izin lokasi ditolak. Aktifkan izin lokasi di pengaturan browser Anda.'
            errorStatus = 'denied'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage =
              'Informasi lokasi tidak tersedia. Pastikan GPS perangkat Anda aktif.'
            errorStatus = 'unavailable'
            break
          case error.TIMEOUT:
            errorMessage =
              'Waktu permintaan lokasi habis. Pastikan sinyal GPS cukup kuat.'
            break
        }
        setGpsData(null)
        setLocation({
          status: errorStatus,
          latitude: null,
          longitude: null,
          accuracy: null,
          distance: null,
          errorMessage,
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000,
      }
    )
  }, [])

  // Sinkronisasi status lokasi & jarak berdasarkan koordinat GPS dan pengaturan kantor yang dinamis
  useEffect(() => {
    if (!gpsData) return

    const { latitude, longitude, accuracy } = gpsData
    const distance = Math.round(
      calculateDistanceClient(
        latitude,
        longitude,
        officeSettings.latitude,
        officeSettings.longitude
      )
    )
    const withinRadius = distance <= officeSettings.radius_meter
    setLocation({
      status: withinRadius ? 'success' : 'error',
      latitude,
      longitude,
      accuracy: Math.round(accuracy),
      distance,
      errorMessage: withinRadius
        ? null
        : `Anda berada ${distance}m dari kantor (maks ${officeSettings.radius_meter}m).`,
    })
  }, [gpsData, officeSettings])

  // Minta lokasi otomatis saat halaman dimuat
  useEffect(() => {
    requestLocation()
  }, [requestLocation])

  const handleCheckIn = async () => {
    setLoading(true)
    setMessage(null)

    // Untuk status 'hadir', pastikan lokasi tersedia
    if (status === 'hadir') {
      if (!location.latitude || !location.longitude) {
        setMessage({ type: 'error', text: 'Lokasi belum tersedia. Klik "Perbarui Lokasi" terlebih dahulu.' })
        setLoading(false)
        return
      }
    }

    let uploadUrl = null
    if (status === 'izin' || status === 'izin kampus') {
      if (attachmentFile) {
        try {
          setUploading(true)
          uploadUrl = await handleFileUpload(attachmentFile)
          setUploading(false)
        } catch (err: any) {
          setMessage({ type: 'error', text: err.message || 'Gagal mengunggah file bukti izin' })
          setLoading(false)
          setUploading(false)
          return
        }
      }
    }

    const formData = new FormData()
    formData.set('keterangan', status)
    if (status !== 'hadir') {
      formData.set('alasan_izin', alasanIzin)
      if (uploadUrl) {
        formData.set('bukti_izin_url', uploadUrl)
      }
    }
    // Kirim koordinat ke server
    formData.set('latitude', String(location.latitude || ''))
    formData.set('longitude', String(location.longitude || ''))

    const result = await checkIn(formData)
    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: 'Check-in berhasil!' })
      await fetchToday()
      await fetchStats()
      await fetchCalendarData(calendarYear, calendarMonth)
      setAttachmentFile(null)
    }
    setLoading(false)
  }

  const handleCheckOut = async () => {
    setLoading(true)
    setMessage(null)

    // Pastikan lokasi tersedia untuk check-out
    if (!location.latitude || !location.longitude) {
      setMessage({ type: 'error', text: 'Lokasi belum tersedia. Klik "Perbarui Lokasi" terlebih dahulu.' })
      setLoading(false)
      return
    }

    const formData = new FormData()
    formData.set('latitude', String(location.latitude))
    formData.set('longitude', String(location.longitude))

    const result = await checkOut(formData)
    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: 'Check-out berhasil!' })
      await fetchToday()
      await fetchCalendarData(calendarYear, calendarMonth)
    }
    setLoading(false)
  }

  const formatTime = (time: string) => time?.substring(0, 5) || '-'

  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

  const hasCheckedIn = !!todayRecord?.jam_masuk
  const hasCheckedOut = !!todayRecord?.jam_pulang
  const isLocationReady = location.status === 'success'
  const needsLocation = status === 'hadir'

  const isIzinToday = todayRecord?.keterangan === 'izin' || todayRecord?.keterangan === 'izin kampus'
  const showCheckOut = hasCheckedIn && !hasCheckedOut && !isIzinToday

  // Cek batas toleransi checkout untuk tampilan frontend (WITA Asia/Makassar)
  const getIsCheckoutPastTolerance = () => {
    try {
      const witaString = currentTime.toLocaleString('en-US', { timeZone: 'Asia/Makassar' })
      const witaDate = new Date(witaString)
      const witaDay = witaDate.getDay() // 0 = Minggu, 1 = Senin, ..., 5 = Jumat, 6 = Sabtu
      const witaHour = witaDate.getHours()
      const witaMinute = witaDate.getMinutes()
      const witaTimeInMinutes = witaHour * 60 + witaMinute

      if (witaDay >= 1 && witaDay <= 4) {
        return witaTimeInMinutes >= 1080 // 18:00
      } else if (witaDay === 5) {
        return witaTimeInMinutes >= 780 // 13:00
      }
    } catch (e) {
      console.error(e)
    }
    return false
  }

  const isCheckoutPastTolerance = getIsCheckoutPastTolerance()
  const showLocationAndMap = !hasCheckedIn || (showCheckOut && !isCheckoutPastTolerance)

  const activeAnnouncements = announcements.filter((ann) => {
    const postedTime = new Date(ann.created_at).getTime()
    return Date.now() - postedTime < 24 * 60 * 60 * 1000
  })

  const unreadCount = lastReadAnnId
    ? announcements.filter((ann) => ann.id > Number(lastReadAnnId)).length
    : announcements.filter((ann) => {
        const postedTime = new Date(ann.created_at).getTime()
        return Date.now() - postedTime < 24 * 60 * 60 * 1000
      }).length

  const handleOpenMessages = () => {
    setIsMessageModalOpen(true)
    if (announcements.length > 0) {
      const newestId = String(announcements[0].id)
      localStorage.setItem('last_read_announcement_id', newestId)
      setLastReadAnnId(newestId)
    }
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Date & Time Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">Absensi Harian</h1>
          <p className="text-neutral-500 text-sm">
            {mounted ? (
              `${dayNames[currentTime.getDay()]}, ${currentTime.getDate()} ${monthNames[currentTime.getMonth()]} ${currentTime.getFullYear()}`
            ) : (
              'Memuat hari & tanggal...'
            )}
          </p>
        </div>

        {/* Ikon Pesan */}
        <button
          onClick={handleOpenMessages}
          className="relative p-3 rounded-2xl bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800 shadow-sm transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95"
          title="Lihat Semua Pengumuman"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-extrabold text-white ring-2 ring-white animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Banner Libur Nasional / Akhir Pekan */}
      {todayHoliday.isHoliday && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm font-semibold flex items-start gap-3 animate-fade-in shadow-sm">
          <span className="text-xl">🚩</span>
          <div>
            <p className="font-bold text-red-950">Hari Absensi Diliburkan</p>
            <p className="text-xs text-red-700 font-normal mt-0.5">
              Absensi tidak aktif hari ini karena: <strong>{todayHoliday.keterangan}</strong>
            </p>
          </div>
        </div>
      )}

      {/* Papan Pengumuman (Hanya 24 jam terakhir) */}
      {activeAnnouncements.length > 0 && (
        <div className="mb-6 space-y-3">
          {activeAnnouncements.map((ann) => (
            <div key={ann.id} className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-900 shadow-sm flex gap-3 animate-fade-in">
              <span className="text-2xl mt-0.5 animate-bounce">📢</span>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-sm text-amber-950">{ann.judul}</h4>
                <p className="text-xs text-amber-800 mt-1 whitespace-pre-wrap leading-relaxed">{ann.konten}</p>
                <p className="text-[10px] text-amber-500 mt-2">
                  Diposting pada {new Date(ann.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Widget Statistik Bulanan */}
      {!loadingStats && stats && (
        <div className="glass-card p-5 mb-6 animate-fade-in border-l-4 border-l-primary-500">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-800">Statistik Kehadiran ({stats.monthName})</h3>
              <p className="text-xs text-neutral-400">Total hari kerja bulan ini: {stats.totalDays} hari</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-primary-700">{stats.percentage}%</span>
              <p className="text-[10px] text-neutral-400">Rasio Kehadiran</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            <div className="bg-green-50/50 border border-green-100/50 rounded-xl p-3 text-center">
              <span className="text-xs font-semibold text-green-600 block">Hadir</span>
              <span className="text-xl font-bold text-green-700 block mt-1">{stats.totalHadir}</span>
            </div>
            <div className="bg-amber-50/50 border border-amber-100/50 rounded-xl p-3 text-center">
              <span className="text-xs font-semibold text-amber-600 block">Izin</span>
              <span className="text-xl font-bold text-amber-700 block mt-1">{stats.totalIzin}</span>
            </div>
            <div className="bg-red-50/50 border border-red-100/50 rounded-xl p-3 text-center">
              <span className="text-xs font-semibold text-red-500 block">Alpa</span>
              <span className="text-xl font-bold text-red-600 block mt-1">{stats.totalAlpa}</span>
            </div>
            <div className="bg-primary-50/50 border border-primary-100/50 rounded-xl p-3 text-center">
              <span className="text-xs font-semibold text-primary-600 block">Rasio</span>
              <span className="text-xl font-bold text-primary-700 block mt-1">{stats.percentage}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Live Clock */}
      <div className="glass-card p-6 mb-6 text-center">
        <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">Waktu Sekarang (WITA)</p>
        <p className="text-5xl font-bold text-primary-700 tabular-nums tracking-tight">
          {mounted ? (
            currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
          ) : (
            '--:--:--'
          )}
        </p>
      </div>

      {/* Calendar Grid Card */}
      <div className="glass-card p-6 mb-6 animate-slide-up">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-sm font-bold text-neutral-800">Kalender Kehadiran & Hari Libur</h3>
            <p className="text-xs text-neutral-400">Navigasi tanggal dan rekap status harian Anda</p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-all text-neutral-600 active:scale-95 cursor-pointer text-xs"
            >
              ◀
            </button>
            <span className="text-xs font-bold text-neutral-800 uppercase min-w-[120px] text-center">
              {monthNamesList[calendarMonth]} {calendarYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-all text-neutral-600 active:scale-95 cursor-pointer text-xs"
            >
              ▶
            </button>
          </div>
        </div>

        {loadingCalendar ? (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : (
          <div>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1.5 mb-2 text-center text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              <div>Sen</div>
              <div>Sel</div>
              <div>Rab</div>
              <div>Kam</div>
              <div>Jum</div>
              <div className="text-red-400">Sab</div>
              <div className="text-red-400">Min</div>
            </div>

            {/* Grid cells */}
            <div className="grid grid-cols-7 gap-1.5">
              {getDaysInMonth(calendarYear, calendarMonth).map((dayObj, index) => {
                const dateStr = getLocalDateString(dayObj.date);
                const isToday = dateStr === getLocalDateString(new Date());
                const isWeekend = dayObj.date.getDay() === 0 || dayObj.date.getDay() === 6;
                
                // Find holiday
                const holiday = calendarHolidays.find(h => h.tanggal === dateStr);
                // Find attendance
                const attRecord = calendarRecords.find(r => r.tanggal === dateStr);
                
                let cellStyle = "bg-white border border-neutral-200 text-neutral-800";
                let dotColor = null;
                let tooltipText = null;

                if (!dayObj.isCurrentMonth) {
                  cellStyle = "bg-neutral-50/35 border border-neutral-100/50 text-neutral-300";
                } else if (holiday) {
                  cellStyle = "bg-red-50 border border-red-200 text-red-700 font-semibold";
                  tooltipText = `Libur: ${holiday.keterangan}`;
                } else if (isWeekend) {
                  cellStyle = "bg-neutral-100/50 border border-neutral-200 text-neutral-400";
                }

                if (dayObj.isCurrentMonth && attRecord) {
                  if (attRecord.keterangan === 'hadir') {
                    dotColor = "bg-green-500 ring-2 ring-green-100";
                    cellStyle += " border-green-300";
                  } else if (attRecord.keterangan === 'izin' || attRecord.keterangan === 'izin kampus') {
                    dotColor = "bg-amber-500 ring-2 ring-amber-100";
                    cellStyle += " border-amber-300";
                  }
                } else if (dayObj.isCurrentMonth && !holiday && !isWeekend && !attRecord) {
                  // Check if past weekday within internship period
                  const dObj = dayObj.date;
                  const now = new Date();
                  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                  
                  const isPast = dObj < todayMidnight;
                  const isAfterStart = !profileDates.start || dObj >= new Date(profileDates.start + 'T00:00:00');
                  const isBeforeEnd = !profileDates.end || dObj <= new Date(profileDates.end + 'T00:00:00');

                  if (isPast && isAfterStart && isBeforeEnd) {
                    dotColor = "bg-red-500 ring-2 ring-red-100";
                    cellStyle += " border-red-300 bg-red-50/20";
                    tooltipText = "Alpa (Tidak Absen)";
                  }
                }

                return (
                  <div
                    key={index}
                    className={`relative flex flex-col items-center justify-center p-1.5 rounded-xl text-xs h-10 transition-all group ${cellStyle} ${
                      isToday ? 'ring-2 ring-primary-500 font-bold border-transparent' : ''
                    }`}
                  >
                    <span className="text-[11px]">{dayObj.date.getDate()}</span>
                    {dotColor && (
                      <span className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${dotColor}`} />
                    )}

                    {/* Custom HTML hover tooltip */}
                    {tooltipText && (
                      <div className="absolute bottom-full mb-2 hidden group-hover:block z-30 w-36 bg-neutral-900 text-white text-[9px] p-2 rounded-lg shadow-xl text-center leading-normal">
                        {tooltipText}
                        <div className="w-1.5 h-1.5 bg-neutral-900 rotate-45 mx-auto -mb-3 mt-1" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3.5 mt-4 pt-4 border-t border-neutral-100 text-[10px] text-neutral-400 font-medium justify-center">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span>Hadir</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Izin</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span>Alpa</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-red-50 border border-red-200" />
                <span>Hari Libur</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-neutral-100" />
                <span>Akhir Pekan</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Location Status Card */}
      {showLocationAndMap && (
        <div className={`glass-card p-4 mb-6 animate-fade-in border-l-4 ${
          location.status === 'success'
            ? 'border-l-green-500'
            : location.status === 'loading'
            ? 'border-l-blue-500'
            : 'border-l-red-500'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {/* Location icon */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                location.status === 'success'
                  ? 'bg-green-100'
                  : location.status === 'loading'
                  ? 'bg-blue-100'
                  : 'bg-red-100'
              }`}>
                {location.status === 'loading' ? (
                  <svg className="animate-spin w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className={`w-5 h-5 ${location.status === 'success' ? 'text-green-600' : 'text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </div>

              <div className="min-w-0">
                <p className={`text-sm font-semibold ${
                  location.status === 'success' ? 'text-green-700' : location.status === 'loading' ? 'text-blue-700' : 'text-red-700'
                }`}>
                  {location.status === 'loading' && 'Mendeteksi lokasi...'}
                  {location.status === 'success' && `Di area kantor (${location.distance}m)`}
                  {location.status === 'error' && 'Di luar area kantor'}
                  {location.status === 'denied' && 'Izin lokasi ditolak'}
                  {location.status === 'unavailable' && 'GPS tidak tersedia'}
                  {location.status === 'idle' && 'Menunggu lokasi...'}
                </p>
                <p className="text-xs text-neutral-500 truncate">
                  {location.status === 'success' && `Akurasi: ±${location.accuracy}m`}
                  {location.status === 'error' && location.errorMessage}
                  {location.status === 'denied' && location.errorMessage}
                  {location.status === 'unavailable' && location.errorMessage}
                  {location.status === 'loading' && 'Pastikan GPS aktif...'}
                </p>
              </div>
            </div>

            {/* Refresh button */}
            <button
              onClick={requestLocation}
              disabled={location.status === 'loading'}
              className="flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-all disabled:opacity-50"
              title="Perbarui lokasi"
            >
              <svg className={`w-4 h-4 ${location.status === 'loading' ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Real-time Map */}
      {showLocationAndMap && (
        <LocationMap
          userLat={location.latitude}
          userLon={location.longitude}
          accuracy={location.accuracy}
          distance={location.distance}
          withinRadius={location.status === 'success'}
          officeLat={officeSettings.latitude}
          officeLon={officeSettings.longitude}
          officeRadius={officeSettings.radius_meter}
          officeName={officeSettings.nama}
        />
      )}

      {/* Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm font-medium animate-fade-in ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Today Status Card */}
      {hasCheckedIn && (
        <div className="glass-card p-6 mb-6 animate-slide-up">
          <h3 className="text-sm font-medium text-neutral-500 mb-4">Status Hari Ini</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs text-neutral-400 mb-1">Jam Masuk</p>
              <p className="text-lg font-semibold text-primary-700">{formatTime(todayRecord!.jam_masuk!)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-neutral-400 mb-1">Jam Pulang</p>
              <p className="text-lg font-semibold text-primary-700">
                {hasCheckedOut ? formatTime(todayRecord!.jam_pulang!) : '—'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-neutral-400 mb-1">Status</p>
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                todayRecord!.keterangan === 'hadir'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {todayRecord!.keterangan === 'izin kampus'
                  ? 'Izin Kampus/Sekolah'
                  : todayRecord!.keterangan === 'izin'
                  ? 'Izin'
                  : todayRecord!.keterangan}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Check-in Form */}
      {!hasCheckedIn && (
        <div className="glass-card p-6 mb-6 animate-slide-up">
          <h3 className="text-base font-semibold text-neutral-800 mb-4">Check-In</h3>

          <div className="space-y-4">
            {/* Status Selection */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-3">Status Kehadiran</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'hadir', label: 'Hadir', emoji: '✅' },
                  { value: 'izin', label: 'Izin', emoji: '📋' },
                  { value: 'izin kampus', label: 'Izin Kampus/Sekolah', emoji: '🏫' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setStatus(opt.value)
                      if (opt.value !== 'izin') setAlasanIzin('')
                    }}
                    className={`p-4 rounded-xl border-2 text-center transition-all duration-200 hover:-translate-y-0.5 ${
                      status === opt.value
                        ? 'border-primary-500 bg-primary-50 shadow-md'
                        : 'border-neutral-200 bg-white hover:border-neutral-300'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{opt.emoji}</span>
                    <span className={`text-sm font-medium ${
                      status === opt.value ? 'text-primary-700' : 'text-neutral-600'
                    }`}>
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Alasan Izin (conditional) */}
            {(status === 'izin' || status === 'izin kampus') && (
              <div className="animate-fade-in space-y-4">
                {status === 'izin' && (
                  <div>
                    <label htmlFor="alasan_izin" className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Alasan / Keterangan Izin <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="alasan_izin"
                      value={alasanIzin}
                      onChange={(e) => setAlasanIzin(e.target.value)}
                      required
                      rows={3}
                      placeholder="Contoh: Sakit, surat dokter menyusul"
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 text-sm transition-all duration-200 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                )}
                <div>
                  <label htmlFor="bukti_izin" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Unggah Bukti Izin (Foto / PDF) <span className="text-xs text-neutral-400 font-normal">(Opsional)</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      id="bukti_izin"
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setAttachmentFile(e.target.files[0])
                        }
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="bukti_izin"
                      className="cursor-pointer px-4 py-2.5 rounded-xl border border-dashed border-neutral-300 hover:border-primary-500 text-neutral-600 text-xs font-semibold hover:text-primary-700 transition-colors flex items-center gap-2 bg-white"
                    >
                      <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Pilih File
                    </label>
                    <span className="text-xs text-neutral-500 truncate max-w-xs">
                      {attachmentFile ? attachmentFile.name : 'Belum ada berkas terpilih'}
                    </span>
                    {attachmentFile && (
                      <button
                        type="button"
                        onClick={() => {
                          setAttachmentFile(null)
                          const fileInput = document.getElementById('bukti_izin') as HTMLInputElement
                          if (fileInput) fileInput.value = ''
                        }}
                        className="p-1 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
                        title="Hapus berkas terpilih"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Location warning for hadir */}
            {needsLocation && !isLocationReady && location.status !== 'loading' && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs flex items-start gap-2 animate-fade-in">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>
                  Anda harus berada di area <strong>{officeSettings.nama}</strong> untuk melakukan absensi hadir. Pastikan GPS aktif dan izin lokasi diberikan.
                </span>
              </div>
            )}

            <button
              onClick={handleCheckIn}
              disabled={
                loading ||
                uploading ||
                (status === 'izin' && !alasanIzin.trim()) ||
                (needsLocation && !isLocationReady) ||
                todayHoliday.isHoliday
              }
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-primary text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Memverifikasi lokasi...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Check-In Sekarang
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {showCheckOut && (
        <div className="glass-card p-6 animate-slide-up">
          <h3 className="text-base font-semibold text-neutral-800 mb-3">Check-Out</h3>
          <p className="text-sm text-neutral-500 mb-4">Klik tombol di bawah untuk mencatat jam pulang Anda.</p>

          {/* Checkout tolerance limit warning */}
          {isCheckoutPastTolerance ? (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-fade-in mb-4">
              <svg className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>
                Batas waktu toleransi check-out untuk hari ini telah berakhir (Senin–Kamis maksimal 18:00 WITA, Jumat maksimal 13:00 WITA). Anda sudah tidak dapat melakukan check-out.
              </span>
            </div>
          ) : (
            /* Location warning for checkout */
            !isLocationReady && location.status !== 'loading' && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs flex items-start gap-2 animate-fade-in mb-4">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>
                  Anda harus berada di area <strong>{officeSettings.nama}</strong> untuk check-out. Klik tombol &quot;Perbarui Lokasi&quot; di atas.
                </span>
              </div>
            )
          )}

          <button
            onClick={handleCheckOut}
            disabled={loading || !isLocationReady || todayHoliday.isHoliday || isCheckoutPastTolerance}
            className="w-full py-3.5 px-4 rounded-xl bg-neutral-800 text-white font-semibold text-sm shadow-md hover:shadow-lg hover:bg-neutral-900 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Memverifikasi lokasi...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
                </svg>
                Check-Out Sekarang
              </>
            )}
          </button>
        </div>
      )}

      {/* All done */}
      {((hasCheckedIn && hasCheckedOut) || (hasCheckedIn && isIzinToday)) && (
        <div className="glass-card p-6 text-center animate-slide-up">
          {isIzinToday ? (
            <>
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4 animate-scale-in">
                <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-amber-800 mb-1">Izin Tercatat! 📋</h3>
              <p className="text-sm text-neutral-500">
                Keterangan izin Anda hari ini ({todayRecord?.keterangan === 'izin kampus' ? 'Izin Kampus/Sekolah' : 'Izin'}) telah tersimpan. Anda tidak perlu melakukan check-out.
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 animate-scale-in">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-green-800 mb-1">Absensi Lengkap! 🎉</h3>
              <p className="text-sm text-neutral-500">Anda sudah check-in dan check-out hari ini. Terima kasih!</p>
            </>
          )}
        </div>
      )}

      {mounted && isMessageModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md transition-all duration-300"
            onClick={() => setIsMessageModalOpen(false)}
          />
          
          {/* Modal Container */}
          <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-neutral-100 flex flex-col max-h-[80vh] md:max-h-[85vh] animate-scale-in overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-extrabold text-neutral-900 text-base md:text-lg">Riwayat Pengumuman</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">Semua pesan siaran dari Administrator</p>
                </div>
              </div>
              <button 
                onClick={() => setIsMessageModalOpen(false)}
                className="p-2 rounded-xl hover:bg-neutral-50 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent">
              {announcements.length === 0 ? (
                <div className="text-center py-16 text-neutral-400">
                  <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center mx-auto mb-4 text-neutral-300">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v2m16 4h-3.88l-1.12-2H9l-1.12 2H4" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-neutral-700">Belum Ada Pengumuman</p>
                  <p className="text-xs text-neutral-400 mt-1 max-w-[240px] mx-auto">Pesan siaran resmi dari admin akan ditampilkan di bagian ini.</p>
                </div>
              ) : (
                announcements.map((ann) => {
                  const isNew = lastReadAnnId ? ann.id > Number(lastReadAnnId) : false
                  const isUnder24h = (Date.now() - new Date(ann.created_at).getTime()) < 24 * 60 * 60 * 1000
                  return (
                    <div 
                      key={ann.id} 
                      className={`rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md ${
                        isUnder24h
                          ? 'border-l-4 border-l-amber-500' 
                          : 'border-l-4 border-l-primary-500'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4 mb-2.5">
                        <h4 className="font-bold text-sm md:text-base text-neutral-900 leading-tight">
                          {ann.judul}
                        </h4>
                        <div className="flex gap-1.5 flex-shrink-0">
                          {isNew && (
                            <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[9px] font-bold uppercase tracking-wider border border-red-100">
                              Baru
                            </span>
                          )}
                          {isUnder24h && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[9px] font-bold uppercase tracking-wider border border-amber-100">
                              Aktif
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs md:text-sm text-neutral-600 whitespace-pre-wrap leading-relaxed font-normal">
                        {ann.konten}
                      </p>
                      
                      <div className="mt-4 pt-3 border-t border-neutral-50 flex flex-wrap items-center justify-between gap-2 text-[10px] md:text-xs text-neutral-400 font-medium font-mono">
                        <div className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>Administrator</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>
                            {new Date(ann.created_at).toLocaleDateString('id-ID', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric', 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-neutral-100 bg-white flex justify-end">
              <button
                onClick={() => setIsMessageModalOpen(false)}
                className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs md:text-sm transition-all active:scale-95 shadow-sm text-center"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {activeToast && mounted && createPortal(
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 animate-slide-down">
          <div className="glass-card p-4 border-l-4 border-l-amber-500 bg-white/95 backdrop-blur-md shadow-xl flex gap-3 relative overflow-hidden">
            {/* Soft progress bar at the bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-100">
              <div 
                className="h-full bg-amber-500 animate-shrink-width" 
                style={{ animationDuration: '6s', animationTimingFunction: 'linear', animationFillMode: 'forwards' }} 
              />
            </div>
            
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 animate-bounce text-xl">
              📢
            </div>
            
            <div className="min-w-0 flex-1 pr-4">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block mb-0.5">Pengumuman Baru</span>
              <h4 className="font-bold text-xs md:text-sm text-neutral-900 truncate leading-snug">{activeToast.judul}</h4>
              <p className="text-xs text-neutral-500 truncate mt-0.5">{activeToast.konten}</p>
              
              <button 
                onClick={() => {
                  setActiveToast(null)
                  handleOpenMessages()
                }} 
                className="mt-2 text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors flex items-center gap-1"
              >
                <span>Lihat Selengkapnya</span>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <button 
              onClick={() => setActiveToast(null)}
              className="absolute top-3 right-3 p-1 rounded-lg hover:bg-neutral-50 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
