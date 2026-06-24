import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfilForm from '@/components/ProfilForm'

export const dynamic = 'force-dynamic'

export default async function ProfilPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch current user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, nama_lengkap, nama_kampus, nim_nisn, bidang_id, nip, pangkat, instansi, tanggal_mulai, tanggal_selesai')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/dashboard')
  }

  // Fetch bidang list
  const { data: bidangList } = await supabase
    .from('bidang_kesbangpol')
    .select('id, nama_bidang')
    .order('id')

  return (
    <ProfilForm 
      initialProfile={profile} 
      bidangList={bidangList || []} 
    />
  )
}
