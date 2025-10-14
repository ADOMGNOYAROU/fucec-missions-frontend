// ========================================
// src/app/core/models/signature-financiere.model.ts
// ========================================

export interface SignatureFinanciere {
  id: string;
  mission: Mission;
  niveau: SignatureFinanciereNiveau;
  signataire: User;
  datSignature: Date;
  ordre: number;                   // 1 = Agent, 2 = N+1, 3 = Directeur Finances
  statut: 'EN_ATTENTE' | 'SIGNEE';
  commentaire?: string;
}

export interface CreateSignatureDto {
  missionId: string;
  commentaire?: string;
}