// Mock: Trinks API - Sistema de agendamentos
// Simula a integração com o App Trinks para sincronização de agendamentos

export interface TrinksAppointment {
  id: string;
  clientName: string;
  clientCPF: string;
  clientPhone: string;
  serviceName: string;
  barberName: string;
  scheduledAt: string;
}

export interface TrinksSyncResult {
  success: boolean;
  count: number;
  appointments: TrinksAppointment[];
  message: string;
}

// Generate fake appointments from Trinks
function generateTrinksAppointments(): TrinksAppointment[] {
  const services = ['Corte Masculino', 'Barba Completa', 'Corte + Barba', 'Sobrancelha', 'Pezinho'];
  const barbers = ['João Silva', 'Pedro Santos'];
  
  // Generate 2-4 random appointments
  const count = 2 + Math.floor(Math.random() * 3);
  const appointments: TrinksAppointment[] = [];
  
  const today = new Date();
  
  for (let i = 0; i < count; i++) {
    const hour = 9 + Math.floor(Math.random() * 8); // 9am to 5pm
    const minute = [0, 30][Math.floor(Math.random() * 2)];
    
    const scheduledAt = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, minute);
    
    appointments.push({
      id: `trinks-${Date.now()}-${i}`,
      clientName: `Cliente Trinks ${i + 1}`,
      clientCPF: `${String(100 + i).padStart(9, '0')}${String(Math.floor(Math.random() * 100)).padStart(2, '0')}`,
      clientPhone: `119${String(8000000 + Math.floor(Math.random() * 2000000)).slice(-7)}`,
      serviceName: services[Math.floor(Math.random() * services.length)],
      barberName: barbers[Math.floor(Math.random() * barbers.length)],
      scheduledAt: scheduledAt.toISOString(),
    });
  }
  
  return appointments.sort((a, b) => 
    new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );
}

export async function syncFromTrinks(): Promise<TrinksSyncResult> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));
  
  const appointments = generateTrinksAppointments();
  
  console.log(`[Trinks API] Synced ${appointments.length} appointments`);
  appointments.forEach((apt) => {
    console.log(`  - ${apt.clientName}: ${apt.serviceName} at ${new Date(apt.scheduledAt).toLocaleTimeString('pt-BR')}`);
  });
  
  return {
    success: true,
    count: appointments.length,
    appointments,
    message: `Sincronizados ${appointments.length} agendamentos do Trinks`,
  };
}

export async function getAppointmentStatus(appointmentId: string): Promise<{
  id: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
}> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  return {
    id: appointmentId,
    status: 'confirmed',
    notes: 'Cliente confirmado via WhatsApp',
  };
}