import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const membership = await prisma.teamMember.findUnique({
      where: { userId: session.user.id },
      include: { team: true }
    })

    if (!membership) {
      return NextResponse.json({ message: 'You are not in a team' }, { status: 400 })
    }

    const team = membership.team

    // Checking if team is currently queued
    if (team.isQueued) {
      return NextResponse.json({ message: 'Cannot leave team while queued' }, { status: 400 })
    }

    // If user is captain, we might need to assign a new captain or delete the team
    if (team.captainId === session.user.id) {
      const otherMembers = await prisma.teamMember.findMany({
        where: { teamId: team.id, userId: { not: session.user.id } }
      })

      if (otherMembers.length > 0) {
        // Assign first other member as new captain
        await prisma.team.update({
          where: { id: team.id },
          data: { captainId: otherMembers[0].userId }
        })
      } else {
        // Delete team since it's empty
        await prisma.team.delete({
          where: { id: team.id }
        })
        return NextResponse.json({ message: 'Left team successfully and team deleted' }, { status: 200 })
      }
    }

    // Remove user from team
    await prisma.teamMember.delete({
      where: { userId: session.user.id }
    })

    return NextResponse.json({ message: 'Left team successfully' }, { status: 200 })
  } catch (error) {
    console.error('Leave Team Error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
