"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Building2, User, Phone, MapPin, Camera, Loader2, Save } from "lucide-react"

interface DonorProfile {
  businessName: string
  businessType: string
  contactName: string
  phone: string
  address: string
}

export function DonorProfileSettings() {
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [avatarHover, setAvatarHover] = useState(false)
  const [profile, setProfile] = useState<DonorProfile>({
    businessName: "",
    businessType: "",
    contactName: "",
    phone: "",
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
        .select("name, type, phone, address")
        .eq("user_id", user.id)
        .maybeSingle()

      setProfile({
        businessName: org?.name || "",
        businessType: org?.type || "",
        contactName: contactName || "",
        phone: org?.phone || meta.phone || "",
        address: org?.address || "",
      })
      setLoading(false)
    }
    loadProfile()
  }, [])

  const update = (field: keyof DonorProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const { error } = await supabase
      .from("organizations")
      .update({
        name: profile.businessName,
        type: profile.businessType,
        phone: profile.phone,
        address: profile.address,
      })
      .eq("user_id", user.id)

    setSaving(false)
    if (error) {
      toast.error("Failed to save profile", { description: error.message })
    } else {
      toast.success("Profile updated successfully!", {
        description: "Your business profile changes have been saved.",
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
        <CardTitle className="text-xl font-heading text-slate-800">Business Profile</CardTitle>
        <CardDescription className="text-slate-500">Manage your organization details and contact information</CardDescription>
      </CardHeader>

      <CardContent className="pt-8 space-y-8">
        {/* Avatar Upload */}
        <div className="flex justify-center">
          <div
            className="relative w-28 h-28 rounded-full cursor-pointer group"
            onMouseEnter={() => setAvatarHover(true)}
            onMouseLeave={() => setAvatarHover(false)}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Building2 className="w-12 h-12 text-white" />
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
          {/* Business Name */}
          <div className="space-y-2">
            <Label htmlFor="dp-businessName" className="text-slate-700 font-medium text-sm">Business Name</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="dp-businessName"
                value={profile.businessName}
                onChange={e => update("businessName", e.target.value)}
                placeholder="Your business name"
                className="h-11 pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Business Type */}
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium text-sm">Business Type</Label>
            <Select value={profile.businessType} onValueChange={v => { if (v) update("businessType", v) }}>
              <SelectTrigger className="h-11 bg-slate-50 border-slate-200 text-slate-900 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectItem value="restaurant">Restaurant</SelectItem>
                <SelectItem value="campus_mess">Campus Mess</SelectItem>
                <SelectItem value="banquet_hall">Banquet Hall</SelectItem>
                <SelectItem value="supermarket">Supermarket</SelectItem>
                <SelectItem value="catering">Catering Service</SelectItem>
                <SelectItem value="hotel">Hotel</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contact Person */}
          <div className="space-y-2">
            <Label htmlFor="dp-contactName" className="text-slate-700 font-medium text-sm">Contact Person</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="dp-contactName"
                value={profile.contactName}
                onChange={e => update("contactName", e.target.value)}
                placeholder="Contact person name"
                className="h-11 pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="dp-phone" className="text-slate-700 font-medium text-sm">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="dp-phone"
                type="tel"
                value={profile.phone}
                onChange={e => update("phone", e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className="h-11 pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Address - Full Width */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="dp-address" className="text-slate-700 font-medium text-sm">Address / Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                id="dp-address"
                value={profile.address}
                onChange={e => update("address", e.target.value)}
                placeholder="Your business address"
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

export default DonorProfileSettings
