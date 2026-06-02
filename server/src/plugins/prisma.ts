import { FastifyPluginAsync, FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prismaPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });

  await prisma.$connect();
  console.log('📦 Prisma connected to database');

  // Add prisma to fastify instance
  (fastify as any).prisma = prisma;

  fastify.addHook('onClose', async () => {
    await prisma.$disconnect();
    console.log('📦 Prisma disconnected');
  });
};

export default prismaPlugin;