import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Trophy, Calendar, MapPin, ArrowRight } from 'lucide-react'

export default async function MatchHistoryPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const userId = session.user.id

  // Find the user's team first
  const membership = await prisma.teamMember.findUnique({
    where: { userId },
    include: { team: true }
  })

  const myTeam = membership?.team

  if (!myTeam) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-neutral-900 rounded-2xl flex items-center justify-center mb-6 border border-neutral-800">
           <Trophy className="text-neutral-500" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">No Team Found</h1>
        <p className="text-neutral-400 mb-8 max-w-sm">You need to be in a team to view your match history.</p>
        <Link href="/dashboard" className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition shadow-lg shadow-red-600/20">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  // Fetch all completed matches for this team
  const matches = await prisma.match.findMany({
    where: {
      status: 'completed',
      OR: [
        { team1Id: myTeam.id },
        { team2Id: myTeam.id }
      ]
    },
    include: {
      team1: true,
      team2: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20 text-red-500">
            <Trophy size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight italic">Match <span className="text-red-500">History</span></h1>
            <p className="text-neutral-500 text-sm font-medium">All completed scrims for {myTeam.name}</p>
          </div>
        </div>

        {matches.length === 0 ? (
          <div className="bg-neutral-900/50 border border-neutral-800 border-dashed rounded-2xl p-16 text-center">
            <p className="text-neutral-500 font-medium mb-4">No completed matches found yet.</p>
            <Link href="/dashboard" className="text-red-500 hover:text-red-400 font-bold transition-colors">
              Go find your first scrim →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {matches.map((match) => {
              const opponent = match.team1Id === myTeam.id ? match.team2 : match.team1
              const formattedDate = new Date(match.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })
              const formattedTime = new Date(match.createdAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })

              return (
                <Link 
                  key={match.id}
                  href={`/match/${match.id}?teamId=${myTeam.id}`}
                  className="group block bg-neutral-900 border border-neutral-800 hover:border-red-500/50 hover:bg-neutral-800/50 rounded-2xl transition-all overflow-hidden"
                >
                  <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="hidden md:flex flex-col items-center justify-center p-3 bg-neutral-950 border border-neutral-800 rounded-xl min-w-[100px]">
                        <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest mb-1">{formattedDate}</span>
                        <span className="text-sm font-mono text-white">{formattedTime}</span>
                      </div>
                      
                      <div>
                        <h2 className="text-xl font-black uppercase tracking-tight group-hover:text-red-500 transition-colors">
                          {myTeam.name} <span className="text-neutral-600 italic mx-2 font-light">vs</span> {opponent.name}
                        </h2>
                        <div className="flex items-center gap-4 mt-2">
                           <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
                              <MapPin size={12} className="text-red-500/50" />
                              {match.server}
                           </div>
                           <div className="w-1 h-1 bg-neutral-800 rounded-full" />
                           <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
                              <Calendar size={12} className="md:hidden" />
                              <span className="md:hidden">{formattedDate}</span>
                              <span className="text-green-500/80 uppercase text-[10px] font-bold tracking-widest">Completed</span>
                           </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center">
                       <span className="text-xs font-bold uppercase tracking-widest text-neutral-600 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">View Match</span>
                       <div className="w-10 h-10 bg-neutral-950 border border-neutral-800 rounded-full flex items-center justify-center group-hover:bg-red-600 group-hover:border-red-600 transition-all text-neutral-500 group-hover:text-white">
                          <ArrowRight size={18} />
                       </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
