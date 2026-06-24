-- ============================================
-- Migrasi: Fitur Kalender Hari Libur Nasional & Lokal
-- ============================================

-- 1. Buat tabel hari_libur
CREATE TABLE IF NOT EXISTS public.hari_libur (
    id SERIAL PRIMARY KEY,
    tanggal DATE UNIQUE NOT NULL,
    keterangan VARCHAR(255) NOT NULL,
    tipe VARCHAR(50) DEFAULT 'nasional' CHECK (tipe IN ('nasional', 'lokal', 'khusus'))
);

-- 2. Aktifkan RLS
ALTER TABLE public.hari_libur ENABLE ROW LEVEL SECURITY;

-- 3. Kebijakan RLS untuk tabel hari_libur
DROP POLICY IF EXISTS "Everyone can view hari_libur" ON public.hari_libur;
CREATE POLICY "Everyone can view hari_libur"
    ON public.hari_libur FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Admin can manage hari_libur" ON public.hari_libur;
CREATE POLICY "Admin can manage hari_libur"
    ON public.hari_libur FOR ALL
    USING (public.is_admin());
