-- ============================================
-- Migrasi: Restorasi Struktur Organisasi Riil Kesbangpol
-- Mengembalikan seluruh data ke data riil/resmi
-- ============================================

-- 1. Bersihkan data staf_bidang yang ada untuk menghindari duplikasi dan menghapus placeholder
TRUNCATE TABLE public.staf_bidang RESTART IDENTITY CASCADE;

-- 2. Pastikan data pimpinan_badan (Kepala Badan) terisi dengan benar
DELETE FROM public.pimpinan_badan;
INSERT INTO public.pimpinan_badan (id, nama, nip, golongan, jabatan)
VALUES (1, 'AHMAD MUZAIYIN, S.Sos., MA', '19740328 199311 1 001', 'Pembina Utama Muda (IV/c)', 'Kepala Badan')
ON CONFLICT (id) DO UPDATE 
SET nama = EXCLUDED.nama, 
    nip = EXCLUDED.nip, 
    golongan = EXCLUDED.golongan, 
    jabatan = EXCLUDED.jabatan;

-- 3. Reset dan update data bidang_kesbangpol ke nilai riil
-- ID 1: Sekretariat
INSERT INTO public.bidang_kesbangpol (id, nama_bidang, nama_kabid, nip_kabid, golongan_kabid, deskripsi_tugas)
VALUES (1, 'Sekretariat', 'Ir. H. UMAR RAHMANI, ST., MT', '19730308 199303 1 006', 'Pembina (IV/a)', 'Menyelenggarakan urusan perencanaan program dan anggaran, keuangan, umum dan kepegawaian, serta mengoordinasikan pelaksanaan tugas satuan organisasi di lingkungan Badan Kesatuan Bangsa dan Politik.')
ON CONFLICT (id) DO UPDATE SET
    nama_bidang = EXCLUDED.nama_bidang,
    nama_kabid = EXCLUDED.nama_kabid,
    nip_kabid = EXCLUDED.nip_kabid,
    golongan_kabid = EXCLUDED.golongan_kabid,
    deskripsi_tugas = EXCLUDED.deskripsi_tugas;

-- ID 2: Bidang Ideologi
INSERT INTO public.bidang_kesbangpol (id, nama_bidang, nama_kabid, nip_kabid, golongan_kabid, deskripsi_tugas)
VALUES (2, 'Bidang Ideologi, Wawasan Kebangsaan, dan Karakter Bangsa', 'H. HASAN, SKM, MM', '19710515 199703 1 013', 'Pembina (IV/a)', 'Melaksanakan sebagian tugas Badan di bidang ideologi, wawasan kebangsaan, bela negara, karakter bangsa, pembauran kebangsaan, Bhinneka Tunggal Ika, dan sejarah kebangsaan di wilayah Kota Banjarmasin.')
ON CONFLICT (id) DO UPDATE SET
    nama_bidang = EXCLUDED.nama_bidang,
    nama_kabid = EXCLUDED.nama_kabid,
    nip_kabid = EXCLUDED.nip_kabid,
    golongan_kabid = EXCLUDED.golongan_kabid,
    deskripsi_tugas = EXCLUDED.deskripsi_tugas;

-- ID 3: Bidang Politik DN
INSERT INTO public.bidang_kesbangpol (id, nama_bidang, nama_kabid, nip_kabid, golongan_kabid, deskripsi_tugas)
VALUES (3, 'Bidang Politik Dalam Negeri', 'Ir. H. UMAR RAHMANI, ST., MT', '19730308 199303 1 006', 'Pembina (IV/a)', 'Melaksanakan sebagian tugas Badan di bidang pendidikan politik, pengembangan etika dan budaya politik, peningkatan demokrasi, fasilitasi kelembagaan pemerintahan dan perwakilan, partai politik, serta pemilihan umum/pemilihan kepala daerah.')
ON CONFLICT (id) DO UPDATE SET
    nama_bidang = EXCLUDED.nama_bidang,
    nama_kabid = EXCLUDED.nama_kabid,
    nip_kabid = EXCLUDED.nip_kabid,
    golongan_kabid = EXCLUDED.golongan_kabid,
    deskripsi_tugas = EXCLUDED.deskripsi_tugas;

