import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="app-card">
      <ng-content select="app-card-header, [cardHeader]"></ng-content>
      <ng-content select="app-card-body, [cardBody]"></ng-content>
      <ng-content select="app-card-footer, [cardFooter]"></ng-content>
    </div>
  `,
  styles: [`
    .app-card { background:#fff; border:1px solid #e2e8f0; border-radius:.75rem; box-shadow:0 1px 2px rgba(0,0,0,.05); overflow:hidden; }
  `]
})
export class CardComponent {}
