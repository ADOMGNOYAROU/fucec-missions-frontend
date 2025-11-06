import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Input, Output, EventEmitter } from '@angular/core';
import { BtnDirective } from '../../components/button/btn.directive';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, BtnDirective],
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent {
  @Input() title = 'Confirmation';
  @Input() message = 'Êtes-vous sûr de continuer ?';
  @Input() confirmText = 'Confirmer';
  @Input() cancelText = 'Annuler';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm = () => this.confirm.emit();
  onCancel = () => this.cancel.emit();
}
