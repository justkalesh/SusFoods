"use client"

import { useState, useMemo, useCallback, Fragment } from "react"
import {
  Package, ChevronDown, ChevronRight, MapPin, AlertTriangle,
  ShieldAlert, Leaf, MoreHorizontal, Pencil, Trash2, Heart,
  Radio, ArrowUpDown, Search, X
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

// ══════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════
type ExpiryStatus = "CRITICAL" | "WARNING" | "FRESH"

interface InventoryItem {
  id: string
  batchId: string
  itemName: string
  quantity: number
  unit: string
  pricePerUnit: number
  expiryDate: string       // ISO timestamp
  isPubliclyVisible: boolean
}

interface BatchGroup {
  itemName: string
  batches: InventoryItem[]
  totalQuantity: number
  totalValue: number
  worstStatus: ExpiryStatus
  isExpanded: boolean
}

// ══════════════════════════════════════════════════════════════
// EXPIRY DATE LOGIC — the core engine
// ══════════════════════════════════════════════════════════════
function getHoursUntilExpiry(expiryDate: string): number {
  const now = new Date()
  const expiry = new Date(expiryDate)
  return (expiry.getTime() - now.getTime()) / (1000 * 60 * 60)
}

function getExpiryStatus(expiryDate: string): ExpiryStatus {
  const hours = getHoursUntilExpiry(expiryDate)
  if (hours < 48) return "CRITICAL"
  if (hours < 168) return "WARNING"  // 7 days = 168 hours
  return "FRESH"
}

function getDaysRemaining(expiryDate: string): string {
  const hours = getHoursUntilExpiry(expiryDate)
  if (hours < 0) return "Expired"
  if (hours < 1) return "< 1 hour"
  if (hours < 24) return `${Math.ceil(hours)}h left`
  if (hours < 48) return `${Math.ceil(hours)}h left`
  const days = Math.floor(hours / 24)
  return `${days}d left`
}

function shouldBePublic(expiryDate: string): boolean {
  const hours = getHoursUntilExpiry(expiryDate)
  return hours > 0 && hours < 168 // < 7 days and not expired
}

function getWorstStatus(statuses: ExpiryStatus[]): ExpiryStatus {
  if (statuses.includes("CRITICAL")) return "CRITICAL"
  if (statuses.includes("WARNING")) return "WARNING"
  return "FRESH"
}

// ══════════════════════════════════════════════════════════════
// MOCK DATA — simulated DB fetch
// ══════════════════════════════════════════════════════════════
const now = new Date()
function hoursFromNow(h: number): string {
  return new Date(now.getTime() + h * 60 * 60 * 1000).toISOString()
}

const INITIAL_INVENTORY: InventoryItem[] = [
  // Sandwiches — one critical, one warning, one fresh
  { id: "inv-01", batchId: "SW-2026-001", itemName: "Paneer Sandwiches",   quantity: 120, unit: "pieces",  pricePerUnit: 45,  expiryDate: hoursFromNow(18),   isPubliclyVisible: true },
  { id: "inv-02", batchId: "SW-2026-002", itemName: "Paneer Sandwiches",   quantity: 80,  unit: "pieces",  pricePerUnit: 45,  expiryDate: hoursFromNow(96),   isPubliclyVisible: true },
  { id: "inv-03", batchId: "SW-2026-003", itemName: "Paneer Sandwiches",   quantity: 200, unit: "pieces",  pricePerUnit: 45,  expiryDate: hoursFromNow(240),  isPubliclyVisible: false },

  // Biryani batches
  { id: "inv-04", batchId: "BR-2026-001", itemName: "Veg Biryani",         quantity: 50,  unit: "kg",      pricePerUnit: 180, expiryDate: hoursFromNow(6),    isPubliclyVisible: true },
  { id: "inv-05", batchId: "BR-2026-002", itemName: "Veg Biryani",         quantity: 30,  unit: "kg",      pricePerUnit: 180, expiryDate: hoursFromNow(36),   isPubliclyVisible: true },

  // Dal Makhani
  { id: "inv-06", batchId: "DM-2026-001", itemName: "Dal Makhani",         quantity: 25,  unit: "kg",      pricePerUnit: 150, expiryDate: hoursFromNow(72),   isPubliclyVisible: true },
  { id: "inv-07", batchId: "DM-2026-002", itemName: "Dal Makhani",         quantity: 40,  unit: "kg",      pricePerUnit: 150, expiryDate: hoursFromNow(200),  isPubliclyVisible: false },

  // Bread
  { id: "inv-08", batchId: "BD-2026-001", itemName: "Whole Wheat Bread",   quantity: 300, unit: "loaves",  pricePerUnit: 35,  expiryDate: hoursFromNow(42),   isPubliclyVisible: true },

  // Dairy
  { id: "inv-09", batchId: "DY-2026-001", itemName: "Fresh Paneer",        quantity: 15,  unit: "kg",      pricePerUnit: 320, expiryDate: hoursFromNow(10),   isPubliclyVisible: true },
  { id: "inv-10", batchId: "DY-2026-002", itemName: "Fresh Paneer",        quantity: 20,  unit: "kg",      pricePerUnit: 320, expiryDate: hoursFromNow(120),  isPubliclyVisible: true },

  // Fresh produce
  { id: "inv-11", batchId: "FP-2026-001", itemName: "Seasonal Fruit Box",  quantity: 60,  unit: "boxes",   pricePerUnit: 250, expiryDate: hoursFromNow(360),  isPubliclyVisible: false },
]

// ══════════════════════════════════════════════════════════════
// STATUS BADGE COMPONENT
// ══════════════════════════════════════════════════════════════
function StatusBadge({ status, daysLabel }: { status: ExpiryStatus; daysLabel: string }) {
  const config = {
    CRITICAL: {
      bg: "bg-red-500/10 border-red-500/30",
      text: "text-red-600",
      icon: <ShieldAlert className="w-3 h-3" />,
      pulse: true,
    },
    WARNING: {
      bg: "bg-amber-500/10 border-amber-500/30",
      text: "text-amber-600",
      icon: <AlertTriangle className="w-3 h-3" />,
      pulse: false,
    },
    FRESH: {
      bg: "bg-emerald-500/10 border-emerald-500/30",
      text: "text-emerald-600",
      icon: <Leaf className="w-3 h-3" />,
      pulse: false,
    },
  }
  const c = config[status]

  return (
    <Badge variant="outline" className={`${c.bg} ${c.text} border text-xs font-semibold gap-1 px-2 py-0.5`}>
      {c.pulse && <span className="relative flex h-2 w-2 mr-0.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
      </span>}
      {c.icon}
      <span className="uppercase">{status}</span>
      <span className="font-normal opacity-75">• {daysLabel}</span>
    </Badge>
  )
}

// ══════════════════════════════════════════════════════════════
// MAP-SYNC INDICATOR
// ══════════════════════════════════════════════════════════════
function MapSyncTag() {
  return (
    <span className="inline-flex items-center gap-1 bg-purple-500/10 text-purple-600 border border-purple-500/20 rounded-full px-2 py-0.5 text-[11px] font-semibold">
      <Radio className="w-3 h-3 animate-pulse" />
      Live on Map
    </span>
  )
}

// ══════════════════════════════════════════════════════════════
// ACTION MENU
// ══════════════════════════════════════════════════════════════
function ActionMenu({ item, onEditQuantity, onMarkWasted, onDonateManually }: {
  item: InventoryItem
  onEditQuantity: (id: string) => void
  onMarkWasted: (id: string) => void
  onDonateManually: (id: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
        onClick={() => setOpen(!open)}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-lg shadow-xl py-1 w-48 animate-in fade-in-0 zoom-in-95">
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              onClick={() => { onEditQuantity(item.id); setOpen(false) }}
            >
              <Pencil className="w-3.5 h-3.5 text-slate-400" /> Edit Quantity
            </button>
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              onClick={() => { onMarkWasted(item.id); setOpen(false) }}
            >
              <Trash2 className="w-3.5 h-3.5" /> Mark as Wasted
            </button>
            <div className="h-px bg-slate-100 mx-2 my-1" />
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-50 transition-colors"
              onClick={() => { onDonateManually(item.id); setOpen(false) }}
            >
              <Heart className="w-3.5 h-3.5" /> Donate Manually
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export function DonorInventoryManager() {
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<"name" | "expiry" | "value">("expiry")
  const [sortAsc, setSortAsc] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editQty, setEditQty] = useState("")

  // ── Auto-sync isPubliclyVisible based on expiry ──
  const syncedInventory = useMemo(() => {
    return inventory.map(item => ({
      ...item,
      isPubliclyVisible: shouldBePublic(item.expiryDate),
    }))
  }, [inventory])

  // ── Group items by name ──
  const batchGroups: BatchGroup[] = useMemo(() => {
    const groupMap: Record<string, InventoryItem[]> = {}
    for (const item of syncedInventory) {
      if (!groupMap[item.itemName]) groupMap[item.itemName] = []
      groupMap[item.itemName].push(item)
    }

    let groups: BatchGroup[] = Object.entries(groupMap).map(([name, batches]) => ({
      itemName: name,
      batches: batches.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()),
      totalQuantity: batches.reduce((sum, b) => sum + b.quantity, 0),
      totalValue: batches.reduce((sum, b) => sum + b.quantity * b.pricePerUnit, 0),
      worstStatus: getWorstStatus(batches.map(b => getExpiryStatus(b.expiryDate))),
      isExpanded: expandedGroups.has(name),
    }))

    // Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      groups = groups.filter(g =>
        g.itemName.toLowerCase().includes(q) ||
        g.batches.some(b => b.batchId.toLowerCase().includes(q))
      )
    }

    // Sort
    groups.sort((a, b) => {
      let cmp = 0
      if (sortField === "name") cmp = a.itemName.localeCompare(b.itemName)
      if (sortField === "value") cmp = a.totalValue - b.totalValue
      if (sortField === "expiry") {
        const statusOrder: Record<ExpiryStatus, number> = { CRITICAL: 0, WARNING: 1, FRESH: 2 }
        cmp = statusOrder[a.worstStatus] - statusOrder[b.worstStatus]
      }
      return sortAsc ? cmp : -cmp
    })

    return groups
  }, [syncedInventory, expandedGroups, searchQuery, sortField, sortAsc])

  // ── Stats ──
  const stats = useMemo(() => {
    const critical = syncedInventory.filter(i => getExpiryStatus(i.expiryDate) === "CRITICAL").length
    const warning = syncedInventory.filter(i => getExpiryStatus(i.expiryDate) === "WARNING").length
    const onMap = syncedInventory.filter(i => i.isPubliclyVisible).length
    const totalValue = syncedInventory.reduce((s, i) => s + i.quantity * i.pricePerUnit, 0)
    return { critical, warning, onMap, totalValue }
  }, [syncedInventory])

  // ── Toggle group ──
  const toggleGroup = useCallback((name: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }, [])

  // ── Sort toggle ──
  const handleSort = (field: typeof sortField) => {
    if (sortField === field) setSortAsc(!sortAsc)
    else { setSortField(field); setSortAsc(true) }
  }

  // ── Actions ──
  const handleEditQuantity = (id: string) => {
    const item = inventory.find(i => i.id === id)
    if (item) { setEditingId(id); setEditQty(String(item.quantity)) }
  }

  const commitEdit = () => {
    if (!editingId) return
    const qty = parseInt(editQty)
    if (isNaN(qty) || qty < 0) return
    setInventory(prev => prev.map(i => i.id === editingId ? { ...i, quantity: qty } : i))
    setEditingId(null)
    setEditQty("")
  }

  const handleMarkWasted = (id: string) => {
    setInventory(prev => prev.filter(i => i.id !== id))
  }

  const handleDonateManually = (id: string) => {
    // Mark the item's status internally — in production this would
    // insert into the food_items table and push to the map feed.
    setInventory(prev => prev.map(i => i.id === id ? { ...i, quantity: 0 } : i).filter(i => i.quantity > 0))
  }

  // ── Currency formatter ──
  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total Value</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{fmt(stats.totalValue)}</div>
        </div>
        <div className="bg-white border border-red-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-red-500 font-medium uppercase tracking-wide flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> Critical
          </div>
          <div className="text-2xl font-bold text-red-600 mt-1">{stats.critical} <span className="text-sm font-normal text-red-400">batches</span></div>
        </div>
        <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-amber-600 font-medium uppercase tracking-wide flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Warning
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{stats.warning} <span className="text-sm font-normal text-amber-400">batches</span></div>
        </div>
        <div className="bg-white border border-purple-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-purple-600 font-medium uppercase tracking-wide flex items-center gap-1">
            <MapPin className="w-3 h-3" /> On NGO Map
          </div>
          <div className="text-2xl font-bold text-purple-600 mt-1">{stats.onMap} <span className="text-sm font-normal text-purple-400">items live</span></div>
        </div>
      </div>

      {/* Table Card */}
      <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-slate-800 font-heading text-lg">Stock Inventory</CardTitle>
                <CardDescription className="text-slate-500 text-sm">{syncedInventory.length} batches across {batchGroups.length} items</CardDescription>
              </div>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search items or batch IDs…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="h-9 pl-9 pr-8 bg-slate-50 border-slate-200 text-slate-800 text-sm focus-visible:ring-emerald-500/50"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="w-8 px-4 py-3"></th>
                  <th className="text-left py-3 px-4">
                    <button onClick={() => handleSort("name")} className="flex items-center gap-1 text-slate-600 font-semibold hover:text-slate-900 transition-colors text-xs uppercase tracking-wider">
                      Item Name <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Batches</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Qty</th>
                  <th className="text-right py-3 px-4">
                    <button onClick={() => handleSort("value")} className="flex items-center gap-1 text-slate-600 font-semibold hover:text-slate-900 transition-colors text-xs uppercase tracking-wider ml-auto">
                      Value <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4">
                    <button onClick={() => handleSort("expiry")} className="flex items-center gap-1 text-slate-600 font-semibold hover:text-slate-900 transition-colors text-xs uppercase tracking-wider">
                      Status <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Feed</th>
                  <th className="w-12 py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {batchGroups.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400">
                      {searchQuery ? "No items match your search." : "No inventory items. Add stock via Manual Entry."}
                    </td>
                  </tr>
                )}

                {batchGroups.map(group => (
                  <Fragment key={group.itemName}>
                    {/* ── Group Header Row ── */}
                    <tr
                      key={group.itemName}
                      className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors cursor-pointer"
                      onClick={() => toggleGroup(group.itemName)}
                    >
                      <td className="px-4 py-3 text-slate-400">
                        {group.isExpanded
                          ? <ChevronDown className="w-4 h-4" />
                          : <ChevronRight className="w-4 h-4" />
                        }
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-800">{group.itemName}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{group.batches.length}</td>
                      <td className="px-4 py-3 text-slate-700 font-medium">
                        {group.totalQuantity.toLocaleString()} <span className="text-slate-400 text-xs">{group.batches[0]?.unit}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-700 font-medium">{fmt(group.totalValue)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={group.worstStatus} daysLabel={getDaysRemaining(group.batches[0].expiryDate)} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        {group.batches.some(b => b.isPubliclyVisible) && <MapSyncTag />}
                      </td>
                      <td className="px-4 py-3"></td>
                    </tr>

                    {/* ── Expanded Batch Rows ── */}
                    {group.isExpanded && group.batches.map(batch => {
                      const status = getExpiryStatus(batch.expiryDate)
                      const isEditing = editingId === batch.id

                      return (
                        <tr
                          key={batch.id}
                          className={`border-b border-slate-50 transition-colors ${
                            status === "CRITICAL" ? "bg-red-50/40" :
                            status === "WARNING" ? "bg-amber-50/30" : "bg-white"
                          }`}
                        >
                          <td className="px-4 py-2.5"></td>
                          <td className="px-4 py-2.5 pl-10">
                            <span className="text-slate-500 text-xs font-mono">{batch.batchId}</span>
                          </td>
                          <td className="px-4 py-2.5 text-slate-400 text-xs">1 batch</td>
                          <td className="px-4 py-2.5">
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  value={editQty}
                                  onChange={e => setEditQty(e.target.value)}
                                  className="h-7 w-20 text-xs bg-white border-emerald-300 focus-visible:ring-emerald-500"
                                  autoFocus
                                  onKeyDown={e => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditingId(null) }}
                                />
                                <Button size="sm" className="h-7 px-2 text-xs bg-emerald-600 text-white" onClick={commitEdit}>✓</Button>
                                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setEditingId(null)}>✕</Button>
                              </div>
                            ) : (
                              <span className="text-slate-700 text-sm">
                                {batch.quantity.toLocaleString()} <span className="text-slate-400 text-xs">{batch.unit}</span>
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-right text-slate-600 text-sm">{fmt(batch.quantity * batch.pricePerUnit)}</td>
                          <td className="px-4 py-2.5">
                            <StatusBadge status={status} daysLabel={getDaysRemaining(batch.expiryDate)} />
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            {batch.isPubliclyVisible && <MapSyncTag />}
                          </td>
                          <td className="px-4 py-2.5">
                            <ActionMenu
                              item={batch}
                              onEditQuantity={handleEditQuantity}
                              onMarkWasted={handleMarkWasted}
                              onDonateManually={handleDonateManually}
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DonorInventoryManager
