"use client"

import { useState, useEffect, useCallback } from "react"
import { MOCK_ALERT_POOL } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, BellRing, CheckCheck, Wifi } from "lucide-react"

interface Alert {
  id: string
  message: string
  timestamp: Date
  read: boolean
}

interface LiveReceiverAlertsProps {
  alertPool?: string[]
  intervalMs?: number
}

export function LiveReceiverAlerts({
  alertPool = MOCK_ALERT_POOL,
  intervalMs = 7000,
}: LiveReceiverAlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isPaused, setIsPaused] = useState(false)

  const pushAlert = useCallback(() => {
    const randomMessage = alertPool[Math.floor(Math.random() * alertPool.length)]
    const newAlert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      message: randomMessage,
      timestamp: new Date(),
      read: false,
    }
    setAlerts((prev) => [newAlert, ...prev].slice(0, 30)) // keep max 30
  }, [alertPool])

  useEffect(() => {
    if (isPaused) return

    // Push an initial alert immediately
    pushAlert()

    const interval = setInterval(() => {
      pushAlert()
    }, intervalMs + Math.random() * 3000) // slight randomness

    return () => clearInterval(interval)
  }, [isPaused, intervalMs, pushAlert])

  const unreadCount = alerts.filter((a) => !a.read).length

  const markAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })))
  }

  const markRead = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)))
  }

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })

  return (
    <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-white/5 border-b-2 border-b-amber-500/50 shadow-inner">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-heading">
            <div className="relative">
              <BellRing className="h-5 w-5 text-amber-500" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center animate-bounce shadow-sm">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            Live Alerts
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* Connection status */}
            <Badge
              variant="outline"
              className={`gap-1 text-xs ${
                isPaused
                  ? "text-slate-400 border-slate-300 dark:border-slate-700"
                  : "text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30"
              }`}
            >
              <Wifi className={`w-3 h-3 ${isPaused ? "" : "animate-pulse"}`} />
              {isPaused ? "Paused" : "Live"}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              {isPaused ? "Resume" : "Pause"}
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllRead}
                className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark All Read
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px] pr-2">
          <div className="space-y-2">
            {alerts.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <Bell className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Listening for nearby donations…</p>
              </div>
            )}
            {alerts.map((alert, index) => (
              <button
                key={alert.id}
                onClick={() => markRead(alert.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-300 group ${
                  !alert.read
                    ? "bg-amber-50/80 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50 shadow-sm"
                    : "bg-white/50 dark:bg-slate-950/30 border-slate-100 dark:border-white/5 opacity-70"
                } ${index === 0 && !alert.read ? "animate-in slide-in-from-top-2 duration-300" : ""}`}
              >
                <div className="flex items-start gap-3">
                  {/* Unread dot */}
                  <div className="mt-1.5 shrink-0">
                    {!alert.read ? (
                      <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-relaxed ${
                      !alert.read
                        ? "text-slate-800 dark:text-slate-200 font-medium"
                        : "text-slate-500 dark:text-slate-400"
                    }`}>
                      {alert.message}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider" suppressHydrationWarning>
                      {formatTime(alert.timestamp)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
