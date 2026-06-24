'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface OfficeLocationPickerProps {
  lat: number
  lng: number
  radius: number
  onLocationChange: (lat: number, lng: number) => void
}

export default function OfficeLocationPicker({
  lat,
  lng,
  radius,
  onLocationChange,
}: OfficeLocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const circleRef = useRef<L.Circle | null>(null)

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 17,
      zoomControl: true,
      attributionControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map)

    // Custom green marker icon
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

    // Draggable marker
    const marker = L.marker([lat, lng], {
      icon: officeIcon,
      draggable: true,
    }).addTo(map)

    // Radius circle
    const circle = L.circle([lat, lng], {
      radius: radius,
      color: '#22c55e',
      fillColor: '#22c55e',
      fillOpacity: 0.08,
      weight: 2,
      dashArray: '6, 6',
    }).addTo(map)

    // Handle marker drag
    marker.on('dragend', () => {
      const position = marker.getLatLng()
      onLocationChange(position.lat, position.lng)
    })

    // Handle map click to place marker
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng
      onLocationChange(lat, lng)
    })

    mapRef.current = map
    markerRef.current = marker
    circleRef.current = circle

    // Cleanup
    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
      circleRef.current = null
    }
  }, []) // Initialize once

  // Dynamically update marker and circle when props change from form input
  useEffect(() => {
    if (!mapRef.current) return

    const currentLatLng = L.latLng(lat, lng)

    if (markerRef.current) {
      markerRef.current.setLatLng(currentLatLng)
    }

    if (circleRef.current) {
      circleRef.current.setLatLng(currentLatLng)
      circleRef.current.setRadius(radius)
    }

    // Pan map to new center smoothly if it moves
    const mapCenter = mapRef.current.getCenter()
    if (mapCenter.lat !== lat || mapCenter.lng !== lng) {
      mapRef.current.panTo(currentLatLng)
    }
  }, [lat, lng, radius])

  return (
    <div className="relative w-full h-[350px] md:h-[400px] rounded-2xl overflow-hidden border border-neutral-200 shadow-inner">
      <div ref={mapContainerRef} className="w-full h-full" />
      <div className="absolute bottom-2 left-2 z-[400] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-neutral-200/50 shadow-sm text-[10px] text-neutral-500 font-medium">
        👉 Tarik penanda hijau atau klik di peta untuk menentukan koordinat
      </div>
    </div>
  )
}
