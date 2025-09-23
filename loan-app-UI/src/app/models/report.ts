import { LoanAdmin } from "./loan-admin";

export interface Report{
  reportId: number;
  generatedBy: number;
  reportType: string;
  generatedDate: Date;
  parameters: string;
  filePath: string;
  createdAt: Date;
  updatedAt?: Date;
  loanAdmin?: LoanAdmin;

}