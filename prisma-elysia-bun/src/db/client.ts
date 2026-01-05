import { PrismaClient } from '@/db/generated/client'

const connectionString = process.env.DATABASE_URL

const isNeon =
  connectionString?.includes('neon.tech') || connectionString?.includes('.neon.') || connectionString?.includes('neon.')

let prisma: PrismaClient

if (isNeon && connectionString) {
  const { PrismaNeon } = await import('@prisma/adapter-neon')
  const adapter = new PrismaNeon({ connectionString })
  prisma = new PrismaClient({ adapter })
  console.log('Using Neon adapter for serverless database')
} else {
  const { PrismaPg } = await import('@prisma/adapter-pg')
  const adapter = new PrismaPg({ connectionString })
  prisma = new PrismaClient({ adapter })
  console.log('Using standard PrismaClient for local database')
}

export { prisma }
