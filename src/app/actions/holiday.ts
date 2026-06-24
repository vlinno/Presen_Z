'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Holiday {
  id: number
  tanggal: string
  keterangan: string
  tipe: 'nasional' | 'lokal' | 'khusus'
}

/**
 * Helper internal untuk mengambil dan menyimpan hari libur nasional menggunakan RPC (agar bypass RLS).
 */
async function fetchAndSaveHolidays(year: number, supabase: any): Promise<number> {
  const response = await fetch(`https://api-hari-libur.vercel.app/api?year=${year}`, {
    next: { revalidate: 0 },
  })

  if (!response.ok) {
    throw new Error('Gagal mengambil data dari API Hari Libur Nasional.')
  }

  const resData = await response.json()
  
  // Ekstrak array hari libur dari berbagai kemungkinan format respon API
  let holidaysArray: any[] = []
  if (Array.isArray(resData)) {
    holidaysArray = resData
  } else if (resData && Array.isArray(resData.data)) {
    holidaysArray = resData.data
  }

  if (holidaysArray.length === 0) {
    throw new Error('Tidak ada data hari libur ditemukan untuk tahun tersebut.')
  }

  // Petakan ke format database (mendukung field 'date'/'holiday_date' dan 'description'/'holiday_name')
  const upsertData = holidaysArray.map((h: any) => {
    const tanggal = h.date || h.holiday_date
    const keterangan = h.description || h.holiday_name
    return {
      tanggal,
      keterangan,
      tipe: 'nasional',
    }
  }).filter((item: any) => item.tanggal && item.keterangan)

  if (upsertData.length === 0) {
    throw new Error('Format data hari libur dari API tidak dikenali.')
  }

  const { error } = await supabase.rpc('sync_national_holidays', {
    holiday_data: upsertData,
  })

  if (error) {
    throw new Error('Gagal menyimpan ke database via RPC: ' + error.message)
  }

  return upsertData.length
}

/**
 * Mengambil semua daftar hari libur dari database.
 * Jika tahun ini belum disinkronkan, akan disinkronkan secara otomatis (lazy-load).
 */
export async function getHolidays(): Promise<Holiday[]> {
  try {
    const supabase = await createClient()
    const currentYear = new Date().getFullYear()
    const startOfYear = `${currentYear}-01-01`
    const endOfYear = `${currentYear}-12-31`

    // Cek apakah tahun ini sudah terisi di database
    const { count, error: countError } = await supabase
      .from('hari_libur')
      .select('*', { count: 'exact', head: true })
      .eq('tipe', 'nasional')
      .gte('tanggal', startOfYear)
      .lte('tanggal', endOfYear)

    if (!countError && (count === 0 || count === null)) {
      console.log(`Lazy-syncing national holidays for year ${currentYear}...`)
      try {
        await fetchAndSaveHolidays(currentYear, supabase)
      } catch (syncErr) {
        console.error('Failed to lazy sync holidays in getHolidays:', syncErr)
      }
    }

    const { data, error } = await supabase
      .from('hari_libur')
      .select('id, tanggal, keterangan, tipe')
      .order('tanggal', { ascending: true })

    if (error) {
      console.error('Error fetching holidays:', error)
      return []
    }

    return data || []
  } catch (err) {
    console.error('Error in getHolidays action:', err)
    return []
  }
}

/**
 * Menyinkronkan hari libur nasional secara manual dari dashboard admin.
 */
export async function syncNationalHolidays(year: number) {
  try {
    const supabase = await createClient()

    // 1. Verifikasi autentikasi & peran admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Tidak terautentikasi' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return { error: 'Akses ditolak. Anda bukan administrator.' }
    }

    const count = await fetchAndSaveHolidays(year, supabase)

    revalidatePath('/dashboard/admin/pengaturan')
    revalidatePath('/dashboard/absensi')
    return { success: true, count }
  } catch (err: any) {
    console.error('Error in syncNationalHolidays:', err)
    return { error: err.message || 'Terjadi kesalahan sistem.' }
  }
}

