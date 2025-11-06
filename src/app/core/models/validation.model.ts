// ========================================
// src/app/core/models/validation.model.ts
// ========================================
import type { Mission } from './mission.model';
import type { User } from './user.model';
import { ValidationNiveau, ValidationDecision } from './enums';

export interface Validation {
  id: string;
  mission: Mission;
  niveau: ValidationNiveau;
  validateur: User;
  decision: ValidationDecision;
  commentaire?: string;
  dateDecision?: Date;
  ordre: number;                   // Ordre dans le circuit
  delaiHeures: number;            // Délai SLA en heures
  dateEcheance: Date;             // Date limite de validation
  enRetard: boolean;
}

export interface CreateValidationDto {
  missionId: string;
  decision: ValidationDecision;
  commentaire?: string;
}
