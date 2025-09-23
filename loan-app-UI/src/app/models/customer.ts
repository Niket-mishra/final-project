import { User } from './user';
import { LoanApplication } from './loan-application';
import { CustomerQuery } from './customer-query';

export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other'
}

export enum DocumentType {
  Pan = 'Pan',
  Aadhaar = 'Aadhaar',
  Passport = 'Passport',
  DrivingLicense = 'DrivingLicense'
}

export enum VerificationStatus {
  Pending = 'Pending',
  Verified = 'Verified',
  Rejected = 'Rejected'
}

export interface Customer {
  customerId: number;
  userId: number;

  dateOfBirth: Date | null;
  address: string | null;
  creditScore: number | null;
  verifiedAt?: Date | null;

  createdAt: Date;
  updatedAt?: Date | null;

  firstName: string | null;
  lastName: string | null;
  gender: Gender | null;
  city: string | null;
  occupation: string | null;
  annualIncome: number | null;

  panNumber: string | null;
  aadhaarNumber: string | null;
  documentType: DocumentType | null;
  documentPath: string | null;
  verificationStatus: VerificationStatus | null;

  user?: User;
  loanApplications?: LoanApplication[];
  customerQueries?: CustomerQuery[];
}