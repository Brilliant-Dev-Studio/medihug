import { PrismaClient } from '@/app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

function createPrismaClient() {
  // Neon's pooled (PgBouncer) endpoint reaps idle connections server-side; keep the client
  // pool small and recycle connections proactively so we don't hand out ones Neon already
  // closed — otherwise queries intermittently fail with "Connection terminated unexpectedly".
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });
  return new PrismaClient({ adapter });
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
