import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BtnDirective } from '../../../shared/components/button/btn.directive';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { MissionService } from '../services/mission.service';

interface Mission {
  id: number;
  title: string;
  status: string;
  date: string;
  location: string;
}

@Component({
  selector: 'app-mission-list',
  standalone: true,
  imports: [CommonModule, RouterModule, BtnDirective, LoaderComponent, BadgeComponent],
  templateUrl: './mission-list.component.html',
  styleUrls: ['./mission-list.component.scss']
})
export class MissionListComponent implements OnInit {
  loading = true;
  missions: Mission[] = [];
  
  constructor(private missionService: MissionService) {}

  ngOnInit(): void {
    this.loadMissions();
  }

  loadMissions(): void {
    this.loading = true;
    this.missionService.list().subscribe({
      next: (response: any) => {
        this.missions = response?.data || [];
        this.loading = false;
      },
      error: () => {
        this.missions = [];
        this.loading = false;
      }
    });
  }

  getStatusClass(status: string): 'BROUILLON' | 'EN_ATTENTE' | 'VALIDEE' | 'IN_PROGRESS' | 'CLOTUREE' | 'REJETEE' {
    switch(status) {
      case 'EN_ATTENTE': return 'EN_ATTENTE';
      case 'VALIDEE': return 'VALIDEE';
      case 'REJETEE': return 'REJETEE';
      case 'EN_COURS': return 'IN_PROGRESS';
      default: return 'BROUILLON';
    }
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'EN_ATTENTE': 'En attente',
      'VALIDEE': 'Validée',
      'REJETEE': 'Rejetée',
      'EN_COURS': 'En cours'
    };
    return labels[status] || status;
  }
}
