"use client"

import { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { createClient } from "@/utils/supabase/client"

// ── Types ────────────────────────────────────────────────────
interface DonorPin {
  id: string
  businessName: string
  foodType: string
  quantity: string
  lat: number
  lng: number
}

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
  const [donors, setDonors] = useState<DonorPin[]>([])
  const [loading, setLoading] = useState(true)
  const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set())
  const supabase = createClient()

  useEffect(() => {
    async function fetchDonors() {
      // Fetch available food items joined with donor profiles for location + name
      const { data, error } = await supabase
        .from('food_items')
        .select('id, item_name, category, quantity_kg, donor_id, profiles(organization_name, latitude, longitude)')
        .eq('status', 'Available')
        .order('created_at', { ascending: false })

      if (error) {
        console.error("Error fetching map donors:", error)
        setLoading(false)
        return
      }

      if (data) {
        const pins: DonorPin[] = data
          .filter((item: any) => {
            const profile = item.profiles
            return profile?.latitude && profile?.longitude
          })
          .map((item: any) => ({
            id: item.id,
            businessName: item.profiles?.organization_name || "Local Donor",
            foodType: item.item_name,
            quantity: `${item.quantity_kg} kg`,
            lat: Number(item.profiles.latitude),
            lng: Number(item.profiles.longitude),
          }))
        setDonors(pins)
      }
      setLoading(false)
    }

    fetchDonors()
  }, [])

  const handleClaim = async (donorId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert("Please log in to claim food.")
      return
    }

    const { error: claimError } = await supabase.from('claims').insert([{
      food_item_id: donorId,
      ngo_id: user.id,
      status: 'Pending'
    }])

    if (claimError) {
      alert("Failed to claim: " + claimError.message)
      return
    }

    await supabase.from('food_items').update({ status: 'Claimed' }).eq('id', donorId)
    setClaimedIds(prev => new Set(prev).add(donorId))
  }

  // Default center: LPU campus
  const defaultCenter: [number, number] = [31.2553, 75.9592]

  return (
    <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 relative">
      {/* Legend overlay */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-lg px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 shadow-md border border-slate-200 dark:border-slate-700 flex items-center gap-2">
        <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        {loading ? "Loading donors…" : `${donors.length} Active Donor${donors.length !== 1 ? 's' : ''}`}
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={15}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {donors.map((donor) => {
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
