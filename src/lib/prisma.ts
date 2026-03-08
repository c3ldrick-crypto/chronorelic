import { PrismaClient, Prisma } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

export type PrismaTx = Prisma.TransactionClient

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createPrisma(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  return new PrismaClient({ adapter } as any)
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrisma()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
