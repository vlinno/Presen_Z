'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Bidang {
  id: number
  nama_bidang: string
  nama_kabid: string
  nip_kabid: string
  golongan_kabid: string | null
  deskripsi_tugas: string
}

interface Staff {
  id: number
  nama_staf: string
  jabatan: string
  nip_staf: string
  bidang_id: number
  parent_id: number | null
  golongan?: string | null
}

interface Pimpinan {
  id: number
  nama: string
  nip: string
  golongan: string
  jabatan: string
}

interface NodeData {
  nama: string
  jabatan: string
  nip: string
  golongan: string
  theme: string
}

// Default Fallbacks
const KEPALA_BADAN_DEFAULT: Pimpinan = {
  id: 1,
  nama: 'AHMAD MUZAIYIN, S.Sos., MA',
  nip: '19740328 199311 1 001',
  golongan: 'Pembina Utama Muda (IV/c)',
  jabatan: 'Kepala Badan',
}

const SEKRETARIS_BADAN_DEFAULT: NodeData = {
  nama: 'Ir. H. UMAR RAHMANI, ST., MT',
  jabatan: 'Plt. Sekretaris Badan',
  nip: '19730308 199303 1 006',
  golongan: 'Pembina (IV/a)',
  theme: 'from-sky-600 to-sky-700 text-white',
}

const FUNGSIONAL_MEMBERS_DEFAULT = [
  { nama: 'RUSIANTI, S. AP', jabatan: 'Analisis Kebijakan Ahli Muda', golongan: 'Penata Tk. I (III/d)', nip: '19691126 199303 2 004' },
  { nama: 'NOOR BAITIE HAMSAN, S.Ag', jabatan: 'Analisis Kebijakan Ahli Muda', golongan: 'Penata Tk. I (III/d)', nip: '19740619 199503 2 002' },
  { nama: 'NOOR JANNAH, SST', jabatan: 'Analisis Kebijakan Ahli Muda', golongan: 'Penata Tk. I (III/d)', nip: '19710517 199203 2 005' },
  { nama: 'EKANTYASRINI, S.Sos, SE', jabatan: 'Analisis Kebijakan Ahli Muda', golongan: 'Penata Tk. I (III/d)', nip: '19681011 199303 2 005' },
  { nama: 'YANI PRASETIAHATI, M.Pd', jabatan: 'Analisis Kebijakan Ahli Muda', golongan: 'Pembina (IV/a)', nip: '19730128 199903 2 007' },
]

interface OrgCardProps {
  title: string
  name: string
  nip: string
  golongan: string
  colorTheme?: string
  onClick?: () => void
  avatarEmoji?: string
  editMode?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

function OrgCard({ title, name, nip, golongan, colorTheme = 'gray', onClick, avatarEmoji, editMode, onEdit, onDelete }: OrgCardProps) {
  let headerBg = 'bg-neutral-100 text-neutral-800 border-neutral-200'
  let cardBorder = 'border-neutral-200 hover:border-neutral-300 hover:shadow-lg'
  let avatarBg = 'bg-neutral-100 text-neutral-700'

  if (colorTheme === 'red') {
    headerBg = 'bg-gradient-to-r from-red-600 to-rose-600 text-white'
    cardBorder = 'border-red-200 hover:border-red-400 hover:shadow-red-100/50 hover:shadow-xl'
    avatarBg = 'bg-rose-100 text-rose-700'
  } else if (colorTheme === 'blue') {
    headerBg = 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
    cardBorder = 'border-blue-200 hover:border-blue-400 hover:shadow-blue-100/50 hover:shadow-xl'
    avatarBg = 'bg-blue-100 text-blue-700'
  } else if (colorTheme === 'sky') {
    headerBg = 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white'
    cardBorder = 'border-sky-200 hover:border-sky-400 hover:shadow-sky-100/50 hover:shadow-xl'
    avatarBg = 'bg-sky-100 text-sky-700'
  } else if (colorTheme === 'green') {
    headerBg = 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
    cardBorder = 'border-emerald-200 hover:border-emerald-400 hover:shadow-emerald-100/50 hover:shadow-xl'
    avatarBg = 'bg-emerald-100 text-emerald-700'
  } else if (colorTheme === 'orange' || colorTheme === 'amber') {
    headerBg = 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
    cardBorder = 'border-amber-200 hover:border-amber-400 hover:shadow-amber-100/50 hover:shadow-xl'
    avatarBg = 'bg-amber-100 text-amber-700'
  } else if (colorTheme === 'brown') {
    headerBg = 'bg-gradient-to-r from-orange-800 to-amber-800 text-white'
    cardBorder = 'border-orange-100 hover:border-orange-300 hover:shadow-orange-100/30'
    avatarBg = 'bg-orange-100 text-orange-800'
  }

  const hasNip = nip && nip !== '-' && nip !== ''

  return (
    <div
      onClick={onClick}
      className={`w-60 bg-white rounded-xl shadow-sm border overflow-hidden transition-all duration-300 hover:scale-[1.03] cursor-pointer flex flex-col text-left group relative ${cardBorder}`}
    >
      {/* Edit Mode Buttons Overlay */}
      {editMode && (
        <div className="absolute top-1 right-1 flex items-center gap-1.5 z-30">
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="p-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white shadow-xs cursor-pointer transition-colors"
              title="Edit Data"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="p-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white shadow-xs cursor-pointer transition-colors"
              title="Hapus Anggota"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Header with Title/Jabatan */}
      <div className={`px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-wider text-center select-none ${headerBg}`}>
        {title}
      </div>
      
      {/* Body with Name, Golongan, NIP */}
      <div className="p-3.5 flex items-center gap-3 bg-white hover:bg-neutral-50/50 transition-colors flex-1">
        {/* Avatar Placeholder */}
        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 select-none ${avatarBg}`}>
          {avatarEmoji ? avatarEmoji : (name ? name.charAt(0) : '?')}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <h4 className="font-bold text-[10.5px] text-neutral-800 leading-snug group-hover:text-primary-600 transition-colors break-words">
            {name}
          </h4>
          {golongan && golongan !== '-' && (
            <p className="text-[8.5px] text-neutral-500 mt-1 font-semibold leading-none">{golongan}</p>
          )}
          {hasNip && (
            <p className="text-[8.5px] text-neutral-400 mt-0.5 leading-none">
              {nip.startsWith('NIP') ? nip : `NIP. ${nip}`}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

interface CollapsibleBranchProps {
  parentCard: React.ReactNode
  isExpanded: boolean
  onToggle: () => void
  staffCount: number
  children: React.ReactNode
  lineHeightClass?: string
  editMode?: boolean
}

function CollapsibleBranch({ parentCard, isExpanded, onToggle, staffCount, children, lineHeightClass = 'h-4', editMode = false }: CollapsibleBranchProps) {
  if (staffCount === 0) {
    if (editMode) {
      return (
        <div className="flex flex-col items-center w-full animate-fade-in">
          {parentCard}
          <div className={`w-0.5 ${lineHeightClass} bg-neutral-300`}></div>
          <div className="flex flex-col items-center w-full">
            {children}
          </div>
        </div>
      )
    }
    return <div className="flex flex-col items-center">{parentCard}</div>
  }

  return (
    <div className="flex flex-col items-center">
      {parentCard}
      
      {/* Toggle Button Container */}
      {!editMode && (
        <div className="relative flex flex-col items-center mt-2.5 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggle()
            }}
            className={`px-3 py-1 rounded-full text-[9px] font-bold transition-all duration-200 border flex items-center gap-1 shadow-xs ${
              isExpanded
                ? 'bg-neutral-200 hover:bg-neutral-300 text-neutral-700 border-neutral-300'
                : 'bg-primary-50 hover:bg-primary-100 text-primary-700 border-primary-200'
            }`}
          >
            <span>{isExpanded ? 'Sembunyikan Staf' : `Tampilkan Staf (${staffCount})`}</span>
            <svg
              className={`w-2.5 h-2.5 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}

      {/* Expanded Content */}
      {(isExpanded || editMode) && (
        <div className="flex flex-col items-center animate-fade-in w-full">
          <div className={`w-0.5 ${lineHeightClass} bg-neutral-300`}></div>
          <div className="flex flex-col items-center w-full">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

export default function StrukturPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [bidangList, setBidangList] = useState<Bidang[]>([])
  const [staffMap, setStaffMap] = useState<Record<number, Staff[]>>({})
  const [pimpinan, setPimpinan] = useState<Pimpinan | null>(null)
  const [loading, setLoading] = useState(true)

  // Edit form states
  const [editType, setEditType] = useState<'pimpinan' | 'bidang' | 'staf' | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  // Form fields
  const [formNama, setFormNama] = useState('')
  const [formNip, setFormNip] = useState('')
  const [formGolongan, setFormGolongan] = useState('')
  const [formJabatan, setFormJabatan] = useState('')
  const [formBidangId, setFormBidangId] = useState<number>(1)
  const [formParentId, setFormParentId] = useState<number | null>(null)
  const [formNamaBidang, setFormNamaBidang] = useState('')
  const [formDeskripsiTugas, setFormDeskripsiTugas] = useState('')

  // Expandable sections state
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    fungsional: false,
    program: false,
    keuangan: false,
    umum: false,
    ideologi: false,
    ketahanan: false,
    politik: false,
    kewaspadaan: false,
  })

  const toggleSection = (section: string) => {
    setExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Details Modal State
  const [modalTitle, setModalTitle] = useState('')
  const [modalSubtitle, setModalSubtitle] = useState('')
  const [modalNip, setModalNip] = useState('')
  const [modalGolongan, setModalGolongan] = useState('')
  const [modalDescription, setModalDescription] = useState('')
  const [modalStaff, setModalStaff] = useState<Staff[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Delete confirmation modal state
  const [deleteConfirmStaf, setDeleteConfirmStaf] = useState<Staff | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = async () => {
    const supabase = createClient()

    // Get current user role
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      if (profile && profile.role === 'admin') {
        setIsAdmin(true)
      }
    }

    // Get pimpinan (Kepala Badan)
    const { data: pimpinanData } = await supabase
      .from('pimpinan_badan')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (pimpinanData) {
      setPimpinan(pimpinanData)
    }

    // Get bidang_kesbangpol
    const { data: bidangData } = await supabase
      .from('bidang_kesbangpol')
      .select('*')
      .order('id')

    // Get staf_bidang
    const { data: staffData } = await supabase
      .from('staf_bidang')
      .select('*')
      .order('id')

    if (bidangData) setBidangList(bidangData)

    if (staffData) {
      const map: Record<number, Staff[]> = {}
      staffData.forEach((s) => {
        if (!map[s.bidang_id]) map[s.bidang_id] = []
        map[s.bidang_id].push(s)
      })
      setStaffMap(map)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen || editType !== null || deleteConfirmStaf !== null) {
      // Prevent scrolling on body for all devices including iOS
      document.body.style.overflow = 'hidden'
      // Add touch-action none to root element to prevent pull-to-refresh and swipe
      document.documentElement.style.overscrollBehavior = 'none'
    } else {
      document.body.style.overflow = 'unset'
      document.documentElement.style.overscrollBehavior = 'auto'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
      document.documentElement.style.overscrollBehavior = 'auto'
    }
  }, [isModalOpen, editType, deleteConfirmStaf])

  // Action Click Handlers
  const handleEditPimpinanClick = (p: Pimpinan) => {
    setEditType('pimpinan')
    setEditingId(p.id)
    setFormNama(p.nama)
    setFormNip(p.nip)
    setFormGolongan(p.golongan)
    setFormJabatan(p.jabatan || 'Kepala Badan')
  }

  const handleEditBidangClick = (b: Bidang) => {
    setEditType('bidang')
    setEditingId(b.id)
    setFormNamaBidang(b.nama_bidang)
    setFormNama(b.nama_kabid)
    setFormNip(b.nip_kabid)
    setFormGolongan(b.golongan_kabid || '')
    setFormDeskripsiTugas(b.deskripsi_tugas)
  }

  const handleEditStafClick = (s: Staff) => {
    setEditType('staf')
    setEditingId(s.id)
    setFormNama(s.nama_staf)
    setFormNip(s.nip_staf)
    setFormGolongan(s.golongan || '')
    setFormJabatan(s.jabatan)
    setFormBidangId(s.bidang_id)
    setFormParentId(s.parent_id)
  }

  const handleAddStafClick = (bidangId: number, parentId: number | null = null, defaultJabatan = '') => {
    setEditType('staf')
    setEditingId(null)
    setFormNama('')
    setFormNip('')
    setFormGolongan('')
    setFormJabatan(defaultJabatan)
    setFormBidangId(bidangId)
    setFormParentId(parentId)
  }

  const handleDeleteStaf = (staff: Staff) => {
    setDeleteConfirmStaf(staff)
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirmStaf) return
    setDeleting(true)
    const supabase = createClient()
    try {
      const { error } = await supabase
        .from('staf_bidang')
        .delete()
        .eq('id', deleteConfirmStaf.id)

      if (error) throw error

      setDeleteConfirmStaf(null)
      fetchData()
    } catch (err: any) {
      console.error(err)
      alert(`Gagal menghapus staf: ${err.message || err}`)
    } finally {
      setDeleting(false)
    }
  }

  const handleSaveStructure = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()

    try {
      if (editType === 'pimpinan') {
        const { error } = await supabase
          .from('pimpinan_badan')
          .update({
            nama: formNama,
            nip: formNip,
            golongan: formGolongan,
            jabatan: formJabatan
          })
          .eq('id', editingId)

        if (error) throw error
        alert('Data Kepala Badan berhasil diperbarui!')
      } else if (editType === 'bidang') {
        const { error } = await supabase
          .from('bidang_kesbangpol')
          .update({
            nama_bidang: formNamaBidang,
            nama_kabid: formNama,
            nip_kabid: formNip,
            golongan_kabid: formGolongan,
            deskripsi_tugas: formDeskripsiTugas
          })
          .eq('id', editingId)

        if (error) throw error
        alert('Data Bidang berhasil diperbarui!')
      } else if (editType === 'staf') {
        if (editingId) {
          // Update staff
          const { error } = await supabase
            .from('staf_bidang')
            .update({
              nama_staf: formNama,
              nip_staf: formNip,
              golongan: formGolongan,
              jabatan: formJabatan,
              bidang_id: formBidangId,
              parent_id: formParentId
            })
            .eq('id', editingId)

          if (error) throw error
          alert('Data staf berhasil diperbarui!')
        } else {
          // Add staff
          const { error } = await supabase
            .from('staf_bidang')
            .insert({
              nama_staf: formNama,
              nip_staf: formNip,
              golongan: formGolongan,
              jabatan: formJabatan,
              bidang_id: formBidangId,
              parent_id: formParentId
            })

          if (error) throw error
          alert('Staf baru berhasil ditambahkan!')
        }
      }

      setEditType(null)
      fetchData()
    } catch (err: any) {
      console.error(err)
      alert(`Gagal menyimpan data: ${err.message || err}`)
    } finally {
      setSaving(false)
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
          <p className="text-neutral-500 text-sm">Memuat struktur organisasi...</p>
        </div>
      </div>
    )
  }

