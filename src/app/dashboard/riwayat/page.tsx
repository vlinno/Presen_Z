'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import ExcelJS from 'exceljs'

interface AttendanceRecord {
  id: number
  tanggal: string
  jam_masuk: string | null
  jam_pulang: string | null
  keterangan: string
  alasan_izin: string | null
}

export default function RiwayatPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<{
    nama_lengkap: string
    nama_kampus: string
    nim_nisn: string
    tanggal_mulai: string | null
    tanggal_selesai: string | null
  } | null>(null)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: userProfile } = await supabase
        .from('profiles')
        .select('nama_lengkap, nama_kampus, nim_nisn, tanggal_mulai, tanggal_selesai')
        .eq('id', user.id)
        .single()

      if (userProfile) setProfile(userProfile)

      const { data } = await supabase
        .from('absensi')
        .select('*')
        .eq('user_id', user.id)
        .order('tanggal', { ascending: false })

      if (data) setRecords(data)
      setLoading(false)
    }
    fetchData()
  }, [])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    return `${days[date.getDay()]}, ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
  }

  const formatDateSimple = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr + 'T00:00:00')
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
  }

  const formatTime = (time: string | null) => time?.substring(0, 5) || '-'

  const getKeterangan = (record: AttendanceRecord) => {
    if (record.keterangan === 'hadir') return 'Hadir'
    const reason = record.alasan_izin ? ` (${record.alasan_izin})` : ''
    return `${record.keterangan}${reason}`
  }

  const exportToExcel = async () => {
    const supabase = createClient()
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('nama_lengkap, nip, pangkat, instansi')
      .eq('role', 'admin')
      .limit(1)
      .maybeSingle()

    const pamongNama = adminProfile?.nama_lengkap || '-'
    const pamongPangkat = adminProfile?.pangkat || '-'
    const pamongNip = adminProfile?.nip || '-'
    const instansiNama = (adminProfile?.instansi || 'BADAN KESATUAN BANGSA DAN POLITIK KOTA BANJARMASIN').toUpperCase()

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Riwayat Absensi', {
      pageSetup: {
        paperSize: 119, // F4 (8.5 x 13 in)
        orientation: 'portrait',
        horizontalCentered: true,
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        margins: {
          left: 0.5,
          right: 0.5,
          top: 0.5,
          bottom: 0.5,
          header: 0.3,
          footer: 0.3
        }
      }
    })

    // Title
    worksheet.mergeCells('A1:E1')
    const titleCell = worksheet.getCell('A1')
    titleCell.value = `LAPORAN ABSENSI MAGANG`
    titleCell.font = { bold: true, size: 14 }
    titleCell.alignment = { horizontal: 'center' }

    worksheet.mergeCells('A2:E2')
    const subtitleCell = worksheet.getCell('A2')
    subtitleCell.value = instansiNama
    subtitleCell.font = { bold: true, size: 11 }
    subtitleCell.alignment = { horizontal: 'center' }

    worksheet.mergeCells('A4:E4')
    worksheet.getCell('A4').value = `Nama: ${profile?.nama_lengkap || ''}`
    worksheet.getCell('A4').font = { size: 11 }

    worksheet.mergeCells('A5:E5')
    worksheet.getCell('A5').value = `Kampus/Sekolah: ${profile?.nama_kampus || ''}`
    worksheet.getCell('A5').font = { size: 11 }

    worksheet.mergeCells('A6:E6')
    worksheet.getCell('A6').value = `NIM/NISN: ${profile?.nim_nisn || ''}`
    worksheet.getCell('A6').font = { size: 11 }

    worksheet.mergeCells('A7:E7')
    worksheet.getCell('A7').value = `Periode Magang: ${formatDateSimple(profile?.tanggal_mulai)} s/d ${formatDateSimple(profile?.tanggal_selesai)}`
    worksheet.getCell('A7').font = { size: 11 }

    // Empty row
    worksheet.addRow([])

    // Header row
    const headerRow = worksheet.getRow(9)
    headerRow.values = ['NO', 'HARI/TANGGAL', 'JAM MASUK', 'JAM PULANG', 'KETERANGAN']
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } }
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3D8B52' } }
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      }
    })
    headerRow.height = 25

    // Data rows
    const sortedRecords = [...records].sort((a, b) => a.tanggal.localeCompare(b.tanggal))
    sortedRecords.forEach((record, index) => {
      const row = worksheet.getRow(10 + index)
      row.values = [
        index + 1,
        formatDate(record.tanggal),
        formatTime(record.jam_masuk),
        formatTime(record.jam_pulang),
        getKeterangan(record),
      ]
      row.eachCell((cell) => {
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        }
        cell.font = { size: 10 }
      })
    })

    // Column widths
    worksheet.getColumn(1).width = 6   // NO
    worksheet.getColumn(2).width = 30  // HARI/TANGGAL
    worksheet.getColumn(3).width = 15  // JAM MASUK
    worksheet.getColumn(4).width = 15  // JAM PULANG
    worksheet.getColumn(5).width = 42  // KETERANGAN

    // Footer - Signature block
    const lastRow = worksheet.lastRow?.number || 8
    const footerStart = lastRow + 3

    worksheet.mergeCells(`D${footerStart}:E${footerStart}`)
    worksheet.getCell(`D${footerStart}`).value = 'PAMONG'
    worksheet.getCell(`D${footerStart}`).font = { bold: true, size: 10 }
    worksheet.getCell(`D${footerStart}`).alignment = { horizontal: 'center' }

    // Space for signature
    worksheet.mergeCells(`D${footerStart + 4}:E${footerStart + 4}`)
    worksheet.getCell(`D${footerStart + 4}`).value = pamongNama
    worksheet.getCell(`D${footerStart + 4}`).font = { bold: true, underline: true, size: 10 }
    worksheet.getCell(`D${footerStart + 4}`).alignment = { horizontal: 'center' }

    worksheet.mergeCells(`D${footerStart + 5}:E${footerStart + 5}`)
    worksheet.getCell(`D${footerStart + 5}`).value = pamongPangkat
    worksheet.getCell(`D${footerStart + 5}`).font = { size: 10 }
    worksheet.getCell(`D${footerStart + 5}`).alignment = { horizontal: 'center' }

    worksheet.mergeCells(`D${footerStart + 6}:E${footerStart + 6}`)
    worksheet.getCell(`D${footerStart + 6}`).value = pamongNip.startsWith('NIP:') ? pamongNip : `NIP: ${pamongNip}`
    worksheet.getCell(`D${footerStart + 6}`).font = { size: 10 }
    worksheet.getCell(`D${footerStart + 6}`).alignment = { horizontal: 'center' }

    // Generate and save
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Absensi_${(profile?.nama_lengkap || 'Mahasiswa').replace(/\s+/g, '_')}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="animate-spin w-8 h-8 text-primary-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-neutral-500 text-sm">Memuat riwayat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">Riwayat Absensi</h1>
          <p className="text-neutral-500 text-sm">{records.length} catatan kehadiran</p>
        </div>
        <button
          onClick={exportToExcel}
          disabled={records.length === 0}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Cetak Excel
        </button>
      </div>

      {records.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-700 mb-1">Belum Ada Data</h3>
          <p className="text-sm text-neutral-500">Riwayat absensi Anda akan muncul di sini setelah check-in pertama.</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">No</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Hari/Tanggal</th>
                  <th className="px-4 py-3.5 text-center text-xs font-semibold text-neutral-500 uppercase tracking-wider">Jam Masuk</th>
                  <th className="px-4 py-3.5 text-center text-xs font-semibold text-neutral-500 uppercase tracking-wider">Jam Pulang</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {records.map((record, index) => (
                  <tr key={record.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-neutral-600">{index + 1}</td>
                    <td className="px-4 py-3 text-sm text-neutral-800 font-medium">{formatDate(record.tanggal)}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600 text-center tabular-nums">{formatTime(record.jam_masuk)}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600 text-center tabular-nums">{formatTime(record.jam_pulang)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                        record.keterangan === 'hadir'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {getKeterangan(record)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
