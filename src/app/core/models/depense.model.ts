/ ========================================
// src/app/core/models/depense.model.ts
// ========================================

export interface Depense {
  id: string;
  mission: Mission;
  nature: string;                  // Carburant, Hébergement, etc.
  montant: number;
  justificatif?: Justificatif;
  dateDepense: Date;
  description?: string;
}

export interface EtatDepenses {
  mission: Mission;
  depenses: Depense[];
  totalDepenses: number;
  avanceRecue: number;
  solde: number;                   // Positif = remboursement, Négatif = dette
}