-- ============================================
-- Migrasi: Manajemen Struktur Organisasi oleh Admin
-- ============================================

-- 1. Tambahkan kolom golongan ke tabel public.staf_bidang
ALTER TABLE public.staf_bidang ADD COLUMN IF NOT EXISTS golongan VARCHAR(100);

-- 2. Tambahkan kolom golongan_kabid ke tabel public.bidang_kesbangpol
ALTER TABLE public.bidang_kesbangpol ADD COLUMN IF NOT EXISTS golongan_kabid VARCHAR(100);

-- 3. Tambahkan kolom parent_id ke tabel public.staf_bidang untuk relasi hierarki Kasubbag -> Sub-staf
ALTER TABLE public.staf_bidang ADD COLUMN IF NOT EXISTS parent_id INT REFERENCES public.staf_bidang(id) ON DELETE SET NULL;

-- 4. Update golongan untuk staff yang sudah ada
UPDATE public.staf_bidang SET golongan = 'Penata Layanan Operasional (IX)' WHERE nama_staf = 'LOLY HIDAYAT, S.AP';
UPDATE public.staf_bidang SET golongan = 'Penata (III/c)' WHERE nama_staf = 'ENDANG SUSANTI, A.Md';
UPDATE public.staf_bidang SET golongan = 'Penata (III/c)' WHERE nama_staf = 'HOLIPAH, A.Md';
UPDATE public.staf_bidang SET golongan = 'Penata (III/c)' WHERE nama_staf = 'HENDRA RIYADI, A.Md';
UPDATE public.staf_bidang SET golongan = 'Penata Tk. I (III/d)' WHERE nama_staf = 'TRISNAWATI MULYO HAPSARI, SE';
UPDATE public.staf_bidang SET golongan = 'Penata Layanan Operasional (IX)' WHERE nama_staf = 'INDRA HIDAYAT, S.Kom';
UPDATE public.staf_bidang SET golongan = 'Pengadministrasi Perkantoran (V)' WHERE nama_staf = 'SELAMAT RIADI';
UPDATE public.staf_bidang SET golongan = 'Penata Muda Tk. I (III/b)' WHERE nama_staf = 'ADITYA FERNANDO, S.Sosio';
UPDATE public.staf_bidang SET golongan = 'Penata Muda Tk. I (III/b)' WHERE nama_staf = 'ARIF SETYAWAN, S.IP';
UPDATE public.staf_bidang SET golongan = 'Pembina (IV/a)' WHERE nama_staf = 'HERMANSYAH, SKM, M.M';
UPDATE public.staf_bidang SET golongan = 'Penata Tk. I (III/d)' WHERE nama_staf = 'HILDANI AMRULLAH, S.Sos';

-- Update golongan untuk Kasubbag (staf_bidang)
UPDATE public.staf_bidang SET golongan = 'Penata (III/c)' WHERE nama_staf = 'MARIA ULFAH, SE';
UPDATE public.staf_bidang SET golongan = 'Penata Tk. I (III/d)' WHERE nama_staf = 'DIAH SYAFA''AH, ST';
UPDATE public.staf_bidang SET golongan = 'Pembina (IV/a)' WHERE nama_staf = 'VIVI APRIANY, SE., M.M';

-- 5. Update golongan_kabid untuk bidang yang sudah ada
UPDATE public.bidang_kesbangpol SET golongan_kabid = 'Pembina (IV/a)' WHERE id = 1; -- Sekretariat
UPDATE public.bidang_kesbangpol SET golongan_kabid = 'Pembina (IV/a)' WHERE id = 2; -- Ideologi
UPDATE public.bidang_kesbangpol SET golongan_kabid = 'Pembina (IV/a)' WHERE id = 3; -- Politik DN
UPDATE public.bidang_kesbangpol SET golongan_kabid = 'Pembina Tk. I (IV/b)' WHERE id = 4; -- Ketahanan
UPDATE public.bidang_kesbangpol SET golongan_kabid = 'Pembina (IV/a)' WHERE id = 5; -- Kewaspadaan

-- 6. Hubungkan sub-staf ke Kasubbag masing-masing di Sekretariat
UPDATE public.staf_bidang
SET parent_id = (SELECT id FROM public.staf_bidang WHERE nama_staf = 'MARIA ULFAH, SE' LIMIT 1)
WHERE nama_staf IN ('LOLY HIDAYAT, S.AP', 'ENDANG SUSANTI, A.Md');

UPDATE public.staf_bidang
SET parent_id = (SELECT id FROM public.staf_bidang WHERE nama_staf = 'DIAH SYAFA''AH, ST' LIMIT 1)
WHERE nama_staf IN ('HOLIPAH, A.Md', 'HENDRA RIYADI, A.Md');

