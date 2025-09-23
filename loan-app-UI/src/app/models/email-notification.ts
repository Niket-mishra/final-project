import { Loan } from "./loan";
import { User } from "./user";

export interface EmailNotification {
  notificationId: number;
  userId: number;
  loanId?: number;
  notificationType: NotificationType;
  subject: string;
  message: string;
  templateUsed: string;
  scheduledDate?: Date;
  isSent: boolean;
  sentAt?: Date;
  retryCount: number;
  createdAt: Date;
  updatedAt?: Date;
  user?: User;
  loan?: Loan;
}

export enum NotificationType {
  Reminder = 'Reminder',
  Approval = 'Approval',
  Rejection = 'Rejection',
  Overdue = 'Overdue',
  General = 'General'
}