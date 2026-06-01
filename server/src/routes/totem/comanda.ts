import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const createOrderSchema = z.object({
  clientId: z.string(),
  appointmentId: z.string().optional(),
  serviceId: z.string(),
  cortesiaItems: z.array(z.object({ productId: z.string(), quantity: z.number().int().positive() })).optional(),
  wantsAlcohol: z.boolean().optional(),
});

const comandaRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/comanda', async (request, reply) => {
    try {
      const data = createOrderSchema.parse(request.body);
      const service = await fastify.prisma.service.findUnique({ where: { id: data.serviceId } });
      if (!service) return reply.status(404).send({ error: 'Serviço não encontrado' });

      const items: any[] = [{
        itemType: 'service', itemId: service.id, name: service.name,
        price: service.price, quantity: 1, isCourtesy: false,
      }];

      if (data.cortesiaItems) {
        for (const cortesia of data.cortesiaItems) {
          const product = await fastify.prisma.product.findUnique({ where: { id: cortesia.productId } });
          if (product) {
            items.push({ itemType: 'product', itemId: product.id, name: product.name, price: 0, quantity: cortesia.quantity, isCourtesy: true });
          }
        }
      }

      const order = await fastify.prisma.order.create({
        data: {
          clientId: data.clientId, total: service.price, status: 'open', paymentStatus: 'pending',
          items: { create: items },
        },
        include: { client: true, items: true, appointment: { include: { service: true, barber: { include: { user: true } } } },
      });

      if (data.appointmentId) {
        await fastify.prisma.appointment.update({ where: { id: data.appointmentId }, data: { status: 'in_service' } });
      }

      (fastify as any).broadcast?.('nova-comanda', { orderId: order.id, clientName: order.client.name, serviceName: service.name, total: order.total });

      return reply.status(201).send({ order });
    } catch (err) {
      if (err instanceof z.ZodError) return reply.status(400).send({ error: 'Dados inválidos', details: err.errors });
      throw err;
    }
  });

  fastify.get('/comanda/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const order = await fastify.prisma.order.findUnique({
      where: { id },
      include: { client: true, barber: { include: { user: true } }, items: true, appointment: { include: { service: true, barber: { include: { user: true } } } },
    });
    if (!order) return reply.status(404).send({ error: 'Comanda não encontrada' });
    return reply.send({ order });
  });

  fastify.patch('/comanda/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as { status?: string; barberId?: string };

    const order = await fastify.prisma.order.findUnique({ where: { id } });
    if (!order) return reply.status(404).send({ error: 'Comanda não encontrada' });

    const updateData: any = {};
    if (body.status) {
      updateData.status = body.status;
      if (body.status === 'finished') updateData.finishedAt = new Date();
    }
    if (body.barberId) updateData.barberId = body.barberId;

    const updated = await fastify.prisma.order.update({
      where: { id },
      data: updateData,
      include: { client: true, barber: { include: { user: true } }, items: true, appointment: { include: { service: true, barber: { include: { user: true } } } },
    });

    if (body.status) {
      if (body.status === 'in_service') (fastify as any).broadcast?.('atendimento-iniciado', { orderId: id, barberId: body.barberId });
      else if (body.status === 'finished') (fastify as any).broadcast?.('atendimento-finalizado', { orderId: id });
    }

    return reply.send({ order: updated });
  });
};

export default comandaRoutes;