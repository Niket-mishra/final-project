import { LoanAdmin } from "./loan-admin";
import { LoanApplication } from "./loan-application";

export interface LoanScheme {
  maxTenure: number;
  minTenure: number;
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