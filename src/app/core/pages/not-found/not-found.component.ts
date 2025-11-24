import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatCardModule],
  template: `
    <div class="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <mat-card class="p-8 text-center max-w-md w-full">
        <h1 class="text-4xl font-bold text-gray-800 mb-4">404</h1>
        <h2 class="text-2xl font-semibold text-gray-700 mb-4">Page non trouvée</h2>
        <p class="text-gray-600 mb-6">
          Désolé, la page que vous recherchez semble introuvable.
        </p>
        <button 
          mat-raised-button 
          color="primary" 
          routerLink="/dashboard"
          class="w-full sm:w-auto"
        >
          Retour au tableau de bord
        </button>
      </mat-card>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
  `]
})
export class NotFoundComponent {}
