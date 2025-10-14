// ========================================
// src/app/core/models/justificatif.model.ts
// ========================================

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
