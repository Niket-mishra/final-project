import { Customer } from "./customer";
import { EmailNotification } from "./email-notification";
import { LoanAdmin } from "./loan-admin";
import { LoanOfficer } from "./loan-officer";

export interface User {
  userId: number;
  username: string;
  passwordHash: string;
  email: string;
  phoneNumber: string;
  role: Role;
  createdAt: Date;
  createdBy?: number;
  updatedAt?: Date;
  updatedBy?: number;
  isDeleted: boolean;
  deletedAt?: Date;
  customer?: Customer;
  loanOfficer?: LoanOfficer;
  loanAdmin?: LoanAdmin;
  emailNotifications?: EmailNotification[];
  reports?: Report[];
}

export enum Role {
  Admin = 'Admin',
  LoanOfficer = 'LoanOfficer',
  Customer = 'Customer'
}