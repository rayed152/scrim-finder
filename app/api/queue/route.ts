import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    
    // Parse body for optional chosen server
    let body = {}
    try { body = await req.json() } catch(e) {}
    const requestedServer = (body as any).server


    // Checking if user is captain of a team
    const team = await prisma.team.findFirst({
      where: { captainId: session.user.id },
      include: {
        members: { include: { user: true } },
        queueEntry: true
      }
    })

    if (!team) {
      return NextResponse.json({ message: 'You must be a team captain to queue' }, { status: 400 })
    }

    if (team.isQueued || team.queueEntry) {
      return NextResponse.json({ message: 'Team is already queued' }, { status: 400 })
    }

    // Check minimum players (e.g., 5 for standard Valorant, 1 for MVP testing)
    const MIN_PLAYERS = parseInt(process.env.MIN_PLAYERS_TO_QUEUE || '1', 10)
    if (team.members.length < MIN_PLAYERS) {
      return NextResponse.json({ message: `Team must have at least ${MIN_PLAYERS} members to queue` }, { status: 400 })
    }

    // Calculate Average Rank
    const ranks = team.members.map((m: any) => m.user.rank).filter((r: any) => r !== null) as number[]
    const avgRankScore = ranks.length > 0 
      ? ranks.reduce((acc, curr) => acc + curr, 0) / ranks.length
      : 10 // Default to midway rank if no ranks exist e.g. Gold 1

    // Add to queue
    const queueEntry = await prisma.queueEntry.create({
      data: {
        teamId: team.id,
        avgRankScore,
        server: requestedServer || team.server, // Priority: chosen server, fallback: team default
      }
    })

    // Mark team as queued
    await prisma.team.update({
      where: { id: team.id },
      data: { isQueued: true }
    })

    return NextResponse.json({ queueEntry }, { status: 201 })
  } catch (error) {
    console.error('Queue Entry Error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const team = await prisma.team.findFirst({
      where: { captainId: session.user.id }
    })

    if (!team) {
      return NextResponse.json({ message: 'You must be a team captain to unqueue' }, { status: 400 })
    }

    // Remove from queue
    await prisma.queueEntry.deleteMany({
      where: { teamId: team.id }
    })

    // Update team queued state
    await prisma.team.update({
      where: { id: team.id },
      data: { isQueued: false }
    })

    return NextResponse.json({ message: 'Unqueued successfully' }, { status: 200 })
  } catch (error) {
    console.error('Queue Leave Error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
