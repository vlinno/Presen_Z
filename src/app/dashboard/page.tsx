import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch profile
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('role, nama_lengkap')
    .eq('id', user.id)
    .single()

  let finalProfile = profile

  // If profile doesn't exist, create it
  if (!finalProfile) {
    console.log(`Profile not found for user ${user.id}, attempting to insert. Fetch error:`, fetchError)
    
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({ id: user.id, role: 'magang' })
      .select('role, nama_lengkap')
      .single()
    
    if (insertError) {
      console.error('Failed to create user profile in dashboard page:', insertError)
      return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-red-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-neutral-800 mb-2">Gagal Memuat Profil</h1>
            <p className="text-sm text-neutral-600 mb-6">
              Aplikasi mendeteksi akun Anda aktif, tetapi gagal membaca atau membuat data profil di database.
            </p>
            <div className="bg-neutral-50 rounded-xl p-4 text-left font-mono text-xs text-red-600 border border-neutral-100 mb-6 overflow-auto max-h-40">
              Code: {insertError.code || 'UNKNOWN'}<br />
              Message: {insertError.message}
            </div>
            <p className="text-xs text-neutral-400">
              Saran: Pastikan skema migrasi database Supabase dan RLS (Row Level Security) telah dijalankan dengan benar di SQL Editor Supabase Anda.
            </p>
          </div>
        </div>
      )
    }
    finalProfile = newProfile
  }

  // Force profile setup if name is not set
  if (!finalProfile?.nama_lengkap) {
    if (finalProfile?.role === 'admin') {
      redirect('/dashboard/admin')
    } else {
      redirect('/setup-profile')
    }
  }

  // Route based on role
  if (finalProfile?.role === 'admin') {
    redirect('/dashboard/admin')
  }

  redirect('/dashboard/absensi')
}
