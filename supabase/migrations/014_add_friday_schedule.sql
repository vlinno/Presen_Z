-- Migration 014: Tambah kolom jam pulang khusus hari Jumat
-- Jam kerja:
--   Senin - Kamis : 08:00 - 16:30 WITA
--   Jumat         : 08:00 - 11:00 WITA

ALTER TABLE pengaturan_kantor
  ADD COLUMN IF NOT EXISTS jam_pulang_jumat TIME DEFAULT '11:00:00';

-- Update jam pulang hari biasa menjadi 16:30
UPDATE pengaturan_kantor
SET
  jam_masuk         = '08:00:00',
  jam_pulang        = '16:30:00',
  jam_pulang_jumat  = '11:00:00'
WHERE id = 1;
