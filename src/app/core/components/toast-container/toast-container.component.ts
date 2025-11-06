import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastItem } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.component.html',
  styleUrls: ['./toast-container.component.scss']
})
export class ToastContainerComponent {
  toasts$: any;
  constructor(private toastService: ToastService) {
    this.toasts$ = this.toastService.toasts$;
  }
  trackById = (_: number, t: ToastItem) => t.id;
}
