'use server'

import { createClient } from '@/lib/supabase/server'
import { calculateDistance, OFFICE_LOCATION } from '@/lib/geolocation'

export async function checkIn(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Tidak terautentikasi' }
  }

  const today = new Date().toISOString().split('T')[0]
  
  // 1. Cek Akhir Pekan (Sabtu & Minggu)
  const dateObj = new Date(today)
  const dayOfWeek = dateObj.getDay()
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return { error: 'Absensi tidak dapat dilakukan pada hari Sabtu atau Minggu!' }
  }

  // 2. Cek Tanggal Merah / Hari Libur di Database
  const { data: holiday } = await supabase
    .from('hari_libur')
    .select('keterangan')
    .eq('tanggal', today)
    .maybeSingle()

  if (holiday) {
    return { error: `Absensi tidak dapat dilakukan karena hari ini hari libur: ${holiday.keterangan}!` }
  }

  const keterangan = formData.get('keterangan') as string
  const alasan_izin = formData.get('alasan_izin') as string | null
  const latitude = parseFloat(formData.get('latitude') as string)
  const longitude = parseFloat(formData.get('longitude') as string)
  const bukti_izin_url = formData.get('bukti_izin_url') as string | null

  if (!keterangan) {
    return { error: 'Pilih status kehadiran!' }
  }

  if (keterangan === 'izin' && !alasan_izin?.trim()) {
    return { error: 'Alasan izin wajib diisi!' }
  }

  // Validasi geolokasi — hanya untuk status 'hadir'
  // Izin dan izin kampus tidak perlu validasi lokasi
  if (keterangan === 'hadir') {
    if (isNaN(latitude) || isNaN(longitude)) {
      return { error: 'Gagal mendapatkan lokasi Anda. Pastikan GPS aktif dan izin lokasi diberikan.' }
    }

    // Fetch dynamic office settings
    let office = null
    try {
      const { data } = await supabase
        .from('pengaturan_kantor')
        .select('nama, latitude, longitude, radius_meter')
        .eq('id', 1)
        .single()
      office = data
    } catch (e) {}

    const officeLat = office?.latitude ?? OFFICE_LOCATION.latitude
    const officeLng = office?.longitude ?? OFFICE_LOCATION.longitude
    const officeRadius = office?.radius_meter ?? OFFICE_LOCATION.radiusMeters
    const officeName = office?.nama ?? OFFICE_LOCATION.name

    const distance = Math.round(calculateDistance(latitude, longitude, officeLat, officeLng))
    const withinRadius = distance <= officeRadius

    if (!withinRadius) {
      return {
        error: `Anda berada ${distance} meter dari ${officeName}. Absensi hanya dapat dilakukan dalam radius ${officeRadius} meter dari kantor.`
      }
    }
  }

  // Check if already checked in today
  const { data: existing } = await supabase
    .from('absensi')
    .select('id')
    .eq('user_id', user.id)
    .eq('tanggal', today)
    .maybeSingle()

  if (existing) {
    return { error: 'Anda sudah melakukan check-in hari ini!' }
  }

  // Get current server time (WITA UTC+8)
  const now = new Date()
  const witaTime = new Date(now.getTime() + (8 * 60 * 60 * 1000))
  const jamMasuk = witaTime.toISOString().split('T')[1].substring(0, 8)

  const { error } = await supabase
    .from('absensi')
    .insert({
      user_id: user.id,
      tanggal: today,
      jam_masuk: jamMasuk,
      keterangan,
      alasan_izin: alasan_izin?.trim() || null,
      latitude_masuk: keterangan === 'hadir' ? latitude : null,
      longitude_masuk: keterangan === 'hadir' ? longitude : null,
      bukti_izin_url: (keterangan === 'izin' || keterangan === 'izin kampus') ? (bukti_izin_url || null) : null,
    })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function checkOut(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Tidak terautentikasi' }
  }

  const today = new Date().toISOString().split('T')[0]
  
  // 1. Cek Akhir Pekan (Sabtu & Minggu)
  const dateObj = new Date(today)
  const dayOfWeek = dateObj.getDay()
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return { error: 'Absensi tidak dapat dilakukan pada hari Sabtu atau Minggu!' }
  }

  // 2. Cek Tanggal Merah / Hari Libur di Database
  const { data: holiday } = await supabase
    .from('hari_libur')
    .select('keterangan')
    .eq('tanggal', today)
    .maybeSingle()

  if (holiday) {
    return { error: `Absensi tidak dapat dilakukan karena hari ini hari libur: ${holiday.keterangan}!` }
  }

  // 3. Batas toleransi jam checkout (Senin-Kamis maks 18:00 WITA, Jumat maks 13:00 WITA)
  const now = new Date()
  const witaTime = new Date(now.getTime() + (8 * 60 * 60 * 1000))
  const dayOfWeekWita = witaTime.getUTCDay()
  const witaHour = witaTime.getUTCHours()
  const witaMinute = witaTime.getUTCMinutes()
  const witaTimeInMinutes = witaHour * 60 + witaMinute

  if (dayOfWeekWita >= 1 && dayOfWeekWita <= 4) {
    if (witaTimeInMinutes >= 1080) { // 18:00 WITA
      return { error: 'Batas toleransi jam check-out Senin–Kamis (maksimal 18:00 WITA) telah berakhir!' }
    }
  } else if (dayOfWeekWita === 5) {
    if (witaTimeInMinutes >= 780) { // 13:00 WITA
      return { error: 'Batas toleransi jam check-out Jumat (maksimal 13:00 WITA) telah berakhir!' }
    }
  }

  const latitude = parseFloat(formData.get('latitude') as string)
  const longitude = parseFloat(formData.get('longitude') as string)

  // Validasi geolokasi
  if (isNaN(latitude) || isNaN(longitude)) {
    return { error: 'Gagal mendapatkan lokasi Anda. Pastikan GPS aktif dan izin lokasi diberikan.' }
  }

  // Fetch dynamic office settings
  let office = null
  try {
    const { data } = await supabase
      .from('pengaturan_kantor')
      .select('nama, latitude, longitude, radius_meter')
      .eq('id', 1)
      .single()
    office = data
  } catch (e) {}

  const officeLat = office?.latitude ?? OFFICE_LOCATION.latitude
  const officeLng = office?.longitude ?? OFFICE_LOCATION.longitude
  const officeRadius = office?.radius_meter ?? OFFICE_LOCATION.radiusMeters
  const officeName = office?.nama ?? OFFICE_LOCATION.name

  const distance = Math.round(calculateDistance(latitude, longitude, officeLat, officeLng))
  const withinRadius = distance <= officeRadius

  if (!withinRadius) {
    return {
      error: `Anda berada ${distance} meter dari ${officeName}. Check-out hanya dapat dilakukan dalam radius ${officeRadius} meter dari kantor.`
    }
  }

  // Find today's attendance record
  const { data: todayRecord } = await supabase
    .from('absensi')
    .select('id, jam_pulang, keterangan')
    .eq('user_id', user.id)
    .eq('tanggal', today)
    .maybeSingle()

  if (!todayRecord) {
    return { error: 'Anda belum melakukan check-in hari ini!' }
  }

  if (todayRecord.jam_pulang) {
    return { error: 'Anda sudah melakukan check-out hari ini!' }
  }

  const jamPulang = witaTime.toISOString().split('T')[1].substring(0, 8)

  const { error } = await supabase
    .from('absensi')
    .update({
      jam_pulang: jamPulang,
      latitude_pulang: latitude,
      longitude_pulang: longitude,
    })
    .eq('id', todayRecord.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function adminUpdateAttendance(recordId: number, data: {
  tanggal: string
  jam_masuk: string | null
  jam_pulang: string | null
  keterangan: string
  alasan_izin: string | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Tidak terautentikasi' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Akses ditolak!' }
  }

  const { error } = await supabase
    .from('absensi')
    .update({
      tanggal: data.tanggal,
      jam_masuk: data.jam_masuk || null,
      jam_pulang: data.jam_pulang || null,
      keterangan: data.keterangan,
      alasan_izin: data.alasan_izin || null,
    })
    .eq('id', recordId)

  if (error) return { error: error.message }
  return { success: true }
}

export async function adminDeleteAttendance(recordId: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Tidak terautentikasi' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Akses ditolak!' }
  }

  const { error } = await supabase
    .from('absensi')
    .delete()
    .eq('id', recordId)

  if (error) return { error: error.message }
  return { success: true }
}

export async function adminAddAttendance(userId: string, data: {
  tanggal: string
  jam_masuk: string | null
  jam_pulang: string | null
  keterangan: string
  alasan_izin: string | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Tidak terautentikasi' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Akses ditolak!' }
  }

  const { error } = await supabase
    .from('absensi')
    .insert({
      user_id: userId,
      tanggal: data.tanggal,
      jam_masuk: data.jam_masuk || null,
      jam_pulang: data.jam_pulang || null,
      keterangan: data.keterangan,
      alasan_izin: data.alasan_izin || null,
    })

  if (error) return { error: error.message }
  return { success: true }
}
