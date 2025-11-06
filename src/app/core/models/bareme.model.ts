// ========================================
// src/app/core/models/bareme.model.ts
// ========================================
import { UserRole } from './enums';

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
