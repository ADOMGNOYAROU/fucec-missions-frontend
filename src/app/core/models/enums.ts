//: ========================================
// src/app/core/models/enums.ts
// ========================================

export enum UserRole {
  AGENT = 'AGENT',
  CHEF_AGENCE = 'CHEF_AGENCE',
  RESPONSABLE_COPEC = 'RESPONSABLE_COPEC',
  DG = 'DG',
  DIRECTEUR_FINANCES = 'DIRECTEUR_FINANCES',
  RH = 'RH',
  COMPTABLE = 'COMPTABLE',
  ADMIN = 'ADMIN'
}

export enum MissionStatut {
  BROUILLON = 'BROUILLON',
  EN_ATTENTE = 'EN_ATTENTE',
  VALIDEE = 'VALIDEE',
  IN_PROGRESS = 'IN_PROGRESS',
  CLOTUREE = 'CLOTUREE',
  REJETEE = 'REJETEE',
  ARCHIVEE = 'ARCHIVEE'
}

export enum ValidationNiveau {
  N1 = 'N1',           // Chef d'Agence
  N2 = 'N2',           // Responsable COPEC
  DG = 'DG',           // Directeur Général
  RH = 'RH'            // Ressources Humaines
}

export enum SignatureFinanciereNiveau {
  AGENT = 'AGENT',                         // Signature agent
  N1 = 'N1',                               // Signature N+1
  DIRECTEUR_FINANCES = 'DIRECTEUR_FINANCES' // Signature Directeur Finances
}

export enum ValidationDecision {
  EN_ATTENTE = 'EN_ATTENTE',
  VALIDEE = 'VALIDEE',
  REJETEE = 'REJETEE',
  REPORTEE = 'REPORTEE'
}

export enum TypeJustificatif {
  ORDRE_MISSION = 'ORDRE_MISSION',
  BILLET_TRANSPORT = 'BILLET_TRANSPORT',
  FACTURE_HOTEL = 'FACTURE_HOTEL',
  FACTURE_RESTAURANT = 'FACTURE_RESTAURANT',
  RAPPORT_MISSION = 'RAPPORT_MISSION',
  AUTRE = 'AUTRE'
}

export enum TypeEntite {
  AGENCE = 'AGENCE',
  COPEC = 'COPEC',
  DIRECTION = 'DIRECTION'
}