import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const createServiceSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  price: z.number().positive(),
  duration: z.number().int().positive(),
});

const updateServiceSchema = createServiceSchema.partial();

const servicesRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request, reply) => {
    const services = await fastify.prisma.service.findMany({ orderBy: { name: 'asc' } });
    return reply.send({ services });
  });

  fastify.post('/', async (request, reply) => {
    try {
      const data = createServiceSchema.parse(request.body);
      const service = await fastify.prisma.service.create({
        data: { name: data.name, category: data.category, price: data.price, duration: data.duration, active: true },
      });
      return reply.status(201).send({ service });
    } catch (err) {
      if (err instanceof z.ZodError) return reply.status(400).send({ error: 'Dados inválidos', details: err.errors });
      throw err;
    }
  });

  fastify.put('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const data = updateServiceSchema.parse(request.body);
      const service = await fastify.prisma.service.update({ where: { id }, data });
      return reply.send({ service });
    } catch (err) {
      if (err instanceof z.ZodError) return reply.status(400).send({ error: 'Dados inválidos', details: err.errors });
      const prismaErr = err as any;
      if (prismaErr.code === 'P2025') return reply.status(404).send({ error: 'Serviço não encontrado' });
      throw err;
    }
  });

  fastify.patch('/:id/toggle', async (request, reply) => {
    const { id } = request.params as { id: string };
    const service = await fastify.prisma.service.findUnique({ where: { id } });
    if (!service) return reply.status(404).send({ error: 'Serviço não encontrado' });
    const updated = await fastify.prisma.service.update({ where: { id }, data: { active: !service.active } });
    return reply.send({ service: updated });
  });

  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await fastify.prisma.service.delete({ where: { id } });
      return reply.status(204).send();
    } catch (err) {
      const prismaErr = err as any;
      if (prismaErr.code === 'P2025') return reply.status(404).send({ error: 'Serviço não encontrado' });
      throw err;
    }
  });
};

export default servicesRoutes;