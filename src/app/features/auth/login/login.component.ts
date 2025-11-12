import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, UserRole } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpResponse } from '@angular/common/http';

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
    private router: Router,
    private http: HttpClient
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
      next: () => {
        this.loading = false;
        const userRole = this.authService.getUserRole();
        
        switch (userRole) {
          case UserRole.AGENT:
            this.router.navigate(['/missions']);
            break;
          case UserRole.CHEF_AGENCE:
          case UserRole.RESPONSABLE_COPEC:
          case UserRole.DG:
          case UserRole.RH:
          case UserRole.COMPTABLE:
          case UserRole.DIRECTEUR_FINANCES:
            this.router.navigate(['/dashboard']);
            break;
          case UserRole.ADMIN:
            this.router.navigate(['/admin']);
            break;
          default:
            this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Identifiants incorrects';
      }
    });
  }

  testConnectivity(): void {
    console.log('Test de connectivité vers le serveur...');
    // Utiliser OPTIONS pour tester la connectivité sans déclencher d'erreur de méthode
    this.http.options(`${environment.apiUrl}/users/auth/login/`, { observe: 'response' }).subscribe({
      next: (response: HttpResponse<any>) => {
        console.log('✅ Serveur accessible:', response.status);
        this.errorMessage = '✅ Serveur accessible !';
        setTimeout(() => this.errorMessage = '', 3000);
      },
      error: (error: any) => {
        console.error('❌ Serveur non accessible:', error);
        if (error.status === 0) {
          this.errorMessage = '❌ Impossible de contacter le serveur. Vérifiez que le backend Django est lancé sur le port 8000.';
        } else if (error.status === 405) {
          // Méthode non autorisée est normale pour OPTIONS sur un endpoint POST
          this.errorMessage = '✅ Serveur accessible ! (Méthode OPTIONS rejetée normalement)';
          setTimeout(() => this.errorMessage = '', 3000);
        } else {
          this.errorMessage = `❌ Erreur serveur: ${error.status}`;
        }
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  debugConnection(): void {
    console.log('=== DEBUG ÉTAT DE CONNEXION ===');
    console.log('Connecté:', this.authService.isLoggedIn());
    console.log('Utilisateur actuel:', this.authService.getCurrentUser());
    console.log('Rôle utilisateur:', this.authService.getUserRole());
    console.log('Token access:', this.authService.getAccessToken()?.substring(0, 50) + '...');
    console.log('Token refresh:', this.authService.getRefreshToken()?.substring(0, 50) + '...');
    
    const user = this.authService.getCurrentUser();
    if (user) {
      console.log('Permissions canCreateMissions:', user.can_create_missions);
      console.log('Permissions canValidate:', user.can_validate);
    }
    
    this.errorMessage = '📋 Logs de débogage affichés dans la console (F12)';
    setTimeout(() => this.errorMessage = '', 5000);
  }
}