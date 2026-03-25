"use client"

export const dynamic = "force-dynamic"

import * as React from "react"
import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Leaf, Loader2 } from "lucide-react"

function AuthContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      if (!data.user) {
        setError("Login failed. Please try again.")
        setLoading(false)
        return
      }

      // Fetch user role from profiles table
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single()

      if (profileError || !profile) {
        // Fallback: check user_metadata from auth
        const role = data.user.user_metadata?.role
        if (role === "ngo") {
          router.push("/dashboard/ngo")
        } else {
          router.push("/dashboard/business")
        }
        router.refresh()
        return
      }

      // Redirect based on role
      if (profile.role === "ngo") {
        router.push("/dashboard/ngo")
      } else {
        router.push("/dashboard/business")
      }
      router.refresh()
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
        <Link className="flex items-center gap-2 font-bold" href="/">
          <Leaf className="h-6 w-6 text-emerald-600 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
          <span className="text-2xl font-extrabold tracking-tight font-heading bg-clip-text text-transparent bg-linear-to-r from-emerald-600 to-teal-500">SuS-Food</span>
        </Link>
      </div>

      <div className="w-full max-w-md">
        <Card className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <CardHeader>
            <CardTitle className="text-slate-900 text-2xl font-heading">Welcome back</CardTitle>
            <CardDescription className="text-slate-500">
              Sign in with your email and password to access your portal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="m@example.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white border-slate-200 text-slate-900 focus-visible:ring-emerald-500 focus-visible:border-emerald-500" 
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                  <Link href="#" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors">Forgot password?</Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white border-slate-200 text-slate-900 focus-visible:ring-emerald-500 focus-visible:border-emerald-500" 
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all text-base py-5 mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
            
            <div className="text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-4">
                Get Started
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>}>
      <AuthContent />
    </Suspense>
  )
}
