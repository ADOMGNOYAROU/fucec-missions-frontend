import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, UserRole, User } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  // Implémentation des méthodes d'interface
  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      identifiant: ['', [Validators.required, Validators.minLength(3)]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]]
    });
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  submitted = false;
  returnUrl: string;
  showPassword = false;
  private authSubscription: Subscription | undefined;

  constructor(
    private formBuilder: FormBuilder,
    @Inject(AuthService) private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Rediriger vers la page d'accueil si déjà connecté
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/']);
    }

    // Initialiser le formulaire
    this.loginForm = this.formBuilder.group({
      identifiant: ['', [Validators.required, Validators.minLength(3)]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Récupérer l'URL de retour ou l'URL par défaut
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  /**
   * Redirige l'utilisateur en fonction de son rôle
   */
  private redirectBasedOnRole(role?: string): void {
    if (!role) {
      console.warn('Aucun rôle spécifié, redirection vers /dashboard par défaut');
      this.router.navigate(['/dashboard']);
      return;
    }

    const routeMap: {[key: string]: string} = {
      'AGENT': '/missions',
      'CHEF_AGENCE': '/dashboard',
      'RESPONSABLE_COPEC': '/dashboard',
      'DG': '/dashboard',
      'RH': '/dashboard',
      'COMPTABLE': '/dashboard',
      'ADMIN': '/admin',
      'DIRECTEUR_FINANCES': '/dashboard',
      'CHAUFFEUR': '/missions'
    };

    const targetRoute = routeMap[role] || '/dashboard';
    console.log(`Tentative de redirection vers ${targetRoute} pour le rôle ${role}`);
    
    // Utiliser une navigation avec remplacement pour éviter les boucles
    this.router.navigateByUrl(targetRoute, { replaceUrl: true })
      .then(success => {
        if (!success) {
          console.warn('La navigation a échoué, rechargement de la page...');
          window.location.href = targetRoute;
        } else {
          console.log('Redirection réussie vers', targetRoute);
        }
      })
      .catch(err => {
        console.error('Erreur lors de la redirection:', err);
        window.location.href = targetRoute;
      });
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
      next: (response: any) => {
        console.log('Réponse de connexion reçue:', response);
        this.loading = false;
        
        // Attendre un court instant pour s'assurer que l'état est mis à jour
        setTimeout(() => {
          // Vérifier si l'utilisateur est bien connecté
          if (this.authService.isLoggedIn()) {
            console.log('Utilisateur connecté avec succès, redirection...');
            this.redirectBasedOnRole(response.user.role);
          } else {
            console.error('Échec de la connexion: isLoggedIn() retourne false');
            this.errorMessage = 'Erreur lors de la connexion. Veuillez réessayer.';
          }
        }, 250);
      },
      error: (error: any) => {
        console.error('Erreur lors de la connexion:', error);
        this.loading = false;
        this.handleLoginError(error);
      }
    });
  }

  /**
   * Gère les erreurs de connexion
   */
  private handleLoginError(error: any): void {
    console.error('Erreur de connexion:', error);
    
    if (error.status === 401) {
      this.errorMessage = 'Identifiant ou mot de passe incorrect';
    } else if (error.status === 403) {
      this.errorMessage = 'Accès refusé. Votre compte peut être désactivé.';
    } else if (error.status === 0) {
      this.errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
    } else if (error.status >= 500) {
      this.errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
    } else {
      this.errorMessage = error.error?.message || 'Une erreur inattendue est survenue';
    }

    // Effacer le message après 5 secondes
    if (this.errorMessage) {
      setTimeout(() => {
        this.errorMessage = '';
      }, 5000);
    }
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

  /**
   * Bascule l'affichage du mot de passe
   */
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}