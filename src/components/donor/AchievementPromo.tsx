"use client"

import { useState, useRef } from "react"
import { calculateCO2Saved, generateTaxReceipt } from "@/lib/engine"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Lock, Share2, X, Leaf, Recycle, Star, Award, Gem, Crown } from "lucide-react"

interface AchievementPromoProps {
  totalDonatedKg: number
  organizationName?: string
}

interface Milestone {
  threshold: number
  title: string
  description: string
  icon: React.ReactNode
  gradient: string
  badgeColor: string
}

const milestones: Milestone[] = [
  {
    threshold: 25,
    title: "First Steps",
    description: "Rescued your first 25kg of food",
    icon: <Star className="w-5 h-5" />,
    gradient: "from-emerald-400 to-teal-500",
    badgeColor: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  },
  {
    threshold: 50,
    title: "Community Helper",
    description: "50kg of food saved from waste",
    icon: <Leaf className="w-5 h-5" />,
    gradient: "from-teal-400 to-cyan-500",
    badgeColor: "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800",
  },
  {
    threshold: 100,
    title: "Impact Maker",
    description: "100kg Food Rescued — a true changemaker!",
    icon: <Award className="w-5 h-5" />,
    gradient: "from-cyan-400 to-blue-500",
    badgeColor: "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800",
  },
  {
    threshold: 250,
    title: "Sustainability Champion",
    description: "250kg rescued — leading by example",
    icon: <Recycle className="w-5 h-5" />,
    gradient: "from-blue-400 to-indigo-500",
    badgeColor: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  },
  {
    threshold: 500,
    title: "Platinum Rescuer",
    description: "500kg — inspiring an entire community",
    icon: <Gem className="w-5 h-5" />,
    gradient: "from-indigo-400 to-purple-500",
    badgeColor: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
  },
  {
    threshold: 1000,
    title: "Legendary Hero",
    description: "1 Tonne of food rescued — you're legendary!",
    icon: <Crown className="w-5 h-5" />,
    gradient: "from-purple-400 to-pink-500",
    badgeColor: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  },
]

export function AchievementPromo({
  totalDonatedKg,
  organizationName = "Your Organization",
}: AchievementPromoProps) {
  const [shareCard, setShareCard] = useState<Milestone | null>(null)
  const shareRef = useRef<HTMLDivElement>(null)

  const isUnlocked = (threshold: number) => totalDonatedKg >= threshold

  const nextMilestone = milestones.find((m) => !isUnlocked(m.threshold))
  const progressToNext = nextMilestone
    ? Math.min(100, (totalDonatedKg / nextMilestone.threshold) * 100)
    : 100

  return (
    <>
      <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-white/5 border-b-2 border-b-purple-500/50 shadow-inner relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-purple-500/5 to-transparent rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />

        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-heading">
            <Trophy className="h-5 w-5 text-purple-500" /> Achievement Milestones
          </CardTitle>
          {nextMilestone && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>Progress to &quot;{nextMilestone.title}&quot;</span>
                <span>{totalDonatedKg}/{nextMilestone.threshold} kg</span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-700"
                  style={{ width: `${progressToNext}%` }}
                />
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {milestones.map((milestone) => {
              const unlocked = isUnlocked(milestone.threshold)
              return (
                <div
                  key={milestone.threshold}
                  className={`relative rounded-xl border p-4 transition-all duration-300 ${
                    unlocked
                      ? "bg-white/80 dark:bg-slate-950/60 border-slate-200 dark:border-white/10 hover:-translate-y-0.5 hover:shadow-lg"
                      : "bg-slate-100/60 dark:bg-slate-800/30 border-slate-200/50 dark:border-white/5 opacity-50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        unlocked
                          ? `bg-gradient-to-br ${milestone.gradient} text-white shadow-lg`
                          : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500"
                      }`}
                    >
                      {unlocked ? milestone.icon : <Lock className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className={`text-sm font-semibold ${unlocked ? "text-slate-800 dark:text-slate-200" : "text-slate-400 dark:text-slate-500"}`}>
                        {milestone.title}
                      </h4>
                      <Badge variant="outline" className={`text-[10px] mt-0.5 ${unlocked ? milestone.badgeColor : "text-slate-400 border-slate-300 dark:border-slate-600"}`}>
                        {milestone.threshold} kg
                      </Badge>
                    </div>
                  </div>
                  <p className={`text-xs ${unlocked ? "text-slate-600 dark:text-slate-400" : "text-slate-400 dark:text-slate-500"}`}>
                    {milestone.description}
                  </p>
                  {unlocked && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShareCard(milestone)}
                      className="mt-2 w-full gap-1.5 text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      Share Achievement
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Share Card Modal Overlay */}
      {shareCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShareCard(null)}
              className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Shareable Card */}
            <div
              ref={shareRef}
              className={`rounded-2xl bg-gradient-to-br ${shareCard.gradient} p-[2px] shadow-2xl`}
            >
              <div className="rounded-2xl bg-white dark:bg-slate-950 p-6 space-y-4">
                {/* Header */}
                <div className="text-center space-y-2">
                  <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${shareCard.gradient} flex items-center justify-center text-white shadow-xl`}>
                    <div className="scale-150">{shareCard.icon}</div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-heading">
                    🎉 {shareCard.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{shareCard.description}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                  <div className="text-center">
                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{totalDonatedKg} kg</div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">Food Rescued</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400">{calculateCO2Saved(totalDonatedKg)} kg</div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">CO₂ Saved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-amber-600 dark:text-amber-500">${generateTaxReceipt(totalDonatedKg)}</div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">Tax Value</div>
                  </div>
                </div>

                {/* Org & Branding */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">SuS-Food 2.0</span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{organizationName}</span>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-white/60 mt-3">
              Take a screenshot to share on social media!
            </p>
          </div>
        </div>
      )}
    </>
  )
}
