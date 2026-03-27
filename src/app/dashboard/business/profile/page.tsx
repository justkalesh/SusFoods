"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Mail, Phone, MapPin, Building2, Globe, FileText, Navigation, ChevronDown, ChevronUp } from "lucide-react"
import { DonorProfileSettings } from "@/components/donor/DonorProfileSettings"

interface OrgInfo {
  name: string
  legal_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
  country: string | null
  suite_number: string | null
  type: string | null
}

export default function DonorProfilePage() {
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("")
  const [orgInfo, setOrgInfo] = useState<OrgInfo | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setEmail(user.email || "")

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      setRole(profile?.role || "business")

      const { data: org } = await supabase
        .from("organizations")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()

      if (org) setOrgInfo(org)
      setLoading(false)
    }
    loadUser()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
      </div>
    )
  }

  const detailRows = orgInfo ? [
    { icon: FileText, label: "Trust Number", value: orgInfo.legal_name },
    { icon: Mail, label: "Registered Email", value: orgInfo.email },
    { icon: Phone, label: "Phone", value: orgInfo.phone },
    { icon: FileText, label: "Organization Type", value: orgInfo.type },
    { icon: MapPin, label: "Address", value: orgInfo.address },
    { icon: Globe, label: "Country", value: orgInfo.country },
    { icon: Navigation, label: "Coordinates", value: orgInfo.latitude && orgInfo.longitude ? `${orgInfo.latitude}, ${orgInfo.longitude}` : null },
    { icon: Building2, label: "Suite Number", value: orgInfo.suite_number },
  ].filter(r => r.value) : []

  return (
    <div className="flex-1 max-w-3xl mx-auto fade-in space-y-6">
      {/* Account Info Card */}
      <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-slate-100 px-6 py-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-heading font-semibold text-slate-800">{orgInfo?.name || "Your Account"}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-sm text-slate-500">{email}</span>
                </div>
              </div>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs font-medium px-3 py-1">
              {role === "business" ? "Donor Account" : "NGO Account"}
            </Badge>
          </div>
        </div>

        {/* Expandable Registered Info */}
        <CardContent className="p-0">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between px-6 py-3.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <span>View Registered Details</span>
            {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showDetails && detailRows.length > 0 && (
            <div className="border-t border-slate-100 px-6 pb-5 pt-3">
              <div className="grid gap-3">
                {detailRows.map((row, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 px-3 rounded-lg bg-slate-50">
                    <row.icon className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{row.label}</p>
                      <p className="text-sm text-slate-700">{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showDetails && detailRows.length === 0 && (
            <div className="border-t border-slate-100 px-6 py-4 text-center text-sm text-slate-400">
              No registered organization details found.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Settings */}
      <DonorProfileSettings />
    </div>
  )
}
