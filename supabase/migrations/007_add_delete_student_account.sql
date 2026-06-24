-- ============================================
-- Migrasi: Fitur Penghapusan Akun Mahasiswa
-- ============================================

CREATE OR REPLACE FUNCTION public.delete_user_by_admin(target_user_uuid UUID)
RETURNS void AS $$
BEGIN
    -- Validasi apakah user yang mengeksekusi fungsi ini adalah admin
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Akses ditolak. Hanya administrator yang dapat menghapus akun.';
    END IF;

    -- Hapus user dari tabel auth.users
    -- Hal ini akan memicu ON DELETE CASCADE pada tabel public.profiles dan public.absensi
    DELETE FROM auth.users WHERE id = target_user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Fungsi untuk menghapus beberapa user sekaligus dari auth.users oleh admin (bulk)
CREATE OR REPLACE FUNCTION public.delete_users_by_admin(target_user_uuids UUID[])
RETURNS void AS $$
BEGIN
    -- Validasi apakah user yang mengeksekusi fungsi ini adalah admin
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Akses ditolak. Hanya administrator yang dapat menghapus akun.';
    END IF;

    -- Hapus user dari tabel auth.users berdasarkan array UUID
    DELETE FROM auth.users WHERE id = ANY(target_user_uuids);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

