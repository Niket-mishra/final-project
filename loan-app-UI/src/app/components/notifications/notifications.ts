import { Component, inject } from '@angular/core';
import { EmailNotification } from '../../models/email-notification';
import { ToastService } from '../../services/toast-service';
import { NotificationService } from '../../services/notification-service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-notifications',
  imports: [DatePipe],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css'
})
export class Notifications {
  notifications: EmailNotification[] = [];
  isLoading = true;

  private emailService = inject(NotificationService);
  private toast = inject(ToastService);

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.emailService.getAllNotifications().subscribe({
      next: (res) => {
        this.notifications = res;
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Failed to load notifications');
        this.isLoading = false;
      }
    });
  }
  triggerNotification(id: number): void {
    this.emailService.sendNotificationByUser(id).subscribe({
      next: () => this.toast.success('Notification sent'),
      error: () => this.toast.error('Failed to send notification')
    });
  }
}
