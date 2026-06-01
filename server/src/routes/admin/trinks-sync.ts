import { FastifyPluginAsync } from 'fastify';
import { syncFromTrinks } from '../../lib/mock-trinks.js';

const trinksSyncRoutes: FastifyPluginAsync = async (fastify) => {
  // Sync appointments from Trinks
  fastify.post('/sync', async (request, reply) => {
    try {
      const result = await syncFromTrinks();

      // Log the sync
      await fastify.prisma.trinksSyncLog.create({
        data: {
          count: result.count,
          status: result.success ? 'success' : 'error',
          message: result.message,
        },
      });

      // Import appointments to database
      for (const appointment of result.appointments) {
        // Check if client exists
        let client = await fastify.prisma.client.findUnique({
          where: { cpf: appointment.clientCPF },
        });

        // Create client if not exists
        if (!client) {
          client = await fastify.prisma.client.create({
            data: {
              cpf: appointment.clientCPF,
              name: appointment.clientName,
              phone: appointment.clientPhone,
            },
          });
        }

        // Check if barber exists
        const barber = await fastify.prisma.barber.findFirst({
          where: { user: { name: appointment.barberName } },
          include: { user: true },
        });

        // Check if service exists
        let service = await fastify.prisma.service.findFirst({
          where: { name: appointment.serviceName },
        });

        if (barber && service) {
          // Check if appointment already exists (by trinks ID)
          const existing = await fastify.prisma.appointment.findFirst({
            where: { trinksId: appointment.id },
          });

          if (!existing) {
            await fastify.prisma.appointment.create({
              data: {
                clientId: client.id,
                barberId: barber.id,
                serviceId: service.id,
                scheduledAt: new Date(appointment.scheduledAt),
                status: 'scheduled',
                trinksId: appointment.id,
                source: 'trinks',
              },
            });
          }
        }
      }

      return reply.send({
        success: true,
        message: result.message,
        count: result.count,
      });
    } catch (err) {
      console.error('Trinks sync error:', err);
      
      await fastify.prisma.trinksSyncLog.create({
        data: {
          count: 0,
          status: 'error',
          message: err instanceof Error ? err.message : 'Unknown error',
        },
      });

      return reply.status(500).send({ 
        success: false, 
        message: 'Erro ao sincronizar com Trinks' 
      });
    }
  });

  // Get sync logs
  fastify.get('/logs', async (request, reply) => {
    const logs = await fastify.prisma.trinksSyncLog.findMany({
      orderBy: { syncedAt: 'desc' },
      take: 20,
    });

    return reply.send({ logs });
  });
};

export default trinksSyncRoutes;