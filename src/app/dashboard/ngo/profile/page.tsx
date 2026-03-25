"use client"

export const dynamic = "force-dynamic"

import { NGOProfileSettings } from "@/components/receiver/NGOProfileSettings"

export default function NGOProfilePage() {
  return (
    <div className="flex-1 max-w-3xl mx-auto fade-in">
      <NGOProfileSettings />
    </div>
  )
}
