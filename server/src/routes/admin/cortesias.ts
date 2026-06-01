import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const createCortesiaSchema = z.object({
  serviceId: z.string(),
  categoryId: z.string(),
  quantity: z.number().int().positive().optional(),
});

const updateCortesiaSchema = createCortesiaSchema.partial();

const cortesiasRoutes: FastifyPluginAsync = async (fastify) => {
  // Get all cortesia rules
  fastify.get('/', async (request, reply) => {
    const regras = await fastify.prisma.cortesiaRule.findMany({
      include: {
        service: true,
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return reply.send({ cortesias: regras });
  });

  // Create cortesia rule
  fastify.post('/', async (request, reply) => {
    try {
      const data = createCortesiaSchema.parse(request.body);
      
      // Check if rule already exists
      const existing = await fastify.prisma.cortesiaRule.findFirst({
        where: {
          serviceId: data.serviceId,
          categoryId: data.categoryId,
        },
      });
      
      if (existing) {
        return reply.status(400).send({ error: 'Regra já existe para este serviço e categoria' });
      }
      
      const regra = await fastify.prisma.cortesiaRule.create({
        data: {
          serviceId: data.serviceId,
          categoryId: data.categoryId,
          quantity: data.quantity ?? 1,
        },
        include: {
          service: true,
          category: true,
        },
      });
      return reply.status(201).send({ cortesia: regra });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Dados inválidos', details: err.errors });
      }
      throw err;
    }
  });

  // Update cortesia rule
  fastify.put('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const data = updateCortesiaSchema.parse(request.body);
      const regra = await fastify.prisma.cortesiaRule.update({
        where: { id },
        data,
        include: {
          service: true,
          category: true,
        },
      });
      return reply.send({ cortesia: regra });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Dados inválidos', details: err.errors });
      }
      const prismaErr = err as any;
      if (prismaErr.code === 'P2025') {
        return reply.status(404).send({ error: 'Regra não encontrada' });
      }
      throw err;
    }
  });

  // Delete cortesia rule
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await fastify.prisma.cortesiaRule.delete({ where: { id } });
      return reply.status(204).send();
    } catch (err) {
      const prismaErr = err as any;
      if (prismaErr.code === 'P2025') {
        return reply.status(404).send({ error: 'Regra não encontrada' });
      }
      throw err;
    }
  });
};

export default cortesiasRoutes;