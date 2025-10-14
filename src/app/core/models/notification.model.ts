// ========================================
// src/app/core/models/notification.model.ts
// ========================================

export interface Notification {
  id: string;
  destinataire: User;
  titre: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  lue: boolean;
  dateCrea: Date;
  dateLecture?: Date;
  lien?: string;                   // Lien vers l'objet concerné
}