-- ID 4: Bidang Ketahanan
INSERT INTO public.bidang_kesbangpol (id, nama_bidang, nama_kabid, nip_kabid, golongan_kabid, deskripsi_tugas)
VALUES (4, 'Bidang Ketahanan Ekonomi, Sosial, Budaya, Agama, dan Organisasi Kemasyarakatan', 'SYAFIQ HUWAIDA, ST', '19751116 199903 1 004', 'Pembina Tk. I (IV/b)', 'Melaksanakan sebagian tugas Badan di bidang ketahanan ekonomi, sosial, budaya, fasilitasi pencegahan penyalahgunaan narkotika, penanganan konflik sosial, pengawasan orang asing, dan pembinaan organisasi kemasyarakatan.')
ON CONFLICT (id) DO UPDATE SET
    nama_bidang = EXCLUDED.nama_bidang,
    nama_kabid = EXCLUDED.nama_kabid,
    nip_kabid = EXCLUDED.nip_kabid,
    golongan_kabid = EXCLUDED.golongan_kabid,
    deskripsi_tugas = EXCLUDED.deskripsi_tugas;

-- ID 5: Bidang Kewaspadaan
INSERT INTO public.bidang_kesbangpol (id, nama_bidang, nama_kabid, nip_kabid, golongan_kabid, deskripsi_tugas)
VALUES (5, 'Bidang Kewaspadaan Nasional dan Penanganan Konflik', 'H. RAHMAN ANSHARI, S.Kep, MA', '19710622 199101 1 001', 'Pembina (IV/a)', 'Melaksanakan sebagian tugas Badan di bidang kewaspadaan dini, kerjasama intelijen keamanan, pemantauan orang asing, tenaga kerja asing, lembaga asing, pencegahan konflik, penghentian konflik, dan pemulihan pascakonflik.')
ON CONFLICT (id) DO UPDATE SET
    nama_bidang = EXCLUDED.nama_bidang,
    nama_kabid = EXCLUDED.nama_kabid,
    nip_kabid = EXCLUDED.nip_kabid,
    golongan_kabid = EXCLUDED.golongan_kabid,
    deskripsi_tugas = EXCLUDED.deskripsi_tugas;

-- ID 99: Kelompok Jabatan Fungsional
INSERT INTO public.bidang_kesbangpol (id, nama_bidang, nama_kabid, nip_kabid, golongan_kabid, deskripsi_tugas)
VALUES (99, 'Kelompok Jabatan Fungsional', 'Jabatan Fungsional', '-', 'Analis & Penyuluh Kebijakan', 'Melakukan analisis, penyuluhan, dan kajian teknis fungsional kebijakan kesatuan bangsa dan politik.')
ON CONFLICT (id) DO UPDATE SET
    nama_bidang = EXCLUDED.nama_bidang,
    nama_kabid = EXCLUDED.nama_kabid,
    nip_kabid = EXCLUDED.nip_kabid,
    golongan_kabid = EXCLUDED.golongan_kabid,
    deskripsi_tugas = EXCLUDED.deskripsi_tugas;


-- 4. Masukkan data staf_bidang resmi beserta Golongan nya
-- Kasubbag Penyusunan Program dan Anggaran
INSERT INTO public.staf_bidang (id, bidang_id, nama_staf, jabatan, nip_staf, golongan) 
VALUES (1, 1, 'MARIA ULFAH, SE', 'Kasubbag Penyusunan Program dan Anggaran', '19870306 201001 2 004', 'Penata (III/c)');

-- Staf di bawah Subbag Program dan Anggaran
INSERT INTO public.staf_bidang (id, bidang_id, nama_staf, jabatan, nip_staf, golongan) 
VALUES 
(2, 1, 'LOLY HIDAYAT, S.AP', 'Penata Layanan Operasional', 'NIPPPK. 19850814 202521 1 003', 'Penata Layanan Operasional (IX)'),
(3, 1, 'ENDANG SUSANTI, A.Md', 'Pengolah Data dan Informasi', '19791128 200501 2 010', 'Penata (III/c)');

-- Kasubbag Keuangan
INSERT INTO public.staf_bidang (id, bidang_id, nama_staf, jabatan, nip_staf, golongan) 
VALUES (4, 1, 'DIAH SYAFA''AH, ST', 'Kasubbag Keuangan', '19761012 201001 2 008', 'Penata Tk. I (III/d)');

-- Staf di bawah Subbag Keuangan
INSERT INTO public.staf_bidang (id, bidang_id, nama_staf, jabatan, nip_staf, golongan) 
VALUES 
(5, 1, 'HOLIPAH, A.Md', 'Pengolah Data dan Informasi', '19750511 201001 2 005', 'Penata (III/c)'),
(6, 1, 'HENDRA RIYADI, A.Md', 'Pengolah Data dan Informasi', '19760418 201001 1 008', 'Penata (III/c)');

