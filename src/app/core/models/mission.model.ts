// ========================================
// src/app/core/models/mission.model.ts
// ========================================
import type { User } from './user.model';
import type { Entite } from './entite.model';
import type { Vehicule } from './vehicule.model';
import { MissionStatut } from './enums';

export interface Mission {
  id: string;
  reference: string;              // MSN-2025-0001
  titre: string;
  description: string;
  dateDebut: Date;
  dateFin: Date;
  dateRetourReelle?: Date;        // Date retour déclarée par l'agent
  lieuMission: string;
  
  // Finance
  budgetEstime: number;
  avanceDemandee: number;
  
  // Relations
  createur: User;
  entite: Entite;
  participants: User[];
  
  // Véhicule
  vehicule?: Vehicule;
  chauffeur?: User;
  
  // Statut
  statut: MissionStatut;
  
  // Dates système
  dateCreation: Date;
  dateModification: Date;
  dateCloture?: Date;
  
  // Compteurs
  nombreValidations: number;
  nombreJustificatifs: number;
  pourcentageValidation: number;
}

export interface CreateMissionDto {
  titre: string;
  description: string;
  dateDebut: string;              // Format ISO
  dateFin: string;
  lieuMission: string;
  budgetEstime: number;
  avanceDemandee: number;
  participantIds: string[];
  vehiculeId?: string;
  chauffeurId?: string;
}

export interface UpdateMissionDto {
  titre?: string;
  description?: string;
  dateDebut?: string;
  dateFin?: string;
  lieuMission?: string;
  budgetEstime?: number;
  avanceDemandee?: number;
  participantIds?: string[];
  vehiculeId?: string;
  chauffeurId?: string;
}