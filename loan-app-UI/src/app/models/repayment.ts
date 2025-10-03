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
  paymentStatus: 'Pending' | 'Completed' | 'Failed';
  createdAt: Date;
  updatedAt?: Date;
}
