import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

export interface MissionDialogData {
  mission: {
    id: string;
    title: string;
    date: string | Date;
    vehicleType: string;
    status: string;
    location?: string;
  };
}

@Component({
  selector: 'app-mission-validation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <div class="mission-dialog">
      <h2 mat-dialog-title class="flex items-center">
        <mat-icon class="mr-2" [ngStyle]="{'color': '#1a237e'}">assignment</mat-icon>
        Valider la mission
      </h2>
      
      <mat-dialog-content>
        <p class="mb-4 text-gray-700">Voulez-vous soumettre cette mission pour validation ?</p>
        
        <mat-card class="mb-4 shadow-sm border border-gray-100">
          <mat-card-content>
            <h3 class="font-medium text-lg mb-3 text-gray-900 flex items-center">
              <mat-icon class="mr-2 text-blue-700" [inline]="true">directions_car</mat-icon>
              {{ data.mission.title }}
            </h3>
            
            <div class="grid grid-cols-2 gap-4 mb-3">
              <div class="p-3 bg-gray-50 rounded">
                <div class="text-sm text-gray-500 mb-1">Date</div>
                <div class="font-medium">{{ data.mission.date | date:'dd/MM/yyyy' }}</div>
              </div>
              <div class="p-3 bg-gray-50 rounded">
                <div class="text-sm text-gray-500 mb-1">Véhicule</div>
                <div class="font-medium">{{ data.mission.vehicleType || 'Non spécifié' }}</div>
              </div>
              <div class="p-3 bg-gray-50 rounded">
                <div class="text-sm text-gray-500 mb-1">Statut</div>
                <div class="font-medium">{{ getStatusLabel(data.mission.status) }}</div>
              </div>
              <div class="p-3 bg-gray-50 rounded" *ngIf="data.mission.location">
                <div class="text-sm text-gray-500 mb-1">Lieu</div>
                <div class="font-medium">{{ data.mission.location }}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <div class="flex items-start p-4 bg-blue-50 rounded-lg">
          <mat-icon class="text-blue-500 mr-2">info</mat-icon>
          <div class="text-sm text-gray-700">
            En soumettant cette mission, elle sera envoyée pour validation à votre supérieur hiérarchique.
          </div>
        </div>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end" class="p-4 border-t border-gray-200">
        <button mat-button color="warn" (click)="onReject()" class="mr-2">
          REJETER
        </button>
        <button mat-raised-button color="primary" (click)="onSubmit()" class="px-4">
          SOUMETTRE
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
    .mission-dialog {
      display: block;
      width: 100%;
      max-width: 550px;
      min-width: 300px;
    }
    
    .mat-dialog-actions {
      padding: 16px 24px;
      margin: 0;
      border-top: 1px solid #e0e0e0;
      background-color: #f9f9f9;
      border-radius: 0 0 8px 8px;
    }
    
    .mat-dialog-title {
      display: flex;
      align-items: center;
      margin: 0;
      padding: 16px 24px;
      font-size: 1.25rem;
      font-weight: 500;
      color: #1a237e;
      background-color: #f5f5f5;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .mat-dialog-content {
      padding: 20px 24px;
    }
  `]
})
export class MissionValidationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<MissionValidationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MissionDialogData
  ) {}

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

  onReject(): void {
    this.dialogRef.close({ action: 'reject' });
  }

  onSubmit(): void {
    this.dialogRef.close({ action: 'submit' });
  }
}
