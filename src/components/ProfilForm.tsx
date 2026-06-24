'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { editProfile } from '@/app/actions/profile'

interface Bidang {
  id: number
  nama_bidang: string
}

interface ProfileData {
  role: string
  nama_lengkap: string
  nama_kampus: string
  nim_nisn: string
  bidang_id: number
  nip?: string
  pangkat?: string
  instansi?: string
  tanggal_mulai?: string
  tanggal_selesai?: string
}

interface ProfilFormProps {
  initialProfile: any
  bidangList: Bidang[]
}

export default function ProfilForm({ initialProfile, bidangList }: ProfilFormProps) {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData>({
    role: initialProfile.role || 'magang',
    nama_lengkap: initialProfile.nama_lengkap || '',
    nama_kampus: initialProfile.nama_kampus || '',
    nim_nisn: initialProfile.nim_nisn || '',
    bidang_id: initialProfile.bidang_id || 0,
    nip: initialProfile.nip || '',
    pangkat: initialProfile.pangkat || '',
    instansi: initialProfile.instansi || 'Badan Kesatuan Bangsa dan Politik Kota Banjarmasin',
    tanggal_mulai: initialProfile.tanggal_mulai || '',
    tanggal_selesai: initialProfile.tanggal_selesai || '',
  })
  
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setProfile(prev => ({
      ...prev,
      [name]: name === 'bidang_id' ? parseInt(value) || 0 : value
    }))
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    setSuccess(false)
    
    const result = await editProfile(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
      router.refresh()
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">Profil Saya</h1>
        <p className="text-sm text-neutral-500">
          {profile.role === 'admin' 
            ? 'Perbarui data pamong/penanggung jawab untuk laporan absensi.' 
            : 'Perbarui informasi data diri Anda untuk laporan absensi yang valid.'}
        </p>
      </div>

      <div className="glass-card p-6 md:p-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm animate-fade-in flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm animate-fade-in flex items-start gap-3">
            <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Profil berhasil diperbarui!</span>
          </div>
        )}

        <form action={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="nama_lengkap" className="block text-sm font-medium text-neutral-700 mb-1.5">
              Nama Lengkap
            </label>
            <input
              id="nama_lengkap"
              name="nama_lengkap"
              type="text"
              required
              value={profile.nama_lengkap}
              onChange={handleChange}
              placeholder="Masukkan nama lengkap Anda"
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {profile.role === 'admin' ? (
            <>
              <div>
                <label htmlFor="nip" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  NIP Pamong
                </label>
                <input
                  id="nip"
                  name="nip"
                  type="text"
                  required
                  value={profile.nip}
                  onChange={handleChange}
                  placeholder="Contoh: 19810401 200903 2 009"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="pangkat" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Pangkat / Golongan Pamong
                </label>
                <input
                  id="pangkat"
                  name="pangkat"
                  type="text"
                  required
                  value={profile.pangkat}
                  onChange={handleChange}
                  placeholder="Contoh: Pembina IV A"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="instansi" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Instansi / Badan
                </label>
                <input
                  id="instansi"
                  name="instansi"
                  type="text"
                  required
                  value={profile.instansi}
                  onChange={handleChange}
                  placeholder="Contoh: Badan Kesatuan Bangsa dan Politik Kota Banjarmasin"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="nama_kampus" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Nama Kampus / Sekolah
                </label>
                <input
                  id="nama_kampus"
                  name="nama_kampus"
                  type="text"
                  required
                  value={profile.nama_kampus}
                  onChange={handleChange}
                  placeholder="Contoh: Universitas Lambung Mangkurat"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="nim_nisn" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  NIM / NISN
                </label>
                <input
                  id="nim_nisn"
                  name="nim_nisn"
                  type="text"
                  required
                  value={profile.nim_nisn}
                  onChange={handleChange}
                  placeholder="Masukkan NIM atau NISN Anda"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="bidang_id" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Bidang Penempatan
                </label>
                <div className="relative">
                  <select
                    id="bidang_id"
                    name="bidang_id"
                    required
                    value={profile.bidang_id || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer"
                  >
                    <option value="">— Pilih Bidang —</option>
                    {bidangList.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.nama_bidang}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="tanggal_mulai" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Tanggal Mulai Magang
                  </label>
                  <input
                    id="tanggal_mulai"
                    name="tanggal_mulai"
                    type="date"
                    required
                    value={profile.tanggal_mulai}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="tanggal_selesai" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Tanggal Selesai Magang
                  </label>
                  <input
                    id="tanggal_selesai"
                    name="tanggal_selesai"
                    type="date"
                    required
                    value={profile.tanggal_selesai}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-primary text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Menyimpan...
                </>
              ) : (
                'Simpan Perubahan'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
