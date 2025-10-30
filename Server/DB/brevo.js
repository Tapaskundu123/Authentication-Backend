// DB/brevo.js
import Brevo from '@getbrevo/brevo';

const DEFAULT_SENDER = {
  name: 'Mern Auth App',
  email: process.env.SENDER_EMAIL,
};

export const verifyBrevo = async () => {
  if (!process.env.BREVO_API_KEY) {
    console.error('❌ BREVO_API_KEY is missing in .env');
    return false;
  }
  if (!process.env.SENDER_EMAIL) {
    console.error('❌ SENDER_EMAIL is missing in .env');
    return false;
  }

  const apiInstance = new Brevo.AccountApi();
  apiInstance.setApiKey(Brevo.AccountApiApiKeys.apiKey, process.env.BREVO_API_KEY);

  try {
    const response = await apiInstance.getAccount();
    console.log('✅ Brevo API ready:', response.companyName || response.firstName || 'Account');
    return true;
  } catch (error) {
    console.error('❌ Brevo API verification failed:', error.message || error);
    return false;
  }
};

export const sendEmail = async (to, subject, text, html = null) => {
  if (!process.env.BREVO_API_KEY || !process.env.SENDER_EMAIL) {
    throw new Error('Missing BREVO_API_KEY or SENDER_EMAIL in .env');
  }

  const sendSmtpEmail = new Brevo.SendSmtpEmail();
  sendSmtpEmail.sender = DEFAULT_SENDER;
  sendSmtpEmail.to = [{ email: to }];
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.textContent = text;
  if (html) {
    sendSmtpEmail.htmlContent = html;
  }

  const emailApi = new Brevo.TransactionalEmailsApi();
  emailApi.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

  try {
    const result = await emailApi.sendTransacEmail(sendSmtpEmail);
    
    // 🔧 FIX: Extract "message-id" from result (Brevo API uses kebab-case)
    const messageId = result['message-id'] || result.messageId || 'ID not available';
    
    console.log('✅ Email sent successfully:', messageId);
    
    return { success: true, messageId };
  }
catch (error) {
    // Better error parsing for Brevo SDK
    const errorCode = error.code || (error.response?.status || 500);
    const errorMessage = error.message || 'Unknown error';
    
    console.error('❌ Email send failed:', { code: errorCode, message: errorMessage });
    
    // Common Brevo errors
    if (errorCode === 401) {
      throw new Error('Brevo 401: Invalid API key. Regenerate at https://app.brevo.com/settings/keys/api');
    } else if (errorCode === 400 && errorMessage.includes('sender')) {
      throw new Error('Brevo 400: Sender email not verified. Verify at https://app.brevo.com/account/senders');
    } else if (errorCode === 402) {
      throw new Error('Brevo 402: Insufficient credits. Check your plan.');
    }
    
    throw new Error(`Brevo email failed (${errorCode}): ${errorMessage}`);
  }
};