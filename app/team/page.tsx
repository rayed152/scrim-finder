'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getRankName } from '@/lib/valorant'

export default function TeamManagementPage() {
  const router = useRouter()
  const [team, setTeam] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchTeam()
  }, [])

  const fetchTeam = async () => {
    try {
      const res = await fetch('/api/teams')
      if (res.ok) {
        const data = await res.json()
        setTeam(data.team)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const leaveTeam = async () => {
    if (!confirm('Are you sure you want to leave this team?')) return
    setActionLoading(true)
    try {
      const res = await fetch('/api/teams/leave', { method: 'POST' })
      if (res.ok) {
        router.push('/dashboard')
        router.refresh()
      } else {
        const err = await res.json()
        alert(err.message)
      }
    } catch {
      alert('Error leaving team')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">Loading...</div>

  if (!team) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">You are not in a team</h1>
        <Link href="/dashboard" className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition">Go to Dashboard</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard" className="text-sm text-neutral-400 hover:text-white px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-md transition-colors">
            ← Back to Dashboard
          </Link>
          <button 
            onClick={leaveTeam}
            disabled={actionLoading || team.isQueued}
            className="px-4 py-2 text-sm font-semibold text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-md transition-colors disabled:opacity-50"
          >
            {team.isQueued ? 'Cannot leave while queued' : 'Leave Team'}
          </button>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10 pb-8 border-b border-neutral-800">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{team.name}</h1>
              <p className="text-neutral-400 font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                {team.server} Region
              </p>
            </div>
            
            <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 w-full md:w-auto">
              <p className="text-xs uppercase tracking-widest text-neutral-500 font-bold mb-2">Invite Code (Team ID)</p>
              <div className="flex items-center gap-3">
                <code className="bg-neutral-900 px-3 py-1.5 rounded text-red-400 font-mono text-sm truncate max-w-[200px]">
                  {team.id}
                </code>
                <button 
                  onClick={() => navigator.clipboard.writeText(team.id)}
                  className="p-1.5 text-neutral-400 hover:text-white bg-neutral-800 rounded transition"
                  title="Copy ID"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                </button>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mb-4">Roster <span className="text-neutral-500 font-normal">({team.members.length}/5)</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {team.members.map((m: any) => (
              <div key={m.id} className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white text-lg">{m.user.name}</h3>
                    {team.captainId === m.user.id && (
                      <span className="text-[10px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded uppercase font-bold tracking-wider">Captain</span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-400 mt-1">{m.user.valorantTag || 'No Riot ID Set'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-neutral-500 uppercase font-bold tracking-widest">Rank</p>
                  <p className="text-sm text-neutral-300 font-medium">{m.user.rank ? getRankName(m.user.rank) : 'Unranked'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
