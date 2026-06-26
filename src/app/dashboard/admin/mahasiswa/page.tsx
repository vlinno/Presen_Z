'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase/client'
import ExcelJS from 'exceljs'
import { adminUpdateAttendance, adminDeleteAttendance, adminAddAttendance } from '@/app/actions/attendance'
import { deleteStudentsBulk } from '@/app/actions/profile'

interface Student {
  id: string
  nama_lengkap: string
  nama_kampus: string
  nim_nisn: string
  tanggal_mulai: string | null
  tanggal_selesai: string | null
  bidang: { nama_bidang: string } | null
}

interface AttendanceRecord {
  id: number
  tanggal: string
  jam_masuk: string | null
  jam_pulang: string | null
  keterangan: string
  alasan_izin: string | null
  latitude_masuk: number | null
  longitude_masuk: number | null
  latitude_pulang: number | null
  longitude_pulang: number | null
  bukti_izin_url?: string | null
}

export default function MahasiswaPage() {
  const [mounted, setMounted] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState<string | null>(null)

  // Bulk recap states
  const [showRecapModal, setShowRecapModal] = useState(false)
  const [recapMonth, setRecapMonth] = useState(new Date().getMonth())
  const [recapYear, setRecapYear] = useState(new Date().getFullYear())
  const [generatingRecap, setGeneratingRecap] = useState(false)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')

  // Checkbox selection state
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])

  // Bulk individual export states
  const [exportingBulk, setExportingBulk] = useState(false)
  const [exportingProgress, setExportingProgress] = useState(0)

  // Deleting student state
  const [deletingSelected, setDeletingSelected] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Modal State
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loadingRecords, setLoadingRecords] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Add/Edit State
  const [isEditing, setIsEditing] = useState<AttendanceRecord | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [formTanggal, setFormTanggal] = useState('')
  const [formJamMasuk, setFormJamMasuk] = useState('')
  const [formJamPulang, setFormJamPulang] = useState('')
  const [formKeterangan, setFormKeterangan] = useState('hadir')
  const [formAlasanIzin, setFormAlasanIzin] = useState('')

  const fetchStudents = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .select('id, nama_lengkap, nama_kampus, nim_nisn, tanggal_mulai, tanggal_selesai, bidang:bidang_kesbangpol(nama_bidang)')
      .eq('role', 'magang')
      .not('nama_lengkap', 'is', null)
      .order('nama_lengkap')

    if (data) {
      const studentData = data as unknown as Student[]
      setStudents(studentData)
      setSelectedStudentIds([])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const fetchAttendanceRecords = async (studentId: string) => {
    setLoadingRecords(true)
    setErrorMsg(null)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('absensi')
      .select('*')
      .eq('user_id', studentId)
      .order('tanggal', { ascending: true })


    if (error) {
      setErrorMsg('Gagal mengambil data absensi.')
    } else if (data) {
      setRecords(data)
    }
    setLoadingRecords(false)
  }

  const handleOpenDetail = (student: Student) => {
    setSelectedStudent(student)
    fetchAttendanceRecords(student.id)
    setIsAdding(false)
    setIsEditing(null)
  }

  const handleCloseDetail = () => {
    setSelectedStudent(null)
    setRecords([])
    setErrorMsg(null)
    setSuccessMsg(null)
  }

  const handleStartAdd = () => {
    setIsEditing(null)
    setFormTanggal(new Date().toISOString().split('T')[0])
    setFormJamMasuk('08:00')
    setFormJamPulang('16:00')
    setFormKeterangan('hadir')
    setFormAlasanIzin('')
    setIsAdding(true)
  }

  const handleStartEdit = (record: AttendanceRecord) => {
    setIsAdding(false)
    setIsEditing(record)
    setFormTanggal(record.tanggal)
    setFormJamMasuk(record.jam_masuk ? record.jam_masuk.substring(0, 5) : '')
    setFormJamPulang(record.jam_pulang ? record.jam_pulang.substring(0, 5) : '')
    setFormKeterangan(record.keterangan)
    setFormAlasanIzin(record.alasan_izin || '')
  }

  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent) return
    setErrorMsg(null)
    setSuccessMsg(null)

    const dataPayload = {
      tanggal: formTanggal,
      jam_masuk: formKeterangan === 'hadir' ? (formJamMasuk ? formJamMasuk + ':00' : null) : null,
      jam_pulang: formKeterangan === 'hadir' ? (formJamPulang ? formJamPulang + ':00' : null) : null,
      keterangan: formKeterangan,
      alasan_izin: formKeterangan !== 'hadir' ? formAlasanIzin : null,
    }

    let result
    if (isEditing) {
      result = await adminUpdateAttendance(isEditing.id, dataPayload)
    } else {
      result = await adminAddAttendance(selectedStudent.id, dataPayload)
    }

    if (result.error) {
      setErrorMsg(result.error)
    } else {
      setSuccessMsg(isEditing ? 'Absensi berhasil diperbarui!' : 'Absensi baru berhasil ditambahkan!')
      setIsEditing(null)
      setIsAdding(false)
      fetchAttendanceRecords(selectedStudent.id)
      setTimeout(() => setSuccessMsg(null), 3000)
    }
  }

  const handleDeleteRecord = async (recordId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data absensi ini?')) return
    setErrorMsg(null)
    setSuccessMsg(null)

    const result = await adminDeleteAttendance(recordId)
    if (result.error) {
      setErrorMsg(result.error)
    } else {
      setSuccessMsg('Data absensi berhasil dihapus.')
      if (selectedStudent) {
        fetchAttendanceRecords(selectedStudent.id)
      }
      setTimeout(() => setSuccessMsg(null), 3000)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
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

  const exportStudentExcel = async (student: Student) => {
    setExporting(student.id)

    try {
      const supabase = createClient()
      
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      let adminProfile = null
      if (currentUser) {
        const { data } = await supabase
          .from('profiles')
          .select('nama_lengkap, nip, pangkat, instansi')
          .eq('id', currentUser.id)
          .single()
        adminProfile = data
      }

      const pamongNama = adminProfile?.nama_lengkap || '-'
      const pamongPangkat = adminProfile?.pangkat || '-'
      const pamongNip = adminProfile?.nip || '-'
      const instansiNama = (adminProfile?.instansi || 'BADAN KESATUAN BANGSA DAN POLITIK KOTA BANJARMASIN').toUpperCase()

      const { data: records } = await supabase
        .from('absensi')
        .select('*')
        .eq('user_id', student.id)
        .order('tanggal', { ascending: true })

      if (!records) {
        setExporting(null)
        return
      }

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Laporan Absensi', {
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
      titleCell.value = 'LAPORAN ABSENSI MAGANG'
      titleCell.font = { bold: true, size: 14 }
      titleCell.alignment = { horizontal: 'center' }

      worksheet.mergeCells('A2:E2')
      const subtitleCell = worksheet.getCell('A2')
      subtitleCell.value = instansiNama
      subtitleCell.font = { bold: true, size: 11 }
      subtitleCell.alignment = { horizontal: 'center' }

      // Student info
      worksheet.mergeCells('A4:E4')
      worksheet.getCell('A4').value = `Nama: ${student.nama_lengkap}`
      worksheet.getCell('A4').font = { size: 11 }

      worksheet.mergeCells('A5:E5')
      worksheet.getCell('A5').value = `Kampus/Sekolah: ${student.nama_kampus}`
      worksheet.getCell('A5').font = { size: 11 }

      worksheet.mergeCells('A6:E6')
      worksheet.getCell('A6').value = `NIM/NISN: ${student.nim_nisn}`
      worksheet.getCell('A6').font = { size: 11 }

      worksheet.mergeCells('A7:E7')
      worksheet.getCell('A7').value = `Periode Magang: ${formatDateSimple(student.tanggal_mulai)} s/d ${formatDateSimple(student.tanggal_selesai)}`
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
      records.forEach((record: AttendanceRecord, index: number) => {
        let keterangan = 'hadir'
        if (record.keterangan !== 'hadir') {
          keterangan = record.alasan_izin
            ? `${record.keterangan} (${record.alasan_izin})`
            : record.keterangan
        }

        const row = worksheet.getRow(10 + index)
        row.values = [
          index + 1,
          formatDate(record.tanggal),
          formatTime(record.jam_masuk),
          formatTime(record.jam_pulang),
          keterangan,
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
      const lastDataRow = 9 + records.length
      const footerStart = lastDataRow + 3

      worksheet.mergeCells(`D${footerStart}:E${footerStart}`)
      worksheet.getCell(`D${footerStart}`).value = 'PAMONG'
      worksheet.getCell(`D${footerStart}`).font = { bold: true, size: 10 }
      worksheet.getCell(`D${footerStart}`).alignment = { horizontal: 'center' }

      // Space for signature (3 empty rows)
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

      // Generate
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Absensi_${student.nama_lengkap.replace(/\s+/g, '_')}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export error:', err)
    }

    setExporting(null)
  }

  const handleBulkExportIndividualExcel = async () => {
    const selectedStudents = students.filter((s) => selectedStudentIds.includes(s.id))
    if (selectedStudents.length === 0) return

    setExportingBulk(true)
    setExportingProgress(0)

    for (let i = 0; i < selectedStudents.length; i++) {
      setExportingProgress(i + 1)
      await exportStudentExcel(selectedStudents[i])
      await new Promise((resolve) => setTimeout(resolve, 800))
    }

    setExportingBulk(false)
  }

  const getColLetter = (colIndex: number): string => {
    let temp = colIndex
    let letter = ''
    while (temp > 0) {
      let modulo = (temp - 1) % 26
      letter = String.fromCharCode(65 + modulo) + letter
      temp = Math.floor((temp - modulo) / 26)
    }
    return letter
  }

  const handleExportMonthlyRecap = async () => {
    setGeneratingRecap(true)
    setErrorMsg(null)
    const supabase = createClient()
    
    try {
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

      const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('id, nama_lengkap, nama_kampus, nim_nisn')
        .eq('role', 'magang')
        .not('nama_lengkap', 'is', null)
        .order('nama_lengkap')

      if (pError) throw pError
      if (!profiles || profiles.length === 0) {
        alert('Tidak ada mahasiswa magang terdaftar.')
        setGeneratingRecap(false)
        return
      }

      // Filter profiles based on selected checkboxes
      const targetProfiles = profiles.filter((p) => selectedStudentIds.includes(p.id))

      if (targetProfiles.length === 0) {
        alert('Silakan pilih minimal satu mahasiswa magang untuk dicetak.')
        setGeneratingRecap(false)
        return
      }

      const daysInMonth = new Date(recapYear, recapMonth + 1, 0).getDate()
      const startDate = `${recapYear}-${String(recapMonth + 1).padStart(2, '0')}-01`
      const endDate = `${recapYear}-${String(recapMonth + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`

      const { data: attendanceData, error: aError } = await supabase
        .from('absensi')
        .select('user_id, tanggal, keterangan')
        .gte('tanggal', startDate)
        .lte('tanggal', endDate)

      if (aError) throw aError

      const attendanceMap = new Map<string, Map<string, string>>()
      attendanceData?.forEach((rec) => {
        if (!attendanceMap.has(rec.user_id)) {
          attendanceMap.set(rec.user_id, new Map<string, string>())
        }
        attendanceMap.get(rec.user_id)!.set(rec.tanggal, rec.keterangan)
      })

      // Ambil hari libur yang terdaftar pada bulan ini
      const { data: holidayData, error: hError } = await supabase
        .from('hari_libur')
        .select('tanggal')
        .gte('tanggal', startDate)
        .lte('tanggal', endDate)

      if (hError) throw hError
      const holidayDates = new Set(holidayData?.map((h) => h.tanggal) || [])

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Rekap Absensi Bulanan', {
        pageSetup: {
          paperSize: 9, // A4
          orientation: 'landscape',
          horizontalCentered: true,
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 0,
          margins: {
            left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3
          }
        }
      })

      const maxCols = 8 + daysInMonth
      const lastColLetter = getColLetter(maxCols)

      worksheet.mergeCells(`A1:${lastColLetter}1`)
      const titleCell = worksheet.getCell('A1')
      titleCell.value = 'REKAPITULASI PRESENSI MAHASISWA MAGANG'
      titleCell.font = { bold: true, size: 16 }
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
      worksheet.getRow(1).height = 25

      worksheet.mergeCells(`A2:${lastColLetter}2`)
      const subtitleCell = worksheet.getCell('A2')
      subtitleCell.value = instansiNama
      subtitleCell.font = { bold: true, size: 12 }
      subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' }
      worksheet.getRow(2).height = 20

      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
      worksheet.mergeCells(`A3:${lastColLetter}3`)
      const periodCell = worksheet.getCell('A3')
      periodCell.value = `Periode: ${months[recapMonth]} ${recapYear}`
      periodCell.font = { italic: true, size: 11 }
      periodCell.alignment = { horizontal: 'center', vertical: 'middle' }
      worksheet.getRow(3).height = 18

      worksheet.addRow([])

      const headers = ['NO', 'NAMA MAHASISWA', 'KAMPUS/SEKOLAH', 'NIM/NISN']
      for (let i = 1; i <= daysInMonth; i++) {
        headers.push(String(i))
      }
      headers.push('HADIR (H)', 'IZIN (I)', 'ALPA (A)', '% HADIR')

      const headerRow = worksheet.getRow(5)
      headerRow.values = headers
      headerRow.height = 36

      headerRow.eachCell((cell) => {
        cell.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } }
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3D8B52' } }
        cell.border = {
          top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' }
        }
      })

      targetProfiles.forEach((student, studentIdx) => {
        const studentMap = attendanceMap.get(student.id) || new Map<string, string>()
        const rowData: any[] = [
          studentIdx + 1,
          student.nama_lengkap,
          student.nama_kampus || '-',
          student.nim_nisn || '-',
        ]

        let totalH = 0
        let totalI = 0
        let totalA = 0
        let totalWorkingDays = 0

        for (let d = 1; d <= daysInMonth; d++) {
          const dateStr = `${recapYear}-${String(recapMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
          const status = studentMap.get(dateStr)
          
          const dateObj = new Date(recapYear, recapMonth, d)
          const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6
          const isHoliday = holidayDates.has(dateStr)

          if (isWeekend || isHoliday) {
            rowData.push('L')
          } else {
            totalWorkingDays++
            if (status === 'hadir') {
              rowData.push('H')
              totalH++
            } else if (status === 'izin' || status === 'izin kampus') {
              rowData.push('I')
              totalI++
            } else {
              const todayStr = new Date().toISOString().split('T')[0]
              if (dateStr <= todayStr) {
                rowData.push('A')
                totalA++
              } else {
                rowData.push('-')
              }
            }
          }
        }

        rowData.push(totalH, totalI, totalA)
        const percent = totalWorkingDays > 0 ? Math.round((totalH / totalWorkingDays) * 100) : 0
        rowData.push(`${percent}%`)

        const row = worksheet.addRow(rowData)
        row.height = 30
        
        row.eachCell((cell, colIdx) => {
          cell.border = {
            top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' }
          }
          cell.font = { size: 11 }
          
          if (colIdx === 2 || colIdx === 3) {
            cell.alignment = { horizontal: 'left', vertical: 'middle' }
          } else {
            cell.alignment = { horizontal: 'center', vertical: 'middle' }
          }

          if (colIdx >= 5 && colIdx < 5 + daysInMonth) {
            const val = cell.value
            if (val === 'H') {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F4EA' } }
              cell.font = { color: { argb: 'FF137333' }, bold: true, size: 11 }
            } else if (val === 'I') {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDF4E3' } }
              cell.font = { color: { argb: 'FFB06000' }, bold: true, size: 11 }
            } else if (val === 'A') {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCE8E6' } }
              cell.font = { color: { argb: 'FFC5221F' }, bold: true, size: 11 }
            } else if (val === 'L') {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F3F4' } }
              cell.font = { color: { argb: 'FF5F6368' }, size: 11 }
            }
          }
        })
      })

      worksheet.getColumn(1).width = 6
      worksheet.getColumn(2).width = 30
      worksheet.getColumn(3).width = 24
      worksheet.getColumn(4).width = 16
      for (let i = 1; i <= daysInMonth; i++) {
        worksheet.getColumn(4 + i).width = 4.8
      }
      worksheet.getColumn(5 + daysInMonth).width = 11
      worksheet.getColumn(6 + daysInMonth).width = 11
      worksheet.getColumn(7 + daysInMonth).width = 11
      worksheet.getColumn(8 + daysInMonth).width = 14

      const lastRow = worksheet.lastRow?.number || 5
      const footerStart = lastRow + 5
      
      const sigColIndex = 4 + daysInMonth - 2
      const startMergeLetter = getColLetter(sigColIndex - 4 + 1)
      const endMergeLetter = getColLetter(sigColIndex + 3 + 1)

      const mergeAndSet = (rowOff: number, value: string, font: any) => {
        worksheet.mergeCells(`${startMergeLetter}${footerStart + rowOff}:${endMergeLetter}${footerStart + rowOff}`)
        const cell = worksheet.getCell(`${startMergeLetter}${footerStart + rowOff}`)
        cell.value = value
        cell.font = font
        cell.alignment = { horizontal: 'center' }
      }

      mergeAndSet(0, 'PAMONG', { bold: true, size: 11 })
      mergeAndSet(4, pamongNama, { bold: true, underline: true, size: 11 })
      mergeAndSet(5, pamongPangkat, { size: 11 })
      mergeAndSet(6, pamongNip.startsWith('NIP:') ? pamongNip : `NIP: ${pamongNip}`, { size: 11 })

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Rekap_Presensi_Magang_${months[recapMonth]}_${recapYear}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      setShowRecapModal(false)
    } catch (err: any) {
      console.error(err)
      alert('Gagal mencetak rekap bulanan: ' + (err.message || err))
    } finally {
      setGeneratingRecap(false)
    }
  }

  const filteredStudents = students.filter((student) => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return true
    return (
      student.nama_lengkap?.toLowerCase().includes(query) ||
      student.nama_kampus?.toLowerCase().includes(query)
    )
  })

  const studentsFinished = students.filter((student) => {
    if (!student.tanggal_selesai) return false
    const endDate = new Date(student.tanggal_selesai + 'T23:59:59')
    const today = new Date()
    return today > endDate
  })

  const isFinished = (student: Student) => {
    if (!student.tanggal_selesai) return false
    const endDate = new Date(student.tanggal_selesai + 'T23:59:59')
    const today = new Date()
    return today > endDate
  }

  const handleSelectFinishedStudents = () => {
    const finishedIds = studentsFinished.map((s) => s.id)
    setSelectedStudentIds(finishedIds)
  }

  const handleDeleteSelectedStudents = async () => {
    const selectedCount = selectedStudentIds.length
    if (selectedCount === 0) return

    const confirmDelete = confirm(
      `Apakah Anda yakin ingin menghapus ${selectedCount} akun mahasiswa terpilih secara permanen?\n\nSemua data profil dan riwayat absensi mereka akan dihapus dari database.`
    )
    if (!confirmDelete) return

    setDeletingSelected(true)

    try {
      const result = await deleteStudentsBulk(selectedStudentIds)

      if (result.error) {
        alert(`Gagal menghapus mahasiswa terpilih: ${result.error}`)
      } else {
        alert(`${selectedCount} akun mahasiswa berhasil dihapus dari database.`)
        // Clear selection
        setSelectedStudentIds([])
        // Refresh the student list
        await fetchStudents()
      }
    } catch (err: any) {
      console.error(err)
      alert(`Terjadi kesalahan: ${err.message || err}`)
    } finally {
      setDeletingSelected(false)
    }
  }

  const allVisibleSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((s) => selectedStudentIds.includes(s.id))

  const someVisibleSelected =
    filteredStudents.length > 0 &&
    filteredStudents.some((s) => selectedStudentIds.includes(s.id))

  const toggleSelectStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      const visibleIds = filteredStudents.map((s) => s.id)
      setSelectedStudentIds((prev) => prev.filter((id) => !visibleIds.includes(id)))
    } else {
      const visibleIds = filteredStudents.map((s) => s.id)
      setSelectedStudentIds((prev) => {
        const newSelection = [...prev]
        visibleIds.forEach((id) => {
          if (!newSelection.includes(id)) {
            newSelection.push(id)
          }
        })
        return newSelection
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="animate-spin w-8 h-8 text-primary-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-neutral-500 text-sm">Memuat daftar mahasiswa...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">Daftar Mahasiswa Magang</h1>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <p className="text-neutral-500 text-sm">
              {searchQuery.trim() ? (
                <>Menampilkan {filteredStudents.length} dari {students.length} mahasiswa</>
              ) : (
                <>{students.length} mahasiswa terdaftar</>
              )}
            </p>
            {studentsFinished.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 border border-amber-200/60 rounded-full px-2.5 py-0.5 animate-fade-in font-medium">
                ⏳ {studentsFinished.length} selesai magang
                <button
                  type="button"
                  onClick={handleSelectFinishedStudents}
                  className="underline font-bold text-amber-800 hover:text-amber-950 transition-colors ml-1 cursor-pointer"
                  title={`Pilih ${studentsFinished.length} mahasiswa selesai`}
                >
                  Pilih
                </button>
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleBulkExportIndividualExcel}
            disabled={exportingBulk || students.filter((s) => selectedStudentIds.includes(s.id)).length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-55 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {exportingBulk ? (
              <>
                <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Mengekspor ({exportingProgress}/{students.filter((s) => selectedStudentIds.includes(s.id)).length})...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Excel Terpilih ({students.filter((s) => selectedStudentIds.includes(s.id)).length})
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => setShowRecapModal(true)}
            disabled={students.filter((s) => selectedStudentIds.includes(s.id)).length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-55 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Cetak Rekap Bulanan ({students.filter((s) => selectedStudentIds.includes(s.id)).length})
          </button>

          <button
            type="button"
            onClick={handleDeleteSelectedStudents}
            disabled={deletingSelected || selectedStudentIds.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-55 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {deletingSelected ? (
              <>
                <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Menghapus...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Hapus Terpilih ({selectedStudentIds.length})
              </>
            )}
          </button>
        </div>
      </div>



      {students.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-700 mb-1">Belum Ada Mahasiswa</h3>
          <p className="text-sm text-neutral-500">Mahasiswa magang yang sudah terdaftar akan muncul di sini.</p>
        </div>
      ) : (
        <>
          {/* Search Input and Filters */}
          <div className="mb-6 flex flex-col sm:flex-row items-center gap-4 animate-fade-in">
            <div className="relative flex-1 w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Cari berdasarkan nama atau kampus/sekolah..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-neutral-400 hover:text-neutral-600"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="glass-card p-12 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-700 mb-1">Hasil Pencarian Tidak Ditemukan</h3>
              <p className="text-sm text-neutral-500">Tidak ada mahasiswa magang dengan nama atau kampus &ldquo;{searchQuery}&rdquo;.</p>
            </div>
          ) : (
            <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50">
                  <th className="px-4 py-4 text-center w-12">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      ref={(el) => {
                        if (el) {
                          el.indeterminate = someVisibleSelected && !allVisibleSelected
                        }
                      }}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 cursor-pointer transition-all"
                    />
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">No</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Nama Lengkap</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Kampus/Sekolah</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">NIM/NISN</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Periode Magang</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Bidang</th>
                  <th className="px-5 py-4 text-center text-xs font-semibold text-neutral-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredStudents.map((student, index) => (
                  <tr key={student.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.includes(student.id)}
                        onChange={() => toggleSelectStudent(student.id)}
                        className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 cursor-pointer transition-all"
                      />
                    </td>
                    <td className="px-5 py-4 text-sm text-neutral-600">{index + 1}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary-700 font-bold text-xs">
                            {student.nama_lengkap?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center flex-wrap gap-1.5">
                            <span className="text-sm font-semibold text-neutral-800">{student.nama_lengkap}</span>
                            {isFinished(student) && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200" title="Periode magang telah berakhir. Silakan ekspor data absensi ke Excel.">
                                ⏳ Selesai Magang
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-neutral-600">{student.nama_kampus}</td>
                    <td className="px-5 py-4 text-sm text-neutral-600 tabular-nums">{student.nim_nisn}</td>
                    <td className="px-5 py-4 text-sm text-neutral-600">
                      {student.tanggal_mulai && student.tanggal_selesai ? (
                        <span className="block text-xs font-medium text-neutral-700">
                          {formatDateSimple(student.tanggal_mulai)} <span className="text-neutral-400 font-light">s/d</span> {formatDateSimple(student.tanggal_selesai)}
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-400 italic">Belum diatur</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium bg-primary-50 text-primary-700">
                        {student.bidang?.nama_bidang || '-'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenDetail(student)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs font-medium transition-all duration-200"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Lihat Absensi
                        </button>
                        <button
                          onClick={() => exportStudentExcel(student)}
                          disabled={exporting === student.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 text-white text-xs font-medium hover:bg-primary-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {exporting === student.id ? (
                            <>
                              <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Exporting...
                            </>
                          ) : (
                            <>
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Export Excel
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
        </>
      )}

      {/* DETAIL DRAWER (SLIDE-OVER PANEL) */}
      {selectedStudent && mounted && createPortal(
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={handleCloseDetail}
          />
          
          <div className="fixed inset-y-0 right-0 pl-4 max-w-full flex sm:pl-10">
            <div className="w-screen max-w-3xl bg-white shadow-2xl flex flex-col h-full animate-slide-in-right">
              {/* Drawer Header */}
              <div className="p-6 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-start">
                <div>
                  <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Detail Absensi Mahasiswa
                  </span>
                  <h2 className="text-xl font-bold text-neutral-800 mt-2">{selectedStudent.nama_lengkap}</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {selectedStudent.nama_kampus} &bull; NIM: {selectedStudent.nim_nisn}
                  </p>
                  {selectedStudent.tanggal_mulai && selectedStudent.tanggal_selesai && (
                    <p className="text-xs font-medium text-primary-700 bg-primary-50 inline-block px-2.5 py-1 rounded-md mt-2">
                      Periode Magang: {formatDateSimple(selectedStudent.tanggal_mulai)} s/d {formatDateSimple(selectedStudent.tanggal_selesai)}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleCloseDetail}
                  className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Drawer Body (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Alert Notifications */}
                {errorMsg && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{errorMsg}</span>
                  </div>
                )}
                {successMsg && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* Add / Edit Form Panel */}
                {(isAdding || isEditing) && (
                  <form onSubmit={handleSaveRecord} className="p-5 rounded-xl border border-primary-100 bg-primary-50/20 space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center border-b border-primary-100 pb-2 mb-2">
                      <h3 className="text-sm font-bold text-primary-800">
                        {isEditing ? 'Edit Absensi Hari Ini' : 'Tambah Absensi Manual'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => { setIsAdding(false); setIsEditing(null); }}
                        className="text-xs text-neutral-500 hover:text-neutral-700"
                      >
                        Batal
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-600 mb-1">Tanggal</label>
                        <input
                          type="date"
                          required
                          value={formTanggal}
                          onChange={(e) => setFormTanggal(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-neutral-600 mb-1">Status Kehadiran</label>
                        <select
                          value={formKeterangan}
                          onChange={(e) => setFormKeterangan(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                        >
                          <option value="hadir">Hadir</option>
                          <option value="izin">Izin</option>
                          <option value="izin kampus">Izin Kampus/Sekolah</option>
                        </select>
                      </div>

                      {formKeterangan === 'hadir' ? (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-semibold text-neutral-600 mb-1">Jam Masuk</label>
                            <input
                              type="time"
                              value={formJamMasuk}
                              onChange={(e) => setFormJamMasuk(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-neutral-600 mb-1">Jam Pulang</label>
                            <input
                              type="time"
                              value={formJamPulang}
                              onChange={(e) => setFormJamPulang(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs font-semibold text-neutral-600 mb-1">Alasan Izin</label>
                          <input
                            type="text"
                            required
                            placeholder="Masukkan alasan izin..."
                            value={formAlasanIzin}
                            onChange={(e) => setFormAlasanIzin(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 transition-colors shadow-sm"
                      >
                        {isEditing ? 'Simpan Perubahan' : 'Tambah Absensi'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Data Table resembling Excel Preview */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <h3 className="text-sm font-bold text-neutral-700 flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                      Daftar Absensi (Pratinjau Data Excel)
                    </h3>
                    
                    <div className="flex flex-wrap gap-2">
                      {!isAdding && !isEditing && (
                        <button
                          onClick={handleStartAdd}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-primary-200 text-primary-700 bg-primary-50/50 hover:bg-primary-50 text-xs font-semibold transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Tambah Absensi Manual
                        </button>
                      )}
                      <button
                        onClick={() => exportStudentExcel(selectedStudent)}
                        disabled={exporting === selectedStudent.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Unduh Excel (.xlsx)
                      </button>
                    </div>
                  </div>

                  {loadingRecords ? (
                    <div className="text-center py-12">
                      <svg className="animate-spin w-6 h-6 text-primary-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="text-xs text-neutral-500">Memuat data absensi...</span>
                    </div>
                  ) : records.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-neutral-200 rounded-xl">
                      <p className="text-sm text-neutral-500">Belum ada riwayat absensi untuk mahasiswa ini.</p>
                    </div>
                  ) : (
                    <div className="border border-neutral-200 rounded-xl overflow-x-auto shadow-sm">
                      <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                          <tr className="bg-neutral-50 border-b border-neutral-200">
                            <th className="px-4 py-3 text-xs font-bold text-neutral-600 uppercase w-12 text-center">No</th>
                            <th className="px-4 py-3 text-xs font-bold text-neutral-600 uppercase">Hari / Tanggal</th>
                            <th className="px-4 py-3 text-xs font-bold text-neutral-600 uppercase text-center">Jam Masuk</th>
                            <th className="px-4 py-3 text-xs font-bold text-neutral-600 uppercase text-center">Jam Pulang</th>
                            <th className="px-4 py-3 text-xs font-bold text-neutral-600 uppercase">Keterangan</th>
                            <th className="px-4 py-3 text-xs font-bold text-neutral-600 uppercase text-center w-28">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {records.map((record, idx) => (
                            <tr key={record.id} className="hover:bg-neutral-50/40 text-sm">
                              <td className="px-4 py-3 text-center text-neutral-500">{idx + 1}</td>
                              <td className="px-4 py-3 font-medium text-neutral-800">{formatDate(record.tanggal)}</td>
                              <td className="px-4 py-3 text-center tabular-nums text-neutral-600">{formatTime(record.jam_masuk)}</td>
                              <td className="px-4 py-3 text-center tabular-nums text-neutral-600">{formatTime(record.jam_pulang)}</td>
                              <td className="px-4 py-3">
                                {record.keterangan === 'hadir' ? (
                                  <span className="inline-flex px-2 py-0.5 text-xs rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-100">
                                    Hadir
                                  </span>
                                ) : (
                                  <span className="inline-flex px-2 py-0.5 text-xs rounded-full bg-amber-50 text-amber-700 font-medium border border-amber-100">
                                    {record.keterangan === 'izin' ? 'Izin' : 'Izin Kampus/Sekolah'} ({record.alasan_izin || '-'})
                                    {record.bukti_izin_url && (
                                      <a
                                        href={record.bukti_izin_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-2 inline-flex items-center gap-1 text-[10px] text-primary-600 hover:text-primary-800 hover:underline font-semibold bg-white border border-primary-100 px-1.5 py-0.5 rounded shadow-2xs transition-all"
                                      >
                                        📄 Bukti
                                      </a>
                                    )}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex justify-center gap-2">
                                  <button
                                    onClick={() => handleStartEdit(record)}
                                    className="p-1 rounded text-blue-600 hover:bg-blue-50 transition-colors"
                                    title="Edit"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteRecord(record.id)}
                                    className="p-1 rounded text-red-600 hover:bg-red-50 transition-colors"
                                    title="Hapus"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-neutral-100 bg-neutral-50/50 flex justify-end">
                <button
                  onClick={handleCloseDetail}
                  className="px-5 py-2.5 rounded-xl bg-neutral-200 text-neutral-800 text-xs font-semibold hover:bg-neutral-300 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL CETAK REKAP BULANAN */}
      {showRecapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowRecapModal(false)} />
          <div className="bg-white rounded-2xl shadow-xl border border-neutral-100 max-w-sm w-full p-6 relative z-10 animate-fade-in-scale">
            <h3 className="text-lg font-bold text-neutral-800 mb-4">Cetak Rekap Bulanan</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Pilih Bulan</label>
                <select
                  value={recapMonth}
                  onChange={(e) => setRecapMonth(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                >
                  {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((m, idx) => (
                    <option key={idx} value={idx}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Pilih Tahun</label>
                <select
                  value={recapYear}
                  onChange={(e) => setRecapYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                >
                  {[2025, 2026, 2027, 2028].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs space-y-1">
              <p>Mencetak rekap untuk <strong>{students.filter((s) => selectedStudentIds.includes(s.id)).length} mahasiswa</strong> terpilih.</p>
              {searchQuery.trim() && (
                <p className="text-[10px] text-emerald-600">Filter pencarian aktif: &ldquo;{searchQuery}&rdquo;</p>
              )}
            </div>

            <div className="flex gap-2.5 mt-6 justify-end">
              <button
                type="button"
                onClick={() => setShowRecapModal(false)}
                className="px-4 py-2 border border-neutral-200 rounded-lg text-sm text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExportMonthlyRecap}
                disabled={generatingRecap}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
              >
                {generatingRecap ? (
                  <>
                    <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Membuat...
                  </>
                ) : (
                  'Unduh Excel'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
