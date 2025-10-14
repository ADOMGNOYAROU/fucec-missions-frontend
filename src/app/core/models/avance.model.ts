// ========================================
// src/app/core/models/avance.model.ts
// ========================================

export interface Avance {
  id: string;
  mission: Mission;
  montant: number;
  dateVersement: Date;
  versePar: User;                  // Comptable
  beneficiaire: User;
  statut: 'EN_ATTENTE' | 'VERSEE' | 'REMBOURSEE';
  modeVersement: string;           // Espèces, Virement, etc.
}