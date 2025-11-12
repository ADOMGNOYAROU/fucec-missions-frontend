import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-agent-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="agent-profile">
      <h2>Profil Agent</h2>
      <p>Bienvenue dans votre espace agent. Ici vous pouvez gérer vos missions et justificatifs.</p>

      <div class="profile-actions">
        <button class="btn btn-primary">Voir mes missions</button>
        <button class="btn btn-secondary">Soumettre un justificatif</button>
      </div>
    </div>
  `,
  styles: [`
    .agent-profile {
      padding: 20px;
    }
    .profile-actions {
      margin-top: 20px;
    }
    .btn {
      margin-right: 10px;
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-primary {
      background-color: #007bff;
      color: white;
    }
    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }
  `]
})
export class AgentProfileComponent {

}
