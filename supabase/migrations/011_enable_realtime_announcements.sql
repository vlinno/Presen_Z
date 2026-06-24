-- ============================================
-- Migrasi: Mengaktifkan Realtime untuk Pengumuman
-- ============================================

-- Mengaktifkan Realtime untuk tabel public.pengumuman
-- Skrip ini memeriksa apakah publikasi supabase_realtime ada dan mendaftarkan tabel pengumuman
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'pengumuman'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.pengumuman;
    END IF;
  END IF;
END $$;
