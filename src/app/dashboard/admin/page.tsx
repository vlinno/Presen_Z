'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'
import { createAnnouncement, deleteAnnouncement } from '@/app/actions/announcement'

const AdminDashboardMap = dynamic(() => import('@/components/AdminDashboardMap'), { ssr: false })

interface StudentSummary {
  id: string
  nama_lengkap: string
  nama_kampus: string
  todayStatus: string | null
  jam_masuk: string | null
  latitude_masuk: number | null
  longitude_masuk: number | null
  jam_pulang: string | null
  latitude_pulang: number | null
  longitude_pulang: number | null
}

interface BidangStat {
  id: number
  nama_bidang: string
  totalStudents: number
  hadirCount: number
  percentage: number
  hadirNames: string[]
}

export default function AdminDashboardPage() {
  const [students, setStudents] = useState<StudentSummary[]>([])
  const [totalHadir, setTotalHadir] = useState(0)
  const [totalIzin, setTotalIzin] = useState(0)
  const [totalBelum, setTotalBelum] = useState(0)
  const [loading, setLoading] = useState(true)
  const [focusedLatLng, setFocusedLatLng] = useState<[number, number] | null>(null)
  const [bidangStats, setBidangStats] = useState<BidangStat[]>([])

  // Announcements & Trend statistics states
  const [weeklyData, setWeeklyData] = useState<{ dayName: string; dateStr: string; presentRate: number }[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [annTitle, setAnnTitle] = useState('')
  const [annContent, setAnnContent] = useState('')
  const [annLoading, setAnnLoading] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const today = new Date().toISOString().split('T')[0]

      // Otomatis bersihkan koordinat GPS hari sebelumnya (dibersihkan setelah berganti hari / jam 24:00 WITA)
      await supabase
        .from('absensi')
        .update({
          latitude_masuk: null,
          longitude_masuk: null,
          latitude_pulang: null,
          longitude_pulang: null,
        })
        .lt('tanggal', today)

      // Fetch all magang students
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, nama_lengkap, nama_kampus, bidang_id')
        .eq('role', 'magang')
        .not('nama_lengkap', 'is', null)
        .order('nama_lengkap')

      if (!profiles) {
        setLoading(false)
        return
      }

      // Fetch today's attendance
      const { data: todayAttendance } = await supabase
        .from('absensi')
        .select('user_id, keterangan, jam_masuk, jam_pulang, latitude_masuk, longitude_masuk, latitude_pulang, longitude_pulang')
        .eq('tanggal', today)

      const attendanceMap = new Map(
        todayAttendance?.map((a) => [a.user_id, a]) || []
      )

      let hadir = 0
      let izin = 0
      let belum = 0

      const studentList: StudentSummary[] = profiles.map((p) => {
        const attendance = attendanceMap.get(p.id)
        if (attendance) {
          if (attendance.keterangan === 'hadir') hadir++
          else izin++
        } else {
          belum++
        }

        return {
          id: p.id,
          nama_lengkap: p.nama_lengkap,
          nama_kampus: p.nama_kampus,
          todayStatus: attendance?.keterangan || null,
          jam_masuk: attendance?.jam_masuk || null,
          latitude_masuk: attendance?.latitude_masuk !== undefined ? attendance.latitude_masuk : null,
          longitude_masuk: attendance?.longitude_masuk !== undefined ? attendance.longitude_masuk : null,
          jam_pulang: attendance?.jam_pulang || null,
          latitude_pulang: attendance?.latitude_pulang !== undefined ? attendance.latitude_pulang : null,
          longitude_pulang: attendance?.longitude_pulang !== undefined ? attendance.longitude_pulang : null,
        }
      })

      // Fetch weekly trend (last 7 days of attendance)
      const dayLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
      const last7Days: { dayName: string; dateStr: string; count: number }[] = []
      
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        const dayOfWeek = d.getDay()
        last7Days.push({
          dayName: `${dayLabels[dayOfWeek]} (${d.getDate()}/${d.getMonth()+1})`,
          dateStr,
          count: 0
        })
      }

      const { data: weeklyRecords } = await supabase
        .from('absensi')
        .select('tanggal')
        .gte('tanggal', last7Days[0].dateStr)
        .lte('tanggal', last7Days[6].dateStr)

      if (weeklyRecords) {
        weeklyRecords.forEach((rec) => {
          const match = last7Days.find((day) => day.dateStr === rec.tanggal)
          if (match) match.count++
        })
      }

      const totalStudentsCount = profiles.length
      const trendData = last7Days.map((day) => {
        const rate = totalStudentsCount > 0 ? Math.round((day.count / totalStudentsCount) * 100) : 0
        return {
          dayName: day.dayName,
          dateStr: day.dateStr,
          presentRate: rate
        }
      })
      setWeeklyData(trendData)

      // 1. Hitung Statistik per Bidang
      const { data: bidangList } = await supabase
        .from('bidang_kesbangpol')
        .select('id, nama_bidang')

      if (bidangList) {
        const statsByBidang = bidangList.map((bidang) => {
          const bidangStudents = studentList.filter((s: any) => {
            const prof = profiles.find((p: any) => p.id === s.id)
            return prof?.bidang_id === bidang.id
          })
          
          const totalInBidang = bidangStudents.length
          const hadirStudents = bidangStudents.filter((s) => s.todayStatus === 'hadir')
          const hadirInBidang = hadirStudents.length
          const pct = totalInBidang > 0 ? Math.round((hadirInBidang / totalInBidang) * 100) : 0
          
          return {
            id: bidang.id,
            nama_bidang: bidang.nama_bidang,
            totalStudents: totalInBidang,
            hadirCount: hadirInBidang,
            percentage: pct,
            hadirNames: hadirStudents.map((s) => s.nama_lengkap)
          }
        }).filter(b => b.totalStudents > 0) // Hanya tampilkan bidang yang punya mahasiswa magang
        setBidangStats(statsByBidang)
      }

      // Fetch announcements
      const { data: annList } = await supabase
        .from('pengumuman')
        .select('*')
        .order('created_at', { ascending: false })
      if (annList) setAnnouncements(annList)

      setStudents(studentList)
      setTotalHadir(hadir)
      setTotalIzin(izin)
      setTotalBelum(belum)
      setLoading(false)
    }

    fetchData()
  }, [])

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!annTitle.trim() || !annContent.trim()) return
    setAnnLoading(true)
    
    const result = await createAnnouncement(annTitle, annContent)
    if (result.error) {
      alert(result.error)
    } else {
      setAnnTitle('')
      setAnnContent('')
      const supabase = createClient()
      const { data: annList } = await supabase
        .from('pengumuman')
        .select('*')
        .order('created_at', { ascending: false })
      if (annList) setAnnouncements(annList)
    }
    setAnnLoading(false)
  }

  const handleDeleteAnnouncement = async (id: number) => {
    if (!confirm('Hapus pengumuman ini?')) return
    const result = await deleteAnnouncement(id)
    if (result.error) {
      alert(result.error)
    } else {
      setAnnouncements(announcements.filter(ann => ann.id !== id))
    }
  }

  const formatTime = (time: string | null) => time?.substring(0, 5) || '-'

  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  const now = new Date()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="animate-spin w-8 h-8 text-primary-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-neutral-500 text-sm">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 mb-1">Dashboard Admin</h1>
        <p className="text-neutral-500 text-sm">
          {dayNames[now.getDay()]}, {now.getDate()} {monthNames[now.getMonth()]} {now.getFullYear()}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 stagger-children">
        {/* Hadir */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">Hadir</p>
              <p className="text-3xl font-bold text-green-600">{totalHadir}</p>
            </div>
          </div>
        </div>

        {/* Izin */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">Izin</p>
              <p className="text-3xl font-bold text-amber-600">{totalIzin}</p>
            </div>
          </div>
        </div>

        {/* Belum Absen */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">Belum Absen</p>
              <p className="text-3xl font-bold text-red-500">{totalBelum}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts & Announcement Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-slide-up">
        {/* Visual Charts (Donut & Weekly Trend) - 2 columns */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Today's Donut Chart */}
          <div className="glass-card p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-800 mb-1">Rasio Kehadiran Hari Ini</h3>
              <p className="text-xs text-neutral-400">Distribusi status kehadiran dari {students.length} mahasiswa</p>
            </div>
            
            <div className="flex items-center justify-center gap-6 my-4">
              {students.length > 0 ? (
                (() => {
                  const total = students.length;
                  const pctHadir = Math.round((totalHadir / total) * 100);
                  const pctIzin = Math.round((totalIzin / total) * 100);
                  const pctBelum = Math.round((totalBelum / total) * 100);
                  
                  const circ = 219.9;
                  const strokeHadir = (totalHadir / total) * circ;
                  const strokeIzin = (totalIzin / total) * circ;
                  const strokeBelum = (totalBelum / total) * circ;
                  
                  return (
                    <>
                      <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="35" fill="transparent" stroke="#f3f4f6" strokeWidth="10" />
                          {totalHadir > 0 && (
                            <circle
                              cx="50" cy="50" r="35" fill="transparent" stroke="#10b981" strokeWidth="10"
                              strokeDasharray={`${strokeHadir} ${circ}`}
                              strokeDashoffset={0}
                            />
                          )}
                          {totalIzin > 0 && (
                            <circle
                              cx="50" cy="50" r="35" fill="transparent" stroke="#f59e0b" strokeWidth="10"
                              strokeDasharray={`${strokeIzin} ${circ}`}
                              strokeDashoffset={-strokeHadir}
                            />
                          )}
                          {totalBelum > 0 && (
                            <circle
                              cx="50" cy="50" r="35" fill="transparent" stroke="#ef4444" strokeWidth="10"
                              strokeDasharray={`${strokeBelum} ${circ}`}
                              strokeDashoffset={-(strokeHadir + strokeIzin)}
                            />
                          )}
                        </svg>
                        <div className="absolute text-center">
                          <span className="text-xl font-extrabold text-neutral-800">{pctHadir}%</span>
                          <p className="text-[9px] text-neutral-400 -mt-0.5 font-medium">Hadir</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] block" />
                          <span className="text-xs font-semibold text-neutral-600">Hadir ({pctHadir}%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] block" />
                          <span className="text-xs font-semibold text-neutral-600">Izin ({pctIzin}%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] block" />
                          <span className="text-xs font-semibold text-neutral-600">Belum ({pctBelum}%)</span>
                        </div>
                      </div>
                    </>
                  );
                })()
              ) : (
                <p className="text-xs text-neutral-400">Belum ada data</p>
              )}
            </div>
          </div>
          
          {/* Weekly Trend Bar Chart */}
          <div className="glass-card p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-800 mb-1">Tren Kehadiran Mingguan</h3>
              <p className="text-xs text-neutral-400">Rasio absensi hadir/izin 7 hari terakhir</p>
            </div>
            
            <div className="flex items-end justify-between gap-2.5 h-28 px-2 mt-4">
              {weeklyData.map((data, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1 group relative">
                  <span className="absolute bottom-full mb-1 scale-0 group-hover:scale-100 transition-all rounded bg-neutral-800 text-white text-[9px] px-1.5 py-0.5 pointer-events-none z-10 whitespace-nowrap">
                    {data.presentRate}%
                  </span>
                  
                  <div className="w-full bg-neutral-100 rounded-t-lg h-20 flex flex-col justify-end overflow-hidden">
                    <div 
                      className="bg-primary-600 hover:bg-primary-700 transition-all rounded-t-lg"
                      style={{ height: `${data.presentRate}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-semibold text-neutral-400 mt-2 scale-90">{data.dayName.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Announcement Management - 1 column */}
        <div className="lg:col-span-1 glass-card p-5 flex flex-col h-[280px]">
          <h3 className="text-sm font-bold text-neutral-800 mb-2">📢 Siaran Pengumuman</h3>
          
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin mb-3 text-left">
            {announcements.length === 0 ? (
              <p className="text-xs text-neutral-400 text-center py-8">Belum ada pengumuman.</p>
            ) : (
              announcements.map((ann) => (
                <div key={ann.id} className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100 flex justify-between items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-neutral-800 truncate">{ann.judul}</h4>
                    <p className="text-[10px] text-neutral-500 line-clamp-2 mt-0.5">{ann.konten}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteAnnouncement(ann.id)}
                    className="text-red-500 hover:text-red-700 text-xs font-semibold p-0.5 hover:bg-red-50 rounded"
                    title="Hapus"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
          
          <form onSubmit={handleAddAnnouncement} className="space-y-2 border-t border-neutral-100 pt-3">
            <input
              type="text"
              placeholder="Judul Pengumuman"
              required
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <div className="flex gap-2">
              <textarea
                placeholder="Isi pengumuman..."
                required
                rows={1}
                value={annContent}
                onChange={(e) => setAnnContent(e.target.value)}
                className="flex-1 px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none"
              />
              <button
                type="submit"
                disabled={annLoading}
                className="px-3 bg-primary-600 text-white rounded-lg text-xs font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                Kirim
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Visual Analytics Row 2 - Bidang Stats */}
      <div className="mb-8 animate-slide-up">
        {/* Bidang Attendance Stats - Full width */}
        <div className="glass-card p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-800 mb-1">📊 Kehadiran per Bidang (Hari Ini)</h3>
            <p className="text-xs text-neutral-400 mb-4">Persentase kehadiran mahasiswa magang aktif hari ini di masing-masing bidang</p>
          </div>
          
          <div className="space-y-3.5 flex-1 flex flex-col justify-center">
            {bidangStats.length === 0 ? (
              <p className="text-xs text-neutral-400 py-6 text-center">Belum ada mahasiswa magang terdaftar di bidang mana pun saat ini.</p>
            ) : (
              bidangStats.map((bidang) => (
                <div key={bidang.id} className="space-y-1.5 mb-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-neutral-600">
                    <span className="truncate pr-4">{bidang.nama_bidang}</span>
                    <span className="font-bold text-primary-700 flex-shrink-0">{bidang.percentage}% ({bidang.hadirCount}/{bidang.totalStudents} Mhs)</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        bidang.percentage >= 80 
                          ? 'bg-green-500' 
                          : bidang.percentage >= 50 
                          ? 'bg-amber-500' 
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${bidang.percentage}%` }}
                    />
                  </div>
                  {bidang.hadirNames.length > 0 && (
                    <p className="text-[10px] text-neutral-500 leading-tight italic pt-0.5">
                      <span className="font-medium text-neutral-600 not-italic">Hadir:</span> {bidang.hadirNames.join(', ')}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Real-time Status and Map Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Student list (1/3 width) */}
        <div className="lg:col-span-1 flex flex-col h-full">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">Status Mahasiswa Hari Ini</h2>
          {students.length === 0 ? (
            <div className="glass-card p-12 text-center flex-1 flex items-center justify-center">
              <p className="text-neutral-500 text-sm">Belum ada mahasiswa magang terdaftar.</p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[450px] md:max-h-[500px] pr-1 scrollbar-thin">
              {students.map((student) => {
                const canFocus = student.todayStatus === 'hadir' && (student.latitude_masuk || student.latitude_pulang);
                return (
                  <div 
                    key={student.id} 
                    onClick={() => {
                      if (canFocus) {
                        if (student.latitude_masuk !== null && student.longitude_masuk !== null) {
                          setFocusedLatLng([student.latitude_masuk, student.longitude_masuk])
                        } else if (student.latitude_pulang !== null && student.longitude_pulang !== null) {
                          setFocusedLatLng([student.latitude_pulang, student.longitude_pulang])
                        }
                      }
                    }}
                    className={`glass-card p-4 flex items-center gap-3 transition-all duration-200 ${
                      canFocus 
                        ? 'cursor-pointer hover:border-primary-400 hover:shadow-md active:scale-[0.99]' 
                        : ''
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      student.todayStatus === 'hadir'
                        ? 'bg-green-100'
                        : student.todayStatus
                        ? 'bg-amber-100'
                        : 'bg-neutral-100'
                    }`}>
                      <span className={`font-semibold text-sm ${
                        student.todayStatus === 'hadir'
                          ? 'text-green-700'
                          : student.todayStatus
                          ? 'text-amber-700'
                          : 'text-neutral-400'
                      }`}>
                        {student.nama_lengkap?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-neutral-800 truncate flex items-center gap-1">
                        {student.nama_lengkap}
                        {canFocus && (
                          <span className="inline-block text-primary-500 text-xs" title="Klik untuk fokus peta">
                            📍
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-neutral-400 truncate">{student.nama_kampus}</p>
                    </div>
                    <div className="flex-shrink-0">
                      {student.todayStatus ? (
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          student.todayStatus === 'hadir'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {student.todayStatus} {student.jam_masuk ? `• ${formatTime(student.jam_masuk)}` : ''}
                        </span>
                      ) : (
                        <span className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-400">
                          Belum
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column: Today's live map (2/3 width) */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">Peta Absensi Hari Ini</h2>
          <AdminDashboardMap 
            students={students} 
            focusedLatLng={focusedLatLng} 
          />
        </div>
      </div>
    </div>
  )
}
