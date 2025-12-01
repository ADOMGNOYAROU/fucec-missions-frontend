import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User, UserRole } from '../../../core/services/auth.service';
import { MissionService } from '../services/mission.service';
import { MissionValidationDialogComponent } from '../../../shared/components/mission-validation-dialog/mission-validation-dialog.component';
import { debounceTime, Subject, takeUntil, finalize } from 'rxjs';

// Interfaces
export interface Vehicule {
  id: string;
  immatriculation: string;
  marque: string;
  modele: string;
  disponible: boolean;
}

export interface Participant {
  id: string;
  prenom: string;
  nom: string;
  role: UserRole;
  email: string;
}

@Component({
  selector: 'app-mission-create',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    ReactiveFormsModule, 
    RouterModule, 
    MissionValidationDialogComponent
  ],
  templateUrl: './mission-create.component.html',
  styleUrls: ['./mission-create.component.scss']
})
export class MissionCreateComponent implements OnInit, OnDestroy {
  missionForm: FormGroup;
  currentUser: User | null = null;
  submitting = false;
  isLoading = false;
  errorMessage: string | null = null;
  showConfirmDialog = false;
  autoSaveEnabled = true;

  // Dialogue de validation
  showValidationDialog = false;
  missionDataForValidation: any = null;

  // Listes
  vehicules: Vehicule[] = [];
  chauffeurs: any[] = []; // Utilisation de any pour éviter les conflits de type temporairement
  selectedParticipants: Participant[] = [];

