import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto py-24">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          Find your next Valorant scrim <span className="text-red-500">instantly</span>.
        </h1>
        <p className="text-lg md:text-xl text-neutral-400 mb-10 max-w-2xl">
          Create your team, queue up, and get matched against teams of similar skill in your server region. No more waiting in discord LFG channels.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/register" className="px-8 py-4 text-base font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all hover:scale-105 shadow-xl shadow-red-500/20">
            Create an Account
          </Link>
          <Link href="/login" className="px-8 py-4 text-base font-semibold text-neutral-300 bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800 transition-all">
            Sign In
          </Link>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left w-full">
          <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4 text-red-500 font-bold text-xl">1</div>
            <h3 className="text-lg font-semibold text-white mb-2">Build your roster</h3>
            <p className="text-neutral-400 text-sm">Create a team and invite your friends. We calculate your average skill automatically.</p>
          </div>
          <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4 text-red-500 font-bold text-xl">2</div>
            <h3 className="text-lg font-semibold text-white mb-2">Enter the Queue</h3>
            <p className="text-neutral-400 text-sm">Select your preferred server and click find match. Our system finds the closest opponent.</p>
          </div>
          <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4 text-red-500 font-bold text-xl">3</div>
            <h3 className="text-lg font-semibold text-white mb-2">Play</h3>
            <p className="text-neutral-400 text-sm">Get real-time notifications when a match is found and instantly connect in-game.</p>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center border-t border-neutral-900 text-sm text-neutral-600">
        <p>Valorant Scrim Finder MVP. Not affiliated with Riot Games.</p>
      </footer>
    </div>
  )
}
