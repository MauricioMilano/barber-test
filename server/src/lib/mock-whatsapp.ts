// Mock: WhatsApp/Email - Envio de pesquisas de satisfação
// Simula o envio de mensagens via WhatsApp e Email

export type SendMethod = 'whatsapp' | 'email';

export interface SurveyMessage {
  orderId: string;
  clientName: string;
  clientContact: string; // Phone for WhatsApp, Email for email
  surveyUrl: string;
  message: string;
}

export interface SendResult {
  success: boolean;
  method: SendMethod;
  to: string;
  messageId: string;
  timestamp: string;
}

// Generate survey token
export function generateSurveyToken(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `survey_${timestamp}_${random}`;
}

// Generate survey URL
export function getSurveyUrl(token: string): string {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
  return `${baseUrl}/pesquisa/${token}`;
}

// Format phone number for WhatsApp
function formatPhoneForWhatsApp(phone: string): string {
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 11) {
    return `55${clean}`;
  }
  return clean;
}

// Generate WhatsApp message
function generateWhatsAppMessage(clientName: string, surveyUrl: string): string {
  return `Olá ${clientName}! 👋

Obrigado por escolher a Barbearia STYLE!

Sua avaliação é muito importante para nós. Por favor, responda uma rápida pesquisa de satisfação:

🔗 ${surveyUrl}

Sua opinião nos ajuda a melhorar sempre! 💈

Atenciosamente,
Equipe Barbearia STYLE`;
}

// Generate Email message
function generateEmailMessage(clientName: string, surveyUrl: string): string {
  return `
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #181d26;">Olá ${clientName}!</h2>
  <p>Obrigado por escolher a Barbearia STYLE!</p>
  <p>Sua avaliação é muito importante para nós. Por favor, responda uma rápida pesquisa de satisfação:</p>
  <p style="margin: 30px 0;">
    <a href="${surveyUrl}" style="background-color: #181d26; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px;">Avaliar Atendimento</a>
  </p>
  <p>Sua opinião nos ajuda a melhorar sempre!</p>
  <p><strong>Equipe Barbearia STYLE</strong></p>
</body>
</html>
`;
}

// Send survey via WhatsApp
export async function sendSurveyViaWhatsApp(
  orderId: string,
  clientName: string,
  phone: string
): Promise<SendResult> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 400));
  
  const token = generateSurveyToken();
  const surveyUrl = getSurveyUrl(token);
  const formattedPhone = formatPhoneForWhatsApp(phone);
  const message = generateWhatsAppMessage(clientName, surveyUrl);
  
  console.log(`\n[WhatsApp Mock] 📱 Sending survey to ${formattedPhone}`);
  console.log(`  Order: ${orderId}`);
  console.log(`  Message preview: ${message.substring(0, 100)}...`);
  console.log(`  Survey URL: ${surveyUrl}\n`);
  
  return {
    success: true,
    method: 'whatsapp',
    to: formattedPhone,
    messageId: `wa_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
}

// Send survey via Email
export async function sendSurveyViaEmail(
  orderId: string,
  clientName: string,
  email: string
): Promise<SendResult> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 300));
  
  const token = generateSurveyToken();
  const surveyUrl = getSurveyUrl(token);
  const message = generateEmailMessage(clientName, surveyUrl);
  
  console.log(`\n[Email Mock] 📧 Sending survey to ${email}`);
  console.log(`  Order: ${orderId}`);
  console.log(`  Subject: Pesquisa de Satisfação - Barbearia STYLE`);
  console.log(`  Survey URL: ${surveyUrl}\n`);
  
  return {
    success: true,
    method: 'email',
    to: email,
    messageId: `email_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
}

// Send survey (chooses method based on availability)
export async function sendSurvey(
  orderId: string,
  clientName: string,
  phone?: string,
  email?: string
): Promise<{ survey: { token: string; url: string }; sendResult: SendResult }> {
  const token = generateSurveyToken();
  const surveyUrl = getSurveyUrl(token);
  
  // Prefer WhatsApp if phone available, otherwise Email
  if (phone) {
    const result = await sendSurveyViaWhatsApp(orderId, clientName, phone);
    return { survey: { token, url: surveyUrl }, sendResult: result };
  }
  
  if (email) {
    const result = await sendSurveyViaEmail(orderId, clientName, email);
    return { survey: { token, url: surveyUrl }, sendResult: result };
  }
  
  throw new Error('No contact method available for survey');
}