'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { updateOfficeSettings, OfficeSettings } from '@/app/actions/office'
import { Holiday } from '@/app/actions/holiday'
import HolidaySettings from './HolidaySettings'

// Import map component dynamically to disable SSR (Leaflet requires window)
const OfficeLocationPicker = dynamic(() => import('@/components/OfficeLocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[350px] md:h-[400px] rounded-2xl border border-neutral-200 bg-neutral-50 flex items-center justify-center">
      <div className="text-center">
        <svg className="animate-spin w-6 h-6 text-primary-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-xs text-neutral-400">Memuat peta lokasi...</p>
      </div>
    </div>
  ),
})

interface OfficeSettingsFormProps {
  initialSettings: OfficeSettings
  initialHolidays: Holiday[]
}

export default function OfficeSettingsForm({ initialSettings, initialHolidays }: OfficeSettingsFormProps) {
  const [settings, setSettings] = useState<OfficeSettings>(initialSettings)
  const [activeTab, setActiveTab] = useState<'lokasi' | 'libur'>('lokasi')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleLocationChange = (lat: number, lng: number) => {
    setSettings((prev) => ({
      ...prev,
      latitude: parseFloat(lat.toFixed(6)),
      longitude: parseFloat(lng.toFixed(6)),
    }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const formData = new FormData()
    formData.set('nama', settings.nama)
    formData.set('latitude', String(settings.latitude))
    formData.set('longitude', String(settings.longitude))
    formData.set('radius_meter', String(settings.radius_meter))
    formData.set('jam_masuk', settings.jam_masuk)
    formData.set('jam_pulang', settings.jam_pulang)

    const result = await updateOfficeSettings(formData)

    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: 'Pengaturan lokasi & parameter absensi berhasil disimpan!' })
    }
    setLoading(false)
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-1">Pengaturan & Parameter Aplikasi</h1>
        <p className="text-sm text-neutral-500">
          Kelola koordinat GPS kantor, batas radius geofencing, jam kerja absensi, serta kalender hari libur nasional/kustom.
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-neutral-200 mb-6 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('lokasi')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'lokasi'
              ? 'border-primary-500 text-primary-700 font-extrabold'
              : 'border-transparent text-neutral-400 hover:text-neutral-600'
          }`}
        >
          📍 Lokasi & Waktu Kantor
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('libur')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'libur'
              ? 'border-primary-500 text-primary-700 font-extrabold'
              : 'border-transparent text-neutral-400 hover:text-neutral-600'
          }`}
        >
          📅 Kalender Hari Libur
        </button>
      </div>

      {/* Content for Tabs */}
      {activeTab === 'lokasi' ? (
        <div className="space-y-6">
          {/* Alert Banner */}
          {message && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 animate-fade-in text-sm font-medium ${
                message.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {message.type === 'success' ? (
                <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Form & Map Grid */}
          <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Input Fields (Left column) */}
            <div className="lg:col-span-5 space-y-5 bg-white p-6 rounded-2xl border border-neutral-200/60 shadow-sm">
              <h2 className="text-sm font-bold text-neutral-800 uppercase tracking-wider mb-2 border-b border-neutral-100 pb-2">
                ⚙️ Parameter Utama
              </h2>

              {/* Office Name */}
              <div>
                <label htmlFor="nama" className="block text-xs font-semibold text-neutral-500 uppercase mb-1.5">
                  Nama Lokasi Kantor
                </label>
                <input
                  id="nama"
                  type="text"
                  required
                  value={settings.nama}
                  onChange={(e) => setSettings((prev) => ({ ...prev, nama: e.target.value }))}
                  placeholder="Contoh: Kantor Kesbangpol Banjarmasin"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 text-sm transition-all focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Radius meter */}
              <div>
                <label htmlFor="radius_meter" className="block text-xs font-semibold text-neutral-500 uppercase mb-1.5">
                  Radius Batas Absensi (Meter)
                </label>
                <input
                  id="radius_meter"
                  type="number"
                  required
                  min={10}
                  max={1000}
                  value={settings.radius_meter}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, radius_meter: parseInt(e.target.value) || 50 }))
                  }
                  placeholder="Contoh: 50"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 text-sm transition-all focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Coordinates (Two Columns) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="latitude" className="block text-xs font-semibold text-neutral-500 uppercase mb-1.5">
                    Latitude (Lintang)
                  </label>
                  <input
                    id="latitude"
                    type="number"
                    step="any"
                    required
                    value={settings.latitude}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="longitude" className="block text-xs font-semibold text-neutral-500 uppercase mb-1.5">
                    Longitude (Bujur)
                  </label>
                  <input
                    id="longitude"
                    type="number"
                    step="any"
                    required
                    value={settings.longitude}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Work Hours (Two Columns) */}
              <div className="grid grid-cols-2 gap-3 border-t border-neutral-100 pt-4">
                <div>
                  <label htmlFor="jam_masuk" className="block text-xs font-semibold text-neutral-500 uppercase mb-1.5">
                    Batas Jam Masuk (WITA)
                  </label>
                  <input
                    id="jam_masuk"
                    type="time"
                    required
                    value={settings.jam_masuk}
                    onChange={(e) => setSettings((prev) => ({ ...prev, jam_masuk: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="jam_pulang" className="block text-xs font-semibold text-neutral-500 uppercase mb-1.5">
                    Jam Pulang Standar (WITA)
                  </label>
                  <input
                    id="jam_pulang"
                    type="time"
                    required
                    value={settings.jam_pulang}
                    onChange={(e) => setSettings((prev) => ({ ...prev, jam_pulang: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 mt-2 rounded-xl bg-gradient-primary text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
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
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Simpan Pengaturan
                  </>
                )}
              </button>
            </div>

            {/* Map Picker (Right column) */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-neutral-200/60 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <h2 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">
                  🗺️ Penentu Lokasi Peta
                </h2>
                <span className="text-[10px] text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-full font-bold border border-primary-100">
                  Interactive GPS
                </span>
              </div>

              <OfficeLocationPicker
                lat={settings.latitude}
                lng={settings.longitude}
                radius={settings.radius_meter}
                onLocationChange={handleLocationChange}
              />

              <div className="rounded-xl bg-neutral-50 border border-neutral-200/50 p-4 text-[11px] leading-relaxed text-neutral-500 space-y-1.5">
                <p className="font-semibold text-neutral-700">💡 Informasi Geofencing:</p>
                <p>
                  * Mahasiswa hanya diizinkan check-in <strong>Hadir</strong> bila berada dalam lingkaran hijau.
                </p>
                <p>
                  * Meningkatkan radius membantu mahasiswa dengan perangkat GPS berakurasi rendah, namun radius terlalu luas mengurangi keakuratan kehadiran fisik mahasiswa di kantor.
                </p>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <HolidaySettings initialHolidays={initialHolidays} />
      )}
    </div>
  )
}
