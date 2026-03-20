import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { teamId } = body

    if (!teamId) {
      return NextResponse.json({ message: 'Team ID is required' }, { status: 400 })
    }

    // Check if user is already in a team
    const existingMembership = await prisma.teamMember.findUnique({
      where: { userId: session.user.id }
    })

    if (existingMembership) {
      return NextResponse.json({ message: 'You are already in a team' }, { status: 400 })
    }

    // Check if team exists
    const team = await prisma.team.findUnique({
      where: { id: teamId }
    })

    if (!team) {
      return NextResponse.json({ message: 'Team not found' }, { status: 404 })
    }

    // Join Team
    await prisma.teamMember.create({
      data: {
        userId: session.user.id,
        teamId: team.id
      }
    })

    return NextResponse.json({ message: 'Joined team successfully' }, { status: 200 })
  } catch (error) {
    console.error('Join Team Error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
