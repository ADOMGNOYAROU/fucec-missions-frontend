import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  showPassword = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    
    // Si déjà connecté, rediriger vers dashboard
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  initForm(): void {
    this.loginForm = this.fb.group({
      identifiant: ['', [Validators.required, Validators.minLength(3)]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { identifiant, motDePasse } = this.loginForm.value;

    this.authService.login(identifiant, motDePasse).subscribe({
      next: (response) => {
        // Succès - Redirection selon le rôle
        this.loading = false;
        const userRole = response.user.role;
        
        switch (userRole) {
          case 'AGENT':
            this.router.navigate(['/missions']);
            break;
          case 'CHEF_AGENCE':
          case 'RESPONSABLE_COPEC':
            this.router.navigate(['/validations']);
            break;
          case 'DG':
          case 'RH':
          case 'COMPTABLE':
            this.router.navigate(['/dashboard']);
            break;
          case 'ADMIN':
            this.router.navigate(['/admin']);
            break;
          default:
            this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        this.loading = false;
        
        // Gestion des erreurs
        if (error.status === 401) {
          this.errorMessage = 'Identifiant ou mot de passe incorrect';
        } else if (error.status === 403) {
          this.errorMessage = 'Compte désactivé. Contactez l\'administrateur';
        } else if (error.status === 0) {
          this.errorMessage = 'Impossible de se connecter au serveur';
        } else {
          this.errorMessage = error.error?.message || 'Une erreur est survenue';
        }

        // Effacer le message après 5 secondes
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    });
  }

  // Helper pour afficher les erreurs de validation
  getErrorMessage(fieldName: string): string {
    const control = this.loginForm.get(fieldName);
    
    if (control?.hasError('required')) {
      return `Le champ ${fieldName} est requis`;
    }
    
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Minimum ${minLength} caractères requis`;
    }
    
    return '';
  }
}