import { Customer } from "./customer";
import { LoanOfficer } from "./loan-officer";

export interface CustomerQuery {
  respondedAt: Date;
  priority: Priority;
  queryId: number;
  customerId: number;
  officerId?: number;
  querySubject: string;
  queryDescription: string;
  queryStatus: QueryStatus;
  createdAt: Date;
  resolvedAt?: Date;
  officerResponse: string;
  updatedAt?: Date;
  customer?: Customer;
  loanOfficer?: LoanOfficer;
}

export enum QueryStatus {
  Open = 'Open',
  InProgress = 'InProgress',
  Resolved = 'Resolved',
  Closed = 'Closed'
}
export enum Priority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High'
}