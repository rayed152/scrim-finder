'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
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

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        setError('Invalid credentials')
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
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-neutral-900 rounded-xl border border-neutral-800 shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-rose-400 bg-clip-text text-transparent">Valorant Scrim Finder</h1>
          <p className="mt-2 text-sm text-neutral-400">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">{error}</div>}
          
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
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-400">
          Don't have an account? <Link href="/register" className="text-red-400 hover:text-red-300 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
