import { CustomerQuery } from "./customer-query";
import { LoanAdmin } from "./loan-admin";
import { LoanApplication } from "./loan-application";
import { User } from "./user";
import { LoanDocument } from "./loan-document";

export interface LoanOfficer {
  officerId: number;
  userId: number;
  city: string;
  designation: string;
  maxLoansAssigned: number;
  currentWorkload: number;
  specialization: string;
  performanceRating?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  user: User;
  loanAdmin?: LoanAdmin;
  assignedLoanApplications?: LoanApplication[];
  verifiedLoanDocuments?: LoanDocument[];
  handledCustomerQueries?: CustomerQuery[];
}