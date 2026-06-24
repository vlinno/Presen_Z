-- Add internship start and end dates to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS tanggal_mulai DATE,
ADD COLUMN IF NOT EXISTS tanggal_selesai DATE;
