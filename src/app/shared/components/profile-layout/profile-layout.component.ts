import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile-layout',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="profile-layout">
      <header class="profile-header">
        <h1>Mon Profil</h1>
      </header>
      <main class="profile-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .profile-layout {
      min-height: 100vh;
      background-color: #f8f9fa;
    }
    .profile-header {
      background: white;
      padding: 1rem 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .profile-header h1 {
      margin: 0;
      color: #333;
    }
    .profile-content {
      padding: 2rem;
    }
  `]
})
export class ProfileLayoutComponent {

}
