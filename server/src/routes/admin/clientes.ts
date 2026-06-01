import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const createClientSchema = z.object({
  cpf: z.string().length(11),
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  birthDate: z.string().datetime().optional(),
});

const updateClientSchema = createClientSchema.partial();

const clientesRoutes: FastifyPluginAsync = async (fastify) => {
  // Get all clients
  fastify.get('/', async (request, reply) => {
    const query = request.query as { search?: string };
    
    const where = query.search
      ? {
          OR: [
            { name: { contains: query.search } },
            { cpf: { contains: query.search } },
            { phone: { contains: query.search } },
          ],
        }
      : {};

    const clientes = await fastify.prisma.client.findMany({
      where,
      include: {
        _count: {
          select: { appointments: true, orders: true },
        },
      },
      orderBy: { name: 'asc' },
      take: 100,
    });

    return reply.send({ clientes });
  });

  // Get client by CPF
  fastify.get('/cpf/:cpf', async (request, reply) => {
    const { cpf } = request.params as { cpf: string };
    
    const cliente = await fastify.prisma.client.findUnique({
      where: { cpf },
      include: {
        appointments: {
          include: { service: true, barber: { include: { user: true } } },
          orderBy: { scheduledAt: 'desc' },
          take: 10,
        },
        orders: {
          include: { items: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!cliente) {
      return reply.status(404).send({ error: 'Cliente não encontrado' });
    }

    return reply.send({ cliente });
  });

  // Create client
  fastify.post('/', async (request, reply) => {
    try {
      const data = createClientSchema.parse(request.body);

      // Check if CPF already exists
      const existing = await fastify.prisma.client.findUnique({
        where: { cpf: data.cpf },
      });

      if (existing) {
        return reply.status(400).send({ error: 'CPF já cadastrado' });
      }

      const cliente = await fastify.prisma.client.create({
        data: {
          cpf: data.cpf,
          name: data.name,
          phone: data.phone,
          email: data.email,
          birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        },
      });

      return reply.status(201).send({ cliente });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Dados inválidos', details: err.errors });
      }
      throw err;
    }
  });

  // Update client
  fastify.put('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const data = updateClientSchema.parse(request.body);

      const cliente = await fastify.prisma.client.update({
        where: { id },
        data: {
          ...data,
          birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        },
      });

      return reply.send({ cliente });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Dados inválidos', details: err.errors });
      }
      const prismaErr = err as any;
      if (prismaErr.code === 'P2025') {
        return reply.status(404).send({ error: 'Cliente não encontrado' });
      }
      throw err;
    }
  });

  // Delete client
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await fastify.prisma.client.delete({ where: { id } });
      return reply.status(204).send();
    } catch (err) {
      const prismaErr = err as any;
      if (prismaErr.code === 'P2025') {
        return reply.status(404).send({ error: 'Cliente não encontrado' });
      }
      throw err;
    }
  });
};

export default clientesRoutes;