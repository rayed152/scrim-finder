'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SocketProvider, useSocket } from '@/components/SocketProvider'
import Link from 'next/link'
import { VALORANT_SERVERS } from '@/lib/valorant'
import { Suspense } from 'react'

function QueueMatchmaking() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const teamId = searchParams.get('teamId') || ''
  
  const { socket, connected } = useSocket()
  
  const isQueuedParam = searchParams.get('isQueued') === 'true'
  const [loading, setLoading] = useState(false)
  const [inQueue, setInQueue] = useState(isQueuedParam)
  const [matchFound, setMatchFound] = useState<{ matchId: string, opponentId: string } | null>(null)
  const [selectedServers, setSelectedServers] = useState<string[]>([])
  
  // Timer state
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (!socket || !teamId) return

    // Re-join room just in case
    if (connected) {
      socket.emit('joinTeamRoom', teamId)
    }

    const handleMatchFound = (data: { matchId: string, opponentId: string }) => {
      setMatchFound(data)
      setInQueue(false)
    }

    socket.on('matchFound', handleMatchFound)

    return () => {
      socket.off('matchFound', handleMatchFound)
    }
  }, [socket, connected, teamId])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (inQueue) {
      interval = setInterval(() => {
        setSeconds(s => s + 1)
      }, 1000)
    } else {
      setSeconds(0)
    }
    return () => clearInterval(interval)
  }, [inQueue])

  const startQueue = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/queue', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedServers.length > 0 ? { server: selectedServers.join(',') } : {})
      })
      if (!res.ok) {
        const error = await res.json()
        alert(error.message)
      } else {
        setInQueue(true)
        setSeconds(0)
      }
    } catch {
      alert('Error joining queue')
    } finally {
      setLoading(false)
    }
  }

  const stopQueue = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/queue', { method: 'DELETE' })
      if (res.ok) {
        setInQueue(false)
      }
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-950 p-6 items-center justify-center relative overflow-hidden">
      
      {/* Background ambient lighting based on state */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${matchFound ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/10 blur-[100px] rounded-full animate-pulse"></div>
      </div>
      
      <div className="absolute top-6 left-6 z-20">
        <Link href="/dashboard" className="text-sm text-neutral-400 hover:text-white px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-md transition-colors">
          ← Dashboard
        </Link>
      </div>

      <div className="z-10 w-full max-w-lg text-center">
        
        {matchFound ? (
          <div className="bg-neutral-900 border border-red-500/50 rounded-2xl p-10 shadow-[0_0_50px_rgba(239,68,68,0.2)] animate-in zoom-in-95 duration-500">
            <h1 className="text-4xl font-black text-white bg-gradient-to-r from-red-500 to-rose-400 bg-clip-text text-transparent uppercase tracking-widest mb-4">
              Match Found!
            </h1>
            <p className="text-neutral-300 text-lg mb-8">Opponent Team ID: <span className="font-mono text-white bg-neutral-800 px-2 py-1 rounded">{matchFound.opponentId}</span></p>
            
            <Link href={`/match/${matchFound.matchId}?teamId=${teamId}`} className="w-full block py-4 text-center font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors uppercase tracking-wider shadow-lg shadow-red-500/20">
              Go to Match Room
            </Link>
          </div>
        ) : (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-10 shadow-2xl relative">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Scrim Matchmaking</h2>
              <p className="text-neutral-400">Finding opponents with similar average rank.</p>
              
              <div className="mt-6 flex flex-col items-center justify-center">
                <span className="text-xs uppercase tracking-widest text-neutral-500 font-bold mb-2">Connection Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${connected ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {connected ? '● Server Connected' : '○ Disconnected'}
                </span>
              </div>
            </div>

            <div className="h-32 flex items-center justify-center mb-8">
              {inQueue ? (
                <div className="flex flex-col items-center animate-in fade-in duration-500">
                  <div className="w-16 h-16 border-4 border-neutral-800 border-t-red-500 rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(239,68,68,0.5)]"></div>
                  <p className="text-3xl font-mono text-white tracking-widest">{formatTime(seconds)}</p>
                  <p className="text-xs text-neutral-500 mt-2 uppercase tracking-widest">Searching</p>
                </div>
              ) : (
                <p className="text-xl font-medium text-neutral-500">Not in queue</p>
              )}
            </div>

            {inQueue ? (
              <button 
                onClick={stopQueue}
                disabled={loading}
                className="w-full py-4 font-bold text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors uppercase tracking-wider"
              >
                Cancel Search
              </button>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="text-left">
                  <label className="text-sm font-medium text-neutral-300 block mb-2">Queue Regions (Optional - Multiple Allowed)</label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {VALORANT_SERVERS.map(s => {
                      const isSelected = selectedServers.includes(s)
                      return (
                        <button
                          key={s}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedServers(selectedServers.filter(server => server !== s))
                            } else {
                              setSelectedServers([...selectedServers, s])
                            }
                          }}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                            isSelected 
                              ? 'bg-red-500/20 text-red-400 border-red-500/50' 
                              : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-white'
                          }`}
                        >
                          {s}
                        </button>
                      )
                    })}
                  </div>
                  {selectedServers.length === 0 && (
                    <p className="text-xs text-neutral-500 italic">No regions selected. We will match you based on your Team's default region.</p>
                  )}
                </div>
                <button 
                  onClick={startQueue}
                  disabled={loading || !connected}
                  className="w-full py-4 font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all hover:scale-105 uppercase tracking-wider shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:scale-100"
                >
                  Enter Queue
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default function QueuePageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">Loading...</div>}>
      <SocketProviderWrapper />
    </Suspense>
  )
}

function SocketProviderWrapper() {
  const searchParams = useSearchParams()
  const teamId = searchParams.get('teamId') || ''
  return (
    <SocketProvider teamId={teamId}>
      <QueueMatchmaking />
    </SocketProvider>
  )
}

