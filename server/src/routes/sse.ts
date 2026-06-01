import { FastifyPluginAsync } from 'fastify';
import { randomUUID } from 'crypto';

const sseClients = new Map<string, any>();

const sseRoutes: FastifyPluginAsync = async (fastify) => {
  // SSE stream endpoint
  fastify.get('/stream', async (request, reply) => {
    const query = request.query as { role?: string };
    const role = query.role || 'barber';

    const clientId = randomUUID();
    
    // Set headers for SSE
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    // Register client
    sseClients.set(clientId, {
      id: clientId,
      role,
      response: reply,
    });

    console.log(`[SSE] Client connected: ${clientId} (role: ${role}). Total: ${sseClients.size}`);

    // Send initial connection event
    reply.raw.write(`event: connected\ndata: ${JSON.stringify({ clientId, role })}\n\n`);

    // Keep connection alive with heartbeat
    const heartbeat = setInterval(() => {
      try {
        reply.raw.write(`: heartbeat\n\n`);
      } catch (err) {
        clearInterval(heartbeat);
      }
    }, 30000);

    // Handle client disconnect
    request.raw.on('close', () => {
      clearInterval(heartbeat);
      sseClients.delete(clientId);
      console.log(`[SSE] Client disconnected: ${clientId}. Total: ${sseClients.size}`);
    });
  });

  // Broadcast event to all clients (for testing)
  fastify.post('/broadcast', async (request, reply) => {
    const body = request.body as { event: string; data: any };
    
    const message = `event: ${body.event}\ndata: ${JSON.stringify(body.data)}\n\n`;
    
    sseClients.forEach((client) => {
      try {
        client.response.raw.write(message);
      } catch (err) {
        sseClients.delete(client.id);
      }
    });

    return reply.send({ 
      success: true, 
      clients: sseClients.size,
      event: body.event 
    });
  });
};

// Export for use in other routes
export function broadcastSSE(event: string, data: any, role?: string) {
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  
  sseClients.forEach((client) => {
    if (!role || client.role === role || client.role === 'admin') {
      try {
        client.response.raw.write(message);
      } catch (err) {
        sseClients.delete(client.id);
      }
    }
  });
}

export default sseRoutes;