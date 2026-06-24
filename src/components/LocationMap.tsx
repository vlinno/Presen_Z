'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { OFFICE_LOCATION } from '@/lib/geolocation'

interface LocationMapProps {
  userLat: number | null
  userLon: number | null
  accuracy: number | null
  distance: number | null
  withinRadius: boolean
  officeLat?: number
  officeLon?: number
  officeRadius?: number
  officeName?: string
}

export default function LocationMap({
  userLat,
  userLon,
  accuracy,
  distance,
  withinRadius,
  officeLat = OFFICE_LOCATION.latitude,
  officeLon = OFFICE_LOCATION.longitude,
  officeRadius = OFFICE_LOCATION.radiusMeters,
  officeName = OFFICE_LOCATION.name,
}: LocationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const officeMarkerRef = useRef<L.Marker | null>(null)
  const officeCircleRef = useRef<L.Circle | null>(null)
  const userMarkerRef = useRef<L.Marker | null>(null)
  const userCircleRef = useRef<L.Circle | null>(null)

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: [officeLat, officeLon],
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

    const marker = L.marker([officeLat, officeLon], {
      icon: officeIcon,
    })
      .addTo(map)
      .bindPopup(
        `<div style="text-align:center;font-family:system-ui;min-width:160px">
          <strong style="font-size:13px;color:#16a34a">📍 ${officeName}</strong><br/>
          <span style="font-size:11px;color:#666">Titik absensi</span><br/>
          <span style="font-size:11px;color:#888">Radius: ${officeRadius}m</span>
        </div>`
      )
    officeMarkerRef.current = marker

    // Office radius circle
    const circle = L.circle([officeLat, officeLon], {
      radius: officeRadius,
      color: '#22c55e',
      fillColor: '#22c55e',
      fillOpacity: 0.08,
      weight: 2,
      dashArray: '6, 6',
    }).addTo(map)
    officeCircleRef.current = circle

    mapRef.current = map

    // Cleanup
    return () => {
      map.remove()
      mapRef.current = null
      officeMarkerRef.current = null
      officeCircleRef.current = null
      userMarkerRef.current = null
      userCircleRef.current = null
    }
  }, [])

  // Update office marker & circle dynamically when office props change
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (officeMarkerRef.current) {
      officeMarkerRef.current.setLatLng([officeLat, officeLon])
      officeMarkerRef.current.setPopupContent(
        `<div style="text-align:center;font-family:system-ui;min-width:160px">
          <strong style="font-size:13px;color:#16a34a">📍 ${officeName}</strong><br/>
          <span style="font-size:11px;color:#666">Titik absensi</span><br/>
          <span style="font-size:11px;color:#888">Radius: ${officeRadius}m</span>
        </div>`
      )
    }

    if (officeCircleRef.current) {
      officeCircleRef.current.setLatLng([officeLat, officeLon])
      officeCircleRef.current.setRadius(officeRadius)
    }

    if (userLat === null || userLon === null) {
      map.setView([officeLat, officeLon], 17)
    } else {
      const bounds = L.latLngBounds(
        [officeLat, officeLon],
        [userLat, userLon]
      )
      map.fitBounds(bounds.pad(0.3), { maxZoom: 17 })
    }
  }, [officeLat, officeLon, officeRadius, officeName, userLat, userLon])

  // Update user marker when position changes
  useEffect(() => {
    const map = mapRef.current
    if (!map || userLat === null || userLon === null) return

    // User icon — blue if within radius, red if outside
    const userIcon = L.divIcon({
      html: `<div style="
        width: 20px; height: 20px;
        background: ${withinRadius ? '#3b82f6' : '#ef4444'};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 0 2px ${withinRadius ? '#3b82f6' : '#ef4444'}, 0 2px 6px rgba(0,0,0,0.3);
      "></div>`,
      className: '',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    })

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLat, userLon])
      userMarkerRef.current.setIcon(userIcon)
    } else {
      userMarkerRef.current = L.marker([userLat, userLon], { icon: userIcon })
        .addTo(map)
    }

    // Update popup content
    userMarkerRef.current.bindPopup(
      `<div style="text-align:center;font-family:system-ui;min-width:140px">
        <strong style="font-size:13px;color:${withinRadius ? '#3b82f6' : '#ef4444'}">📱 Posisi Anda</strong><br/>
        <span style="font-size:11px;color:#666">Jarak: ${distance}m dari kantor</span><br/>
        <span style="font-size:11px;color:${withinRadius ? '#16a34a' : '#ef4444'};font-weight:600">
          ${withinRadius ? '✅ Dalam area absensi' : '❌ Di luar area absensi'}
        </span>
      </div>`
    )

    // Accuracy circle
    if (accuracy) {
      if (userCircleRef.current) {
        userCircleRef.current.setLatLng([userLat, userLon])
        userCircleRef.current.setRadius(accuracy)
      } else {
        userCircleRef.current = L.circle([userLat, userLon], {
          radius: accuracy,
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.06,
          weight: 1,
        }).addTo(map)
      }
    }

    // Fit bounds to show both markers
    const bounds = L.latLngBounds(
      [officeLat, officeLon],
      [userLat, userLon]
    )
    map.fitBounds(bounds.pad(0.3), { maxZoom: 17 })
  }, [userLat, userLon, accuracy, distance, withinRadius, officeLat, officeLon])

  return (
    <div className="glass-card overflow-hidden mb-6 animate-fade-in">
      {/* Map header */}
      <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span className="text-sm font-semibold text-neutral-800">Peta Lokasi</span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[10px] text-neutral-500">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block border border-white shadow-sm"></span>
            Kantor
          </span>
          <span className="flex items-center gap-1">
            <span className={`w-2.5 h-2.5 rounded-full inline-block border border-white shadow-sm ${withinRadius ? 'bg-blue-500' : 'bg-red-500'}`}></span>
            Anda
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-0 border-t-2 border-dashed border-green-500 inline-block"></span>
            Radius {officeRadius}m
          </span>
        </div>
      </div>

      {/* Map container */}
      <div
        ref={mapContainerRef}
        className="w-full"
        style={{ height: '280px' }}
      />

      {/* Distance indicator bar */}
      {distance !== null && (
        <div className={`px-4 py-2.5 text-center text-xs font-semibold ${
          withinRadius
            ? 'bg-green-50 text-green-700'
            : 'bg-red-50 text-red-700'
        }`}>
          {withinRadius
            ? `✅ Anda berada ${distance}m dari titik absensi — dalam jangkauan`
            : `❌ Anda berada ${distance}m dari titik absensi — di luar radius ${officeRadius}m`}
        </div>
      )}
    </div>
  )
}
