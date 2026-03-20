import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  try {
    const { id: postId } = await params
    
    // Check if the user is authorized for this post's team (optional but recommended)
    const challenges = await prisma.scrimChallenge.findMany({
      where: { postId },
      include: {
        challengerTeam: {
          select: {
            name: true,
            server: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(challenges)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Error fetching challenges' }, { status: 500 })
  }
}
