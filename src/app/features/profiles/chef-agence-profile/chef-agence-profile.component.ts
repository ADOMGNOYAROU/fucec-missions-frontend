import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chef-agence-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chef-agence-profile">
      <h2>Profil Chef d'Agence</h2>
      <p>Espace de gestion pour les chefs d'agence.</p>
      <button class="btn btn-primary">Gérer mon équipe</button>
    </div>
  `,
  styles: [`
    .chef-agence-profile { padding: 20px; }
    .btn { margin-right: 10px; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; background-color: #007bff; color: white; }
  `]
})
export class ChefAgenceProfileComponent { }
