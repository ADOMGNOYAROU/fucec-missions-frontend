// ========================================
// src/app/core/models/signature-financiere.model.ts
// ========================================
import type { Mission } from './mission.model';
import type { User } from './user.model';
import { SignatureFinanciereNiveau } from './enums';

export interface SignatureFinanciere {
  id: string;
  mission: Mission;
  niveau: SignatureFinanciereNiveau;
  signataire: User;
  dateSignature: Date;
  ordre: number;                   // 1 = Agent, 2 = N+1, 3 = Directeur Finances
  statut: 'EN_ATTENTE' | 'SIGNEE';
  commentaire?: string;
}

export interface CreateSignatureDto {
  missionId: string;
  commentaire?: string;
}