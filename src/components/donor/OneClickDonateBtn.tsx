"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart, Loader2, CheckCircle2 } from "lucide-react"

interface OneClickDonateBtnProps {
  itemId: string
  itemName: string
  onDonate: (itemId: string) => void
  size?: "sm" | "default"
}

export function OneClickDonateBtn({
  itemId,
  itemName,
  onDonate,
  size = "sm",
}: OneClickDonateBtnProps) {
  const [state, setState] = useState<"idle" | "confirming" | "done">("idle")

  const handleClick = () => {
    if (state !== "idle") return

    setState("confirming")

    // Brief confirmation delay
    setTimeout(() => {
      onDonate(itemId)
      setState("done")

      // Reset after showing success
      setTimeout(() => setState("idle"), 2000)
    }, 800)
  }

  return (
    <Button
      size={size}
      disabled={state === "confirming"}
      onClick={handleClick}
      className={`gap-1.5 transition-all duration-300 ${
        state === "done"
          ? "bg-emerald-500 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]"
          : state === "confirming"
          ? "bg-amber-500 text-white"
          : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)] hover:shadow-[0_0_18px_rgba(16,185,129,0.5)]"
      }`}
      title={`Donate ${itemName}`}
    >
      {state === "confirming" ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Donating…
        </>
      ) : state === "done" ? (
        <>
          <CheckCircle2 className="w-3.5 h-3.5" />
          Donated!
        </>
      ) : (
        <>
          <Heart className="w-3.5 h-3.5" />
          Donate
        </>
      )}
    </Button>
  )
}
