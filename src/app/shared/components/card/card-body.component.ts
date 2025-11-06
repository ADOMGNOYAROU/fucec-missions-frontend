import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-body',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="app-card-body"><ng-content></ng-content></div>`,
  styles: [`
    .app-card-body { padding:1rem 1.25rem; }
  `]
})
export class CardBodyComponent {}
