"use client"

export const dynamic = "force-dynamic"

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Leaf, LogOut, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [role, setRole] = useState<"business" | "ngo" | null>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/auth")
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (profile?.role) {
        setRole(profile.role as "business" | "ngo")
        
        // If user is on the wrong portal, redirect them
        if (profile.role === "ngo" && pathname.startsWith("/dashboard/business")) {
          router.push("/dashboard/ngo")
        } else if (profile.role === "business" && pathname.startsWith("/dashboard/ngo")) {
          router.push("/dashboard/business")
        }
      } else {
        // Fallback: check user_metadata
        const metaRole = user.user_metadata?.role
        if (metaRole === "ngo") {
          setRole("ngo")
        } else {
          setRole("business")
        }
      }

      setLoading(false)
    }

    loadProfile()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth")
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
      </div>
    )
  }

  const portalName = role === "ngo" ? "Receiver Portal" : "Donor Portal"
  const portalPath = role === "ngo" ? "/dashboard/ngo" : "/dashboard/business"

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-14 items-center border-b border-slate-200 bg-white/80 backdrop-blur-lg px-4 md:px-6">
        <Link
          href={portalPath}
          className="flex items-center gap-2 mr-6"
        >
          <Leaf className="h-5 w-5 text-emerald-600" />
          <span className="text-lg font-heading font-bold tracking-tight text-slate-800">SuS-Food</span>
        </Link>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${role === "ngo" ? "bg-sky-100 text-sky-700" : "bg-emerald-100 text-emerald-700"}`}>
          {portalName}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-slate-500 hover:text-slate-900 gap-1.5 text-sm"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8 bg-slate-50">
        {children}
      </main>
    </div>
  )
}
