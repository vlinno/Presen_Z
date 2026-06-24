-- ============================================
-- Seed Data: Kesbangpol Kota Banjarmasin
-- Based on Kepmendagri No. 100-441 Tahun 2019
-- Sesuai Bagan Struktur Organisasi
-- ============================================

-- 1. Sekretariat
INSERT INTO bidang_kesbangpol (nama_bidang, nama_kabid, nip_kabid, deskripsi_tugas) VALUES
(
    'Sekretariat',
    'Ir. H. UMAR RAHMANI, ST., MT',
    '19730308 199303 1 006',
    'Menyelenggarakan urusan perencanaan program dan anggaran, keuangan, umum dan kepegawaian, serta mengoordinasikan pelaksanaan tugas satuan organisasi di lingkungan Badan Kesatuan Bangsa dan Politik.'
);

-- 2. Bidang Ideologi, Wawasan Kebangsaan, dan Karakter Bangsa
INSERT INTO bidang_kesbangpol (nama_bidang, nama_kabid, nip_kabid, deskripsi_tugas) VALUES
(
    'Bidang Ideologi, Wawasan Kebangsaan, dan Karakter Bangsa',
    'H. HASAN, SKM, MM',
    '19710515 199703 1 013',
    'Melaksanakan sebagian tugas Badan di bidang ideologi, wawasan kebangsaan, bela negara, karakter bangsa, pembauran kebangsaan, Bhinneka Tunggal Ika, dan sejarah kebangsaan di wilayah Kota Banjarmasin.'
);

-- 3. Bidang Politik Dalam Negeri
INSERT INTO bidang_kesbangpol (nama_bidang, nama_kabid, nip_kabid, deskripsi_tugas) VALUES
(
    'Bidang Politik Dalam Negeri',
    'Ir. H. UMAR RAHMANI, ST., MT',
    '19730308 199303 1 006',
    'Melaksanakan sebagian tugas Badan di bidang pendidikan politik, pengembangan etika dan budaya politik, peningkatan demokrasi, fasilitasi kelembagaan pemerintahan dan perwakilan, partai politik, serta pemilihan umum/pemilihan kepala daerah.'
);

-- 4. Bidang Ketahanan Ekonomi, Sosial, Budaya, Agama, dan Organisasi Kemasyarakatan
INSERT INTO bidang_kesbangpol (nama_bidang, nama_kabid, nip_kabid, deskripsi_tugas) VALUES
(
    'Bidang Ketahanan Ekonomi, Sosial, Budaya, Agama, dan Organisasi Kemasyarakatan',
    'SYAFIQ HUWAIDA, ST',
    '19751116 199903 1 004',
    'Melaksanakan sebagian tugas Badan di bidang ketahanan ekonomi, sosial, budaya, fasilitasi pencegahan penyalahgunaan narkotika, penanganan konflik sosial, pengawasan orang asing, dan pembinaan organisasi kemasyarakatan.'
);

-- 5. Bidang Kewaspadaan Nasional dan Penanganan Konflik
INSERT INTO bidang_kesbangpol (nama_bidang, nama_kabid, nip_kabid, deskripsi_tugas) VALUES
(
    'Bidang Kewaspadaan Nasional dan Penanganan Konflik',
    'H. RAHMAN ANSHARI, S.Kep, MA',
    '19710622 199101 1 001',
    'Melaksanakan sebagian tugas Badan di bidang kewaspadaan dini, kerjasama intelijen keamanan, pemantauan orang asing, tenaga kerja asing, lembaga asing, pencegahan konflik, penghentian konflik, dan pemulihan pascakonflik.'
);

-- ============================================
-- Staff Data (Sekretariat)
-- ============================================
INSERT INTO staf_bidang (bidang_id, nama_staf, jabatan, nip_staf) VALUES
(1, 'MARIA ULFAH, SE', 'Kasubbag Penyusunan Program dan Anggaran', '19870306 201001 2 004'),
(1, 'LOLY HIDAYAT, S.AP', 'Penata Layanan Operasional', 'NIPPPK. 19850814 202521 1 003'),
(1, 'ENDANG SUSANTI, A.Md', 'Pengolah Data dan Informasi', '19791128 200501 2 010'),
(1, 'DIAH SYAFA''AH, ST', 'Kasubbag Keuangan', '19761012 201001 2 008'),
(1, 'HOLIPAH, A.Md', 'Pengolah Data dan Informasi', '19750511 201001 2 005'),
(1, 'HENDRA RIYADI, A.Md', 'Pengolah Data dan Informasi', '19760418 201001 1 008'),
(1, 'VIVI APRIANY, SE., M.M', 'Kasubbag Umum dan Kepegawaian', '19810401 200903 2 009'),
(1, 'TRISNAWATI MULYO HAPSARI, SE', 'Penelaah Teknis Kebijakan', '19721124 200604 2 005'),
(1, 'INDRA HIDAYAT, S.Kom', 'Penata Layanan Operasional', 'NIPPPK. 19920701 202521 1 150'),
(1, 'SELAMAT RIADI', 'Pengadministrasi Perkantoran', 'NIPPPK. 19810216 202521 1 006');

-- ============================================
-- Staff Data (Bidang Ideologi - bidang_id = 2)
-- ============================================
-- (No staff listed directly under Kabid on the wall chart)

-- ============================================
-- Staff Data (Bidang Politik DN - bidang_id = 3)
-- ============================================
INSERT INTO staf_bidang (bidang_id, nama_staf, jabatan, nip_staf) VALUES
(3, 'ARIF SETYAWAN, S.IP', 'Penelaah Teknis Kebijakan', '19900324 202012 1 013');

-- ============================================
-- Staff Data (Bidang Ketahanan - bidang_id = 4)
-- ============================================
INSERT INTO staf_bidang (bidang_id, nama_staf, jabatan, nip_staf) VALUES
(4, 'ADITYA FERNANDO, S.Sosio', 'Penelaah Teknis Kebijakan', '19860301 202012 1 010');

-- ============================================
-- Staff Data (Bidang Kewaspadaan - bidang_id = 5)
-- ============================================
INSERT INTO staf_bidang (bidang_id, nama_staf, jabatan, nip_staf) VALUES
(5, 'HERMANSYAH, SKM, M.M', 'Penelaah Teknis Kebijakan', '19720127 199703 1 004'),
(5, 'HILDANI AMRULLAH, S.Sos', 'Pamong Pemerintahan', '19750506 200604 1 005');
