import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-profile">
      <h2>Profil Administrateur</h2>
      <p>Panneau d'administration du système.</p>
      <button class="btn btn-primary">Gérer les utilisateurs</button>
    </div>
  `,
  styles: [`
    .admin-profile { padding: 20px; }
    .btn { margin-right: 10px; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; background-color: #007bff; color: white; }
  `]
})
export class AdminProfileComponent { }
