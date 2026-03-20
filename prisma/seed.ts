import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create users
  const passwordHash = await bcrypt.hash('password123', 10)
  
  const user1 = await prisma.user.upsert({
    where: { email: 'jett@example.com' },
    update: {},
    create: {
      email: 'jett@example.com',
      name: 'Jett Main',
      passwordHash,
      valorantTag: 'Jett#NA1',
      rank: 20, // Diamond 2
      preferredServer: 'US West',
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'sage@example.com' },
    update: {},
    create: {
      email: 'sage@example.com',
      name: 'Sage Heals',
      passwordHash,
      valorantTag: 'Sage#NA1',
      rank: 21, // Diamond 3
      preferredServer: 'US West',
    },
  })

  console.log('Created Users:', { user1: user1.email, user2: user2.email })

  // Ensure Jett has a team
  const existingTeam = await prisma.team.findUnique({ where: { name: 'Wind Walkers' } })
  if (!existingTeam) {
    const team = await prisma.team.create({
      data: {
        name: 'Wind Walkers',
        captainId: user1.id,
        server: 'US West',
        members: {
          create: [
            { userId: user1.id },
            { userId: user2.id },
          ],
        },
      },
    })
    console.log('Created Team:', team.name)
  }

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