  // Dynamic calculations of structure nodes
  const getSubbagDataDynamic = (keyword: string, defaultTitle: string, defaultName: string, defaultNip: string, defaultGolongan: string) => {
    const sekretariatStaff = staffMap[1] || []
    
    // Find Kasubbag by checking if parent_id is null and jabatan/name matches
    const kasubbag = sekretariatStaff.find(s => s.parent_id === null && s.jabatan.toLowerCase().includes(keyword.toLowerCase()))
    
    // Find subordinates
    const staff = kasubbag ? sekretariatStaff.filter(s => s.parent_id === kasubbag.id) : []

    return {
      rawObj: kasubbag || null,
      title: kasubbag?.jabatan?.toUpperCase() || defaultTitle,
      name: kasubbag?.nama_staf || defaultName,
      nip: kasubbag?.nip_staf || defaultNip,
      golongan: kasubbag?.golongan || defaultGolongan,
      staff
    }
  }

  const subbagProgram = getSubbagDataDynamic('program', 'KASUBBAG PENYUSUNAN PROGRAM DAN ANGGARAN', 'MARIA ULFAH, SE', '19870306 201001 2 004', 'Penata (III/c)')
  const subbagKeuangan = getSubbagDataDynamic('keuangan', 'KASUBBAG KEUANGAN', 'DIAH SYAFA\'AH, ST', '19761012 201001 2 008', 'Penata Tk. I (III/d)')
  const subbagUmum = getSubbagDataDynamic('umum', 'KASUBBAG UMUM DAN KEPEGAWAIAN', 'VIVI APRIANY, SE., M.M', '19810401 200903 2 009', 'Pembina (IV/a)')

  const sekretariatStaff = staffMap[1] || []
  const renderedKasubbagIds = [
    subbagProgram.rawObj?.id,
    subbagKeuangan.rawObj?.id,
    subbagUmum.rawObj?.id
  ].filter(Boolean) as number[]

  const otherSekretariatStaff = sekretariatStaff.filter(s => 
    s.parent_id === null && 
    !renderedKasubbagIds.includes(s.id)
  )

  const totalSekretariatCols = 3 + otherSekretariatStaff.length
  const horizontalLinePadding = `${100 / (2 * totalSekretariatCols)}%`

  const getBidangData = (id: number) => {
    const b = bidangList.find(item => item.id === id)
    if (!b) return null

    return {
      ...b,
      golongan_kabid: b.golongan_kabid || 'Pembina (IV/a)'
    }
  }

  const getBidangStaff = (bidangId: number): Staff[] => {
    return staffMap[bidangId] || []
  }

  const bidangIdeologi = getBidangData(2)
  const bidangKetahanan = getBidangData(4)
  const bidangPolitik = getBidangData(3)
  const bidangKewaspadaan = getBidangData(5)

  // Fungsional dynamic check
  const fungsionalStaff = staffMap[99] || []
  const hasFungsionalDb = fungsionalStaff.length > 0
  const fungsionalDisplayList = hasFungsionalDb ? fungsionalStaff : FUNGSIONAL_MEMBERS_DEFAULT.map((m, idx) => ({
    id: idx,
    nama_staf: m.nama,
    jabatan: m.jabatan,
    nip_staf: m.nip,
    golongan: m.golongan,
    bidang_id: 99,
    parent_id: null
  }))

  const openModal = (title: string, name: string, nip: string, golongan: string, desc: string, staff: Staff[]) => {
    setModalTitle(title)
    setModalSubtitle(name)
    setModalNip(nip)
    setModalGolongan(golongan)
    setModalDescription(desc)
    setModalStaff(staff)
    setIsModalOpen(true)
  }

