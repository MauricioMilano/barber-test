import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const createProductSchema = z.object({
  categoryId: z.string(),
  name: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().min(0).optional(),
});

const updateProductSchema = createProductSchema.partial();

const productsRoutes: FastifyPluginAsync = async (fastify) => {
  // Get all products
  fastify.get('/', async (request, reply) => {
    const products = await fastify.prisma.product.findMany({
      include: { category: true },
      orderBy: { name: 'asc' },
    });
    return reply.send({ products });
  });

  // Get products by category
  fastify.get('/category/:categoryId', async (request, reply) => {
    const { categoryId } = request.params as { categoryId: string };
    const products = await fastify.prisma.product.findMany({
      where: { categoryId, active: true },
      orderBy: { name: 'asc' },
    });
    return reply.send({ products });
  });

  // Create product
  fastify.post('/', async (request, reply) => {
    try {
      const data = createProductSchema.parse(request.body);
      const product = await fastify.prisma.product.create({
        data: {
          ...data,
          active: true,
          stock: data.stock ?? 0,
        },
        include: { category: true },
      });
      return reply.status(201).send({ product });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Dados inválidos', details: err.errors });
      }
      throw err;
    }
  });

  // Update product
  fastify.put('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const data = updateProductSchema.parse(request.body);
      const product = await fastify.prisma.product.update({
        where: { id },
        data,
        include: { category: true },
      });
      return reply.send({ product });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Dados inválidos', details: err.errors });
      }
      const prismaErr = err as any;
      if (prismaErr.code === 'P2025') {
        return reply.status(404).send({ error: 'Produto não encontrado' });
      }
      throw err;
    }
  });

  // Toggle product active
  fastify.patch('/:id/toggle', async (request, reply) => {
    const { id } = request.params as { id: string };
    const product = await fastify.prisma.product.findUnique({ where: { id } });
    if (!product) {
      return reply.status(404).send({ error: 'Produto não encontrado' });
    }
    const updated = await fastify.prisma.product.update({
      where: { id },
      data: { active: !product.active },
    });
    return reply.send({ product: updated });
  });

  // Delete product
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await fastify.prisma.product.delete({ where: { id } });
      return reply.status(204).send();
    } catch (err) {
      const prismaErr = err as any;
      if (prismaErr.code === 'P2025') {
        return reply.status(404).send({ error: 'Produto não encontrado' });
      }
      throw err;
    }
  });
};

export default productsRoutes;