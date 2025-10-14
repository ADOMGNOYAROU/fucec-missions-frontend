// ========================================
// src/app/core/models/bareme.model.ts
// ========================================

export interface Bareme {
  id: string;
  destination: string;             // Kpalimé, Atakpamé, etc.
  montantParJour: number;
  dateDebut: Date;
  dateFin?: Date;
  actif: boolean;
}

export interface BaremeParRole {
  role: UserRole;
  montantParJour: number;
}
