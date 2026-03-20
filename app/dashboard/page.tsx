import { auth, signOut } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { LogOut } from 'lucide-react'
import ProfileUpdateForm from '@/components/ProfileUpdateForm'
import { calculateAverageRank, getRankName } from '@/lib/valorant'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const userSession = session.user
  const user = await prisma.user.findUnique({ where: { id: userSession.id } })
  if (!user) redirect('/login')

  // Fetch Team
  const membership = await prisma.teamMember.findUnique({
    where: { userId: user.id },
    include: {
      team: {
        include: {
          members: { include: { user: true } },
          queueEntry: true,
          matchesAsTeam1: { where: { status: 'pending' } },
          matchesAsTeam2: { where: { status: 'pending' } },
        }
      }
    }
  })

  const team = membership?.team || null
  const avgRankScore = team ? calculateAverageRank(team.members.map((m: any) => m.user.rank)) : null

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between border-b border-neutral-800 bg-neutral-900/50">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold bg-gradient-to-r from-red-500 to-rose-400 bg-clip-text text-transparent">Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-neutral-300">{user.name}</span>
          <form action={async () => {
            'use server';
            await signOut();
          }}>
            <button type="submit" className="p-2 text-neutral-400 hover:text-white bg-neutral-800 rounded-md transition-colors flex">
              <LogOut size={16} />
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* User Card */}
        <div className="col-span-1 border border-neutral-800 bg-neutral-900 rounded-xl p-6 shadow-xl h-fit">
          <h2 className="text-lg font-semibold text-white mb-4">Player Profile</h2>
          <ProfileUpdateForm 
            initialValorantTag={user.valorantTag}
            initialRank={user.rank}
            initialDiscordId={user.discordId}
          />
        </div>

        {/* Team Center */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          {!team ? (
            <div className="border border-neutral-800 border-dashed bg-neutral-900/30 rounded-xl p-12 text-center flex flex-col items-center justify-center">
              <h3 className="text-xl font-semibold text-white mb-2">You don't have a team</h3>
              <p className="text-neutral-400 mb-6 max-w-sm">Create a new team or ask your captain for an invite code/ID to join an existing roster.</p>
              <div className="flex gap-4">
                <Link href="/team/create" className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors">
                  Create Team
                </Link>
                <Link href="/team/join" className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-lg transition-colors">
                  Join Team
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Team Info */}
              <div className="border border-neutral-800 bg-neutral-900 rounded-xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{team.name}</h2>
                    <div className="flex flex-col gap-1 mt-2">
                      <p className="text-sm text-neutral-400 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Region: {team.server}
                      </p>
                      <p className="text-sm text-neutral-400 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        Avg Rank: <strong className="text-white">{getRankName(avgRankScore)}</strong>
                      </p>
                    </div>
                  </div>
                  <Link href="/team" className="px-4 py-2 border border-neutral-700 rounded-md text-sm font-medium hover:bg-neutral-800 transition">
                    Manage Roster
                  </Link>
                </div>
                
                <h3 className="text-sm font-semibold text-neutral-400 mb-3 uppercase tracking-wider">Active Roster ({team.members.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {team.members.map((m: any) => (
                    <div key={m.id} className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white flex items-center gap-2">
                          {m.user.name}
                          {team.captainId === m.user.id && <span className="text-[10px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded uppercase font-bold tracking-wider">Captain</span>}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">{m.user.valorantTag || 'No Riot ID'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Queue Control */}
              <div className={`border rounded-xl p-6 shadow-xl relative overflow-hidden transition-colors ${team.isQueued ? 'bg-red-500/10 border-red-500/50' : 'bg-neutral-900 border-neutral-800'}`}>
                {team.isQueued && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 rounded-full blur-3xl -mr-16 -mt-16 animate-pulse" />
                )}
                
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">Matchmaking</h2>
                    <p className={`text-sm mt-1 ${team.isQueued ? 'text-red-400 font-medium' : 'text-neutral-400'}`}>
                      {team.isQueued 
                        ? 'Searching for an opponent in your skill bracket...' 
                        : 'Your team is ready to find a scrim.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {team.isQueued ? (
                      <>
                        <form action={async () => {
                          'use server';
                          await prisma.queueEntry.deleteMany({ where: { teamId: team.id } });
                          await prisma.team.update({ where: { id: team.id }, data: { isQueued: false } });
                          revalidatePath('/dashboard');
                        }}>
                          <button type="submit" className="px-8 py-3 rounded-lg font-bold shadow-lg transition-all bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white border border-neutral-700">
                            Dequeue
                          </button>
                        </form>
                        <Link href={`/queue?teamId=${team.id}&isQueued=true`} className="px-8 py-3 rounded-lg font-bold shadow-lg transition-all bg-red-500 text-white hover:bg-red-600 shadow-red-500/20">
                          View Queue
                        </Link>
                      </>
                    ) : (
                      <Link href={`/queue?teamId=${team.id}`} className="px-8 py-3 rounded-lg font-bold shadow-lg transition-all bg-red-500 text-white hover:bg-red-600 hover:scale-105 shadow-red-500/20">
                        Enter Queue
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
