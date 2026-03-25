"use client"

import { useState, useEffect } from "react"
import { calculateCO2Saved, generateTaxReceipt } from "@/lib/engine"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Recycle, Leaf } from "lucide-react"

interface ImpactMetricsProps {
  totalDonatedKg: number
}

function useCountUp(target: number, duration = 1500): number {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (target === 0) {
      setValue(0)
      return
    }

    const startTime = Date.now()
    const startValue = 0

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(startValue + (target - startValue) * eased))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [target, duration])

  return value
}

export function ImpactMetrics({ totalDonatedKg }: ImpactMetricsProps) {
  const co2Saved = calculateCO2Saved(totalDonatedKg)
  const taxValue = generateTaxReceipt(totalDonatedKg)

  const animatedKg = useCountUp(totalDonatedKg)
  const animatedCO2 = useCountUp(co2Saved)
  const animatedTax = useCountUp(taxValue)

  const metrics = [
    {
      label: "Total Food Rescued",
      value: `${animatedKg.toLocaleString()} kg`,
      icon: <Leaf className="w-5 h-5" />,
      color: "emerald",
      gradient: "from-emerald-500 to-teal-500",
      bgLight: "bg-emerald-50 dark:bg-emerald-950/30",
      textColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
      sub: `${(totalDonatedKg * 2.5).toFixed(0)} meals equivalent`,
    },
    {
      label: "CO₂ Emissions Reduced",
      value: `${animatedCO2.toLocaleString()} kg`,
      icon: <Recycle className="w-5 h-5" />,
      color: "cyan",
      gradient: "from-cyan-500 to-blue-500",
      bgLight: "bg-cyan-50 dark:bg-cyan-950/30",
      textColor: "text-cyan-600 dark:text-cyan-400",
      iconBg: "bg-cyan-100 dark:bg-cyan-900/50",
      sub: `Equivalent to ${Math.round(co2Saved / 4600)} flights NYC→LA`,
    },
    {
      label: "Estimated Tax Value Saved",
      value: `$${animatedTax.toLocaleString()}`,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "amber",
      gradient: "from-amber-500 to-orange-500",
      bgLight: "bg-amber-50 dark:bg-amber-950/30",
      textColor: "text-amber-600 dark:text-amber-500",
      iconBg: "bg-amber-100 dark:bg-amber-900/50",
      sub: "Based on verified NGO receipts",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {metrics.map((metric) => (
        <Card
          key={metric.label}
          className={`hover-card bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-white/5 border-b-2 border-b-${metric.color}-500/50 shadow-inner relative overflow-hidden`}
        >
          {/* Subtle gradient glow */}
          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${metric.gradient} opacity-5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none`} />

          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {metric.label}
            </CardTitle>
            <div className={`p-2 rounded-lg ${metric.iconBg} ${metric.textColor}`}>
              {metric.icon}
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold tabular-nums ${metric.textColor}`} suppressHydrationWarning>
              {metric.value}
            </div>
            <p className={`text-xs mt-1 ${metric.textColor} opacity-70`}>
              {metric.sub}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
