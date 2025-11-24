import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-reject-reason-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDividerModule,
    MatCardModule,
    FormsModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="reject-dialog">
      <div class="dialog-header">
        <h2 class="dialog-title">
          <mat-icon class="title-icon">cancel</mat-icon>
          Motif de rejet
        </h2>
        <p class="dialog-subtitle">Veuillez indiquer la raison du rejet de cette mission</p>
      </div>
      
      <mat-dialog-content>
        <div class="warning-card">
          <mat-icon class="warning-icon">warning_amber</mat-icon>
          <div>
            <h3 class="warning-title">Action irréversible</h3>
            <p class="warning-text">La mission sera marquée comme rejetée et ne pourra plus être modifiée.</p>
          </div>
        </div>
        
        <mat-form-field appearance="fill" class="reason-field">
          <mat-label>Raison du rejet</mat-label>
          <textarea
            matInput
            [formControl]="reasonControl"
            cdkTextareaAutosize
            cdkAutosizeMinRows="4"
            placeholder="Décrivez en détail la raison du rejet de cette mission...">
          </textarea>
          <mat-hint class="hint-text" [class.warn]="remainingChars < 50">
            {{ remainingChars }} caractères restants (minimum 10 requis)
          </mat-hint>
          <mat-error *ngIf="reasonControl.hasError('required')">
            <mat-icon>error_outline</mat-icon>
            La raison du rejet est obligatoire
          </mat-error>
          <mat-error *ngIf="reasonControl.hasError('minlength')">
            <mat-icon>error_outline</mat-icon>
            Veuillez fournir plus de détails (minimum 10 caractères)
          </mat-error>
        </mat-form-field>
      </mat-dialog-content>
      
      <div class="dialog-actions">
        <button 
          mat-button 
          (click)="onCancel()"
          class="cancel-btn">
          Annuler
        </button>
        <button
          mat-raised-button
          color="warn"
          [disabled]="reasonControl.invalid"
          (click)="onSubmit()"
          class="submit-btn">
          <mat-icon>block</mat-icon>
          Confirmer le rejet
        </button>
      </div>
    </div>
  `,
  styles: [`
    .reject-dialog {
      width: 480px;
      max-width: 95vw;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      background: white;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .dialog-header {
      padding: 20px 24px;
      background: linear-gradient(135deg, #ff5252, #d32f2f);
      color: white;
    }

    .dialog-title {
      display: flex;
      align-items: center;
      margin: 0 0 8px 0;
      font-size: 20px;
      font-weight: 600;
    }

    .title-icon {
      margin-right: 10px;
      color: white;
    }

    .dialog-subtitle {
      margin: 0;
      font-size: 14px;
      opacity: 0.9;
    }

    mat-dialog-content {
      padding: 24px !important;
      margin: 0;
    }

    .warning-card {
      display: flex;
      align-items: flex-start;
      background: #FFF8E1;
      border-left: 4px solid #FFC107;
      padding: 16px;
      border-radius: 6px;
      margin-bottom: 20px;
    }

    .warning-icon {
      color: #FFA000;
      margin-right: 12px;
      margin-top: 2px;
    }

    .warning-title {
      margin: 0 0 4px 0;
      font-size: 15px;
      font-weight: 600;
      color: #5D4037;
    }

    .warning-text {
      margin: 0;
      font-size: 13px;
      color: #8D6E63;
      line-height: 1.4;
    }

    .reason-field {
      width: 100%;
      margin-top: 16px;
    }

    .mat-form-field-appearance-fill .mat-form-field-flex {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 0 12px !important;
      border: 1px solid #e0e0e0;
      transition: all 0.3s ease;
    }

    .mat-form-field-appearance-fill .mat-form-field-flex:hover {
      background-color: #f1f3f5;
      border-color: #bdbdbd;
    }

    .mat-focused .mat-form-field-flex {
      background-color: white !important;
      border-color: #3f51b5 !important;
      box-shadow: 0 0 0 2px rgba(63, 81, 181, 0.1);
    }

    textarea.mat-input-element {
      min-height: 100px;
      padding: 12px 0;
      line-height: 1.5;
      color: #333;
      font-size: 14px;
      resize: vertical;
    }

    .hint-text {
      font-size: 0.75rem;
      color: #666;
      display: flex;
      justify-content: space-between;
      
      &.warn {
        color: #f57c00;
        font-weight: 500;
      }
    }

    .mat-error {
      display: flex;
      align-items: center;
      font-size: 12px;
      color: #d32f2f;
      margin-top: 6px;
    }

    .mat-error mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      margin-right: 6px;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      padding: 16px 24px;
      background: #f8f9fa;
      border-top: 1px solid #e9ecef;
    }

    .cancel-btn {
      margin-right: 12px;
      padding: 8px 20px;
      border-radius: 6px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      transition: all 0.2s ease;
    }

    .cancel-btn:hover {
      background: rgba(0, 0, 0, 0.04);
    }

    .submit-btn {
      padding: 8px 20px;
      border-radius: 6px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      transition: all 0.2s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .submit-btn:not([disabled]):hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .submit-btn mat-icon {
      margin-right: 6px;
      font-size: 18px;
      height: 18px;
      width: 18px;
    }

    @media (max-width: 600px) {
      .reject-dialog {
        width: 95vw;
      }

      mat-dialog-content {
        padding: 16px !important;
      }

      .dialog-actions {
        padding: 12px 16px;
      }
    }
  `]
})
export class RejectReasonDialogComponent {
  reasonControl = new FormControl('', [
    Validators.required,
    Validators.minLength(10)
  ]);
  
  maxLength = 500;
  
  get remainingChars(): number {
    return this.maxLength - (this.reasonControl.value?.length || 0);
  }

  constructor(
    public dialogRef: MatDialogRef<RejectReasonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { missionId: string | number }
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.reasonControl.valid) {
      this.dialogRef.close({ reason: this.reasonControl.value });
    }
  }
}
