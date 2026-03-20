'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function JoinTeamPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const teamId = formData.get('teamId') as string

    try {
      const res = await fetch('/api/teams/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.message || 'Failed to join team')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-950 p-6">
      <Link href="/dashboard" className="text-sm text-neutral-400 hover:text-white mb-8 block px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-md w-fit transition-colors">
        ← Back to Dashboard
      </Link>

      <div className="max-w-md w-full mx-auto p-8 bg-neutral-900 rounded-xl border border-neutral-800 shadow-xl">
        <h1 className="text-2xl font-bold text-white mb-2">Join a Team</h1>
        <p className="text-neutral-400 text-sm mb-6">Ask your captain for the Team ID.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">{error}</div>}
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-300">Team ID</label>
            <input 
              name="teamId" 
              type="text" 
              required 
              className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-colors text-white font-mono"
              placeholder="clkb4df..."
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2.5 mt-4 font-semibold text-white bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 hover:text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Joining...' : 'Join Team'}
          </button>
        </form>
      </div>
    </div>
  )
}
