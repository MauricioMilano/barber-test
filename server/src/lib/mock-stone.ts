// Mock: Stone POS - Processamento de pagamentos
// Simula a integração com a maquininha Stone

export type PaymentMethod = 'credit' | 'debit' | 'pix' | 'cash';

export interface PaymentRequest {
  orderId: string;
  amount: number;
  method: PaymentMethod;
  cardNumber?: string; // For credit/debit (masked)
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  message: string;
  timestamp: string;
}

// Generate transaction ID
function generateTransactionId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ST${timestamp}${random}`;
}

// Process payment based on method
export async function processPayment(request: PaymentRequest): Promise<PaymentResponse> {
  const { orderId, amount, method } = request;
  
  console.log(`[Stone POS] Processing payment for order ${orderId}`);
  console.log(`  Amount: R$ ${amount.toFixed(2)}`);
  console.log(`  Method: ${method}`);
  
  let delay: number;
  
  switch (method) {
    case 'credit':
      delay = 2500 + Math.random() * 1500; // 2.5-4 seconds
      break;
    case 'debit':
      delay = 2000 + Math.random() * 1000; // 2-3 seconds
      break;
    case 'pix':
      delay = 1500 + Math.random() * 1000; // 1.5-2.5 seconds
      break;
    case 'cash':
      delay = 500 + Math.random() * 500; // 0.5-1 second
      break;
    default:
      delay = 2000;
  }
  
  console.log(`[Stone POS] Waiting ${Math.round(delay / 1000)}s for ${method} transaction...`);
  
  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, delay));
  
  // 95% success rate (simulate occasional failures)
  const success = Math.random() > 0.05;
  
  const response: PaymentResponse = {
    success,
    transactionId: generateTransactionId(),
    orderId,
    amount,
    method,
    message: success 
      ? getSuccessMessage(method)
      : 'Transação recusada. Tente novamente ou utilize outro método de pagamento.',
    timestamp: new Date().toISOString(),
  };
  
  if (success) {
    console.log(`[Stone POS] ✅ Payment approved: ${response.transactionId}`);
  } else {
    console.log(`[Stone POS] ❌ Payment failed for order ${orderId}`);
  }
  
  return response;
}

function getSuccessMessage(method: PaymentMethod): string {
  switch (method) {
    case 'credit':
      return 'Pagamento aprovado no crédito!';
    case 'debit':
      return 'Pagamento aprovado no débito!';
    case 'pix':
      return 'PIX confirmado!';
    case 'cash':
      return 'Pagamento em dinheiro registrado!';
  }
}

// Generate PIX QR code data (mock)
export function generatePIXQRCode(orderId: string, amount: number): {
  qrCodeData: string;
  qrCodeImage: string; // Base64 placeholder
  expiration: string;
} {
  const pixKey = 'barbeariastyle@pagamentos.com';
  const merchantName = 'Barbearia STYLE';
  const city = 'São Paulo';
  
  const qrCodeData = [
    `00020126580014br.gov.bcb.pix0136${pixKey}`,
    `52040000`,
    `5303986`,
    `540${amount.toFixed(2)}`,
    `5802BR`,
    `6009${city}`,
    `6304`,
  ].join('');
  
  const expiration = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes
  
  // Generate a simple QR placeholder (in production, use a QR library)
  const placeholderImage = `data:image/svg+xml;base64,${Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="white"/>
      <rect x="20" y="20" width="50" height="50" fill="black"/>
      <rect x="130" y="20" width="50" height="50" fill="black"/>
      <rect x="20" y="130" width="50" height="50" fill="black"/>
      <rect x="40" y="40" width="10" height="10" fill="white"/>
      <rect x="60" y="40" width="10" height="10" fill="white"/>
      <rect x="80" y="40" width="10" height="10" fill="white"/>
      <rect x="40" y="60" width="10" height="10" fill="white"/>
      <rect x="80" y="60" width="10" height="10" fill="white"/>
      <rect x="40" y="80" width="10" height="10" fill="white"/>
      <rect x="60" y="80" width="10" height="10" fill="white"/>
      <text x="100" y="100" text-anchor="middle" font-size="12">QR Code</text>
      <text x="100" y="115" text-anchor="middle" font-size="10">PIX</text>
    </svg>`
  ).toString('base64')}`;
  
  console.log(`[Stone POS] Generated PIX QR for order ${orderId}, amount R$ ${amount.toFixed(2)}`);
  
  return {
    qrCodeData,
    qrCodeImage: placeholderImage,
    expiration,
  };
}