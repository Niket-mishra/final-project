import { LoanApplication } from "./loan-application";
import { LoanOfficer } from "./loan-officer";

export interface LoanDocument {
  documentId: number;
  applicationId: number;
  verifiedBy?: number;
  documentType: string;
  filePath: string;
  fileName: string;
  uploadedAt: Date;
  verificationStatus: DocumentStatus;
  verificationDate?: Date;
  verificationRemarks: string;
  createdAt: Date;
  updatedAt?: Date;
  loanApplication?: LoanApplication;
  verifiedByOfficer?: LoanOfficer;
}

export enum DocumentStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected'
}
