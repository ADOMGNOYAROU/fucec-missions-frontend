// ========================================
// src/app/core/models/user.model.ts
// ========================================
import type { Entite } from './entite.model';
import { UserRole } from './enums';

export interface User {
  id: string;
  identifiant: string;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  entite?: Entite;
  telephone?: string;
  matricule?: string;
  signature?: string;          // URL de la signature scannée
  actif: boolean;
  dateCreation: Date;
  dateModification?: Date;
}

export interface CreateUserDto {
  identifiant: string;
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  role: UserRole;
  entiteId?: string;
  telephone?: string;
  matricule?: string;
}

export interface UpdateUserDto {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  entiteId?: string;
  actif?: boolean;
}
