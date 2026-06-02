import { FastifyPluginAsync, FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import { PrismaClient } from '@prisma/client';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
    authenticate: (request: any, reply: any) => Promise<void>;
  }
  interface FastifyRequest {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  }
}

const authPluginAsync: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.decorate(
    'authenticate',
    async function (request: any, reply: any) {
      try {
        const decoded = await request.jwtVerify();
        request.user = decoded;
      } catch (err) {
        reply.status(401).send({ error: 'Unauthorized' });
      }
    }
  );
};

const authPlugin = fp(authPluginAsync, {
  name: 'auth-plugin'
});

export default authPlugin;