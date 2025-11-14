import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-justificatif-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './justificatif-upload.component.html',
  styleUrls: ['./justificatif-upload.component.scss']
})
export class JustificatifUploadComponent {
  @Output() filesUploaded = new EventEmitter<FileList>();
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.filesUploaded.emit(input.files);
    }
  }
}
