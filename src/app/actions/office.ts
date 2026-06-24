'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface OfficeSettings {
  nama: string
  latitude: number
  longitude: number
  radius_meter: number
  jam_masuk: string
  jam_pulang: string
}

const FALLBACK_SETTINGS: OfficeSettings = {
  nama: 'Kantor Kesbangpol Kota Banjarmasin',
  latitude: -3.327335,
  longitude: 114.588700,
  radius_meter: 50,
  jam_masuk: '08:00',
  jam_pulang: '16:00',
}

/**
 * Mengambil pengaturan parameter kantor dari database.
 */
export async function getOfficeSettings(): Promise<OfficeSettings> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('pengaturan_kantor')
      .select('nama, latitude, longitude, radius_meter, jam_masuk, jam_pulang')
      .eq('id', 1)
      .single()

    if (error || !data) {
      console.warn('Gagal memuat pengaturan kantor dari database, menggunakan fallback:', error)
      return FALLBACK_SETTINGS
    }

    // Format TIME 'hh:mm:ss' to 'hh:mm'
    return {
      nama: data.nama,
      latitude: data.latitude,
      longitude: data.longitude,
      radius_meter: data.radius_meter,
      jam_masuk: data.jam_masuk ? data.jam_masuk.substring(0, 5) : '08:00',
      jam_pulang: data.jam_pulang ? data.jam_pulang.substring(0, 5) : '16:00',
    }
  } catch (err) {
    console.error('Error fetching office settings:', err)
    return FALLBACK_SETTINGS
  }
}

/**
 * Memperbarui pengaturan parameter kantor oleh admin.
 */
export async function updateOfficeSettings(formData: FormData) {
  try {
    const supabase = await createClient()

    // 1. Verifikasi autentikasi
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Tidak terautentikasi' }
    }

    // 2. Verifikasi peran admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return { error: 'Akses ditolak. Anda bukan administrator.' }
    }

    const nama = formData.get('nama') as string
    const latitude = parseFloat(formData.get('latitude') as string)
    const longitude = parseFloat(formData.get('longitude') as string)
    const radius_meter = parseInt(formData.get('radius_meter') as string)
    const jam_masuk = formData.get('jam_masuk') as string
    const jam_pulang = formData.get('jam_pulang') as string

    if (!nama || isNaN(latitude) || isNaN(longitude) || isNaN(radius_meter) || !jam_masuk || !jam_pulang) {
      return { error: 'Semua input pengaturan wajib diisi dengan benar!' }
    }

    // 3. Update database
    const { error } = await supabase
      .from('pengaturan_kantor')
      .update({
        nama,
        latitude,
        longitude,
        radius_meter,
        jam_masuk: jam_masuk.includes(':') && jam_masuk.split(':').length === 2 ? `${jam_masuk}:00` : jam_masuk,
        jam_pulang: jam_pulang.includes(':') && jam_pulang.split(':').length === 2 ? `${jam_pulang}:00` : jam_pulang,
      })
      .eq('id', 1)

    if (error) {
      return { error: 'Gagal memperbarui pengaturan database: ' + error.message }
    }

    revalidatePath('/dashboard/admin/pengaturan')
    revalidatePath('/dashboard/absensi')
    return { success: true }
  } catch (err: any) {
    console.error('Error updating office settings:', err)
    return { error: err.message || 'Terjadi kesalahan sistem.' }
  }
}