/**
 * Memeriksa apakah hari ini adalah hari libur (akhir pekan atau hari libur nasional/lokal).
 * Jika tahun ini belum disinkronkan, akan disinkronkan secara otomatis (lazy-load).
 */
export async function checkTodayHolidayAction(todayStr: string): Promise<{ isHoliday: boolean; keterangan: string | null }> {
  try {
    const supabase = await createClient()

    // 1. Cek Akhir Pekan (Sabtu & Minggu)
    const dateObj = new Date(todayStr)
    const dayOfWeek = dateObj.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return { isHoliday: true, keterangan: 'Akhir Pekan (Sabtu/Minggu)' }
    }

    // 2. Cek/Sync database cache untuk tahun dari tanggal hari ini
    const year = dateObj.getFullYear()
    const startOfYear = `${year}-01-01`
    const endOfYear = `${year}-12-31`

    const { count, error: countError } = await supabase
      .from('hari_libur')
      .select('*', { count: 'exact', head: true })
      .eq('tipe', 'nasional')
      .gte('tanggal', startOfYear)
      .lte('tanggal', endOfYear)

    if (!countError && (count === 0 || count === null)) {
      console.log(`Lazy-syncing national holidays for year ${year} in checkTodayHolidayAction...`)
      try {
        await fetchAndSaveHolidays(year, supabase)
      } catch (syncErr) {
        console.error('Failed to lazy sync holidays in checkTodayHolidayAction:', syncErr)
      }
    }

    // 3. Query apakah hari ini hari libur di database
    const { data, error } = await supabase
      .from('hari_libur')
      .select('keterangan')
      .eq('tanggal', todayStr)
      .maybeSingle()

    if (error) {
      console.error('Error querying holiday for today:', error)
      return { isHoliday: false, keterangan: null }
    }

    if (data) {
      return { isHoliday: true, keterangan: data.keterangan }
    }

    return { isHoliday: false, keterangan: null }
  } catch (err) {
    console.error('Error in checkTodayHolidayAction:', err)
    return { isHoliday: false, keterangan: null }
  }
}

/**
 * Menambahkan hari libur kustom (lokal/khusus) oleh admin.
 */
export async function addCustomHoliday(formData: FormData) {
  try {
    const supabase = await createClient()

    // 1. Verifikasi autentikasi & peran admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Tidak terautentikasi' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return { error: 'Akses ditolak. Anda bukan administrator.' }
    }

    const tanggal = formData.get('tanggal') as string
    const keterangan = formData.get('keterangan') as string
    const tipe = (formData.get('tipe') as 'lokal' | 'khusus') || 'lokal'

    if (!tanggal || !keterangan) {
      return { error: 'Tanggal dan Keterangan libur wajib diisi!' }
    }

    // 2. Insert ke database
    const { error } = await supabase
      .from('hari_libur')
      .insert({
        tanggal,
        keterangan,
        tipe,
      })

    if (error) {
      if (error.code === '23505') {
        return { error: 'Tanggal tersebut sudah terdaftar sebagai hari libur!' }
      }
      return { error: 'Gagal menambahkan hari libur: ' + error.message }
    }

    revalidatePath('/dashboard/admin/pengaturan')
    revalidatePath('/dashboard/absensi')
    return { success: true }
  } catch (err: any) {
    console.error('Error in addCustomHoliday:', err)
    return { error: err.message || 'Terjadi kesalahan sistem.' }
  }
}

/**
 * Menghapus hari libur oleh admin.
 */
export async function deleteHoliday(id: number) {
  try {
    const supabase = await createClient()

    // 1. Verifikasi autentikasi & peran admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Tidak terautentikasi' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return { error: 'Akses ditolak. Anda bukan administrator.' }
    }

    // 2. Hapus dari database
    const { error } = await supabase
      .from('hari_libur')
      .delete()
      .eq('id', id)

    if (error) {
      return { error: 'Gagal menghapus hari libur: ' + error.message }
    }

    revalidatePath('/dashboard/admin/pengaturan')
    revalidatePath('/dashboard/absensi')
    return { success: true }
  } catch (err: any) {
    console.error('Error in deleteHoliday:', err)
    return { error: err.message || 'Terjadi kesalahan sistem.' }
  }
}
