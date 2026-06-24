-- ============================================
-- Migrasi Tambahan Fitur 1 - 4
-- PresenZ Digital Absensi Magang
-- ============================================

-- 1. Tambah kolom bukti_izin_url ke tabel absensi
ALTER TABLE public.absensi ADD COLUMN IF NOT EXISTS bukti_izin_url TEXT;

-- 2. Buat tabel pengumuman
CREATE TABLE IF NOT EXISTS public.pengumuman (
    id SERIAL PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    konten TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- 3. Aktifkan RLS pada tabel pengumuman
ALTER TABLE public.pengumuman ENABLE ROW LEVEL SECURITY;

-- 4. Kebijakan RLS untuk tabel pengumuman
CREATE POLICY "Authenticated users can view announcements"
    ON public.pengumuman FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admin can insert announcements"
    ON public.pengumuman FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update announcements"
    ON public.pengumuman FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "Admin can delete announcements"
    ON public.pengumuman FOR DELETE
    USING (public.is_admin());

-- 5. Inisialisasi Storage Bucket untuk bukti_izin
INSERT INTO storage.buckets (id, name, public)
VALUES ('bukti_izin', 'bukti_izin', true)
ON CONFLICT (id) DO NOTHING;

-- Kebijakan RLS untuk Storage Bukti Izin
CREATE POLICY "Anyone can view bucket objects"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'bukti_izin');

CREATE POLICY "Authenticated users can upload objects"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'bukti_izin' AND auth.role() = 'authenticated');

CREATE POLICY "Admin can delete objects"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'bukti_izin' AND public.is_admin());