UPDATE public.staf_bidang
SET parent_id = (SELECT id FROM public.staf_bidang WHERE nama_staf = 'VIVI APRIANY, SE., M.M' LIMIT 1)
WHERE nama_staf IN ('TRISNAWATI MULYO HAPSARI, SE', 'INDRA HIDAYAT, S.Kom', 'SELAMAT RIADI');

-- 7. Tambah baris "Kelompok Jabatan Fungsional" ke bidang_kesbangpol agar staff fungsional bisa direferensikan ke bidang_id ini
INSERT INTO public.bidang_kesbangpol (id, nama_bidang, nama_kabid, nip_kabid, golongan_kabid, deskripsi_tugas)
VALUES (99, 'Kelompok Jabatan Fungsional', 'Jabatan Fungsional', '-', 'Analis & Penyuluh Kebijakan', 'Melakukan analisis, penyuluhan, dan kajian teknis fungsional kebijakan kesatuan bangsa dan politik.')
ON CONFLICT (id) DO NOTHING;


-- 8. Seed data Jabatan Fungsional ke staf_bidang jika belum ada
INSERT INTO public.staf_bidang (bidang_id, nama_staf, jabatan, nip_staf, golongan)
VALUES 
(99, 'RUSIANTI, S. AP', 'Analisis Kebijakan Ahli Muda', '19691126 199303 2 004', 'Penata Tk. I (III/d)'),
(99, 'NOOR BAITIE HAMSAN, S.Ag', 'Analisis Kebijakan Ahli Muda', '19740619 199503 2 002', 'Penata Tk. I (III/d)'),
(99, 'NOOR JANNAH, SST', 'Analisis Kebijakan Ahli Muda', '19710517 199203 2 005', 'Penata Tk. I (III/d)'),
(99, 'EKANTYASRINI, S.Sos, SE', 'Analisis Kebijakan Ahli Muda', '19681011 199303 2 005', 'Penata Tk. I (III/d)'),
(99, 'YANI PRASETIAHATI, M.Pd', 'Analisis Kebijakan Ahli Muda', '19730128 199903 2 007', 'Pembina (IV/a)')
ON CONFLICT DO NOTHING;

-- 9. Buat tabel pimpinan_badan untuk Kepala Badan
CREATE TABLE IF NOT EXISTS public.pimpinan_badan (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    nip VARCHAR(50) NOT NULL,
    golongan VARCHAR(100) NOT NULL,
    jabatan VARCHAR(100) DEFAULT 'Kepala Badan'
);

-- Aktifkan RLS pada pimpinan_badan
ALTER TABLE public.pimpinan_badan ENABLE ROW LEVEL SECURITY;

-- Kebijakan RLS pimpinan_badan
DROP POLICY IF EXISTS "Everyone can view pimpinan_badan" ON public.pimpinan_badan;
CREATE POLICY "Everyone can view pimpinan_badan"
    ON public.pimpinan_badan FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Admin can insert pimpinan_badan" ON public.pimpinan_badan;
CREATE POLICY "Admin can insert pimpinan_badan"
    ON public.pimpinan_badan FOR INSERT
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can update pimpinan_badan" ON public.pimpinan_badan;
CREATE POLICY "Admin can update pimpinan_badan"
    ON public.pimpinan_badan FOR UPDATE
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can delete pimpinan_badan" ON public.pimpinan_badan;
CREATE POLICY "Admin can delete pimpinan_badan"
    ON public.pimpinan_badan FOR DELETE
    USING (public.is_admin());

-- Seed data Kepala Badan jika belum ada
INSERT INTO public.pimpinan_badan (nama, nip, golongan, jabatan)
VALUES ('AHMAD MUZAIYIN, S.Sos., MA', '19740328 199311 1 001', 'Pembina Utama Muda (IV/c)', 'Kepala Badan')
ON CONFLICT DO NOTHING;

-- 10. Tambahkan Kebijakan RLS Tulis untuk Admin pada tabel bidang_kesbangpol dan staf_bidang
DROP POLICY IF EXISTS "Admin can insert departments" ON public.bidang_kesbangpol;
CREATE POLICY "Admin can insert departments" ON public.bidang_kesbangpol FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can update departments" ON public.bidang_kesbangpol;
CREATE POLICY "Admin can update departments" ON public.bidang_kesbangpol FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can delete departments" ON public.bidang_kesbangpol;
CREATE POLICY "Admin can delete departments" ON public.bidang_kesbangpol FOR DELETE USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can insert staff" ON public.staf_bidang;
CREATE POLICY "Admin can insert staff" ON public.staf_bidang FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can update staff" ON public.staf_bidang;
CREATE POLICY "Admin can update staff" ON public.staf_bidang FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can delete staff" ON public.staf_bidang;
CREATE POLICY "Admin can delete staff" ON public.staf_bidang FOR DELETE USING (public.is_admin());
