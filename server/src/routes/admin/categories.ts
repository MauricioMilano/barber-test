import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const createCategorySchema = z.object({
  name: z.string().min(1),
  containsAlcohol: z.boolean().optional(),
});

const updateCategorySchema = createCategorySchema.partial();

const categoriesRoutes: FastifyPluginAsync = async (fastify) => {
  // Get all categories
  fastify.get('/', async (request, reply) => {
    const categories = await fastify.prisma.productCategory.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
    return reply.send({ categories });
  });

  // Create category
  fastify.post('/', async (request, reply) => {
    try {
      const data = createCategorySchema.parse(request.body);
      const category = await fastify.prisma.productCategory.create({
        data: {
          name: data.name,
          containsAlcohol: data.containsAlcohol ?? false,
        },
      });
      return reply.status(201).send({ category });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Dados inválidos', details: err.errors });
      }
      throw err;
    }
  });

  // Update category
  fastify.put('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const data = updateCategorySchema.parse(request.body);
      const category = await fastify.prisma.productCategory.update({
        where: { id },
        data,
      });
      return reply.send({ category });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Dados inválidos', details: err.errors });
      }
      const prismaErr = err as any;
      if (prismaErr.code === 'P2025') {
        return reply.status(404).send({ error: 'Categoria não encontrada' });
      }
      throw err;
    }
  });

  // Delete category
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await fastify.prisma.productCategory.delete({ where: { id } });
      return reply.status(204).send();
    } catch (err) {
      const prismaErr = err as any;
      if (prismaErr.code === 'P2025') {
        return reply.status(404).send({ error: 'Categoria não encontrada' });
      }
      if (prismaErr.code === 'P2003') {
        return reply.status(400).send({ error: 'Categoria possui produtos associados' });
      }
      throw err;
    }
  });
};

export default categoriesRoutes;