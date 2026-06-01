import { FastifyPluginAsync } from 'fastify';

const relatoriosRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/dashboard', async (request, reply) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const ordersToday = await fastify.prisma.order.count({
      where: { createdAt: { gte: today, lt: tomorrow }, status: { not: 'cancelled' } },
    });

    const revenueToday = await fastify.prisma.order.aggregate({
      where: { createdAt: { gte: today, lt: tomorrow }, paymentStatus: 'paid' },
      _sum: { total: true },
    });

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newClientsThisWeek = await fastify.prisma.client.count({ where: { createdAt: { gte: weekAgo } } });

    const avgTicket = await fastify.prisma.order.aggregate({
      where: { paymentStatus: 'paid' },
      _avg: { total: true },
    });

    const lastOrders = await fastify.prisma.order.findMany({
      where: { status: { not: 'cancelled' } },
      include: { client: true, barber: { include: { user: true } }, items: { where: { itemType: 'service' } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      const count = await fastify.prisma.order.count({ where: { createdAt: { gte: dayStart, lt: dayEnd } } });
      last7Days.push({ date: dayStart.toISOString().split('T')[0], count });
    }

    return reply.send({
      stats: { ordersToday, revenueToday: revenueToday._sum.total || 0, newClientsThisWeek, avgTicket: avgTicket._avg.total || 0 },
      lastOrders,
      last7Days,
    });
  });

  fastify.get('/', async (request, reply) => {
    const query = request.query as { startDate?: string; endDate?: string; barberId?: string };
    const where: any = {};

    if (query.startDate && query.endDate) {
      where.createdAt = { gte: new Date(query.startDate), lte: new Date(query.endDate) };
    }

    if (query.barberId) where.barberId = query.barberId;

    const topServices = await fastify.prisma.orderItem.groupBy({
      by: ['name'],
      where: { itemType: 'service', order: where },
      _count: true,
      orderBy: { _count: { name: 'desc' } },
      take: 5,
    });

    const paymentMethods = await fastify.prisma.order.groupBy({
      by: ['paymentMethod'],
      where: { ...where, paymentStatus: 'paid' },
      _count: true,
      _sum: { total: true },
    });

    const totals = await fastify.prisma.order.aggregate({
      where: { ...where, paymentStatus: 'paid' },
      _sum: { total: true },
      _count: true,
      _avg: { total: true },
    });

    return reply.send({
      topServices,
      paymentMethods,
      totals: { totalRevenue: totals._sum.total || 0, totalOrders: totals._count, avgOrder: totals._avg.total || 0 },
    });
  });
};

export default relatoriosRoutes;