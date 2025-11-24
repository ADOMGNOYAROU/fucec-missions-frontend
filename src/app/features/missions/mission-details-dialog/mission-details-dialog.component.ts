import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

export interface MissionDetailsDialogData {
  mission: any;
}

@Component({
  selector: 'app-mission-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  template: `
    <h2 mat-dialog-title>Détails de la mission</h2>
    
    <mat-dialog-content>
      <form [formGroup]="detailsForm" (ngSubmit)="onSubmit()">
        <div class="grid grid-cols-2 gap-4">
          <mat-form-field>
            <mat-label>Titre</mat-label>
            <input matInput [value]="data.mission.title" readonly>
          </mat-form-field>
          
          <mat-form-field>
            <mat-label>Date</mat-label>
            <input matInput [value]="(data.mission.date | date:'mediumDate')" readonly>
          </mat-form-field>
          
          <mat-form-field>
            <mat-label>Lieu</mat-label>
            <input matInput [value]="data.mission.location" readonly>
          </mat-form-field>
          
          <mat-form-field>
            <mat-label>Statut</mat-label>
            <input matInput [value]="getStatusLabel(data.mission.status)" readonly>
          </mat-form-field>
        </div>
        
        <mat-form-field class="w-full mt-4">
          <mat-label>Commentaire (optionnel)</mat-label>
          <textarea matInput formControlName="comment" rows="3"></textarea>
        </mat-form-field>
        
        <div class="flex justify-end gap-2 mt-4">
          <button type="button" mat-button (click)="onCancel()">Annuler</button>
          <button type="submit" mat-raised-button color="primary" [disabled]="!detailsForm.valid">
            Soumettre au N+1
          </button>
        </div>
      </form>
    </mat-dialog-content>
  `
})
export class MissionDetailsDialogComponent {
  detailsForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<MissionDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MissionDetailsDialogData,
    private fb: FormBuilder
  ) {
    this.detailsForm = this.fb.group({
      comment: ['', Validators.maxLength(500)]
    });
  }

  getStatusLabel(status: string): string {
    const statusMap: {[key: string]: string} = {
      'draft': 'Brouillon',
      'submitted': 'Soumis',
      'validated': 'Validé',
      'rejected': 'Rejeté',
      'completed': 'Terminé'
    };
    return statusMap[status] || status;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.detailsForm.valid) {
      const result = {
        ...this.data.mission,
        comment: this.detailsForm.value.comment,
        submittedToManager: true
      };
      this.dialogRef.close(result);
    }
  }
}
