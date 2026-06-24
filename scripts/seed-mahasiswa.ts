import { createClient } from '@supabase/supabase-js'
import * as readline from 'readline'

const SUPABASE_URL = 'https://emiyuajhjltvjwueovzb.supabase.co'

// Data akun mahasiswa
const MAHASISWA_DATA = {
  email: 'mahasiswa.demo@presenz.com',
  password: 'Demo123456!',
  nama_lengkap: 'BUDI SANTOSO',
  nama_kampus: 'Universitas Lambung Mangkurat',
  nim_nisn: '2110416110001',
  bidang_id: 2,
  tanggal_mulai: '2025-04-01',
  tanggal_selesai: '2025-06-30',
}

const OFFICE_LAT = -3.3194
const OFFICE_LON = 114.5908

function randomFloat(min: number, max: number): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(6))
}

function isWeekday(date: Date): boolean {
  const day = date.getDay()
  return day !== 0 && day !== 6
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

function randomJamMasuk(): string {
  const base = 7 * 60 + 30
  const extra = Math.floor(Math.random() * 61)
  const total = base + extra
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}:00`
}

function randomJamPulang(): string {
  const base = 15 * 60 + 30
  const extra = Math.floor(Math.random() * 91)
  const total = base + extra
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}:00`
}

const HARI_LIBUR = new Set([
  '2025-04-18', '2025-04-20',
  '2025-05-01', '2025-05-12', '2025-05-29',
  '2025-06-01', '2025-06-06',
])

function generateWorkdays(startDate: string, endDate: string): Date[] {
  const days: Date[] = []
  const current = new Date(startDate)
  const end = new Date(endDate)
  while (current <= end) {
    const dateStr = formatDate(current)
    if (isWeekday(current) && !HARI_LIBUR.has(dateStr)) {
      days.push(new Date(current))
    }
    current.setDate(current.getDate() + 1)
  }
  return days
}

function generateAbsensi(userId: string, workdays: Date[]) {
  return workdays.map(date => {
    const dateStr = formatDate(date)
    const rand = Math.random()
    if (rand < 0.80) {
      return {
        user_id: userId, tanggal: dateStr,
        jam_masuk: randomJamMasuk(), jam_pulang: randomJamPulang(),
        keterangan: 'hadir', alasan_izin: null,
        latitude_masuk: randomFloat(OFFICE_LAT - 0.001, OFFICE_LAT + 0.001),
        longitude_masuk: randomFloat(OFFICE_LON - 0.001, OFFICE_LON + 0.001),
        latitude_pulang: randomFloat(OFFICE_LAT - 0.001, OFFICE_LAT + 0.001),
        longitude_pulang: randomFloat(OFFICE_LON - 0.001, OFFICE_LON + 0.001),
      }
    } else if (rand < 0.90) {
      const alasanList = ['Sakit demam dan tidak bisa masuk kantor','Ada keperluan keluarga mendesak','Kondisi badan kurang sehat','Urusan administrasi di rumah sakit','Keperluan pribadi yang tidak bisa ditunda']
      return { user_id: userId, tanggal: dateStr, jam_masuk: null, jam_pulang: null, keterangan: 'izin', alasan_izin: alasanList[Math.floor(Math.random() * alasanList.length)], latitude_masuk: null, longitude_masuk: null, latitude_pulang: null, longitude_pulang: null }
    } else {
      const alasanKampus = ['Seminar nasional di kampus','Ujian Tengah Semester','Bimbingan skripsi dengan dosen pembimbing','Ujian mata kuliah wajib','Seminar proposal skripsi']
      return { user_id: userId, tanggal: dateStr, jam_masuk: null, jam_pulang: null, keterangan: 'izin kampus', alasan_izin: alasanKampus[Math.floor(Math.random() * alasanKampus.length)], latitude_masuk: null, longitude_masuk: null, latitude_pulang: null, longitude_pulang: null }
    }
  })
}

async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

