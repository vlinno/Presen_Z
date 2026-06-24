'use server'

import { createClient } from '@/lib/supabase/server'

export async function createAnnouncement(judul: string, konten: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Tidak terautentikasi' }

  // Check if admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Akses ditolak!' }
  }

  if (!judul.trim() || !konten.trim()) {
    return { error: 'Judul dan Konten wajib diisi!' }
  }

  const { error } = await supabase
    .from('pengumuman')
    .insert({
      judul: judul.trim(),
      konten: konten.trim(),
      created_by: user.id
    })

  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteAnnouncement(id: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Tidak terautentikasi' }

  // Check if admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Akses ditolak!' }
  }

  const { error } = await supabase
    .from('pengumuman')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  return { success: true }
}
