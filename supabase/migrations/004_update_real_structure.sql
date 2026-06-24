-- ============================================
-- Update Struktur Organisasi Badan Kesbangpol
-- Kota Banjarmasin (sesuai bagan organisasi)
-- ============================================

-- Update departments (bidang_kesbangpol) with real data from organization chart

-- Sekretariat (id=1) — Plt. Sekretaris: Ir. H. UMAR RAHMANI, ST., MT
UPDATE public.bidang_kesbangpol SET
    nama_kabid = 'Ir. H. UMAR RAHMANI, ST., MT',
    nip_kabid = '19730308 199303 1 006'
WHERE id = 1; -- Sekretariat

-- Bidang Ideologi, Wawasan Kebangsaan, dan Karakter Bangsa (id=2)
-- Kabid: H. HASAN, SKM, MM
UPDATE public.bidang_kesbangpol SET
    nama_kabid = 'H. HASAN, SKM, MM',
    nip_kabid = '19710515 199703 1 013'
WHERE id = 2;

-- Bidang Politik Dalam Negeri (id=3)
-- Kabid: Ir. H. UMAR RAHMANI, ST., MT
UPDATE public.bidang_kesbangpol SET
    nama_kabid = 'Ir. H. UMAR RAHMANI, ST., MT',
    nip_kabid = '19730308 199303 1 006'
WHERE id = 3;

-- Bidang Ketahanan Ekonomi, Sosial, Budaya, Agama, dan Organisasi Kemasyarakatan (id=4)
-- Kabid: SYAFIQ HUWAIDA, ST
UPDATE public.bidang_kesbangpol SET
    nama_kabid = 'SYAFIQ HUWAIDA, ST',
    nip_kabid = '19751116 199903 1 004'
WHERE id = 4;

-- Bidang Kewaspadaan Nasional dan Penanganan Konflik (id=5)
-- Kabid: H. RAHMAN ANSHARI, S.Kep, MA
UPDATE public.bidang_kesbangpol SET
    nama_kabid = 'H. RAHMAN ANSHARI, S.Kep, MA',
    nip_kabid = '19710622 199101 1 001'
WHERE id = 5;

-- ============================================
-- Clear existing staff data to insert real ones
-- ============================================
TRUNCATE TABLE public.staf_bidang CASCADE;

-- ============================================
-- SEKRETARIAT (bidang_id = 1)
-- ============================================

-- Kasubbag Penyusunan Program dan Anggaran
INSERT INTO public.staf_bidang (bidang_id, nama_staf, jabatan, nip_staf) VALUES
(1, 'MARIA ULFAH, SE', 'Kasubbag Penyusunan Program dan Anggaran', '19870306 201001 2 004');

-- Staf di bawah Subbag Program dan Anggaran
INSERT INTO public.staf_bidang (bidang_id, nama_staf, jabatan, nip_staf) VALUES
(1, 'LOLY HIDAYAT, S.AP', 'Penata Layanan Operasional', 'NIPPPK. 19850814 202521 1 003'),
(1, 'ENDANG SUSANTI, A.Md', 'Pengolah Data dan Informasi', '19791128 200501 2 010');

-- Kasubbag Keuangan
INSERT INTO public.staf_bidang (bidang_id, nama_staf, jabatan, nip_staf) VALUES
(1, 'DIAH SYAFA''AH, ST', 'Kasubbag Keuangan', '19761012 201001 2 008');

-- Staf di bawah Subbag Keuangan: Pengolah Data dan Informasi
INSERT INTO public.staf_bidang (bidang_id, nama_staf, jabatan, nip_staf) VALUES
(1, 'HOLIPAH, A.Md', 'Pengolah Data dan Informasi', '19750511 201001 2 005'),
(1, 'HENDRA RIYADI, A.Md', 'Pengolah Data dan Informasi', '19760418 201001 1 008');

-- Kasubbag Umum dan Kepegawaian
INSERT INTO public.staf_bidang (bidang_id, nama_staf, jabatan, nip_staf) VALUES
(1, 'VIVI APRIANY, SE., M.M', 'Kasubbag Umum dan Kepegawaian', '19810401 200903 2 009');

-- Staf di bawah Subbag Umum dan Kepegawaian
INSERT INTO public.staf_bidang (bidang_id, nama_staf, jabatan, nip_staf) VALUES
(1, 'TRISNAWATI MULYO HAPSARI, SE', 'Penelaah Teknis Kebijakan', '19721124 200604 2 005'),
(1, 'INDRA HIDAYAT, S.Kom', 'Penata Layanan Operasional', 'NIPPPK. 19920701 202521 1 150'),
(1, 'SELAMAT RIADI', 'Pengadministrasi Perkantoran', 'NIPPPK. 19810216 202521 1 006');

-- ============================================
-- BIDANG IDEOLOGI, WAWASAN KEBANGSAAN, DAN KARAKTER BANGSA (bidang_id = 2)
-- ============================================
-- (No staff listed directly under Kabid on the wall chart)

-- ============================================
-- BIDANG POLITIK DALAM NEGERI (bidang_id = 3)
-- ============================================
INSERT INTO public.staf_bidang (bidang_id, nama_staf, jabatan, nip_staf) VALUES
(3, 'ARIF SETYAWAN, S.IP', 'Penelaah Teknis Kebijakan', '19900324 202012 1 013');

-- ============================================
-- BIDANG KETAHANAN EKONOMI, SOSIAL, BUDAYA, AGAMA, DAN ORGANISASI KEMASYARAKATAN (bidang_id = 4)
-- ============================================
INSERT INTO public.staf_bidang (bidang_id, nama_staf, jabatan, nip_staf) VALUES
(4, 'ADITYA FERNANDO, S.Sosio', 'Penelaah Teknis Kebijakan', '19860301 202012 1 010');

-- ============================================
-- BIDANG KEWASPADAAN NASIONAL DAN PENANGANAN KONFLIK (bidang_id = 5)
-- ============================================
INSERT INTO public.staf_bidang (bidang_id, nama_staf, jabatan, nip_staf) VALUES
(5, 'HERMANSYAH, SKM, M.M', 'Penelaah Teknis Kebijakan', '19720127 199703 1 004'),
(5, 'HILDANI AMRULLAH, S.Sos', 'Pamong Pemerintahan', '19750506 200604 1 005');

