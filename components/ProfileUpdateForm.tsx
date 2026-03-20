'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ProfileUpdateFormProps {
  initialValorantTag?: string | null
  initialRank?: number | null
  initialDiscordId?: string | null
}

export default function ProfileUpdateForm({
  initialValorantTag,
  initialRank,
  initialDiscordId
}: ProfileUpdateFormProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    valorantTag: initialValorantTag || '',
    rank: initialRank?.toString() || '',
    discordId: initialDiscordId || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        setIsEditing(false)
        router.refresh()
      } else {
        alert('Failed to update profile')
      }
    } catch {
      alert('Error updating profile')
    } finally {
      setLoading(false)
    }
  }

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">Valorant Tag</p>
            <p className="text-neutral-200">{initialValorantTag || 'Not set'}</p>
          </div>
          <button 
            onClick={() => setIsEditing(true)}
            className="text-xs text-red-500 hover:text-red-400 font-bold uppercase tracking-widest"
          >
            Edit
          </button>
        </div>
        <div>
          <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">Rank ID</p>
          <p className="inline-block px-3 py-1 bg-neutral-800 text-white rounded-md mt-1 text-sm">{initialRank || 'Unranked'}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">Discord ID</p>
          <p className="text-neutral-200 flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-neutral-800 flex items-center justify-center text-[10px]">#</span>
            {initialDiscordId || 'Not set'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <div>
          <label className="text-xs text-neutral-500 uppercase tracking-wider font-semibold block mb-1">Valorant Tag (IGN)</label>
          <input 
            type="text"
            placeholder="Name#TAG"
            value={formData.valorantTag}
            onChange={e => setFormData({ ...formData, valorantTag: e.target.value })}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-sm text-white focus:border-red-500 outline-none transition"
          />
        </div>
        <div>
          <label className="text-xs text-neutral-500 uppercase tracking-wider font-semibold block mb-1">Rank (Numeric 0-27)</label>
          <input 
            type="number"
            min="0"
            max="27"
            value={formData.rank}
            onChange={e => setFormData({ ...formData, rank: e.target.value })}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-sm text-white focus:border-red-500 outline-none transition"
          />
        </div>
        <div>
          <label className="text-xs text-neutral-500 uppercase tracking-wider font-semibold block mb-1">Discord ID</label>
          <input 
            type="text"
            placeholder="username#0000"
            value={formData.discordId}
            onChange={e => setFormData({ ...formData, discordId: e.target.value })}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-sm text-white focus:border-red-500 outline-none transition"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button 
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase rounded transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
        <button 
          type="button"
          onClick={() => setIsEditing(false)}
          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 text-xs uppercase rounded transition"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
