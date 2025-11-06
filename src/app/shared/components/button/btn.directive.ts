import { Directive, HostBinding, Input, OnChanges } from '@angular/core';

/**
 * Usage:
 * <button appBtn variant="primary">Envoyer</button>
 * <a appBtn variant="outline" routerLink="/...">Lien</a>
 */
@Directive({
  selector: '[appBtn]',
  standalone: true
})
export class BtnDirective implements OnChanges {
  @Input() variant: 'primary' | 'secondary' | 'danger' | 'outline' = 'primary';
  @HostBinding('class') hostClass = 'btn btn-primary';

  ngOnChanges(): void {
    const base = 'btn';
    const variantClass = `btn-${this.variant}`;
    this.hostClass = `${base} ${variantClass}`;
  }
}
