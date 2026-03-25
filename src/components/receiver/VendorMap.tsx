"use client"

import { useState } from "react"
import { MOCK_VENDORS, type Vendor } from "@/lib/mock-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Store, Package, X } from "lucide-react"

interface VendorMapProps {
  vendors?: Vendor[]
}

export function VendorMap({ vendors = MOCK_VENDORS }: VendorMapProps) {
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)

  // Normalize coordinates to percentage positions within the map container
  const latRange = { min: 28.605, max: 28.630 }
  const lngRange = { min: 77.190, max: 77.235 }

  const toPercent = (val: number, min: number, max: number) =>
    Math.max(5, Math.min(90, ((val - min) / (max - min)) * 85 + 5))

  return (
    <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-white/5 border-b-2 border-b-sky-500/50 shadow-inner">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-heading">
          <MapPin className="h-5 w-5 text-sky-500" /> Mapped Vendors Nearby
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          {vendors.length} active vendors with available donations in your area
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-[400px] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10">
          {/* Grid overlay to simulate map */}
          <div className="absolute inset-0 opacity-20">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={`h-${i}`}
                className="absolute w-full h-px bg-slate-400 dark:bg-slate-600"
                style={{ top: `${(i + 1) * 11.11}%` }}
              />
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={`v-${i}`}
                className="absolute h-full w-px bg-slate-400 dark:bg-slate-600"
                style={{ left: `${(i + 1) * 11.11}%` }}
              />
            ))}
          </div>

          {/* Road-like lines */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-300 dark:bg-slate-600 opacity-60" />
          <div className="absolute left-1/3 top-0 h-full w-0.5 bg-slate-300 dark:bg-slate-600 opacity-60" />
          <div className="absolute left-2/3 top-0 h-full w-0.5 bg-slate-300 dark:bg-slate-600 opacity-60" />
          <div className="absolute top-[30%] left-[10%] w-[80%] h-0.5 bg-slate-300 dark:bg-slate-600 opacity-40 rotate-6" />

          {/* "You are here" marker */}
          <div
            className="absolute z-20 flex flex-col items-center"
            style={{ top: "50%", left: "50%", transform: "translate(-50%, -100%)" }}
          >
            <div className="relative">
              <div className="absolute -inset-2 rounded-full bg-sky-400/30 animate-ping" />
              <div className="w-4 h-4 rounded-full bg-sky-500 border-2 border-white dark:border-slate-900 shadow-lg relative z-10" />
            </div>
            <span className="mt-1 text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-white/80 dark:bg-slate-900/80 px-1.5 py-0.5 rounded-full shadow-sm backdrop-blur-sm">
              You
            </span>
          </div>

          {/* Vendor pins */}
          {vendors.map((vendor) => {
            const top = toPercent(vendor.lat, latRange.min, latRange.max)
            const left = toPercent(vendor.lng, lngRange.min, lngRange.max)
            const isSelected = selectedVendor?.id === vendor.id

            return (
              <button
                key={vendor.id}
                className="absolute z-10 group cursor-pointer"
                style={{ top: `${100 - top}%`, left: `${left}%`, transform: "translate(-50%, -100%)" }}
                onClick={() => setSelectedVendor(isSelected ? null : vendor)}
              >
                <div className={`relative transition-all duration-200 ${isSelected ? "scale-125" : "hover:scale-110"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                    isSelected
                      ? "bg-emerald-500 text-white shadow-emerald-500/40"
                      : "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white"
                  }`}>
                    <Store className="w-4 h-4" />
                  </div>
                  {/* Item count bubble */}
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
                    {vendor.activeItems}
                  </span>
                </div>
                {/* Hover tooltip */}
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-slate-900 dark:bg-slate-700 text-white text-xs px-2 py-1 rounded-md shadow-lg">
                    {vendor.name}
                  </div>
                </div>
              </button>
            )
          })}

          {/* Selected vendor detail card */}
          {selectedVendor && (
            <div className="absolute bottom-4 left-4 right-4 z-30 animate-in slide-in-from-bottom-4 duration-200">
              <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-xl border border-slate-200 dark:border-white/10 p-4 shadow-xl">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                      <Store className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">{selectedVendor.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{selectedVendor.category} · {selectedVendor.distance}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedVendor(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Badge className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                    <Package className="w-3 h-3 mr-1" />
                    {selectedVendor.activeItems} active listing{selectedVendor.activeItems !== 1 ? "s" : ""}
                  </Badge>
                  <Badge variant="outline" className="text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700">
                    <MapPin className="w-3 h-3 mr-1" />
                    {selectedVendor.distance}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
