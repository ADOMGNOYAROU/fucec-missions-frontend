// ========================================
// src/app/core/models/justificatif.model.ts
// ========================================
import type { Mission } from './mission.model';
import { TypeJustificatif } from './enums';
import type { User } from './user.model';

export interface Justificatif {
  id: string;
  mission: Mission;
  typeDocument: TypeJustificatif;
  fichier: string;                 // URL du fichier
  nomFichier: string;
  taille: number;                  // en bytes
  uploader: User;
  dateUpload: Date;
  verifie: boolean;
  verifiePar?: User;
  dateVerification?: Date;
  commentaireVerification?: string;
}

export interface UploadJustificatifDto {
  missionId: string;
  typeDocument: TypeJustificatif;
  fichier: File;
}
