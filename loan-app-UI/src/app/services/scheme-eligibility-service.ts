import { Injectable } from '@angular/core';
import { LoanScheme } from '../models/loan-scheme';

@Injectable({ providedIn: 'root' })
export class SchemeEligibilityService {
  isEligible(scheme: LoanScheme, income: number, creditScore: number): boolean {
    const meetsAmount = income >= scheme.minAmount;
    const meetsCredit = creditScore >= 650; // Example threshold
    return scheme.isActive && meetsAmount && meetsCredit;
  }

  filterEligibleSchemes(schemes: LoanScheme[], income: number, creditScore: number): LoanScheme[] {
    return schemes.filter(s => this.isEligible(s, income, creditScore));
  }

  getEligibilityMessage(scheme: LoanScheme): string {
    return scheme.eligibilityCriteria || 'Standard eligibility applies';
  }
}