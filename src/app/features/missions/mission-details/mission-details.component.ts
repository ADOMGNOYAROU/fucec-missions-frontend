import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OwnerOnlyDirective } from '../../../shared/directives/owner-only.directive';
import { AuthService } from '../../../core/services/auth.service';
import { IntervenantsComponent } from '../intervenants/intervenants.component';
import { ActivatedRoute } from '@angular/router';
import { MissionService } from '../services/mission.service';

@Component({
  selector: 'app-mission-details',
  standalone: true,
  imports: [CommonModule, RouterModule, OwnerOnlyDirective, IntervenantsComponent],
  templateUrl: './mission-details.component.html',
  styleUrls: ['./mission-details.component.scss']
})
export class MissionDetailsComponent {
  missionId: string | number | undefined = undefined;
  currentUserId: string | number | undefined = undefined;
  missionCreatedById: string | number | undefined = undefined;
  mission: any;

  constructor(
    private auth: AuthService,
    private route: ActivatedRoute,
    private missionService: MissionService
  ) {
    const u = this.auth.getCurrentUser();
    this.currentUserId = u?.id ?? undefined;

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.missionId = id;
      this.missionService.getOne(id).subscribe({
        next: (mission: any) => {
          // Suppose que l'API renvoie createdById
          this.missionCreatedById = mission?.createdById ?? undefined;
          this.mission = mission;
        },
        error: () => {
          this.missionCreatedById = undefined;
        }
      });
    }
  }
}
