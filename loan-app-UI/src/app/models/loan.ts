import { EmailNotification } from "./email-notification";
import { LoanApplication } from "./loan-application";
import { NPA } from "./npa";
import { Repayment } from "./repayment";

export interface Loan {
  loanId: number;
  applicationId: number;
  sanctionedAmount: number;
  remainingAmount: number;
  emiAmount: number;
  totalEmiCount: number;
  paidEmiCount: number;
  interestRateApplied: number;
  penaltyAmount: number;
  loanStartDate?: Date;
  loanEndDate?: Date;
  disbursementDate?: Date;
  nextDueDate?: Date;
  loanStatus: LoanStatus;
  createdAt: Date;
  updatedAt?: Date;
  loanApplication?: LoanApplication;
  repayments?: Repayment[];
  npa?: NPA;
  emailNotifications?: EmailNotification[];
}

export enum LoanStatus {
  Active = 'Active',
  Completed = 'Completed',
  NPA = 'NPA',
  Closed = 'Closed'
}