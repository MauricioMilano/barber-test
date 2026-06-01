// Mock: Receita Federal - Validação de CPF
// Simula a API da Receita Federal para validação de CPF e cálculo de idade

export interface ReceitaResponse {
  valid: boolean;
  cpf: string;
  name: string;
  birthDate: string;
  age: number;
  error?: string;
}

// Validação de CPF (algoritmo de dígitos verificadores)
function validateCPFDigits(cpf: string): boolean {
  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;

  // Validate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf[i]) * (10 - i);
  }
  let digit = (sum * 10) % 11;
  if (digit > 9) digit = 0;
  if (digit !== parseInt(cpf[9])) return false;

  // Validate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf[i]) * (11 - i);
  }
  digit = (sum * 10) % 11;
  if (digit > 9) digit = 0;
  if (digit !== parseInt(cpf[10])) return false;

  return true;
}

// Extract birth date from CPF (digits 3-10 represent birth date)
// This is a simplified mock - real CPF doesn't encode birth date this way
function extractBirthDateFromCPF(cpf: string): Date {
  // For demo purposes, we'll use some logic to generate birth dates
  // In reality, this would come from external API
  const lastTwoDigits = parseInt(cpf.slice(-2));
  const baseYear = 1980 + (lastTwoDigits % 20);
  const month = 1 + (lastTwoDigits % 12);
  const day = 1 + (lastTwoDigits % 28);
  return new Date(baseYear, month - 1, day);
}

// Simulated database of CPF -> Name mappings
const mockDatabase: Record<string, string> = {
  '11144477735': 'Carlos Eduardo Lima',
  '22255588899': 'Rafael Almeida Costa',
  '33366699911': 'Lucas Ferreira Souza',
  '44477788800': 'Bruno Oliveira Santos',
  '55588899900': 'Thiago Rodrigues Lima',
  '66699900011': 'Felipe Martins Cruz',
  '77700011122': 'Gustavo Pereira Rocha',
  '88811122233': 'Diego Sousa Almeida',
};

export async function validateCPF(cpf: string): Promise<ReceitaResponse> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 400));

  // Remove non-digits
  const cleanCPF = cpf.replace(/\D/g, '');

  // Validate format
  if (cleanCPF.length !== 11) {
    return { valid: false, cpf, name: '', birthDate: '', age: 0, error: 'CPF must have 11 digits' };
  }

  // Validate digits
  if (!validateCPFDigits(cleanCPF)) {
    return { valid: false, cpf, name: '', birthDate: '', age: 0, error: 'Invalid CPF check digits' };
  }

  // Get name from mock database or generate one
  const name = mockDatabase[cleanCPF] || `Cliente CPF ${cleanCPF.slice(0, 3)}.***.***-${cleanCPF.slice(-2)}`;
  
  // Calculate age based on birth date in database or derived from CPF
  let birthDate: Date;
  if (cleanCPF in mockDatabase) {
    // Use pre-defined dates for seeded clients
    const clientDates: Record<string, Date> = {
      '11144477735': new Date('1995-03-15'),
      '22255588899': new Date('1988-07-22'),
      '33366699911': new Date('2000-11-08'),
      '44477788800': new Date('1992-05-30'),
      '55588899900': new Date('2005-09-12'),
      '66699900011': new Date('1998-01-25'),
      '77700011122': new Date('1990-12-03'),
      '88811122233': new Date('1985-06-18'),
    };
    birthDate = clientDates[cleanCPF] || extractBirthDateFromCPF(cleanCPF);
  } else {
    birthDate = extractBirthDateFromCPF(cleanCPF);
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  console.log(`[Receita Federal] Validated CPF ${cleanCPF}: ${name}, Age: ${age}`);

  return {
    valid: true,
    cpf: cleanCPF,
    name,
    birthDate: birthDate.toISOString(),
    age,
  };
}

export async function validateAge(cpf: string): Promise<{ isAdult: boolean; age: number }> {
  const response = await validateCPF(cpf);
  return {
    isAdult: response.age >= 18,
    age: response.age,
  };
}