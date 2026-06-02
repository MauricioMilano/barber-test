export type PaymentMethod = 'credit' | 'debit' | 'pix' | 'cash';

export interface PaymentRequest {
  orderId: string;
  amount: number;
  method: PaymentMethod;
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

function generateTransactionId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ST${timestamp}${random}`;
}

export async function processPayment(request: PaymentRequest): Promise<PaymentResponse> {
  const { orderId, amount, method } = request;

  console.log(`[Stone POS] Processing payment for order ${orderId}`);
  console.log(`  Amount: R$ ${amount.toFixed(2)}`);
  console.log(`  Method: ${method}`);

  let delay: number;
  switch (method) {
    case 'credit': delay = 2500 + Math.random() * 1500; break;
    case 'debit': delay = 2000 + Math.random() * 1000; break;
    case 'pix': delay = 1500 + Math.random() * 1000; break;
    case 'cash': delay = 500 + Math.random() * 500; break;
    default: delay = 2000;
  }

  console.log(`[Stone POS] Waiting ${Math.round(delay / 1000)}s...`);
  await new Promise((resolve) => setTimeout(resolve, delay));

  const success = Math.random() > 0.05;
  const response: PaymentResponse = {
    success,
    transactionId: generateTransactionId(),
    orderId,
    amount,
    method,
    message: success ? getSuccessMessage(method) : 'Transação recusada. Tente novamente.',
    timestamp: new Date().toISOString(),
  };

  if (success) {
    console.log(`[Stone POS] ✅ Payment approved: ${response.transactionId}`);
  } else {
    console.log(`[Stone POS] ❌ Payment failed`);
  }

  return response;
}

function getSuccessMessage(method: PaymentMethod): string {
  switch (method) {
    case 'credit': return 'Pagamento aprovado no crédito!';
    case 'debit': return 'Pagamento aprovado no débito!';
    case 'pix': return 'PIX confirmado!';
    case 'cash': return 'Pagamento em dinheiro registrado!';
  }
}

export function generatePIXQrCode(orderId: string, amount: number): { qrCodeData: string; qrCodeImage: string; expiration: string } {
  const pixKey = 'barbeariastyle@pagamentos.com';
  const qrCodeData = [
    `00020126580014br.gov.bcb.pix0136${pixKey}`,
    `52040000`, `5303986`, `540${amount.toFixed(2)}`, `5802BR`, `6009São Paulo`, `6304`,
  ].join('');

  const placeholderImage = `data:image/svg+xml;base64,${Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="white"/>
      <rect x="20" y="20" width="50" height="50" fill="black"/>
      <rect x="130" y="20" width="50" height="50" fill="black"/>
      <rect x="20" y="130" width="50" height="50" fill="black"/>
      <text x="100" y="100" text-anchor="middle" font-size="12">QR Code</text>
    </svg>`
  ).toString('base64')}`;

  return { qrCodeData, qrCodeImage: placeholderImage, expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString() };
}