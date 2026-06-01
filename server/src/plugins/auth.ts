import { FastifyPluginAsync } from 'fastify';
import jwt from '@fastify/jwt';

declare module 'fastify' {
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

const authPlugin: FastifyPluginAsync = async (fastify) => {
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

export default authPlugin;