import { Routes } from '@angular/router';
import { ListJustificatifsComponent } from './list-justificatifs/list-justificatifs.component';
import { UploadJustificatifsComponent } from './upload-justificatifs/upload-justificatifs.component';
import { DetailsJustificatifComponent } from './details-justificatif/details-justificatif.component';

export const JUSTIFICATIFS_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: ListJustificatifsComponent,
    title: 'Justificatifs'
  },
  {
    path: ':id',
    component: DetailsJustificatifComponent,
    title: 'Détails justificatif'
  },
  {
    path: 'upload',
    component: UploadJustificatifsComponent,
    title: 'Uploader des justificatifs'
  }
];
