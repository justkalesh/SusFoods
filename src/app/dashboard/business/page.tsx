"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { MOCK_ACTIVE_DONATIONS, FoodItem, FoodCategory } from "@/lib/mock-data"
import { calculateTimeRemaining, calculateCO2Saved, generateTaxReceipt } from "@/lib/engine"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Leaf, Recycle, Clock, Package, Tag, Scale, CalendarClock, Sparkles, ArrowRight } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { SmartScanner } from "@/components/SmartScanner"

const impactData = [
  { month: "Jan", co2: 400 },
  { month: "Feb", co2: 600 },
  { month: "Mar", co2: 1200 },
  { month: "Apr", co2: 1800 },
  { month: "May", co2: 2300 },
  { month: "Jun", co2: 3125 },
]

export default function BusinessDashboard() {
  const [activeDonations, setActiveDonations] = useState<FoodItem[]>([])
  const [totalSavedKg, setTotalSavedKg] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          throw new Error("User not authenticated")
        }

        const { data: items, error } = await supabase
          .from('food_items')
          .select('*')
          .eq('donor_id', user.id)
          .order('created_at', { ascending: false })
          
        if (error) throw error

        if (items && items.length > 0) {
          const formattedItems: FoodItem[] = items.map(item => ({
            id: item.id,
            donorId: item.donor_id,
            donorName: "Your Business",
            itemName: item.item_name,
            category: item.category as FoodCategory,
            quantityKg: item.quantity_kg,
            safeToConsumeUntil: item.safe_to_consume_until,
            status: item.status as any,
          }))
          setActiveDonations(formattedItems)
          const total = formattedItems.reduce((acc, curr) => acc + Number(curr.quantityKg), 0)
          setTotalSavedKg(total)
        } else {
          setActiveDonations([])
          setTotalSavedKg(0)
        }
      } catch (err) {
        console.error("Error fetching data, falling back to mock:", err)
        setActiveDonations(MOCK_ACTIVE_DONATIONS)
        setTotalSavedKg(1250)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleLogInventory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const qty = Number(formData.get("quantity"))
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not logged in")

      const newItemData = {
        donor_id: user.id,
        item_name: formData.get("itemName") as string,
        category: formData.get("category") as string,
        quantity_kg: qty,
        safe_to_consume_until: new Date(formData.get("consumeUntil") as string).toISOString(),
        status: "Available",
      }

      let { data, error } = await supabase.from('food_items').insert([newItemData]).select().single()
      
      // Auto-fix for legacy users who don't have a profile yet
      if (error && error.code === '23503') {
        // Insert a missing profile and retry
        await supabase.from('profiles').insert([{
           id: user.id,
           role: 'business',
           name: user.email?.split('@')[0] || 'Legacy User',
           organization_name: 'My Business'
        }]);
        
        const retry = await supabase.from('food_items').insert([newItemData]).select().single()
        data = retry.data;
        error = retry.error;
      }
      
      if (error) throw error
      
      if (data) {
        const formattedNewItem: FoodItem = {
          id: data.id,
          donorId: data.donor_id,
          donorName: "Your Business",
          itemName: data.item_name,
          category: data.category as FoodCategory,
          quantityKg: data.quantity_kg,
          safeToConsumeUntil: data.safe_to_consume_until,
          status: data.status as any,
        }
        setActiveDonations([formattedNewItem, ...activeDonations])
        setTotalSavedKg(totalSavedKg + qty)
      }
      e.currentTarget.reset()
    } catch(err) {
      console.error("Error inserting donation:", err)
      alert("Failed to log donation. Please check if the database tables exist.")
    }
  }

  const getBadgeColor = (statusColor: string) => {
    switch (statusColor) {
      case 'red': return 'bg-red-500/10 text-red-500 border-red-500/50'
      case 'yellow': return 'bg-amber-500/10 text-amber-500 border-amber-500/50'
      case 'green': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/50'
      default: return ''
    }
  }

  return (
    <div className="flex-1 space-y-4 fade-in">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="w-full justify-start gap-2 bg-white border border-slate-200 shadow-sm rounded-xl p-2 h-auto flex-wrap">
          <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-emerald-500/30 rounded-lg px-5 py-3 text-base font-medium text-slate-600 transition-all">Your Community Impact</TabsTrigger>
          <TabsTrigger value="smart-scan" className="gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-emerald-500/30 rounded-lg px-5 py-3 text-base font-medium text-slate-600 transition-all">Auto-Scan Invoice</TabsTrigger>
          <TabsTrigger value="inventory" className="gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-emerald-500/30 rounded-lg px-5 py-3 text-base font-medium text-slate-600 transition-all">Manual Entry</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover-card bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-white/5 border-b-2 border-b-emerald-500/50 shadow-inner">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Food Donated</CardTitle>
                <Leaf className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{totalSavedKg} kg</div>
                <p className="text-xs text-emerald-600/70 dark:text-emerald-500/70">+14% from last month</p>
              </CardContent>
            </Card>
            <Card className="hover-card bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-white/5 border-b-2 border-b-cyan-500/50 shadow-inner">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">CO₂ Emissions Saved</CardTitle>
                <Recycle className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{calculateCO2Saved(totalSavedKg).toLocaleString()} kg</div>
                <p className="text-xs text-cyan-600/70 dark:text-cyan-400/70">Equivalent to closing 10 cars for a year</p>
              </CardContent>
            </Card>
            <Card className="hover-card bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-white/5 border-b-2 border-b-amber-500/50 shadow-inner">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Est. Tax Write-off</CardTitle>
                <TrendingUp className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-500">${generateTaxReceipt(totalSavedKg).toLocaleString()}</div>
                <p className="text-xs text-amber-600/70 dark:text-amber-500/70">Generated via verified NGO receipts</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-white/5 border-b-2 border-b-emerald-500/30 shadow-inner">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-slate-100 font-heading">Impact Analytics</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">Monthly CO₂ Reduction (kg)</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px] w-full min-w-0" style={{ minHeight: 300 }}>
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <AreaChart data={impactData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}kg`} />
                      <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="co2" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCo2)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-white/5 border-b-2 border-b-emerald-500/30 shadow-inner flex flex-col">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-slate-100 font-heading">Active Inventory Feed</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Your live surplus food waiting to be claimed.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto space-y-4">
                {activeDonations.map((item) => {
                  const timeData = calculateTimeRemaining(item.safeToConsumeUntil)
                  const progressValue = Math.round(Math.max(0, Math.min(100, (timeData.remainingHours / 48) * 100)))

                  return (
                    <div key={item.id} className="flex gap-4 p-3 rounded-xl border border-slate-200 dark:border-white/5 bg-white/80 dark:bg-slate-950/50 hover-card group">
                      <img 
                        src="https://images.unsplash.com/photo-1490818387583-1b5f2222fbaf?w=100&q=80" 
                        alt="Food Icon" 
                        className="h-16 w-16 rounded-md object-cover shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 line-clamp-1">{item.itemName}</h4>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">{item.quantityKg} kg</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-xs px-2 py-0 h-5 flex gap-1 items-center ${getBadgeColor(timeData.statusColor)}`}>
                            <Clock className="w-3 h-3" />
                            {timeData.remainingHours > 0 ? `< ${Math.ceil(timeData.remainingHours)}h left` : 'Expired'}
                          </Badge>
                          <span className="text-[10px] text-slate-600 dark:text-slate-500 uppercase font-medium">{item.category}</span>
                        </div>
                        <Progress value={progressValue} className={`h-1.5 mt-2 bg-slate-200 dark:bg-slate-800 ${timeData.statusColor === 'red' ? '[&>div]:bg-red-500' : timeData.statusColor === 'yellow' ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500'}`} />
                      </div>
                    </div>
                  )
                })}
                {activeDonations.length === 0 && (
                 <div className="text-center text-slate-500 py-6">
                   No active donations. Start logging your surplus!
                 </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="smart-scan" className="space-y-4">
          <SmartScanner />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Form Card */}
            <Card className="lg:col-span-2 bg-white border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-slate-800 font-heading text-lg">Rescue Surplus Batch</CardTitle>
                    <CardDescription className="text-slate-500 text-sm">List your available food so nearby NGOs can claim it in real time.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleLogInventory} className="space-y-5">
                  <div className="grid gap-5 md:grid-cols-2">
                    {/* Item Name */}
                    <div className="space-y-2">
                      <Label htmlFor="itemName" className="text-slate-700 font-medium text-sm flex items-center gap-1.5">
                        <Package className="h-3.5 w-3.5 text-emerald-600" /> Item Name
                      </Label>
                      <Input 
                        id="itemName" 
                        name="itemName" 
                        placeholder="e.g. 50 Sandwiches" 
                        required 
                        className="h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 transition-all" 
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-slate-700 font-medium text-sm flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5 text-emerald-600" /> Category
                      </Label>
                      <select 
                        id="category" 
                        name="category" 
                        required 
                        className="flex h-11 w-full items-center rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 transition-all"
                      >
                        <option value="Prepared Meals">🍱 Prepared Meals</option>
                        <option value="Produce">🥬 Produce</option>
                        <option value="Bakery">🍞 Bakery</option>
                        <option value="Dairy">🥛 Dairy</option>
                        <option value="Other">📦 Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid gap-5 md:grid-cols-2">
                    {/* Quantity */}
                    <div className="space-y-2">
                      <Label htmlFor="quantity" className="text-slate-700 font-medium text-sm flex items-center gap-1.5">
                        <Scale className="h-3.5 w-3.5 text-emerald-600" /> Quantity
                      </Label>
                      <div className="relative">
                        <Input 
                          id="quantity" 
                          name="quantity" 
                          type="number" 
                          min="1" 
                          placeholder="10" 
                          required 
                          className="h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 transition-all pr-20" 
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">kg / portions</span>
                      </div>
                    </div>

                    {/* Consume Until */}
                    <div className="space-y-2">
                      <Label htmlFor="consumeUntil" className="text-slate-700 font-medium text-sm flex items-center gap-1.5">
                        <CalendarClock className="h-3.5 w-3.5 text-emerald-600" /> Safe Until
                      </Label>
                      <Input 
                        id="consumeUntil" 
                        name="consumeUntil" 
                        type="datetime-local" 
                        required 
                        className="h-11 bg-slate-50 border-slate-200 text-slate-900 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 transition-all" 
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Button type="submit" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-8 h-11 font-medium shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 rounded-lg gap-2">
                      <Sparkles className="h-4 w-4" /> List Donation
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Side Info Panel */}
            <Card className="bg-gradient-to-br from-emerald-600 to-teal-700 border-0 shadow-lg shadow-emerald-500/15 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -ml-8 -mb-8 pointer-events-none"></div>
              <CardContent className="pt-8 pb-8 space-y-6 relative z-10">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-white/15 backdrop-blur-sm mb-4">
                    <Leaf className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-heading font-bold mb-2">Make an Impact</h3>
                  <p className="text-emerald-100 text-sm leading-relaxed">Every batch you list helps feed families in your community and reduces food waste.</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                    <div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Instant Matching</p>
                      <p className="text-xs text-emerald-200">NGOs get notified instantly</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                    <div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                      <Recycle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">CO₂ Tracked</p>
                      <p className="text-xs text-emerald-200">Every kg saves ~2.5 kg CO₂</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                    <div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Tax Benefits</p>
                      <p className="text-xs text-emerald-200">Auto-generated 80G receipts</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
