import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number; // ms
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private items$ = new BehaviorSubject<ToastItem[]>([]);
  toasts$ = this.items$.asObservable();

  show(message: string, variant: ToastVariant = 'info', duration = 3000) {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const toast: ToastItem = { id, message, variant, duration };
    const list = this.items$.value;
    this.items$.next([...list, toast]);
    setTimeout(() => this.dismiss(id), duration);
  }

  success(message: string, duration = 3000) { this.show(message, 'success', duration); }
  error(message: string, duration = 4000) { this.show(message, 'error', duration); }
  info(message: string, duration = 3000) { this.show(message, 'info', duration); }
  warning(message: string, duration = 3500) { this.show(message, 'warning', duration); }

  dismiss(id: string) {
    this.items$.next(this.items$.value.filter(t => t.id !== id));
  }

  clear() { this.items$.next([]); }
}
