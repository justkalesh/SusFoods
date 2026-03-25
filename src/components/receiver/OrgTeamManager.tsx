"use client"

import { useState } from "react"
import { MOCK_ORG_TEAM, type TeamMember } from "@/lib/mock-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, UserPlus, Shield, Truck, HandHelping, Crown, Trash2 } from "lucide-react"

interface OrgTeamManagerProps {
  initialTeam?: TeamMember[]
}

const roleIcons: Record<TeamMember["role"], React.ReactNode> = {
  Admin: <Crown className="w-3 h-3" />,
  Coordinator: <Shield className="w-3 h-3" />,
  Volunteer: <HandHelping className="w-3 h-3" />,
  Driver: <Truck className="w-3 h-3" />,
}

const roleBadgeStyles: Record<TeamMember["role"], string> = {
  Admin: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  Coordinator: "bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800",
  Volunteer: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  Driver: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
}

export function OrgTeamManager({ initialTeam = MOCK_ORG_TEAM }: OrgTeamManagerProps) {
  const [team, setTeam] = useState<TeamMember[]>(initialTeam)
  const [showForm, setShowForm] = useState(false)

  const handleAddMember = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const newMember: TeamMember = {
      id: `t_${Date.now()}`,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      role: formData.get("role") as TeamMember["role"],
      joinedAt: new Date().toISOString(),
    }

    setTeam([...team, newMember])
    setShowForm(false)
    e.currentTarget.reset()
  }

  const handleRemoveMember = (id: string) => {
    setTeam(team.filter((m) => m.id !== id))
  }

  return (
    <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-white/5 border-b-2 border-b-purple-500/50 shadow-inner">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-heading">
              <Users className="h-5 w-5 text-purple-500" /> Organization Team
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
              {team.length} member{team.length !== 1 ? "s" : ""} in your organization
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => setShowForm(!showForm)}
            className={`gap-1.5 transition-all ${
              showForm
                ? "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
                : "bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            {showForm ? "Cancel" : "Add Member"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Member Form */}
        {showForm && (
          <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-800/50 bg-purple-50/50 dark:bg-purple-950/20 animate-in slide-in-from-top-2 duration-200">
            <form onSubmit={handleAddMember} className="space-y-3">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="member-name" className="text-sm text-slate-700 dark:text-slate-300">
                    Full Name
                  </Label>
                  <Input
                    id="member-name"
                    name="name"
                    placeholder="e.g. Meera Patel"
                    required
                    className="bg-white dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus-visible:ring-purple-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="member-email" className="text-sm text-slate-700 dark:text-slate-300">
                    Email
                  </Label>
                  <Input
                    id="member-email"
                    name="email"
                    type="email"
                    placeholder="meera@org.com"
                    required
                    className="bg-white dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus-visible:ring-purple-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="member-role" className="text-sm text-slate-700 dark:text-slate-300">
                    Role
                  </Label>
                  <select
                    id="member-role"
                    name="role"
                    required
                    className="flex h-10 w-full items-center rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                  >
                    <option value="Volunteer">Volunteer</option>
                    <option value="Coordinator">Coordinator</option>
                    <option value="Driver">Driver</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_12px_rgba(147,51,234,0.3)]"
              >
                <UserPlus className="w-4 h-4 mr-1.5" />
                Add to Team
              </Button>
            </form>
          </div>
        )}

        {/* Team Table */}
        <div className="rounded-xl border border-slate-200 dark:border-white/5 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/30">
                <TableHead className="text-slate-600 dark:text-slate-400">Name</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400">Email</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400">Role</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400">Joined</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400 w-[60px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {team.map((member) => (
                <TableRow
                  key={member.id}
                  className="border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors"
                >
                  <TableCell className="font-medium text-slate-800 dark:text-slate-200">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-sky-400 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        {member.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      {member.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400 text-sm">{member.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`gap-1 ${roleBadgeStyles[member.role]}`}>
                      {roleIcons[member.role]}
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400 text-sm" suppressHydrationWarning>
                    {new Date(member.joinedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="Remove member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
              {team.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                    No team members yet. Add your first member above.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
