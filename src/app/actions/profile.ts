'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Tidak terautentikasi' }
  }

  const nama_lengkap = formData.get('nama_lengkap') as string
  const nama_kampus = formData.get('nama_kampus') as string
  const nim_nisn = formData.get('nim_nisn') as string
  const bidang_id = parseInt(formData.get('bidang_id') as string)
  const tanggal_mulai = formData.get('tanggal_mulai') as string
  const tanggal_selesai = formData.get('tanggal_selesai') as string

  if (!nama_lengkap || !nama_kampus || !nim_nisn || !bidang_id || !tanggal_mulai || !tanggal_selesai) {
    return { error: 'Semua field wajib diisi!' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      nama_lengkap,
      nama_kampus,
      nim_nisn,
      bidang_id,
      tanggal_mulai,
      tanggal_selesai,
    })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard', 'layout')
  redirect('/dashboard')
}

export async function editProfile(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Tidak terautentikasi' }
  }

  // Fetch current user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return { error: 'Profil tidak ditemukan' }
  }

  const nama_lengkap = formData.get('nama_lengkap') as string
  if (!nama_lengkap?.trim()) {
    return { error: 'Nama Lengkap wajib diisi!' }
  }

  if (profile.role === 'admin') {
    const nip = formData.get('nip') as string
    const pangkat = formData.get('pangkat') as string
    const instansi = formData.get('instansi') as string

    if (!nip || !pangkat || !instansi) {
      return { error: 'Nama Lengkap, NIP, Pangkat, dan Instansi wajib diisi!' }
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        nama_lengkap,
        nip,
        pangkat,
        instansi,
      })
      .eq('id', user.id)

    if (error) return { error: error.message }
  } else {
    const nama_kampus = formData.get('nama_kampus') as string
    const nim_nisn = formData.get('nim_nisn') as string
    const bidang_id = parseInt(formData.get('bidang_id') as string)
    const tanggal_mulai = formData.get('tanggal_mulai') as string
    const tanggal_selesai = formData.get('tanggal_selesai') as string

    if (!nama_kampus || !nim_nisn || !bidang_id || !tanggal_mulai || !tanggal_selesai) {
      return { error: 'Semua field wajib diisi!' }
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        nama_lengkap,
        nama_kampus,
        nim_nisn,
        bidang_id,
        tanggal_mulai,
        tanggal_selesai,
      })
      .eq('id', user.id)

    if (error) return { error: error.message }
  }

  revalidatePath('/dashboard', 'layout')
  return { success: true }
}

export async function deleteStudent(studentId: string) {
  const supabase = await createClient()

  // 1. Verifikasi apakah user saat ini terautentikasi
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

  // 3. Panggil fungsi database untuk menghapus user
  const { error } = await supabase.rpc('delete_user_by_admin', {
    target_user_uuid: studentId
  })

  if (error) {
    return { error: error.message }
  }

  // 4. Revalidasi path
  revalidatePath('/dashboard/admin/mahasiswa')
  return { success: true }
}

export async function deleteStudentsBulk(studentIds: string[]) {
  const supabase = await createClient()

  // 1. Verifikasi apakah user saat ini terautentikasi
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

  // 3. Panggil fungsi database untuk menghapus multiple users
  const { error } = await supabase.rpc('delete_users_by_admin', {
    target_user_uuids: studentIds
  })

  if (error) {
    return { error: error.message }
  }

  // 4. Revalidasi path
  revalidatePath('/dashboard/admin/mahasiswa')
  return { success: true }
}



