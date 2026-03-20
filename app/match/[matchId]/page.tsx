'use client'

import { useEffect, useState, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface Member {
  user: {
    name: string
    valorantTag: string | null
    discordId: string | null
    rank: number | null
  }
}

interface Team {
  id: string
  name: string
  members: Member[]
}

interface Match {
  id: string
  team1: Team
  team2: Team
  server: string
  status: string
  createdAt: string
}

export default function MatchRoomPage({ params }: { params: Promise<{ matchId: string }> }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const teamId = searchParams.get('teamId')
  const { matchId } = use(params)
  
  const [match, setMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(true)
  const [ending, setEnding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const endMatch = async () => {
    if (!confirm('Are you sure you want to end this match? This will mark the scrim as completed for both teams.')) return
    
    setEnding(true)
    try {
      const res = await fetch(`/api/match/${matchId}`, { 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      })
      if (res.ok) {
        const updated = await res.json()
        setMatch(updated)
      } else {
        const err = await res.json()
        alert(err.message || 'Failed to end match')
      }
    } catch {
      alert('Error ending match')
    } finally {
      setEnding(false)
    }
  }

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const res = await fetch(`/api/match/${matchId}`)
        if (!res.ok) throw new Error('Failed to fetch match details')
        const data = await res.json()
        setMatch(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (matchId) {
      fetchMatch()
    }
  }, [matchId])

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-neutral-800 border-t-red-500 rounded-full animate-spin mb-4"></div>
          <p className="text-neutral-400 font-medium">Entering Match Room...</p>
        </div>
      </div>
    )
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
          <p className="text-neutral-400 mb-8">{error || 'Match not found'}</p>
          <Link href="/dashboard" className="inline-block px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const isTeam1 = match.team1.id === teamId
  const myTeam = isTeam1 ? match.team1 : match.team2
  const opponentTeam = isTeam1 ? match.team2 : match.team1

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 md:p-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-rose-500 to-red-600"></div>
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-600/5 blur-[120px] rounded-full"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-red-600/5 blur-[120px] rounded-full"></div>

      <div className="max-w-6xl mx-auto z-10 relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-white transition-colors flex items-center gap-2 mb-4">
              <span>← Back to Dashboard</span>
            </Link>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic">
              Match <span className="text-red-500">Room</span>
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <button 
                onClick={copyLink}
                className="px-3 py-1 bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-xs font-bold text-neutral-300 uppercase tracking-widest rounded transition flex items-center gap-2"
              >
                {copied ? '✓ Copied!' : '🔗 Copy Match Link'}
              </button>
              <p className="text-neutral-500 font-mono text-xs uppercase tracking-widest">
                Server: {match.server}
              </p>
            </div>
          </div>
          
          <div className="bg-neutral-900 border border-neutral-800 px-6 py-3 rounded-xl flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest">Status</span>
              <span className={`${match.status === 'completed' ? 'text-neutral-500' : 'text-green-500'} font-bold uppercase text-sm`}>
                {match.status === 'completed' ? 'Completed' : 'Active Match'}
              </span>
            </div>
            <div className="w-px h-8 bg-neutral-800"></div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest">Created</span>
              <span className="text-white font-medium text-sm">{new Date(match.createdAt).toLocaleTimeString()}</span>
            </div>
          </div>

          {match.status !== 'completed' && (
            <button 
              onClick={endMatch}
              disabled={ending}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest rounded-xl transition shadow-lg shadow-red-600/20 disabled:opacity-50"
            >
              {ending ? 'Ending...' : 'End Match'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* My Team */}
          <TeamCard team={match.team1} isMyTeam={match.team1.id === teamId} label="Team 1" />
          
          {/* Opponent Team */}
          <TeamCard team={match.team2} isMyTeam={match.team2.id === teamId} label="Team 2" />
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8 backdrop-blur-sm">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
            <span className="w-2 h-6 bg-red-500 rounded-full"></span>
            Match Instructions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center text-red-500 font-bold">1</div>
              <h4 className="font-bold">Contact Opponent</h4>
              <p className="text-sm text-neutral-400">Add the opponent's captain on Discord to coordinate the custom game lobby.</p>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center text-red-500 font-bold">2</div>
              <h4 className="font-bold">Lobby Setup</h4>
              <p className="text-sm text-neutral-400">Settings: Tournament Mode, Cheats Off, Overtime: Win by Two. Server: {match.server}.</p>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center text-red-500 font-bold">3</div>
              <h4 className="font-bold">Play & Report</h4>
              <p className="text-sm text-neutral-400">Good luck! Once finished, both teams should report the score in the dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TeamCard({ team, isMyTeam, label }: { team: Team, isMyTeam: boolean, label: string }) {
  return (
    <div className={`rounded-2xl border ${isMyTeam ? 'border-red-500/30' : 'border-neutral-800'} overflow-hidden bg-neutral-900 shadow-xl`}>
      <div className={`p-6 border-b ${isMyTeam ? 'border-red-500/20 bg-red-500/5' : 'border-neutral-800 bg-neutral-900/50'}`}>
        <div className="flex justify-between items-center mb-1">
          <span className={`text-[10px] uppercase font-black tracking-[0.2em] ${isMyTeam ? 'text-red-500' : 'text-neutral-500'}`}>
            {label} {isMyTeam && '(Your Team)'}
          </span>
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight truncate">{team.name}</h2>
      </div>
      
      <div className="p-0">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest border-b border-neutral-800">
              <th className="px-6 py-4">Player</th>
              <th className="px-6 py-4 text-right">Discord ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {team.members.map((member, i) => (
              <tr key={i} className="group hover:bg-neutral-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-white font-bold group-hover:text-red-400 transition-colors uppercase italic">{member.user.valorantTag || member.user.name}</span>
                    <span className="text-[10px] text-neutral-500">Rank Score: {member.user.rank || 'N/A'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="bg-neutral-800 text-neutral-300 px-3 py-1 rounded text-xs font-mono group-hover:bg-neutral-700 transition-colors">
                    {member.user.discordId || 'Not Linked'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
