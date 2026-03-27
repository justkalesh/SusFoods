"use client"

import { useState, useRef } from "react"
import { Plus, Loader2, X, Package, Tag, Scale, Ruler, IndianRupee, CalendarClock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// ══════════════════════════════════════════════════════════════
// TYPE (must match DonorInventoryManager's InventoryItem)
// ══════════════════════════════════════════════════════════════
export interface InventoryItem {
  id: string
  batchId: string
  itemName: string
  quantity: number
  unit: string
  pricePerUnit: number
  expiryDate: string       // ISO timestamp
  isPubliclyVisible: boolean
}

// ══════════════════════════════════════════════════════════════
// BATCH ID GENERATOR
// ══════════════════════════════════════════════════════════════
const CATEGORY_PREFIX: Record<string, string> = {
  "Produce":        "PR",
  "Dairy":          "DY",
  "Prepared Meals": "PM",
  "Bakery":         "BK",
  "Pantry":         "PT",
}

let batchCounter = 100 // running counter to ensure uniqueness

function generateBatchId(category: string): string {
  batchCounter++
  const prefix = CATEGORY_PREFIX[category] || "XX"
  const year = new Date().getFullYear()
  return `${prefix}-${year}-${String(batchCounter).padStart(3, "0")}`
}

function generateId(): string {
  return `inv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

// ══════════════════════════════════════════════════════════════
// FORM STATE TYPE
// ══════════════════════════════════════════════════════════════
interface FormState {
  itemName: string
  category: string
  quantity: string
  unit: string
  pricePerUnit: string
  expiryDate: string
}

interface FormErrors {
  itemName?: string
  quantity?: string
  expiryDate?: string
}

const EMPTY_FORM: FormState = {
  itemName: "",
  category: "Prepared Meals",
  quantity: "",
  unit: "kg",
  pricePerUnit: "",
  expiryDate: "",
}

// ══════════════════════════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════════════════════════
interface AddStockFormProps {
  onAddStock: (item: InventoryItem) => void
  onCancel: () => void
}

export function AddStockForm({ onAddStock, onCancel }: AddStockFormProps) {
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [successFlash, setSuccessFlash] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  // ── Field updater ──
  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
    // Clear the error for this field on change
    if (errors[key as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [key]: undefined }))
    }
  }

  // ── Validation ──
  const validate = (): boolean => {
    const e: FormErrors = {}

    if (!form.itemName.trim()) {
      e.itemName = "Item name is required."
    }

    const qty = parseFloat(form.quantity)
    if (!form.quantity || isNaN(qty) || qty <= 0) {
      e.quantity = "Enter a valid quantity greater than 0."
    }

    if (!form.expiryDate) {
      e.expiryDate = "Expiry date is required."
    } else {
      const expiry = new Date(form.expiryDate)
      if (expiry <= new Date()) {
        e.expiryDate = "Expiry date cannot be in the past."
      }
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)

    // Simulate 1s DB write
    await new Promise(resolve => setTimeout(resolve, 1000))

    const newItem: InventoryItem = {
      id: generateId(),
      batchId: generateBatchId(form.category),
      itemName: form.itemName.trim(),
      quantity: parseFloat(form.quantity),
      unit: form.unit,
      pricePerUnit: form.pricePerUnit ? parseFloat(form.pricePerUnit) : 0,
      expiryDate: new Date(form.expiryDate).toISOString(),
      isPubliclyVisible: false, // auto-synced by parent based on expiry
    }

    onAddStock(newItem)
    setSubmitting(false)

    // Flash success & reset
    setSuccessFlash(true)
    setForm({ ...EMPTY_FORM })
    setErrors({})
    setTimeout(() => setSuccessFlash(false), 1500)
    nameRef.current?.focus()
  }

  // ── Shared input classes ──
  const inputCls = "h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 transition-all"
  const selectCls = "flex h-11 w-full items-center rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 transition-all"
  const labelCls = "text-slate-700 font-medium text-sm flex items-center gap-1.5"
  const errorCls = "text-xs text-red-500 mt-1 font-medium"

  return (
    <Card className={`bg-white border-slate-200 shadow-sm overflow-hidden transition-all duration-300 ${successFlash ? "ring-2 ring-emerald-400 ring-offset-2" : ""}`}>
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-slate-800 font-heading text-lg">Add New Stock</CardTitle>
              <CardDescription className="text-slate-500 text-sm">Log a new food batch into your inventory.</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6 pb-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Row 1: Item Name + Category */}
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="stockItemName" className={labelCls}>
                <Package className="h-3.5 w-3.5 text-emerald-600" /> Item Name <span className="text-red-400">*</span>
              </Label>
              <Input
                ref={nameRef}
                id="stockItemName"
                value={form.itemName}
                onChange={e => updateField("itemName", e.target.value)}
                placeholder="e.g. Paneer Sandwiches"
                className={`${inputCls} ${errors.itemName ? "border-red-400 focus-visible:ring-red-400/50" : ""}`}
                autoFocus
              />
              {errors.itemName && <p className={errorCls}>{errors.itemName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stockCategory" className={labelCls}>
                <Tag className="h-3.5 w-3.5 text-emerald-600" /> Category
              </Label>
              <select
                id="stockCategory"
                value={form.category}
                onChange={e => updateField("category", e.target.value)}
                className={selectCls}
              >
                <option value="Prepared Meals">🍱 Prepared Meals</option>
                <option value="Produce">🥬 Produce</option>
                <option value="Bakery">🍞 Bakery</option>
                <option value="Dairy">🥛 Dairy</option>
                <option value="Pantry">📦 Pantry</option>
              </select>
            </div>
          </div>

          {/* Row 2: Quantity + Unit */}
          <div className="grid gap-5 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="stockQuantity" className={labelCls}>
                <Scale className="h-3.5 w-3.5 text-emerald-600" /> Quantity <span className="text-red-400">*</span>
              </Label>
              <Input
                id="stockQuantity"
                type="number"
                min="0.1"
                step="0.1"
                value={form.quantity}
                onChange={e => updateField("quantity", e.target.value)}
                placeholder="50"
                className={`${inputCls} ${errors.quantity ? "border-red-400 focus-visible:ring-red-400/50" : ""}`}
              />
              {errors.quantity && <p className={errorCls}>{errors.quantity}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stockUnit" className={labelCls}>
                <Ruler className="h-3.5 w-3.5 text-emerald-600" /> Unit
              </Label>
              <select
                id="stockUnit"
                value={form.unit}
                onChange={e => updateField("unit", e.target.value)}
                className={selectCls}
              >
                <option value="kg">kg</option>
                <option value="liters">liters</option>
                <option value="portions">portions</option>
                <option value="packets">packets</option>
                <option value="pieces">pieces</option>
                <option value="loaves">loaves</option>
                <option value="boxes">boxes</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stockPrice" className={labelCls}>
                <IndianRupee className="h-3.5 w-3.5 text-emerald-600" /> Price/Unit <span className="text-slate-400 text-xs font-normal">(optional)</span>
              </Label>
              <Input
                id="stockPrice"
                type="number"
                min="0"
                step="0.01"
                value={form.pricePerUnit}
                onChange={e => updateField("pricePerUnit", e.target.value)}
                placeholder="45"
                className={inputCls}
              />
            </div>
          </div>

          {/* Row 3: Expiry Date */}
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="stockExpiry" className={labelCls}>
                <CalendarClock className="h-3.5 w-3.5 text-emerald-600" /> Expiry Date <span className="text-red-400">*</span>
              </Label>
              <Input
                id="stockExpiry"
                type="datetime-local"
                value={form.expiryDate}
                onChange={e => updateField("expiryDate", e.target.value)}
                className={`${inputCls} ${errors.expiryDate ? "border-red-400 focus-visible:ring-red-400/50" : ""}`}
              />
              {errors.expiryDate && <p className={errorCls}>{errors.expiryDate}</p>}
            </div>

            {/* Preview */}
            <div className="flex items-end">
              {form.itemName && form.quantity && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 w-full">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Preview</p>
                  <p className="text-sm text-slate-800 font-semibold">{form.itemName.trim()}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {form.quantity} {form.unit} • {form.category}
                    {form.pricePerUnit ? ` • ₹${(parseFloat(form.quantity) * parseFloat(form.pricePerUnit)).toLocaleString("en-IN")} total` : ""}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Success flash */}
          {successFlash && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5 text-emerald-700 text-sm font-medium flex items-center gap-2 animate-in fade-in-0">
              ✓ Batch added to inventory!
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <Button type="button" variant="ghost" onClick={onCancel} className="text-slate-500 hover:text-slate-700">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 h-11 font-medium shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 rounded-lg gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Adding…
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Add to Inventory
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default AddStockForm
