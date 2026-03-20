import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const posts = await prisma.scrimPost.findMany({
      where: { status: 'active' },
      include: {
        team: {
          select: {
            name: true,
            server: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(posts)
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching posts' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  try {
    const { rank, server, time, message } = await req.json()

    // Get user's team
    const membership = await prisma.teamMember.findUnique({
      where: { userId: session.user.id },
      include: { team: true }
    })

    if (!membership?.team) {
      return NextResponse.json({ message: 'You must be in a team to post' }, { status: 400 })
    }

    const post = await prisma.scrimPost.create({
      data: {
        teamId: membership.team.id,
        rank: parseInt(rank),
        server,
        time,
        message,
      }
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Error creating post' }, { status: 500 })
  }
}
