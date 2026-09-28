// /config/twilio.js 

const twilio = require('twilio');

// Carrega as variáveis de ambiente (se ainda não estiverem carregadas globalmente)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

console.log('DEBUG TWILIO: SID (inicia com AC?):', accountSid ? accountSid.substring(0, 4) : 'NULO/VAZIO');
console.log('DEBUG TWILIO: Auth Token Length:', authToken ? authToken.length : 'NULO/VAZIO');
// >>>>> FIM DOS LOGS <<<<<

// Verifica se as credenciais estão disponíveis
if (!accountSid || !authToken) {
    console.error("ERRO: As variáveis TWILIO_ACCOUNT_SID e TWILIO_AUTH_TOKEN não estão definidas.");
}

const twilioClient = twilio(accountSid, authToken);

module.exports = {
    twilioClient,
    twilioWhatsAppNumber: process.env.TWILIO_WHATSAPP_NUMBER,
    twilioSmsNumber: process.env.TWILIO_SMS_NUMBER
};