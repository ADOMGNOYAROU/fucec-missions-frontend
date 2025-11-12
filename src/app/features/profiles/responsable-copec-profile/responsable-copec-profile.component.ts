import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-responsable-copec-profile',
  standalone: true,
  imports: [CommonModule],
  template: '<div class="profile"><h2>Responsable COPEC</h2><p>Espace Responsable COPEC</p></div>',
  styles: ['.profile { padding: 20px; }']
})
export class ResponsableCopecProfileComponent { }
