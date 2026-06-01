// Format CPF: 11144477735 -> 111.444.777-35
export function formatCPF(cpf: string): string {
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return cpf;
  
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Format phone: 11999887766 -> (11) 99988-7766
export function formatPhone(phone: string): string {
  const clean = phone.replace(/\D/g, '');
  if (clean.length !== 11) return phone;
  
  return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

// Format currency: 45.00 -> R$ 45,00
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

// Format date: 2024-01-15 -> 15/01/2024
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR');
}

// Format time: 14:30 -> 14:30
export function formatTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// Format datetime
export function formatDateTime(date: string | Date): string {
  return `${formatDate(date)} às ${formatTime(date)}`;
}

// Parse time string to Date
export function parseTime(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

// Get current time formatted
export function getCurrentTime(): string {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// Get current date formatted
export function getCurrentDate(): string {
  return new Date().toLocaleDateString('pt-BR');
}

// Days of week in Portuguese
export const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
export const fullDaysOfWeek = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
export const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
export const shortMonths = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

// Calendar helper - compatibility with shadcn Calendar component
export type Calendar = any;