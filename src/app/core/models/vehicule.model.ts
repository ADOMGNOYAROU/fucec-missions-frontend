// ========================================
// src/app/core/models/vehicule.model.ts
// ========================================

export interface Vehicule {
  id: string;
  immatriculation: string;
  marque: string;
  modele: string;
  type: string;                    // Berline, 4x4, etc.
  disponible: boolean;
  kilometrage: number;
  dateAcquisition: Date;
  dateAssurance?: Date;
  dateVisite?: Date;
}

export interface CreateVehiculeDto {
  immatriculation: string;
  marque: string;
  modele: string;
  type: string;
  kilometrage: number;
  dateAcquisition: string;
}
