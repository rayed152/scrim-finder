'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, Plus, MapPin, Clock, MessageSquare, Send, Trophy, Check, X } from 'lucide-react'
import { getRankName, VALORANT_RANKS, VALORANT_SERVERS } from '@/lib/valorant'
import { SocketProvider, useSocket } from '@/components/SocketProvider'

interface ScrimPost {
  id: string
  teamId: string
  team: {
    name: string
    server: string
  }
  rank: number
  server: string
  time: string
  message: string | null
  status: string
  createdAt: string
  challenges: any[]
}

export default function ScrimBoardWrapper() {
  const [myTeam, setMyTeam] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/teams')
      .then(res => res.json())
      .then(data => {
        setMyTeam(data.team)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
     <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-neutral-800 border-t-red-500 rounded-full animate-spin"></div>
     </div>
  )

  return (
    <SocketProvider teamId={myTeam?.id}>
      <ScrimBoardPage myTeam={myTeam} />
    </SocketProvider>
  )
}

function ScrimBoardPage({ myTeam }: { myTeam: any }) {
  const { socket } = useSocket()
  const [posts, setPosts] = useState<ScrimPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showPostModal, setShowPostModal] = useState(false)
  
  // Form state
  const [rank, setRank] = useState('10') // Gold 1 default
  const [server, setServer] = useState(VALORANT_SERVERS[0])
  const [time, setTime] = useState('')
  const [message, setMessage] = useState('')
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    fetchPosts()
  }, [])

  useEffect(() => {
    if (!socket) return
    socket.on('scrimPostCreated', fetchPosts)
    socket.on('newChallenge', (data) => {
       if (data.posterTeamId === myTeam?.id) fetchPosts()
    })
    return () => {
      socket.off('scrimPostCreated')
      socket.off('newChallenge')
    }
  }, [socket, myTeam?.id])

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/scrim-posts')
      if (res.ok) {
        const data = await res.json()
        setPosts(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault()
    setPosting(true)
    try {
      const res = await fetch('/api/scrim-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rank, server, time, message })
      })
      if (res.ok) {
        setShowPostModal(false)
        fetchPosts()
        socket?.emit('scrimPostCreated')
        // Reset form
        setTime('')
        setMessage('')
      } else {
        const err = await res.json()
        alert(err.message)
      }
    } catch (e) {
      alert('Error creating post')
    } finally {
      setPosting(false)
    }
  }

  const challengePost = async (post: ScrimPost) => {
    if (!myTeam) return alert('You must be in a team to challenge')
    if (!confirm(`Send a challenge to ${post.team.name}?`)) return
    
    try {
      const res = await fetch(`/api/scrim-posts/${post.id}/challenge`, {
        method: 'POST'
      })
      if (res.ok) {
        alert('Challenge sent!')
        fetchPosts()
        socket?.emit('newChallenge', { 
           posterTeamId: post.teamId, 
           challengerTeamId: myTeam.id, 
           postId: post.id 
        })
      } else {
        const err = await res.json()
        alert(err.message)
      }
    } catch (e) {
      alert('Error sending challenge')
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic flex items-center gap-3">
               <Shield className="text-red-500" size={36} />
               Scrim <span className="text-red-500">Board</span>
            </h1>
            <p className="text-neutral-500 mt-2 font-medium">Find and challenge teams for custom scrims.</p>
          </div>

          <button 
            onClick={() => setShowPostModal(true)}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest rounded-xl transition shadow-lg shadow-red-600/20 flex items-center gap-2"
          >
            <Plus size={20} />
            Post Scrim
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
             <div className="w-10 h-10 border-4 border-neutral-800 border-t-red-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.length === 0 ? (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-neutral-900 rounded-3xl">
                 <p className="text-neutral-500 font-medium">No active scrim posts. Be the first to post!</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 hover:border-neutral-700 transition-all flex flex-col shadow-xl">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold uppercase tracking-tight truncate max-w-[180px]">{post.team.name}</h3>
                      <p className="text-red-500 text-sm font-bold">{getRankName(post.rank)}</p>
                    </div>
                    <div className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                       {post.server}
                    </div>
                  </div>

                  <div className="space-y-3 mb-6 flex-1">
                    <div className="flex items-center gap-2 text-sm text-neutral-400 font-medium">
                      <Clock size={14} className="text-neutral-600" />
                      <span>{post.time}</span>
                    </div>
                    {post.message && (
                      <div className="flex items-start gap-2 text-sm text-neutral-400 bg-neutral-950/50 p-3 rounded-lg border border-neutral-800/50 italic">
                        <MessageSquare size={14} className="text-neutral-600 mt-1 shrink-0" />
                        <p>{post.message}</p>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => challengePost(post)}
                    disabled={myTeam?.id === post.teamId}
                    className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 disabled:hover:bg-neutral-800 text-white font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Send size={16} />
                    {myTeam?.id === post.teamId ? 'Your Post' : 'Challenge'}
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Active Matches Section */}
        {myTeam && (
          <div className="mt-20">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-8 flex items-center gap-3 italic text-green-500">
               <span className="w-2 h-6 bg-green-500 rounded-full"></span>
               Live <span className="text-white">Matches</span>
            </h2>
            <ActiveMatches myTeam={myTeam} />
          </div>
        )}

        {/* My Incoming Challenges Section */}
        {myTeam && (
           <div className="mt-20">
              <h2 className="text-2xl font-black uppercase tracking-tight mb-8 flex items-center gap-3 italic">
                 <span className="w-2 h-6 bg-red-500 rounded-full"></span>
                 Manage <span className="text-red-500">Challenges</span>
              </h2>
              <MyChallenges myTeam={myTeam} socket={socket} />
           </div>
        )}
      </div>

      {/* Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 w-full max-w-lg rounded-3xl p-8 shadow-2xl relative">
            <button 
               onClick={() => setShowPostModal(false)}
               className="absolute top-6 right-6 text-neutral-500 hover:text-white transition"
            >
               <X size={24} />
            </button>

            <h2 className="text-2xl font-black uppercase tracking-tight italic mb-6">Post a <span className="text-red-500">Scrim</span></h2>
            
            <form onSubmit={createPost} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Average Rank</label>
                  <select 
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:border-red-500 outline-none appearance-none cursor-pointer font-medium"
                  >
                    {VALORANT_RANKS.map(r => <option key={r.value} value={r.value}>{r.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Server</label>
                  <select 
                    value={server}
                    onChange={(e) => setServer(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:border-red-500 outline-none appearance-none cursor-pointer font-medium"
                  >
                    {VALORANT_SERVERS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Time / Schedule</label>
                <input 
                  type="text" 
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="e.g. 7:00 PM EST or ASAP"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:border-red-500 outline-none font-medium text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Message (Optional)</label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Looking for higher rank teams for practice"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-4 focus:border-red-500 outline-none font-medium h-32 resize-none"
                />
              </div>

              <button 
                type="submit"
                disabled={posting}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-red-600/20 disabled:opacity-50"
              >
                {posting ? 'Posting...' : 'Create Post'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function MyChallenges({ myTeam, socket }: { myTeam: any, socket: any }) {
   const [posts, setPosts] = useState<any[]>([])
   const [loading, setLoading] = useState(true)

   useEffect(() => {
      fetchMyPosts()
   }, [myTeam?.id])

   const fetchMyPosts = async () => {
      try {
         const res = await fetch('/api/scrim-posts')
         if (res.ok) {
            const all = await res.json()
            setPosts(all.filter((p: any) => p.teamId === myTeam.id))
         }
      } catch (e) {
         console.error(e)
      } finally {
         setLoading(false)
      }
   }

   return (
      <div className="space-y-6">
         {posts.map(post => (
            <div key={post.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg uppercase tracking-tight">Post for: {post.time}</h3>
                  <div className="text-[10px] bg-red-500/20 text-red-500 px-3 py-1 rounded-full font-bold uppercase tracking-widest">Active</div>
               </div>
               <PendingChallenges postId={post.id} socket={socket} myTeam={myTeam} onAccepted={fetchMyPosts} />
            </div>
         ))}
         {posts.length === 0 && !loading && <p className="text-neutral-500 italic">You haven't posted any scrims yet.</p>}
      </div>
   )
}

function PendingChallenges({ postId, socket, myTeam, onAccepted }: { postId: string, socket: any, myTeam: any, onAccepted: () => void }) {
   const [challenges, setChallenges] = useState<any[]>([])
   const [loading, setLoading] = useState(true)

   useEffect(() => {
      fetchChallenges()
   }, [postId])

   const fetchChallenges = async () => {
      try {
         const res = await fetch(`/api/scrim-posts/${postId}/challenges`)
         if (res.ok) setChallenges(await res.json())
      } catch (e) { console.error(e) } finally { setLoading(false) }
   }

   const handleChallenge = async (id: string, challengerTeamId: string, status: string) => {
      try {
         const res = await fetch(`/api/scrim-challenges/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
         })
         if (res.ok) {
            const data = await res.json()
            if (data.matchId) {
                socket?.emit('challengeAccepted', { 
                   challengerTeamId, 
                   matchId: data.matchId, 
                   posterTeamId: myTeam.id 
                })
                onAccepted() // Refresh list (as it might be matched now)
                window.location.href = `/match/${data.matchId}?teamId=${myTeam.id}`
            } else {
                fetchChallenges()
            }
         }
      } catch (e) { alert('Error updating challenge') }
   }

   if (loading) return <div className="text-sm text-neutral-500">Loading challenges...</div>

   const pending = challenges.filter(c => c.status === 'pending')

   return (
      <div className="space-y-3">
         {pending.map(c => (
            <div key={c.id} className="bg-neutral-950 p-4 border border-neutral-800 rounded-xl flex items-center justify-between">
               <div>
                  <p className="font-bold uppercase tracking-tight text-white">{c.challengerTeam.name}</p>
                  <p className="text-xs text-neutral-500">Wants to challenge you</p>
               </div>
               <div className="flex gap-2">
                  <button 
                     onClick={() => handleChallenge(c.id, c.challengerTeamId, 'accepted')}
                     className="p-3 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-all shadow-lg shadow-green-500/0 hover:shadow-green-500/20"
                     title="Accept Challenge"
                  >
                     <Check size={18} />
                  </button>
                  <button 
                     onClick={() => handleChallenge(c.id, c.challengerTeamId, 'declined')}
                     className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all shadow-lg shadow-red-500/0 hover:shadow-red-500/20"
                     title="Decline Challenge"
                  >
                     <X size={18} />
                  </button>
               </div>
            </div>
         ))}
         {pending.length === 0 && <p className="text-sm text-neutral-600 italic">No pending challenges yet.</p>}
      </div>
   )
}

function ActiveMatches({ myTeam }: { myTeam: any }) {
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActiveMatches()
  }, [myTeam?.id])

  const fetchActiveMatches = async () => {
    try {
      const res = await fetch('/api/matches/active')
      if (res.ok) {
        setMatches(await res.json())
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-sm text-neutral-500">Loading active matches...</div>

  if (matches.length === 0) {
    return <p className="text-sm text-neutral-600 italic">No active scrims right now.</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {matches.map((match: any) => {
        const opponent = match.team1Id === myTeam.id ? match.team2 : match.team1
        return (
          <div key={match.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex items-center justify-between group hover:border-green-500/30 transition-all">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 animate-pulse">
                  <Shield size={20} />
               </div>
               <div>
                  <h3 className="font-bold uppercase tracking-tight text-white group-hover:text-green-500 transition-colors truncate max-w-[120px]">
                     vs {opponent.name}
                  </h3>
                  <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest mt-1">
                     Match In Progress
                  </p>
               </div>
            </div>
            
            <Link 
              href={`/match/${match.id}?teamId=${myTeam.id}`}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-black uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-green-600/20"
            >
              Join Match
            </Link>
          </div>
        )
      })}
    </div>
  )
}

