import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-acces-refuse',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="acces-refuse">
      <h1>Accès Refusé</h1>
      <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
      <a routerLink="/dashboard">Retour au tableau de bord</a>
    </div>
  `,
  styles: [`
    .acces-refuse {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
      padding: 2rem;
    }
    h1 { font-size: 3rem; color: #ef4444; margin-bottom: 1rem; }
    a { margin-top: 2rem; padding: 0.75rem 1.5rem; background: #2563eb; color: white; text-decoration: none; border-radius: 0.5rem; }
  `]
})
export class AccesRefuseComponent {}
