// src/environments/environment.ts (Development)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',  // URL de votre backend Django
  appName: 'FUCEC Missions',
  appVersion: '1.0.0',
  
  // Configuration JWT
  tokenExpirationTime: 3600, // 1 heure en secondes
  refreshTokenExpirationTime: 604800, // 7 jours en secondes
  
  // Configuration upload
  maxFileSize: 10485760, // 10 MB en bytes
  allowedFileTypes: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'xls', 'xlsx'],
  
  // Configuration notifications
  notificationDuration: 5000, // 5 secondes
  
  // Délais SLA
  slaDelaiValidation: 72, // heures
  slaDelaiJustificatifs: 72, // heures

  // Dev helpers
  devAutoLogin: false,
  devUser: {
    id: '1',
    identifiant: 'agent.test',
    nom: 'Test',
    prenom: 'Agent',
    email: 'agent.test@example.com',
    role: 'AGENT',
  }
};
