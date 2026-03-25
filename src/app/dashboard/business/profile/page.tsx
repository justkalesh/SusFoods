"use client"

export const dynamic = "force-dynamic"

import { DonorProfileSettings } from "@/components/donor/DonorProfileSettings"

export default function DonorProfilePage() {
  return (
    <div className="flex-1 max-w-3xl mx-auto fade-in">
      <DonorProfileSettings />
    </div>
  )
}
