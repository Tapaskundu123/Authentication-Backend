// DB/brevo.js
import Brevo from '@getbrevo/brevo';

const getSender = () => ({
  name: process.env.SENDER_NAME || 'Mern Auth App',
  email: process.env.SENDER_EMAIL,
});

const setApiKey = (api) => {
  // keep current SDK pattern but guard if missing
  if (!process.env.BREVO_API_KEY) throw new Error('Missing BREVO_API_KEY');
  api.setApiKey?.(Brevo.TransactionalEmailsApiApiKeys?.apiKey, process.env.BREVO_API_KEY);
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

  try {
    const apiInstance = new Brevo.AccountApi();
    setApiKey(apiInstance);
    const response = await apiInstance.getAccount();
    console.log('✅ Brevo API ready:', response?.companyName || response?.firstName || 'Account');
    return true;
  } catch (error) {
    console.error('❌ Brevo API verification failed:', error?.message || error);
    if (error?.response) {
      console.error('Brevo verify response body:', error.response?.body || error.response);
    }
    return false;
  }
};

export const sendEmail = async (to, subject, text, html = null) => {
  if (!process.env.BREVO_API_KEY || !process.env.SENDER_EMAIL) {
    throw new Error('Missing BREVO_API_KEY or SENDER_EMAIL in .env');
  }

  const payload = {
    sender: getSender(),
    to: [{ email: to }],
    subject,
    textContent: text,
    ...(html ? { htmlContent: html } : {}),
  };

  console.log('📨 sendEmail payload:', JSON.stringify(payload));

  const emailApi = new Brevo.TransactionalEmailsApi();
  try {
    setApiKey(emailApi);
  } catch (err) {
    console.error('Failed to set Brevo API key:', err);
    throw err;
  }

  try {
    const result = await emailApi.sendTransacEmail(payload);
    // Log full result so you can inspect
    console.log('✅ Brevo sendTransacEmail result:', JSON.stringify(result, null, 2));
    // Return raw result so calling code can inspect it (very useful in /test-mail)
    return { success: true, raw: result };
  } catch (error) {
    // Very detailed logging for debugging
    console.error('❌ Brevo sendTransacEmail error message:', error?.message || error);
    if (error?.response) {
      console.error('Brevo HTTP status:', error.response?.status);
      try {
        console.error('Brevo response body:', JSON.stringify(error.response?.body || error.response, null, 2));
      } catch (e) {
        console.error('Brevo response body (raw):', error.response?.body || error.response);
      }
    }
    // Some SDKs put useful details in error.response?.body or error?.body
    const code = error?.response?.status || error?.code || 'unknown';
    const msg = error?.message || JSON.stringify(error?.response?.body || error) || 'Unknown';
    // Throw a clear error so your controller can handle / log it
    throw new Error(`Brevo email failed (${code}): ${msg}`);
  }
};
