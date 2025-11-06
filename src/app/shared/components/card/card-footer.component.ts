import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-footer',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="app-card-footer"><ng-content></ng-content></div>`,
  styles: [`
    .app-card-footer { padding:.75rem 1.25rem; border-top:1px solid #e2e8f0; display:flex; gap:.5rem; justify-content:flex-end; }
  `]
})
export class CardFooterComponent {}
