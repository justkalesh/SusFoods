"use client"

import { useState, useMemo } from "react"
import { type FoodItem } from "@/lib/mock-data"
import { calculateTimeRemaining } from "@/lib/engine"
import { AlertTriangle, X, Clock } from "lucide-react"

interface ExpiringStockWarningProps {
  items: FoodItem[]
  thresholdHours?: number
}

export function ExpiringStockWarning({ items, thresholdHours = 12 }: ExpiringStockWarningProps) {
  const [dismissed, setDismissed] = useState(false)

  const criticalItems = useMemo(() => {
    return items.filter((item) => {
      if (item.status !== "Available") return false
      const { remainingHours } = calculateTimeRemaining(item.safeToConsumeUntil)
      return remainingHours > 0 && remainingHours <= thresholdHours
    })
  }, [items, thresholdHours])

  // Hide if dismissed or no critical items
  if (dismissed || criticalItems.length === 0) return null

  const hasCritical = criticalItems.some((item) => {
    const { remainingHours } = calculateTimeRemaining(item.safeToConsumeUntil)
    return remainingHours <= 4
  })

  return (
    <div
      className={`relative rounded-xl border p-4 ${
        hasCritical
          ? "bg-red-50/80 dark:bg-red-950/20 border-red-200 dark:border-red-800/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
          : "bg-amber-50/80 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50 shadow-[0_0_20px_rgba(245,158,11,0.1)]"
      }`}
    >
      {/* Pulsing border accent */}
      <div
        className={`absolute top-0 left-0 w-1 h-full rounded-l-xl ${
          hasCritical ? "bg-red-500 animate-pulse" : "bg-amber-500"
        }`}
      />

      <div className="flex items-start gap-3 pl-2">
        <div className={`mt-0.5 shrink-0 ${hasCritical ? "text-red-500 animate-bounce" : "text-amber-500"}`}>
          <AlertTriangle className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className={`text-sm font-semibold ${hasCritical ? "text-red-700 dark:text-red-400" : "text-amber-700 dark:text-amber-400"}`}>
              ⚠️ {criticalItems.length} item{criticalItems.length !== 1 ? "s" : ""} expiring soon!
            </h4>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5">
            {criticalItems.map((item) => {
              const { remainingHours, statusColor } = calculateTimeRemaining(item.safeToConsumeUntil)
              const isCritical = statusColor === "red"
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between text-xs p-2 rounded-lg ${
                    isCritical
                      ? "bg-red-100/60 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                      : "bg-amber-100/60 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
                  }`}
                >
                  <span className="font-medium truncate mr-2">
                    {item.itemName} — {item.quantityKg} kg
                  </span>
                  <span className="flex items-center gap-1 whitespace-nowrap font-mono tabular-nums">
                    <Clock className="w-3 h-3" />
                    {remainingHours < 1
                      ? `${Math.round(remainingHours * 60)}m left`
                      : `${Math.ceil(remainingHours)}h left`}
                  </span>
                </div>
              )
            })}
          </div>

          <p className={`text-[11px] mt-2 ${hasCritical ? "text-red-600/70 dark:text-red-400/60" : "text-amber-600/70 dark:text-amber-400/60"}`}>
            Consider donating these items before they expire. One tap to make them available for NGOs nearby.
          </p>
        </div>
      </div>
    </div>
  )
}
