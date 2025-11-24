import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface MissionSubmitDialogData {
  mission: any;
}

@Component({
  selector: 'app-mission-submit-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Valider la mission</h2>
    
    <mat-dialog-content>
      <p>Voulez-vous soumettre cette mission pour validation ?</p>
      
      <div class="mt-4 p-4 bg-gray-50 rounded">
        <p class="font-medium">{{ data.mission.title }}</p>
        <p class="text-sm text-gray-500">
          {{ data.mission.date | date:'dd/MM/yyyy' }} • {{ data.mission.location }}
        </p>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="p-4 border-t border-gray-200">
      <button mat-button (click)="onCancel()">Annuler</button>
      <button mat-button color="warn" (click)="onReject()" class="mr-2">Rejeter</button>
      <button mat-raised-button color="primary" (click)="onSubmit()">Soumettre</button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      max-width: 500px;
    }
  `]
})
export class MissionSubmitDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<MissionSubmitDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MissionSubmitDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close({ action: 'cancel' });
  }

  onReject(): void {
    this.dialogRef.close({ 
      action: 'reject',
      mission: this.data.mission
    });
  }

  onSubmit(): void {
    this.dialogRef.close({ 
      action: 'submit',
      mission: this.data.mission
    });
  }
}
