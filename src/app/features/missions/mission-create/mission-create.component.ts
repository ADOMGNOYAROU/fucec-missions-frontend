import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User, UserRole } from '../../../core/services/auth.service';
import { debounceTime, Subject, takeUntil } from 'rxjs';

// Interfaces temporaires
interface Vehicule {
  id: string;
  immatriculation: string;
  marque: string;
  modele: string;
}

interface Participant {
  id: string;
  prenom: string;
  nom: string;
  role: UserRole;
}

@Component({
  selector: 'app-mission-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './mission-create.component.html',
  styleUrls: ['./mission-create.component.scss']
})
export class MissionCreateComponent implements OnInit, OnDestroy {
  missionForm!: FormGroup;
  currentUser: User | null = null;
  submitting = false;

  // Listes
  vehicules: Vehicule[] = [];
  chauffeurs: User[] = [];
  selectedParticipants: Participant[] = [];

  // Sauvegarde automatique
  private destroy$ = new Subject<void>();
  private autoSaveEnabled = true;

  // Boîte de dialogue de confirmation
  showConfirmDialog = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.initForm();
    this.loadData();
    this.setupAutoSave();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Configuration de la sauvegarde automatique en brouillon
   */
  private setupAutoSave(): void {
    // Sauvegarde automatique toutes les 5 secondes après modification
    this.missionForm.valueChanges
      .pipe(
        debounceTime(5000), // 5 secondes d'inactivité
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (this.autoSaveEnabled && this.missionForm.dirty) {
          this.saveDraft();
        }
      });
  }

  /**
   * Initialiser le formulaire
   */
  initForm(): void {
    const today = new Date().toISOString().split('T')[0];

    this.missionForm = this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(3)]], // Temporairement réduit
      description: ['', [Validators.required, Validators.minLength(5)]], // Temporairement réduit
      dateDebut: [today, Validators.required],
      dateFin: [today, Validators.required], // Date de fin par défaut = aujourd'hui
      lieuMission: ['', Validators.required],
      vehiculeId: [''],
      chauffeurId: [''],
      budgetEstime: [1, [Validators.required, Validators.min(1)]]
    }, {
      validators: [this.dateValidator]
    });
  }

  /**
   * Validateur personnalisé pour les dates
   */
  dateValidator(control: AbstractControl): ValidationErrors | null {
    const dateDebut = control.get('dateDebut')?.value;
    const dateFin = control.get('dateFin')?.value;

    if (!dateDebut || !dateFin) return null; // Ne valider que si les deux dates sont présentes

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day

    const debutDate = new Date(dateDebut);
    const finDate = new Date(dateFin);

    // Vérifier que la date de fin est après ou égale à la date de début
    if (finDate < debutDate) {
      return { dateInvalid: true };
    }

    // Permettre les dates d'aujourd'hui et futures uniquement
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (debutDate < yesterday) {
      return { dateDebutPast: true };
    }

    if (finDate < yesterday) {
      return { dateFinPast: true };
    }

    return null;
  }

  /**
   * Chargement initial des données (mock pour l'instant)
   */
  loadData(): void {
    // TODO: Remplacer par des appels API réels
    this.vehicules = [
      { id: '1', immatriculation: 'TG-1234-AB', marque: 'Toyota', modele: 'Hilux' },
      { id: '2', immatriculation: 'TG-5678-CD', marque: 'Nissan', modele: 'Navara' }
    ];

    this.chauffeurs = [
      { id: '10', prenom: 'Jean', nom: 'K.', role: 'CHAUFFEUR' as UserRole },
      { id: '11', prenom: 'Paul', nom: 'M.', role: 'CHAUFFEUR' as UserRole }
    ] as unknown as User[];
  }

  /**
   * Actions / helpers utilisés dans le template
   */
  confirmSubmit(): void {
    // Temporairement : soumettre directement sans boîte de dialogue
    this.onSubmit();
  }

  cancelSubmit(): void {
    this.showConfirmDialog = false;
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
    // TODO: Remplacer par un appel API réel
    setTimeout(() => {
      this.submitting = false;
      this.autoSaveEnabled = true; // Réactiver
      this.router.navigate(['/missions']);
    }, 500);
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
      role: 'AGENT' as UserRole
    });
  }
}