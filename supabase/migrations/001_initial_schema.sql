-- ============================================
-- PresenZ Database Schema
-- Kesbangpol Kota Banjarmasin
-- ============================================

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS bidang_kesbangpol (
    id SERIAL PRIMARY KEY,
    nama_bidang VARCHAR(255) NOT NULL,
    nama_kabid VARCHAR(255) NOT NULL,
    nip_kabid VARCHAR(50) NOT NULL,
    deskripsi_tugas TEXT NOT NULL
);

-- 2. Staff Table
CREATE TABLE IF NOT EXISTS staf_bidang (
    id SERIAL PRIMARY KEY,
    bidang_id INT REFERENCES bidang_kesbangpol(id) ON DELETE CASCADE,
    nama_staf VARCHAR(255) NOT NULL,
    jabatan VARCHAR(255) NOT NULL,
    nip_staf VARCHAR(50) NOT NULL
);
-- 3. Profiles Table (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role VARCHAR(20) DEFAULT 'magang' CHECK (role IN ('magang', 'admin')),
    nama_lengkap VARCHAR(255),
    nama_kampus VARCHAR(255),
    nim_nisn VARCHAR(50),
    bidang_id INT REFERENCES bidang_kesbangpol(id),
    nip VARCHAR(50),
    pangkat VARCHAR(100),
    instansi VARCHAR(255) DEFAULT 'Badan Kesatuan Bangsa dan Politik Kota Banjarmasin',
    tanggal_mulai DATE,
    tanggal_selesai DATE
);

-- 4. Attendance Table
CREATE TABLE IF NOT EXISTS absensi (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    tanggal DATE DEFAULT CURRENT_DATE,
    jam_masuk TIME,
    jam_pulang TIME,
    keterangan VARCHAR(50) CHECK (keterangan IN ('hadir', 'izin', 'izin kampus')),
    alasan_izin TEXT,
    latitude_masuk DOUBLE PRECISION,
    longitude_masuk DOUBLE PRECISION,
    latitude_pulang DOUBLE PRECISION,
    longitude_pulang DOUBLE PRECISION
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Helper function to check if the user is an admin without recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE absensi ENABLE ROW LEVEL SECURITY;
ALTER TABLE bidang_kesbangpol ENABLE ROW LEVEL SECURITY;
ALTER TABLE staf_bidang ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update own profile; admin can read all
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin can view all profiles"
    ON profiles FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Authenticated users can view admin profiles"
    ON profiles FOR SELECT
    TO authenticated
    USING (role = 'admin');

-- Absensi: users can manage own attendance; admin can view all
CREATE POLICY "Users can view own attendance"
    ON absensi FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attendance"
    ON absensi FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attendance"
    ON absensi FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all attendance"
    ON absensi FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admin can insert all attendance"
    ON absensi FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update all attendance"
    ON absensi FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "Admin can delete all attendance"
    ON absensi FOR DELETE
    USING (public.is_admin());

-- Bidang & Staff: everyone authenticated can read
CREATE POLICY "Authenticated users can view departments"
    ON bidang_kesbangpol FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can view staff"
    ON staf_bidang FOR SELECT
    TO authenticated
    USING (true);

-- ============================================
-- Trigger: auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, role)
    VALUES (NEW.id, 'magang');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
