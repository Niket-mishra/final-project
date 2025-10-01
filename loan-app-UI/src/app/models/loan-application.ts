import { Customer } from "./customer";
import { Loan } from "./loan";
import { LoanOfficer } from "./loan-officer";
import { LoanScheme } from "./loan-scheme";
import { LoanDocument } from "./loan-document";

export interface LoanApplication {
  approvedAmount: number;
  applicationId: number;
  customerId: number;
  schemeId: number;
  officerId?: number;
  requestedAmount: number;
  purposeOfLoan: string;
  employmentDetails: string;
  submittedDocuments: string;
  status: ApplicationStatus;
  applicationDate: Date;
  officerAssignedDate?: Date;
  approvalDate?: Date;
  rejectionReason?: string;
  remarks?: string;
  createdAt: Date;
  updatedAt?: Date;
  customer?: Customer;
  loanScheme?: LoanScheme;
  loanOfficer?: LoanOfficer;
  loan?: Loan;
  loanDocuments?: LoanDocument[];
}

export enum ApplicationStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Disbursed = 'Disbursed'
}


