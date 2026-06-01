import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { comparePassword, generateToken } from '../lib/jwt.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const loginResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
    role: z.string(),
  }),
});

const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Login
  fastify.post('/login', async (request, reply) => {
    try {
      const body = loginSchema.parse(request.body);
      
      const user = await fastify.prisma.user.findUnique({
        where: { email: body.email },
      });
      
      if (!user || !user.active) {
        return reply.status(401).send({ error: 'Credenciais inválidas' });
      }
      
      const validPassword = await comparePassword(body.password, user.password);
      if (!validPassword) {
        return reply.status(401).send({ error: 'Credenciais inválidas' });
      }
      
      const token = generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });
      
      return reply.send({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Dados inválidos', details: err.errors });
      }
      throw err;
    }
  });

  // Get current user
  fastify.get('/me', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const user = await fastify.prisma.user.findUnique({
      where: { id: request.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
      },
    });
    
    if (!user) {
      return reply.status(404).send({ error: 'Usuário não encontrado' });
    }
    
    return reply.send({ user });
  });
};

export default authRoutes;