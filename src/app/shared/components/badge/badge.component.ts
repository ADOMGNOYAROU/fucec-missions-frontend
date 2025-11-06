import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Usage:
 * <app-badge variant="EN_ATTENTE">À valider</app-badge>
 * <app-badge variant="VALIDEE">Validée</app-badge>
 * <app-badge variant="REJETEE">Rejetée</app-badge>
 */
@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-badge" [attr.data-status]="variant">
      <ng-content></ng-content>
    </span>
  `
})
export class BadgeComponent {
  @Input() variant: 'BROUILLON' | 'EN_ATTENTE' | 'VALIDEE' | 'IN_PROGRESS' | 'CLOTUREE' | 'REJETEE' = 'EN_ATTENTE';
}
