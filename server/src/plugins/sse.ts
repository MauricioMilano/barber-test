import { FastifyPluginAsync } from 'fastify';

interface SSEClient {
  id: string;
  role: string;
  response: any;
}

const clients = new Map<string, SSEClient>();

const ssePlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate('sseClients', clients);

  fastify.decorate(
    'broadcast',
    (event: string, data: any, role?: string) => {
      const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
      
      clients.forEach((client) => {
        if (!role || client.role === role || client.role === 'admin') {
          try {
            client.response.raw.write(message);
          } catch (err) {
            console.error('SSE broadcast error:', err);
          }
        }
      });
    }
  );
};

export default ssePlugin;