import { LoanAdmin } from "./loan-admin";
import { LoanApplication } from "./loan-application";

export interface LoanScheme {
  schemeId: number;
  schemeName: string;
  interestRate: number;
  maxAmount: number;
  minAmount: number;
  tenureMonths: number;
  eligibilityCriteria: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  createdBy: number;
  loanAdmin?: LoanAdmin;
  loanApplications?: LoanApplication[];
}