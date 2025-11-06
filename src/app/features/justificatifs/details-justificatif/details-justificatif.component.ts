import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BtnDirective } from '../../../shared/components/button/btn.directive';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { CardHeaderComponent } from '../../../shared/components/card/card-header.component';
import { CardBodyComponent } from '../../../shared/components/card/card-body.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { JustificatifService } from '../services/justificatif.service';

@Component({
  selector: 'app-details-justificatif',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    BtnDirective,
    BadgeComponent,
    HeaderComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    ConfirmationDialogComponent
  ],
  templateUrl: './details-justificatif.component.html',
  styleUrls: ['./details-justificatif.component.scss']
})
export class DetailsJustificatifComponent {
  showDelete = false;
  loading = true;
  item: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private justificatifService: JustificatifService
  ) {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.justificatifService.getOne(id).subscribe({
      next: (data) => { this.item = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  onDelete() { this.showDelete = true; }
  onCancelDelete() { this.showDelete = false; }
  onConfirmDelete() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.justificatifService.delete(id).subscribe({
      next: () => { this.showDelete = false; this.router.navigate(['/justificatifs']); },
      error: () => { this.showDelete = false; }
    });
  }

  download() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.justificatifService.download(id).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = this.item?.nom || 'justificatif';
      a.click();
      URL.revokeObjectURL(url);
    });
  }
}
