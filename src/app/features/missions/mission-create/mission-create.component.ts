import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User, UserRole } from '../../../core/services/auth.service';

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
export class MissionCreateComponent implements OnInit {
  missionForm!: FormGroup;
  currentUser: User | null = null;
  submitting = false;

  // Listes
  vehicules: Vehicule[] = [];
  chauffeurs: User[] = [];
  selectedParticipants: Participant[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.initForm();
    this.loadData();
  }

  /**
   * Initialiser le formulaire
   */
  initForm(): void {
    const today = new Date().toISOString().split('T')[0];

    this.missionForm = this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(10)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      dateDebut: [today, Validators.required],
      dateFin: ['', Validators.required],
      lieuMission: ['', Validators.required],
      vehiculeId: [''],
      chauffeurId: [''],
      budgetEstime: [0, [Validators.required, Validators.min(1)]],
      avanceDemandee: [0, [Validators.required, Validators.min(0)]]
    }, {
      validators: [this.dateValidator, this.avanceValidator]
    });
  }

  /**
   * Validateur personnalisé pour les dates
   */
  dateValidator(control: AbstractControl): ValidationErrors | null {
    const dateDebut = control.get('dateDebut')?.value;
    const dateFin = control.get('dateFin')?.value;

    if (dateDebut && dateFin && new Date(dateFin) < new Date(dateDebut)) {
      return { dateInvalid: true };
    }

    return null;