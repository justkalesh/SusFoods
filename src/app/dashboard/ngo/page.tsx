"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { MOCK_ACTIVE_DONATIONS, MOCK_CLAIMS, MOCK_SOS_APPEALS, FoodItem, SOSAppeal, Claim } from "@/lib/mock-data"
import { calculateTimeRemaining } from "@/lib/engine"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { HeartHandshake, MapPin, AlertCircle, CheckCircle2, Radio, Loader2, Clock, Navigation, Settings } from "lucide-react"
import DonorMap from "@/components/receiver/DonorMap"
import { NGOProfileSettings } from "@/components/receiver/NGOProfileSettings"

export default function NGODashboard() {
  const [feed, setFeed] = useState<FoodItem[]>([])
  const [claims, setClaims] = useState<Claim[]>([])
  const [appeals, setAppeals] = useState<SOSAppeal[]>([])
  const [claimingId, setClaimingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        // If not logged in, we might still want to show something or error out, but we'll proceed
        
        // Fetch feed (available food)
        const { data: foodData, error: foodError } = await supabase
          .from('food_items')
          .select('*')
          .eq('status', 'Available')
          .order('created_at', { ascending: false })
          
        if (foodError) throw foodError

        if (foodData && foodData.length > 0) {
          setFeed(foodData.map(item => ({
            id: item.id,
            donorId: item.donor_id,
            donorName: "Local Business", 
            itemName: item.item_name,
            category: item.category as any,
            quantityKg: item.quantity_kg,
            safeToConsumeUntil: item.safe_to_consume_until,
            status: item.status as any,
          })))
        } else {
          setFeed([])
        }

        // Fetch claims for user
        if (user) {
          const { data: claimsData } = await supabase
            .from('claims')
            .select('*')
            .eq('ngo_id', user.id)
            .order('claimed_at', { ascending: false })
            
          if (claimsData) {
            setClaims(claimsData.map(c => ({
              id: c.id,
              foodItemId: c.food_item_id,
              ngoId: c.ngo_id,
              status: c.status as any,
              claimedAt: c.claimed_at,
            })))
          }
        }

        // Fetch SOS appeals
        const { data: appealsData } = await supabase
          .from('sos_appeals')
          .select('*')
          .order('date_posted', { ascending: false })
          
        if (appealsData && appealsData.length > 0) {
          setAppeals(appealsData.map(a => ({
            id: a.id,
            ngoId: a.ngo_id,
            ngoName: "Community NGO",
            requestText: a.request_text,
            urgency: a.urgency as any,
            datePosted: a.date_posted,
          })))
        } else {
          setAppeals([])
        }

      } catch (err) {
        console.error("Error fetching data, using mock:", err)
        setFeed(MOCK_ACTIVE_DONATIONS.filter(d => d.status === "Available"))
        setClaims(MOCK_CLAIMS)
        setAppeals(MOCK_SOS_APPEALS)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleClaim = async (item: FoodItem) => {
    setClaimingId(item.id)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not logged in");

      // 1. Insert claim
      let { error: claimError } = await supabase.from('claims').insert([{
        food_item_id: item.id,
        ngo_id: user.id,
        status: 'Pending'
      }])
      
      if (claimError && claimError.code === '23503') {
        await supabase.from('profiles').insert([{
           id: user.id,
           role: 'ngo',
           name: user.email?.split('@')[0] || 'Legacy NGO',
           organization_name: 'My NGO'
        }]);
        const retry = await supabase.from('claims').insert([{
          food_item_id: item.id,
          ngo_id: user.id,
          status: 'Pending'
        }]);
        claimError = retry.error;
      }
      
      if (claimError) throw claimError;

      // 2. Update food item status
      const { error: updateError } = await supabase
        .from('food_items')
        .update({ status: 'Claimed' })
        .eq('id', item.id)

      if (updateError) throw updateError;
      
      // Update local state by refetching or just mutating
      setFeed(feed.filter(f => f.id !== item.id))
      setClaims([{
        id: `temp-${Date.now()}`,
        foodItemId: item.id,
        ngoId: user.id,
        status: 'Pending',
        claimedAt: new Date().toISOString()
      }, ...claims])

    } catch(err) {
       console.error("Failed to claim:", err)
       alert("Failed to claim. Check your connection or database setup.")
    }
    setClaimingId(null)
  }

  const handleSOSAppeal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const requestText = formData.get("requestText") as string
    const urgency = formData.get("urgency") as string
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not logged in");

      let { data, error } = await supabase.from('sos_appeals').insert([{
        ngo_id: user.id,
        request_text: requestText,
        urgency: urgency
      }]).select().single()

      if (error && error.code === '23503') {
        await supabase.from('profiles').insert([{
           id: user.id,
           role: 'ngo',
           name: user.email?.split('@')[0] || 'Legacy NGO',
           organization_name: 'My NGO'
        }]);
        
        const retry = await supabase.from('sos_appeals').insert([{
          ngo_id: user.id,
          request_text: requestText,
          urgency: urgency
        }]).select().single()
        data = retry.data;
        error = retry.error;
      }

      if (error) throw error;
      
      if (data) {
        setAppeals([{
          id: data.id,
          ngoId: data.ngo_id,
          ngoName: "Your NGO",
          requestText: data.request_text,
          urgency: data.urgency as any,
          datePosted: data.date_posted
        }, ...appeals])
      }
      e.currentTarget.reset()
    } catch(err) {
      console.error("Failed to broadcast SOS:", err)
      alert("Failed to broadcast SOS. Check if database tables exist.")
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
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xl font-heading font-semibold text-slate-800">Receiver Portal</h2>
      </div>

      {/* Donor Map – Nearby Active Donors */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-600" />
            <CardTitle className="text-slate-800 text-lg font-heading">Nearby Donors</CardTitle>
          </div>
          <CardDescription className="text-slate-500">Click a marker to view details and claim available food</CardDescription>
        </CardHeader>
        <CardContent>
          <DonorMap />
        </CardContent>
      </Card>

      <Tabs defaultValue="feed" className="space-y-4">
        <TabsList className="glass-nav border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-slate-900/50">
          <TabsTrigger value="feed">Secure Local Meals</TabsTrigger>
          <TabsTrigger value="logistics">Meal Journey Tracker</TabsTrigger>
          <TabsTrigger value="sos">Broadcast Urgent Needs</TabsTrigger>
          <TabsTrigger value="profile" className="gap-1.5"><Settings className="h-3.5 w-3.5" /> Profile</TabsTrigger>
        </TabsList>
        
        {/* LIVE CLAIMING FEED */}
        <TabsContent value="feed" className="space-y-4">
          <div className="flex items-center space-x-2 pb-2">
            <span className="relative flex h-3 w-3 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-medium text-emerald-500">10km Operational Range</span>
          </div>
          
          <ScrollArea className="h-[600px] rounded-xl border border-slate-200 dark:border-white/5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-4">
            <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4 max-w-7xl mx-auto">
              {feed.map((item) => {
                const timeData = calculateTimeRemaining(item.safeToConsumeUntil)
                
                return (
                  <Card key={item.id} className={`break-inside-avoid hover-card bg-white/80 dark:bg-slate-950/80 border-x border-t border-x-slate-200 dark:border-x-white/5 border-t-slate-200 dark:border-t-white/5 border-b-2 shadow-inner overflow-hidden ${timeData.statusColor === 'red' ? 'border-b-red-500/50 shadow-[inset_0_1px_10px_rgba(239,68,68,0.05)]' : timeData.statusColor === 'yellow' ? 'border-b-amber-500/50 shadow-[inset_0_1px_10px_rgba(245,158,11,0.05)]' : 'border-b-emerald-500/50 shadow-[inset_0_1px_10px_rgba(16,185,129,0.05)]'} flex flex-col`}>
                    <img 
                      src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80" 
                      alt="Food Item" 
                      className="w-full h-32 object-cover opacity-80 mix-blend-luminosity"
                    />
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg text-slate-800 dark:text-slate-200 font-heading">{item.itemName}</CardTitle>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 whitespace-nowrap shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                          {item.quantityKg} kg
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-1 text-slate-600 dark:text-slate-400 pt-1">
                        <MapPin className="h-3 w-3" /> {item.donorName}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={`text-xs px-2 py-0 h-5 flex gap-1 items-center ${getBadgeColor(timeData.statusColor)}`}>
                          <Clock className="w-3 h-3" />
                          {timeData.remainingHours > 0 ? `< ${Math.ceil(timeData.remainingHours)}h safe` : 'Expired'}
                        </Badge>
                        <span className="text-[10px] text-slate-500 uppercase font-medium">{item.category}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button 
                        disabled={claimingId === item.id}
                        className={`w-full group shadow-md transition-all ${timeData.statusColor === 'red' ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'}`}
                        onClick={() => handleClaim(item)}
                      >
                        {claimingId === item.id ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Claiming...</>
                        ) : (
                          <><Navigation className="mr-2 h-4 w-4 group-hover:rotate-45 transition-transform" /> Claim Donation</>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
              
              {feed.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500 flex flex-col items-center">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500/50 mb-4" />
                  <p>All clear! No pending donations in your area right now.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* LOGISTICS TRACKER */}
        <TabsContent value="logistics" className="space-y-4">
          <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-white/5 border-b-2 border-b-emerald-500/30 shadow-inner">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100 font-heading">Meal Journey Tracker</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Track your secured meals and transit statuses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <TableHead className="text-slate-600 dark:text-slate-400">Claim ID</TableHead>
                    <TableHead className="text-slate-600 dark:text-slate-400">Food Item ID</TableHead>
                    <TableHead className="text-slate-600 dark:text-slate-400">Claimed At</TableHead>
                    <TableHead className="text-slate-600 dark:text-slate-400">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {claims.map((claim) => (
                    <TableRow key={claim.id} className="border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800/20">
                      <TableCell className="font-medium text-slate-800 dark:text-slate-300">{claim.id}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">{claim.foodItemId}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400" suppressHydrationWarning>
                        {new Date(claim.claimedAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={
                            claim.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' : 
                            claim.status === 'In Transit' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' : 
                            'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          }
                        >
                          {claim.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {claims.length === 0 && (
                     <TableRow>
                       <TableCell colSpan={4} className="text-center text-slate-500 py-6">
                         No active claims.
                       </TableCell>
                     </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SOS APPEALS */}
        <TabsContent value="sos" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            
            <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-white/5 border-b-2 border-b-amber-500/50 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-heading">
                  <Radio className="h-5 w-5 text-amber-500 animate-pulse" /> Broadcast Urgent Needs
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Urgent need for food? Broadcast directly to verified nearby donors in real-time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSOSAppeal} className="space-y-4 relative z-10">
                  <div className="space-y-2">
                    <Label htmlFor="requestText" className="text-slate-700 dark:text-slate-300">Describe your need</Label>
                    <Input id="requestText" name="requestText" placeholder="e.g. Need 20 portions of meals for emergency shelter" required className="bg-white dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus-visible:ring-amber-500 text-slate-800 dark:text-slate-200" />
                  </div>
                  
                  <div className="space-y-2 flex flex-col">
                    <Label htmlFor="urgency" className="text-slate-700 dark:text-slate-300">Urgency Level</Label>
                    <select 
                      id="urgency" 
                      name="urgency" 
                      required 
                      className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="High" className="bg-white dark:bg-slate-900 text-red-600 dark:text-red-500">High (Critical immediate need)</option>
                      <option value="Medium" className="bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-500">Medium (Need within 24h)</option>
                      <option value="Low" className="bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-500">Low (Stocking up)</option>
                    </select>
                  </div>
                  
                  <Button type="submit" className="w-full md:w-auto bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all">
                    Emit Radar Pulse
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-white/5 border-b-2 border-b-emerald-500/30 shadow-inner h-full">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-slate-100 font-heading">Regional Radar</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">Live network demands</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                    {appeals.map(appeal => (
                      <div key={appeal.id} className="p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-white/80 dark:bg-slate-950/80 shadow-sm relative overflow-hidden">
                        {appeal.urgency === 'High' && <div className="absolute top-0 left-0 w-1 h-full bg-red-500 animate-pulse"></div>}
                        {appeal.urgency === 'Medium' && <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>}
                        {appeal.urgency === 'Low' && <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>}
                        
                        <div className="flex justify-between items-start mb-2 pl-2">
                          <Badge variant="outline" className={
                            appeal.urgency === 'High' ? 'text-red-500 border-red-500/30 bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.2)]' :
                            appeal.urgency === 'Medium' ? 'text-amber-500 border-amber-500/30 bg-amber-500/10' :
                            'text-emerald-500 border-emerald-500/30 bg-emerald-500/10'
                          }>
                            {appeal.urgency} Priority
                          </Badge>
                          <span className="text-xs text-slate-500" suppressHydrationWarning>{new Date(appeal.datePosted).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 pl-2">{appeal.requestText}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-500 pl-2 mt-2">{appeal.ngoName}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* PROFILE SETTINGS */}
        <TabsContent value="profile">
          <NGOProfileSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
