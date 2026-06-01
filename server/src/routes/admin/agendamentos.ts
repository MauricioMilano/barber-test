import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const createAppointmentSchema = z.object({
  clientId: z.string(),
  barberId: z.string(),
  serviceId: z.string(),
  scheduledAt: z.string().datetime(),
});

const updateAppointmentSchema = z.object({
  status: z.enum(['scheduled', 'in_service', 'completed', 'cancelled', 'no_show']).optional(),
  barberId: z.string().optional(),
  serviceId: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
});

const agendamentosRoutes: FastifyPluginAsync = async (fastify) => {
  // Get all appointments
  fastify.get('/', async (request, reply) => {
    const query = request.query as { date?: string; barberId?: string; status?: string };
    
    const where: any = {};
    
    if (query.date) {
      const startOfDay = new Date(query.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(query.date);
      endOfDay.setHours(23, 59, 59, 999);
      where.scheduledAt = { gte: startOfDay, lte: endOfDay };
    }

    if (query.barberId) {
      where.barberId = query.barberId;
    }

    if (query.status) {
      where.status = query.status;
    }

    const agendamentos = await fastify.prisma.appointment.findMany({
      where,
      include: {
        client: true,
        barber: { include: { user: true } },
        service: true,
        order: true,
      },
      orderBy: { scheduledAt: 'asc' },
    });

    return reply.send({ agendamentos });
  });

  // Get appointments for today
  fastify.get('/today', async (request, reply) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const agendamentos = await fastify.prisma.appointment.findMany({
      where: {
        scheduledAt: { gte: today, lt: tomorrow },
      },
      include: {
        client: true,
        barber: { include: { user: true } },
        service: true,
        order: true,
      },
      orderBy: { scheduledAt: 'asc' },
    });

    return reply.send({ agendamentos });
  });

  // Create appointment
  fastify.post('/', async (request, reply) => {
    try {
      const data = createAppointmentSchema.parse(request.body);

      const agendamento = await fastify.prisma.appointment.create({
        data: {
          clientId: data.clientId,
          barberId: data.barberId,
          serviceId: data.serviceId,
          scheduledAt: new Date(data.scheduledAt),
          status: 'scheduled',
          source: 'manual',
        },
        include: {
          client: true,
          barber: { include: { user: true } },
          service: true,
        },
      });

      return reply.status(201).send({ agendamento });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Dados inválidos', details: err.errors });
      }
      throw err;
    }
  });

  // Update appointment
  fastify.put('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const data = updateAppointmentSchema.parse(request.body);

      const agendamento = await fastify.prisma.appointment.update({
        where: { id },
        data: {
          ...data,
          scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
        },
        include: {
          client: true,
          barber: { include: { user: true } },
          service: true,
        },
      });

      return reply.send({ agendamento });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Dados inválidos', details: err.errors });
      }
      const prismaErr = err as any;
      if (prismaErr.code === 'P2025') {
        return reply.status(404).send({ error: 'Agendamento não encontrado' });
      }
      throw err;
    }
  });

  // Delete appointment
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await fastify.prisma.appointment.delete({ where: { id } });
      return reply.status(204).send();
    } catch (err) {
      const prismaErr = err as any;
      if (prismaErr.code === 'P2025') {
        return reply.status(404).send({ error: 'Agendamento não encontrado' });
      }
      throw err;
    }
  });
};

export default agendamentosRoutes;