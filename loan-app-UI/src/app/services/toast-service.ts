import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class ToastService {

  constructor(private toastr: ToastrService) {}

  success(message: string, duration = 3000): void {
    this.toastr.success(message, '', { timeOut: duration });
  }

  error(message: string, duration = 3000): void {
    this.toastr.error(message, '', { timeOut: duration });
  }

  info(message: string, duration = 3000): void {
    this.toastr.info(message, '', { timeOut: duration });
  }

  warning(message: string, duration = 3000): void {
    this.toastr.warning(message, '', { timeOut: duration });
  }
}