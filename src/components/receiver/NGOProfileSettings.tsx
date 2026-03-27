"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { HeartHandshake, User, Phone, MapPin, FileText, Users, Camera, Loader2, Save } from "lucide-react"

interface NGOProfile {
  organizationName: string
  registrationNumber: string
  contactName: string
  phone: string
  dailyCapacity: string
  address: string
}

export function NGOProfileSettings() {
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [avatarHover, setAvatarHover] = useState(false)
  const [profile, setProfile] = useState<NGOProfile>({
    organizationName: "",
    registrationNumber: "",
    contactName: "",
    phone: "",
    dailyCapacity: "",
    address: "",
  })

  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      // Get name from auth metadata
      const meta = user.user_metadata || {}
      const contactName = [meta.first_name, meta.last_name].filter(Boolean).join(" ")

      // Get org details
      const { data: org } = await supabase
        .from("organizations")
        .select("name, legal_name, phone, address")
        .eq("user_id", user.id)
        .single()

      setProfile({
        organizationName: org?.name || "",
        registrationNumber: org?.legal_name || "",
        contactName: contactName || "",
        phone: org?.phone || meta.phone || "",
        dailyCapacity: "",
        address: org?.address || "",
      })
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

    const { error } = await supabase
      .from("organizations")
      .update({
        name: profile.organizationName,
        legal_name: profile.registrationNumber,
        phone: profile.phone,
        address: profile.address,
      })
      .eq("user_id", user.id)

    setSaving(false)
    if (error) {
      toast.error("Failed to save profile", { description: error.message })
    } else {
      toast.success("Profile updated successfully!", {
        description: "Your organization profile changes have been saved.",
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
        <CardDescription className="text-slate-500">Manage your NGO details, verification info, and operating capacity</CardDescription>
      </CardHeader>

      <CardContent className="pt-8 space-y-8">
        {/* Avatar Upload */}
        <div className="flex justify-center">
          <div
            className="relative w-28 h-28 rounded-full cursor-pointer group"
            onMouseEnter={() => setAvatarHover(true)}
            onMouseLeave={() => setAvatarHover(false)}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <HeartHandshake className="w-12 h-12 text-white" />
            </div>
            <div
              className={`absolute inset-0 rounded-full bg-black/60 flex flex-col items-center justify-center gap-1 transition-opacity duration-200 ${avatarHover ? "opacity-100" : "opacity-0"}`}
            >
              <Camera className="w-5 h-5 text-white" />
              <span className="text-[11px] text-white font-medium">Change Logo</span>
            </div>
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Organization Name */}
          <div className="space-y-2">
            <Label htmlFor="np-orgName" className="text-slate-700 font-medium text-sm">Organization Name</Label>
            <div className="relative">
              <HeartHandshake className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="np-orgName"
                value={profile.organizationName}
                onChange={e => update("organizationName", e.target.value)}
                placeholder="Your organization name"
                className="h-11 pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Registration Number */}
          <div className="space-y-2">
            <Label htmlFor="np-regNumber" className="text-slate-700 font-medium text-sm">Registration / Trust Number</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="np-regNumber"
                value={profile.registrationNumber}
                onChange={e => update("registrationNumber", e.target.value)}
                placeholder="e.g. NGO-PB-2024-00451"
                className="h-11 pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Contact Person */}
          <div className="space-y-2">
            <Label htmlFor="np-contactName" className="text-slate-700 font-medium text-sm">Contact Person</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="np-contactName"
                value={profile.contactName}
                onChange={e => update("contactName", e.target.value)}
                placeholder="Contact person name"
                className="h-11 pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="np-phone" className="text-slate-700 font-medium text-sm">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="np-phone"
                type="tel"
                value={profile.phone}
                onChange={e => update("phone", e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className="h-11 pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Daily Feeding Capacity */}
          <div className="space-y-2">
            <Label htmlFor="np-capacity" className="text-slate-700 font-medium text-sm">Daily Feeding Capacity</Label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="np-capacity"
                type="number"
                value={profile.dailyCapacity}
                onChange={e => update("dailyCapacity", e.target.value)}
                placeholder="e.g. 250"
                className="h-11 pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">people/day</span>
            </div>
          </div>

          {/* Address - Full Width */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="np-address" className="text-slate-700 font-medium text-sm">Address / Operating Area</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                id="np-address"
                value={profile.address}
                onChange={e => update("address", e.target.value)}
                placeholder="Your operating address"
                className="h-11 pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 h-11 font-medium shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 rounded-lg"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Changes
              </span>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default NGOProfileSettings
