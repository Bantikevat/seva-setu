require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT) || 3005,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',
  jwtSecret: process.env.JWT_SECRET || 'seva-setu-dev-secret-change-in-prod',

  // Provider configs (production)
  msg91AuthKey:    process.env.MSG91_AUTH_KEY,
  msg91SenderId:   process.env.MSG91_SENDER_ID || 'SEVSTU',
  whatsappToken:   process.env.WHATSAPP_TOKEN,
  whatsappPhoneId: process.env.WHATSAPP_PHONE_ID,
  fcmServerKey:    process.env.FCM_SERVER_KEY,
  sendgridApiKey:  process.env.SENDGRID_API_KEY,
  emailUser:       process.env.EMAIL_USER,
  emailPass:       process.env.EMAIL_PASS,
  emailFrom:       process.env.EMAIL_FROM || 'Seva Setu <noreply@sevasetu.in>',
};
