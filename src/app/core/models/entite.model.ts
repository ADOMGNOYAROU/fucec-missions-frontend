// ========================================
// src/app/core/models/entite.model.ts
// ========================================

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