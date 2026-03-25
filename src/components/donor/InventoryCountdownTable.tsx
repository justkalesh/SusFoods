"use client"

import { useState, useEffect, useCallback } from "react"
import { type FoodItem } from "@/lib/mock-data"
import { calculateTimeRemaining } from "@/lib/engine"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Clock, Timer, Package } from "lucide-react"

interface InventoryCountdownTableProps {
  items: FoodItem[]
  onDonate?: (itemId: string) => void
  actionSlot?: (item: FoodItem) => React.ReactNode
}

function formatCountdown(expiryIso: string): string {
  const now = Date.now()
  const expiry = new Date(expiryIso).getTime()
  const diff = expiry - now

  if (diff <= 0) return "00:00:00"

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

export function InventoryCountdownTable({ items, onDonate, actionSlot }: InventoryCountdownTableProps) {
  const [, setTick] = useState(0)

  // Tick every second to re-render countdowns
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const getStatusBadge = useCallback((item: FoodItem) => {
    const { statusColor } = calculateTimeRemaining(item.safeToConsumeUntil)
    const styles: Record<string, string> = {
      red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800",
      yellow: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
      green: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    }
    const labels: Record<string, string> = { red: "Critical", yellow: "Warning", green: "Safe" }
    return (
      <Badge variant="outline" className={`gap-1 text-xs ${styles[statusColor]}`}>
        <Clock className="w-3 h-3" />
        {labels[statusColor]}
      </Badge>
    )
  }, [])

  const getCountdownStyle = useCallback((expiryIso: string) => {
    const { statusColor } = calculateTimeRemaining(expiryIso)
    switch (statusColor) {
      case "red":
        return "text-red-600 dark:text-red-400 font-bold animate-pulse"
      case "yellow":
        return "text-amber-600 dark:text-amber-400 font-semibold"
      default:
        return "text-emerald-600 dark:text-emerald-400 font-medium"
    }
  }, [])

  return (
    <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-white/5 border-b-2 border-b-emerald-500/30 shadow-inner">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-heading">
          <Package className="h-5 w-5 text-emerald-500" /> Inventory Countdown
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          {items.length} items tracked · Countdowns update in real time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-slate-200 dark:border-white/5 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/30">
                <TableHead className="text-slate-600 dark:text-slate-400">Item Name</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400">Category</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400 text-right">Qty (kg)</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5" />
                    Expires In
                  </div>
                </TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400">Status</TableHead>
                {(onDonate || actionSlot) && (
                  <TableHead className="text-slate-600 dark:text-slate-400 text-right">Action</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow
                  key={item.id}
                  className="border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors"
                >
                  <TableCell className="font-medium text-slate-800 dark:text-slate-200">{item.itemName}</TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">
                      {item.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-slate-700 dark:text-slate-300">
                    {item.quantityKg}
                  </TableCell>
                  <TableCell>
                    <span className={`font-mono text-sm tabular-nums ${getCountdownStyle(item.safeToConsumeUntil)}`} suppressHydrationWarning>
                      {formatCountdown(item.safeToConsumeUntil)}
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(item)}</TableCell>
                  {(onDonate || actionSlot) && (
                    <TableCell className="text-right">
                      {actionSlot ? actionSlot(item) : null}
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                    No inventory items. Start logging surplus to see countdowns here.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
