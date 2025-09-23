import { Loan } from "./loan";

export interface NPA {
  npaId: number;
  loanId: number;
  daysOverdue: number;
  overdueAmount: number;
  npaDate: Date;
  npaStatus: NpaStatus;
  createdAt: Date;
  updatedAt?: Date;
  loan?: Loan;
}

export enum NpaStatus {
  Standard = 'Standard',
  Substandard = 'Substandard',
  Doubtful = 'Doubtful',
  Loss = 'Loss'
}