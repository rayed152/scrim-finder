'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const valorantTag = formData.get('valorantTag') as string

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, valorantTag }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.message || 'Registration failed')
      } else {
        router.push('/login')
      }
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-neutral-900 rounded-xl border border-neutral-800 shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-rose-400 bg-clip-text text-transparent">Create Account</h1>
          <p className="mt-2 text-sm text-neutral-400">Join Valorant Scrim Finder</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">{error}</div>}
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-300">Name</label>
            <input 
              name="name" 
              type="text" 
              required 
              className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-colors"
              placeholder="Jett"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-300">Valorant Tag (Optional)</label>
            <input 
              name="valorantTag" 
              type="text" 
              className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-colors"
              placeholder="Jett#NA1"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-300">Email</label>
            <input 
              name="email" 
              type="email" 
              required 
              className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-colors"
              placeholder="jett@example.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-300">Password</label>
            <input 
              name="password" 
              type="password" 
              required 
              className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2.5 font-semibold text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-400">
          Already have an account? <Link href="/login" className="text-red-400 hover:text-red-300 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
