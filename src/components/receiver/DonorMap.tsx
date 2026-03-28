"use client"

import { useState, useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
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
  hasActiveFood: boolean
  phone: string
}

// ── Custom Marker Icons ─────────────────────────────────────
// Active donor: green circle with food emoji
const donorActiveIcon = new L.DivIcon({
  html: `<div style="background: linear-gradient(135deg, #10b981, #059669); width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(5,150,105,0.4); display:flex; align-items:center; justify-content:center;"><span style="font-size:14px;">🍲</span></div>`,
  className: "",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -18],
})

// Inactive donor: grey circle with building emoji
const donorInactiveIcon = new L.DivIcon({
  html: `<div style="background: linear-gradient(135deg, #94a3b8, #64748b); width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.15); display:flex; align-items:center; justify-content:center;"><span style="font-size:11px;">🏢</span></div>`,
  className: "",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -16],
})

// NGO's own location: purple circle with pin emoji (larger)
const ngoIcon = new L.DivIcon({
  html: `<div style="background: linear-gradient(135deg, #8b5cf6, #6d28d9); width: 36px; height: 36px; border-radius: 50%; border: 3px solid white; box-shadow: 0 3px 10px rgba(109,40,217,0.4); display:flex; align-items:center; justify-content:center;"><span style="font-size:18px;">📍</span></div>`,
  className: "",
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -22],
})

// ── Fly-to helper component ─────────────────────────────────
function FlyToCenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 })
  }, [center, zoom, map])
  return null
}

