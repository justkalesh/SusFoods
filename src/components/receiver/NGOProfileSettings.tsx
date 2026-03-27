"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Heart, User, Phone, MapPin, Camera, Loader2, Save, ShieldCheck } from "lucide-react"

interface NGOProfile {
  organizationName: string
  registrationNumber: string
  contactName: string
  phone: string
  address: string
}

export function NGOProfileSettings() {
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [avatarHover, setAvatarHover] = useState(false)
  const [hasOrgRow, setHasOrgRow] = useState(false)
  const [profile, setProfile] = useState<NGOProfile>({
    organizationName: "",
    registrationNumber: "",
    contactName: "",
    phone: "",
    address: "",
  })

  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const meta = user.user_metadata || {}
      const contactName = [meta.first_name, meta.last_name].filter(Boolean).join(" ")

      const { data: org } = await supabase
        .from("organizations")
        .select("name, legal_name, phone, address")
        .eq("user_id", user.id)
        .maybeSingle()

      if (org) {
        setHasOrgRow(true)
        setProfile({
          organizationName: org.name || "",
          registrationNumber: org.legal_name || "",
          contactName: contactName || "",
          phone: org.phone || meta.phone || "",
          address: org.address || "",
        })
      } else {
        // Self-heal from user metadata
        setHasOrgRow(false)
        setProfile({
          organizationName: meta.org_name || meta.organization_name || "",
          registrationNumber: meta.org_legal_name || "",
          contactName: contactName || "",
          phone: meta.org_phone || meta.phone || "",
          address: meta.org_address || "",
        })
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  const update = (field: keyof NGOProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const meta = user.user_metadata || {}
    const payload = {
      user_id: user.id,
      name: profile.organizationName,
      phone: profile.phone,
      address: profile.address,
    }

    let error
    if (hasOrgRow) {
      const result = await supabase.from("organizations").update(payload).eq("user_id", user.id)
      error = result.error
    } else {
      const result = await supabase.from("organizations").insert({
        ...payload,
        legal_name: meta.org_legal_name || `SUS-NGO-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
        email: meta.org_email || user.email || null,
        latitude: meta.org_latitude ? parseFloat(meta.org_latitude) : null,
        longitude: meta.org_longitude ? parseFloat(meta.org_longitude) : null,
        country: meta.org_country || null,
        suite_number: meta.org_suite_number || null,
        type: meta.org_type || null,
      })
      error = result.error
      if (!error) setHasOrgRow(true)
    }

    setSaving(false)
    if (error) {
      toast.error("Failed to save profile", { description: error.message })
    } else {
      toast.success("Profile updated successfully!", {
        description: "Your organization profile has been saved.",
      })
    }
  }

  if (loading) {
    return (
      <Card className="bg-white border-slate-200 shadow-lg">
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 text-emerald-500 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white border-slate-200 shadow-lg">
      <CardHeader className="pb-6 border-b border-slate-100">
        <CardTitle className="text-xl font-heading text-slate-800">Organization Profile</CardTitle>
        <CardDescription className="text-slate-500">Manage your NGO details and contact information</CardDescription>
      </CardHeader>

      <CardContent className="pt-8 space-y-8">
        <div className="flex justify-center">
          <div className="relative w-28 h-28 rounded-full cursor-pointer group" onMouseEnter={() => setAvatarHover(true)} onMouseLeave={() => setAvatarHover(false)}>
            <div className="w-full h-full rounded-full bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Heart className="w-12 h-12 text-white" />
            </div>
            <div className={`absolute inset-0 rounded-full bg-black/60 flex flex-col items-center justify-center gap-1 transition-opacity duration-200 ${avatarHover ? "opacity-100" : "opacity-0"}`}>
              <Camera className="w-5 h-5 text-white" />
              <span className="text-[11px] text-white font-medium">Change Logo</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="ngo-orgName" className="text-slate-700 font-medium text-sm">Organization Name</Label>
            <div className="relative">
              <Heart className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input id="ngo-orgName" value={profile.organizationName} onChange={e => update("organizationName", e.target.value)} placeholder="Your NGO name" className="h-11 pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 transition-all" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 font-medium text-sm">Trust / Registration Number</Label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input value={profile.registrationNumber} readOnly className="h-11 pl-10 bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ngo-contactName" className="text-slate-700 font-medium text-sm">Contact Person</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input id="ngo-contactName" value={profile.contactName} onChange={e => update("contactName", e.target.value)} placeholder="Contact name" className="h-11 pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 transition-all" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ngo-phone" className="text-slate-700 font-medium text-sm">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input id="ngo-phone" type="tel" value={profile.phone} onChange={e => update("phone", e.target.value)} placeholder="+91 XXXXX XXXXX" className="h-11 pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 transition-all" />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="ngo-address" className="text-slate-700 font-medium text-sm">Address / Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input id="ngo-address" value={profile.address} onChange={e => update("address", e.target.value)} placeholder="Your NGO address" className="h-11 pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 transition-all" />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 h-11 font-medium shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 rounded-lg">
            {saving ? (
              <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving...</span>
            ) : (
              <span className="flex items-center gap-2"><Save className="w-4 h-4" /> Save Changes</span>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default NGOProfileSettings
