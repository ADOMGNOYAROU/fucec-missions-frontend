import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-mission-validation-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mission-validation-dialog.component.html',
  styleUrls: ['./mission-validation-dialog.component.scss']
})
export class MissionValidationDialogComponent {
  @Input() isVisible = false;
  @Input() missionData: any = null;

  @Output() validate = new EventEmitter<string>();
  @Output() reject = new EventEmitter<{ reason: string; comment?: string }>();
  @Output() cancel = new EventEmitter<void>();

  validationForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.validationForm = this.fb.group({
      reason: ['', [Validators.required, Validators.minLength(10)]],
      comment: ['']
    });
  }

  onValidate(): void {
    this.validate.emit('APPROVED');
    this.closeDialog();
  }

  onReject(): void {
    if (this.validationForm.valid) {
      const { reason, comment } = this.validationForm.value;
      this.reject.emit({ reason, comment });
      this.closeDialog();
    } else {
      this.validationForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.cancel.emit();
    this.closeDialog();
  }

  private closeDialog(): void {
    this.isVisible = false;
    this.validationForm.reset();
  }

  // Getters pour faciliter l'accès aux contrôles du formulaire
  get reason() { return this.validationForm.get('reason'); }
  get comment() { return this.validationForm.get('comment'); }
}
