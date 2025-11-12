// src/environments/environment.ts (Development)
import { UserRole } from '../app/core/services/auth.service';

export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',  // URL de votre backend Django
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

  // Auto-login automatique pour agent simple (activé pour tests)
  autoLoginEnabled: true,
  autoLoginCredentials: {
    identifiant: 'agent',
    password: 'test123'
  },

  // Auto-login dev pour développement (désactivé pour utiliser la vraie connexion)
  devAutoLogin: false,
  devUser: {
    id: '5', // ID de l'agent en base
    first_name: 'Agent',
    last_name: 'Test',
    identifiant: 'agent', // Utilisateur agent existant
    email: 'agent@fucec.ci',
    role: UserRole.AGENT,
    is_active: true,
    date_joined: new Date().toISOString()
  },
};
