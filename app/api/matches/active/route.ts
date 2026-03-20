import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  try {
    const membership = await prisma.teamMember.findUnique({
      where: { userId: session.user.id }
    })

    if (!membership?.teamId) {
      return NextResponse.json({ matches: [] })
    }

    const matches = await prisma.match.findMany({
      where: {
        status: 'pending',
        OR: [
          { team1Id: membership.teamId },
          { team2Id: membership.teamId }
        ]
      },
      include: {
        team1: { select: { id: true, name: true } },
        team2: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(matches)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Error fetching active matches' }, { status: 500 })
  }
}
