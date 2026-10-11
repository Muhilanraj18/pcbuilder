/**
 * Prisma client singleton for Next.js
 *
 * In development, Next.js hot-reload creates new module instances which would
 * exhaust the DB connection pool. We cache the client on `globalThis` to
 * ensure only one instance exists per process.
 */
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
