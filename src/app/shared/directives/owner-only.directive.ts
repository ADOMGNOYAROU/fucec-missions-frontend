import { Directive, Input, HostBinding } from '@angular/core';

@Directive({
  selector: '[appOwnerOnly]',
  standalone: true
})
export class OwnerOnlyDirective {
  @Input() createdById?: string | number;
  @Input() currentUserId?: string | number;
  @Input() mode: 'disable' | 'hide' = 'disable';

  @HostBinding('attr.disabled') get disabledAttr() {
    if (this.mode !== 'disable') return null;
    return this.isOwner ? null : '';
  }

  @HostBinding('style.pointer-events') get pointerEvents() {
    if (this.mode !== 'disable') return null;
    return this.isOwner ? null : 'none';
  }

  @HostBinding('style.opacity') get opacity() {
    if (this.mode !== 'disable') return null;
    return this.isOwner ? null : '0.6';
  }

  @HostBinding('style.display') get display() {
    if (this.mode !== 'hide') return null;
    return this.isOwner ? null : 'none';
  }

  private get isOwner(): boolean {
    if (this.createdById == null || this.currentUserId == null) return false;
    return String(this.createdById) === String(this.currentUserId);
  }
}
