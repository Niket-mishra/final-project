import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfficerService } from '../../services/officer-service';
import { Auth } from '../../services/auth';
import { EmailNotification, NotificationType } from '../../models/email-notification';

@Component({
  selector: 'app-officer-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './officer-notifications.html',
  styleUrl: './officer-notifications.css'
})
export class OfficerEmailNotifications implements OnInit {
  isLoading = true;
  errorMessage = '';
  notifications: EmailNotification[] = [];

  constructor(private officerService: OfficerService, private auth: Auth) {}

  ngOnInit(): void {
    const officerId = this.auth.getUserId();
    if (typeof officerId !== 'number') {
      this.handleError('Officer ID not found.');
      return;
    }

    this.officerService.getEmailNotifications(officerId).subscribe({
      next: (data: EmailNotification[]) => {
        this.notifications = data;
        this.isLoading = false;
      },
      error: () => this.handleError('Failed to load email notifications.')
    });
  }

  private handleError(message: string): void {
    this.errorMessage = message;
    this.isLoading = false;
  }

  getBadgeType(type: NotificationType): string {
    switch (type) {
      case NotificationType.Reminder: return 'info';
      case NotificationType.Approval: return 'success';
      case NotificationType.Rejection: return 'danger';
      case NotificationType.Overdue: return 'warning';
      default: return 'secondary';
    }
  }
}