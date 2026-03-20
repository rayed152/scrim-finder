import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  try {
    const { id: postId } = await params
    
    // Get user's team
    const membership = await prisma.teamMember.findUnique({
      where: { userId: session.user.id },
      include: { team: true }
    })

    if (!membership?.team) {
      return NextResponse.json({ message: 'You must be in a team to challenge' }, { status: 400 })
    }

    const post = await prisma.scrimPost.findUnique({
      where: { id: postId },
      include: { team: true }
    })

    if (!post || post.status !== 'active') {
      return NextResponse.json({ message: 'Post is no longer active' }, { status: 400 })
    }

    if (post.teamId === membership.team.id) {
      return NextResponse.json({ message: 'You cannot challenge your own post' }, { status: 400 })
    }

    const challenge = await prisma.scrimChallenge.create({
      data: {
        postId,
        challengerTeamId: membership.team.id,
      }
    })

    return NextResponse.json(challenge)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Error challenging post' }, { status: 500 })
  }
}