// ── Map Component (client-only) ─────────────────────────────
function DonorMapInner() {
  const [donors, setDonors] = useState<DonorPin[]>([])
  const [loading, setLoading] = useState(true)
  const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set())
  const [ngoCenter, setNgoCenter] = useState<[number, number] | null>(null)
  const [ngoName, setNgoName] = useState("Your Location")
  const [ngoPhone, setNgoPhone] = useState("")
  const [flyTarget, setFlyTarget] = useState<{ center: [number, number]; zoom: number } | null>(null)
  const supabase = createClient()

  // Default center: India overview
  const defaultCenter: [number, number] = [20.5937, 78.9629]
  const defaultZoom = 5

  useEffect(() => {
    async function fetchMapData() {
      const { data: { user } } = await supabase.auth.getUser()

      // 1. Get NGO's own coordinates from organizations table
      if (user) {
        const { data: ngoOrg } = await supabase
          .from("organizations")
          .select("name, phone, latitude, longitude")
          .eq("user_id", user.id)
          .maybeSingle()

        if (ngoOrg?.latitude && ngoOrg?.longitude) {
          const lat = Number(ngoOrg.latitude)
          const lng = Number(ngoOrg.longitude)
          if (lat !== 0 && lng !== 0) {
            setNgoCenter([lat, lng])
            setNgoName(ngoOrg.name || "Your NGO")
            if (ngoOrg.phone) setNgoPhone(ngoOrg.phone)
          }
        }
      }

      // 2. Fetch ALL organizations with valid coordinates (every registered donor)
      const { data: allOrgs, error: orgError } = await supabase
        .from('organizations')
        .select('user_id, name, phone, latitude, longitude')

      if (orgError) {
        console.warn("[DonorMap] Org query error:", orgError.message)
      }

      // Build map of all orgs with valid coordinates
      const orgList: { userId: string; name: string; phone: string; lat: number; lng: number }[] = []
      if (allOrgs) {
        for (const org of allOrgs) {
          const lat = Number(org.latitude)
          const lng = Number(org.longitude)
          if (lat && lng && lat !== 0 && lng !== 0) {
            // Skip the current NGO user (they have their own pin)
            if (user && org.user_id === user.id) continue
            orgList.push({ userId: org.user_id, name: org.name || "Registered Donor", phone: org.phone || "", lat, lng })
          }
        }
      }

      // 3. Fetch available food items to overlay active donation info
      const { data: foodData } = await supabase
        .from('food_items')
        .select('id, item_name, quantity_kg, donor_id')
        .eq('status', 'Available')

      // Group food items by donor
      const foodByDonor: Record<string, { items: string[]; totalKg: number; firstItemId: string }> = {}
      if (foodData) {
        for (const item of foodData) {
          if (!foodByDonor[item.donor_id]) {
            foodByDonor[item.donor_id] = { items: [], totalKg: 0, firstItemId: item.id }
          }
          foodByDonor[item.donor_id].items.push(item.item_name)
          foodByDonor[item.donor_id].totalKg += Number(item.quantity_kg)
        }
      }

      // 4. Create pins for ALL organizations
      const pins: DonorPin[] = orgList.map(org => {
        const food = foodByDonor[org.userId]
        return {
          id: food?.firstItemId || org.userId,
          businessName: org.name,
          foodType: food ? food.items.slice(0, 3).join(", ") : "No active listings",
          quantity: food ? `${food.totalKg} kg available` : "—",
          lat: org.lat,
          lng: org.lng,
          hasActiveFood: !!food,
          phone: org.phone,
        }
      })

      console.log("[DonorMap] Total org pins:", pins.length, "| With active food:", pins.filter(p => p.hasActiveFood).length)
      setDonors(pins)
      setLoading(false)
    }

    fetchMapData()
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

  const handleRecenter = () => {
    if (ngoCenter) {
      setFlyTarget({ center: ngoCenter, zoom: 13 })
      // Reset to trigger re-fly
      setTimeout(() => setFlyTarget(null), 100)
    }
  }

  const mapCenter = ngoCenter || defaultCenter
  const mapZoom = ngoCenter ? 13 : defaultZoom

  return (
    <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-lg border border-slate-200 relative">
      {/* Legend overlay */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/90 backdrop-blur-md rounded-lg px-3 py-2 text-xs font-medium text-slate-600 shadow-md border border-slate-200 flex items-center gap-2">
        <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        {loading ? "Loading donors…" : `${donors.length} Active Donor${donors.length !== 1 ? 's' : ''}`}
      </div>

      {/* Locator button */}
      {ngoCenter && (
        <button
          onClick={handleRecenter}
          className="absolute bottom-4 right-4 z-[1000] bg-white hover:bg-slate-50 shadow-lg border border-slate-200 rounded-lg p-2.5 transition-all hover:scale-105 active:scale-95 group"
          title="Return to your location"
        >
          <svg className="w-5 h-5 text-purple-600 group-hover:text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4m0 12v4m-10-10h4m12 0h4" />
          </svg>
        </button>
      )}

      {/* NGO badge */}
      {ngoCenter && (
        <div className="absolute top-3 left-3 z-[1000] bg-purple-600/90 backdrop-blur-md rounded-lg px-3 py-2 text-xs font-medium text-white shadow-md flex items-center gap-2">
          📍 {ngoName}
        </div>
      )}

      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {flyTarget && <FlyToCenter center={flyTarget.center} zoom={flyTarget.zoom} />}

        {/* NGO's own location marker */}
        {ngoCenter && (
          <Marker position={ngoCenter} icon={ngoIcon}>
            <Popup>
              <div style={{ minWidth: 180, fontFamily: "inherit", textAlign: "center" }}>
                <div style={{ fontWeight: 700, fontSize: "14px", color: "#6d28d9", marginBottom: "4px" }}>
                  📍 {ngoName}
                </div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>
                  Your NGO Location
                </div>
                {ngoPhone && (
                  <div style={{ fontSize: "12px", color: "#6d28d9", marginTop: "4px", fontWeight: 500 }}>
                    📞 {ngoPhone}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Donor markers */}
        {donors.map((donor) => {
          const isClaimed = claimedIds.has(donor.id)

          return (
            <Marker key={donor.id} position={[donor.lat, donor.lng]} icon={donor.hasActiveFood ? donorActiveIcon : donorInactiveIcon}>
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
                    color: donor.hasActiveFood ? "#059669" : "#94a3b8",
                    marginBottom: "2px",
                  }}>
                    <span>{donor.hasActiveFood ? "🍽️" : "🏢"}</span> {donor.foodType}
                  </div>

                  {donor.phone && (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "12px",
                      color: "#475569",
                      marginBottom: "2px",
                      marginTop: "4px",
                    }}>
                      <span>📞</span>
                      <a href={`tel:${donor.phone}`} style={{ color: "#059669", textDecoration: "none", fontWeight: 500 }}>{donor.phone}</a>
                    </div>
                  )}

                  {donor.hasActiveFood && (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "13px",
                      color: "#64748b",
                      marginBottom: "12px",
                    }}>
                      <span>📦</span> {donor.quantity}
                    </div>
                  )}

                  {donor.hasActiveFood && (
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
                  )}
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
    <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-lg border border-slate-200 bg-slate-100 flex items-center justify-center">
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
