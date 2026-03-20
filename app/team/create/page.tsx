'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { VALORANT_SERVERS } from '@/lib/valorant'

export default function CreateTeamPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const server = formData.get('server') as string

    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, server }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.message || 'Failed to create team')
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
        <h1 className="text-2xl font-bold text-white mb-2">Create a new Team</h1>
        <p className="text-neutral-400 text-sm mb-6">You will be set as the team captain.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">{error}</div>}
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-300">Team Name</label>
            <input 
              name="name" 
              type="text" 
              required 
              className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-colors text-white"
              placeholder="e.g. Sentinels"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-300">Preferred Server</label>
            <select 
              name="server" 
              required 
              className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-colors text-white"
            >
              {VALORANT_SERVERS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <p className="text-xs text-neutral-500 mt-1">This server will be used for matchmaking.</p>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2.5 mt-4 font-semibold text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Team'}
          </button>
        </form>
      </div>
    </div>
  )
}
