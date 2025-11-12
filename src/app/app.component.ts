import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'fucec-missions-frontend';
  isLoggedIn = false;
  currentUser: any = null;
  autoLoginStatus = 'Vérification en cours...';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    console.log('🚀 AppComponent: Initialisation - vérification auto-connexion');

    // S'abonner à l'état d'authentification
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = this.authService.isLoggedIn();

      if (this.isLoggedIn) {
        this.autoLoginStatus = `✅ Connecté en tant que ${user?.first_name} ${user?.last_name} (${user?.role})`;
        console.log('✅ AppComponent: Utilisateur connecté automatiquement');
      } else {
        this.autoLoginStatus = '❌ Non connecté - Auto-connexion en cours ou échouée';
        console.log('❌ AppComponent: Aucun utilisateur connecté');
      }
    });

    // Vérifier après un délai si l'auto-connexion s'est déclenchée
    setTimeout(() => {
      if (!this.isLoggedIn) {
        this.autoLoginStatus = 'ℹ️ Auto-connexion gérée par AuthGuard au premier accès protégé';
        console.log('ℹ️ AppComponent: Auto-connexion sera déclenchée par AuthGuard');
      }
    }, 2000);
  }
}
