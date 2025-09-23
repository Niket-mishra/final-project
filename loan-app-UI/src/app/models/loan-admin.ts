import { LoanOfficer } from "./loan-officer";
import { LoanScheme } from "./loan-scheme";
import { User } from "./user";

export interface LoanAdmin {
  adminId: number;
  userId: number;
  adminLevel: string;
  appointedDate?: Date;
  createdAt: Date;
  updatedAt?: Date;
  user?: User;
  loanSchemes?: LoanScheme[];
  loanOfficers?: LoanOfficer[];
  reports?: Report[];
}