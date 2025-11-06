// ========================================
// src/app/core/models/entite.model.ts
// ========================================
import { TypeEntite } from './enums';
import type { User } from './user.model';

export interface Entite {
  id: string;
  nom: string;
  code: string;
  type: TypeEntite;
  parent?: Entite;
  responsable?: User;
  dateCreation: Date;
}

export interface CreateEntiteDto {
  nom: string;
  code: string;
  type: TypeEntite;
  parentId?: string;
  responsableId?: string;
}