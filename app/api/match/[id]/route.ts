import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { id: matchId } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        team1: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    name: true,
                    valorantTag: true,
                    discordId: true,
                    rank: true,
                  },
                },
              },
            },
          },
        },
        team2: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    name: true,
                    valorantTag: true,
                    discordId: true,
                    rank: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!match) {
      return NextResponse.json({ message: "Match not found" }, { status: 404 });
    }

    // Auto-complete match if it's older than 1 hour 30 mins (90 * 60 * 1000 ms) and NOT scheduled
    const matchTimeout = new Date(Date.now() - 1 * 60 * 1000);

    if (
      match.isScheduled === false &&
      match.status === "pending" &&
      match.createdAt < matchTimeout
    ) {
      console.log(
        `Auto-completing match ${matchId} (Created: ${match.createdAt})`,
      );
      await prisma.match.update({
        where: { id: matchId },
        data: { status: "completed" },
      });
      match.status = "completed";
    }

    const isMemberOfTeam1 = match.team1.members.some(
      (m: any) => m.userId === session.user.id,
    );
    const isMemberOfTeam2 = match.team2.members.some(
      (m: any) => m.userId === session.user.id,
    );

    if (!isMemberOfTeam1 && !isMemberOfTeam2) {
      return NextResponse.json(
        { message: "Access denied. You are not a participant in this match." },
        { status: 403 },
      );
    }

    return NextResponse.json(match);
  } catch (error) {
    console.error("Match Fetch Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { id: matchId } = await params;
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        team1: { select: { members: { select: { userId: true } } } },
        team2: { select: { members: { select: { userId: true } } } },
      },
    });

    if (!match) {
      return NextResponse.json({ message: "Match not found" }, { status: 404 });
    }

    const isMemberOfTeam1 = match.team1.members.some(
      (m) => m.userId === session.user.id,
    );
    const isMemberOfTeam2 = match.team2.members.some(
      (m) => m.userId === session.user.id,
    );

    if (!isMemberOfTeam1 && !isMemberOfTeam2) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: { status: "completed" },
      include: {
        team1: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    name: true,
                    valorantTag: true,
                    discordId: true,
                    rank: true,
                  },
                },
              },
            },
          },
        },
        team2: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    name: true,
                    valorantTag: true,
                    discordId: true,
                    rank: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedMatch);
  } catch (error) {
    console.error("End Match Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
