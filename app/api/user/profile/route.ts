import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { valorantTag, rank, discordId } = await req.json();

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        valorantTag: valorantTag !== undefined ? valorantTag : undefined,
        rank: rank !== undefined ? parseInt(rank) : undefined,
        discordId: discordId !== undefined ? discordId : undefined,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("User Profile Update Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
