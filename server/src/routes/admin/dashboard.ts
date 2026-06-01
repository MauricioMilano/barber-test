import { FastifyPluginAsync } from 'fastify';

const dashboardRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request, reply) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // KPIs
    const ordersToday = await fastify.prisma.order.count({
      where: {
        createdAt: { gte: today, lt: tomorrow },
        status: { not: 'cancelled' },
      },
    });

    const revenueToday = await fastify.prisma.order.aggregate({
      where: {
        createdAt: { gte: today, lt: tomorrow },
        paymentStatus: 'paid',
      },
      _sum: { total: true },
    });

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newClientsThisWeek = await fastify.prisma.client.count({
      where: { createdAt: { gte: weekAgo } },
    });

    const avgTicket = await fastify.prisma.order.aggregate({
      where: { paymentStatus: 'paid' },
      _avg: { total: true },
    });

    // Last 5 orders
    const lastOrders = await fastify.prisma.order.findMany({
      where: { status: { not: 'cancelled' } },
      include: {
        client: true,
        barber: { include: { user: true } },
        items: { where: { itemType: 'service' } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Orders by day (last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const count = await fastify.prisma.order.count({
        where: { createdAt: { gte: dayStart, lt: dayEnd } },
      });

      last7Days.push({
        date: dayStart.toISOString().split('T')[0],
        count,
      });
    }

    // Today's appointments
    const todayAppointments = await fastify.prisma.appointment.findMany({
      where: {
        scheduledAt: { gte: today, lt: tomorrow },
      },
      include: {
        client: true,
        barber: { include: { user: true } },
        service: true,
      },
      orderBy: { scheduledAt: 'asc' },
    });

    // Recent Trinks sync
    const lastTrinksSync = await fastify.prisma.trinksSyncLog.findFirst({
      orderBy: { syncedAt: 'desc' },
    });

    return reply.send({
      kpis: {
        ordersToday,
        revenueToday: revenueToday._sum.total || 0,
        newClientsThisWeek,
        avgTicket: avgTicket._avg.total || 0,
      },
      lastOrders,
      last7Days,
      todayAppointments,
      lastTrinksSync,
    });
  });
};

export default dashboardRoutes;