  return (
    <>
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="text-center mb-10 relative">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-semibold mb-4 shadow-sm">
          📜 Keputusan Menteri Dalam Negeri Nomor 100 - 441 Tahun 2019
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900 tracking-tight mb-2">
          Struktur Organisasi
        </h1>
        <p className="text-neutral-500 text-sm max-w-xl mx-auto font-medium mb-4">
          Badan Kesatuan Bangsa dan Politik Kota Banjarmasin
        </p>

        {/* Admin Edit Mode Toggle */}
        {isAdmin && (
          <div className="flex justify-center mt-3 animate-fade-in">
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
                editMode 
                  ? 'bg-neutral-800 hover:bg-neutral-900 text-white' 
                  : 'bg-primary-600 hover:bg-primary-700 text-white'
              }`}
            >
              <svg className={`w-4 h-4 ${editMode ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {editMode ? 'Keluar Mode Edit' : 'Aktifkan Mode Edit'}
            </button>
          </div>
        )}
      </div>

      {/* ORGANIZATIONAL HIERARCHICAL TREE (Desktop: md & above) */}
      <div className="hidden md:block w-full overflow-x-auto pb-8 scrollbar-thin">
        <div 
          className="flex flex-col items-center mx-auto relative px-8"
          style={{ 
            minWidth: `${(1 + totalSekretariatCols) * 240 + totalSekretariatCols * 24 + 64}px`,
            width: 'max-content'
          }}
        >
          {/* Tier 1: Kepala Badan */}
          <div className="relative z-10">
            <OrgCard
              title="KEPALA BADAN"
              name={pimpinan?.nama || KEPALA_BADAN_DEFAULT.nama}
              nip={pimpinan?.nip || KEPALA_BADAN_DEFAULT.nip}
              golongan={pimpinan?.golongan || KEPALA_BADAN_DEFAULT.golongan}
              colorTheme="red"
              avatarEmoji="👤"
              onClick={() => openModal('Kepala Badan Kesbangpol', pimpinan?.nama || KEPALA_BADAN_DEFAULT.nama, pimpinan?.nip || KEPALA_BADAN_DEFAULT.nip, pimpinan?.golongan || KEPALA_BADAN_DEFAULT.golongan, 'Memimpin dan merumuskan program kerja Badan Kesatuan Bangsa dan Politik Kota Banjarmasin.', [])}
              editMode={editMode}
              onEdit={() => handleEditPimpinanClick(pimpinan || KEPALA_BADAN_DEFAULT)}
            />
          </div>

          {/* Line 1: Kepala Badan down */}
          <div className="w-0.5 h-8 bg-neutral-300"></div>

          {/* Horizontal split under Kepala Badan */}
          <div 
            className="relative w-full"
            style={{ maxWidth: `${Math.max(1240, (1 + totalSekretariatCols) * 240 + totalSekretariatCols * 24)}px` }}
          >
            {/* Main horizontal line */}
            <div 
              className="absolute top-0 h-0.5 bg-neutral-300"
              style={{ 
                left: `${50 / (1 + totalSekretariatCols)}%`, 
                right: `${100 - (100 * (2 + totalSekretariatCols)) / (2 * (1 + totalSekretariatCols))}%` 
              }}
            ></div>

            <div 
              className="grid gap-6 w-full relative z-10"
              style={{ gridTemplateColumns: `repeat(${1 + totalSekretariatCols}, minmax(240px, 1fr))` }}
            >
            {/* COLUMN 1: Jabatan Fungsional */}
            <div className="flex flex-col items-center">
              {/* Vertical connection line */}
              <div className="w-0.5 h-6 bg-neutral-300"></div>
              
              <CollapsibleBranch
                parentCard={
                  <OrgCard
                    title="KELOMPOK JABATAN FUNGSIONAL"
                    name="Jabatan Fungsional"
                    nip=""
                    golongan="Analis & Penyuluh Kebijakan"
                    colorTheme="gray"
                    avatarEmoji="📋"
                    onClick={() => openModal('Kelompok Jabatan Fungsional', 'Analisis Kebijakan Ahli Muda', '-', '-', 'Melakukan analisis, penyuluhan, dan kajian teknis fungsional kebijakan kesatuan bangsa dan politik.', fungsionalDisplayList as Staff[])}
                  />
                }
                isExpanded={expanded.fungsional}
                onToggle={() => toggleSection('fungsional')}
                staffCount={fungsionalDisplayList.length}
                lineHeightClass="h-4"
                editMode={editMode}
              >
                <div className="flex flex-col items-center gap-3 w-full">
                  {fungsionalDisplayList.map((member, idx) => (
                    <div key={member.id} className="flex flex-col items-center w-full">
                      {idx > 0 && <div className="w-0.5 h-3 bg-neutral-300"></div>}
                      <OrgCard
                        title={member.jabatan}
                        name={member.nama_staf}
                        nip={member.nip_staf}
                        golongan={member.golongan || ''}
                        colorTheme="gray"
                        onClick={() => openModal(member.jabatan, member.nama_staf, member.nip_staf, member.golongan || '', 'Melakukan analisis kebijakan dan tugas-tugas fungsional terkait.', [])}
                        editMode={editMode && hasFungsionalDb}
                        onEdit={() => handleEditStafClick(member as Staff)}
                        onDelete={() => handleDeleteStaf(member as Staff)}
                      />
                    </div>
                  ))}
                  {editMode && (
                    <button
                      type="button"
                      onClick={() => handleAddStafClick(99, null, 'Analisis Kebijakan Ahli Muda')}
                      className="mt-2 w-full max-w-60 py-1.5 px-3 rounded-lg border border-dashed border-neutral-300 text-neutral-600 hover:bg-neutral-50 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all"
                    >
                      ➕ Tambah Anggota Fungsional
                    </button>
                  )}
                </div>
              </CollapsibleBranch>
            </div>

            {/* COLUMNS 2, 3, 4: Sekretariat */}
            <div 
              className="flex flex-col items-center w-full relative"
              style={{ gridColumn: `2 / span ${totalSekretariatCols}` }}
            >
              {/* Vertical line to Plt. Sekretaris */}
              <div className="w-0.5 h-6 bg-neutral-300"></div>
              
              {(() => {
                const b1 = getBidangData(1)
                if (!b1) return null
                return (
                  <>
                    <OrgCard
                      title="PLT. SEKRETARIS BADAN"
                      name={b1.nama_kabid || SEKRETARIS_BADAN_DEFAULT.nama}
                      nip={b1.nip_kabid || SEKRETARIS_BADAN_DEFAULT.nip}
                      golongan={b1.golongan_kabid || SEKRETARIS_BADAN_DEFAULT.golongan}
                      colorTheme="sky"
                      avatarEmoji="👔"
                      onClick={() => openModal('Plt. Sekretaris Badan', b1.nama_kabid, b1.nip_kabid, b1.golongan_kabid || '', b1.deskripsi_tugas, [])}
                      editMode={editMode}
                      onEdit={() => handleEditBidangClick(b1)}
                    />
                    {editMode && (
                      <button
                        type="button"
                        onClick={() => handleAddStafClick(1, null, 'Kasubbag ')}
                        className="mt-2.5 py-1 px-3 rounded-lg border border-dashed border-sky-300 text-sky-700 hover:bg-sky-50 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all z-20"
                      >
                        ➕ Tambah Kasubbag / Staf
                      </button>
                    )}
                  </>
                )
              })()}

              {/* Vertical line under Plt. Sekretaris to Subbags */}
              <div className="w-0.5 h-8 bg-neutral-300"></div>

              {/* Subbags Row */}
              <div className="w-full relative">
                {/* Horizontal line connecting Subbags */}
                <div 
                  className="absolute top-0 h-0.5 bg-neutral-300"
                  style={{ left: horizontalLinePadding, right: horizontalLinePadding }}
                ></div>

                <div 
                  className="grid gap-6 w-full"
                  style={{ gridTemplateColumns: `repeat(${totalSekretariatCols}, minmax(0, 1fr))` }}
                >
                  {/* Column 2: Subbag Program */}
                  <div className="flex flex-col items-center">
                    <div className="w-0.5 h-6 bg-neutral-300"></div>
                    <CollapsibleBranch
                      parentCard={
                        <OrgCard
                          title="KASUBBAG PENYUSUNAN PROGRAM DAN ANGGARAN"
                          name={subbagProgram.name}
                          nip={subbagProgram.nip}
                          golongan={subbagProgram.golongan}
                          colorTheme="green"
                          onClick={() => openModal(subbagProgram.title, subbagProgram.name, subbagProgram.nip, subbagProgram.golongan, 'Melakukan koordinasi penyusunan program kerja, anggaran, evaluasi, dan pelaporan badan.', subbagProgram.staff)}
                          editMode={editMode && !!subbagProgram.rawObj}
                          onEdit={() => subbagProgram.rawObj && handleEditStafClick(subbagProgram.rawObj)}
                        />
                      }
                      isExpanded={expanded.program}
                      onToggle={() => toggleSection('program')}
                      staffCount={subbagProgram.staff.length}
                      lineHeightClass="h-4"
                      editMode={editMode}
                    >
                      <div className="flex flex-col items-center gap-3 w-full">
                        {subbagProgram.staff.map((s, idx) => (
                          <div key={s.id} className="flex flex-col items-center w-full">
                            {idx > 0 && <div className="w-0.5 h-3 bg-neutral-300"></div>}
                            <OrgCard
                              title={s.jabatan}
                              name={s.nama_staf}
                              nip={s.nip_staf}
                              golongan={s.golongan || '-'}
                              colorTheme="brown"
                              onClick={() => openModal(s.jabatan, s.nama_staf, s.nip_staf, s.golongan || '', 'Membantu pelaksanaan tugas administrasi dan operasional subbagian program.', [])}
                              editMode={editMode}
                              onEdit={() => handleEditStafClick(s)}
                              onDelete={() => handleDeleteStaf(s)}
                            />
                          </div>
                        ))}
                        {editMode && subbagProgram.rawObj && (
                          <button
                            type="button"
                            onClick={() => handleAddStafClick(1, subbagProgram.rawObj!.id)}
                            className="mt-2 w-full max-w-60 py-1.5 px-3 rounded-lg border border-dashed border-green-300 text-green-700 hover:bg-green-50 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all"
                          >
                            ➕ Tambah Staf Program
                          </button>
                        )}
                      </div>
                    </CollapsibleBranch>
                  </div>

                  {/* Column 3: Subbag Keuangan */}
                  <div className="flex flex-col items-center">
                    <div className="w-0.5 h-6 bg-neutral-300"></div>
                    <CollapsibleBranch
                      parentCard={
                        <OrgCard
                          title="KASUBBAG KEUANGAN"
                          name={subbagKeuangan.name}
                          nip={subbagKeuangan.nip}
                          golongan={subbagKeuangan.golongan}
                          colorTheme="green"
                          onClick={() => openModal(subbagKeuangan.title, subbagKeuangan.name, subbagKeuangan.nip, subbagKeuangan.golongan, 'Melakukan administrasi tata usaha keuangan, pembukuan, pertanggungjawaban, dan perbendaharaan.', subbagKeuangan.staff)}
                          editMode={editMode && !!subbagKeuangan.rawObj}
                          onEdit={() => subbagKeuangan.rawObj && handleEditStafClick(subbagKeuangan.rawObj)}
                        />
                      }
                      isExpanded={expanded.keuangan}
                      onToggle={() => toggleSection('keuangan')}
                      staffCount={subbagKeuangan.staff.length}
                      lineHeightClass="h-4"
                      editMode={editMode}
                    >
                      <div className="flex flex-col items-center gap-3 w-full">
                        {subbagKeuangan.staff.map((s, idx) => (
                          <div key={s.id} className="flex flex-col items-center w-full">
                            {idx > 0 && <div className="w-0.5 h-3 bg-neutral-300"></div>}
                            <OrgCard
                              title={s.jabatan}
                              name={s.nama_staf}
                              nip={s.nip_staf}
                              golongan={s.golongan || '-'}
                              colorTheme="brown"
                              onClick={() => openModal(s.jabatan, s.nama_staf, s.nip_staf, s.golongan || '', 'Membantu pelaksanaan tugas administrasi tata usaha keuangan dan pertanggungjawaban keuangan.', [])}
                              editMode={editMode}
                              onEdit={() => handleEditStafClick(s)}
                              onDelete={() => handleDeleteStaf(s)}
                            />
                          </div>
                        ))}
                        {editMode && subbagKeuangan.rawObj && (
                          <button
                            type="button"
                            onClick={() => handleAddStafClick(1, subbagKeuangan.rawObj!.id)}
                            className="mt-2 w-full max-w-60 py-1.5 px-3 rounded-lg border border-dashed border-green-300 text-green-700 hover:bg-green-50 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all"
                          >
                            ➕ Tambah Staf Keuangan
                          </button>
                        )}
                      </div>
                    </CollapsibleBranch>
                  </div>

                  {/* Column 4: Subbag Umum */}
                  <div className="flex flex-col items-center">
                    <div className="w-0.5 h-6 bg-neutral-300"></div>
                    <CollapsibleBranch
                      parentCard={
                        <OrgCard
                          title="KASUBBAG UMUM DAN KEPEGAWAIAN"
                          name={subbagUmum.name}
                          nip={subbagUmum.nip}
                          golongan={subbagUmum.golongan}
                          colorTheme="green"
                          onClick={() => openModal(subbagUmum.title, subbagUmum.name, subbagUmum.nip, subbagUmum.golongan, 'Melakukan tata usaha persuratan, rumah tangga, perlengkapan, aset, kehumasan, dan pengelolaan kepegawaian.', subbagUmum.staff)}
                          editMode={editMode && !!subbagUmum.rawObj}
                          onEdit={() => subbagUmum.rawObj && handleEditStafClick(subbagUmum.rawObj)}
                        />
                      }
                      isExpanded={expanded.umum}
                      onToggle={() => toggleSection('umum')}
                      staffCount={subbagUmum.staff.length}
                      lineHeightClass="h-4"
                      editMode={editMode}
                    >
                      <div className="flex flex-col items-center gap-3 w-full">
                        {subbagUmum.staff.map((s, idx) => (
                          <div key={s.id} className="flex flex-col items-center w-full">
                            {idx > 0 && <div className="w-0.5 h-3 bg-neutral-300"></div>}
                            <OrgCard
                              title={s.jabatan}
                              name={s.nama_staf}
                              nip={s.nip_staf}
                              golongan={s.golongan || '-'}
                              colorTheme="brown"
                              onClick={() => openModal(s.jabatan, s.nama_staf, s.nip_staf, s.golongan || '', 'Membantu pelaksanaan urusan kehumasan, perlengkapan, tata usaha surat menyurat, dan administrasi kepegawaian.', [])}
                              editMode={editMode}
                              onEdit={() => handleEditStafClick(s)}
                              onDelete={() => handleDeleteStaf(s)}
                            />
                          </div>
                        ))}
                        {editMode && subbagUmum.rawObj && (
                          <button
                            type="button"
                            onClick={() => handleAddStafClick(1, subbagUmum.rawObj!.id)}
                            className="mt-2 w-full max-w-60 py-1.5 px-3 rounded-lg border border-dashed border-green-300 text-green-700 hover:bg-green-50 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all"
                          >
                            ➕ Tambah Staf Umum
                          </button>
                        )}
                      </div>
                    </CollapsibleBranch>
                  </div>

                  {/* Other Secretariat Staff (parent_id is null) */}
                  {otherSekretariatStaff.map((s) => (
                    <div key={s.id} className="flex flex-col items-center">
                      <div className="w-0.5 h-6 bg-neutral-300"></div>
                      <CollapsibleBranch
                        parentCard={
                          <OrgCard
                            title={s.jabatan.toUpperCase()}
                            name={s.nama_staf}
                            nip={s.nip_staf}
                            golongan={s.golongan || ''}
                            colorTheme="green"
                            onClick={() => openModal(s.jabatan, s.nama_staf, s.nip_staf, s.golongan || '', 'Staf langsung di bawah Sekretaris Badan.', [])}
                            editMode={editMode}
                            onEdit={() => handleEditStafClick(s)}
                            onDelete={() => handleDeleteStaf(s)}
                          />
                        }
                        isExpanded={expanded[`other_sek_staf_${s.id}`] || false}
                        onToggle={() => toggleSection(`other_sek_staf_${s.id}`)}
                        staffCount={sekretariatStaff.filter(sub => sub.parent_id === s.id).length}
                        lineHeightClass="h-4"
                        editMode={editMode}
                      >
                        <div className="flex flex-col items-center gap-3 w-full">
                          {sekretariatStaff
                            .filter(sub => sub.parent_id === s.id)
                            .map((sub, idx) => (
                              <div key={sub.id} className="flex flex-col items-center w-full">
                                {idx > 0 && <div className="w-0.5 h-3 bg-neutral-300"></div>}
                                <OrgCard
                                  title={sub.jabatan}
                                  name={sub.nama_staf}
                                  nip={sub.nip_staf}
                                  golongan={sub.golongan || '-'}
                                  colorTheme="brown"
                                  onClick={() => openModal(sub.jabatan, sub.nama_staf, sub.nip_staf, sub.golongan || '', 'Membantu tugas operasional.', [])}
                                  editMode={editMode}
                                  onEdit={() => handleEditStafClick(sub)}
                                  onDelete={() => handleDeleteStaf(sub)}
                                />
                              </div>
                            ))}
                          {editMode && (
                            <button
                              type="button"
                              onClick={() => handleAddStafClick(1, s.id)}
                              className="mt-2 w-full max-w-60 py-1.5 px-3 rounded-lg border border-dashed border-green-300 text-green-700 hover:bg-green-50 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all"
                            >
                              ➕ Tambah Sub-Staf
                            </button>
                          )}
                        </div>
                      </CollapsibleBranch>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider line before operational divisions */}
        <div className="w-0.5 h-16 bg-neutral-300"></div>

        {/* Tier 3: The 4 Operational Divisions (Bidang) */}
        <div 
          className="relative w-full"
          style={{ maxWidth: `${Math.max(1240, (1 + totalSekretariatCols) * 240 + totalSekretariatCols * 24)}px` }}
        >
          {/* Horizontal line bridging the 4 Bidang */}
          <div className="absolute top-0 left-[12.5%] right-[12.5%] h-0.5 bg-neutral-300"></div>

          <div className="grid grid-cols-4 w-full gap-6">
             {/* Bidang 1: Ideologi */}
            <div className="flex flex-col items-center w-full">
              <div className="w-0.5 h-6 bg-neutral-300"></div>
              {bidangIdeologi ? (
                <CollapsibleBranch
                  parentCard={
                    <OrgCard
                      title="KABID IDEOLOGI, WAWASAN KEBANGSAAN DAN KARAKTER BANGSA"
                      name={bidangIdeologi.nama_kabid}
                      nip={bidangIdeologi.nip_kabid}
                      golongan={bidangIdeologi.golongan_kabid}
                      colorTheme="red"
                      avatarEmoji="🇮🇩"
                      onClick={() => openModal(bidangIdeologi.nama_bidang, bidangIdeologi.nama_kabid, bidangIdeologi.nip_kabid, bidangIdeologi.golongan_kabid, bidangIdeologi.deskripsi_tugas, getBidangStaff(bidangIdeologi.id))}
                      editMode={editMode}
                      onEdit={() => handleEditBidangClick(bidangIdeologi)}
                    />
                  }
                  isExpanded={expanded.ideologi}
                  onToggle={() => toggleSection('ideologi')}
                  staffCount={getBidangStaff(bidangIdeologi.id).length}
                  lineHeightClass="h-4"
                  editMode={editMode}
                >
                  <div className="flex flex-col items-center gap-3 w-full">
                    {getBidangStaff(bidangIdeologi.id).map((s, idx) => (
                      <div key={s.id} className="flex flex-col items-center w-full">
                        {idx > 0 && <div className="w-0.5 h-3 bg-neutral-300"></div>}
                        <OrgCard
                          title={s.jabatan}
                          name={s.nama_staf}
                          nip={s.nip_staf}
                          golongan={s.golongan || '-'}
                          colorTheme="brown"
                          onClick={() => openModal(s.jabatan, s.nama_staf, s.nip_staf, s.golongan || '', 'Melaksanakan tugas analisis dan penelaahan teknis kebijakan terkait ideologi dan wawasan kebangsaan.', [])}
                          editMode={editMode}
                          onEdit={() => handleEditStafClick(s)}
                          onDelete={() => handleDeleteStaf(s)}
                        />
                      </div>
                    ))}
                    {editMode && (
                      <button
                        type="button"
                        onClick={() => handleAddStafClick(bidangIdeologi.id, null, 'Penelaah Teknis Kebijakan')}
                        className="mt-2 w-full max-w-60 py-1.5 px-3 rounded-lg border border-dashed border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all"
                      >
                        ➕ Tambah Staf Ideologi
                      </button>
                    )}
                  </div>
                </CollapsibleBranch>
              ) : (
                <div className="text-xs text-neutral-400 italic">Data kosong</div>
              )}
            </div>

            {/* Bidang 2: Ketahanan */}
            <div className="flex flex-col items-center w-full">
              <div className="w-0.5 h-6 bg-neutral-300"></div>
              {bidangKetahanan ? (
                <CollapsibleBranch
                  parentCard={
                    <OrgCard
                      title="KABID KETAHANAN EKONOMI, SOSIAL, BUDAYA, AGAMA DAN ORGANISASI KEMASYARAKATAN"
                      name={bidangKetahanan.nama_kabid}
                      nip={bidangKetahanan.nip_kabid}
                      golongan={bidangKetahanan.golongan_kabid}
                      colorTheme="orange"
                      avatarEmoji="🤝"
                      onClick={() => openModal(bidangKetahanan.nama_bidang, bidangKetahanan.nama_kabid, bidangKetahanan.nip_kabid, bidangKetahanan.golongan_kabid, bidangKetahanan.deskripsi_tugas, getBidangStaff(bidangKetahanan.id))}
                      editMode={editMode}
                      onEdit={() => handleEditBidangClick(bidangKetahanan)}
                    />
                  }
                  isExpanded={expanded.ketahanan}
                  onToggle={() => toggleSection('ketahanan')}
                  staffCount={getBidangStaff(bidangKetahanan.id).length}
                  lineHeightClass="h-4"
                  editMode={editMode}
                >
                  <div className="flex flex-col items-center gap-3 w-full">
                    {getBidangStaff(bidangKetahanan.id).map((s, idx) => (
                      <div key={s.id} className="flex flex-col items-center w-full">
                        {idx > 0 && <div className="w-0.5 h-3 bg-neutral-300"></div>}
                        <OrgCard
                          title={s.jabatan}
                          name={s.nama_staf}
                          nip={s.nip_staf}
                          golongan={s.golongan || '-'}
                          colorTheme="brown"
                          onClick={() => openModal(s.jabatan, s.nama_staf, s.nip_staf, s.golongan || '', 'Melaksanakan tugas analisis dan penelaahan teknis kebijakan terkait ketahanan ekonomi, sosial, budaya, dan ormas.', [])}
                          editMode={editMode}
                          onEdit={() => handleEditStafClick(s)}
                          onDelete={() => handleDeleteStaf(s)}
                        />
                      </div>
                    ))}
                    {editMode && (
                      <button
                        type="button"
                        onClick={() => handleAddStafClick(bidangKetahanan.id, null, 'Penelaah Teknis Kebijakan')}
                        className="mt-2 w-full max-w-60 py-1.5 px-3 rounded-lg border border-dashed border-orange-300 text-orange-700 hover:bg-orange-50 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all"
                      >
                        ➕ Tambah Staf Ketahanan
                      </button>
                    )}
                  </div>
                </CollapsibleBranch>
              ) : (
                <div className="text-xs text-neutral-400 italic">Data kosong</div>
              )}
            </div>

            {/* Bidang 3: Politik DN */}
            <div className="flex flex-col items-center w-full">
              <div className="w-0.5 h-6 bg-neutral-300"></div>
              {bidangPolitik ? (
                <CollapsibleBranch
                  parentCard={
                    <OrgCard
                      title="KABID POLITIK DALAM NEGERI"
                      name={bidangPolitik.nama_kabid}
                      nip={bidangPolitik.nip_kabid}
                      golongan={bidangPolitik.golongan_kabid}
                      colorTheme="blue"
                      avatarEmoji="🗳️"
                      onClick={() => openModal(bidangPolitik.nama_bidang, bidangPolitik.nama_kabid, bidangPolitik.nip_kabid, bidangPolitik.golongan_kabid, bidangPolitik.deskripsi_tugas, getBidangStaff(bidangPolitik.id))}
                      editMode={editMode}
                      onEdit={() => handleEditBidangClick(bidangPolitik)}
                    />
                  }
                  isExpanded={expanded.politik}
                  onToggle={() => toggleSection('politik')}
                  staffCount={getBidangStaff(bidangPolitik.id).length}
                  lineHeightClass="h-4"
                  editMode={editMode}
                >
                  <div className="flex flex-col items-center gap-3 w-full">
                    {getBidangStaff(bidangPolitik.id).map((s, idx) => (
                      <div key={s.id} className="flex flex-col items-center w-full">
                        {idx > 0 && <div className="w-0.5 h-3 bg-neutral-300"></div>}
                        <OrgCard
                          title={s.jabatan}
                          name={s.nama_staf}
                          nip={s.nip_staf}
                          golongan={s.golongan || '-'}
                          colorTheme="brown"
                          onClick={() => openModal(s.jabatan, s.nama_staf, s.nip_staf, s.golongan || '', 'Melaksanakan analisis kebijakan dan tugas penelaahan/pamong terkait politik dalam negeri dan demokrasi.', [])}
                          editMode={editMode}
                          onEdit={() => handleEditStafClick(s)}
                          onDelete={() => handleDeleteStaf(s)}
                        />
                      </div>
                    ))}
                    {editMode && (
                      <button
                        type="button"
                        onClick={() => handleAddStafClick(bidangPolitik.id, null, 'Penelaah Teknis Kebijakan')}
                        className="mt-2 w-full max-w-60 py-1.5 px-3 rounded-lg border border-dashed border-blue-300 text-blue-700 hover:bg-blue-50 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all"
                      >
                        ➕ Tambah Staf Politik
                      </button>
                    )}
                  </div>
                </CollapsibleBranch>
              ) : (
                <div className="text-xs text-neutral-400 italic">Data kosong</div>
              )}
            </div>

            {/* Bidang 4: Kewaspadaan */}
            <div className="flex flex-col items-center w-full">
              <div className="w-0.5 h-6 bg-neutral-300"></div>
              {bidangKewaspadaan ? (
                <CollapsibleBranch
                  parentCard={
                    <OrgCard
                      title="KABID KEWASPADAAN DAN PENANGANAN KONFLIK"
                      name={bidangKewaspadaan.nama_kabid}
                      nip={bidangKewaspadaan.nip_kabid}
                      golongan={bidangKewaspadaan.golongan_kabid}
                      colorTheme="green"
                      avatarEmoji="🛡️"
                      onClick={() => openModal(bidangKewaspadaan.nama_bidang, bidangKewaspadaan.nama_kabid, bidangKewaspadaan.nip_kabid, bidangKewaspadaan.golongan_kabid, bidangKewaspadaan.deskripsi_tugas, getBidangStaff(bidangKewaspadaan.id))}
                      editMode={editMode}
                      onEdit={() => handleEditBidangClick(bidangKewaspadaan)}
                    />
                  }
                  isExpanded={expanded.kewaspadaan}
                  onToggle={() => toggleSection('kewaspadaan')}
                  staffCount={getBidangStaff(bidangKewaspadaan.id).length}
                  lineHeightClass="h-4"
                  editMode={editMode}
                >
                  <div className="flex flex-col items-center gap-3 w-full">
                    {getBidangStaff(bidangKewaspadaan.id).map((s, idx) => (
                      <div key={s.id} className="flex flex-col items-center w-full">
                        {idx > 0 && <div className="w-0.5 h-3 bg-neutral-300"></div>}
                        <OrgCard
                          title={s.jabatan}
                          name={s.nama_staf}
                          nip={s.nip_staf}
                          golongan={s.golongan || '-'}
                          colorTheme="brown"
                          onClick={() => openModal(s.jabatan, s.nama_staf, s.nip_staf, s.golongan || '', 'Melaksanakan tugas kewaspadaan nasional dan penanganan konflik.', [])}
                          editMode={editMode}
                          onEdit={() => handleEditStafClick(s)}
                          onDelete={() => handleDeleteStaf(s)}
                        />
                      </div>
                    ))}
                    {editMode && (
                      <button
                        type="button"
                        onClick={() => handleAddStafClick(bidangKewaspadaan.id, null, 'Penelaah Teknis Kebijakan')}
                        className="mt-2 w-full max-w-60 py-1.5 px-3 rounded-lg border border-dashed border-green-300 text-green-700 hover:bg-green-50 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all"
                      >
                        ➕ Tambah Staf Kewaspadaan
                      </button>
                    )}
                  </div>
                </CollapsibleBranch>
              ) : (
                <div className="text-xs text-neutral-400 italic">Data kosong</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* MOBILE STACK LAYOUT */}
      <div className="md:hidden space-y-6">
        {/* Kepala Badan */}
        <div className="flex flex-col items-center">
          <OrgCard
            title="KEPALA BADAN"
            name={pimpinan?.nama || KEPALA_BADAN_DEFAULT.nama}
            nip={pimpinan?.nip || KEPALA_BADAN_DEFAULT.nip}
            golongan={pimpinan?.golongan || KEPALA_BADAN_DEFAULT.golongan}
            colorTheme="red"
            avatarEmoji="👤"
            onClick={() => openModal('Kepala Badan Kesbangpol', pimpinan?.nama || KEPALA_BADAN_DEFAULT.nama, pimpinan?.nip || KEPALA_BADAN_DEFAULT.nip, pimpinan?.golongan || KEPALA_BADAN_DEFAULT.golongan, 'Memimpin dan merumuskan program kerja Badan Kesatuan Bangsa dan Politik Kota Banjarmasin.', [])}
            editMode={editMode}
            onEdit={() => handleEditPimpinanClick(pimpinan || KEPALA_BADAN_DEFAULT)}
          />
        </div>

        {/* Jabatan Fungsional Section */}
        <div className="border border-neutral-200 rounded-2xl p-4 bg-neutral-50/50 space-y-3">
          <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Kelompok Jabatan Fungsional</h3>
          <CollapsibleBranch
            parentCard={
              <OrgCard
                title="JABATAN FUNGSIONAL"
                name="Kelompok Jabatan Fungsional"
                nip=""
                golongan="Analis & Penyuluh Kebijakan"
                colorTheme="gray"
                avatarEmoji="📋"
                onClick={() => openModal('Kelompok Jabatan Fungsional', 'Analisis Kebijakan Ahli Muda', '-', '-', 'Melakukan analisis, penyuluhan, dan kajian teknis fungsional kebijakan kesatuan bangsa dan politik.', fungsionalDisplayList as Staff[])}
              />
            }
            isExpanded={expanded.fungsional}
            onToggle={() => toggleSection('fungsional')}
            staffCount={fungsionalDisplayList.length}
            lineHeightClass="h-4"
            editMode={editMode}
          >
            <div className="space-y-3 mt-3 w-full flex flex-col items-center">
              {fungsionalDisplayList.map((member) => (
                <OrgCard
                  key={member.id}
                  title={member.jabatan}
                  name={member.nama_staf}
                  nip={member.nip_staf}
                  golongan={member.golongan || ''}
                  colorTheme="gray"
                  onClick={() => openModal(member.jabatan, member.nama_staf, member.nip_staf, member.golongan || '', 'Melakukan analisis kebijakan dan tugas-tugas fungsional terkait.', [])}
                  editMode={editMode && hasFungsionalDb}
                  onEdit={() => handleEditStafClick(member as Staff)}
                  onDelete={() => handleDeleteStaf(member as Staff)}
                />
              ))}
              {editMode && (
                <button
                  type="button"
                  onClick={() => handleAddStafClick(99, null, 'Analisis Kebijakan Ahli Muda')}
                  className="mt-2 w-full max-w-60 py-1.5 px-3 rounded-lg border border-dashed border-neutral-300 text-neutral-600 hover:bg-neutral-50 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all"
                >
                  ➕ Tambah Anggota Fungsional
                </button>
              )}
            </div>
          </CollapsibleBranch>
        </div>

        {/* Sekretariat Section */}
        <div className="border border-neutral-200 rounded-2xl p-4 bg-neutral-50/50 space-y-4">
          <h3 className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-2">Sekretariat</h3>
          <div className="flex flex-col items-center">
            {(() => {
              const b1 = getBidangData(1)
              if (!b1) return null
              return (
                <>
                  <OrgCard
                    title="PLT. SEKRETARIS BADAN"
                    name={b1.nama_kabid || SEKRETARIS_BADAN_DEFAULT.nama}
                    nip={b1.nip_kabid || SEKRETARIS_BADAN_DEFAULT.nip}
                    golongan={b1.golongan_kabid || SEKRETARIS_BADAN_DEFAULT.golongan}
                    colorTheme="sky"
                    avatarEmoji="👔"
                    onClick={() => openModal('Plt. Sekretaris Badan', b1.nama_kabid, b1.nip_kabid, b1.golongan_kabid || '', b1.deskripsi_tugas, [])}
                    editMode={editMode}
                    onEdit={() => handleEditBidangClick(b1)}
                  />
                  {editMode && (
                    <button
                      type="button"
                      onClick={() => handleAddStafClick(1, null, 'Kasubbag ')}
                      className="mt-2.5 py-1 px-3 rounded-lg border border-dashed border-sky-300 text-sky-700 hover:bg-sky-50 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all z-20"
                    >
                      ➕ Tambah Kasubbag / Staf
                    </button>
                  )}
                </>
              )
            })()}
          </div>

          {/* Subbags */}
          <div className="space-y-4 pl-2 border-l-2 border-sky-200">
            {/* Subbag Program */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Kasubbag Penyusunan Program dan Anggaran</h4>
              <CollapsibleBranch
                parentCard={
                  <OrgCard
                    title="KASUBBAG PENYUSUNAN PROGRAM DAN ANGGARAN"
                    name={subbagProgram.name}
                    nip={subbagProgram.nip}
                    golongan={subbagProgram.golongan}
                    colorTheme="green"
                    onClick={() => openModal(subbagProgram.title, subbagProgram.name, subbagProgram.nip, subbagProgram.golongan, 'Melakukan koordinasi penyusunan program kerja, anggaran, evaluasi, dan pelaporan badan.', subbagProgram.staff)}
                    editMode={editMode && !!subbagProgram.rawObj}
                    onEdit={() => subbagProgram.rawObj && handleEditStafClick(subbagProgram.rawObj)}
                  />
                }
                isExpanded={expanded.program}
                onToggle={() => toggleSection('program')}
                staffCount={subbagProgram.staff.length}
                lineHeightClass="h-4"
                editMode={editMode}
              >
                <div className="space-y-2 mt-2 w-full flex flex-col items-center">
                  {subbagProgram.staff.map((s) => (
                    <OrgCard
                      key={s.id}
                      title={s.jabatan}
                      name={s.nama_staf}
                      nip={s.nip_staf}
                      golongan={s.golongan || '-'}
                      colorTheme="brown"
                      onClick={() => openModal(s.jabatan, s.nama_staf, s.nip_staf, s.golongan || '', 'Membantu pelaksanaan tugas administrasi dan operasional subbagian program.', [])}
                      editMode={editMode}
                      onEdit={() => handleEditStafClick(s)}
                      onDelete={() => handleDeleteStaf(s)}
                    />
                  ))}
                  {editMode && subbagProgram.rawObj && (
                    <button
                      type="button"
                      onClick={() => handleAddStafClick(1, subbagProgram.rawObj!.id)}
                      className="mt-2 w-full max-w-60 py-1.5 px-3 rounded-lg border border-dashed border-green-300 text-green-700 hover:bg-green-50 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all"
                    >
                      ➕ Tambah Staf Program
                    </button>
                  )}
                </div>
              </CollapsibleBranch>
            </div>

            {/* Subbag Keuangan */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Kasubbag Keuangan</h4>
              <CollapsibleBranch
                parentCard={
                  <OrgCard
                    title="KASUBBAG KEUANGAN"
                    name={subbagKeuangan.name}
                    nip={subbagKeuangan.nip}
                    golongan={subbagKeuangan.golongan}
                    colorTheme="green"
                    onClick={() => openModal(subbagKeuangan.title, subbagKeuangan.name, subbagKeuangan.nip, subbagKeuangan.golongan, 'Melakukan administrasi tata usaha keuangan, pembukuan, pertanggungjawaban, dan perbendaharaan.', subbagKeuangan.staff)}
                    editMode={editMode && !!subbagKeuangan.rawObj}
                    onEdit={() => subbagKeuangan.rawObj && handleEditStafClick(subbagKeuangan.rawObj)}
                  />
                }
                isExpanded={expanded.keuangan}
                onToggle={() => toggleSection('keuangan')}
                staffCount={subbagKeuangan.staff.length}
                lineHeightClass="h-4"
                editMode={editMode}
              >
                <div className="space-y-2 mt-2 w-full flex flex-col items-center">
                  {subbagKeuangan.staff.map((s) => (
                    <OrgCard
                      key={s.id}
                      title={s.jabatan}
                      name={s.nama_staf}
                      nip={s.nip_staf}
                      golongan={s.golongan || '-'}
                      colorTheme="brown"
                      onClick={() => openModal(s.jabatan, s.nama_staf, s.nip_staf, s.golongan || '', 'Membantu pelaksanaan tugas administrasi tata usaha keuangan and pertanggungjawaban keuangan.', [])}
                      editMode={editMode}
                      onEdit={() => handleEditStafClick(s)}
                      onDelete={() => handleDeleteStaf(s)}
                    />
                  ))}
                  {editMode && subbagKeuangan.rawObj && (
                    <button
                      type="button"
                      onClick={() => handleAddStafClick(1, subbagKeuangan.rawObj!.id)}
                      className="mt-2 w-full max-w-60 py-1.5 px-3 rounded-lg border border-dashed border-green-300 text-green-700 hover:bg-green-50 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all"
                    >
                      ➕ Tambah Staf Keuangan
                    </button>
                  )}
                </div>
              </CollapsibleBranch>
            </div>

            {/* Subbag Umum */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Kasubbag Umum dan Kepegawaian</h4>
              <CollapsibleBranch
                parentCard={
                  <OrgCard
                    title="KASUBBAG UMUM DAN KEPEGAWAIAN"
                    name={subbagUmum.name}
                    nip={subbagUmum.nip}
                    golongan={subbagUmum.golongan}
                    colorTheme="green"
                    onClick={() => openModal(subbagUmum.title, subbagUmum.name, subbagUmum.nip, subbagUmum.golongan, 'Melakukan tata usaha persuratan, rumah tangga, perlengkapan, aset, kehumasan, dan pengelolaan kepegawaian.', subbagUmum.staff)}
                    editMode={editMode && !!subbagUmum.rawObj}
                    onEdit={() => subbagUmum.rawObj && handleEditStafClick(subbagUmum.rawObj)}
                  />
                }
                isExpanded={expanded.umum}
                onToggle={() => toggleSection('umum')}
                staffCount={subbagUmum.staff.length}
                lineHeightClass="h-4"
                editMode={editMode}
              >
                <div className="space-y-2 mt-2 w-full flex flex-col items-center">
                  {subbagUmum.staff.map((s) => (
                    <OrgCard
                      key={s.id}
                      title={s.jabatan}
                      name={s.nama_staf}
                      nip={s.nip_staf}
                      golongan={s.golongan || '-'}
                      colorTheme="brown"
                      onClick={() => openModal(s.jabatan, s.nama_staf, s.nip_staf, s.golongan || '', 'Membantu pelaksanaan urusan kehumasan, perlengkapan, tata usaha surat menyurat, dan administrasi kepegawaian.', [])}
                      editMode={editMode}
                      onEdit={() => handleEditStafClick(s)}
                      onDelete={() => handleDeleteStaf(s)}
                    />
                  ))}
                  {editMode && subbagUmum.rawObj && (
                    <button
                      type="button"
                      onClick={() => handleAddStafClick(1, subbagUmum.rawObj!.id)}
                      className="mt-2 w-full max-w-60 py-1.5 px-3 rounded-lg border border-dashed border-green-300 text-green-700 hover:bg-green-50 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all"
                    >
                      ➕ Tambah Staf Umum
                    </button>
                  )}
                </div>
              </CollapsibleBranch>
            </div>

            {/* Other Secretariat Staff (parent_id is null) */}
            {otherSekretariatStaff.map((s) => (
              <div key={s.id} className="space-y-2">
                <h4 className="text-[10px] font-bold text-green-600 uppercase tracking-wider">{s.jabatan}</h4>
                <CollapsibleBranch
                  parentCard={
                    <OrgCard
                      title={s.jabatan.toUpperCase()}
                      name={s.nama_staf}
                      nip={s.nip_staf}
                      golongan={s.golongan || ''}
                      colorTheme="green"
                      onClick={() => openModal(s.jabatan, s.nama_staf, s.nip_staf, s.golongan || '', 'Staf langsung di bawah Sekretaris Badan.', [])}
                      editMode={editMode}
                      onEdit={() => handleEditStafClick(s)}
                      onDelete={() => handleDeleteStaf(s)}
                    />
                  }
                  isExpanded={expanded[`other_sek_staf_${s.id}`] || false}
                  onToggle={() => toggleSection(`other_sek_staf_${s.id}`)}
                  staffCount={sekretariatStaff.filter(sub => sub.parent_id === s.id).length}
                  lineHeightClass="h-4"
                  editMode={editMode}
                >
                  <div className="space-y-2 mt-2 w-full flex flex-col items-center">
                    {sekretariatStaff
                      .filter(sub => sub.parent_id === s.id)
                      .map((sub) => (
                        <OrgCard
                          key={sub.id}
                          title={sub.jabatan}
                          name={sub.nama_staf}
                          nip={sub.nip_staf}
                          golongan={sub.golongan || '-'}
                          colorTheme="brown"
                          onClick={() => openModal(sub.jabatan, sub.nama_staf, sub.nip_staf, sub.golongan || '', 'Membantu tugas operasional.', [])}
                          editMode={editMode}
                          onEdit={() => handleEditStafClick(sub)}
                          onDelete={() => handleDeleteStaf(sub)}
                        />
                      ))}
                    {editMode && (
                      <button
                        type="button"
                        onClick={() => handleAddStafClick(1, s.id)}
                        className="mt-2 w-full max-w-60 py-1.5 px-3 rounded-lg border border-dashed border-green-300 text-green-700 hover:bg-green-50 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all"
                      >
                        ➕ Tambah Sub-Staf
                      </button>
                    )}
                  </div>
                </CollapsibleBranch>
              </div>
            ))}
          </div>
        </div>

        {/* Bidang-Bidang Section */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Bidang Operasional</h3>
          
          {/* Bidang Ideologi */}
          {bidangIdeologi && (
            <div className="border border-neutral-200 rounded-2xl p-4 bg-neutral-50/50 space-y-2">
              <CollapsibleBranch
                parentCard={
                  <OrgCard
                    title="KABID IDEOLOGI, WAWASAN KEBANGSAAN DAN KARAKTER BANGSA"
                    name={bidangIdeologi.nama_kabid}
                    nip={bidangIdeologi.nip_kabid}
                    golongan={bidangIdeologi.golongan_kabid}
                    colorTheme="red"
                    avatarEmoji="🇮🇩"
                    onClick={() => openModal(bidangIdeologi.nama_bidang, bidangIdeologi.nama_kabid, bidangIdeologi.nip_kabid, bidangIdeologi.golongan_kabid, bidangIdeologi.deskripsi_tugas, getBidangStaff(bidangIdeologi.id))}
                    editMode={editMode}
                    onEdit={() => handleEditBidangClick(bidangIdeologi)}
                  />
                }
                isExpanded={expanded.ideologi}
                onToggle={() => toggleSection('ideologi')}
                staffCount={getBidangStaff(bidangIdeologi.id).length}
                lineHeightClass="h-4"
                editMode={editMode}
              >
                <div className="space-y-2 mt-2 w-full flex flex-col items-center">
                  {getBidangStaff(bidangIdeologi.id).map((s) => (
                    <OrgCard
                      key={s.id}
                      title={s.jabatan}
                      name={s.nama_staf}
                      nip={s.nip_staf}
                      golongan={s.golongan || '-'}
                      colorTheme="brown"
                      onClick={() => openModal(s.jabatan, s.nama_staf, s.nip_staf, s.golongan || '', 'Melaksanakan tugas analisis dan penelaahan teknis kebijakan terkait ideologi dan wawasan kebangsaan.', [])}
                      editMode={editMode}
                      onEdit={() => handleEditStafClick(s)}
                      onDelete={() => handleDeleteStaf(s)}
                    />
                  ))}
                  {editMode && (
                    <button
                      type="button"
                      onClick={() => handleAddStafClick(bidangIdeologi.id, null, 'Penelaah Teknis Kebijakan')}
                      className="mt-2 w-full max-w-60 py-1.5 px-3 rounded-lg border border-dashed border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all"
                    >
                      ➕ Tambah Staf Ideologi
                    </button>
                  )}
                </div>
              </CollapsibleBranch>
            </div>
          )}

          {/* Bidang Ketahanan */}
          {bidangKetahanan && (
            <div className="border border-neutral-200 rounded-2xl p-4 bg-neutral-50/50 space-y-2">
              <CollapsibleBranch
                parentCard={
                  <OrgCard
                    title="KABID KETAHANAN EKONOMI, SOSIAL, BUDAYA, AGAMA DAN ORGANISASI KEMASYARAKATAN"
                    name={bidangKetahanan.nama_kabid}
                    nip={bidangKetahanan.nip_kabid}
                    golongan={bidangKetahanan.golongan_kabid}
                    colorTheme="orange"
                    avatarEmoji="🤝"
                    onClick={() => openModal(bidangKetahanan.nama_bidang, bidangKetahanan.nama_kabid, bidangKetahanan.nip_kabid, bidangKetahanan.golongan_kabid, bidangKetahanan.deskripsi_tugas, getBidangStaff(bidangKetahanan.id))}
                    editMode={editMode}
                    onEdit={() => handleEditBidangClick(bidangKetahanan)}
                  />
                }
                isExpanded={expanded.ketahanan}
                onToggle={() => toggleSection('ketahanan')}
                staffCount={getBidangStaff(bidangKetahanan.id).length}
                lineHeightClass="h-4"
                editMode={editMode}
              >
                <div className="space-y-2 mt-2 w-full flex flex-col items-center">
                  {getBidangStaff(bidangKetahanan.id).map((s) => (
                    <OrgCard
                      key={s.id}
                      title={s.jabatan}
                      name={s.nama_staf}
                      nip={s.nip_staf}
                      golongan={s.golongan || '-'}
                      colorTheme="brown"
                      onClick={() => openModal(s.jabatan, s.nama_staf, s.nip_staf, s.golongan || '', 'Melaksanakan tugas analisis dan penelaahan teknis kebijakan terkait ketahanan ekonomi, sosial, budaya, and ormas.', [])}
                      editMode={editMode}
                      onEdit={() => handleEditStafClick(s)}
                      onDelete={() => handleDeleteStaf(s)}
                    />
                  ))}
                  {editMode && (
                    <button
                      type="button"
                      onClick={() => handleAddStafClick(bidangKetahanan.id, null, 'Penelaah Teknis Kebijakan')}
                      className="mt-2 w-full max-w-60 py-1.5 px-3 rounded-lg border border-dashed border-orange-300 text-orange-700 hover:bg-orange-50 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all"
                    >
                      ➕ Tambah Staf Ketahanan
                    </button>
                  )}
                </div>
              </CollapsibleBranch>
            </div>
          )}

          {/* Bidang Politik DN */}
          {bidangPolitik && (
            <div className="border border-neutral-200 rounded-2xl p-4 bg-neutral-50/50 space-y-2">
              <CollapsibleBranch
                parentCard={
                  <OrgCard
                    title="KABID POLITIK DALAM NEGERI"
                    name={bidangPolitik.nama_kabid}
                    nip={bidangPolitik.nip_kabid}
                    golongan={bidangPolitik.golongan_kabid}
                    colorTheme="blue"
                    avatarEmoji="🗳️"
                    onClick={() => openModal(bidangPolitik.nama_bidang, bidangPolitik.nama_kabid, bidangPolitik.nip_kabid, bidangPolitik.golongan_kabid, bidangPolitik.deskripsi_tugas, getBidangStaff(bidangPolitik.id))}
                    editMode={editMode}
                    onEdit={() => handleEditBidangClick(bidangPolitik)}
                  />
                }
                isExpanded={expanded.politik}
                onToggle={() => toggleSection('politik')}
                staffCount={getBidangStaff(bidangPolitik.id).length}
                lineHeightClass="h-4"
                editMode={editMode}
              >
                <div className="space-y-2 mt-2 w-full flex flex-col items-center">
                  {getBidangStaff(bidangPolitik.id).map((s) => (
                    <OrgCard
                      key={s.id}
                      title={s.jabatan}
                      name={s.nama_staf}
                      nip={s.nip_staf}
                      golongan={s.golongan || '-'}
                      colorTheme="brown"
                      onClick={() => openModal(s.jabatan, s.nama_staf, s.nip_staf, s.golongan || '', 'Melaksanakan analisis kebijakan dan tugas penelaahan/pamong terkait politik dalam negeri dan demokrasi.', [])}
                      editMode={editMode}
                      onEdit={() => handleEditStafClick(s)}
                      onDelete={() => handleDeleteStaf(s)}
                    />
                  ))}
                  {editMode && (
                    <button
                      type="button"
                      onClick={() => handleAddStafClick(bidangPolitik.id, null, 'Penelaah Teknis Kebijakan')}
                      className="mt-2 w-full max-w-60 py-1.5 px-3 rounded-lg border border-dashed border-blue-300 text-blue-700 hover:bg-blue-50 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all"
                    >
                      ➕ Tambah Staf Politik
                    </button>
                  )}
                </div>
              </CollapsibleBranch>
            </div>
          )}

          {/* Bidang Kewaspadaan */}
          {bidangKewaspadaan && (
            <div className="border border-neutral-200 rounded-2xl p-4 bg-neutral-50/50 space-y-2">
              <CollapsibleBranch
                parentCard={
                  <OrgCard
                    title="KABID KEWASPADAAN DAN PENANGANAN KONFLIK"
                    name={bidangKewaspadaan.nama_kabid}
                    nip={bidangKewaspadaan.nip_kabid}
                    golongan={bidangKewaspadaan.golongan_kabid}
                    colorTheme="green"
                    avatarEmoji="🛡️"
                    onClick={() => openModal(bidangKewaspadaan.nama_bidang, bidangKewaspadaan.nama_kabid, bidangKewaspadaan.nip_kabid, bidangKewaspadaan.golongan_kabid, bidangKewaspadaan.deskripsi_tugas, getBidangStaff(bidangKewaspadaan.id))}
                    editMode={editMode}
                    onEdit={() => handleEditBidangClick(bidangKewaspadaan)}
                  />
                }
                isExpanded={expanded.kewaspadaan}
                onToggle={() => toggleSection('kewaspadaan')}
                staffCount={getBidangStaff(bidangKewaspadaan.id).length}
                lineHeightClass="h-4"
                editMode={editMode}
              >
                <div className="space-y-2 mt-2 w-full flex flex-col items-center">
                  {getBidangStaff(bidangKewaspadaan.id).map((s) => (
                    <OrgCard
                      key={s.id}
                      title={s.jabatan}
                      name={s.nama_staf}
                      nip={s.nip_staf}
                      golongan={s.golongan || '-'}
                      colorTheme="brown"
                      onClick={() => openModal(s.jabatan, s.nama_staf, s.nip_staf, s.golongan || '', 'Melaksanakan tugas kewaspadaan nasional dan penanganan konflik.', [])}
                      editMode={editMode}
                      onEdit={() => handleEditStafClick(s)}
                      onDelete={() => handleDeleteStaf(s)}
                    />
                  ))}
                  {editMode && (
                    <button
                      type="button"
                      onClick={() => handleAddStafClick(bidangKewaspadaan.id, null, 'Penelaah Teknis Kebijakan')}
                      className="mt-2 w-full max-w-60 py-1.5 px-3 rounded-lg border border-dashed border-green-300 text-green-700 hover:bg-green-50 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all"
                    >
                      ➕ Tambah Staf Kewaspadaan
                    </button>
                  )}
                </div>
              </CollapsibleBranch>
            </div>
          )}
        </div>
      </div>
    </div>

      {/* DETAIL DIALOG MODAL — centered in viewport */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
          style={{ touchAction: 'none' }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-2xl shadow-2xl flex flex-col animate-slide-in-up"
            style={{ maxHeight: 'calc(100dvh - 2rem)', touchAction: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 pt-5 pb-4 border-b border-neutral-100 flex items-start justify-between flex-shrink-0">
              <div className="flex-1 min-w-0 pr-3">
                <span className="text-[10px] font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Detail Organisasi
                </span>
                <h2 className="text-base font-bold text-neutral-900 mt-2 leading-snug">{modalTitle}</h2>
                <p className="text-sm font-semibold text-neutral-700 mt-0.5">{modalSubtitle}</p>
                {modalNip !== '-' && modalNip !== '' && (
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {modalNip.startsWith('NIP') ? modalNip : `NIP. ${modalNip}`} &bull; {modalGolongan}
                  </p>
                )}
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 overscroll-contain">
              {/* Description */}
              <div className="px-5 py-4 border-b border-neutral-100">
                <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                  Tugas Pokok &amp; Fungsi
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {modalDescription}
                </p>
              </div>

              {/* Staff List */}
              <div className="px-5 py-4">
                <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-3">
                  Daftar Staf / Anggota ({modalStaff.length})
                </h3>
                {modalStaff.length > 0 ? (
                  <div className="space-y-3">
                    {modalStaff.map((staff) => (
                      <div
                        key={staff.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-100"
                      >
                        <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0 text-primary-700 font-bold text-sm">
                          {staff.nama_staf.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-neutral-800 truncate">{staff.nama_staf}</p>
                          <p className="text-[10px] text-neutral-500 mt-0.5 leading-snug">{staff.jabatan}</p>
                          {staff.nip_staf !== '-' && staff.nip_staf !== '' && (
                            <p className="text-[9px] text-neutral-400 mt-0.5">
                              {staff.nip_staf.startsWith('NIP') ? staff.nip_staf : `NIP. ${staff.nip_staf}`}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400 italic">Tidak ada staf terdaftar di bawah unit kerja ini.</p>
                )}
              </div>
            </div>

            {/* Footer — full-width close button */}
            <div className="px-5 py-4 border-t border-neutral-100 bg-neutral-50/80 flex-shrink-0">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full py-3 rounded-2xl bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-sm font-bold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}


      {/* EDIT MODAL DIALOG */}
      {editType && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in"
          style={{ touchAction: 'none' }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-slide-in-up max-h-[90dvh] overflow-y-auto overscroll-contain"
            style={{ touchAction: 'auto' }}
          >
            <h3 className="text-lg font-bold text-neutral-900 mb-4">
              {editingId ? 'Edit Elemen Struktur' : 'Tambah Staf Baru'}
            </h3>

            <form onSubmit={handleSaveStructure} className="space-y-4">
              {editType === 'bidang' && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Nama Bidang / Unit</label>
                  <input
                    type="text"
                    required
                    value={formNamaBidang}
                    onChange={(e) => setFormNamaBidang(e.target.value)}
                    className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  {editType === 'bidang' ? 'Nama Kepala Bidang (Kabid)' : 'Nama Lengkap'}
                </label>
                <input
                  type="text"
                  required
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">NIP (Gunakan - jika tidak ada)</label>
                <input
                  type="text"
                  required
                  value={formNip}
                  onChange={(e) => setFormNip(e.target.value)}
                  className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Golongan / Pangkat</label>
                <input
                  type="text"
                  required
                  value={formGolongan}
                  onChange={(e) => setFormGolongan(e.target.value)}
                  className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                  placeholder="Contoh: Penata Tk. I (III/d)"
                />
              </div>

              {editType === 'staf' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Jabatan</label>
                    <input
                      type="text"
                      required
                      value={formJabatan}
                      onChange={(e) => setFormJabatan(e.target.value)}
                      className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                      placeholder="Contoh: Kasubbag Keuangan"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Bidang / Departemen</label>
                    <select
                      value={formBidangId}
                      onChange={(e) => {
                        const bId = parseInt(e.target.value)
                        setFormBidangId(bId)
                        if (bId !== 1) setFormParentId(null) // Reset parent if not in Sekretariat
                      }}
                      className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                    >
                      {bidangList.map(b => (
                        <option key={b.id} value={b.id}>{b.nama_bidang}</option>
                      ))}
                    </select>
                  </div>

                  {formBidangId === 1 && (
                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 mb-1">Atasan Langsung (Kasubbag)</label>
                      <select
                        value={formParentId || ''}
                        onChange={(e) => setFormParentId(e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                      >
                        <option value="">Tidak ada (Langsung di bawah Sekretaris)</option>
                        {(staffMap[1] || [])
                          .filter(s => s.parent_id === null && s.id !== editingId && s.jabatan.toLowerCase().includes('kasubbag'))
                          .map(s => (
                            <option key={s.id} value={s.id}>{s.nama_staf} ({s.jabatan})</option>
                          ))
                        }
                      </select>
                    </div>
                  )}
                </>
              )}

              {editType === 'bidang' && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Tugas Pokok & Fungsi</label>
                  <textarea
                    required
                    value={formDeskripsiTugas}
                    onChange={(e) => setFormDeskripsiTugas(e.target.value)}
                    rows={4}
                    className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                  />
                </div>
              )}

              <div className="flex gap-2.5 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setEditType(null)}
                  className="px-4 py-2 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmStaf && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
          style={{ touchAction: 'none' }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative animate-slide-in-up"
            style={{ touchAction: 'auto' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">Hapus Anggota</h3>
                <p className="text-xs text-neutral-500">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>
            <p className="text-sm text-neutral-700 mb-6">
              Apakah Anda yakin ingin menghapus <span className="font-bold text-neutral-900">{deleteConfirmStaf.nama_staf}</span> dari struktur organisasi?
            </p>
            <div className="flex gap-2.5 justify-end">
              <button
                type="button"
                onClick={() => setDeleteConfirmStaf(null)}
                disabled={deleting}
                className="px-4 py-2 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                {deleting ? (
                  <>
                    <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Menghapus...
                  </>
                ) : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
