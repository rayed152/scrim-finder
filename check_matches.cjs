const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMatches() {
  const matches = await prisma.match.findMany({
    select: {
      id: true,
      isScheduled: true,
      status: true,
      createdAt: true
    }
  });
  console.log(JSON.stringify(matches, null, 2));
  await prisma.$disconnect();
}

checkMatches();
