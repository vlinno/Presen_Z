-- ============================================
-- Migrasi: Fitur Pengaturan Lokasi Kantor Dinamis
-- ============================================

-- 1. Buat tabel pengaturan_kantor
CREATE TABLE IF NOT EXISTS public.pengaturan_kantor (
    id INT PRIMARY KEY DEFAULT 1,
    nama VARCHAR(255) NOT NULL DEFAULT 'Kantor Kesbangpol Kota Banjarmasin',
    latitude DOUBLE PRECISION NOT NULL DEFAULT -3.327335,
    longitude DOUBLE PRECISION NOT NULL DEFAULT 114.588700,
    radius_meter INT NOT NULL DEFAULT 50,
    jam_masuk TIME NOT NULL DEFAULT '08:00:00',
    jam_pulang TIME NOT NULL DEFAULT '16:00:00',
    CONSTRAINT only_one_row CHECK (id = 1) -- Membatasi hanya ada satu baris data pengaturan
);

-- 2. Aktifkan RLS pada pengaturan_kantor
ALTER TABLE public.pengaturan_kantor ENABLE ROW LEVEL SECURITY;

-- 3. Kebijakan RLS untuk tabel pengaturan_kantor
DROP POLICY IF EXISTS "Everyone can view pengaturan_kantor" ON public.pengaturan_kantor;
CREATE POLICY "Everyone can view pengaturan_kantor"
    ON public.pengaturan_kantor FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Admin can update pengaturan_kantor" ON public.pengaturan_kantor;
CREATE POLICY "Admin can update pengaturan_kantor"
    ON public.pengaturan_kantor FOR UPDATE
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can insert pengaturan_kantor" ON public.pengaturan_kantor;
CREATE POLICY "Admin can insert pengaturan_kantor"
    ON public.pengaturan_kantor FOR INSERT
    WITH CHECK (public.is_admin());

-- 4. Masukkan data default kantor
INSERT INTO public.pengaturan_kantor (id, nama, latitude, longitude, radius_meter, jam_masuk, jam_pulang)
VALUES (1, 'Kantor Kesbangpol Kota Banjarmasin', -3.327335, 114.588700, 50, '08:00:00', '16:00:00')
ON CONFLICT (id) DO UPDATE SET
    nama = EXCLUDED.nama,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    radius_meter = EXCLUDED.radius_meter,
    jam_masuk = EXCLUDED.jam_masuk,
    jam_pulang = EXCLUDED.jam_pulang;
