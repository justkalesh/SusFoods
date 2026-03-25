"use client"

import { useState } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// ── Mock Donor Data ──────────────────────────────────────────
interface Donor {
  id: string
  businessName: string
  foodType: string
  quantity: string
  lat: number
  lng: number
}

const MOCK_DONORS: Donor[] = [
  { id: "d1", businessName: "Fresh Market Banquets",  foodType: "Prepared Meals",   quantity: "15 kg", lat: 31.2580, lng: 75.9530 },
  { id: "d2", businessName: "The Daily Bakehouse",    foodType: "Bakery & Breads",   quantity: "8 kg",  lat: 31.2540, lng: 75.9580 },
  { id: "d3", businessName: "Green Leaf Kitchens",    foodType: "Produce & Salads",  quantity: "22 kg", lat: 31.2600, lng: 75.9500 },
  { id: "d4", businessName: "Hotel Grand Paradise",   foodType: "Buffet Surplus",    quantity: "30 kg", lat: 31.2520, lng: 75.9600 },
  { id: "d5", businessName: "Sunrise Dairy Farm",     foodType: "Dairy Products",    quantity: "12 kg", lat: 31.2565, lng: 75.9470 },
  { id: "d6", businessName: "Metro Catering Co.",     foodType: "Prepared Meals",    quantity: "18 kg", lat: 31.2610, lng: 75.9560 },
]

// ── Custom Marker Icon ──────────────────────────────────────
const donorIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// ── Map Component (client-only) ─────────────────────────────
function DonorMapInner() {
  const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set())

  const handleClaim = (donorId: string) => {
    setClaimedIds(prev => new Set(prev).add(donorId))
  }

  return (
    <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 relative">
      {/* Legend overlay */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-lg px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 shadow-md border border-slate-200 dark:border-slate-700 flex items-center gap-2">
        <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        {MOCK_DONORS.length} Active Donors Nearby
      </div>

      <MapContainer
        center={[31.2560, 75.9551]}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {MOCK_DONORS.map((donor) => {
          const isClaimed = claimedIds.has(donor.id)

          return (
            <Marker key={donor.id} position={[donor.lat, donor.lng]} icon={donorIcon}>
              <Popup>
                <div style={{ minWidth: 200, fontFamily: "inherit" }}>
                  <div style={{
                    fontWeight: 700,
                    fontSize: "15px",
                    color: "#0f172a",
                    marginBottom: "4px",
                    lineHeight: 1.3,
                  }}>
                    {donor.businessName}
                  </div>

                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "13px",
                    color: "#64748b",
                    marginBottom: "2px",
                  }}>
                    <span>🍽️</span> {donor.foodType}
                  </div>

                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "13px",
                    color: "#64748b",
                    marginBottom: "12px",
                  }}>
                    <span>📦</span> {donor.quantity} available
                  </div>

                  <button
                    onClick={() => handleClaim(donor.id)}
                    disabled={isClaimed}
                    style={{
                      width: "100%",
                      padding: "8px 0",
                      borderRadius: "8px",
                      border: "none",
                      fontWeight: 600,
                      fontSize: "13px",
                      cursor: isClaimed ? "default" : "pointer",
                      transition: "all 0.2s",
                      backgroundColor: isClaimed ? "#d1fae5" : "#059669",
                      color: isClaimed ? "#065f46" : "#ffffff",
                    }}
                  >
                    {isClaimed ? "✓ Claimed" : "Claim Food"}
                  </button>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}

// ── Dynamic Export (SSR disabled) ────────────────────────────
import dynamic from "next/dynamic"

const DonorMap = dynamic(() => Promise.resolve(DonorMapInner), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-sm font-medium">Loading map…</span>
      </div>
    </div>
  ),
})

export { DonorMap }
export default DonorMap
