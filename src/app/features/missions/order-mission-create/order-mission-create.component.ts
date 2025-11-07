import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User, UserRole } from '../../../core/services/auth.service';
import { debounceTime, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-order-mission-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './order-mission-create.component.html',
  styleUrls: ['./order-mission-create.component.scss']
})
export class OrderMissionCreateComponent implements OnInit, OnDestroy {
  orderForm!: FormGroup;
  currentUser: User | null = null;
  submitting = false;

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
    this.orderForm.valueChanges
      .pipe(
        debounceTime(5000),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (this.autoSaveEnabled && this.orderForm.dirty) {
          this.saveDraft();
        }
      });
  }

  /**
   * Initialiser le formulaire d'ordre de mission
   */
  initForm(): void {
    const today = new Date().toISOString().split('T')[0];

    this.orderForm = this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      dateDebut: [today, Validators.required],
      dateFin: [today, Validators.required],
      lieuMission: ['', Validators.required],
      motifMission: ['', Validators.required],
      participants: [[]],
      budgetEstime: [1, [Validators.required, Validators.min(1)]]
    }, {
      validators: [this.dateValidator]
    });

    // Écouter les changements de date de début pour empêcher les dates passées
    this.orderForm.get('dateDebut')?.valueChanges.subscribe((value) => {
      if (value) {
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Si la date sélectionnée est dans le passé, forcer à aujourd'hui
        if (selectedDate < today) {
          const todayString = today.toISOString().split('T')[0];
          this.orderForm.get('dateDebut')?.setValue(todayString);
        }
      }
    });
  }

  /**
   * Gestionnaire d'événement pour l'input date - bloque les dates passées
   */
  onDateInput(event: any): void {
    const input = event.target as HTMLInputElement;
    const selectedValue = input.value;

    if (selectedValue) {
      const selectedDate = new Date(selectedValue);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Si la date sélectionnée est dans le passé, forcer à aujourd'hui
      if (selectedDate < today) {
        const todayString = today.toISOString().split('T')[0];
        input.value = todayString;
        this.orderForm.get('dateDebut')?.setValue(todayString);
        console.log('Date passée détectée, forcée à aujourd\'hui:', todayString);
      }
    }
  }

  /**
   * Retourne la date du jour au format YYYY-MM-DD pour l'attribut min
   */
  getTodayDateString(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Validateur personnalisé pour les dates
   */
  dateValidator(control: AbstractControl): ValidationErrors | null {
    const dateDebut = control.get('dateDebut')?.value;
    const dateFin = control.get('dateFin')?.value;

    if (!dateDebut) return null;

    const debutDate = new Date(dateDebut);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day

    // Vérifier que la date de début n'est pas antérieure à aujourd'hui
    if (debutDate < today) {
      return { dateDebutPast: true };
    }

    if (!dateFin) return null;

    const finDate = new Date(dateFin);

    // Vérifier que la date de fin est après ou égale à la date de début
    if (finDate < debutDate) {
      return { dateInvalid: true };
    }

    return null;
  }

  /**
   * Chargement initial des données
   */
  loadData(): void {
    // Données mock pour l'instant
    // TODO: Remplacer par des appels API réels
  }

  /**
   * Actions du formulaire
   */
  confirmSubmit(): void {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }
    this.showConfirmDialog = true;
  }

  cancelSubmit(): void {
    this.showConfirmDialog = false;
  }

  onSubmit(): void {
    this.showConfirmDialog = false;
    this.submitting = true;
    this.autoSaveEnabled = false;

    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      this.submitting = false;
      this.autoSaveEnabled = true;
      return;
    }

    // TODO: Remplacer par un appel API réel pour créer l'ordre de mission
    setTimeout(() => {
      this.submitting = false;
      this.autoSaveEnabled = true;
      this.router.navigate(['/missions']);
    }, 500);
  }

  /**
   * Sauvegarde automatique en brouillon
   */
  private saveDraft(): void {
    const draft = this.orderForm.getRawValue();
    try {
      localStorage.setItem('orderMissionDraft', JSON.stringify({
        ...draft,
        savedAt: new Date().toISOString(),
        userId: this.currentUser?.id
      }));
      console.log('Brouillon d\'ordre de mission sauvegardé automatiquement');
    } catch (error) {
      console.warn('Impossible de sauvegarder le brouillon:', error);
    }
  }

  /**
   * Calcul de la durée de mission
   */
  calculerDuree(): number {
    const debut = this.orderForm.get('dateDebut')?.value;
    const fin = this.orderForm.get('dateFin')?.value;
    if (!debut || !fin) return 0;
    const d1 = new Date(debut).getTime();
    const d2 = new Date(fin).getTime();
    const diff = Math.max(0, d2 - d1);
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
}
