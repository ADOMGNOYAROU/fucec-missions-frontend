// src/environments/environment.prod.ts (Production)
export const environment = {
  production: true,
  apiUrl: 'https://api.fucec-missions.tg/api',  // URL production
  apiVersion: 'v1',
  appName: 'FUCEC Missions',
  appVersion: '1.0.0',
  
  // Configuration JWT
  tokenExpirationTime: 3600,
  refreshTokenExpirationTime: 604800,
  
  // Configuration upload
  maxFileSize: 10485760,
  allowedFileTypes: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'xls', 'xlsx'],
  
  // Configuration notifications
  notificationDuration: 5000,
  
  // Délais SLA
  slaDelaiValidation: 72,
  slaDelaiJustificatifs: 72,
};