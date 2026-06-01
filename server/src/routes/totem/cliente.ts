import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { validateCPF } from '../../lib/mock-receita.js';

const clienteRoutes: FastifyPluginAsync = async (fastify) => {
  // Get client by CPF and validate
  fastify.get('/cliente/:cpf', async (request, reply) => {
    const { cpf } = request.params as { cpf: string };

    try {
      // Validate with Receita Federal
      const receitaData = await validateCPF(cpf);

      if (!receitaData.valid) {
        return reply.status(400).send({
          error: 'CPF inválido',
          details: receitaData.error,
        });
      }

      // Find client in database
      let client = await fastify.prisma.client.findUnique({
        where: { cpf },
        include: {
          appointments: {
            where: {
              status: { in: ['scheduled', 'in_service'] },
              scheduledAt: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
                lt: new Date(new Date().setHours(23, 59, 59, 999)),
              },
            },
            include: {
              service: true,
              barber: { include: { user: true } },
            },
            orderBy: { scheduledAt: 'asc' },
          },
        },
      });

      // Update client name if different
      if (client && client.name !== receitaData.name) {
        client = await fastify.prisma.client.update({
          where: { cpf },
          data: { name: receitaData.name },
          include: {
            appointments: {
              where: {
                status: { in: ['scheduled', 'in_service'] },
                scheduledAt: {
                  gte: new Date(new Date().setHours(0, 0, 0, 0)),
                  lt: new Date(new Date().setHours(23, 59, 59, 999)),
                },
              },
              include: {
                service: true,
                barber: { include: { user: true } },
              },
              orderBy: { scheduledAt: 'asc' },
            },
          },
        });
      }

      return reply.send({
        client,
        receita: {
          valid: receitaData.valid,
          name: receitaData.name,
          age: receitaData.age,
          birthDate: receitaData.birthDate,
        },
        hasAppointments: (client?.appointments?.length || 0) > 0,
      });
    } catch (err) {
      console.error('Error validating CPF:', err);
      return reply.status(500).send({ error: 'Erro ao validar CPF' });
    }
  });

  // Get cortesia rules for a service
  fastify.get('/cortesia/:serviceId', async (request, reply) => {
    const { serviceId } = request.params as { serviceId: string };

    const regras = await fastify.prisma.cortesiaRule.findMany({
      where: { serviceId },
      include: {
        category: {
          include: {
            products: { where: { active: true } },
          },
        },
      },
    });

    return reply.send({ cortesias: regras });
  });
};

export default clienteRoutes;