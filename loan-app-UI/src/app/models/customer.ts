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

  dateOfBirth: Date ;
  address: string ;
  creditScore: number ;
  verifiedAt?: Date ;

  createdAt: Date;
  updatedAt?: Date ;

  firstName: string ;
  lastName: string ;
  gender: Gender;
  city: string;
  occupation: string;
  annualIncome: number;

  panNumber: string;
  aadhaarNumber: string ;
  documentType: DocumentType;
  documentPath: string ;
  verificationStatus: VerificationStatus;

  user?: User;
  loanApplications?: LoanApplication[];
  customerQueries?: CustomerQuery[];
}