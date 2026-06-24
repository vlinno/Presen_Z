-- ============================================
-- Migrasi: Fungsi SECURITY DEFINER untuk Sinkronisasi Hari Libur Nasional
-- ============================================

CREATE OR REPLACE FUNCTION public.sync_national_holidays(holiday_data JSONB)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.hari_libur (tanggal, keterangan, tipe)
    SELECT 
        (elem->>'tanggal')::DATE,
        (elem->>'keterangan')::VARCHAR(255),
        COALESCE(elem->>'tipe', 'nasional')::VARCHAR(50)
    FROM jsonb_array_elements(holiday_data) AS elem
    ON CONFLICT (tanggal) DO UPDATE 
    SET keterangan = EXCLUDED.keterangan,
        tipe = EXCLUDED.tipe;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Berikan izin eksekusi kepada pengguna terautentikasi (termasuk mahasiswa)
GRANT EXECUTE ON FUNCTION public.sync_national_holidays(JSONB) TO authenticated;