-- Kasubbag Umum dan Kepegawaian
INSERT INTO public.staf_bidang (id, bidang_id, nama_staf, jabatan, nip_staf, golongan) 
VALUES (7, 1, 'VIVI APRIANY, SE., M.M', 'Kasubbag Umum dan Kepegawaian', '19810401 200903 2 009', 'Pembina (IV/a)');

-- Staf di bawah Subbag Umum dan Kepegawaian
INSERT INTO public.staf_bidang (id, bidang_id, nama_staf, jabatan, nip_staf, golongan) 
VALUES 
(8, 1, 'TRISNAWATI MULYO HAPSARI, SE', 'Penelaah Teknis Kebijakan', '19721124 200604 2 005', 'Penata Tk. I (III/d)'),
(9, 1, 'INDRA HIDAYAT, S.Kom', 'Penata Layanan Operasional', 'NIPPPK. 19920701 202521 1 150', 'Penata Layanan Operasional (IX)'),
(10, 1, 'SELAMAT RIADI', 'Pengadministrasi Perkantoran', 'NIPPPK. 19810216 202521 1 006', 'Pengadministrasi Perkantoran (V)');

-- Staf Bidang Politik Dalam Negeri
INSERT INTO public.staf_bidang (id, bidang_id, nama_staf, jabatan, nip_staf, golongan) 
VALUES (11, 3, 'ARIF SETYAWAN, S.IP', 'Penelaah Teknis Kebijakan', '19900324 202012 1 013', 'Penata Muda Tk. I (III/b)');

-- Staf Bidang Ketahanan Ekonomi, Sosial, Budaya
INSERT INTO public.staf_bidang (id, bidang_id, nama_staf, jabatan, nip_staf, golongan) 
VALUES (12, 4, 'ADITYA FERNANDO, S.Sosio', 'Penelaah Teknis Kebijakan', '19860301 202012 1 010', 'Penata Muda Tk. I (III/b)');

-- Staf Bidang Kewaspadaan Nasional
INSERT INTO public.staf_bidang (id, bidang_id, nama_staf, jabatan, nip_staf, golongan) 
VALUES 
(13, 5, 'HERMANSYAH, SKM, M.M', 'Penelaah Teknis Kebijakan', '19720127 199703 1 004', 'Pembina (IV/a)'),
(14, 5, 'HILDANI AMRULLAH, S.Sos', 'Pamong Pemerintahan', '19750506 200604 1 005', 'Penata Tk. I (III/d)');

-- Anggota Jabatan Fungsional
INSERT INTO public.staf_bidang (id, bidang_id, nama_staf, jabatan, nip_staf, golongan) 
VALUES 
(15, 99, 'RUSIANTI, S. AP', 'Analisis Kebijakan Ahli Muda', '19691126 199303 2 004', 'Penata Tk. I (III/d)'),
(16, 99, 'NOOR BAITIE HAMSAN, S.Ag', 'Analisis Kebijakan Ahli Muda', '19740619 199503 2 002', 'Penata Tk. I (III/d)'),
(17, 99, 'NOOR JANNAH, SST', 'Analisis Kebijakan Ahli Muda', '19710517 199203 2 005', 'Penata Tk. I (III/d)'),
(18, 99, 'EKANTYASRINI, S.Sos, SE', 'Analisis Kebijakan Ahli Muda', '19681011 199303 2 005', 'Penata Tk. I (III/d)'),
(19, 99, 'YANI PRASETIAHATI, M.Pd', 'Analisis Kebijakan Ahli Muda', '19730128 199903 2 007', 'Pembina (IV/a)');

-- Set nilai sequence agar sinkron setelah memaksa input ID manual
SELECT setval('staf_bidang_id_seq', COALESCE((SELECT MAX(id)+1 FROM public.staf_bidang), 1), false);


-- 5. Hubungkan sub-staf ke Kasubbag masing-masing di Sekretariat menggunakan parent_id
-- Sub-staf Program (id: 2, 3) di bawah Kasubbag Program (id: 1)
UPDATE public.staf_bidang SET parent_id = 1 WHERE id IN (2, 3);

-- Sub-staf Keuangan (id: 5, 6) di bawah Kasubbag Keuangan (id: 4)
UPDATE public.staf_bidang SET parent_id = 4 WHERE id IN (5, 6);

-- Sub-staf Umum (id: 8, 9, 10) di bawah Kasubbag Umum (id: 7)
UPDATE public.staf_bidang SET parent_id = 7 WHERE id IN (8, 9, 10);