  // Gestion des abonnements
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private missionService: MissionService,
    private router: Router
  ) {
    this.missionForm = this.createForm();
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.setupAutoSave();
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      dateDebut: [today.toISOString().split('T')[0], Validators.required],
      dateFin: [tomorrow.toISOString().split('T')[0], Validators.required],
      lieuMission: ['', [Validators.required, Validators.minLength(3)]],
      vehiculeId: ['', Validators.required],
      chauffeurId: ['', Validators.required],
      budgetEstime: [null, [Validators.required, Validators.min(1)]],
      commentaires: ['']
    }, { validators: [this.dateValidator] });
  }

  private setupAutoSave(): void {
    this.missionForm.valueChanges
      .pipe(
        debounceTime(3000),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (this.missionForm.dirty && this.missionForm.valid) {
          this.saveDraft();
        }
      });
  }

  private loadInitialData(): void {
    this.isLoading = true;
    this.errorMessage = null;

    // Chargement des véhicules
    this.missionService.getAllVehicles().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (vehicules: Vehicule[]) => {
        this.vehicules = vehicules.filter((v: Vehicule) => v.disponible);
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des véhicules:', error);
        this.errorMessage = 'Impossible de charger la liste des véhicules.';
      }
    });

    // Chargement des chauffeurs
    this.missionService.getAllDrivers().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (chauffeurs: any[]) => {
        this.chauffeurs = chauffeurs;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des chauffeurs:', error);
        this.errorMessage = 'Impossible de charger la liste des chauffeurs.';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  dateValidator(control: AbstractControl): ValidationErrors | null {
    const dateDebut = control.get('dateDebut')?.value;
    const dateFin = control.get('dateFin')?.value;

    if (!dateDebut || !dateFin) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const debutDate = new Date(dateDebut);
    const finDate = new Date(dateFin);

    // Réinitialiser les heures pour la comparaison
    debutDate.setHours(0, 0, 0, 0);
    finDate.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (debutDate < yesterday) {
      return { dateDebutPast: true };
    }

    if (finDate < debutDate) {
      return { dateFinBeforeDebut: true };
    }

    return null;
  }

  onAddParticipant(participant: Participant): void {
    if (!this.selectedParticipants.some(p => p.id === participant.id)) {
      this.selectedParticipants = [...this.selectedParticipants, participant];
    }
  }

  onRemoveParticipant(participant: Participant): void {
    this.selectedParticipants = this.selectedParticipants.filter(p => p.id !== participant.id);
  }

  confirmSubmit(): void {
    if (this.missionForm.invalid) {
      this.missionForm.markAllAsTouched();
      this.errorMessage = 'Veuillez remplir correctement tous les champs obligatoires.';
      return;
    }

    this.missionDataForValidation = {
      ...this.missionForm.value,
      participants: this.selectedParticipants,
      duree: this.calculerDuree(),
      vehicule: this.vehicules.find(v => v.id === this.missionForm.value.vehiculeId),
      chauffeur: this.chauffeurs.find(c => c.id === this.missionForm.value.chauffeurId)
    };

    this.showValidationDialog = true;
  }

  onMissionValidate(status: string): void {
    this.showValidationDialog = false;
    this.submitMission();
  }

  onMissionReject(rejectionData: { reason: string; comment?: string }): void {
    console.log('Mission rejetée:', rejectionData);
    this.showValidationDialog = false;
  }

  onValidationCancel(): void {
    this.showValidationDialog = false;
  }

  /**
   * Soumettre la mission après validation
   */
  private submitMission(): void {
    this.showValidationDialog = false;
    this.onSubmit();
  }

  onSubmit(): void {
    this.showConfirmDialog = false;
    this.submitting = true;
    // Désactiver la sauvegarde automatique pendant la soumission
    this.autoSaveEnabled = false;

    if (this.missionForm.invalid) {
      this.missionForm.markAllAsTouched();
      this.submitting = false;
      this.autoSaveEnabled = true; // Réactiver
      return;
    }

    // Préparer les données pour l'API
    const formData = this.missionForm.getRawValue();
    const missionData = {
      ...formData,
      participants: this.selectedParticipants.map(p => p.id)
    };

    // Création de la mission
    this.missionService.create(missionData).subscribe({
      next: (response) => {
        console.log('Mission créée avec succès:', response);
        
        // Soumettre la mission après création réussie
        if (response && response.id) {
          this.missionService.submit(response.id).subscribe({
            next: () => {
              console.log('Mission soumise avec succès');
              this.finalizeMissionCreation();
            },
            error: (submitError) => {
              console.error('Erreur lors de la soumission de la mission:', submitError);
              // On continue même en cas d'erreur de soumission
              this.finalizeMissionCreation();
            }
          });
        } else {
          // Si pas d'ID dans la réponse, on finalise sans soumettre
          console.warn('Aucun ID de mission dans la réponse, impossible de soumettre');
          this.finalizeMissionCreation();
        }
      },
      error: (error) => {
        console.error('Erreur lors de la création de la mission:', error);
        this.submitting = false;
        this.autoSaveEnabled = true;
        // Afficher un message d'erreur à l'utilisateur
        alert('Erreur lors de la création de la mission. Veuillez réessayer.');
      }
    });
  }

  /**
   * Finaliser la création de la mission
   */
  private finalizeMissionCreation(): void {
    this.submitting = false;
    this.autoSaveEnabled = true;
    // Supprimer le brouillon après création réussie
    localStorage.removeItem('missionDraft');
    // Afficher un message de succès
    alert('Mission créée et soumise avec succès !');
    // Rediriger vers la liste des missions
    this.router.navigate(['/missions']);
  }

  /**
   * Sauvegarde automatique en brouillon (silencieuse)
   */
  private saveDraft(): void {
    const draft = this.missionForm.getRawValue();
    try {
      localStorage.setItem('missionDraft', JSON.stringify({
        ...draft,
        savedAt: new Date().toISOString(),
        userId: this.currentUser?.id
      }));
      // Optionnel : afficher un indicateur visuel de sauvegarde
      console.log('Brouillon sauvegardé automatiquement');
    } catch (error) {
      console.warn('Impossible de sauvegarder le brouillon:', error);
    }
  }

  calculerDuree(): number {
    const debut = this.missionForm.get('dateDebut')?.value;
    const fin = this.missionForm.get('dateFin')?.value;
    if (!debut || !fin) return 0;
    const d1 = new Date(debut).getTime();
    const d2 = new Date(fin).getTime();
    const diff = Math.max(0, d2 - d1);
    // Au minimum 1 jour si les dates sont identiques ou très proches
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  getRoleLabel(role?: UserRole | string): string {
    const labels: Record<string, string> = {
      ADMIN: 'Administrateur',
      VALIDATEUR: 'Validateur',
      FINANCE: 'Finance',
      DIRECTEUR_FINANCES: 'Finance',
      CHAUFFEUR: 'Chauffeur',
      AGENT: 'Agent',
      RH: 'Ressources Humaines',
      COMPTABLE: 'Comptable',
      DG: 'Directeur Général',
      CHEF_AGENCE: "Chef d'agence",
      RESPONSABLE_COPEC: 'Responsable COPEC',
    };
    const key = String(role ?? '');
    return labels[key] ?? 'Utilisateur';
  }

  removeParticipant(index: number): void {
    if (index >= 0 && index < this.selectedParticipants.length) {
      this.selectedParticipants.splice(index, 1);
    }
  }

  openParticipantModal(): void {
    // TODO: Ouvrir un vrai modal pour choisir des participants
    // Pour l'instant on ajoute un participant fictif
    this.selectedParticipants.push({
      id: crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
      prenom: 'Invité',
      nom: 'Temporaire',
      role: 'AGENT' as UserRole,
      email: 'invite@example.com' // Ajout de l'email manquant
    });
  }
}