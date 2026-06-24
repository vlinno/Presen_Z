'use client'

import { useState, useTransition } from 'react'
import { Holiday, syncNationalHolidays, addCustomHoliday, deleteHoliday } from '@/app/actions/holiday'

interface HolidaySettingsProps {
  initialHolidays: Holiday[]
}

export default function HolidaySettings({ initialHolidays }: HolidaySettingsProps) {
  const [holidays, setHolidays] = useState<Holiday[]>(initialHolidays)
  const [syncYear, setSyncYear] = useState<number>(new Date().getFullYear())
  const [customTanggal, setCustomTanggal] = useState('')
  const [customKeterangan, setCustomKeterangan] = useState('')
  const [customTipe, setCustomTipe] = useState<'lokal' | 'khusus'>('lokal')
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth())
  const monthNamesList = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11)
      setSyncYear((prev) => prev - 1)
    } else {
      setSelectedMonth((prev) => prev - 1)
    }
  }

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0)
      setSyncYear((prev) => prev + 1)
    } else {
      setSelectedMonth((prev) => prev + 1)
    }
  }

  const getLocalDateString = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dt = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${dt}`
  }

  const getDaysInMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1)
    const days = []
    
    let firstDayIndex = firstDay.getDay()
    firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1
    
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      })
    }
    
    const lastDay = new Date(year, month + 1, 0).getDate()
    for (let i = 1; i <= lastDay; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      })
    }
    
    const totalCells = 42
    const remainingCells = totalCells - days.length
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      })
    }
    
    return days
  }

  const handleDateClick = (date: Date) => {
    const dateStr = getLocalDateString(date)
    const existingHoliday = holidays.find((h) => h.tanggal === dateStr)
    
    if (existingHoliday) {
      const element = document.getElementById(`holiday-row-${existingHoliday.id}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element.classList.add('bg-red-50/50')
        setTimeout(() => {
          element.classList.remove('bg-red-50/50')
        }, 1500)
      }
    } else {
      setCustomTanggal(dateStr)
      const ketInput = document.getElementById('custom-keterangan')
      if (ketInput) {
        ketInput.focus()
      }
    }
  }

  const handleSync = async () => {
    setMessage(null)
    startTransition(async () => {
      const result = await syncNationalHolidays(syncYear)
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({
          type: 'success',
          text: `Berhasil menyinkronkan ${result.count} hari libur nasional untuk tahun ${syncYear}!`,
        })
        // Fetch updated list from server or simply reload
        window.location.reload()
      }
    })
  }

  const handleAddCustom = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!customTanggal || !customKeterangan.trim()) {
      setMessage({ type: 'error', text: 'Tanggal dan keterangan libur wajib diisi!' })
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.set('tanggal', customTanggal)
      formData.set('keterangan', customKeterangan.trim())
      formData.set('tipe', customTipe)

      const result = await addCustomHoliday(formData)
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: 'Hari libur kustom berhasil ditambahkan!' })
        setCustomTanggal('')
        setCustomKeterangan('')
        // Simple reload to fetch updated list
        window.location.reload()
      }
    })
  }

  const handleDelete = async (id: number, desc: string) => {
    if (!confirm(`Hapus hari libur "${desc}"?`)) return
    setMessage(null)

    startTransition(async () => {
      const result = await deleteHoliday(id)
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: 'Hari libur berhasil dihapus!' })
        setHolidays((prev) => prev.filter((h) => h.id !== id))
      }
    })
  }

  const formatDateString = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-800">Kalender Hari Libur</h2>
          <p className="text-xs text-neutral-400">
            Kelola hari libur nasional dan kustom agar absensi mahasiswa otomatis libur.
          </p>
        </div>

        {/* Sync panel */}
        <div className="flex items-center gap-2 bg-white/80 p-2 rounded-2xl border border-neutral-200 shadow-sm w-full md:w-auto">
          <label htmlFor="sync-year" className="text-xs font-semibold text-neutral-600 pl-2">
            Tahun:
          </label>
          <select
            id="sync-year"
            value={syncYear}
            onChange={(e) => setSyncYear(Number(e.target.value))}
            className="px-2 py-1 bg-neutral-50 rounded-lg text-xs font-semibold border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            {[syncYear - 1, syncYear, syncYear + 1, syncYear + 2].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <button
            onClick={handleSync}
            disabled={isPending}
            className="px-3.5 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {isPending ? (
              <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              '🔄'
            )}
            Sinkronisasi Libur Nasional
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-semibold animate-fade-in ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Calendar Grid View */}
        <div className="lg:col-span-1">
          <div className="glass-card p-5 flex flex-col h-full min-h-[460px]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-neutral-800">Tampilan Kalender</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-all text-neutral-600 active:scale-95 text-[10px]"
                >
                  ◀
                </button>
                <span className="text-xs font-bold text-neutral-800 uppercase min-w-[90px] text-center">
                  {monthNamesList[selectedMonth]}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-all text-neutral-600 active:scale-95 text-[10px]"
                >
                  ▶
                </button>
              </div>
            </div>

            {/* Calendar grid headers */}
            <div className="grid grid-cols-7 gap-1.5 mb-2 text-center text-[10px] font-bold text-neutral-400">
              <div>Sen</div>
              <div>Sel</div>
              <div>Rab</div>
              <div>Kam</div>
              <div>Jum</div>
              <div className="text-red-400">Sab</div>
              <div className="text-red-400">Min</div>
            </div>

            {/* Calendar grid cells */}
            <div className="grid grid-cols-7 gap-1.5 flex-1">
              {getDaysInMonth(syncYear, selectedMonth).map((dayObj, index) => {
                const dateStr = getLocalDateString(dayObj.date);
                const isToday = dateStr === getLocalDateString(new Date());
                const isWeekend = dayObj.date.getDay() === 0 || dayObj.date.getDay() === 6;
                const holiday = holidays.find((h) => h.tanggal === dateStr);

                let cellStyle = "bg-white border border-neutral-200 text-neutral-800 hover:bg-neutral-50 cursor-pointer";
                let tooltipText = null;

                if (!dayObj.isCurrentMonth) {
                  cellStyle = "bg-neutral-50/30 border border-neutral-100/50 text-neutral-300 pointer-events-none";
                } else if (holiday) {
                  cellStyle = "bg-red-50 border border-red-200 text-red-700 font-bold hover:bg-red-100/50 cursor-pointer";
                  tooltipText = holiday.keterangan;
                } else if (isWeekend) {
                  cellStyle = "bg-neutral-100/50 border border-neutral-200 text-neutral-400 hover:bg-neutral-100 cursor-pointer";
                }

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleDateClick(dayObj.date)}
                    className={`relative flex flex-col items-center justify-center rounded-xl text-[11px] h-9 transition-all group ${cellStyle} ${
                      isToday ? 'ring-2 ring-primary-500 font-bold border-transparent' : ''
                    }`}
                  >
                    <span>{dayObj.date.getDate()}</span>
                    {holiday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 absolute bottom-1" />
                    )}
                    {tooltipText && (
                      <div className="absolute bottom-full mb-1.5 hidden group-hover:block z-30 w-32 bg-neutral-900 text-white text-[9px] p-1.5 rounded-lg shadow-xl text-center leading-normal">
                        {tooltipText}
                        <div className="w-1.5 h-1.5 bg-neutral-900 rotate-45 mx-auto -mb-2 mt-1" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Instruction footnote */}
            <p className="text-[10px] text-neutral-400 mt-4 leading-normal">
              💡 <strong>Tips:</strong> Klik tanggal kosong untuk mengisi form tambah libur secara cepat, atau klik tanggal merah untuk mencari libur tersebut di daftar.
            </p>
          </div>
        </div>

        {/* Column 2: Table List */}
        <div className="lg:col-span-1 flex flex-col">
          <div className="glass-card overflow-hidden flex-1 flex flex-col max-h-[460px]">
            <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center bg-neutral-50/50 flex-shrink-0">
              <span className="text-sm font-bold text-neutral-800">Daftar Hari Libur</span>
              <span className="px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700 text-[10px] font-bold">
                {holidays.length} Hari
              </span>
            </div>

            <div className="overflow-y-auto flex-1 scrollbar-thin">
              {holidays.length === 0 ? (
                <div className="text-center py-16 text-neutral-400">
                  <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center mx-auto mb-3 text-neutral-300">
                    📅
                  </div>
                  <p className="text-sm font-bold text-neutral-700">Belum Ada Hari Libur</p>
                  <p className="text-xs text-neutral-400 mt-1 max-w-[200px] mx-auto">
                    Klik sinkronisasi di atas atau tambahkan hari libur kustom secara manual.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {holidays.map((h) => (
                    <div
                      key={h.id}
                      id={`holiday-row-${h.id}`}
                      className="p-3 flex justify-between items-center hover:bg-neutral-50/30 transition-colors"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                            h.tipe === 'nasional'
                              ? 'bg-red-50 text-red-600 border border-red-100'
                              : h.tipe === 'lokal'
                              ? 'bg-blue-50 text-blue-600 border border-blue-100'
                              : 'bg-purple-50 text-purple-600 border border-purple-100'
                          }`}>
                            {h.tipe === 'nasional' ? 'Nasional' : h.tipe === 'lokal' ? 'Lokal' : 'Khusus'}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-mono">{h.tanggal}</span>
                        </div>
                        <h4 className="text-xs font-bold text-neutral-800 leading-snug truncate" title={h.keterangan}>
                          {h.keterangan}
                        </h4>
                      </div>

                      <button
                        onClick={() => handleDelete(h.id, h.keterangan)}
                        disabled={isPending}
                        className="p-1 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-all flex-shrink-0"
                        title="Hapus Hari Libur"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Column 3: Add Custom Form */}
        <div className="lg:col-span-1">
          <div className="glass-card p-5">
            <h3 className="text-sm font-bold text-neutral-800 mb-4">Tambah Libur Kustom</h3>

            <form onSubmit={handleAddCustom} className="space-y-4">
              <div>
                <label htmlFor="custom-tanggal" className="block text-xs font-semibold text-neutral-600 mb-1.5">
                  Tanggal Libur <span className="text-red-500">*</span>
                </label>
                <input
                  id="custom-tanggal"
                  type="date"
                  required
                  value={customTanggal}
                  onChange={(e) => setCustomTanggal(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 bg-neutral-50/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label htmlFor="custom-keterangan" className="block text-xs font-semibold text-neutral-600 mb-1.5">
                  Keterangan Libur <span className="text-red-500">*</span>
                </label>
                <input
                  id="custom-keterangan"
                  type="text"
                  required
                  placeholder="Contoh: HUT Kota Banjarmasin"
                  value={customKeterangan}
                  onChange={(e) => setCustomKeterangan(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 bg-neutral-50/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Tipe Libur</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'lokal', label: 'Daerah / Lokal' },
                    { value: 'khusus', label: 'Khusus Kantor' },
                  ].map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setCustomTipe(t.value as any)}
                      className={`px-3 py-2 text-xs font-bold rounded-xl border text-center transition-all ${
                        customTipe === t.value
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 rounded-xl bg-gradient-primary text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isPending && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                Simpan Hari Libur
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
