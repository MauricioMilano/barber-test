import { FastifyPluginAsync, FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';

const prismaPluginAsync: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });

  await prisma.$connect();
  console.log('📦 Prisma connected to database');

  // Add prisma to fastify instance using decorate
  fastify.decorate('prisma', prisma);

  fastify.addHook('onClose', async () => {
    await prisma.$disconnect();
    console.log('📦 Prisma disconnected');
  });
};

const prismaPlugin = fp(prismaPluginAsync, {
  name: 'prisma-plugin'
});

export default prismaPlugin;