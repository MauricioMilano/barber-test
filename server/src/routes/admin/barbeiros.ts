import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { hashPassword } from '../../lib/jwt.js';

const createBarbeiroSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  photoUrl: z.string().url().optional(),
});

const updateBarbeiroSchema = z.object({
  name: z.string().min(1).optional(),
  photoUrl: z.string().url().optional().nullable(),
  active: z.boolean().optional(),
});

const barbeirosRoutes: FastifyPluginAsync = async (fastify) => {
  // Get all barbers
  fastify.get('/', async (request, reply) => {
    const barbers = await fastify.prisma.barber.findMany({
      include: {
        user: {
          select: { id: true, email: true, name: true, role: true },
        },
        _count: {
          select: {
            appointments: { where: { status: 'completed' } },
            orders: { where: { status: 'finished' } },
          },
        },
      },
      orderBy: { user: { name: 'asc' } },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's appointments count for each barber
    const barbersWithTodayCount = await Promise.all(
      barbers.map(async (barber) => {
        const todayAppointments = await fastify.prisma.appointment.count({
          where: {
            barberId: barber.id,
            scheduledAt: { gte: today, lt: tomorrow },
          },
        });
        return {
          ...barber,
          todayAppointments,
          todayOrders: todayAppointments,
        };
      })
    );

    return reply.send({ barbeiros: barbersWithTodayCount });
  });

  // Create barber
  fastify.post('/', async (request, reply) => {
    try {
      const data = createBarbeiroSchema.parse(request.body);

      // Check if email already exists
      const existingUser = await fastify.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        return reply.status(400).send({ error: 'Email já cadastrado' });
      }

      const hashedPassword = await hashPassword(data.password);

      const user = await fastify.prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
          role: 'barber',
        },
      });

      const barber = await fastify.prisma.barber.create({
        data: {
          userId: user.id,
          photoUrl: data.photoUrl,
        },
        include: {
          user: {
            select: { id: true, email: true, name: true, role: true },
          },
        },
      });

      return reply.status(201).send({ barbeiro: barber });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Dados inválidos', details: err.errors });
      }
      throw err;
    }
  });

  // Update barber
  fastify.put('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const data = updateBarbeiroSchema.parse(request.body);

      const barber = await fastify.prisma.barber.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!barber) {
        return reply.status(404).send({ error: 'Barbeiro não encontrado' });
      }

      // Update user data if provided
      if (data.name) {
        await fastify.prisma.user.update({
          where: { id: barber.userId },
          data: { name: data.name },
        });
      }

      // Update barber data
      const updated = await fastify.prisma.barber.update({
        where: { id },
        data: {
          photoUrl: data.photoUrl,
          active: data.active,
        },
        include: {
          user: {
            select: { id: true, email: true, name: true, role: true },
          },
        },
      });

      return reply.send({ barbeiro: updated });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Dados inválidos', details: err.errors });
      }
      const prismaErr = err as any;
      if (prismaErr.code === 'P2025') {
        return reply.status(404).send({ error: 'Barbeiro não encontrado' });
      }
      throw err;
    }
  });

  // Delete barber
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const barber = await fastify.prisma.barber.findUnique({
      where: { id },
    });

    if (!barber) {
      return reply.status(404).send({ error: 'Barbeiro não encontrado' });
    }

    // Deactivate instead of delete to preserve history
    await fastify.prisma.barber.update({
      where: { id },
      data: { active: false },
    });

    await fastify.prisma.user.update({
      where: { id: barber.userId },
      data: { active: false },
    });

    return reply.status(204).send();
  });
};

export default barbeirosRoutes;