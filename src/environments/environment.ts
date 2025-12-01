// src/environments/environment.ts (Development)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',  // URL de base de l'API Django
  apiVersion: 'v1',
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
  devAutoLogin: false,  // Désactivé pour forcer la connexion réelle
  devUser: {
    id: '1',
    identifiant: 'admin',  // Remplacez par un identifiant existant
    nom: 'Admin',
    prenom: 'Système',
    email: 'admin@example.com',
    role: 'ADMIN',
    password: 'admin123'  // Mot de passe pour le mode développement
  }
};
