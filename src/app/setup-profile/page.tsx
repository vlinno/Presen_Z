'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateProfile } from '@/app/actions/profile'

interface Bidang {
  id: number
  nama_bidang: string
}

export default function SetupProfilePage() {
  const [bidangList, setBidangList] = useState<Bidang[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchBidang() {
      const supabase = createClient()
      const { data } = await supabase
        .from('bidang_kesbangpol')
        .select('id, nama_bidang')
        .order('id')
      if (data) setBidangList(data)
    }
    fetchBidang()
  }, [])

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await updateProfile(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-subtle bg-pattern flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary-100/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent-100/40 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg animate-fade-in-scale">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">Lengkapi Profil Anda</h1>
          <p className="text-sm text-neutral-500">Satu langkah lagi sebelum mulai absensi</p>
        </div>

        <div className="glass-card p-8">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm animate-fade-in">
              {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nama_lengkap" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Nama Lengkap
              </label>
              <input
                id="nama_lengkap"
                name="nama_lengkap"
                type="text"
                required
                placeholder="Masukkan nama lengkap Anda"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 text-sm transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="nama_kampus" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Nama Kampus / Sekolah
              </label>
              <input
                id="nama_kampus"
                name="nama_kampus"
                type="text"
                required
                placeholder="Contoh: Universitas Lambung Mangkurat"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 text-sm transition-all duration-200"
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
                placeholder="Masukkan NIM atau NISN Anda"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 text-sm transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="bidang_id" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Bidang Penempatan
              </label>
              <select
                id="bidang_id"
                name="bidang_id"
                required
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 text-sm transition-all duration-200 appearance-none cursor-pointer"
              >
                <option value="">— Pilih Bidang —</option>
                {bidangList.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nama_bidang}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="min-w-0">
                <label htmlFor="tanggal_mulai" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Mulai Magang
                </label>
                <input
                  id="tanggal_mulai"
                  name="tanggal_mulai"
                  type="date"
                  required
                  className="w-full min-w-0 max-w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="min-w-0">
                <label htmlFor="tanggal_selesai" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Selesai Magang
                </label>
                <input
                  id="tanggal_selesai"
                  name="tanggal_selesai"
                  type="date"
                  required
                  className="w-full min-w-0 max-w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-primary text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
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
                'Simpan & Lanjutkan'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
