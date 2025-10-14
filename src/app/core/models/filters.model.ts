// ========================================
// src/app/core/models/filters.model.ts
// ========================================

export interface MissionFilters {
  statut?: MissionStatut[];
  dateDebutMin?: Date;
  dateDebutMax?: Date;
  createurId?: string;
  entiteId?: string;
  search?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}