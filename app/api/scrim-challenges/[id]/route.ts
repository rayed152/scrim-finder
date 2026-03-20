import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  try {
    const { id: challengeId } = await params
    const { status } = await req.json()

    if (!['accepted', 'declined'].includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 })
    }

    const challenge = await prisma.scrimChallenge.findUnique({
      where: { id: challengeId },
      include: { 
        post: true,
        challengerTeam: true
      }
    })

    if (!challenge || !challenge.post) {
      return NextResponse.json({ message: 'Challenge not found' }, { status: 404 })
    }

    // Verify user is captain of the posting team
    if (challenge.post.teamId) {
       const posterMembership = await prisma.teamMember.findUnique({
          where: { userId: session.user.id },
       })
       if (!posterMembership || posterMembership.teamId !== challenge.post.teamId) {
          return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
       }
    }

    if (challenge.status !== 'pending' || challenge.post.status !== 'active') {
       return NextResponse.json({ message: 'This challenge/post is no longer active' }, { status: 400 })
    }

    if (status === 'accepted') {
      // Create the match
      const match = await prisma.match.create({
        data: {
          team1Id: challenge.post.teamId,
          team2Id: challenge.challengerTeamId,
          server: challenge.post.server,
          rankDifference: 0, // Manual match
          status: 'pending',
          isScheduled: true,
        }
      })

      // Update post and accepted challenge
      await prisma.$transaction([
        prisma.scrimPost.update({ 
          where: { id: challenge.postId }, 
          data: { status: 'matched' } 
        }),
        prisma.scrimChallenge.update({ 
          where: { id: challengeId }, 
          data: { status: 'accepted' } 
        }),
        prisma.scrimChallenge.updateMany({ 
          where: { 
            postId: challenge.postId,
            id: { not: challengeId }
          }, 
          data: { status: 'declined' } 
        })
      ])

      return NextResponse.json({ status: 'accepted', matchId: match.id })
    }

    if (status === 'declined') {
       await prisma.scrimChallenge.update({
          where: { id: challengeId },
          data: { status: 'declined' }
       })
       return NextResponse.json({ status: 'declined' })
    }

    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Error handling challenge' }, { status: 500 })
  }
}
