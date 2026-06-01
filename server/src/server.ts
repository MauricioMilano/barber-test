import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import prismaPlugin from './plugins/prisma.js';
import authDecorate from './plugins/auth.js';
import ssePlugin from './plugins/sse.js';
import authRoutes from './routes/auth.js';
import adminServices from './routes/admin/services.js';
import adminProducts from './routes/admin/products.js';
import adminCategories from './routes/admin/categories.js';
import adminCortesias from './routes/admin/cortesias.js';
import adminBarbeiros from './routes/admin/barbeiros.js';
import adminClientes from './routes/admin/clientes.js';
import adminAgendamentos from './routes/admin/agendamentos.js';
import adminRelatorios from './routes/admin/relatorios.js';
import adminPesquisas from './routes/admin/pesquisas.js';
import adminTrinksSync from './routes/admin/trinks-sync.js';
import adminDashboard from './routes/admin/dashboard.js';
import totemCliente from './routes/totem/cliente.js';
import totemComanda from './routes/totem/comanda.js';
import totemPagamento from './routes/totem/pagamento.js';
import pesquisa from './routes/pesquisa.js';
import sse from './routes/sse.js';

const fastify = Fastify({
  logger: true,
});

async function start() {
  await fastify.register(cors, { origin: true, credentials: true });
  await fastify.register(jwt, { secret: process.env.JWT_SECRET || 'comanda-digital-secret-key-2024' });
  await fastify.register(prismaPlugin);
  await fastify.register(authDecorate);
  await fastify.register(ssePlugin);

  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(adminDashboard, { prefix: '/api/admin/dashboard' });
  await fastify.register(adminServices, { prefix: '/api/admin/services' });
  await fastify.register(adminProducts, { prefix: '/api/admin/products' });
  await fastify.register(adminCategories, { prefix: '/api/admin/categories' });
  await fastify.register(adminCortesias, { prefix: '/api/admin/cortesias' });
  await fastify.register(adminBarbeiros, { prefix: '/api/admin/barbeiros' });
  await fastify.register(adminClientes, { prefix: '/api/admin/clientes' });
  await fastify.register(adminAgendamentos, { prefix: '/api/admin/agendamentos' });
  await fastify.register(adminRelatorios, { prefix: '/api/admin/relatorios' });
  await fastify.register(adminPesquisas, { prefix: '/api/admin/pesquisas' });
  await fastify.register(adminTrinksSync, { prefix: '/api/admin/trinks' });
  await fastify.register(totemCliente, { prefix: '/api/totem' });
  await fastify.register(totemComanda, { prefix: '/api/totem' });
  await fastify.register(totemPagamento, { prefix: '/api/totem' });
  await fastify.register(pesquisa, { prefix: '/api/pesquisa' });
  await fastify.register(sse, { prefix: '/api/sse' });

  fastify.get('/api/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  const port = parseInt(process.env.PORT || '3001');
  await fastify.listen({ port, host: '0.0.0.0' });
  console.log(`🚀 Server running on http://localhost:${port}`);
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});