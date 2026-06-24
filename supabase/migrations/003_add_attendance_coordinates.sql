-- Add check-in and check-out location coordinates to absensi table
ALTER TABLE public.absensi 
ADD COLUMN IF NOT EXISTS latitude_masuk DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude_masuk DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS latitude_pulang DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude_pulang DOUBLE PRECISION;
