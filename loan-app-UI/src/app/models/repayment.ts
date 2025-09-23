import { Loan } from "./loan";

export interface Repayment {
  repaymentId: number;
  loanId: number;
  amount: number;
  emiNumber: number;
  penaltyPaid: number;
  lateFee: number;
  paymentDate: Date;
  dueDate: Date;
  paymentMode: string;
  transactionId: string;
  paymentGatewayResponse?: string;
  paymentStatus?: PaymentStatus;
  createdAt: Date;
  updatedAt?: Date;
  loan?: Loan;
}

export enum PaymentStatus {
  Pending = 'Pending',
  Completed = 'Completed',
  Failed = 'Failed'
}