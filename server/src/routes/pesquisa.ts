import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const submitSurveySchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

const pesquisaRoutes: FastifyPluginAsync = async (fastify) => {
  // Get survey by token
  fastify.get('/:token', async (request, reply) => {
    const { token } = request.params as { token: string };

    const survey = await fastify.prisma.survey.findUnique({
      where: { token },
      include: {
        order: {
          include: {
            client: true,
            items: { where: { itemType: 'service' } },
          },
        },
      },
    });

    if (!survey) {
      return reply.status(404).send({ error: 'Pesquisa não encontrada ou expirada' });
    }

    return reply.send({ survey });
  });

  // Submit survey response
  fastify.post('/:token', async (request, reply) => {
    try {
      const { token } = request.params as { token: string };
      const data = submitSurveySchema.parse(request.body);

      const survey = await fastify.prisma.survey.findUnique({
        where: { token },
      });

      if (!survey) {
        return reply.status(404).send({ error: 'Pesquisa não encontrada ou expirada' });
      }

      if (survey.respondedAt) {
        return reply.status(400).send({ error: 'Pesquisa já respondida' });
      }

      // Update survey with response
      const updated = await fastify.prisma.survey.update({
        where: { token },
        data: {
          rating: data.rating,
          comment: data.comment,
          respondedAt: new Date(),
        },
      });

      return reply.send({
        success: true,
        message: 'Obrigado pela sua avaliação!',
        survey: updated,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Dados inválidos', details: err.errors });
      }
      throw err;
    }
  });
};

export default pesquisaRoutes;