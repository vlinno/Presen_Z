-- ============================================
-- Sistem Pembersihan Data Otomatis Mingguan
-- Menggunakan Ekstensi pg_cron Bawaan Supabase
-- ============================================

-- 1. Aktifkan ekstensi pg_cron jika belum aktif
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Buat fungsi pembersih data
CREATE OR REPLACE FUNCTION public.clean_old_data()
RETURNS void AS $$
BEGIN
    -- A. Hapus pengumuman yang lebih lama dari 7 hari
    DELETE FROM public.pengumuman
    WHERE created_at < NOW() - INTERVAL '7 days';

    -- B. Hapus berkas bukti izin fisik dari Supabase Storage yang lebih lama dari 7 hari
    -- Triger bawaan Supabase akan otomatis menghapus file fisik di penyimpanan cloud saat baris ini dihapus dari storage.objects
    DELETE FROM storage.objects
    WHERE bucket_id = 'bukti_izin' AND created_at < NOW() - INTERVAL '7 days';

    -- C. Hapus referensi URL bukti izin pada tabel absensi yang lebih lama dari 7 hari
    UPDATE public.absensi
    SET bukti_izin_url = NULL
    WHERE tanggal < CURRENT_DATE - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Jadwalkan eksekusi otomatis setiap hari Minggu pukul 00:00 WITA (00:00 UTC)
-- Menggunakan schedule pg_cron
SELECT cron.schedule(
    'clean-old-data-weekly',  -- Nama unik jadwal
    '0 0 * * 0',              -- Cron expression: Setiap hari Minggu jam 00:00
    'SELECT public.clean_old_data()'
);
