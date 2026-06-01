import { FastifyPluginAsync } from 'fastify';

const pesquisasRoutes: FastifyPluginAsync = async (fastify) => {
  // Get all surveys
  fastify.get('/', async (request, reply) => {
    const query = request.query as { status?: string };
    
    const where: any = {};
    
    if (query.status === 'responded') {
      where.respondedAt = { not: null };
    } else if (query.status === 'pending') {
      where.respondedAt = null;
    }

    const pesquisas = await fastify.prisma.survey.findMany({
      where,
      include: {
        order: {
          include: {
            client: true,
            items: { where: { itemType: 'service' } },
          },
        },
      },
      orderBy: { sentAt: 'desc' },
    });

    return reply.send({ pesquisas });
  });

  // Get survey statistics
  fastify.get('/stats', async (request, reply) => {
    const total = await fastify.prisma.survey.count();
    const responded = await fastify.prisma.survey.count({
      where: { respondedAt: { not: null } },
    });
    
    const avgRating = await fastify.prisma.survey.aggregate({
      where: { rating: { not: null } },
      _avg: { rating: true },
    });

    const byRating = await fastify.prisma.survey.groupBy({
      by: ['rating'],
      _count: true,
      where: { rating: { not: null } },
    });

    return reply.send({
      total,
      responded,
      pending: total - responded,
      avgRating: avgRating._avg.rating || 0,
      byRating,
    });
  });
};

export default pesquisasRoutes;