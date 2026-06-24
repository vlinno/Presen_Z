// Koordinat Kantor Badan Kesatuan Bangsa dan Politik Kota Banjarmasin
// Jl. RE Martadinata No. 1, Blok D, Lantai III, Banjarmasin 70111
// (Area Balaikota Banjarmasin)
export const OFFICE_LOCATION = {
  latitude: -3.327335,
  longitude: 114.588700,
  // Radius dalam meter — mahasiswa harus berada dalam radius ini untuk bisa absen
  radiusMeters: 50,
  name: 'Kantor Kesbangpol Kota Banjarmasin',
}

/**
 * Menghitung jarak antara dua titik koordinat GPS menggunakan rumus Haversine.
 * @returns Jarak dalam meter
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000 // Radius bumi dalam meter
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

/**
 * Memeriksa apakah koordinat pengguna berada dalam radius kantor.
 * @returns true jika dalam radius, false jika di luar.
 */
export function isWithinOfficeRadius(
  userLat: number,
  userLon: number
): { withinRadius: boolean; distance: number } {
  const distance = calculateDistance(
    userLat,
    userLon,
    OFFICE_LOCATION.latitude,
    OFFICE_LOCATION.longitude
  )
  return {
    withinRadius: distance <= OFFICE_LOCATION.radiusMeters,
    distance: Math.round(distance),
  }
}
