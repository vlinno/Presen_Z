'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { OFFICE_LOCATION } from '@/lib/geolocation'

interface AdminLocationMapProps {
  studentName: string
  tanggal: string
  latMasuk: number | null
  lonMasuk: number | null
  jamMasuk: string | null
  latPulang: number | null
  lonPulang: number | null
  jamPulang: string | null
}

export default function AdminLocationMap({
  studentName,
  tanggal,
  latMasuk,
  lonMasuk,
  jamMasuk,
  latPulang,
  lonPulang,
  jamPulang,
}: AdminLocationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    // Initialize map centered at office by default
    const map = L.map(mapContainerRef.current, {
      center: [OFFICE_LOCATION.latitude, OFFICE_LOCATION.longitude],
      zoom: 17,
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

    const boundsPoints: L.LatLngExpression[] = [
      [OFFICE_LOCATION.latitude, OFFICE_LOCATION.longitude]
    ]

    // Check-in Location Marker (Blue)
    if (latMasuk !== null && lonMasuk !== null) {
      const checkInIcon = L.divIcon({
        html: `<div style="
          width: 32px; height: 32px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
        ">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="white" stroke="none">
            <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
          </svg>
        </div>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })

      L.marker([latMasuk, lonMasuk], { icon: checkInIcon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:system-ui;min-width:180px">
            <strong style="font-size:13px;color:#1d4ed8">📥 Lokasi Check-In</strong><br/>
            <span style="font-size:11px;color:#333;font-weight:600">${studentName}</span><br/>
            <span style="font-size:11px;color:#666">Jam Masuk: ${jamMasuk || '-'}</span><br/>
            <span style="font-size:11px;color:#888">Tanggal: ${tanggal}</span>
          </div>`
        )
      
      boundsPoints.push([latMasuk, lonMasuk])
    }

    // Check-out Location Marker (Purple)
    if (latPulang !== null && lonPulang !== null) {
      const checkOutIcon = L.divIcon({
        html: `<div style="
          width: 32px; height: 32px;
          background: linear-gradient(135deg, #a855f7, #7e22ce);
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
        ">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="white" stroke="none">
            <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
          </svg>
        </div>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })

      L.marker([latPulang, lonPulang], { icon: checkOutIcon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:system-ui;min-width:180px">
            <strong style="font-size:13px;color:#7e22ce">📤 Lokasi Check-Out</strong><br/>
            <span style="font-size:11px;color:#333;font-weight:600">${studentName}</span><br/>
            <span style="font-size:11px;color:#666">Jam Pulang: ${jamPulang || '-'}</span><br/>
            <span style="font-size:11px;color:#888">Tanggal: ${tanggal}</span>
          </div>`
        )
      
      boundsPoints.push([latPulang, lonPulang])
    }

    mapRef.current = map

    // Fit bounds to show all markers
    if (boundsPoints.length > 1) {
      const bounds = L.latLngBounds(boundsPoints)
      map.fitBounds(bounds.pad(0.35), { maxZoom: 17 })
    }

    // Cleanup
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [studentName, tanggal, latMasuk, lonMasuk, jamMasuk, latPulang, lonPulang, jamPulang])

  return (
    <div className="relative w-full h-[400px] md:h-[450px] rounded-xl overflow-hidden border border-neutral-200 shadow-inner">
      <div
        ref={mapContainerRef}
        className="w-full h-full"
      />
    </div>
  )
}
