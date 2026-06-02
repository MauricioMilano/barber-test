import { FastifyPluginAsync, FastifyInstance } from 'fastify';
import { z } from 'zod';
import { processPayment, generatePIXQrCode } from '../../lib/mock-stone.js';
import { sendSurvey } from '../../lib/mock-whatsapp.js';

const pagamentoSchema = z.object({
  orderId: z.string(),
  method: z.enum(['credit', 'debit', 'pix', 'cash']),
});

const pagamentoRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.post('/pagamento', async (request, reply) => {
    try {
      const data = pagamentoSchema.parse(request.body);
      const prisma = (fastify as any).prisma;

      const order = await prisma.order.findUnique({
        where: { id: data.orderId },
        include: { client: true, items: true },
      });

      if (!order) return reply.status(404).send({ error: 'Comanda não encontrada' });
      if (order.paymentStatus === 'paid') return reply.status(400).send({ error: 'Pagamento já realizado' });

      const paymentResult = await processPayment({ orderId: data.orderId, amount: order.total, method: data.method });

      const updatedOrder = await prisma.order.update({
        where: { id: data.orderId },
        data: { paymentMethod: data.method, paymentStatus: paymentResult.success ? 'paid' : 'pending' },
        include: {
          client: true,
          items: true,
          appointment: { include: { service: true, barber: { include: { user: true } } }
        },
      });

      if (paymentResult.success) {
        (fastify as any).broadcast?.('comanda-paga', { orderId: data.orderId, paymentMethod: data.method });
        try {
          await sendSurvey(data.orderId, updatedOrder.client.name, updatedOrder.client.phone || undefined, updatedOrder.client.email || undefined);
          await prisma.survey.create({
            data: {
              orderId: data.orderId,
              token: `survey_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
              sentVia: updatedOrder.client.phone ? 'whatsapp' : 'email',
            },
          });
        } catch (surveyErr) { console.error('Error sending survey:', surveyErr); }
      }

      return reply.send({ success: paymentResult.success, payment: paymentResult, order: updatedOrder });
    } catch (err) {
      if (err instanceof z.ZodError) return reply.status(400).send({ error: 'Dados inválidos', details: err.errors });
      throw err;
    }
  });

  fastify.post('/pagamento/pix/generate', async (request, reply) => {
    const body = request.body as { orderId: string };
    const prisma = (fastify as any).prisma;

    const order = await prisma.order.findUnique({ where: { id: body.orderId } });
    if (!order) return reply.status(404).send({ error: 'Comanda não encontrada' });

    const pixData = generatePIXQrCode(body.orderId, order.total);
    return reply.send({ qrCodeData: pixData.qrCodeData, qrCodeImage: pixData.qrCodeImage, expiration: pixData.expiration, amount: order.total });
  });
};

export default pagamentoRoutes;