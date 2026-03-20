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
    const { name, server } = body

    if (!name || !server) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 })
    }

    // Check if user is already in a team
    const existingMembership = await prisma.teamMember.findUnique({
      where: { userId: session.user.id }
    })

    if (existingMembership) {
      return NextResponse.json({ message: 'You are already in a team' }, { status: 400 })
    }

    // Check if team name is taken
    const existingTeam = await prisma.team.findUnique({
      where: { name }
    })

    if (existingTeam) {
      return NextResponse.json({ message: 'Team name is already taken' }, { status: 400 })
    }

    // Create Team
    const team = await prisma.team.create({
      data: {
        name,
        captainId: session.user.id,
        server,
        members: {
          create: {
            userId: session.user.id
          }
        }
      }
    })

    return NextResponse.json({ team }, { status: 201 })
  } catch (error) {
    console.error('Create Team Error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const membership = await prisma.teamMember.findUnique({
      where: { userId: session.user.id },
      include: {
        team: {
          include: {
            members: {
              include: { user: { select: { id: true, name: true, valorantTag: true, rank: true } } }
            }
          }
        }
      }
    })

    if (!membership) {
      return NextResponse.json({ team: null }, { status: 200 })
    }

    return NextResponse.json({ team: membership.team }, { status: 200 })
  } catch (error) {
    console.error('Get Team Error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
