import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-header',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="app-card-header"><ng-content></ng-content></div>`,
  styles: [`
    .app-card-header { padding:.875rem 1.25rem; border-bottom:1px solid #e2e8f0; }
  `]
})
export class CardHeaderComponent {}
