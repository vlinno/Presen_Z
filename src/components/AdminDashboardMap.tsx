'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { OFFICE_LOCATION } from '@/lib/geolocation'

interface CheckedInStudent {
  id: string
  nama_lengkap: string
  nama_kampus: string
  jam_masuk: string | null
  latitude_masuk: number | null
  longitude_masuk: number | null
  jam_pulang: string | null
  latitude_pulang: number | null
  longitude_pulang: number | null
}

interface AdminDashboardMapProps {
  students: CheckedInStudent[]
  focusedLatLng: [number, number] | null
}

export default function AdminDashboardMap({
  students,
  focusedLatLng,
}: AdminDashboardMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<{ [key: string]: L.Marker }>({})

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: [OFFICE_LOCATION.latitude, OFFICE_LOCATION.longitude],
      zoom: 16,
      zoomControl: true,
      attributionControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map)

    // Office marker (custom green icon)
    const officeIcon = L.divIcon({
      html: `<div style="
        width: 36px; height: 36px;
        background: linear-gradient(135deg, #22c55e, #16a34a);
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="none">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>`,
      className: '',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    })

    L.marker([OFFICE_LOCATION.latitude, OFFICE_LOCATION.longitude], {
      icon: officeIcon,
    })
      .addTo(map)
      .bindPopup(
        `<div style="text-align:center;font-family:system-ui;min-width:160px">
          <strong style="font-size:13px;color:#16a34a">📍 ${OFFICE_LOCATION.name}</strong><br/>
          <span style="font-size:11px;color:#666">Titik Absensi Kantor</span><br/>
          <span style="font-size:11px;color:#888">Radius: ${OFFICE_LOCATION.radiusMeters}m</span>
        </div>`
      )

    // Office radius circle
    L.circle([OFFICE_LOCATION.latitude, OFFICE_LOCATION.longitude], {
      radius: OFFICE_LOCATION.radiusMeters,
      color: '#22c55e',
      fillColor: '#22c55e',
      fillOpacity: 0.05,
      weight: 2,
      dashArray: '6, 6',
    }).addTo(map)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Render/Update Student Markers
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Clear old markers
    Object.values(markersRef.current).forEach((m) => m.remove())
    markersRef.current = {}

    const boundsPoints: L.LatLngExpression[] = [
      [OFFICE_LOCATION.latitude, OFFICE_LOCATION.longitude]
    ]

    students.forEach((student) => {
      // Check-in Marker
      if (student.latitude_masuk !== null && student.longitude_masuk !== null) {
        const checkInIcon = L.divIcon({
          html: `<div style="
            width: 28px; height: 28px;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex; align-items: center; justify-content: center;
          ">
            <span style="color: white; font-size: 10px; font-weight: bold;">
              ${student.nama_lengkap?.charAt(0)?.toUpperCase()}
            </span>
          </div>`,
          className: '',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        })

        const marker = L.marker([student.latitude_masuk, student.longitude_masuk], { icon: checkInIcon })
          .addTo(map)
          .bindPopup(
            `<div style="font-family:system-ui;min-width:160px">
              <strong style="font-size:12px;color:#1d4ed8">📥 Check-In Hari Ini</strong><br/>
              <span style="font-size:11px;font-weight:bold;color:#333">${student.nama_lengkap}</span><br/>
              <span style="font-size:10px;color:#666">${student.nama_kampus}</span><br/>
              <span style="font-size:10px;color:#888">Jam: ${student.jam_masuk?.substring(0, 5) || '-'}</span>
            </div>`
          )
        
        markersRef.current[`masuk-${student.id}`] = marker
        boundsPoints.push([student.latitude_masuk, student.longitude_masuk])
      }

      // Check-out Marker
      if (student.latitude_pulang !== null && student.longitude_pulang !== null) {
        const checkOutIcon = L.divIcon({
          html: `<div style="
            width: 28px; height: 28px;
            background: linear-gradient(135deg, #a855f7, #7e22ce);
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex; align-items: center; justify-content: center;
          ">
            <span style="color: white; font-size: 10px; font-weight: bold;">
              ${student.nama_lengkap?.charAt(0)?.toUpperCase()}
            </span>
          </div>`,
          className: '',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        })

        const marker = L.marker([student.latitude_pulang, student.longitude_pulang], { icon: checkOutIcon })
          .addTo(map)
          .bindPopup(
            `<div style="font-family:system-ui;min-width:160px">
              <strong style="font-size:12px;color:#7e22ce">📤 Check-Out Hari Ini</strong><br/>
              <span style="font-size:11px;font-weight:bold;color:#333">${student.nama_lengkap}</span><br/>
              <span style="font-size:10px;color:#666">${student.nama_kampus}</span><br/>
              <span style="font-size:10px;color:#888">Jam: ${student.jam_pulang?.substring(0, 5) || '-'}</span>
            </div>`
          )
        
        markersRef.current[`pulang-${student.id}`] = marker
        boundsPoints.push([student.latitude_pulang, student.longitude_pulang])
      }
    })

    // Fit bounds to show everyone on load (if markers exist)
    if (boundsPoints.length > 1 && !focusedLatLng) {
      const bounds = L.latLngBounds(boundsPoints)
      map.fitBounds(bounds.pad(0.25), { maxZoom: 17 })
    }
  }, [students])

  // Center/focus on clicked student
  useEffect(() => {
    const map = mapRef.current
    if (!map || !focusedLatLng) return

    map.setView(focusedLatLng, 18, { animate: true })
  }, [focusedLatLng])

  return (
    <div className="relative w-full h-[450px] md:h-[500px] rounded-2xl overflow-hidden border border-neutral-200 shadow-sm glass-card">
      <div className="absolute top-3 left-12 z-[400] bg-white/95 px-3 py-1.5 rounded-lg border border-neutral-200/80 shadow-md text-[10px] text-neutral-600 flex gap-3 font-semibold backdrop-blur-xs">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block border border-white shadow-sm"></span>
          Kantor
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block border border-white shadow-sm"></span>
          Check-In
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block border border-white shadow-sm"></span>
          Check-Out
        </span>
      </div>
      <div
        ref={mapContainerRef}
        className="w-full h-full"
      />
    </div>
  )
}