async function main() {
  console.log('\n' + '='.repeat(60))
  console.log('   PRESENZ - SEED DATA MAHASISWA SIMULASI 3 BULAN')
  console.log('='.repeat(60))
  console.log('\n📌 Cara mendapatkan Service Role Key:')
  console.log('   1. Buka https://supabase.com/dashboard')
  console.log('   2. Pilih project PresenZ')
  console.log('   3. Klik Settings -> API')
  console.log('   4. Copy key "service_role" (bukan anon key)\n')

  const serviceKey = await prompt('🔑 Masukkan Service Role Key: ')

  if (!serviceKey || serviceKey.length < 100) {
    console.error('\n❌ Service role key tidak valid. Key harus dimulai dengan "eyJ..." dan panjang >100 karakter.')
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  console.log('\n🚀 Memulai pembuatan data...')

  // Cek koneksi
  const { error: testErr } = await supabase.from('profiles').select('id').limit(1)
  if (testErr && testErr.message.includes('Invalid API key')) {
    console.error('❌ Service key tidak valid atau tidak punya akses admin.')
    process.exit(1)
  }

  // Buat atau cari user
  let userId = ''
  console.log(`\n📧 Membuat akun auth: ${MAHASISWA_DATA.email}`)
  
  const { data: createData, error: createError } = await supabase.auth.admin.createUser({
    email: MAHASISWA_DATA.email,
    password: MAHASISWA_DATA.password,
    email_confirm: true,
  })

  if (createError) {
    if (createError.message.toLowerCase().includes('already') || createError.message.toLowerCase().includes('registered')) {
      console.log('⚠️  Email sudah terdaftar, menggunakan akun yang ada...')
      const { data: listData } = await supabase.auth.admin.listUsers()
      const existing = listData?.users.find((u: any) => u.email === MAHASISWA_DATA.email)
      if (!existing) { console.error('❌ User tidak ditemukan'); process.exit(1) }
      userId = existing.id
    } else {
      console.error('❌ Gagal membuat akun:', createError.message)
      process.exit(1)
    }
  } else {
    userId = createData.user!.id
    console.log(`✅ Akun berhasil dibuat. ID: ${userId}`)
  }

  // Update profil
  console.log('\n📋 Mengisi profil mahasiswa...')
  const { error: profErr } = await supabase.from('profiles').upsert({
    id: userId,
    role: 'magang',
    nama_lengkap: MAHASISWA_DATA.nama_lengkap,
    nama_kampus: MAHASISWA_DATA.nama_kampus,
    nim_nisn: MAHASISWA_DATA.nim_nisn,
    bidang_id: MAHASISWA_DATA.bidang_id,
    tanggal_mulai: MAHASISWA_DATA.tanggal_mulai,
    tanggal_selesai: MAHASISWA_DATA.tanggal_selesai,
  })
  if (profErr) { console.error('❌ Gagal update profil:', profErr.message); process.exit(1) }
  console.log('✅ Profil berhasil diisi.')

  // Hapus data absensi lama
  await supabase.from('absensi').delete().eq('user_id', userId)

  // Generate absensi
  console.log('\n📅 Generating data absensi April - Juni 2025...')
  const workdays = generateWorkdays(MAHASISWA_DATA.tanggal_mulai, MAHASISWA_DATA.tanggal_selesai)
  const absensiData = generateAbsensi(userId, workdays)
  
  const hadir = absensiData.filter((a: any) => a.keterangan === 'hadir').length
  const izin = absensiData.filter((a: any) => a.keterangan === 'izin').length
  const izinKampus = absensiData.filter((a: any) => a.keterangan === 'izin kampus').length
  
  console.log(`   Total hari kerja : ${workdays.length} hari`)
  console.log(`   Hadir            : ${hadir} hari`)
  console.log(`   Izin             : ${izin} hari`)
  console.log(`   Izin Kampus      : ${izinKampus} hari`)

  // Insert batch
  const BATCH = 50
  console.log('\n⬆️  Mengupload data ke database...')
  for (let i = 0; i < absensiData.length; i += BATCH) {
    const batch = absensiData.slice(i, i + BATCH)
    const { error: insErr } = await supabase.from('absensi').insert(batch)
    if (insErr) { console.error(`\n❌ Gagal insert:`, insErr.message); process.exit(1) }
    process.stdout.write(`   Progress: ${Math.min(i + BATCH, absensiData.length)}/${absensiData.length} record\r`)
  }

  console.log('\n\n' + '='.repeat(60))
  console.log('✅ DATA BERHASIL DIBUAT!')
  console.log('='.repeat(60))
  console.log(`\n  Email    : ${MAHASISWA_DATA.email}`)
  console.log(`  Password : ${MAHASISWA_DATA.password}`)
  console.log(`  Nama     : ${MAHASISWA_DATA.nama_lengkap}`)
  console.log(`  Kampus   : ${MAHASISWA_DATA.nama_kampus}`)
  console.log(`  NIM      : ${MAHASISWA_DATA.nim_nisn}`)
  console.log(`  Periode  : April - Juni 2025 (3 Bulan)`)
  console.log(`  Total    : ${absensiData.length} hari kerja\n`)
  console.log('🎉 Login di http://localhost:3000/login')
  console.log('   Lalu coba fitur Export Excel dari dashboard admin!\n')
}

main().catch(console.error)
